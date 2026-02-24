import * as THREE from 'three';
import Delaunator from 'delaunator';
import {
  COLS, ROWS, JITTER, OVERSCAN, OVERSCAN_FAR,
  SCATTER_COUNT, CLUSTER_COUNT,
  MESH_WIDTH, MESH_DEPTH,
  CAMERA_FOV, CAMERA_HEIGHT, CAMERA_Z, CAMERA_LOOK_AT_Z,
  TRI_ALPHA, EDGE_ALPHA, POINT_ALPHA, POINT_SIZE,
  VERT_SRC, POINT_VERT_SRC, FRAG_SRC,
  EDGE_VERT_SRC, EDGE_FRAG_SRC,
  NAV_NODES, HUB_NODE_INDEX,
} from './meshConfig';
import { buildMeshGraph, edgeKey, type MeshGraph } from './meshGraph';
import { placeNavNodes, projectNavNodes, type PlacedNavNode, type NavProjection } from './navNodes';
import { findPath, pathToEdgeKeys } from './pathfinding';
import { heightAt } from './heightField';

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
  private mouseWorldXZ: { x: number; z: number } | null = null;
  private hoveredNode: PlacedNavNode | null = null;
  private cursorLine: THREE.Line | null = null;
  private cursorLineMat: THREE.LineBasicMaterial | null = null;
  private cursorLineGeom: THREE.BufferGeometry | null = null;
  private raycaster = new THREE.Raycaster();
  private groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

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

    // Shared shader uniforms (each material gets its own alpha range)
    const sharedUniforms = {
      uTime: { value: 0 },
    };

    this.triMat = this.createMaterial(sharedUniforms, TRI_ALPHA.min, TRI_ALPHA.range, 1.0, VERT_SRC);
    this.edgeMat = this.createMaterial(sharedUniforms, EDGE_ALPHA.min, EDGE_ALPHA.range, 1.0, EDGE_VERT_SRC, EDGE_FRAG_SRC);
    this.pointMat = this.createMaterial(sharedUniforms, POINT_ALPHA.min, POINT_ALPHA.range, POINT_SIZE, POINT_VERT_SRC);

    this.buildMesh();

    // Start render loop
    this.renderer.setAnimationLoop(() => this.animate());
  }

  private createMaterial(
    sharedUniforms: { uTime: { value: number } },
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

    // --- Triangle geometry (indexed) ---
    const triGeom = new THREE.BufferGeometry();
    triGeom.setAttribute('position', posAttr);
    // Use Uint32 to support >65535 vertices
    triGeom.setIndex(new THREE.BufferAttribute(new Uint32Array(tri), 1));
    this.triMesh = new THREE.Mesh(triGeom, this.triMat);
    this.scene.add(this.triMesh);

    // --- Build graph from Delaunay triangulation ---
    this.graph = buildMeshGraph(pts2d, new Uint32Array(tri));

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

    // --- Place nav nodes and mark their vertices ---
    this.placedNavNodes = placeNavNodes(this.graph, NAV_NODES);
    const isNavNode = new Float32Array(nPts);
    for (const nav of this.placedNavNodes) {
      isNavNode[nav.vertexIndex] = 1.0;
    }
    pointGeom.setAttribute('aIsNavNode', new THREE.BufferAttribute(isNavNode, 1));

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
    // All three materials share the same uTime uniform object
    this.triMat.uniforms.uTime.value = t;

    // Project nav labels before render so DOM and canvas are composited in sync
    if (this.placedNavNodes.length > 0) {
      const projections = projectNavNodes(
        this.placedNavNodes, t, this.camera, this.canvasWidth, this.canvasHeight,
      );
      // Hover detection: find nearest nav node within screen-pixel threshold
      this.updateHover(projections);

      // Update cursor-to-node line
      this.updateCursorLine(t);

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

    // Only update highlight on hover state change
    if (nearest !== this.hoveredNode) {
      this.hoveredNode = nearest;
      this.highlightPath(nearest?.vertexIndex ?? null);
    }
  }

  /** Draw or hide the solid teal line from cursor to hovered node. */
  private updateCursorLine(t: number): void {
    if (!this.hoveredNode || !this.mouseWorldXZ) {
      if (this.cursorLine) {
        this.cursorLine.visible = false;
      }
      return;
    }

    // Lazily create cursor line geometry
    if (!this.cursorLine) {
      this.cursorLineGeom = new THREE.BufferGeometry();
      this.cursorLineGeom.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(6), 3),
      );
      this.cursorLineMat = new THREE.LineBasicMaterial({
        color: 0x00d4aa,
        transparent: true,
        opacity: 0.6,
      });
      this.cursorLine = new THREE.Line(this.cursorLineGeom, this.cursorLineMat);
      this.scene.add(this.cursorLine);
    }

    this.cursorLine.visible = true;

    // Both endpoints displaced onto the wave surface
    const node = this.hoveredNode;
    const nodeY = heightAt(node.baseX, node.baseZ, t);
    const cursorY = heightAt(this.mouseWorldXZ.x, this.mouseWorldXZ.z, t);

    const posArr = this.cursorLineGeom!.attributes.position.array as Float32Array;
    // Endpoint 0: cursor
    posArr[0] = this.mouseWorldXZ.x;
    posArr[1] = cursorY;
    posArr[2] = this.mouseWorldXZ.z;
    // Endpoint 1: nav node
    posArr[3] = node.baseX;
    posArr[4] = nodeY;
    posArr[5] = node.baseZ;

    (this.cursorLineGeom!.attributes.position as THREE.BufferAttribute).needsUpdate = true;
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

  /**
   * Update cursor screen position from a mousemove event.
   * Converts to NDC, raycasts onto the Y=0 ground plane to get world XZ.
   */
  setMouseScreenPos(screenX: number, screenY: number): void {
    this.mouseScreenX = screenX;
    this.mouseScreenY = screenY;
    this.mouseActive = true;

    // Convert to NDC
    const ndcX = (screenX / this.canvasWidth) * 2 - 1;
    const ndcY = -(screenY / this.canvasHeight) * 2 + 1;

    // Raycast onto Y=0 plane
    this.raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), this.camera);
    const intersection = new THREE.Vector3();
    const hit = this.raycaster.ray.intersectPlane(this.groundPlane, intersection);
    this.mouseWorldXZ = hit ? { x: intersection.x, z: intersection.z } : null;
  }

  /** Clear mouse state (e.g. on mouseleave). */
  clearMouse(): void {
    this.mouseActive = false;
    this.mouseWorldXZ = null;
    if (this.hoveredNode) {
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
    this.cursorLineGeom?.dispose();
    this.cursorLineMat?.dispose();
    this.triMat.dispose();
    this.edgeMat.dispose();
    this.pointMat.dispose();

    this.scene.clear();
    this.renderer.dispose();
  }
}
