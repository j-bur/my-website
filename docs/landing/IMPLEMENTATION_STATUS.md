# Implementation Status — Landing Page

**Last Updated**: 2026-02-24
**Current Phase**: Phase 1 complete, ready for Phase 2

---

## Quick Status

| Phase | Status | Gate |
|-------|--------|------|
| v1: Initial Implementation | Complete | Three.js mesh, 3 render passes, CSS anchor overlays |
| Phase 0: Graph Infrastructure | **Complete** | MeshGraph + adjacency, CPU heightAt, MeshScene refactored |
| Phase 1: Nav Nodes | **Complete** | BFS-placed nav nodes, 3D-projected labels, aIsNavNode shader attribute |
| Phase 2: Path Rendering | Not Started | — |
| Phase 3: Cursor Connection | Not Started | — |
| Phase 4: Performance | Not Started | — |
| Phase 5: Wave Simulation | Not Started | — |
| Phase 6a: Cursor Ripple | Not Started | — |
| Phase 6b: Graph Lightning | Not Started | — |

---

## Next Session

1. Begin **Phase 2: Path Rendering**
2. Read `.claude/docs/landing/PHASE_SPECS/phase-2-path-rendering.md`
3. Entry conditions: `npm run build` and `npm run lint` pass, nav nodes visible and projected correctly
4. **Visual check recommended**: verify nav node labels track the wave motion and the hub/Gauldurg dots render with enhanced brightness
5. **Phase 2 spec correction**: Task 2 says "all 3 geometry types share `VERT_SRC`/`FRAG_SRC`" — this is stale. Points now use `POINT_VERT_SRC`, and the shared body is `VERT_COMMON`. Compose `EDGE_VERT_SRC` from `VERT_COMMON` using the same pattern (see `POINT_VERT_SRC` for the template). Line number references at the bottom of the spec are also outdated.

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
