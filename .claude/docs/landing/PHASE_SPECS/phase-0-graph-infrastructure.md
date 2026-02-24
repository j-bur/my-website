# Phase 0: Graph Infrastructure + CPU Height Function

## Goal

Extract and retain the mesh graph data structure from Delaunay triangulation, and create a CPU-side `heightAt` function that mirrors the GPU shader. This is the foundational dependency for nav nodes, pathfinding, cursor interaction, and strumming.

---

## Entry Conditions

- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] Current landing page renders correctly at `localhost`

## Exit Conditions

- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] `MeshScene` stores a `MeshGraph` accessible via `getGraph()`
- [ ] `MeshGraph.adjacency` correctly maps each vertex to its Delaunay neighbors
- [ ] `MeshGraph.edges` matches the deduplicated edge count from the current implementation
- [ ] `heightAt(x, z, t)` in TypeScript produces values matching the GPU shader (verify by comparing a few sample points)
- [ ] Landing page renders identically to before (no visual regression)

---

## Tasks

### 1. Create `src/landing/meshGraph.ts`

```typescript
export interface MeshGraph {
  /** Flat XZ positions [x0, z0, x1, z1, ...] */
  positions: Float32Array;
  /** Total vertex count */
  vertexCount: number;
  /** adjacency[i] = array of vertex indices connected to vertex i */
  adjacency: number[][];
  /** Deduplicated edge list as [vertA, vertB] pairs */
  edges: [number, number][];
  /** Delaunay triangle indices (triplets) */
  triangles: Uint32Array;
}
```

- `buildMeshGraph(pts2d: number[], delaunayTriangles: Uint32Array): MeshGraph`
  - Builds adjacency list by iterating triangle edges (same logic as `MeshScene.ts` lines 157-164)
  - For each triangle edge `(p, q)`: add `q` to `adjacency[p]` and `p` to `adjacency[q]` (if not already present)
  - Collect unique edges into `edges` array
  - Store `positions` as Float32Array of the flat XZ pairs
  - Store `triangles` reference

### 2. Create `src/landing/heightField.ts`

- Port the GLSL simplex noise from `meshConfig.ts` lines 56-103 to TypeScript
  - `mod289`, `permute`, `taylorInvSqrt`, `snoise(v: [number, number, number]): number`
  - Must match the Ashima Arts / Stefan Gustavson implementation exactly
- `heightAt(x: number, z: number, t: number): number`
  - Replicates the 6 sine waves + 3 noise octaves from `VERT_SRC` lines 117-131
  - Used for projecting nav node positions (only ~2-5 calls per frame, perf is negligible)

### 3. Refactor `MeshScene.ts`

- Import `buildMeshGraph` from `meshGraph.ts`
- After Delaunay triangulation in `buildMesh()`, call `buildMeshGraph(pts2d, d.triangles)` and store as `this.graph`
- Add `getGraph(): MeshGraph | null` getter
- Refactor edge geometry construction to iterate `this.graph.edges` instead of rebuilding the edge map from triangles
- Remove the now-redundant `edgeSet` Map construction

### Files to Create

- `src/landing/meshGraph.ts`
- `src/landing/heightField.ts`

### Files to Modify

- `src/landing/MeshScene.ts` -- store graph, refactor edge construction, add getter

---

## Out of Scope

- DO NOT modify shaders
- DO NOT modify `LandingPage.tsx`
- DO NOT add mouse interaction
- DO NOT change visual output in any way

## Key References

- `src/landing/MeshScene.ts` lines 85-187 (current `buildMesh` method)
- `src/landing/meshConfig.ts` lines 56-131 (GLSL noise + heightAt)
