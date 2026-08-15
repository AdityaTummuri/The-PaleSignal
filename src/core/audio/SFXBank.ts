// ═════════════════════════════════════════════════════════════════════════════
// src/core/audio/SFXBank.ts — Procedural Mechanical Hardware Foley Bank
// ═════════════════════════════════════════════════════════════════════════════

import { audioUnlockManager } from './AudioUnlockManager';
import { AUDIO } from '@typings/constants';

export class SFXBank {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = audioUnlockManager.getContext();
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(AUDIO.SFX_VOLUME, this.ctx.currentTime);
      this.sfxGain.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  /**
   * Heavy electro-mechanical relay / solenoid toggle thud.
   */
  playSwitchClick(isEngaged: boolean = true): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = isEngaged ? 'square' : 'triangle';
    osc.frequency.setValueAtTime(isEngaged ? 320 : 260, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.035);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain!);

    osc.start(now);
    osc.stop(now + 0.045);
  }

  /**
   * Rotary dial notched detent click with pitch variation.
   */
  playDialTick(pitchMod: number = 1.0): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const basePitch = 1200 * pitchMod * (0.95 + Math.random() * 0.1);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(basePitch, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.012);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

    osc.connect(gain);
    gain.connect(this.sfxGain!);

    osc.start(now);
    osc.stop(now + 0.018);
  }

  /**
   * Card insertion and electro-mechanical motor feed sound.
   */
  playCardFeed(): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    // Fast sequence of 3 micro-solenoid pulses
    for (let i = 0; i < 3; i++) {
      const stepTime = now + i * 0.045;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400 + i * 150, stepTime);
      osc.frequency.exponentialRampToValueAtTime(60, stepTime + 0.025);

      gain.gain.setValueAtTime(0.4, stepTime);
      gain.gain.exponentialRampToValueAtTime(0.001, stepTime + 0.03);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(stepTime);
      osc.stop(stepTime + 0.035);
    }
  }

  /**
   * Harsh thermal warning / overheat alarm buzzer.
   */
  playOverheatAlarm(): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.setValueAtTime(880, now + 0.1);
    osc.frequency.setValueAtTime(660, now + 0.2);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.setValueAtTime(0.01, now + 0.28);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

    osc.connect(gain);
    gain.connect(this.sfxGain!);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  /**
   * Tape reel motor engage / brake clunk.
   */
  playTapeClunk(): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.06);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.sfxGain!);

    osc.start(now);
    osc.stop(now + 0.08);
  }
}

export const sfxBank = new SFXBank();
