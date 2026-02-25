# Implementation Status — Landing Page

**Last Updated**: 2026-02-24
**Current Phase**: Phase 5 complete, ready for Phase 6a

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
| Phase 6a: Cursor Ripple | Not Started | — |
| Phase 6b: Graph Lightning | Not Started | — |

---

## Next Session

1. **Visual check REQUIRED**: Serve on localhost and verify Phase 5 waves in browser:
   - Waves should travel across the surface (not stationary bobbing)
   - Watch for 30+ seconds — no obvious repeating cycle
   - Wave crests should appear sharper than troughs
   - Turbulence should look organic and non-repeating
   - FPS should remain 30+ (check dev console)
   - Nav node hover/path/click still works
2. If visual tuning needed, adjust parameters in `HEIGHT_AT_GLSL` (meshConfig.ts) and mirror in `heightField.ts`:
   - `steep` values (0.3–0.6): controls crest sharpness
   - `* 80.0` warp magnitude: controls turbulence displacement
   - `t * 0.02` drift rate: controls direction rotation speed
   - `ampMod` ranges: controls amplitude variation depth
3. When satisfied, begin **Phase 6a: Cursor Ripple**
4. Read `.claude/docs/landing/PHASE_SPECS/phase-6a-cursor-ripple.md`

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

---

## Discovered Issues

- **CPU/GPU noise drift**: `heightField.ts` simplex noise uses JS doubles vs GLSL float precision. Sine waves match exactly but noise octaves may differ by ~0.1 units. Fine for nav node projection; would need revisiting if pixel-perfect CPU/GPU agreement is ever required.
- **Non-deterministic nav node placement**: Mesh generation uses `Math.random()` for grid jitter, scatter, and clusters, so BFS placement picks different vertices each page load. Nav nodes appear in slightly different positions each time. Acceptable aesthetically (organic feel) but makes visual regression testing harder. If deterministic placement is ever needed, seed the RNG in `buildMesh()`.

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
