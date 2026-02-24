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

- [ ] **P1** | **L** | **PERF-01: ~20 FPS on mid-range gaming PC**: The landing page runs at approximately 20 FPS. Root cause: `heightAt()` evaluated 9x per vertex per frame (3 calls per vertex x 3 draw calls). Planned fix: Phase 4 displacement texture.

---

## Visual

- [ ] **P2** | **L** | **VIS-01: Wave animation looks repetitive**: After 1-2 cycles, the wave pattern is recognizably periodic — fixed regions bob up and down. Planned fix: Phase 5 Gerstner waves + domain-warped FBM.

---

## Tuning

- [ ] **P3** | **S** | **TUNE-01: Camera FOV/position may need adjustment**: Three.js PerspectiveCamera behaves differently from the mockup's custom projection. Foreshortening and mesh coverage may need tuning.

- [ ] **P3** | **S** | **TUNE-02: Distance fade reference value**: The `600.0 / camDist` shader constant may need tuning for the Three.js camera setup.

- [ ] **P3** | **S** | **TUNE-03: Bottom mesh rows may look stretched**: The mockup had perspective-compensated row spacing; the Three.js port uses uniform grid spacing which may cause visual stretching near the camera.

- [ ] **P3** | **S** | **TUNE-04: Chunk size / lazy loading**: Three.js adds ~150KB. Consider lazy-loading the landing page route.

---

## Feature Requests

_(Phase-planned features are tracked in IMPLEMENTATION_STATUS.md, not here. This section is for ideas outside the current phase plan.)_
