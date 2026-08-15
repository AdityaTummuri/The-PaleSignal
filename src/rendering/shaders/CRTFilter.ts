// ═════════════════════════════════════════════════════════════════════════════
// src/rendering/shaders/CRTFilter.ts — PixiJS v8 CRT Filter Wrapper
// ═════════════════════════════════════════════════════════════════════════════

import { Filter, GlProgram, defaultFilterVert } from 'pixi.js';
import { CRT } from '@typings/constants';
import fragmentShader from './crt.frag.glsl';

export class CRTFilter extends Filter {
  constructor(width: number = 1920, height: number = 1080) {
    const glProgram = GlProgram.from({
      vertex: defaultFilterVert,
      fragment: fragmentShader,
      name: 'crt-filter-program',
    });

    super({
      glProgram,
      resources: {
        crtUniforms: {
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
    try {
      const uniforms = this.resources?.crtUniforms?.uniforms;
      if (uniforms) {
        uniforms.uTime += dt;
      }
    } catch {
      // Safe fallback
    }
  }

  setResolution(width: number, height: number): void {
    try {
      const uniforms = this.resources?.crtUniforms?.uniforms;
      if (uniforms) {
        uniforms.uResolution = [width, height];
      }
    } catch {
      // Safe fallback
    }
  }

  setCurvature(val: number): void {
    if (this.resources?.crtUniforms?.uniforms) {
      this.resources.crtUniforms.uniforms.uCurvature = val;
    }
  }

  setNoise(val: number): void {
    if (this.resources?.crtUniforms?.uniforms) {
      this.resources.crtUniforms.uniforms.uSignalNoise = val;
    }
  }

  setChromaticAberration(val: number): void {
    if (this.resources?.crtUniforms?.uniforms) {
      this.resources.crtUniforms.uniforms.uChromaticAberration = val;
    }
  }
}
