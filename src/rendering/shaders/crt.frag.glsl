// ═════════════════════════════════════════════════════════════════════════════
// src/rendering/shaders/crt.frag.glsl — 1970s CRT Phosphor Cathode Ray Tube Filter
// PixiJS v8 / WebGL 2 / GLSL 300 ES compatible fragment shader
// ═════════════════════════════════════════════════════════════════════════════

precision mediump float;

in vec2 vTextureCoord;
out vec4 finalColor;

uniform sampler2D uTexture;

uniform CRTUniforms {
    float uTime;                // Elapsed simulation time
    float uCurvature;           // Barrel distortion power (default ~3.5)
    float uScanlineIntensity;   // Scanline darkness (0.0 to 1.0)
    float uSignalNoise;         // RF static noise amplitude (0.0 to 1.0)
    float uPhosphorDecay;       // Phosphor persistence / tint weight
    float uChromaticAberration; // RGB split offset (0.0 to 0.01)
    float uVignette;            // Edge shading falloff
    vec2  uResolution;          // Viewport width, height
};

// Barrel curvature mapping
vec2 curveUV(vec2 uv, float curvature) {
    vec2 cc = uv - 0.5;
    float dist = dot(cc, cc);
    return uv + cc * dist * (curvature * 0.045);
}

// Pseudo-random hash for RF static noise
float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

void main() {
    vec2 uv = curveUV(vTextureCoord, uCurvature);

    // Hard border cutout for CRT bezel curve
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        finalColor = vec4(0.015, 0.018, 0.022, 1.0);
        return;
    }

    // Chromatic Aberration: Radial RGB channel displacement
    vec2 dir = uv - 0.5;
    float r = texture(uTexture, uv + dir * uChromaticAberration).r;
    float g = texture(uTexture, uv).g;
    float b = texture(uTexture, uv - dir * uChromaticAberration).b;
    float a = texture(uTexture, uv).a;

    vec3 color = vec3(r, g, b);

    // 1. Scanlines with subtle rolling sync modulation
    float scanline = sin((uv.y + uTime * 0.02) * uResolution.y * 1.5708);
    float scanlineFactor = 1.0 - (uScanlineIntensity * 0.5 * (1.0 + scanline));
    color *= scanlineFactor;

    // 2. Phosphor Cathode Grid mask (subtle vertical aperture grille)
    float grille = 0.96 + 0.04 * sin(uv.x * uResolution.x * 3.14159);
    color *= grille;

    // 3. RF Static Noise
    float noise = (hash21(uv * 1000.0 + fract(uTime * 17.13)) - 0.5) * uSignalNoise;
    color += vec3(noise);

    // 4. Amber/Green Phosphor Tone Enhancement
    // Warm retro cathode tone: slightly boosts amber/green channel persistence
    vec3 phosphorTint = vec3(0.95, 1.02, 0.94);
    color *= mix(vec3(1.0), phosphorTint, uPhosphorDecay * 0.15);

    // 5. Radial Vignette Falloff
    vec2 vigUV = uv * (1.0 - uv);
    float vig = vigUV.x * vigUV.y * 15.0;
    vig = clamp(pow(vig, uVignette), 0.0, 1.0);
    color *= vig;

    // 6. Subtle Screen Flickering (60Hz AC mains power flicker)
    float flicker = 0.992 + 0.008 * sin(uTime * 120.0);
    color *= flicker;

    finalColor = vec4(color, a);
}
