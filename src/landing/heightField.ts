/**
 * CPU-side height function matching the GPU vertex shader.
 * Ported from the GLSL in meshConfig.ts (Ashima Arts / Stefan Gustavson simplex noise, MIT).
 */

// --- Simplex noise helpers (scalar operations applied to 3/4-element tuples) ---

function mod289(x: number): number {
  return x - Math.floor(x * (1.0 / 289.0)) * 289.0;
}

function permute(x: number): number {
  return mod289(((x * 34.0) + 10.0) * x);
}

function taylorInvSqrt(r: number): number {
  return 1.79284291400159 - 0.85373472095314 * r;
}

/** 3D simplex noise — exact port of the GLSL snoise(vec3). */
export function snoise(v: [number, number, number]): number {
  // C = (1/6, 1/3), D = (0, 0.5, 1, 2)
  const C0 = 1.0 / 6.0;
  const C1 = 1.0 / 3.0;

  // Skew input space to determine which simplex cell we're in
  const s = (v[0] + v[1] + v[2]) * C1;
  const ix = Math.floor(v[0] + s);
  const iy = Math.floor(v[1] + s);
  const iz = Math.floor(v[2] + s);

  const t = (ix + iy + iz) * C0;
  const x0_0 = v[0] - ix + t;
  const x0_1 = v[1] - iy + t;
  const x0_2 = v[2] - iz + t;

  // Determine simplex traversal order
  const g0 = x0_1 <= x0_0 ? 1.0 : 0.0; // step(x0.yzx, x0.xyz)
  const g1 = x0_2 <= x0_1 ? 1.0 : 0.0;
  const g2 = x0_0 <= x0_2 ? 1.0 : 0.0;
  const l0 = 1.0 - g0;
  const l1 = 1.0 - g1;
  const l2 = 1.0 - g2;

  // i1 = min(g.xyz, l.zxy)
  const i1_0 = Math.min(g0, l2);
  const i1_1 = Math.min(g1, l0);
  const i1_2 = Math.min(g2, l1);

  // i2 = max(g.xyz, l.zxy)
  const i2_0 = Math.max(g0, l2);
  const i2_1 = Math.max(g1, l0);
  const i2_2 = Math.max(g2, l1);

  // Offsets for corners
  const x1_0 = x0_0 - i1_0 + C0;
  const x1_1 = x0_1 - i1_1 + C0;
  const x1_2 = x0_2 - i1_2 + C0;

  const x2_0 = x0_0 - i2_0 + C1;
  const x2_1 = x0_1 - i2_1 + C1;
  const x2_2 = x0_2 - i2_2 + C1;

  const x3_0 = x0_0 - 0.5;
  const x3_1 = x0_1 - 0.5;
  const x3_2 = x0_2 - 0.5;

  // Wrap cell coordinates for permutation
  const ii = mod289(ix);
  const jj = mod289(iy);
  const kk = mod289(iz);

  // Permutation for each simplex corner
  const p0 = permute(permute(permute(kk) + jj) + ii);
  const p1 = permute(permute(permute(kk + i1_2) + jj + i1_1) + ii + i1_0);
  const p2 = permute(permute(permute(kk + i2_2) + jj + i2_1) + ii + i2_0);
  const p3 = permute(permute(permute(kk + 1.0) + jj + 1.0) + ii + 1.0);

  // Gradient computation
  const n_ = 0.142857142857;
  // ns = n_ * D.wyz - D.xzx = n_ * (2, 0.5, 1) - (0, 1, 0)
  const ns_x = n_ * 2.0;       // 0.285714285714
  const ns_y = n_ * 0.5 - 1.0; // -0.928571428571
  const ns_z = n_ * 1.0;       // 0.142857142857

  function computeGradient(pv: number): [number, number, number] {
    const j = pv - 49.0 * Math.floor(pv * ns_z * ns_z);
    const xv = Math.floor(j * ns_z);
    const yv = Math.floor(j - 7.0 * xv);
    let gx = xv * ns_x + ns_y;
    let gy = yv * ns_x + ns_y;
    const h = 1.0 - Math.abs(gx) - Math.abs(gy);

    // b = vec4(x.xy, y.xy) → for single: bx=gx, by=gy
    // s = floor(b)*2+1
    const sx = Math.floor(gx) * 2.0 + 1.0;
    const sy = Math.floor(gy) * 2.0 + 1.0;
    // sh = -step(h, 0) → -1 if h<=0, else 0
    const sh = h <= 0.0 ? -1.0 : 0.0;
    // a = b.xzyw + s.xzyw * sh.xxyy → for single: gx += sx*sh, gy += sy*sh
    gx += sx * sh;
    gy += sy * sh;

    // Normalize
    const inv = taylorInvSqrt(gx * gx + gy * gy + h * h);
    return [gx * inv, gy * inv, h * inv];
  }

  const grad0 = computeGradient(p0);
  const grad1 = computeGradient(p1);
  const grad2 = computeGradient(p2);
  const grad3 = computeGradient(p3);

  // Kernel falloff: m = max(0.6 - dot(x, x), 0)^4
  const dot0 = x0_0 * x0_0 + x0_1 * x0_1 + x0_2 * x0_2;
  const dot1 = x1_0 * x1_0 + x1_1 * x1_1 + x1_2 * x1_2;
  const dot2 = x2_0 * x2_0 + x2_1 * x2_1 + x2_2 * x2_2;
  const dot3 = x3_0 * x3_0 + x3_1 * x3_1 + x3_2 * x3_2;

  let m0 = Math.max(0.6 - dot0, 0.0); m0 = m0 * m0 * m0 * m0;
  let m1 = Math.max(0.6 - dot1, 0.0); m1 = m1 * m1 * m1 * m1;
  let m2 = Math.max(0.6 - dot2, 0.0); m2 = m2 * m2 * m2 * m2;
  let m3 = Math.max(0.6 - dot3, 0.0); m3 = m3 * m3 * m3 * m3;

  // Gradient dot products
  const gdot0 = grad0[0] * x0_0 + grad0[1] * x0_1 + grad0[2] * x0_2;
  const gdot1 = grad1[0] * x1_0 + grad1[1] * x1_1 + grad1[2] * x1_2;
  const gdot2 = grad2[0] * x2_0 + grad2[1] * x2_1 + grad2[2] * x2_2;
  const gdot3 = grad3[0] * x3_0 + grad3[1] * x3_1 + grad3[2] * x3_2;

  return 42.0 * (m0 * gdot0 + m1 * gdot1 + m2 * gdot2 + m3 * gdot3);
}

/**
 * Compute the height (Y displacement) at a given XZ position and time.
 * Mirrors the GLSL heightAt() in meshConfig.ts exactly:
 * 6 directional sine waves + 3 simplex noise octaves.
 */
export function heightAt(x: number, z: number, t: number): number {
  let h = 0.0;

  // Large storm swells (6 traveling sine waves)
  h += Math.sin(x * 0.0030 + z * 0.0008 + t * 0.50) * 45.0;
  h += Math.sin(x * -0.0022 + z * 0.0018 + t * 0.65) * 35.0;
  h += Math.sin(x * 0.0012 + z * -0.0030 + t * 0.40) * 25.0;
  h += Math.sin(x * 0.0050 + z * -0.0010 + t * 0.80) * 18.0;
  h += Math.sin(x * -0.0015 + z * -0.0045 + t * 0.55) * 15.0;
  h += Math.sin(x * -0.0035 + z * -0.0105 + t * 0.30) * 17.0;

  // Choppy noise octaves
  h += snoise([x * 0.005, z * 0.005, t * 0.25]) * 30.0;
  h += snoise([x * 0.012, z * 0.012, t * 0.30 + 50.0]) * 18.0;
  h += snoise([x * 0.025, z * 0.025, t * 0.20 + 100.0]) * 10.0;

  return h;
}
