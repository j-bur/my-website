import * as THREE from 'three';
import Delaunator from 'delaunator';
import {
  COLS, ROWS, JITTER, OVERSCAN, OVERSCAN_FAR,
  SCATTER_COUNT, CLUSTER_COUNT, MAX_EDGE_LENGTH,
  MESH_WIDTH, MESH_DEPTH, HEIGHTMAP_RESOLUTION, MESH_CURVATURE,
  CAMERA_FOV, CAMERA_HEIGHT, CAMERA_Z, CAMERA_LOOK_AT_Z,
  TRI_ALPHA, EDGE_ALPHA, POINT_ALPHA, POINT_SIZE,
  VERT_SRC, POINT_VERT_SRC, FRAG_SRC,
  EDGE_VERT_SRC, EDGE_FRAG_SRC, POINT_FRAG_SRC,
  HEIGHT_VERT_SRC, HEIGHT_FRAG_SRC,
  FRACTAL_VERT_SRC, FRACTAL_FRAG_SRC, FRACTAL_RESOLUTION,
  NAV_NODES, HUB_NODE_INDEX,
  FACE_PALETTE, REVEAL,
} from './meshConfig';
import { buildMeshGraph, edgeKey, type MeshGraph } from './meshGraph';
import { placeNavNodes, projectNavNodes, type PlacedNavNode, type NavProjection } from './navNodes';
import { findPath, pathToEdgeKeys } from './pathfinding';
import { LightningEffect } from './cursorInteraction';

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
  private navNodeVisible: boolean[] = [];

  // Phase 6b: graph lightning
  private lightning: LightningEffect | null = null;
  private edgeEnergyAttr: THREE.BufferAttribute | null = null;
  private pointEnergyAttr: THREE.BufferAttribute | null = null;
  private triEnergyAttr: THREE.BufferAttribute | null = null;
  private triVertexIndices: Uint32Array | null = null; // original vertex indices for triangle buffer

  // Phase 7: staged reveal
  private revealComplete = false;
  private maxHopDist = 0;
  private revealDeferred = false;
  private revealStartTime = 0;

  // Phase 6a: cursor wake
  private cursorWorldX = 0;
  private cursorWorldZ = 0;
  private prevCursorWorldX = 0;
  private prevCursorWorldZ = 0;
  private cursorSpeed = 0;
  private cursorOnCanvas = false;
  private _rayOrigin = new THREE.Vector3();
  private _rayDir = new THREE.Vector3();

  // Propagating ripple drops (ring buffer)
  private static readonly NUM_DROPS = 64;
  private static readonly MIN_DROP_SPACING = 20;  // world units at slow cursor speed
  private static readonly MAX_DROP_SPACING = 100;  // world units at fast cursor speed
  private static readonly MAX_DROPS_PER_FRAME = 8;
  private dropsUni = Array.from({ length: MeshScene.NUM_DROPS }, () => new THREE.Vector4(0, 0, 0, 0));
  private drops = new Float32Array(MeshScene.NUM_DROPS * 4);
  private dropIndex = 0;
  private lastDropX = 0;
  private lastDropZ = 0;

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

  // Fractal color texture
  private fractalTarget: THREE.WebGLRenderTarget;
  private fractalScene: THREE.Scene;
  private fractalMat: THREE.ShaderMaterial;

  constructor(canvas: HTMLCanvasElement, width: number, height: number) {
    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true,
    });
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Camera (set correct aspect immediately so nav node placement has accurate frustum)
    this.camera = new THREE.PerspectiveCamera(CAMERA_FOV, width / height, 1, 10000);
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

    // Cursor wake uniforms shared by all mesh materials
    const wakeUniforms = {
      uDrops: { value: this.dropsUni },
    };

    // Fractal color texture (offscreen render, sampled by mesh fragment shaders)
    this.fractalTarget = new THREE.WebGLRenderTarget(
      FRACTAL_RESOLUTION, FRACTAL_RESOLUTION, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
      },
    );
    this.fractalScene = new THREE.Scene();
    this.fractalMat = new THREE.ShaderMaterial({
      vertexShader: FRACTAL_VERT_SRC,
      fragmentShader: FRACTAL_FRAG_SRC,
      uniforms: {
        uTime: sharedUniforms.uTime,
      },
      depthWrite: false,
      depthTest: false,
    });
    this.fractalScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.fractalMat));

    this.triMat = this.createMaterial(sharedUniforms, heightUniforms, wakeUniforms, TRI_ALPHA.min, TRI_ALPHA.range, 1.0, VERT_SRC);
    this.edgeMat = this.createMaterial(sharedUniforms, heightUniforms, wakeUniforms, EDGE_ALPHA.min, EDGE_ALPHA.range, 1.0, EDGE_VERT_SRC, EDGE_FRAG_SRC);
    this.pointMat = this.createMaterial(sharedUniforms, heightUniforms, wakeUniforms, POINT_ALPHA.min, POINT_ALPHA.range, POINT_SIZE, POINT_VERT_SRC, POINT_FRAG_SRC);

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
    wakeUniforms: {
      uDrops: { value: THREE.Vector4[] };
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
        uDrops: wakeUniforms.uDrops,
        uFractalMap: { value: this.fractalTarget.texture },
        uRevealThreshold: { value: 0.0 },
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

    // --- Triangle geometry (non-indexed, per-face palette colors) ---
    const triangles = this.graph.triangles;
    const triCount = triangles.length / 3;
    const triPositions = new Float32Array(triCount * 9); // 3 verts * 3 components
    const triColors = new Float32Array(triCount * 9);    // 3 verts * 3 RGB
    for (let t = 0; t < triCount; t++) {
      const i0 = triangles[t * 3], i1 = triangles[t * 3 + 1], i2 = triangles[t * 3 + 2];
      // Copy vertex positions into the non-indexed buffer
      for (let v = 0; v < 3; v++) {
        const srcIdx = [i0, i1, i2][v];
        triPositions[t * 9 + v * 3]     = positions[srcIdx * 3];
        triPositions[t * 9 + v * 3 + 1] = positions[srcIdx * 3 + 1];
        triPositions[t * 9 + v * 3 + 2] = positions[srcIdx * 3 + 2];
      }
      // Assign one random palette color to all 3 vertices (flat shading)
      const color = FACE_PALETTE[Math.floor(Math.random() * FACE_PALETTE.length)];
      for (let v = 0; v < 3; v++) {
        triColors[t * 9 + v * 3]     = color[0];
        triColors[t * 9 + v * 3 + 1] = color[1];
        triColors[t * 9 + v * 3 + 2] = color[2];
      }
    }
    // Store original vertex indices for mapping lightning energy to tri buffer
    this.triVertexIndices = new Uint32Array(triCount * 3);
    for (let t = 0; t < triCount; t++) {
      this.triVertexIndices[t * 3] = triangles[t * 3];
      this.triVertexIndices[t * 3 + 1] = triangles[t * 3 + 1];
      this.triVertexIndices[t * 3 + 2] = triangles[t * 3 + 2];
    }

    const triGeom = new THREE.BufferGeometry();
    triGeom.setAttribute('position', new THREE.BufferAttribute(triPositions, 3));
    triGeom.setAttribute('aColor', new THREE.BufferAttribute(triColors, 3));

    // aEnergy attribute for lightning facet brightening (1 per triangle vertex)
    const triEnergyData = new Float32Array(triCount * 3);
    this.triEnergyAttr = new THREE.BufferAttribute(triEnergyData, 1);
    triGeom.setAttribute('aEnergy', this.triEnergyAttr);

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

    // aEnergy attribute for lightning effect (2 vertices per edge)
    const edgeEnergyData = new Float32Array(edgeCount * 2);
    this.edgeEnergyAttr = new THREE.BufferAttribute(edgeEnergyData, 1);
    edgeGeom.setAttribute('aEnergy', this.edgeEnergyAttr);

    this.edgeLines = new THREE.LineSegments(edgeGeom, this.edgeMat);
    this.scene.add(this.edgeLines);

    // --- Point geometry (shared positions) ---
    const pointGeom = new THREE.BufferGeometry();
    pointGeom.setAttribute('position', posAttr);

    // --- Place nav nodes — only the hub is visually distinct by default ---
    // Ensure camera world matrix is up-to-date for frustum projection in placeNavNodes
    // (no render frame has run yet, so matrixWorld hasn't been computed from position/quaternion)
    this.camera.updateMatrixWorld(true);
    const navResult = placeNavNodes(this.graph, NAV_NODES, this.camera);
    this.placedNavNodes = navResult.placed;
    this.maxHopDist = navResult.maxHopDist;
    const hopDist = navResult.hopDist;

    // Phase 7: aHopDist attributes for staged reveal
    // Points: direct from BFS
    pointGeom.setAttribute('aHopDist', new THREE.BufferAttribute(hopDist, 1));
    // Edges: max hop of 2 endpoints, replicated to both vertices
    const edgeHopDist = new Float32Array(edgeCount * 2);
    for (let e = 0; e < edgeCount; e++) {
      const [p, q] = this.graph.edges[e];
      const maxHop = Math.max(hopDist[p], hopDist[q]);
      edgeHopDist[e * 2] = maxHop;
      edgeHopDist[e * 2 + 1] = maxHop;
    }
    edgeGeom.setAttribute('aHopDist', new THREE.BufferAttribute(edgeHopDist, 1));
    // Triangles: max hop of 3 face vertices, replicated to all 3
    const triHopDist = new Float32Array(triCount * 3);
    for (let t = 0; t < triCount; t++) {
      const i0 = triangles[t * 3], i1 = triangles[t * 3 + 1], i2 = triangles[t * 3 + 2];
      const maxHop = Math.max(hopDist[i0], hopDist[i1], hopDist[i2]);
      triHopDist[t * 3] = maxHop;
      triHopDist[t * 3 + 1] = maxHop;
      triHopDist[t * 3 + 2] = maxHop;
    }
    triGeom.setAttribute('aHopDist', new THREE.BufferAttribute(triHopDist, 1));

    const isNavNode = new Float32Array(nPts);
    isNavNode[this.placedNavNodes[HUB_NODE_INDEX].vertexIndex] = 1.0;
    this.isNavNodeAttr = new THREE.BufferAttribute(isNavNode, 1);
    pointGeom.setAttribute('aIsNavNode', this.isNavNodeAttr);

    // All nav nodes start visible; LandingPage can toggle via setNavNodeVisible()
    this.navNodeVisible = this.placedNavNodes.map(() => true);

    // aEnergy attribute for lightning effect (1 per vertex)
    const pointEnergyData = new Float32Array(nPts);
    this.pointEnergyAttr = new THREE.BufferAttribute(pointEnergyData, 1);
    pointGeom.setAttribute('aEnergy', this.pointEnergyAttr);

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

    // --- Phase 6b: lightning effect ---
    this.lightning = new LightningEffect(this.graph);
  }

  /** Convert screen pixel position to world XZ by intersecting with Y=0 plane. */
  private screenToWorldXZ(screenX: number, screenY: number): [number, number] {
    if (this.canvasWidth === 0 || this.canvasHeight === 0) return [0, 0];

    // Screen to NDC
    const ndcX = (screenX / this.canvasWidth) * 2 - 1;
    const ndcY = -(screenY / this.canvasHeight) * 2 + 1;

    // Unproject near point to get ray direction
    this._rayOrigin.set(ndcX, ndcY, 0).unproject(this.camera);
    this._rayDir.set(ndcX, ndcY, 1).unproject(this.camera).sub(this._rayOrigin).normalize();

    // Intersect with Y=0 plane
    if (Math.abs(this._rayDir.y) < 1e-6) return [0, 0];
    const t = -this._rayOrigin.y / this._rayDir.y;
    return [
      this._rayOrigin.x + this._rayDir.x * t,
      this._rayOrigin.z + this._rayDir.z * t,
    ];
  }

  private animate(): void {
    // getDelta() must be called before getElapsedTime() — getElapsedTime()
    // internally calls getDelta(), consuming the time step and leaving 0.
    const dt = this.clock.getDelta();
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

    // Cursor wake: compute world XZ, velocity, and spawn drops
    if (this.cursorOnCanvas && this.mouseActive) {
      const [wx, wz] = this.screenToWorldXZ(this.mouseScreenX, this.mouseScreenY);
      this.prevCursorWorldX = this.cursorWorldX;
      this.prevCursorWorldZ = this.cursorWorldZ;
      this.cursorWorldX = wx;
      this.cursorWorldZ = wz;

      const ddx = this.cursorWorldX - this.prevCursorWorldX;
      const ddz = this.cursorWorldZ - this.prevCursorWorldZ;
      const rawSpeed = dt > 0 ? Math.sqrt(ddx * ddx + ddz * ddz) / dt : 0;
      this.cursorSpeed += (rawSpeed - this.cursorSpeed) * 0.15;

      // Spawn drops along the cursor path (interpolated for fast movement)
      // Adaptive spacing: wider at high speed so the ring buffer lasts longer
      // (expanding wavefronts overlap to fill gaps at wider spacing)
      const spacing = Math.max(
        MeshScene.MIN_DROP_SPACING,
        Math.min(this.cursorSpeed * 0.025, MeshScene.MAX_DROP_SPACING),
      );
      const sdx = this.cursorWorldX - this.lastDropX;
      const sdz = this.cursorWorldZ - this.lastDropZ;
      const sDist = Math.sqrt(sdx * sdx + sdz * sdz);
      if (sDist > spacing) {
        const count = Math.min(
          Math.floor(sDist / spacing),
          MeshScene.MAX_DROPS_PER_FRAME,
        );
        const stepX = (sdx / sDist) * spacing;
        const stepZ = (sdz / sDist) * spacing;
        const amp = Math.min(this.cursorSpeed * 0.02, 5.0);
        for (let j = 0; j < count; j++) {
          this.lastDropX += stepX;
          this.lastDropZ += stepZ;
          const base = this.dropIndex * 4;
          this.drops[base] = this.lastDropX;
          this.drops[base + 1] = this.lastDropZ;
          this.drops[base + 2] = t;
          this.drops[base + 3] = amp;
          this.dropIndex = (this.dropIndex + 1) % MeshScene.NUM_DROPS;
        }
      }
    } else {
      this.cursorSpeed *= 0.92;
    }

    // Upload drops to shared uniform (all materials reference same array)
    for (let i = 0; i < MeshScene.NUM_DROPS; i++) {
      const base = i * 4;
      this.dropsUni[i].set(
        this.drops[base], this.drops[base + 1],
        this.drops[base + 2], this.drops[base + 3],
      );
    }

    // Phase 6b: graph lightning update
    if (this.lightning && this.edgeEnergyAttr && this.pointEnergyAttr) {
      const lightningActive = this.lightning.update(
        this.cursorWorldX,
        this.cursorWorldZ,
        this.cursorSpeed,
        this.cursorOnCanvas && this.mouseActive,
      );
      if (lightningActive) {
        const edgeSrc = this.lightning.getEdgeEnergy();
        (this.edgeEnergyAttr.array as Float32Array).set(edgeSrc);
        this.edgeEnergyAttr.needsUpdate = true;

        const vertSrc = this.lightning.getVertexEnergy();
        (this.pointEnergyAttr.array as Float32Array).set(vertSrc);
        this.pointEnergyAttr.needsUpdate = true;

        // Map vertex energy to triangle buffer (non-indexed, duplicated vertices)
        if (this.triEnergyAttr && this.triVertexIndices) {
          const triData = this.triEnergyAttr.array as Float32Array;
          const triIdx = this.triVertexIndices;
          for (let i = 0; i < triIdx.length; i++) {
            triData[i] = vertSrc[triIdx[i]];
          }
          this.triEnergyAttr.needsUpdate = true;
        }
      }
    }

    // All materials (including heightMat) share the same uTime uniform object
    this.triMat.uniforms.uTime.value = t;

    // Phase 7: staged reveal — exponential threshold ramp
    if (!this.revealComplete) {
      if (this.revealDeferred) {
        // Reveal not started yet — hide everything
        this.pointMat.uniforms.uRevealThreshold.value = -99999;
        this.edgeMat.uniforms.uRevealThreshold.value = -99999;
        this.triMat.uniforms.uRevealThreshold.value = -99999;
      } else {
        const revealT = t - this.revealStartTime;
        const { pointDuration, edgeTriDelay, edgeTriDuration, exponent } = REVEAL;
        const expDenom = Math.exp(exponent) - 1;
        const easeExpIn = (x: number) => (Math.exp(exponent * x) - 1) / expDenom;

        // Points: start at revealT=0
        const pointProgress = Math.min(revealT / pointDuration, 1.0);
        const pointThreshold = this.maxHopDist * easeExpIn(pointProgress);
        this.pointMat.uniforms.uRevealThreshold.value = pointThreshold;

        // Edges + Triangles: start at revealT=edgeTriDelay
        const etElapsed = Math.max(revealT - edgeTriDelay, 0);
        const etProgress = Math.min(etElapsed / edgeTriDuration, 1.0);
        const etThreshold = this.maxHopDist * easeExpIn(etProgress);
        this.edgeMat.uniforms.uRevealThreshold.value = etThreshold;
        this.triMat.uniforms.uRevealThreshold.value = etThreshold;

        // Check completion: points have finished their full duration
        if (pointProgress >= 1.0 && etProgress >= 1.0) {
          this.revealComplete = true;
          // Lock to large sentinel so shader check is always 1.0 (no-op)
          this.pointMat.uniforms.uRevealThreshold.value = 99999;
          this.edgeMat.uniforms.uRevealThreshold.value = 99999;
          this.triMat.uniforms.uRevealThreshold.value = 99999;
        }
      }
    }

    // Pass 1: render height field to displacement texture
    this.renderer.setRenderTarget(this.heightTarget);
    this.renderer.render(this.heightScene, this.heightCamera);

    // Pass 2: render fractal to color texture
    this.renderer.setRenderTarget(this.fractalTarget);
    this.renderer.render(this.fractalScene, this.heightCamera);

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
        // Apply curvature drop to match the vertex shader (which applies it after height map sampling)
        const dx = node.baseX;
        const dz = node.baseZ - CAMERA_Z;
        const cDist = Math.sqrt(dx * dx + dz * dz);
        navHeights[i] = this._navPixelBuf[0] - MESH_CURVATURE * cDist * cDist;
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

  /** Find the nearest nav node to the cursor, respecting per-node radius, priority, and visibility. */
  private updateHover(projections: NavProjection[]): void {
    if (!this.mouseActive) {
      if (this.hoveredNode) {
        this.hoveredNode = null;
        this.highlightPath(null);
      }
      return;
    }

    let nearest: PlacedNavNode | null = null;
    let nearestDistSq = Infinity;
    let nearestPriority = -Infinity;

    for (let i = 0; i < projections.length; i++) {
      if (!this.navNodeVisible[i]) continue;
      const proj = projections[i];
      const def = proj.node;
      // Hub ('You') is not hoverable — it's a non-navigable anchor
      if (i === HUB_NODE_INDEX) continue;

      const radiusMul = def.hoverRadiusMultiplier ?? 1;
      const maxDist = HOVER_DISTANCE_PX * radiusMul;
      const priority = def.hoverPriority ?? 0;

      const dx = this.mouseScreenX - proj.screenX;
      const dy = this.mouseScreenY - proj.screenY;
      const distSq = dx * dx + dy * dy;
      if (distSq > maxDist * maxDist) continue;

      // Higher priority always wins; within same priority, nearest wins
      if (priority > nearestPriority || (priority === nearestPriority && distSq < nearestDistSq)) {
        nearestDistSq = distSq;
        nearestPriority = priority;
        nearest = def;
      }
    }

    // Only update on hover state change
    if (nearest !== this.hoveredNode) {
      const hubVertexIndex = this.placedNavNodes[HUB_NODE_INDEX].vertexIndex;

      // Un-highlight previous hovered dot (keep hub + visible nav node dots)
      if (this.hoveredNode && this.isNavNodeAttr) {
        const prevIdx = this.placedNavNodes.indexOf(this.hoveredNode);
        const isHubOrVisibleNav = this.hoveredNode.vertexIndex === hubVertexIndex
          || (prevIdx >= 0 && this.navNodeVisible[prevIdx]);
        if (!isHubOrVisibleNav) {
          (this.isNavNodeAttr.array as Float32Array)[this.hoveredNode.vertexIndex] = 0.0;
          this.isNavNodeAttr.needsUpdate = true;
        }
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
    this.cursorOnCanvas = true;
  }

  /** Clear mouse state (e.g. on mouseleave). */
  clearMouse(): void {
    this.mouseActive = false;
    this.cursorOnCanvas = false;
    if (this.hoveredNode) {
      // Un-highlight the dot (keep hub + visible nav node dots)
      const hubVertexIndex = this.placedNavNodes[HUB_NODE_INDEX].vertexIndex;
      const prevIdx = this.placedNavNodes.indexOf(this.hoveredNode);
      const isHubOrVisibleNav = this.hoveredNode.vertexIndex === hubVertexIndex
        || (prevIdx >= 0 && this.navNodeVisible[prevIdx]);
      if (!isHubOrVisibleNav && this.isNavNodeAttr) {
        (this.isNavNodeAttr.array as Float32Array)[this.hoveredNode.vertexIndex] = 0.0;
        this.isNavNodeAttr.needsUpdate = true;
      }
      this.hoveredNode = null;
      this.highlightPath(null);
    }
  }

  /** Set whether the cursor is currently over the canvas (for ripple effect). */
  setCursorActive(active: boolean): void {
    this.cursorOnCanvas = active;
  }

  /**
   * Get the currently hovered nav node, or null.
   * Called by LandingPage to determine click targets and cursor style.
   */
  getHoveredNode(): PlacedNavNode | null {
    return this.hoveredNode;
  }

  /** Show or hide a nav node by index. Hidden nodes skip hover detection and label rendering. */
  setNavNodeVisible(index: number, visible: boolean): void {
    if (index < 0 || index >= this.navNodeVisible.length) return;
    this.navNodeVisible[index] = visible;

    // Update the point dot: show/hide the pulsing dot for this node
    if (this.isNavNodeAttr && this.placedNavNodes[index]) {
      const vi = this.placedNavNodes[index].vertexIndex;
      (this.isNavNodeAttr.array as Float32Array)[vi] = visible ? 1.0 : 0.0;
      this.isNavNodeAttr.needsUpdate = true;
    }

    // If we just hid the currently hovered node, clear hover state
    if (!visible && this.hoveredNode === this.placedNavNodes[index]) {
      this.hoveredNode = null;
      this.highlightPath(null);
    }
  }

  /** Defer the reveal animation until startReveal() is called. Must be called before first frame. */
  deferReveal(): void {
    this.revealDeferred = true;
    this.pointMat.uniforms.uRevealThreshold.value = -99999;
    this.edgeMat.uniforms.uRevealThreshold.value = -99999;
    this.triMat.uniforms.uRevealThreshold.value = -99999;
  }

  /** Start the reveal animation from this moment. */
  startReveal(): void {
    this.revealDeferred = false;
    this.revealStartTime = this.clock.getElapsedTime();
    this.revealComplete = false;
  }

  /** Whether the staged mesh reveal animation has completed. */
  isRevealComplete(): boolean {
    return this.revealComplete;
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

    // Fractal color texture
    this.fractalTarget.dispose();
    this.fractalMat.dispose();

    this.scene.clear();
    this.heightScene.clear();
    this.fractalScene.clear();
    this.renderer.dispose();
  }
}
