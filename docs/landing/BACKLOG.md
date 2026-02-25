# Backlog — Landing Page

Visual improvements, performance issues, and feature requests for the animated mesh landing page.

---

## Format

Each item has: `[status]` **`P#`** `|` **`Size`** `|` **Title**: Description

**Status**: `[ ]` open, `[~]` in progress, `[x]` resolved, `[?]` needs clarification
**Priority**: `P1` = blocks usability, `P2` = degrades experience, `P3` = nice-to-have
**Size**: `S` = < 1 hour / single file, `M` = 1-3 hours / 2-5 files, `L` = half-day+ / architectural

When investigating an item, append **Notes** beneath it as sub-bullets.

---

## Performance

- [x] **P1** | **L** | **PERF-01: ~20 FPS on mid-range gaming PC**: Root cause was `heightAt()` evaluated 9x per vertex per frame. Fixed by Phase 4 displacement texture.

- [ ] **P3** | **S** | **PERF-02: BFS allocations cause GC pressure in LightningEffect**: `bfsInject()` allocates a new `Set` and `Array` per call. With cursor interpolation, up to 10 BFS calls/frame × 60fps = 600 allocations/sec. Each BFS visits ~40 vertices (3 hops, ~6 avg neighbors). Works fine currently but could cause GC hitches on lower-end machines. Fix: replace `Set<number>` with a pre-allocated `Uint8Array(vertexCount)` + generation counter (check `visited[i] === generation` instead of `set.has(i)`; increment generation each call, no clearing needed).

- [ ] **P3** | **S** | **PERF-03: Redundant `triVertexIndices` copy**: `MeshScene.triVertexIndices` is a copy of `this.graph.triangles`. Could use `this.graph.triangles` directly in the animate loop to save ~50-100KB. Trivial fix.

- [ ] **P3** | **S** | **PERF-04: Edge/tri energy GPU buffers not zeroed on final frame**: When `anyActive` goes false, the JS-side edge energy is `.fill(0)` but never uploaded. GPU retains last-frame values (~0.01 energy, effectively invisible). Fix: do one final zero-upload when transitioning from active→inactive (track a `wasActive` flag).

---

## Visual

- [x] **P2** | **L** | **VIS-01: Wave animation looks repetitive**: Fixed by Phase 5 Gerstner waves + domain-warped FBM + time-varying drift.

---

## Tuning

- [ ] **P3** | **S** | **TUNE-01: Camera FOV/position may need adjustment**: Three.js PerspectiveCamera behaves differently from the mockup's custom projection. Foreshortening and mesh coverage may need tuning.

- [ ] **P3** | **S** | **TUNE-02: Distance fade reference value**: The `600.0 / camDist` shader constant may need tuning for the Three.js camera setup.

- [ ] **P3** | **S** | **TUNE-03: Bottom mesh rows may look stretched**: The mockup had perspective-compensated row spacing; the Three.js port uses uniform grid spacing which may cause visual stretching near the camera.

- [ ] **P3** | **S** | **TUNE-04: Chunk size / lazy loading**: Three.js adds ~150KB. Consider lazy-loading the landing page route.

---

## Architecture Notes

- **Cursor path interpolation lives in two places**: Phase 6a interpolates drop positions in `MeshScene.ts` (ring buffer spacing), Phase 6b interpolates BFS injection points in `cursorInteraction.ts` (INTERP_SPACING). Both solve "cursor jumped too far in one frame" for their respective effects. They can't easily share code (different data types and purposes) but a future refactor could extract a shared `interpolateCursorPath(prevX, prevZ, cursorX, cursorZ, spacing)` generator if more cursor effects are added.

---

## Feature Requests

_(Phase-planned features are tracked in IMPLEMENTATION_STATUS.md, not here. This section is for ideas outside the current phase plan.)_
