// Shader registry — Shadertoy-compatible shader collection for the fractal texture pass.
//
// HOW TO ADD A NEW SHADER:
// 1. Copy the Shadertoy code (the mainImage function + any helpers it uses)
// 2. Add a new entry to SHADERS below with a unique `id`
// 3. The adapter preamble provides: iTime (float), iResolution (vec3)
// 4. Your shader must define: void mainImage(out vec4 fragColor, vec2 fragCoord)
//
// The adapter wraps your mainImage into a complete fragment shader that maps
// the app's uniforms (uTime, vUv) to Shadertoy conventions.

/** Per-shader mesh display overrides. Omitted values fall back to meshConfig defaults. */
export interface ShaderDisplay {
  /** Fractal texture resolution in pixels (default FRACTAL_RESOLUTION from meshConfig) */
  fractalResolution?: number;
  /** Triangle pass alpha range (default TRI_ALPHA from meshConfig) */
  triAlpha?: { min: number; range: number };
  /** Edge pass alpha range (default EDGE_ALPHA from meshConfig) */
  edgeAlpha?: { min: number; range: number };
  /** Point pass alpha range (default POINT_ALPHA from meshConfig) */
  pointAlpha?: { min: number; range: number };
  /** Vertex dot size (default POINT_SIZE from meshConfig) */
  pointSize?: number;
  /**
   * Triangle blending mode (default 'normal').
   * 'additive' makes colors emit light — ideal for vivid fractals on dark backgrounds.
   * 'normal' uses standard alpha blending — better for subtle tinted fills.
   */
  triBlending?: 'normal' | 'additive';
}

export interface ShaderDef {
  /** Unique identifier for this shader */
  id: string;
  /** Human-readable name (shown in dev console when cycling) */
  name: string;
  /** Shadertoy-compatible GLSL: must define mainImage(out vec4, vec2) */
  source: string;
  /** Brightness multiplier (default 1.0) */
  brightnessBoost?: number;
  /** Saturation multiplier — >1 increases color vibrancy (default 1.0) */
  saturationBoost?: number;
  /** Gamma curve — <1 lifts midtones without blowing highlights (default 1.0) */
  gamma?: number;
  /** Mesh display overrides applied when this shader is active */
  display?: ShaderDisplay;
}

/**
 * Build a complete fragment shader from a Shadertoy-style mainImage source.
 *
 * Maps app uniforms to Shadertoy conventions:
 *   uTime  → iTime
 *   vUv    → fragCoord (via iResolution)
 */
export function buildFractalFragShader(shader: ShaderDef, resolution: number): string {
  const brightness = shader.brightnessBoost ?? 1.0;
  const saturation = shader.saturationBoost ?? 1.0;
  const gamma = shader.gamma ?? 1.0;
  return /* glsl */ `
precision highp float;
uniform float uTime;
varying vec2 vUv;

#define iTime uTime
const vec3 iResolution = vec3(${resolution}.0, ${resolution}.0, 1.0);

${shader.source}

void main() {
  vec2 fragCoord = vUv * iResolution.xy;
  vec4 fragColor = vec4(0.0);
  mainImage(fragColor, fragCoord);
  vec3 c = max(fragColor.rgb, 0.0);
  // Gamma: <1 lifts midtones, >1 deepens them
  c = pow(c, vec3(${gamma.toFixed(2)}));
  // Saturation: >1 boosts color vibrancy
  float lum = dot(c, vec3(0.299, 0.587, 0.114));
  c = max(mix(vec3(lum), c, ${saturation.toFixed(2)}), 0.0);
  // Brightness
  c *= ${brightness.toFixed(2)};
  gl_FragColor = vec4(c, 0.1);
}
`;
}

// ---------------------------------------------------------------------------
// Shader collection — add new entries here
// ---------------------------------------------------------------------------

export const SHADERS: ShaderDef[] = [
  // --- New default: organic fractal web ---
  {
    id: 'zippy-zaps',
    name: 'Zippy Zaps',
    brightnessBoost: 0.20,
    saturationBoost: 5.8,
    gamma: 0.9,
    display: {
      fractalResolution: 1024 / 16,
      triAlpha: { min: 0.0, range: 0.55 },
      triBlending: 'additive',
    },
    source: /* glsl */ `
void mainImage(out vec4 o, vec2 u) {
    vec2 v = iResolution.xy;
    u = .2*(u+u-v)/v.y;

    vec4 z = o = vec4(1,2,3,0);

    for (float a = 0.5, t = iTime, i = 0.0;
         ++i < 19.;
         o += (1. + cos(z+t))
            / length((1.+i*dot(v,v))
                   * sin(1.5*u/(1.5-dot(u,u)) - 9.*u.yx + t/20.))
         )
        v = cos(++t - 12.*u*pow(a += .0003, i)) - 1.*u,
        // Use stanh() here if shader has black artifacts on your GPU
        u += tanh(400. * dot(u *= mat2(cos(i + 0.02*t - z.wxzw*471.9))
                           ,u)
                      * cos(1e2*u.yx + t*1.05)) / 2e2
           + .2 * a * u
           + cos(0./exp(dot(o,o)/1e2) + t) / 32e2;

    o = 25.6 / (min(o, 13.) + 264. / o)
      - dot(u, u) / 250.;
}
`,
  },

  // --- Kaleidoscopic star field (original fractal shader) ---
  {
    id: 'kaleidoscopic-stars',
    name: 'Kaleidoscopic Stars',
    brightnessBoost: 1.5,
    display: {
      fractalResolution: 128,
      triAlpha: { min: 0.0, range: 0.6 },
      triBlending: 'normal',
    },
    source: /* glsl */ `
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
  vec3 c = vec3(0.00, 0.83, 0.67);
  c = mix(c, vec3(0.48, 0.26, 0.88), clamp(t, 0.0, 1.0));
  c = mix(c, vec3(0.82, 0.10, 0.82), clamp(t - 1.0, 0.0, 1.0));
  c = mix(c, vec3(1.00, 0.27, 0.40), clamp(t - 2.0, 0.0, 1.0));
  c = mix(c, vec3(1.00, 0.73, 0.20), clamp(t - 3.0, 0.0, 1.0));
  c = mix(c, vec3(0.00, 0.83, 0.67), clamp(t - 4.0, 0.0, 1.0));
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

      vec3 color = starPalette(n);

      star *= sin(iTime * 2.5 + n * 6.2831) * 0.4 + 1.0;
      col += star * size * color;
    }
  }
  return col;
}

vec2 N(float angle) {
  return vec2(sin(angle), cos(angle));
}

void mainImage(out vec4 fragColor, vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.xy - 0.5;
  float t = iTime * 0.0004;

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

  fragColor = vec4(col, 1.0);
}
`,
  },
];

/** Look up a shader by ID. Returns the first shader if not found. */
export function getShader(id: string): ShaderDef {
  return SHADERS.find(s => s.id === id) ?? SHADERS[0];
}
