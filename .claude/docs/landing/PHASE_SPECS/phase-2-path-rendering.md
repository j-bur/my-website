# Phase 2: Path Rendering Through Network

## Goal

When a nav node is hovered (Phase 3 wires the hover), highlight the shortest path through mesh edges from the FoundryVTT hub to that node. Pre-compute all paths at init. Highlighted edges render in EP Positive accent color (#00d4aa) with boosted alpha.

## Depends on: Phases 0, 1

---

## Entry Conditions

- [ ] Phase 1 exit conditions met
- [ ] Nav nodes placed with known vertex indices
- [ ] `MeshGraph.adjacency` available
- [ ] Edge geometry built from `graph.edges`

## Exit Conditions

- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] `highlightPath(vertexIndex)` on MeshScene highlights correct edges in accent color
- [ ] `highlightPath(null)` clears all highlights
- [ ] Paths are precomputed at init (no per-frame BFS)
- [ ] Edge shader supports `aHighlight` attribute with color varying
- [ ] Non-highlighted edges render identically to before

---

## Tasks

### 1. Create `src/landing/pathfinding.ts`

- `findPath(adjacency: number[][], source: number, target: number): number[]`
  - BFS shortest path (all edges equal weight)
  - Returns vertex index array from source to target (inclusive), or `[]` if unreachable
  - The mesh is a Delaunay triangulation of a dense point set, so it's always connected

- `pathToEdgeKeys(path: number[]): Set<number>`
  - For consecutive pairs `(path[i], path[i+1])`, compute edge key `min(a,b) * 1_000_000 + max(a,b)`
  - Returns set of edge keys for fast membership testing

### 2. Split edge shaders in `meshConfig.ts`

Currently all 3 geometry types share `VERT_SRC`/`FRAG_SRC`. Edges now need highlight support, so split:

- Keep `VERT_SRC` / `FRAG_SRC` for triangles and points
- Create `EDGE_VERT_SRC`:
  - Same displacement + lighting logic as `VERT_SRC`
  - Adds `attribute float aHighlight;`
  - Adds `varying vec3 vColor;`
  - When `aHighlight > 0.5`: `vColor = vec3(0.0, 0.83, 0.67)` (EP Positive), `vAlpha = 0.8`
  - Otherwise: `vColor = vec3(1.0)`, standard alpha calculation

- Create `EDGE_FRAG_SRC`:
  ```glsl
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    gl_FragColor = vec4(vColor, vAlpha);
  }
  ```

### 3. Add highlight infrastructure to `MeshScene.ts`

- During edge geometry construction, build `Map<number, number>` mapping edge keys to buffer indices (the index into the edge positions array where that edge starts). Store as `this.edgeKeyToIndex`.
- Create `Float32Array(edgeCount * 2)` for `aHighlight` (2 vertices per edge, same value for both). Add as attribute to edge geometry.
- Use new `EDGE_VERT_SRC`/`EDGE_FRAG_SRC` for edge material.

- Precompute paths at init:
  ```typescript
  private navPaths: Map<number, number[]> = new Map(); // vertexIndex -> path from hub

  // After placeNavNodes:
  for (const node of this.placedNavNodes) {
    if (node.vertexIndex !== hubVertexIndex) {
      this.navPaths.set(node.vertexIndex, findPath(graph.adjacency, hubVertexIndex, node.vertexIndex));
    }
  }
  ```

- `highlightPath(targetVertexIndex: number | null)`:
  1. Zero out the entire `aHighlight` buffer
  2. If `targetVertexIndex !== null`: look up precomputed path, compute edge keys, set `aHighlight` to `1.0` for matching edges (both vertices of each edge)
  3. Mark attribute as `needsUpdate = true`
  - This only runs on hover state change, not every frame

### Files to Create

- `src/landing/pathfinding.ts`

### Files to Modify

- `src/landing/meshConfig.ts` -- add `EDGE_VERT_SRC`, `EDGE_FRAG_SRC`
- `src/landing/MeshScene.ts` -- edge key map, aHighlight attribute, precompute paths, `highlightPath()` method, use edge-specific material

---

## Out of Scope

- DO NOT implement mouse hover detection (Phase 3 calls `highlightPath`)
- DO NOT implement cursor-to-node line
- DO NOT modify triangle or point shaders (only edge shader changes)

## Key References

- `src/landing/MeshScene.ts` lines 156-180 (edge geometry construction)
- `src/landing/meshConfig.ts` lines 107-176 (current shared shaders)
