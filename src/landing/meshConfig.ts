// Landing page mesh configuration — constants ported from source/landing-mockup.html

// --- Grid & mesh generation ---
export const COLS = 44;
export const ROWS = 32;
export const JITTER = 0.85;
export const OVERSCAN = 60;
export const OVERSCAN_FAR = 100;
export const SCATTER_COUNT = 1050;
export const CLUSTER_COUNT = 1000;
export const MAX_EDGE_LENGTH = 150; // Cull convex hull edges longer than this

// --- World-space mesh dimensions ---
export const MESH_WIDTH = 2000;
export const MESH_DEPTH = 1200;
export const HEIGHTMAP_RESOLUTION = 512;
export const FRACTAL_RESOLUTION = 512 / 4;

// --- Camera ---
export const TILT_DEG = 35;
export const CAMERA_FOV = 70;
// Camera positioned above the near edge, looking toward the far edge
// Height/distance ratio ≈ tan(35°) for the desired tilt angle
export const CAMERA_HEIGHT = 500;
export const CAMERA_Z = 700;
export const CAMERA_LOOK_AT_Z = -100;

// --- Horizon curvature (parabolic drop-off, like Earth's surface) ---
export const MESH_CURVATURE = 0.000005; // Y drop = curvature * dist²

// --- Alpha ranges for the three render passes ---
export const TRI_ALPHA = { min: 0.0, range: 0.6 };
export const EDGE_ALPHA = { min: 0.01, range: 0.12 };
export const POINT_ALPHA = { min: 0.02, range: 0.95 };
export const POINT_SIZE = 1.5;

// --- World-space boundary fade (dissolves mesh edges so it feels infinite) ---
// Fraction of half-extent from each edge where fade reaches full opacity.
// 0.35 means the outer 35% of each axis gradually fades to transparent.
export const BOUNDARY_FADE = 0.35;

// --- Per-face palette: full Siphon colors (alpha constrains intensity) ---
export const FACE_PALETTE: [number, number, number][] = [
  [0.00, 0.83, 0.67],  // EP Positive  #00d4aa
  [1.00, 0.27, 0.40],  // EP Negative  #ff4466
  [0.48, 0.26, 0.88],  // Focus        #7a42e0
  [0.82, 0.10, 0.82],  // Warp         #d119d1
  [1.00, 0.73, 0.20],  // Capacitance  #ffbb33
];

// --- Navigation nodes ---
export interface NavNodeDef {
  label: string;
  url: string;
  external: boolean;
  /** Multiplier for hover detection radius (default 1). */
  hoverRadiusMultiplier?: number;
  /** Lower priority = loses to higher-priority nodes within range (default 0). */
  hoverPriority?: number;
}

export const NAV_NODES: NavNodeDef[] = [
  { label: 'You', url: '', external: false },
  { label: 'FoundryVTT', url: 'https://foundry.jamesburns.cc', external: true, hoverRadiusMultiplier: 2, hoverPriority: -1 },
  { label: 'Gauldurg', url: '/#/deck-builder', external: false },
];

export const HUB_NODE_INDEX = 0; // 'You' is the hub (non-navigable anchor)

export const NAV_PLACEMENT = {
  minHops: 8,
  maxHops: 25,
  minAngularSpread: Math.PI / 3, // 60 degrees minimum between non-hub nodes
  screenMarginNDC: 0.85, // reject candidates beyond ±this in NDC X (keeps nodes on-screen)
};

// --- Staged reveal (Phase 7) ---
export const REVEAL = {
  pointDuration: 4.0,     // seconds for full point reveal
  edgeTriDelay: 1.0,      // seconds before edges/triangles start
  edgeTriDuration: 3.0,   // seconds for edge/tri reveal (ends at same time as points)
  exponent: 3.0,          // exponential ramp factor (higher = slower start, faster finish)
  smoothWidth: 2.0,       // hop-distance width of the fade zone
};

// --- GLSL Simplex Noise (Ashima Arts / Stefan Gustavson, MIT) ---
const NOISE_GLSL = /* glsl */ `
vec3 mod289v3(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289v4(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289v4(((x*34.0)+10.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289v3(i);
  vec4 p=permute(permute(permute(
    i.z+vec4(0.0,i1.z,i2.z,1.0))
    +i.y+vec4(0.0,i1.y,i2.y,1.0))
    +i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;

// --- GLSL heightAt function (used only by the height field fragment shader) ---
// Phase 5: Gerstner waves + domain-warped FBM + time-varying parameters
const HEIGHT_AT_GLSL = /* glsl */ `
float gerstnerY(float phase, float amp, float steep) {
  float s = sin(phase);
  // Power curve: broader troughs, sharper crests (Gerstner characteristic)
  // steep=0 → pure sine, steep=0.3-0.6 → progressively sharper crests
  float v = pow((s + 1.0) * 0.5, 1.0 + steep) * 2.0 - 1.0;
  return amp * v;
}

float heightAt(vec2 p, float t) {
  float z = 0.0;

  // Time-varying drift: slowly rotate wave directions (~5 min full rotation)
  float driftAngle = t * 0.02;
  float cd = cos(driftAngle);
  float sd = sin(driftAngle);

  // Amplitude modulation (prevents obvious repetition)
  float ampMod1 = 0.85 + 0.15 * sin(t * 0.05);
  float ampMod2 = 0.85 + 0.15 * sin(t * 0.037 + 2.0);

  // 6 Gerstner waves — drift applied to alternating waves (1, 3, 5)
  vec2 d1 = vec2(cd * 0.0030 - sd * 0.0008, sd * 0.0030 + cd * 0.0008);
  vec2 d2 = vec2(-0.0022, 0.0018);
  vec2 d3 = vec2(cd * 0.0012 + sd * 0.0030, sd * 0.0012 - cd * 0.0030);
  vec2 d4 = vec2(0.0050, -0.0010);
  vec2 d5 = vec2(-cd * 0.0015 + sd * 0.0045, -sd * 0.0015 - cd * 0.0045);
  vec2 d6 = vec2(-0.0035, -0.0105);

  z += gerstnerY(dot(p, d1) + t * 0.50, 45.0 * ampMod1, 0.4);
  z += gerstnerY(dot(p, d2) + t * 0.65, 35.0, 0.35);
  z += gerstnerY(dot(p, d3) + t * 0.40, 25.0 * ampMod2, 0.5);
  z += gerstnerY(dot(p, d4) + t * 0.80, 18.0, 0.45);
  z += gerstnerY(dot(p, d5) + t * 0.55, 15.0 * ampMod1, 0.3);
  z += gerstnerY(dot(p, d6) + t * 0.30, 17.0, 0.55);

  // Domain-warped FBM (organic, non-repeating turbulence)
  vec2 warp = vec2(
    snoise(vec3(p * 0.003, t * 0.1)) * 80.0,
    snoise(vec3(p * 0.003 + 100.0, t * 0.1)) * 80.0
  );
  vec2 wp = p + warp;

  z += snoise(vec3(wp * 0.005, t * 0.25)) * 30.0;
  z += snoise(vec3(wp * 0.012, t * 0.30 + 50.0)) * 18.0;
  z += snoise(vec3(wp * 0.025, t * 0.20 + 100.0)) * 10.0;

  return z;
}
`;

// --- Height field vertex shader (fullscreen quad passthrough) ---
export const HEIGHT_VERT_SRC = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// --- Height field fragment shader (renders height to texture) ---
export const HEIGHT_FRAG_SRC = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uMapMin;
uniform vec2 uMapSize;
varying vec2 vUv;

${NOISE_GLSL}
${HEIGHT_AT_GLSL}

void main() {
  vec2 worldXZ = uMapMin + vUv * uMapSize;
  float h = heightAt(worldXZ, uTime);
  gl_FragColor = vec4(h, 0.0, 0.0, 1.0);
}
`;

// --- Shared vertex shader body: uniforms, displacement texture sampling, lighting, alpha ---
// Everything through the alpha calculation. Composed into VERT_SRC and POINT_VERT_SRC
// with different endings. When Phase 5 rewrites the wave simulation, only the
// HEIGHT_FRAG_SRC heightAt function needs to change.
const VERT_COMMON = /* glsl */ `
uniform float uTime;
uniform float uAlphaMin;
uniform float uAlphaRange;
uniform float uPointSize;
uniform sampler2D uHeightMap;
uniform vec2 uMapMin;
uniform vec2 uMapSize;
uniform vec4 uDrops[64]; // xy = worldXZ, z = spawnTime, w = amplitude
uniform float uRevealThreshold;
attribute float aHopDist;
varying float vAlpha;
varying vec3 vColor;
varying vec2 vWorldUV;

float sampleHeight(vec2 worldXZ) {
  vec2 uv = (worldXZ - uMapMin) / uMapSize;
  return texture2D(uHeightMap, uv).r;
}

void main() {
  vec2 basePos = position.xz;
  vWorldUV = (basePos - uMapMin) / uMapSize;

  // Displace Y by height field (sampled from displacement texture)
  float h = sampleHeight(basePos);
  vec3 displaced = vec3(position.x, h, position.z);

  // Cursor wake: propagating ripples from cursor trail
  float wakeSum = 0.0;
  for (int i = 0; i < 64; i++) {
    vec4 drop = uDrops[i];
    if (drop.w <= 0.0) continue;
    float age = uTime - drop.z;
    if (age < 0.0 || age > 1.5) continue;
    float dist = length(basePos - drop.xy);
    float wavefront = age * 100.0;
    float ringWidth = 25.0 + age * 10.0;
    float ringDelta = dist - wavefront;
    float envelope = exp(-ringDelta * ringDelta / (ringWidth * ringWidth));
    float decay = max(1.0 - age * 0.95, 0.0);
    wakeSum += drop.w * envelope * decay * sin(dist * 0.1 - age * 10.0);
  }
  displaced.y -= wakeSum;

  // Surface normal via finite differences (1 texel offset)
  vec2 texelSize = uMapSize / ${HEIGHTMAP_RESOLUTION}.0;
  float hx = sampleHeight(basePos + vec2(texelSize.x, 0.0));
  float hz = sampleHeight(basePos + vec2(0.0, texelSize.y));
  vec3 normal = normalize(vec3((h - hx) / texelSize.x, 1.0, (h - hz) / texelSize.y));

  // Directional light from upper-left (Y-up coordinate system)
  vec3 lightDir = normalize(vec3(-0.4, 0.8, -0.3));
  float lighting = max(dot(normal, lightDir), 0.0);

  // Earth-like curvature: mesh curves downward with distance from viewer
  float cDist = length(basePos - vec2(0.0, ${CAMERA_Z}.0));
  displaced.y -= ${MESH_CURVATURE} * cDist * cDist;

  // Three.js projection
  vec4 mvPos = modelViewMatrix * vec4(displaced, 1.0);
  gl_Position = projectionMatrix * mvPos;

  // Distance fade based on camera distance
  float camDist = -mvPos.z;
  float distFade = clamp(600.0 / camDist, 0.22, 1.0);

  // Per-vertex random brightness
  float hash = fract(sin(dot(floor(basePos), vec2(12.9898, 78.233))) * 43758.5453);
  float vertBright = 0.5 + hash * 0.5;

  // Final alpha from lighting + distance + vertex variation
  float alpha = (0.04 + lighting * 0.8) * distFade * vertBright;

  // Default face color (white); overridden by aColor in the triangle pass
  vColor = vec3(1.0);

  // World-space boundary fade: dissolve mesh edges so it feels infinite
  // Uses max of per-axis distance (rounded-square falloff) so corners aren't doubly faded
  vec2 normPos = (basePos - uMapMin) / uMapSize;
  vec2 fromCenter = abs(normPos - 0.5) * 2.0; // 0 at center, 1 at edge
  float edgeDist = max(fromCenter.x, fromCenter.y);
  float boundaryFade = 1.0 - smoothstep(1.0 - ${BOUNDARY_FADE.toFixed(2)} * 2.0, 1.0, edgeDist);

  // Phase 7: staged reveal — per-vertex fade based on BFS hop distance
  float revealFade = smoothstep(aHopDist - ${REVEAL.smoothWidth.toFixed(1)}, aHopDist, uRevealThreshold);
`;

// --- Standard vertex shader (tri pass) + lightning facet brightening ---
export const VERT_SRC = /* glsl */ `
attribute vec3 aColor;
attribute float aEnergy;
${VERT_COMMON}
  vColor = aColor;
  // Gentler distance fade for colored faces — stays visible further into the mesh
  float triFade = clamp(1500.0 / camDist, 0.45, 1.0);
  alpha = (0.04 + lighting * 0.8) * triFade * vertBright;
  gl_PointSize = uPointSize + alpha * 4.0;
  vAlpha = uAlphaMin + alpha * uAlphaRange;
  if (aEnergy > 0.01) {
    // Brighten and saturate facets near lightning
    vColor = mix(vColor, vColor * 1.8, aEnergy);
    vAlpha = max(vAlpha, aEnergy * 0.25);
  }
  vAlpha *= revealFade * boundaryFade;
}
`;

// --- Point vertex shader: adds nav node highlighting + lightning energy ---
export const POINT_VERT_SRC = /* glsl */ `
attribute float aIsNavNode;
attribute float aEnergy;
${VERT_COMMON}
  if (aIsNavNode > 0.5) {
    float pulse = 0.85 + 0.15 * sin(uTime * 2.0);
    gl_PointSize = uPointSize + 6.0;
    vAlpha = 0.9 * pulse;
  } else {
    gl_PointSize = uPointSize + alpha * 4.0;
    vAlpha = uAlphaMin + alpha * uAlphaRange;
  }
  if (aEnergy > 0.01) {
    gl_PointSize += aEnergy * 4.0;
    vAlpha = max(vAlpha, aEnergy * 0.5);
  }
  vAlpha *= revealFade * boundaryFade;
}
`;

// --- Edge vertex shader: adds path highlight + lightning energy ---
export const EDGE_VERT_SRC = /* glsl */ `
attribute float aHighlight;
attribute float aEnergy;
${VERT_COMMON}
  if (aHighlight > 0.5) {
    vColor = vec3(0.0, 0.83, 0.67); // EP Positive (#00d4aa)
    vAlpha = 0.8;
  } else {
    vColor = vec3(1.0);
    vAlpha = uAlphaMin + alpha * uAlphaRange;
  }
  if (aEnergy > 0.01) {
    vColor = mix(vColor, vec3(0.6, 0.9, 1.0), aEnergy * 0.6); // light blue-white lightning
    vAlpha = max(vAlpha, aEnergy * 0.5);
  }
  vAlpha *= revealFade * boundaryFade;
}
`;

// --- Edge fragment shader: uses vColor (white, highlight, or lightning) ---
export const EDGE_FRAG_SRC = /* glsl */ `
precision mediump float;
varying float vAlpha;
varying vec3 vColor;
void main() {
  gl_FragColor = vec4(vColor, vAlpha);
}
`;

// --- Point fragment shader: uses vColor (white or nav node) ---
export const POINT_FRAG_SRC = /* glsl */ `
precision mediump float;
varying float vAlpha;
varying vec3 vColor;
void main() {
  gl_FragColor = vec4(vColor, vAlpha);
}
`;

// --- Triangle fragment shader: samples fractal texture for fill color ---
export const FRAG_SRC = /* glsl */ `
precision mediump float;
uniform sampler2D uFractalMap;
varying float vAlpha;
varying vec3 vColor;
varying vec2 vWorldUV;
void main() {
  vec3 fractal = texture2D(uFractalMap, vWorldUV).rgb;
  gl_FragColor = vec4(fractal, vAlpha);
}
`;

// --- Fractal color texture (kaleidoscopic IFS, rendered to offscreen target) ---

export const FRACTAL_VERT_SRC = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const FRACTAL_FRAG_SRC = /* glsl */ `
precision highp float;
uniform float uTime;
varying vec2 vUv;

#define NUM_LAYERS 8.5

mat2 Rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

float Star(vec2 uv, float flare) {
  float d = length(uv);
  float m = 0.02 / d;

  float rays = max(0.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * flare;
  uv *= Rot(3.1415 / 4.0);
  rays = max(0.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * 0.3 * flare;

  m *= smoothstep(1.0, 0.2, d);
  return m;
}

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

// App color palette: teal, purple, magenta, red, gold
vec3 starPalette(float t) {
  t = fract(t) * 5.0;
  vec3 c = vec3(0.00, 0.83, 0.67); // EP Positive (teal)
  c = mix(c, vec3(0.48, 0.26, 0.88), clamp(t, 0.0, 1.0));       // → Focus (purple)
  c = mix(c, vec3(0.82, 0.10, 0.82), clamp(t - 1.0, 0.0, 1.0)); // → Warp (magenta)
  c = mix(c, vec3(1.00, 0.27, 0.40), clamp(t - 2.0, 0.0, 1.0)); // → EP Negative (red)
  c = mix(c, vec3(1.00, 0.73, 0.20), clamp(t - 3.0, 0.0, 1.0)); // → Capacitance (gold)
  c = mix(c, vec3(0.00, 0.83, 0.67), clamp(t - 4.0, 0.0, 1.0)); // → wrap to teal
  return c;
}

vec3 StarLayer(vec2 uv) {
  vec3 col = vec3(0.0);
  vec2 gv = fract(uv) - 0.5;
  vec2 id = floor(uv);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offs = vec2(x, y);
      float n = Hash21(id + offs);
      float size = fract(n * 345.32);
      vec2 p = vec2(n, fract(n * 34.0));

      float star = Star(gv - offs - p + 0.5, smoothstep(0.8, 1.0, size) * 0.6);

      // Each star picks a color from the app palette based on its hash
      vec3 color = starPalette(n);

      star *= sin(uTime * 2.5 + n * 6.2831) * 0.4 + 1.0;
      col += star * size * color;
    }
  }
  return col;
}

vec2 N(float angle) {
  return vec2(sin(angle), cos(angle));
}

void main() {
  // Map vUv (0–1) to centered coordinates like ShaderToy's fragCoord
  vec2 uv = vUv - 0.5;
  float t = uTime * 0.0004;

  uv.x = abs(uv.x);
  uv.y += tan((5.0 / 6.0) * 3.1415) * 0.5;

  vec2 n = N((5.0 / 6.0) * 3.1415);
  float d = dot(uv - vec2(0.5, 0.0), n);
  uv -= n * max(0.0, d) * 2.0;

  n = N((2.0 / 3.0) * 3.1415);
  uv.x += 1.5 / 1.25;
  for (int i = 0; i < 5; i++) {
    uv *= 1.25;
    uv.x -= 1.5;
    uv.x = abs(uv.x);
    uv.x -= 0.5;
    uv -= n * min(0.0, dot(uv, n)) * 2.0;
  }

  uv *= Rot(t);
  vec3 col = vec3(0.0);

  for (float i = 0.0; i < 1.0; i += 1.0 / NUM_LAYERS) {
    float depth = fract(i + t);
    float scale = mix(20.0, 0.5, depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    col += StarLayer(uv * scale + i * 453.2) * fade;
  }

  // Boost brightness so colors survive the mesh's low triangle alpha
  col *= 1.5;

  gl_FragColor = vec4(col, 1.0);
}
`;
