# Phase 3: Cursor-to-Node Connection + Click Navigation

## Goal

Draw a solid accent-colored (#00d4aa) line from cursor to the nearest nav node when within range. Left-click navigates. Wire hover state to Phase 2's path highlighting. This completes the interactive navigation system.

## Depends on: Phases 1, 2

---

## Entry Conditions

- [ ] Phase 2 exit conditions met
- [ ] `highlightPath()` works correctly
- [ ] Nav nodes have projected screen positions via frame callback

## Exit Conditions

- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] Moving cursor within ~150px of a nav node draws a solid teal line from cursor to the node
- [ ] Line sits on the wave surface (both endpoints displaced by heightAt)
- [ ] Path from hub to hovered node highlights in accent color
- [ ] Moving cursor away clears line and path highlight
- [ ] Left-clicking while a node is hovered navigates (external -> new tab, internal -> hash router)
- [ ] Cursor shows `pointer` when a node is hovered
- [ ] Clicking canvas with no node nearby does nothing

---

## Tasks

### 1. Add mouse tracking to `MeshScene.ts`

- `setMouseScreenPos(screenX: number, screenY: number)`:
  - Convert to NDC: `ndcX = (screenX / canvasWidth) * 2 - 1`, `ndcY = -(screenY / canvasHeight) * 2 + 1`
  - Use `THREE.Raycaster` + `THREE.Plane(new Vector3(0, 1, 0), 0)` to find world XZ intersection
  - Store as `this.mouseWorldXZ: { x: number, z: number } | null`

- `getHoveredNode(): PlacedNavNode | null`:
  - In `animate()` (or on mouse move), compare cursor screen position to each nav node's projected screen position
  - Return nearest within 150px threshold, or `null`
  - On hover state change: call `this.highlightPath(node?.vertexIndex ?? null)`

### 2. Cursor-to-node line geometry

- Create `THREE.BufferGeometry` with 2 vertices, `THREE.Line` with `THREE.LineBasicMaterial({ color: 0x00d4aa, transparent: true, opacity: 0.6, linewidth: 1 })`
- Each frame when `hoveredNode` is set:
  1. Compute nav node's 3D: `(baseX, heightAt(baseX, baseZ, t), baseZ)`
  2. Compute cursor's 3D: `(mouseWorldX, heightAt(mouseWorldX, mouseWorldZ, t), mouseWorldZ)`
  3. Update line geometry's position buffer, mark `needsUpdate = true`
  4. Ensure line is added to scene
- When no hover: remove line from scene (or set `visible = false`)

### 3. Wire mouse events in `LandingPage.tsx`

- Add `mousemove` handler on the canvas container:
  ```typescript
  const rect = canvas.getBoundingClientRect();
  scene.setMouseScreenPos(e.clientX - rect.left, e.clientY - rect.top);
  ```
- Add `click` handler:
  ```typescript
  const hovered = scene.getHoveredNode();
  if (hovered) {
    if (hovered.external) {
      window.open(hovered.url, '_blank', 'noopener,noreferrer');
    } else {
      navigate(hovered.url);
    }
  }
  ```
- Import `useNavigate` from `react-router-dom`
- Set cursor style: `canvas.style.cursor = scene.getHoveredNode() ? 'pointer' : 'default'`
  - Update in the frame callback or on mousemove

### 4. Label visibility tied to hover

- Nav node labels (from Phase 1) are always visible (small uppercase text)
- Add subtle brightness increase when hovered
- The label for the hovered node gets a CSS class like `anchor-hovered` with a text-shadow glow

### Files to Create

- None (all logic in existing files)

### Files to Modify

- `src/landing/MeshScene.ts` -- mouse tracking, raycasting, cursor line geometry, hover detection
- `src/landing/LandingPage.tsx` -- mousemove/click event handlers, cursor style, navigate import

---

## Out of Scope

- DO NOT implement strumming/ripple effects (Phase 6)
- DO NOT modify wave simulation
- DO NOT modify edge/triangle/point shaders (only add line geometry)

## Key References

- `src/landing/navNodes.ts` -- `PlacedNavNode`, `projectNavNodes`
- `src/landing/heightField.ts` -- `heightAt` for line endpoint displacement
- `src/landing/MeshScene.ts` -- frame callback, `highlightPath()`
