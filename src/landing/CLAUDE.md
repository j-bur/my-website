# Landing Page — Feature Instructions

Animated wireframe mesh landing page for jamesburns.cc. Full-viewport Three.js scene with interactive navigation nodes.

**Status**: Implemented (v1). Visual tuning may be needed — camera angle, mesh density, lighting parameters.

---

## Design Vision

Recreate the aesthetic of `source/3d-rendering-abstract-black-white-background.jpg` as a live, animated wireframe mesh — a Delaunay triangulation of points on a stormy ocean surface with directional lighting, viewed at perspective from above.

### Visual

- **Mesh**: Thousands of points (grid + jitter + clusters + scatter), Delaunay-triangulated
- **Three render passes**: Filled triangles (subtle lit surface, alpha 0–0.12), wireframe edges (alpha 0.01–0.55), vertex dots (alpha 0.02–0.95)
- **Animation**: 6 directional sine waves + 3 simplex noise octaves drive vertex Y-displacement on the GPU via custom ShaderMaterial
- **Lighting**: Directional light computed from surface normals (finite differences in vertex shader)
- **Camera**: PerspectiveCamera at ~35° tilt, positioned above the near edge looking toward the far edge
- **Background**: Black (`#000000`)
- **No reduced-motion handling** — user preference (OS setting is irrelevant for this site)

### Anchor Nodes

HTML overlay elements with fixed CSS positioning:

| Label | Position | Link | Type |
|-------|----------|------|------|
| FoundryVTT | Center of viewport | `https://foundry.jamesburns.cc` | External |
| Gauldurg | Top-right area | `/#/deck-builder` | Internal |

---

## Architecture

```
src/landing/
  CLAUDE.md              # This file
  LandingPage.tsx        # React route component — canvas + HTML anchor overlays
  MeshScene.ts           # Pure Three.js scene: renderer, camera, mesh, render loop, dispose
  meshConfig.ts          # Constants, anchor definitions, GLSL shader sources
  delaunator.d.ts        # TypeScript declarations for delaunator package
```

### Dependencies

| Package | Purpose |
|---------|---------|
| `three` | 3D scene, camera, ShaderMaterial, renderer |
| `delaunator` | Delaunay triangulation from point set |

No `simplex-noise` — noise is computed in GLSL on the GPU.

### Key Design Decisions

- **GPU displacement via ShaderMaterial** — all vertex displacement, normal computation, and lighting happen in the vertex shader. No CPU-side vertex updates per frame.
- **HTML anchor overlays** — positioned with CSS, not projected from 3D coordinates. Simple and proven from the mockup phase.
- **Three.js handles projection** — PerspectiveCamera replaces the mockup's custom landscape camera math.
- **ResizeObserver** for responsive canvas sizing.

### Routing

- `/#/` → `LandingPage` (index route)
- Siphon routes (`/#/combat`, `/#/deck-builder`) wrapped in `SiphonLayout` which applies `bg-siphon-bg` and `reduce-motion`
- `App.tsx` is a neutral shell (`min-h-screen text-white`, no feature-specific styling)

### Reference

The static HTML mockup at `source/landing-mockup.html` was the visual prototype. The GLSL shaders in `meshConfig.ts` are ported directly from it.

---

## Tuning Notes for Future Sessions

The v1 port uses Three.js's PerspectiveCamera which behaves differently from the mockup's custom projection. Areas that may need adjustment:

- **Camera FOV/position** — controls how much of the mesh is visible and the foreshortening
- **Distance fade** — the `600.0 / camDist` reference distance in the shader may need tuning
- **Mesh density** — the mockup had perspective-compensated row spacing; Three.js may need similar treatment if bottom rows look stretched
- **Edge visibility** — the mockup used `clip *= 1.3` zoom; Three.js equivalent is camera positioning
- **Chunk size** — Three.js adds ~150KB; consider lazy-loading the landing page route
