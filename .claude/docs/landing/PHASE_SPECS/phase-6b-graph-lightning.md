# Phase 6b: Graph-Based Lightning Effect

## Goal

Add a lightning-like energy dispersal along network edges when the cursor moves. Energy propagates from the nearest mesh vertex via BFS wavefront, creating branching bright paths that decay rapidly. This layers on top of Phase 6a's shader ripple.

## Depends on: Phases 0 (graph adjacency), 3 (cursor tracking), 6a (cursor uniforms)

---

## Entry Conditions

- [ ] Phase 6a exit conditions met
- [ ] Shader ripple working
- [ ] Cursor world XZ position tracked with velocity
- [ ] `MeshGraph.adjacency` available

## Exit Conditions

- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] Moving the cursor creates visible lightning-like bright edges emanating from the nearest mesh vertex
- [ ] Lightning branches organically along the network graph (not radial circles)
- [ ] Effect decays over distance (max ~5-8 hops) and time (fades in ~0.3-0.5 seconds)
- [ ] Effect intensity scales with cursor speed
- [ ] FPS remains at 30+ (bounded BFS + attribute upload is cheap)

---

## Tasks

### 1. Build spatial hash in `meshGraph.ts`

```typescript
export interface SpatialHash {
  cellSize: number;
  cells: Map<number, number[]>;  // hash(cellX, cellY) -> vertex indices
}

export function buildSpatialHash(positions: Float32Array, vertexCount: number, cellSize: number): SpatialHash;
export function findNearestVertex(hash: SpatialHash, positions: Float32Array, x: number, z: number): number;
```

- Cell size ~50-100 world units (roughly matching average edge length)
- `findNearestVertex()` checks the cell containing `(x, z)` and 8 neighboring cells
- Returns index of closest vertex

### 2. Create `src/landing/cursorInteraction.ts`

Lightning wavefront simulation:

```typescript
export class LightningEffect {
  private energy: Float32Array;        // per-vertex energy [0, 1]
  private edgeEnergy: Float32Array;    // per-edge-vertex energy (for edge aEnergy attribute)
  private graph: MeshGraph;
  private spatialHash: SpatialHash;

  /** Called each frame with cursor state */
  update(cursorX: number, cursorZ: number, cursorSpeed: number, cursorActive: boolean, dt: number): boolean;

  /** Get the per-vertex energy buffer (for point attribute) */
  getVertexEnergy(): Float32Array;

  /** Get the per-edge-vertex energy buffer (for edge attribute) */
  getEdgeEnergy(): Float32Array;
}
```

- `update()` logic:
  1. Decay all energy: `energy[i] *= 0.92` (per frame, ~0.3s half-life at 60fps)
  2. If cursor active and speed > threshold:
     - Find nearest vertex via spatial hash
     - BFS from that vertex, max depth 5-8 hops
     - At each hop: `energy[vertex] = max(energy[vertex], baseEnergy * decay^hop)`
     - `baseEnergy = min(cursorSpeed * 0.01, 1.0)`
  3. Map vertex energy to edge energy: `edgeEnergy[edgeIdx] = max(energy[vertA], energy[vertB])`
  4. Return `true` if any energy > 0.01 (signals that attributes need GPU upload)

### 3. Add `aEnergy` attribute to geometries

- Edge geometry: `Float32Array(edgeVertexCount)` as `aEnergy` attribute
- Point geometry: `Float32Array(vertexCount)` as `aEnergy` attribute
- Updated each frame from `LightningEffect` buffers (only when energy is active)

### 4. Shader modifications

In edge vertex shader:
```glsl
attribute float aEnergy;
// In main():
if (aEnergy > 0.01) {
  vColor = mix(vColor, vec3(0.6, 0.9, 1.0), aEnergy);  // light blue-white lightning
  vAlpha = max(vAlpha, aEnergy * 0.9);
}
```

In point vertex shader:
```glsl
attribute float aEnergy;
// In main():
if (aEnergy > 0.01) {
  gl_PointSize += aEnergy * 6.0;
  vAlpha = max(vAlpha, aEnergy * 0.95);
}
```

### 5. Wire into `MeshScene.ts`

- Create `LightningEffect` instance after mesh build
- In `animate()`: call `lightning.update(...)` with cursor state
- If update returns `true`: copy energy buffers to GPU attributes, mark `needsUpdate`

### Files to Create

- `src/landing/cursorInteraction.ts`

### Files to Modify

- `src/landing/meshGraph.ts` -- add `SpatialHash`, `buildSpatialHash()`, `findNearestVertex()`
- `src/landing/MeshScene.ts` -- create `LightningEffect`, update each frame, manage `aEnergy` attributes
- `src/landing/meshConfig.ts` -- add `aEnergy` to edge and point vertex shaders

---

## Out of Scope

- DO NOT implement persistent energy trails (energy always decays to 0)
- DO NOT add sound effects
- DO NOT make lightning affect the wave displacement (keep it visual-only for now -- potential future enhancement)

## Key References

- `src/landing/meshGraph.ts` -- `MeshGraph`, adjacency list
- `src/landing/MeshScene.ts` -- cursor tracking from Phase 3, attribute pattern from Phase 2
- `src/landing/meshConfig.ts` -- edge and point vertex shaders
