# Phase 6a: Cursor Shader Ripple

## Goal

Add a shader-based radial ripple effect around the cursor position. Waves emanate from the cursor as it moves, creating a "strumming" interaction with the mesh surface.

## Depends on: Phase 3 (cursor world position tracking)

---

## Entry Conditions

- [ ] Phase 3 exit conditions met
- [ ] Cursor world XZ position is tracked in `MeshScene.ts`
- [ ] Mouse events are wired in `LandingPage.tsx`

## Exit Conditions

- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] Moving the cursor over the mesh creates visible radial ripples
- [ ] Ripple intensity scales with cursor speed (slow movement -> subtle, fast -> dramatic)
- [ ] Ripple decays with distance from cursor (not visible beyond ~200-300 world units)
- [ ] Effect looks like "strumming" the surface, not just a bump
- [ ] FPS not significantly impacted (ripple computation is simple math)

---

## Tasks

### 1. Track cursor velocity in `MeshScene.ts`

- Store previous frame's mouse world XZ position
- Compute velocity magnitude each frame: `speed = length(currentXZ - prevXZ) / deltaTime`
- Clamp and smooth: `this.cursorSpeed = lerp(this.cursorSpeed, rawSpeed, 0.1)` (avoids jitter)

### 2. Add cursor uniforms to all materials

```typescript
// Shared uniforms added to all 3 (or 4) materials:
uCursorXZ: { value: new THREE.Vector2(0, 0) },
uCursorSpeed: { value: 0.0 },
uCursorActive: { value: 0.0 },  // 1.0 when mouse is over canvas, 0.0 when outside
```

Update each frame in `animate()`:
```typescript
for (const mat of [this.triMat, this.edgeMat, this.pointMat]) {
  mat.uniforms.uCursorXZ.value.set(mouseWorldX, mouseWorldZ);
  mat.uniforms.uCursorSpeed.value = this.cursorSpeed;
  mat.uniforms.uCursorActive.value = this.mouseOnCanvas ? 1.0 : 0.0;
}
```

### 3. Add ripple displacement to vertex shaders

After the height field displacement, add cursor ripple:

```glsl
uniform vec2 uCursorXZ;
uniform float uCursorSpeed;
uniform float uCursorActive;

// In main(), after displaced.y = h:
float cursorDist = length(basePos - uCursorXZ);
float rippleRadius = 300.0;
float rippleFalloff = exp(-cursorDist * cursorDist / (rippleRadius * rippleRadius));
float ripple = uCursorActive * min(uCursorSpeed * 0.3, 15.0) * rippleFalloff
             * sin(cursorDist * 0.08 - uTime * 8.0);
displaced.y += ripple;
```

- `rippleRadius`: 300 world units (~15% of mesh width)
- Gaussian falloff (smooth, no hard cutoff)
- Amplitude scales with cursor speed, capped at 15 units
- Radial sine pattern traveling outward (`cursorDist * 0.08 - uTime * 8.0`)

### 4. Handle cursor enter/leave

- Add `mouseenter` / `mouseleave` handlers on canvas in `LandingPage.tsx`
- Set `scene.setCursorActive(true/false)` -> sets `uCursorActive` uniform
- When cursor leaves, ripple smoothly fades (via the speed smoothing going to 0)

### Files to Create

- None

### Files to Modify

- `src/landing/MeshScene.ts` -- velocity tracking, cursor uniforms, active state
- `src/landing/meshConfig.ts` -- add cursor uniforms and ripple logic to all vertex shaders
- `src/landing/LandingPage.tsx` -- mouseenter/mouseleave handlers

---

## Out of Scope

- DO NOT implement graph-based lightning (Phase 6b)
- DO NOT modify the displacement texture pass (ripple is added in vertex shaders on top of sampled height)

## Key References

- `src/landing/MeshScene.ts` -- `setMouseScreenPos()`, raycasting from Phase 3
- `src/landing/meshConfig.ts` -- vertex shader structure
