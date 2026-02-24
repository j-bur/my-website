import * as THREE from 'three';
import Delaunator from 'delaunator';
import {
  COLS, ROWS, JITTER, OVERSCAN, OVERSCAN_FAR,
  SCATTER_COUNT, CLUSTER_COUNT,
  MESH_WIDTH, MESH_DEPTH,
  CAMERA_FOV, CAMERA_HEIGHT, CAMERA_Z, CAMERA_LOOK_AT_Z,
  TRI_ALPHA, EDGE_ALPHA, POINT_ALPHA, POINT_SIZE,
  VERT_SRC, FRAG_SRC,
} from './meshConfig';

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

  private clock = new THREE.Clock();

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

    this.triMat = this.createMaterial(sharedUniforms, TRI_ALPHA.min, TRI_ALPHA.range, 1.0);
    this.edgeMat = this.createMaterial(sharedUniforms, EDGE_ALPHA.min, EDGE_ALPHA.range, 1.0);
    this.pointMat = this.createMaterial(sharedUniforms, POINT_ALPHA.min, POINT_ALPHA.range, POINT_SIZE);

    this.buildMesh();

    // Start render loop
    this.renderer.setAnimationLoop(() => this.animate());
  }

  private createMaterial(
    sharedUniforms: { uTime: { value: number } },
    alphaMin: number,
    alphaRange: number,
    pointSize: number,
  ): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      vertexShader: VERT_SRC,
      fragmentShader: FRAG_SRC,
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

    // --- Extract unique edges ---
    const edgeSet = new Map<number, [number, number]>();
    for (let i = 0; i < tri.length; i += 3) {
      const a = tri[i], b = tri[i + 1], c = tri[i + 2];
      for (const [p, q] of [[a, b], [b, c], [c, a]] as [number, number][]) {
        const key = p < q ? p * 1000000 + q : q * 1000000 + p;
        if (!edgeSet.has(key)) edgeSet.set(key, [p, q]);
      }
    }

    // --- Edge geometry (pairs of positions) ---
    const edgePositions = new Float32Array(edgeSet.size * 6); // 2 verts * 3 components
    let ei = 0;
    for (const [, [p, q]] of edgeSet) {
      edgePositions[ei++] = positions[p * 3];
      edgePositions[ei++] = positions[p * 3 + 1];
      edgePositions[ei++] = positions[p * 3 + 2];
      edgePositions[ei++] = positions[q * 3];
      edgePositions[ei++] = positions[q * 3 + 1];
      edgePositions[ei++] = positions[q * 3 + 2];
    }
    const edgeGeom = new THREE.BufferGeometry();
    edgeGeom.setAttribute('position', new THREE.BufferAttribute(edgePositions, 3));
    this.edgeLines = new THREE.LineSegments(edgeGeom, this.edgeMat);
    this.scene.add(this.edgeLines);

    // --- Point geometry (shared positions) ---
    const pointGeom = new THREE.BufferGeometry();
    pointGeom.setAttribute('position', posAttr);
    this.pointCloud = new THREE.Points(pointGeom, this.pointMat);
    this.scene.add(this.pointCloud);
  }

  private animate(): void {
    const t = this.clock.getElapsedTime();
    // All three materials share the same uTime uniform object
    this.triMat.uniforms.uTime.value = t;
    this.renderer.render(this.scene, this.camera);
  }

  /** Update renderer and camera on container resize */
  resize(width: number, height: number): void {
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

    this.scene.clear();
    this.renderer.dispose();
  }
}
