// ═════════════════════════════════════════════════════════════════════════════
// src/core/audio/AmbientSoundscape.ts — Procedural Coastal Weather Soundscape
// ═════════════════════════════════════════════════════════════════════════════

import { audioUnlockManager } from './AudioUnlockManager';
import { AUDIO } from '@typings/constants';
import type { GamePhase } from '@typings/index';

export class AmbientSoundscape {
  private ctx: AudioContext | null = null;
  private isInitialized: boolean = false;

  // Nodes
  private masterGain: GainNode | null = null;
  private rainSource: AudioBufferSourceNode | null = null;
  private rainFilter: BiquadFilterNode | null = null;
  private rainGain: GainNode | null = null;

  private windOsc: OscillatorNode | null = null;
  private windLfo: OscillatorNode | null = null;
  private windLfoGain: GainNode | null = null;
  private windGain: GainNode | null = null;

  private humOsc: OscillatorNode | null = null;
  private humGain: GainNode | null = null;

  init(): void {
    if (this.isInitialized) return;

    this.ctx = audioUnlockManager.getContext();
    const now = this.ctx.currentTime;

    // Master Ambience Output
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(AUDIO.AMBIENCE_VOLUME, now);
    this.masterGain.connect(this.ctx.destination);

    // 1. Procedural Rain Stream (filtered noise)
    this.initRain(now);

    // 2. Procedural Wind Drone with LFO modulation
    this.initWind(now);

    // 3. Station Electrical 60Hz Hum
    this.initStationHum(now);

    this.isInitialized = true;
  }

  private initRain(now: number): void {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 3;
    const rainBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = rainBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // High-density rain droplet impulses
      const droplet = Math.random() < 0.08 ? (Math.random() * 2 - 1) * 0.7 : (Math.random() * 2 - 1) * 0.15;
      data[i] = droplet;
    }

    this.rainSource = this.ctx.createBufferSource();
    this.rainSource.buffer = rainBuffer;
    this.rainSource.loop = true;

    this.rainFilter = this.ctx.createBiquadFilter();
    this.rainFilter.type = 'lowpass';
    this.rainFilter.frequency.setValueAtTime(2200, now);
    this.rainFilter.Q.setValueAtTime(0.7, now);

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.setValueAtTime(0.45, now);

    this.rainSource.connect(this.rainFilter);
    this.rainFilter.connect(this.rainGain);
    this.rainGain.connect(this.masterGain);
    this.rainSource.start();
  }

  private initWind(now: number): void {
    if (!this.ctx || !this.masterGain) return;

    // Wind carrier
    this.windOsc = this.ctx.createOscillator();
    this.windOsc.type = 'sine';
    this.windOsc.frequency.setValueAtTime(95, now);

    // LFO for slow gusting wobble (0.15 Hz)
    this.windLfo = this.ctx.createOscillator();
    this.windLfo.type = 'sine';
    this.windLfo.frequency.setValueAtTime(0.18, now);

    this.windLfoGain = this.ctx.createGain();
    this.windLfoGain.gain.setValueAtTime(35, now); // Pitch variation ±35Hz

    this.windLfo.connect(this.windLfoGain);
    this.windLfoGain.connect(this.windOsc.frequency);

    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(0.25, now);

    this.windOsc.connect(this.windGain);
    this.windGain.connect(this.masterGain);

    this.windOsc.start();
    this.windLfo.start();
  }

  private initStationHum(now: number): void {
    if (!this.ctx || !this.masterGain) return;

    this.humOsc = this.ctx.createOscillator();
    this.humOsc.type = 'triangle';
    this.humOsc.frequency.setValueAtTime(60, now); // 60Hz mains hum

    this.humGain = this.ctx.createGain();
    this.humGain.gain.setValueAtTime(0.08, now);

    this.humOsc.connect(this.humGain);
    this.humGain.connect(this.masterGain);
    this.humOsc.start();
  }

  /**
   * Adjust ambience dynamics based on station state / overheat / phase.
   */
  updateForPhase(phase: GamePhase): void {
    if (!this.ctx || !this.rainFilter || !this.windGain) return;
    const now = this.ctx.currentTime;

    switch (phase) {
      case 'MAINTENANCE_OVERHEAT':
        // Muffle rain, amplify anxious wind
        this.rainFilter.frequency.setTargetAtTime(800, now, 0.5);
        this.windGain.gain.setTargetAtTime(0.55, now, 0.5);
        break;
      case 'TRANSMISSION_RESOLVED':
        // Serene open storm
        this.rainFilter.frequency.setTargetAtTime(3500, now, 0.8);
        this.windGain.gain.setTargetAtTime(0.18, now, 0.8);
        break;
      default:
        // Baseline coastal atmospheric mix
        this.rainFilter.frequency.setTargetAtTime(2200, now, 0.4);
        this.windGain.gain.setTargetAtTime(0.25, now, 0.4);
        break;
    }
  }

  dispose(): void {
    try {
      this.rainSource?.stop();
      this.windOsc?.stop();
      this.windLfo?.stop();
      this.humOsc?.stop();
      this.masterGain?.disconnect();
    } catch {
      // Ignore
    }
    this.isInitialized = false;
  }
}

export const ambientSoundscape = new AmbientSoundscape();
