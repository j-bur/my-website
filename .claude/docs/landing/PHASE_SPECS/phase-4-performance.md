# Phase 4: Performance Optimization -- Displacement Texture

## Goal

Eliminate redundant `heightAt()` computation by rendering the height field to a texture once per frame and sampling it in all vertex shaders. Target: 30-40 FPS (up from ~20 FPS).

## Depends on: None (independent of Phases 1-3, but best done after they're working for clear before/after comparison)

---

## Entry Conditions

- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] Landing page renders correctly (with or without Phases 1-3 features)

## Exit Conditions

- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] FPS measured at 30+ on the dev machine (use a frame counter or `renderer.info`)
- [ ] Mesh animation looks identical to before (no quantization artifacts, no jitter)
- [ ] Height field texture renders correctly (can verify by displaying it in a debug view)
- [ ] All vertex shaders sample from texture instead of computing noise
- [ ] CPU `heightAt()` still works for nav node projection (unaffected by this change)

---

## Tasks

### 1. Create height field render pass in `MeshScene.ts`

- `THREE.WebGLRenderTarget(512, 512, { type: THREE.FloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter })`
  - Fallback to `THREE.HalfFloatType` if float textures unsupported
- Orthographic camera + fullscreen quad scene for the height pass
- Height field fragment shader (`HEIGHT_FRAG_SRC` in `meshConfig.ts`):
  ```glsl
  uniform float uTime;
  uniform vec2 uMapMin;   // world-space min XZ of mesh bounds
  uniform vec2 uMapSize;  // world-space extent XZ
  varying vec2 vUv;

  ${NOISE_GLSL}
  // (same heightAt function as current VERT_SRC)

  void main() {
    vec2 worldXZ = uMapMin + vUv * uMapSize;
    float h = heightAt(worldXZ, uTime);
    gl_FragColor = vec4(h, 0.0, 0.0, 1.0);
  }
  ```

### 2. Modify vertex shaders to sample displacement texture

Replace inline `heightAt()` calls with texture lookups:

```glsl
uniform sampler2D uHeightMap;
uniform vec2 uMapMin;
uniform vec2 uMapSize;

float sampleHeight(vec2 worldXZ) {
  vec2 uv = (worldXZ - uMapMin) / uMapSize;
  return texture2D(uHeightMap, uv).r;
}

void main() {
  vec2 basePos = position.xz;
  float h = sampleHeight(basePos);
  vec3 displaced = vec3(position.x, h, position.z);

  // Finite-difference normals via texture (offset by 1 texel)
  float texelSize = uMapSize.x / 512.0;  // or pass as uniform
  float hx = sampleHeight(basePos + vec2(texelSize, 0.0));
  float hz = sampleHeight(basePos + vec2(0.0, texelSize));
  vec3 normal = normalize(vec3((h - hx) / texelSize, 1.0, (h - hz) / texelSize));
  // ... rest unchanged
}
```

- Remove `NOISE_GLSL` and `heightAt()` from the mesh vertex shaders (they now only exist in the height field fragment shader)
- Apply to all vertex shaders: tri, edge (EDGE_VERT_SRC), point

### 3. Update render loop in `MeshScene.ts`

```typescript
private animate(): void {
  const t = this.clock.getElapsedTime();

  // Pass 1: render height field to texture
  this.heightMaterial.uniforms.uTime.value = t;
  this.renderer.setRenderTarget(this.heightTarget);
  this.renderer.render(this.heightScene, this.heightCamera);
  this.renderer.setRenderTarget(null);

  // Pass 2: render mesh (all 3 objects sample from height texture)
  this.triMat.uniforms.uTime.value = t;
  this.renderer.render(this.scene, this.camera);

  // ... frame callback for nav nodes
}
```

### 4. Additional optimizations (if still below 30 FPS)

- Cap pixel ratio: `Math.min(window.devicePixelRatio, 1.5)` (line 40 of MeshScene.ts)
- Reduce cluster count from 1000 -> 700 in `meshConfig.ts`
- Reduce scatter count from 1050 -> 700
- These reduce vertex count from ~10,650 to ~7,500 with minor visual impact

### 5. Add FPS counter for verification

- Simple frame counter in `animate()`:
  ```typescript
  private frameCount = 0;
  private lastFpsTime = 0;
  // In animate():
  this.frameCount++;
  if (t - this.lastFpsTime >= 2.0) {
    console.log(`FPS: ${(this.frameCount / (t - this.lastFpsTime)).toFixed(1)}`);
    this.frameCount = 0;
    this.lastFpsTime = t;
  }
  ```
- Remove after verification (or gate behind `import.meta.env.DEV`)

### Files to Create

- None

### Files to Modify

- `src/landing/MeshScene.ts` -- height render target, fullscreen quad, modified render loop, uniforms
- `src/landing/meshConfig.ts` -- add `HEIGHT_FRAG_SRC`, modify `VERT_SRC`/`EDGE_VERT_SRC` to sample texture, remove inline noise from mesh vertex shaders

---

## Out of Scope

- DO NOT change the wave equation itself (Phase 5)
- DO NOT implement WebGL2-specific optimizations (stay WebGL1-compatible)
- DO NOT add LOD or dynamic mesh resolution

## Key References

- `src/landing/meshConfig.ts` lines 56-131 (NOISE_GLSL + heightAt)
- `src/landing/MeshScene.ts` lines 31-63 (renderer, materials, render loop)
- Three.js `WebGLRenderTarget` docs
