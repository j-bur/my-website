# Phase 7: Staged Mesh Reveal

## Goal

Replace the instant mesh appearance with a staged fade-in animation. The mesh emerges outward from the hub vertex over ~2 seconds: points appear first (with exponentially increasing rate), then edges and colored triangles follow 0.5s later. Eliminates the jarring instant render and creates a "network booting up" feel.

## Depends on: Phase 0 (graph infrastructure), Phase 1 (nav nodes)

---

## Entry Conditions

- [x] All phases 0–6b complete
- [x] Nav label text flash fixed (CSS `opacity: 0` default on `.nav-label`)

## Exit Conditions

- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] Page load shows black screen → hub dot appears → points radiate outward
- [ ] Points appear before edges/triangles (0.5s head start)
- [ ] Reveal rate accelerates (slow near hub, fast at edges)
- [ ] Smooth fade per vertex (no hard popping)
- [ ] Hub nav label appears with the hub dot (first frame)
- [ ] All three passes fully visible by ~2.5s, animation completes cleanly
- [ ] Cursor ripple and lightning work normally after reveal completes
- [ ] No visible performance difference after reveal (shader check becomes no-op)

---

## Design

### Data: BFS hop distances as vertex attribute

`placeNavNodes` already runs BFS from the hub but discards `hopDist` after placement. Phase 7 extends this: return the full `hopDist` array alongside the placed nodes, and upload it as a static `aHopDist` buffer attribute on all three geometry passes.

- **Points**: `Float32Array(nPts)` — `hopDist[i]` directly
- **Edges**: `Float32Array(edgeCount * 2)` — `max(hopDist[p], hopDist[q])` for each edge, replicated to both vertices (edge appears when both endpoints are revealed)
- **Triangles**: `Float32Array(triCount * 3)` — `max(hopDist[a], hopDist[b], hopDist[c])` per face, replicated to all 3 vertices (face appears when all corners are revealed)

Vertices with `hopDist === -1` (theoretically unreachable, unlikely in Delaunay) should be assigned `maxHopDist + 1`.

### Timing: exponential reveal curve

Each pass has a `uRevealThreshold` uniform that increases from 0 to beyond `maxHopDist`:

```
easeExpIn(x) = (exp(k * x) - 1) / (exp(k) - 1)    // x in [0, 1], k = exponent
```

| Pass | Start | Duration | Formula |
|------|-------|----------|---------|
| Points | t=0 | 2.0s | `maxHop * easeExpIn(t / 2.0)` |
| Edges + Triangles | t=0.5s | 1.5s | `maxHop * easeExpIn(max(t - 0.5, 0) / 1.5)` |

Both reach `maxHopDist` at t=2.0s wall-clock. After completion, set `uRevealThreshold` to a large sentinel (e.g., 99999) so the shader check is always 1.0.

### Shader: per-vertex fade via smoothstep

Add to `VERT_COMMON`:

```glsl
attribute float aHopDist;
uniform float uRevealThreshold;

// After alpha calculation, before pass-specific code:
float revealFade = smoothstep(aHopDist - 2.0, aHopDist, uRevealThreshold);
```

The 2-hop-wide smoothstep gives a soft wavefront (~100 world units of transition) instead of hard ring popping.

Apply in each pass's ending (after all energy/highlight modifications):

```glsl
vAlpha *= revealFade;
```

This ensures the reveal multiplier is the final gate on visibility, overriding energy/highlight/wake effects on unrevealed vertices.

### Constants (in `meshConfig.ts`)

```typescript
export const REVEAL = {
  pointDuration: 2.0,     // seconds for full point reveal
  edgeTriDelay: 0.5,      // seconds before edges/triangles start
  edgeTriDuration: 1.5,   // seconds for edge/tri reveal (ends at same time as points)
  exponent: 3.0,          // exponential ramp factor (higher = slower start, faster finish)
  smoothWidth: 2.0,       // hop-distance width of the fade zone
};
```

---

## Tasks

### 1. Extend `placeNavNodes` to return hop distances

Modify `navNodes.ts`:

- Remove the `maxHops` cap on BFS traversal (let it reach all reachable vertices)
- Return `{ placed: PlacedNavNode[], hopDist: Float32Array, maxHopDist: number }` instead of just `PlacedNavNode[]`
- Keep the existing `maxHops` filtering for nav node candidate selection (only the BFS traversal limit is removed)

### 2. Add `aHopDist` buffer attributes in `buildMesh()`

In `MeshScene.ts`, after receiving hop distances from `placeNavNodes`:

- **Point geometry**: set `aHopDist` attribute directly from `hopDist`
- **Edge geometry**: iterate edges, compute `max(hopDist[p], hopDist[q])`, write to both edge vertices
- **Triangle geometry**: iterate triangles (via `triVertexIndices`), compute `max(hopDist[a], hopDist[b], hopDist[c])`, write to all 3 face vertices

These are static attributes (set once, never updated).

### 3. Add `REVEAL` constants and `uRevealThreshold` uniform

In `meshConfig.ts`:
- Add `REVEAL` config object
- Add `attribute float aHopDist;` and `uniform float uRevealThreshold;` to `VERT_COMMON`
- Compute `revealFade` via `smoothstep` in `VERT_COMMON`
- Append `vAlpha *= revealFade;` at the end of `VERT_SRC`, `POINT_VERT_SRC`, and `EDGE_VERT_SRC` (after all energy/highlight logic)

In `MeshScene.ts`:
- Add `uRevealThreshold` uniform to `createMaterial()` (each material gets its own value)
- Store references to access per-material uniform in `animate()`

### 4. Drive reveal in `animate()` loop

In `MeshScene.ts`:

- Store `maxHopDist` from build step
- Track reveal state: `private revealComplete = false;`
- Each frame (while `!revealComplete`):
  - Compute elapsed time from clock
  - Apply exponential ease to get threshold for points vs edges/triangles
  - Set `uRevealThreshold` on each material
  - When all thresholds exceed `maxHopDist`, set `revealComplete = true` and lock thresholds to 99999

### 5. Gate nav label visibility on reveal progress

In `LandingPage.tsx` frame callback:
- The hub label already gets `opacity: 1` from the callback on the first frame — this is correct since the hub vertex (hop 0) is immediately visible
- No changes needed for non-hub labels (they're already hidden until hover)
- Consider: suppress hover detection during reveal by checking `scene.isRevealComplete()` — but this is optional (hover during reveal is unlikely and harmless)

Expose `isRevealComplete(): boolean` from `MeshScene` for potential future use.

---

## Files to Create

- None

## Files to Modify

- `src/landing/meshConfig.ts` — `REVEAL` constants, shader attribute/uniform/smoothstep in `VERT_COMMON`, `vAlpha *= revealFade` in all 3 pass shaders
- `src/landing/navNodes.ts` — extend BFS to all vertices, return hop distances + max
- `src/landing/MeshScene.ts` — `aHopDist` attributes on all 3 geometries, `uRevealThreshold` uniform per material, exponential reveal curve in `animate()`, `isRevealComplete()` accessor

---

## Out of Scope

- DO NOT suppress cursor ripple/lightning during reveal (unrevealed vertices have alpha 0, effects are naturally invisible)
- DO NOT re-run placement on resize (tracked as VIS-02 in BACKLOG.md)
- DO NOT add any loading spinner or progress bar — the mesh IS the loading animation

## Key References

- `src/landing/navNodes.ts` — existing BFS from hub (lines 46–61)
- `src/landing/MeshScene.ts` — `buildMesh()` for attribute creation pattern, `animate()` for uniform update pattern
- `src/landing/meshConfig.ts` — `VERT_COMMON` for shared shader body, pass-specific shaders for `vAlpha` assignment
