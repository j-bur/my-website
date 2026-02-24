# Phase 5: Improved Wave Simulation

## Goal

Replace the current wave model (fixed sine waves + noise octaves that create a repeating pattern) with Gerstner waves + domain-warped FBM + time-varying parameters. Waves should look like storm ocean waves traveling through a medium -- random, turbulent, never obviously repeating.

## Depends on: Phase 4 (displacement texture -- changes go in the height field shader, single place to update)

---

## Entry Conditions

- [ ] Phase 4 exit conditions met
- [ ] Height field is rendered via displacement texture
- [ ] `heightAt()` in the height field fragment shader is the single source of wave computation

## Exit Conditions

- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] Waves visually appear to travel across the surface (not fixed regions bobbing)
- [ ] No obvious repeating cycle when watching for 30+ seconds
- [ ] Wave crests are sharper than troughs (Gerstner characteristic)
- [ ] Turbulence detail is organic and non-repeating (domain warping)
- [ ] FPS remains at 30+ (Gerstner waves are computationally similar to sine waves)
- [ ] CPU `heightAt()` in `heightField.ts` updated to match (for nav node projection)

---

## Tasks

### 1. Implement Gerstner waves in `HEIGHT_FRAG_SRC`

Replace the 6 `sin(dot(p, dir) + t * speed) * amplitude` calls with Gerstner waves:

```glsl
// Returns vec3(dx, dy, dz) -- displaces XZ too for realistic wave shapes
vec3 gerstnerWave(vec2 p, vec2 dir, float freq, float amp, float speed, float steep, float t) {
  float phase = dot(p, dir) * freq + t * speed;
  float s = sin(phase);
  float c = cos(phase);
  return vec3(
    -dir.x * amp * steep * c,
    amp * s,
    -dir.y * amp * steep * c
  );
}
```

- 6 Gerstner waves with `steep` values of 0.3-0.6
- Since the displacement texture only stores Y displacement, the XZ displacement from Gerstner will subtly offset the UV lookup for normals, creating the crest/trough asymmetry
- Alternative: store XZ displacement in G and B channels of the texture (vec3 displacement per texel)

### 2. Add domain-warped FBM

Replace the 3 simple noise octaves with warped-coordinate noise:

```glsl
// Warp input coordinates with noise for organic patterns
vec2 warp = vec2(
  snoise(vec3(p * 0.003, t * 0.1)) * 80.0,
  snoise(vec3(p * 0.003 + 100.0, t * 0.1)) * 80.0
);
vec2 wp = p + warp;
z += snoise(vec3(wp * 0.005, t * 0.25)) * 30.0;
z += snoise(vec3(wp * 0.012, t * 0.30 + 50.0)) * 18.0;
z += snoise(vec3(wp * 0.025, t * 0.20 + 100.0)) * 10.0;
```

- Domain warping adds 2 extra noise evaluations per texel but creates drastically more organic patterns
- The `* 80.0` warp magnitude and `0.003` warp frequency are starting values -- tune visually

### 3. Add time-varying wave parameters

Prevent obvious cycle repetition:

```glsl
// Slowly rotate wave directions (full rotation over ~5 minutes)
float driftAngle = t * 0.02;
mat2 drift = mat2(cos(driftAngle), -sin(driftAngle), sin(driftAngle), cos(driftAngle));

// Apply drift to some wave directions
vec2 dir1 = drift * vec2(0.0030, 0.0008);
// ...

// Modulate amplitudes slowly
float ampMod = 0.8 + 0.2 * sin(t * 0.05);
```

### 4. Update CPU `heightField.ts` to match

- Mirror all shader changes in the TypeScript `heightAt()` function
- Add `gerstnerWave()` TypeScript function
- Add domain warping logic
- Add time-varying parameter drift
- This is only used for ~2-5 nav node projections per frame, so the added complexity has no perf impact

### 5. Tune visually

- Serve on localhost (NOT file://)
- Watch for 60+ seconds to verify no obvious cycle
- Adjust parameters: wave speeds, amplitudes, steep values, warp magnitude, drift rate
- Verify that wave crests catch light convincingly (directional lighting still works via finite-difference normals from texture)

### Files to Create

- None

### Files to Modify

- `src/landing/meshConfig.ts` -- rewrite `heightAt()` in `HEIGHT_FRAG_SRC` with Gerstner + warped FBM
- `src/landing/heightField.ts` -- update CPU mirror to match

---

## Out of Scope

- DO NOT implement fluid dynamics simulation (Navier-Stokes, etc.)
- DO NOT add weather/wind system
- DO NOT modify lighting or camera
- DO NOT store full vec3 displacement in texture unless Y-only Gerstner proves insufficient

## Key References

- GPU Gems Chapter 1: "Effective Water Simulation from Physical Models" (Gerstner wave reference)
- Current `heightAt()` in `meshConfig.ts` lines 117-131
- `heightField.ts` -- CPU mirror
