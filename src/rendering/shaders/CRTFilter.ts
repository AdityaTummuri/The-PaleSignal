// ═════════════════════════════════════════════════════════════════════════════
// src/rendering/shaders/CRTFilter.ts — PixiJS v8 CRT Filter Wrapper
// ═════════════════════════════════════════════════════════════════════════════

import { Filter, GlProgram } from 'pixi.js';
import { CRT } from '@typings/constants';
import fragmentShader from './crt.frag.glsl';

const vertexShader = `
in vec2 aPosition;
out vec2 vTextureCoord;

uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

vec4 filterVertexPosition(void) {
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
    position.x = (position.x / uOutputTexture.x) * 2.0 - 1.0;
    position.y = (position.y / uOutputTexture.y) * 2.0 - 1.0;
    return vec4(position, 0.0, 1.0);
}

vec2 filterTextureCoord(void) {
    return aPosition * (uOutputFrame.zw * uInputSize.zw);
}

void main(void) {
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
}
`;

export class CRTFilter extends Filter {
  constructor(width: number = 1920, height: number = 1080) {
    const glProgram = GlProgram.from({
      vertex: vertexShader,
      fragment: fragmentShader,
      name: 'crt-filter-program',
    });

    super({
      glProgram,
      resources: {
        CRTUniforms: {
          uTime: { value: 0, type: 'f32' },
          uCurvature: { value: CRT.DEFAULT_CURVATURE, type: 'f32' },
          uScanlineIntensity: { value: CRT.DEFAULT_SCANLINE_INTENSITY, type: 'f32' },
          uSignalNoise: { value: CRT.DEFAULT_NOISE, type: 'f32' },
          uPhosphorDecay: { value: CRT.DEFAULT_PHOSPHOR_DECAY, type: 'f32' },
          uChromaticAberration: { value: CRT.DEFAULT_CHROMATIC_ABERRATION, type: 'f32' },
          uVignette: { value: CRT.DEFAULT_VIGNETTE, type: 'f32' },
          uResolution: { value: [width, height], type: 'vec2<f32>' },
        },
      },
    });
  }

  update(dt: number): void {
    const uniforms = this.resources.CRTUniforms.uniforms;
    uniforms.uTime += dt;
  }

  setResolution(width: number, height: number): void {
    const uniforms = this.resources.CRTUniforms.uniforms;
    uniforms.uResolution = [width, height];
  }

  setCurvature(val: number): void {
    this.resources.CRTUniforms.uniforms.uCurvature = val;
  }

  setNoise(val: number): void {
    this.resources.CRTUniforms.uniforms.uSignalNoise = val;
  }

  setChromaticAberration(val: number): void {
    this.resources.CRTUniforms.uniforms.uChromaticAberration = val;
  }
}
