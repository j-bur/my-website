# Implementation Status — Landing Page

**Last Updated**: 2026-02-24
**Current Phase**: Phase 7 complete

---

## Quick Status

| Phase | Status | Gate |
|-------|--------|------|
| v1: Initial Implementation | Complete | Three.js mesh, 3 render passes, CSS anchor overlays |
| Phase 0: Graph Infrastructure | **Complete** | MeshGraph + adjacency, CPU heightAt, MeshScene refactored |
| Phase 1: Nav Nodes | **Complete** | BFS-placed nav nodes, 3D-projected labels, aIsNavNode shader attribute |
| Phase 2: Path Rendering | **Complete** | `highlightPath()` on MeshScene, BFS paths precomputed, edge shader with `aHighlight` |
| Phase 3: Cursor Connection | **Complete** | Hover detection, path highlight on hover, click navigation, discoverable nav nodes |
| Phase 4: Performance | **Complete** | Displacement texture, two-pass render, dev FPS counter |
| Phase 5: Wave Simulation | **Complete** | Gerstner waves, domain-warped FBM, time-varying drift |
| Phase 6a: Cursor Ripple | **Complete** | Propagating drop ripples (64-slot ring buffer), adaptive spacing, screen-to-world raycast |
| Phase 6b: Graph Lightning | **Complete** | Spatial hash, BFS lightning wavefront, aEnergy on edges + points + tris, interpolated fast cursor |
| Phase 7: Staged Mesh Reveal | **Complete** | BFS hop-distance reveal, exponential ease, 0.5s point head start, smoothstep fade |

---

## Next Session

1. All planned phases (0–7) are complete
2. Phase 6b tuning reference (if revisiting):
   - **LightningEffect** (`cursorInteraction.ts`):
     - `MAX_HOPS` (3): BFS depth limit
     - `DECAY` (0.92): per-frame multiplicative energy decay
     - `HOP_FALLOFF` (0.5): energy multiplier per hop (base * 0.5^hop)
     - `SPEED_THRESHOLD` (50): minimum cursor speed to trigger lightning
     - `cursorSpeed * 0.003`: base energy scaling; capped at 0.6
     - `INTERP_SPACING` (80): world-unit spacing between interpolated injections
     - `MAX_INTERP_STEPS` (10): cap on interpolation points per frame
   - **Spatial hash** (`meshGraph.ts`):
     - Cell size 80 world units
     - 9-cell neighborhood search for nearest vertex
   - **Shaders** (`meshConfig.ts`):
     - Edge `aEnergy`: mixes toward `vec3(0.6, 0.9, 1.0)` at 60% blend, alpha * 0.5
     - Point `aEnergy`: adds `aEnergy * 4.0` to point size, alpha * 0.5
     - Tri `aEnergy`: brightens face color (1.8× mix), alpha * 0.25
3. Phase 6a cursor wake tuning reference (if revisiting):
   - **Shader** (`meshConfig.ts` VERT_COMMON wake loop):
     - `uDrops[64]`: ring buffer size (matches `NUM_DROPS` in MeshScene.ts)
     - `age > 1.5`: drop lifetime in seconds
     - `age * 100.0`: wavefront propagation speed (world units/sec)
     - `25.0 + age * 10.0`: ring width (initial + growth rate)
     - `1.0 - age * 0.95`: decay rate (reaches 0 at ~1.05s, fully clamped at lifetime)
     - `dist * 0.1`: ripple spatial frequency (lower = wider waves)
     - `age * 10.0`: ripple temporal frequency
   - **CPU** (`MeshScene.ts`):
     - `NUM_DROPS` (64): ring buffer capacity
     - `MIN_DROP_SPACING` (20) / `MAX_DROP_SPACING` (100): adaptive spacing range
     - `cursorSpeed * 0.025`: speed-to-spacing scaling
     - `MAX_DROPS_PER_FRAME` (8): interpolation cap per frame
     - `cursorSpeed * 0.02`: amplitude scaling; `5.0`: amplitude cap
     - Velocity smoothing `0.15`: responsiveness vs jitter
     - Speed decay `0.92`: how quickly ripple fades on mouse leave

---

## Phase Specs

Each phase has a detailed spec in `.claude/docs/landing/PHASE_SPECS/`. Read the spec before starting a phase.

| Phase | Spec File | Key Deliverables |
|-------|-----------|-----------------|
| 0 | `phase-0-graph-infrastructure.md` | MeshGraph data structure, CPU heightAt function |
| 1 | `phase-1-nav-nodes.md` | BFS-placed nav nodes, 3D-projected labels |
| 2 | `phase-2-path-rendering.md` | BFS pathfinding, edge highlight attribute, accent-colored path |
| 3 | `phase-3-cursor-connection.md` | Cursor-to-node line, click navigation, hover wiring |
| 4 | `phase-4-performance.md` | Displacement texture, 30+ FPS target |
| 5 | `phase-5-wave-simulation.md` | Gerstner waves, domain-warped FBM, time-varying params |
| 6a | `phase-6a-cursor-ripple.md` | Shader radial ripple from cursor movement |
| 6b | `phase-6b-graph-lightning.md` | Graph BFS lightning effect, spatial hash |
| 7 | `phase-7-mesh-reveal.md` | BFS hop-distance staged reveal, exponential ease, smoothstep fade |

---

## Discovered Issues

- **CPU/GPU noise drift**: `heightField.ts` simplex noise uses JS doubles vs GLSL float precision. Sine waves match exactly but noise octaves may differ by ~0.1 units. Fine for nav node projection; would need revisiting if pixel-perfect CPU/GPU agreement is ever required.
- **Non-deterministic nav node placement**: Mesh generation uses `Math.random()` for grid jitter, scatter, and clusters, so BFS placement picks different vertices each page load. Nav nodes appear in slightly different positions each time. Acceptable aesthetically (organic feel) but makes visual regression testing harder. If deterministic placement is ever needed, seed the RNG in `buildMesh()`.
- **Domain warping amplifies CPU/GPU noise drift** (Phase 5): The warp step feeds noise output back as noise input coordinates, compounding JS-double vs GLSL-float precision differences. Nav node projection still works (only ~2-5 lookups/frame, small positional error), but pixel-perfect CPU/GPU agreement is now further out of reach.
- **Gerstner crest sharpness is approximate** (Phase 5): Y-only power-curve shaping (`pow` with exponent 1.3–1.6) creates mild asymmetry. If crests don't look sharp enough visually, options: increase steep values (0.8–1.5), use harmonic shaping (`sin(x) + k*sin(2x)`), or store vec3 displacement in the height texture (bigger change).

---

## Session Log

| Date | Phase | Summary |
|------|-------|---------|
| 2026-02-24 | Planning | Phase specs 0–6b written in `.claude/docs/landing/PHASE_SPECS/` |
| 2026-02-24 | Phase 0 | Created `meshGraph.ts` (MeshGraph interface + buildMeshGraph), `heightField.ts` (CPU simplex noise + heightAt). Refactored MeshScene to use graph, added getGraph() getter. |
| 2026-02-24 | Phase 1 | Created `navNodes.ts` (BFS placement + 3D projection). Replaced AnchorNode/ANCHORS with NavNodeDef/NAV_NODES in meshConfig.ts. Added POINT_VERT_SRC with aIsNavNode attribute (larger/brighter/pulsing dots). Added frame callback + resize storage to MeshScene. Rewrote LandingPage.tsx with projected labels via direct DOM transform. Replaced .anchor CSS with .nav-label CSS. |
| 2026-02-24 | Phase 2 | Created `pathfinding.ts` (BFS findPath + pathToEdgeKeys). Added `EDGE_VERT_SRC`/`EDGE_FRAG_SRC` to meshConfig.ts (composed from VERT_COMMON, with aHighlight attribute + vColor varying for EP Positive accent). Modified MeshScene: edge key→buffer index map, aHighlight Float32Array attribute on edge geometry, edge-specific material, precomputed hub→nav paths at init, public `highlightPath(vertexIndex | null)` method. Extracted shared `edgeKey()` utility into meshGraph.ts to eliminate magic number duplication across 3 files. |
| 2026-02-24 | Phase 3 | Added cursor interaction to MeshScene: mouse screen tracking with `setMouseScreenPos()`/`clearMouse()`, hover detection via screen-pixel distance (150px threshold), `getHoveredNode()` public API. Rewrote LandingPage.tsx: mousemove/mouseleave/click event handlers on canvas, `useNavigate` for internal links (strips `/#` prefix for hash router), pointer cursor on hover, `nav-label-hovered` CSS class toggled in frame callback. Added `.nav-label-hovered` CSS with EP Positive teal text-shadow glow. Removed cursor-to-node line (perspective mismatch). Non-hub nav nodes hidden by default — `aIsNavNode` only marks hub; dot + label revealed on hover for discoverable navigation. |
| 2026-02-24 | Phase 4 | Displacement texture optimization. Extracted `heightAt` from vertex shaders into a height field fragment shader (`HEIGHT_FRAG_SRC`) that renders to a 512×512 `FloatType` `WebGLRenderTarget`. All mesh vertex shaders (`VERT_COMMON`) now sample displacement from texture via `sampleHeight()` instead of computing noise inline — eliminates redundant `heightAt()` per vertex. Added `HEIGHT_VERT_SRC` (fullscreen quad passthrough), `HEIGHT_AT_GLSL` (extracted heightAt function), `HEIGHTMAP_RESOLUTION` constant. MeshScene: two-pass render loop (height texture → scene), orthographic camera + fullscreen quad for height pass, mesh bounds computed from point cloud with 2% padding, shared `uHeightMap`/`uMapMin`/`uMapSize` uniforms across all materials. Dev-only FPS counter via `import.meta.env.DEV`. Normal finite differences use 1-texel offset (`uMapSize / 512.0`). Dispose updated for height resources. |
| 2026-02-24 | Phase 5 | Wave simulation rewrite. Replaced 6 fixed sine waves with `gerstnerY()` — power-curve shaping (`pow((sin+1)/2, 1+steep)*2-1`) creates sharp crests and broad troughs without XZ displacement. Added time-varying direction drift (`t*0.02` rotation on alternating waves, ~5 min full rotation) and amplitude modulation (`ampMod1`/`ampMod2` at different rates). Replaced 3 simple noise octaves with domain-warped FBM: 2 noise evaluations warp the input coordinates by ±80 world units before the 3 FBM octaves, creating organic non-repeating turbulence. Updated CPU mirror in `heightField.ts` with identical `gerstnerY()` + drift + warping logic. Files modified: `meshConfig.ts` (HEIGHT_AT_GLSL), `heightField.ts`. No new files created. |
| 2026-02-24 | Phase 6a | Cursor wake effect. Propagating drop ripple system: 64-slot ring buffer of cursor trail positions uploaded as `uDrops[64]` uniform. Each drop spawns expanding concentric ripples (Gaussian-enveloped sine, 1.5s lifetime, 0.95/s decay, 100 u/s wavefront speed). Adaptive drop spacing (20–100 world units) scales with cursor velocity so drops fade before buffer wraps even at high speed. Path interpolation fills gaps during fast cursor movement. Added `screenToWorldXZ()` raycast (screen→Y=0 plane intersection) and per-frame velocity tracking with smoothing in MeshScene. Added `setCursorActive()` public API. Added `mouseenter` event handler in LandingPage. Existing ripples continue propagating when cursor leaves canvas. Files modified: `meshConfig.ts`, `MeshScene.ts`, `LandingPage.tsx`. No new files created. |
| 2026-02-24 | Phase 6b | Graph lightning effect. Created `cursorInteraction.ts` with `LightningEffect` class: BFS wavefront from nearest vertex to cursor, per-vertex energy with exponential hop falloff (0.55^hop), per-frame multiplicative decay (0.92). Added `SpatialHash` + `buildSpatialHash()` + `findNearestVertex()` to `meshGraph.ts` (cell size 80, 9-cell neighborhood search). Added `aEnergy` attribute to edge vertex shader (mixes toward light blue-white `vec3(0.6, 0.9, 1.0)`) and point vertex shader (increases point size + alpha). Wired into MeshScene: creates LightningEffect after mesh build, calls `update()` each frame, copies energy buffers to GPU only when active. Files created: `cursorInteraction.ts`. Files modified: `meshGraph.ts`, `meshConfig.ts`, `MeshScene.ts`. |
| 2026-02-24 | Phase 7 | Staged mesh reveal. Extended `placeNavNodes` to return full BFS `hopDist` Float32Array + `maxHopDist` (unbounded BFS, unreachable vertices get maxHopDist+1). Added `REVEAL` config to meshConfig.ts. Added `aHopDist` attribute and `uRevealThreshold` uniform to `VERT_COMMON`, `revealFade` via `smoothstep` (2-hop fade zone), `vAlpha *= revealFade` at end of all 3 pass shaders. MeshScene: `aHopDist` buffer attribute on points (direct), edges (max of endpoints), triangles (max of face vertices). Exponential ease reveal in `animate()` — points from t=0 over 2s, edges/tris from t=0.5s over 1.5s, sentinel 99999 on completion. `isRevealComplete()` accessor. Files modified: `navNodes.ts`, `meshConfig.ts`, `MeshScene.ts`. |
