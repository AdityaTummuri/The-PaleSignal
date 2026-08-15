// ═════════════════════════════════════════════════════════════════════════════
// src/core/audio/SolenoidSynth.ts — Synchronized Teletype Solenoid & Chime Synth
// ═════════════════════════════════════════════════════════════════════════════

import { audioUnlockManager } from './AudioUnlockManager';
import { TELETYPE } from '@typings/constants';

export class SolenoidSynth {
  private ctx: AudioContext | null = null;
  private clickBuffer: AudioBuffer | null = null;
  private masterGain: GainNode | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = audioUnlockManager.getContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.generateClickBuffer();
    }
    return this.ctx;
  }

  /**
   * Pre-render a sub-5ms sharp mechanical transient click buffer.
   */
  private generateClickBuffer(): void {
    if (!this.ctx) return;

    const sampleRate = this.ctx.sampleRate;
    const duration = 0.005; // 5ms sub-transient
    const length = Math.floor(sampleRate * duration);
    this.clickBuffer = this.ctx.createBuffer(1, length, sampleRate);
    const channel = this.clickBuffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / length;
      // Exponentially decaying white noise impulse with rapid mechanical ring
      const noise = (Math.random() * 2 - 1) * Math.exp(-t * 14);
      const ring = Math.sin(t * Math.PI * 48) * Math.exp(-t * 8);
      channel[i] = (noise * 0.7 + ring * 0.3);
    }
  }

  /**
   * Play a crisp mechanical solenoid strike with pitch micro-variance.
   */
  playCharClick(): void {
    const ctx = this.getContext();
    if (!this.clickBuffer || !this.masterGain) return;

    const now = ctx.currentTime;
    const source = ctx.createBufferSource();
    source.buffer = this.clickBuffer;

    // Pitch micro-variation (±4%)
    const variance = (Math.random() * 2 - 1) * TELETYPE.SOLENOID_PITCH_VARIANCE;
    source.playbackRate.setValueAtTime(1.0 + variance, now);

    // Highpass filter for metallic bite (2000Hz cutoff)
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2000, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.65, now);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    source.start(now);
  }

  /**
   * Play harmonic A5 chord on teletype message resolution.
   */
  playCompletionChime(): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const rootFreq = TELETYPE.COMPLETION_CHIME_FREQ; // 880Hz (A5)
    // Harmonic triad: Root (880Hz), Major Third (1100Hz), Perfect Fifth (1320Hz)
    const frequencies = [rootFreq, rootFreq * 1.25, rootFreq * 1.5];

    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3200, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.25 / frequencies.length, now + 0.05 + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2 + idx * 0.04);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now + idx * 0.04);
      osc.stop(now + 1.3 + idx * 0.04);
    });
  }
}

export const solenoidSynth = new SolenoidSynth();
