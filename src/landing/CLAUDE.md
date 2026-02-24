# Landing Page — Feature Instructions

Animated wireframe mesh landing page for jamesburns.cc. Full-viewport Three.js scene with interactive navigation nodes.

**Status**: Not yet implemented.

---

## Design Vision

Recreate the aesthetic of `source/3d-rendering-abstract-black-white-background.jpg` as a live, animated wireframe mesh — a Delaunay triangulation of points viewed at a slight perspective angle, with vertex displacement creating a gentle water-surface undulation.

### Visual

- **Mesh**: ~200-400 points scattered across viewport in a semi-regular grid with jitter, triangulated via Delaunay
- **Animation**: Simplex noise drives continuous vertex Z-displacement. Low frequency, slow time progression, 2 octaves. Top-down with perspective tilt (~15-25 degrees), so displacement reads as subtle X/Y drift + brightness/opacity variation (brighter = closer to surface)
- **Lines**: Thin white/gray edges between vertices. Alpha varies with vertex "height"
- **Nodes**: Small circles at vertices. Most are ambient; a few are interactive anchor nodes
- **Background**: Black (`#000000`) or near-black, distinct from the Siphon app's `#161418`
- **Atmosphere**: The original `index.html` had flavor text "This demiplane holds only a door." — atmospheric text can float subtly over the mesh

### Anchor Nodes (Interactive)

Specific mesh vertices pinned to approximate viewport positions. Visually distinct: larger, glowing, labeled. Click/tap navigates.

Planned anchors:
- **Echo Siphon** — internal link to `/#/deck-builder` (or `/#/combat` if deck exists)
- **FoundryVTT** — external link to `https://foundry.jamesburns.cc`
- (More can be added as the site grows)

Labels rendered as HTML overlay (React), positioned by projecting 3D anchor coordinates to screen space each frame.

---

## Technical Approach

### Dependencies to Add

| Package | Size | Purpose |
|---------|------|---------|
| `three` | ~150KB min | 3D scene, camera, raycasting |
| `delaunator` | ~4KB | Delaunay triangulation from point set |
| `simplex-noise` | ~3KB | Smooth noise for wave animation |

### Architecture

```
src/landing/
  CLAUDE.md              # This file
  LandingPage.tsx        # Route component — canvas + HTML overlay
  MeshScene.ts           # Three.js scene setup, animation loop, anchor raycasting
  meshConfig.ts          # Point count, noise params, camera angle, anchor definitions
```

- `LandingPage.tsx` — React component mounted at `/#/` route (replaces current `HomeRedirect`). Renders a `<canvas>` ref passed to `MeshScene`, plus a positioned HTML overlay for anchor labels.
- `MeshScene.ts` — Pure Three.js (no React dependency). Creates scene, camera, renderer, geometry. Owns the `requestAnimationFrame` loop. Exposes methods for resize, cleanup, and hover/click hit-testing.
- `meshConfig.ts` — Constants: point density, noise frequency/amplitude/speed, camera FOV/angle, anchor node definitions (label, position, URL).

### Three.js Scene Details

- **Geometry**: `BufferGeometry` with positions from the Delaunay point set. Wireframe rendered via `LineSegments` + `LineBasicMaterial`. Nodes rendered as `Points` + `PointsMaterial`.
- **Camera**: `PerspectiveCamera`, positioned above and slightly angled (tilt ~15-25 degrees). Orthographic is also viable if parallax feels too strong.
- **Animation loop**: Each frame, update vertex Z positions using `createNoise3D(x, y, time)`. Update buffer attribute, set `needsUpdate = true`.
- **Raycasting**: On pointer move, raycast against anchor node positions. On hit, set cursor to pointer and highlight node. On click, navigate.
- **Resize**: `ResizeObserver` on canvas parent. Update camera aspect + renderer size.

### Reduced Motion

When `prefers-reduced-motion` is active (or the setting is enabled):
- Render the mesh statically (no animation loop, just one frame)
- Anchor nodes still interactive

### Routing Change

Currently `/#/` renders `HomeRedirect` which redirects to combat or deck-builder. With the landing page:
- `/#/` renders `LandingPage`
- `/#/combat` and `/#/deck-builder` unchanged
- The Echo Siphon anchor node on the landing page handles the smart redirect logic (deck-builder if no deck, combat if deck exists)

### App Shell Note

`App.tsx` currently hardcodes `bg-siphon-bg` and imports `useReducedMotion` from siphon. Before or during landing page implementation:
- Make the app shell background neutral (`bg-black` or transparent)
- Extract `useReducedMotion` to a shared location, or have each feature manage its own background

See `docs/siphon/BACKLOG.md` item **TECH-01** for tracking.
