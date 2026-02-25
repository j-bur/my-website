# Landing Page — Feature Instructions

Animated wireframe mesh landing page for jamesburns.cc. Full-viewport Three.js scene with interactive navigation nodes.

**Current State**: v1 implemented. Phases 0–6b planned for interactive nav nodes, path rendering, performance optimization, wave improvements, and cursor effects. Check `docs/landing/IMPLEMENTATION_STATUS.md` for the current phase and next steps.

---

## Design Vision

Recreate the aesthetic of `source/3d-rendering-abstract-black-white-background.jpg` as a live, animated wireframe mesh — a Delaunay triangulation of points on a stormy ocean surface with directional lighting, viewed at perspective from above.

### Visual

- **Mesh**: Thousands of points (grid + jitter + clusters + scatter), Delaunay-triangulated
- **Three render passes**: Filled triangles (subtle lit surface, alpha 0–0.12), wireframe edges (alpha 0.01–0.55), vertex dots (alpha 0.02–0.95)
- **Animation**: GPU vertex displacement via custom ShaderMaterial
- **Lighting**: Directional light computed from surface normals (finite differences in vertex shader)
- **Camera**: PerspectiveCamera at ~35° tilt, positioned above the near edge looking toward the far edge
- **Background**: Black (`#000000`)
- **No reduced-motion handling** — user preference (OS setting is irrelevant for this site)

### Navigation Nodes

Nav nodes are mesh vertices placed via BFS hop distance from a central hub (FoundryVTT). Labels are HTML elements positioned via 3D projection, following the wave animation.

| Label | Role | Link | Type |
|-------|------|------|------|
| FoundryVTT | Hub (center vertex) | `https://foundry.jamesburns.cc` | External |
| Gauldurg | Nav node (8–25 hops from hub) | `/#/deck-builder` | Internal |

---

## Architecture

```
src/landing/
  CLAUDE.md              # This file
  LandingPage.tsx        # React route component — canvas + projected nav labels
  MeshScene.ts           # Pure Three.js scene: renderer, camera, mesh, render loop, dispose
  meshConfig.ts          # Constants, nav node definitions, GLSL shader sources
  delaunator.d.ts        # TypeScript declarations for delaunator package
  meshGraph.ts           # Graph data structure + adjacency builder (Phase 0) + spatial hash (Phase 6b)
  heightField.ts         # CPU-side height function mirroring GPU shader (Phase 0)
  navNodes.ts            # Nav node placement (BFS) + screen projection (Phase 1)
  pathfinding.ts         # BFS shortest path + edge key conversion (Phase 2)
  cursorInteraction.ts   # Lightning wavefront simulation (Phase 6b)
```

### Dependencies

| Package | Purpose |
|---------|---------|
| `three` | 3D scene, camera, ShaderMaterial, renderer |
| `delaunator` | Delaunay triangulation from point set |

No `simplex-noise` — noise is computed in GLSL on the GPU. CPU-side noise (in `heightField.ts`) is a TypeScript port of the same GLSL implementation.

### Key Design Decisions

- **GPU displacement via ShaderMaterial** — all vertex displacement, normal computation, and lighting happen in the vertex shader. No CPU-side vertex updates per frame.
- **Composable vertex shaders** — `VERT_COMMON` in `meshConfig.ts` contains the shared body (uniforms, displacement texture sampling, lighting, alpha calculation). `VERT_SRC`, `POINT_VERT_SRC`, and `EDGE_VERT_SRC` compose from it with different endings. Wave model lives entirely in `HEIGHT_AT_GLSL` (Gerstner + domain-warped FBM, added in Phase 5).
- **Displacement texture** (Phase 4, implemented) — height field rendered to a 512×512 `FloatType` texture once per frame via `HEIGHT_FRAG_SRC`, sampled by all vertex shaders via `sampleHeight()`, eliminating redundant noise computation. Mesh bounds computed from point cloud with 2% padding.
- **Nav nodes are mesh vertices** — positioned via BFS from a hub node, not CSS overlays.
- **Three.js handles projection** — PerspectiveCamera replaces the mockup's custom landscape camera math.
- **ResizeObserver** for responsive canvas sizing.
- **No path aliases**: All imports use relative paths.

### Routing

- `/#/` → `LandingPage` (index route)
- Siphon routes (`/#/combat`, `/#/deck-builder`) wrapped in `SiphonLayout`
- `App.tsx` is a neutral shell (`min-h-screen text-white`, no feature-specific styling)

### Reference

The static HTML mockup at `source/landing-mockup.html` was the visual prototype. The GLSL shaders in `meshConfig.ts` are ported directly from it.

---

## Landing-Specific Constraints

- **Always serve over HTTP for testing** — `file://` protocol causes severe animation stuttering on this PC
- **Do NOT honor `prefers-reduced-motion`** — the user's OS has "Show Animations" off but wants full animation on this site

---

## Session Handoff (Landing)

Before ending a session:
1. Update `docs/landing/IMPLEMENTATION_STATUS.md` (phase work) or `docs/landing/BACKLOG.md` (backlog work)
2. Update the Architecture section above if new modules were created

---

## Reference Documentation (read on demand, not preloaded)

| Document | Contents |
|----------|----------|
| `.claude/docs/SESSION_PROTOCOL.md` | Mandatory session start/end procedures |
| `.claude/docs/landing/PHASE_SPECS/` | One spec per implementation phase (0–6b) |
| `docs/landing/IMPLEMENTATION_STATUS.md` | Phase progress, discovered issues, session log |
| `docs/landing/BACKLOG.md` | Performance issues, visual bugs, tuning items |
| `source/landing-mockup.html` | Original static HTML/WebGL prototype (630 lines) |
