import * as THREE from 'three';
import Delaunator from 'delaunator';
import {
  COLS, ROWS, JITTER, OVERSCAN, OVERSCAN_FAR,
  SCATTER_COUNT, CLUSTER_COUNT, MAX_EDGE_LENGTH,
  MESH_WIDTH, MESH_DEPTH, HEIGHTMAP_RESOLUTION,
  CAMERA_FOV, CAMERA_HEIGHT, CAMERA_Z, CAMERA_LOOK_AT_Z,
  TRI_ALPHA, EDGE_ALPHA, POINT_ALPHA, POINT_SIZE,
  VERT_SRC, POINT_VERT_SRC, FRAG_SRC,
  EDGE_VERT_SRC, EDGE_FRAG_SRC,
  HEIGHT_VERT_SRC, HEIGHT_FRAG_SRC,
  NAV_NODES, HUB_NODE_INDEX,
} from './meshConfig';
import { buildMeshGraph, edgeKey, type MeshGraph } from './meshGraph';
import { placeNavNodes, projectNavNodes, type PlacedNavNode, type NavProjection } from './navNodes';
import { findPath, pathToEdgeKeys } from './pathfinding';

/** Threshold in screen pixels for cursor-to-node hover detection. */
const HOVER_DISTANCE_PX = 150;

/**
 * Pure Three.js scene — no React dependency.
 * Creates the animated wireframe ocean mesh, owns the render loop.
 */
export class MeshScene {
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;

  private triMesh: THREE.Mesh | null = null;
  private edgeLines: THREE.LineSegments | null = null;
  private pointCloud: THREE.Points | null = null;

  private triMat: THREE.ShaderMaterial;
  private edgeMat: THREE.ShaderMaterial;
  private pointMat: THREE.ShaderMaterial;

  private graph: MeshGraph | null = null;
  private placedNavNodes: PlacedNavNode[] = [];
  private frameCallback: ((projections: NavProjection[], time: number) => void) | null = null;
  private canvasWidth = 0;
  private canvasHeight = 0;
  private clock = new THREE.Clock();

  // Phase 2: path highlight infrastructure
  private edgeKeyToIndex = new Map<number, number>();
  private highlightAttr: THREE.BufferAttribute | null = null;
  private navPaths = new Map<number, number[]>(); // vertexIndex -> path from hub

  // Phase 3: cursor interaction
  private mouseScreenX = 0;
  private mouseScreenY = 0;
  private mouseActive = false;
  private hoveredNode: PlacedNavNode | null = null;
  private isNavNodeAttr: THREE.BufferAttribute | null = null;

  // Reusable buffers for reading nav node heights from GPU height map
  private _navPixelBuf = new Float32Array(4);

  // Phase 4: displacement texture
  private heightTarget: THREE.WebGLRenderTarget;
  private heightScene: THREE.Scene;
  private heightCamera: THREE.OrthographicCamera;
  private heightMat: THREE.ShaderMaterial;
  private mapMin = new THREE.Vector2();
  private mapSize = new THREE.Vector2(1, 1);
  private frameCount = 0;
  private lastFpsTime = 0;

  constructor(canvas: HTMLCanvasElement) {
    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true,
    });
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Camera
    this.camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 1, 10000);
    this.camera.position.set(0, CAMERA_HEIGHT, CAMERA_Z);
    this.camera.lookAt(0, 0, CAMERA_LOOK_AT_Z);

    // Scene
    this.scene = new THREE.Scene();

    // Height field render target (displacement texture)
    this.heightTarget = new THREE.WebGLRenderTarget(
      HEIGHTMAP_RESOLUTION, HEIGHTMAP_RESOLUTION, {
        type: THREE.FloatType,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
      },
    );

    // Height field scene (fullscreen quad)
    this.heightCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 2);
    this.heightCamera.position.z = 1;
    this.heightScene = new THREE.Scene();

    // Shared shader uniforms (each material gets its own alpha range)
    const sharedUniforms = {
      uTime: { value: 0 },
    };

    this.heightMat = new THREE.ShaderMaterial({
      vertexShader: HEIGHT_VERT_SRC,
      fragmentShader: HEIGHT_FRAG_SRC,
      uniforms: {
        uTime: sharedUniforms.uTime,
        uMapMin: { value: this.mapMin },
        uMapSize: { value: this.mapSize },
      },
      depthWrite: false,
      depthTest: false,
    });
    this.heightScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.heightMat));

    // Height map uniforms shared by all mesh materials
    const heightUniforms = {
      uHeightMap: { value: this.heightTarget.texture },
      uMapMin: { value: this.mapMin },
      uMapSize: { value: this.mapSize },
    };

    this.triMat = this.createMaterial(sharedUniforms, heightUniforms, TRI_ALPHA.min, TRI_ALPHA.range, 1.0, VERT_SRC);
    this.edgeMat = this.createMaterial(sharedUniforms, heightUniforms, EDGE_ALPHA.min, EDGE_ALPHA.range, 1.0, EDGE_VERT_SRC, EDGE_FRAG_SRC);
    this.pointMat = this.createMaterial(sharedUniforms, heightUniforms, POINT_ALPHA.min, POINT_ALPHA.range, POINT_SIZE, POINT_VERT_SRC);

    this.buildMesh();

    // Start render loop
    this.renderer.setAnimationLoop(() => this.animate());
  }

  private createMaterial(
    sharedUniforms: { uTime: { value: number } },
    heightUniforms: {
      uHeightMap: { value: THREE.Texture };
      uMapMin: { value: THREE.Vector2 };
      uMapSize: { value: THREE.Vector2 };
    },
    alphaMin: number,
    alphaRange: number,
    pointSize: number,
    vertexShader: string,
    fragmentShader: string = FRAG_SRC,
  ): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: sharedUniforms.uTime,
        uHeightMap: heightUniforms.uHeightMap,
        uMapMin: heightUniforms.uMapMin,
        uMapSize: heightUniforms.uMapSize,
        uAlphaMin: { value: alphaMin },
        uAlphaRange: { value: alphaRange },
        uPointSize: { value: pointSize },
      },
      transparent: true,
      depthWrite: false,
    });
  }

  private buildMesh(): void {
    const halfW = MESH_WIDTH / 2;
    const halfD = MESH_DEPTH / 2;
    const cellW = MESH_WIDTH / COLS;
    const cellD = MESH_DEPTH / ROWS;

    // --- Generate 2D points (XZ plane) ---
    const pts2d: number[] = []; // flat [x0, z0, x1, z1, ...]

    // Grid with jitter
    for (let row = -OVERSCAN_FAR; row <= ROWS + OVERSCAN; row++) {
      for (let col = -OVERSCAN; col <= COLS + OVERSCAN; col++) {
        pts2d.push(
          -halfW + (col + 0.5) * cellW + (Math.random() - 0.5) * cellW * JITTER,
          -halfD + (row + 0.5) * cellD + (Math.random() - 0.5) * cellD * JITTER,
        );
      }
    }

    // Cluster-based points
    const totalW = (COLS + OVERSCAN * 2) * cellW;
    const totalD = (ROWS + OVERSCAN_FAR + OVERSCAN) * cellD;
    const originX = -halfW - OVERSCAN * cellW;
    const originZ = -halfD - OVERSCAN_FAR * cellD;
    for (let c = 0; c < CLUSTER_COUNT; c++) {
      const cx = originX + Math.random() * totalW;
      const cz = originZ + Math.random() * totalD;
      const radius = 120 + Math.random() * 280;
      const count = 5 + Math.floor(Math.random() * 12);
      for (let j = 0; j < count; j++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * radius;
        pts2d.push(cx + Math.cos(angle) * r, cz + Math.sin(angle) * r);
      }
    }

    // Random scatter
    for (let i = 0; i < SCATTER_COUNT; i++) {
      pts2d.push(
        originX + Math.random() * totalW,
        originZ + Math.random() * totalD,
      );
    }

    const nPts = pts2d.length / 2;

    // --- Compute world-space bounds for displacement texture ---
    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    for (let i = 0; i < nPts; i++) {
      const x = pts2d[i * 2];
      const z = pts2d[i * 2 + 1];
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    }
    const padX = (maxX - minX) * 0.02;
    const padZ = (maxZ - minZ) * 0.02;
    this.mapMin.set(minX - padX, minZ - padZ);
    this.mapSize.set((maxX - minX) + 2 * padX, (maxZ - minZ) + 2 * padZ);

    // --- Delaunay triangulation ---
    const coordsForDelaunay: [number, number][] = [];
    for (let i = 0; i < nPts; i++) {
      coordsForDelaunay.push([pts2d[i * 2], pts2d[i * 2 + 1]]);
    }
    const d = Delaunator.from(coordsForDelaunay);
    const tri = d.triangles;

    // --- Build 3D position buffer (Y=0, displacement happens in shader) ---
    const positions = new Float32Array(nPts * 3);
    for (let i = 0; i < nPts; i++) {
      positions[i * 3] = pts2d[i * 2];      // X
      positions[i * 3 + 1] = 0;              // Y (displaced in shader)
      positions[i * 3 + 2] = pts2d[i * 2 + 1]; // Z
    }
    const posAttr = new THREE.BufferAttribute(positions, 3);

    // --- Build graph from Delaunay triangulation ---
    this.graph = buildMeshGraph(pts2d, new Uint32Array(tri), MAX_EDGE_LENGTH);

    // --- Triangle geometry (indexed, using filtered triangles) ---
    const triGeom = new THREE.BufferGeometry();
    triGeom.setAttribute('position', posAttr);
    triGeom.setIndex(new THREE.BufferAttribute(this.graph.triangles, 1));
    this.triMesh = new THREE.Mesh(triGeom, this.triMat);
    this.scene.add(this.triMesh);

    // --- Edge geometry (pairs of positions) + edge key map ---
    const edgeCount = this.graph.edges.length;
    const edgePositions = new Float32Array(edgeCount * 6); // 2 verts * 3 components
    this.edgeKeyToIndex = new Map();
    let ei = 0;
    for (let edgeIdx = 0; edgeIdx < edgeCount; edgeIdx++) {
      const [p, q] = this.graph.edges[edgeIdx];
      edgePositions[ei++] = positions[p * 3];
      edgePositions[ei++] = positions[p * 3 + 1];
      edgePositions[ei++] = positions[p * 3 + 2];
      edgePositions[ei++] = positions[q * 3];
      edgePositions[ei++] = positions[q * 3 + 1];
      edgePositions[ei++] = positions[q * 3 + 2];
      const key = edgeKey(p, q);
      this.edgeKeyToIndex.set(key, edgeIdx);
    }
    const edgeGeom = new THREE.BufferGeometry();
    edgeGeom.setAttribute('position', new THREE.BufferAttribute(edgePositions, 3));

    // aHighlight attribute: 2 vertices per edge, both share same value
    const highlightData = new Float32Array(edgeCount * 2);
    this.highlightAttr = new THREE.BufferAttribute(highlightData, 1);
    edgeGeom.setAttribute('aHighlight', this.highlightAttr);

    this.edgeLines = new THREE.LineSegments(edgeGeom, this.edgeMat);
    this.scene.add(this.edgeLines);

    // --- Point geometry (shared positions) ---
    const pointGeom = new THREE.BufferGeometry();
    pointGeom.setAttribute('position', posAttr);

    // --- Place nav nodes — only the hub is visually distinct by default ---
    this.placedNavNodes = placeNavNodes(this.graph, NAV_NODES);
    const isNavNode = new Float32Array(nPts);
    isNavNode[this.placedNavNodes[HUB_NODE_INDEX].vertexIndex] = 1.0;
    this.isNavNodeAttr = new THREE.BufferAttribute(isNavNode, 1);
    pointGeom.setAttribute('aIsNavNode', this.isNavNodeAttr);

    this.pointCloud = new THREE.Points(pointGeom, this.pointMat);
    this.scene.add(this.pointCloud);

    // --- Precompute paths from hub to each nav node ---
    const hubVertexIndex = this.placedNavNodes[HUB_NODE_INDEX].vertexIndex;
    this.navPaths = new Map();
    for (const node of this.placedNavNodes) {
      if (node.vertexIndex !== hubVertexIndex) {
        this.navPaths.set(
          node.vertexIndex,
          findPath(this.graph.adjacency, hubVertexIndex, node.vertexIndex),
        );
      }
    }
  }

  private animate(): void {
    const t = this.clock.getElapsedTime();

    // FPS counter (dev-only)
    if (import.meta.env.DEV) {
      this.frameCount++;
      if (t - this.lastFpsTime >= 2.0) {
        console.log(`FPS: ${(this.frameCount / (t - this.lastFpsTime)).toFixed(1)}`);
        this.frameCount = 0;
        this.lastFpsTime = t;
      }
    }

    // All materials (including heightMat) share the same uTime uniform object
    this.triMat.uniforms.uTime.value = t;

    // Pass 1: render height field to displacement texture
    this.renderer.setRenderTarget(this.heightTarget);
    this.renderer.render(this.heightScene, this.heightCamera);
    this.renderer.setRenderTarget(null);

    // Pass 2: render mesh (all 3 materials sample from displacement texture)
    // Read nav node heights from the GPU height map so labels track the actual mesh
    if (this.placedNavNodes.length > 0) {
      const navHeights = new Float32Array(this.placedNavNodes.length);
      for (let i = 0; i < this.placedNavNodes.length; i++) {
        const node = this.placedNavNodes[i];
        const u = (node.baseX - this.mapMin.x) / this.mapSize.x;
        const v = (node.baseZ - this.mapMin.y) / this.mapSize.y;
        const px = Math.min(Math.floor(u * HEIGHTMAP_RESOLUTION), HEIGHTMAP_RESOLUTION - 1);
        const py = Math.min(Math.floor(v * HEIGHTMAP_RESOLUTION), HEIGHTMAP_RESOLUTION - 1);
        this.renderer.readRenderTargetPixels(this.heightTarget, px, py, 1, 1, this._navPixelBuf);
        navHeights[i] = this._navPixelBuf[0];
      }

      const projections = projectNavNodes(
        this.placedNavNodes, navHeights, this.camera, this.canvasWidth, this.canvasHeight,
      );
      // Hover detection: find nearest nav node within screen-pixel threshold
      this.updateHover(projections);

      if (this.frameCallback) {
        this.frameCallback(projections, t);
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  /** Find the nearest nav node to the cursor within HOVER_DISTANCE_PX. */
  private updateHover(projections: NavProjection[]): void {
    if (!this.mouseActive) {
      if (this.hoveredNode) {
        this.hoveredNode = null;
        this.highlightPath(null);
      }
      return;
    }

    let nearest: PlacedNavNode | null = null;
    let nearestDistSq = HOVER_DISTANCE_PX * HOVER_DISTANCE_PX;

    for (const proj of projections) {
      const dx = this.mouseScreenX - proj.screenX;
      const dy = this.mouseScreenY - proj.screenY;
      const distSq = dx * dx + dy * dy;
      if (distSq < nearestDistSq) {
        nearestDistSq = distSq;
        nearest = proj.node;
      }
    }

    // Only update on hover state change
    if (nearest !== this.hoveredNode) {
      const hubVertexIndex = this.placedNavNodes[HUB_NODE_INDEX].vertexIndex;

      // Un-highlight previous (unless it's the hub, which is always visible)
      if (this.hoveredNode && this.hoveredNode.vertexIndex !== hubVertexIndex && this.isNavNodeAttr) {
        (this.isNavNodeAttr.array as Float32Array)[this.hoveredNode.vertexIndex] = 0.0;
        this.isNavNodeAttr.needsUpdate = true;
      }

      // Highlight new hovered node's dot
      if (nearest && nearest.vertexIndex !== hubVertexIndex && this.isNavNodeAttr) {
        (this.isNavNodeAttr.array as Float32Array)[nearest.vertexIndex] = 1.0;
        this.isNavNodeAttr.needsUpdate = true;
      }

      this.hoveredNode = nearest;
      this.highlightPath(nearest?.vertexIndex ?? null);
    }
  }

  /** Graph data structure built from the Delaunay triangulation. */
  getGraph(): MeshGraph | null {
    return this.graph;
  }

  /** Register a callback invoked each frame with projected nav node positions. */
  setFrameCallback(cb: (projections: NavProjection[], time: number) => void): void {
    this.frameCallback = cb;
  }

  /** The placed nav nodes (hub + others). */
  getPlacedNavNodes(): PlacedNavNode[] {
    return this.placedNavNodes;
  }

  /**
   * Highlight the shortest path from hub to a nav node, or clear all highlights.
   * Only runs on hover state change, not every frame.
   */
  highlightPath(targetVertexIndex: number | null): void {
    if (!this.highlightAttr) return;
    const data = this.highlightAttr.array as Float32Array;

    // Zero out entire buffer
    data.fill(0);

    if (targetVertexIndex !== null) {
      const path = this.navPaths.get(targetVertexIndex);
      if (path && path.length > 1) {
        const edgeKeys = pathToEdgeKeys(path);
        for (const key of edgeKeys) {
          const edgeIdx = this.edgeKeyToIndex.get(key);
          if (edgeIdx !== undefined) {
            // 2 vertices per edge, both get highlight = 1.0
            data[edgeIdx * 2] = 1.0;
            data[edgeIdx * 2 + 1] = 1.0;
          }
        }
      }
    }

    this.highlightAttr.needsUpdate = true;
  }

  /** Update cursor screen position from a mousemove event. */
  setMouseScreenPos(screenX: number, screenY: number): void {
    this.mouseScreenX = screenX;
    this.mouseScreenY = screenY;
    this.mouseActive = true;
  }

  /** Clear mouse state (e.g. on mouseleave). */
  clearMouse(): void {
    this.mouseActive = false;
    if (this.hoveredNode) {
      // Un-highlight the dot (unless hub)
      const hubVertexIndex = this.placedNavNodes[HUB_NODE_INDEX].vertexIndex;
      if (this.hoveredNode.vertexIndex !== hubVertexIndex && this.isNavNodeAttr) {
        (this.isNavNodeAttr.array as Float32Array)[this.hoveredNode.vertexIndex] = 0.0;
        this.isNavNodeAttr.needsUpdate = true;
      }
      this.hoveredNode = null;
      this.highlightPath(null);
    }
  }

  /**
   * Get the currently hovered nav node, or null.
   * Called by LandingPage to determine click targets and cursor style.
   */
  getHoveredNode(): PlacedNavNode | null {
    return this.hoveredNode;
  }

  /** Update renderer and camera on container resize */
  resize(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  /** Clean up all GPU resources */
  dispose(): void {
    this.renderer.setAnimationLoop(null);

    this.triMesh?.geometry.dispose();
    this.edgeLines?.geometry.dispose();
    this.pointCloud?.geometry.dispose();
    this.triMat.dispose();
    this.edgeMat.dispose();
    this.pointMat.dispose();

    // Height field resources
    this.heightTarget.dispose();
    this.heightMat.dispose();

    this.scene.clear();
    this.heightScene.clear();
    this.renderer.dispose();
  }
}
