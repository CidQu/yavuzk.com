/** Most pointer-made waves the shader will draw at once. */
export const MAX_WAVES = 24;

/** Heights are tinted against this, roughly the top of the district. Metres. */
export const SUMMIT = 1150;

/** A single triangle that covers the viewport. */
export const VERTEX_SHADER = /* glsl */ `#version 300 es
void main() {
    vec2 corner = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
    gl_Position = vec4(corner * 2.0 - 1.0, 0.0, 1.0);
}
`;

/**
 * The whole scene is drawn per pixel from three small textures:
 *
 *   uField    distance to the coast (+ at sea) and to the district boundary
 *             (- inside Ünye), in map units
 *   uTerrain  height, hillshade and prominence (ridge or valley)
 *   uGlow     one texel per land mark: how lit it is, and in which tint
 *
 * Lengths are in CSS pixels unless they are named for map units.
 */
export const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;

#define MAX_WAVES ${MAX_WAVES}

uniform vec2 uResolution;      // drawing buffer size
uniform float uPixel;          // buffer pixels per CSS pixel
uniform float uTime;           // seconds
uniform vec2 uOrigin;          // where map position (0, 0) sits on screen
uniform float uScale;          // CSS pixels per map unit
uniform vec2 uMapSize;         // extent of the terrain, map units
uniform float uCell;           // spacing of the land marks
uniform float uElevationMax;   // height that uTerrain.r == 1 stands for

uniform sampler2D uField;
uniform sampler2D uTerrain;
uniform sampler2D uGlow;

uniform int uWaveCount;
uniform vec4 uWaves[MAX_WAVES];      // centre.xy, distance of the front from shore, strength
uniform vec4 uWaveShape[MAX_WAVES];  // spread along the crest, splash on the shore

out vec4 outColor;

const vec3 LAND = vec3(0.008, 0.024, 0.094);       // the page background
const vec3 LAND_UNYE = vec3(0.020, 0.047, 0.137);
const vec3 SEA_DEEP = vec3(0.012, 0.043, 0.129);
const vec3 SEA_SHALLOW = vec3(0.031, 0.114, 0.278);
const vec3 FOAM = vec3(0.760, 0.875, 1.000);
const vec3 SHORE = vec3(1.000, 1.000, 1.000);
const vec3 BORDER = vec3(0.860, 0.910, 1.000);
const vec3 MARK = vec3(0.560, 0.660, 0.830);

// Glow of a lit mark, by height: shoreline cyan, icy mid slopes, gold summits.
const vec3 GLOW_LOW = vec3(0.290, 0.871, 0.980);
const vec3 GLOW_MID = vec3(0.860, 0.940, 1.000);
const vec3 GLOW_HIGH = vec3(1.000, 0.800, 0.380);

const float SUMMIT = ${SUMMIT.toFixed(1)};
const float WAVE_RATE = 0.26;     // crests reaching the shore per second
const float WAVELENGTH = 10.0;    // gap between crests at the shore
const float SHOAL = 70.0;         // how quickly that gap opens up offshore
const float TIDE_PERIOD = 15.0;   // seconds for the light to climb the land

float hash(vec2 p) {
    vec3 q = fract(vec3(p.xyx) * 0.1031);
    q += dot(q, q.yzx + 33.33);
    return fract((q.x + q.y) * q.z);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
        f.y
    );
}

// Where the incoming swell is in its cycle at a map position. A crest lands
// on the shore each time this passes a whole number, a little earlier or
// later from place to place.
float shorePhase(vec2 mapPosition) {
    float drift = noise(mapPosition * 0.0042 + vec2(0.0, uTime * 0.011));
    return uTime * WAVE_RATE + (drift - 0.5) * 3.2;
}

vec3 glowColor(float tint) {
    return tint < 0.45
        ? mix(GLOW_LOW, GLOW_MID, tint / 0.45)
        : mix(GLOW_MID, GLOW_HIGH, (tint - 0.45) / 0.55);
}

void main() {
    vec2 p = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) / uPixel;
    vec2 mapPosition = (p - uOrigin) / uScale;
    vec2 uv = mapPosition / uMapSize;
    float aa = 0.5 / uPixel;

    vec2 field = texture(uField, uv).rg * uScale;
    float coast = field.r;                               // + at sea
    float district = field.g;                            // - inside Ünye
    float sea = smoothstep(-aa, aa, coast);

    vec3 color = LAND;
    float landing = 0.0;                                 // 1 as a crest lands, then fades
    float splash = 0.0;                                  // pointer-made waves landing here

    // ------------------------------------------------------------------ sea
    if (coast > -4.0) {
        float offshore = max(coast, 0.0);
        float depth = 1.0 - exp(-offshore / 190.0);
        float phase = shorePhase(mapPosition);

        landing = exp(-fract(phase) * 3.4);
        color = mix(SEA_SHALLOW, SEA_DEEP, depth);
        color *= 0.88 + 0.24 * noise(mapPosition * 0.006 - vec2(uTime * 0.006, 0.0));

        // Crests follow lines of equal distance from the shore, bunching up
        // and slowing down as the water gets shallow.
        float spacing = WAVELENGTH * (1.0 + offshore / SHOAL);
        float cycle = SHOAL * log(1.0 + offshore / SHOAL) / WAVELENGTH + phase;
        float behind = fract(cycle) * spacing;           // distance behind the crest ahead
        float width = mix(0.5, 0.34, depth);
        float crest = 1.0 - smoothstep(width - aa, width + aa, min(behind, spacing - behind));
        float wake = exp(-behind / (1.5 + 0.07 * spacing)) * 0.13;

        // Each crest is broken into its own drifting set of strokes.
        float strokes = noise(mapPosition * 0.017 + floor(cycle) * 5.7 + vec2(uTime * 0.017, 0.0));
        float broken = mix(smoothstep(0.38, 0.6, strokes), 1.0, exp(-offshore / 24.0));
        float reach = mix(0.085, 0.5, exp(-offshore / 115.0));
        float foam = (crest + wake) * broken * reach * smoothstep(1.0, 4.0, offshore);

        // Waves sent from the pointer: short trains of arcs riding in to
        // the shore.
        float sent = 0.0;
        for (int i = 0; i < uWaveCount; i++) {
            vec4 wave = uWaves[i];
            vec4 shape = uWaveShape[i];
            vec2 offset = p - wave.xy;
            float along = dot(offset, offset) / (shape.x * shape.x);
            if (along > 9.0) continue;

            float spread = exp(-along);
            float across = coast - wave.z;               // behind the leading crest
            float train =
                exp(-across * across / 0.9) +
                0.55 * exp(-(across - 6.5) * (across - 6.5) / 1.1) +
                0.26 * exp(-(across - 13.0) * (across - 13.0) / 1.4);

            sent += wave.w * spread * train;
            splash += shape.y * spread;
        }

        // Many waves landing together should not burn out the shore.
        foam += 1.0 - exp(-sent);
        splash = 1.0 - exp(-splash);

        // Surf: the water glows where it meets the shore, more as crests land.
        foam += exp(-offshore / (2.0 + 3.5 * landing + 2.0 * splash))
            * (0.08 + 0.26 * landing + 0.36 * splash);

        color += FOAM * foam;
    }

    // ----------------------------------------------------------------- land
    if (coast < 1.0) {
        float inside = smoothstep(aa, -aa, district);
        vec3 ground = mix(LAND, LAND_UNYE, inside);
        // A soft band of light just inside the district boundary.
        ground += vec3(0.30, 0.42, 0.62) * exp(min(district, 0.0) / 15.0) * inside * 0.085;

        // Marks sit on a brick-laid grid, one sample of the terrain each.
        float row = floor(p.y / uCell);
        float shift = mod(row, 2.0) * 0.5 * uCell;
        float column = floor((p.x - shift) / uCell);
        vec2 centre = vec2((column + 0.5) * uCell + shift, (row + 0.5) * uCell);
        vec2 centreMap = (centre - uOrigin) / uScale;
        vec2 centreUv = centreMap / uMapSize;

        vec2 centreField = texture(uField, centreUv).rg * uScale;
        float inland = -centreField.r;
        float home = smoothstep(1.0, -1.0, centreField.g);
        vec3 terrain = texture(uTerrain, centreUv).rgb;
        float metres = terrain.r * terrain.r * uElevationMax;
        float height = clamp(metres / SUMMIT, 0.0, 1.0);
        float lift = terrain.b;                          // 1 on ridges, 0 in valley floors
        vec2 lit = texelFetch(uGlow, ivec2(int(column) + 1, int(row)), 0).rg;

        // A tide of light climbs the terrain, from the foot of the hills to
        // the summits, one contour at a time. It lingers in the lowlands,
        // where a metre of height is a long way across the map.
        float tide = fract(uTime / TIDE_PERIOD);
        float climb = mix(0.12, 1.12, tide);
        float level = 1250.0 * climb * climb;
        float band = (metres - level) / (12.0 + 0.05 * level);
        float rising = exp(-band * band)
            * smoothstep(0.0, 0.06, tide) * (1.0 - smoothstep(0.84, 1.0, tide))
            * mix(0.16, 0.4, home);

        float glow = max(lit.r, rising);
        float tint = lit.r > rising ? lit.g : height;

        // Ridges carry large bright marks, valleys shrink to specks.
        float strength = (0.105 + 0.375 * height + 0.75 * pow(lift, 2.2)) * (0.5 + terrain.g);

        // Each landing crest washes a little way inland before it dies out.
        if (inland < 150.0) {
            strength += 0.45
                * exp(-fract(shorePhase(centreMap) - inland / 90.0) * 3.0)
                * exp(-inland / 38.0);
        }

        strength = min(strength, 1.0) * mix(0.42, 1.0, home);

        // A lit mark grows and turns from x to +.
        float turn = 0.7854 * (1.0 + glow);
        vec2 q = p - centre;
        q = vec2(q.x * cos(turn) - q.y * sin(turn), q.x * sin(turn) + q.y * cos(turn));
        float arm = uCell * (0.045 + 0.05 * height + 0.14 * pow(lift, 1.4));
        arm = mix(arm, uCell * 0.27, glow);
        float stroke = 0.5 + 0.3 * glow;
        float gap = min(
            length(vec2(max(abs(q.x) - arm, 0.0), q.y)),
            length(vec2(q.x, max(abs(q.y) - arm, 0.0)))
        );
        float mark = 1.0 - smoothstep(stroke - aa, stroke + aa, gap);
        float halo = exp(-gap * gap / (0.05 * uCell * uCell));
        // Nothing is drawn where a mark would stray across the shoreline.
        float present = smoothstep(4.0, 9.0, inland);

        ground += MARK * mark * strength * present;
        ground += glowColor(tint) * (mark * 0.95 + halo * 0.4) * glow * present;

        // The district boundary, away from the shore.
        float border = 1.0 - smoothstep(0.5 - aa, 0.5 + aa, abs(district));
        ground = mix(ground, BORDER, border * 0.5 * smoothstep(2.0, 6.0, -coast));

        color = mix(ground, color, sea);
    }

    // ------------------------------------------------------------ shoreline
    float ours = smoothstep(3.0, 0.5, district);         // Ünye's own stretch of coast
    float halfWidth = mix(0.4, 0.8, ours) + 0.3 * landing * ours + 0.65 * splash;
    float shoreline = 1.0 - smoothstep(halfWidth - aa, halfWidth + aa, abs(coast));
    color = mix(color, SHORE, min(shoreline * (mix(0.4, 1.0, ours) + splash), 1.0));
    color += SHORE * exp(-abs(coast) / 5.0) * (0.05 * ours + 0.06 * splash);

    // Fade to the page colour where the terrain data runs out.
    vec2 margin = min(uv, 1.0 - uv);
    color = mix(LAND, color, smoothstep(0.0, 0.015, min(margin.x, margin.y)));

    // A whisper of noise keeps the gradients from banding.
    color += (hash(gl_FragCoord.xy) - 0.5) / 255.0;

    outColor = vec4(color, 1.0);
}
`;
