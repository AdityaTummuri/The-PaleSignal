// ═════════════════════════════════════════════════════════════════════════════
// src/core/audio/SignalSynth.ts — Procedural Shortwave Carrier & Filter Synth
// ═════════════════════════════════════════════════════════════════════════════

import { audioUnlockManager } from './AudioUnlockManager';
import { SIGNAL, AUDIO } from '@typings/constants';

export class SignalSynth {
  private ctx: AudioContext | null = null;
  private isInitialized: boolean = false;

  // Audio Nodes
  private carrierOsc: OscillatorNode | null = null;
  private harmonicOsc: OscillatorNode | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private mixGain: GainNode | null = null;
  private bandpassFilter: BiquadFilterNode | null = null;
  private notchFilter: BiquadFilterNode | null = null;
  private signalGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private masterCompressor: DynamicsCompressorNode | null = null;

  // Time-domain sample buffer for visualizer
  private sampleBuffer: Float32Array<ArrayBuffer> = new Float32Array(new ArrayBuffer(SIGNAL.SAMPLE_BUFFER_SIZE * 4));

  /**
   * Initialize and assemble the audio routing graph once context is active.
   */
  init(): void {
    if (this.isInitialized) return;

    this.ctx = audioUnlockManager.getContext();
    const now = this.ctx.currentTime;

    // 1. Master Compressor / Limiter
    this.masterCompressor = this.ctx.createDynamicsCompressor();
    this.masterCompressor.threshold.setValueAtTime(-12, now);
    this.masterCompressor.knee.setValueAtTime(4, now);
    this.masterCompressor.ratio.setValueAtTime(8, now);
    this.masterCompressor.attack.setValueAtTime(0.005, now);
    this.masterCompressor.release.setValueAtTime(0.05, now);
    this.masterCompressor.connect(this.ctx.destination);

    // 2. Analyser Node for Oscilloscope
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = SIGNAL.SAMPLE_BUFFER_SIZE * 2;
    this.analyser.smoothingTimeConstant = 0.8;
    this.analyser.connect(this.masterCompressor);

    // 3. Signal Output Gain Node
    this.signalGain = this.ctx.createGain();
    this.signalGain.gain.setValueAtTime(0, now);
    this.signalGain.connect(this.analyser);

    // 4. Dual Filter Chain: Bandpass + Phase Notch
    this.notchFilter = this.ctx.createBiquadFilter();
    this.notchFilter.type = 'notch';
    this.notchFilter.frequency.setValueAtTime(1000, now);
    this.notchFilter.Q.setValueAtTime(4.0, now);
    this.notchFilter.connect(this.signalGain);

    this.bandpassFilter = this.ctx.createBiquadFilter();
    this.bandpassFilter.type = 'bandpass';
    this.bandpassFilter.frequency.setValueAtTime(1000, now);
    this.bandpassFilter.Q.setValueAtTime(SIGNAL.BANDPASS_DEFAULT_Q, now);
    this.bandpassFilter.connect(this.notchFilter);

    // 5. Signal Mixer
    this.mixGain = this.ctx.createGain();
    this.mixGain.gain.setValueAtTime(AUDIO.SIGNAL_VOLUME, now);
    this.mixGain.connect(this.bandpassFilter);

    // 6. Carrier Oscillator
    this.carrierOsc = this.ctx.createOscillator();
    this.carrierOsc.type = 'sine';
    this.carrierOsc.frequency.setValueAtTime(440, now);
    this.carrierOsc.connect(this.mixGain);
    this.carrierOsc.start();

    // 7. Harmonic Oscillator
    this.harmonicOsc = this.ctx.createOscillator();
    this.harmonicOsc.type = 'triangle';
    this.harmonicOsc.frequency.setValueAtTime(880, now);
    this.harmonicOsc.connect(this.mixGain);
    this.harmonicOsc.start();

    // 8. Procedural Atmospheric Static / Noise Generator (looped buffer)
    this.initNoiseGenerator();

    this.isInitialized = true;
  }

  private initNoiseGenerator(): void {
    if (!this.ctx || !this.mixGain) return;

    // Generate 2 seconds of procedural white noise with pink rolloff
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Paul Kellet's refined pink noise filter algorithm
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    this.noiseSource = this.ctx.createBufferSource();
    this.noiseSource.buffer = noiseBuffer;
    this.noiseSource.loop = true;

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    this.noiseSource.connect(this.noiseGain);
    this.noiseGain.connect(this.mixGain);
    this.noiseSource.start();
  }

  /**
   * Update synth frequency and harmonic detune based on radio dial position.
   * Maps radio MHz (10–140) to audible carrier pitch (120–1800 Hz).
   */
  setRadioFrequency(mhz: number, targetCarrierMhz: number, complexity: number = 1): void {
    if (!this.ctx || !this.carrierOsc || !this.harmonicOsc) return;

    const now = this.ctx.currentTime;
    const proximity = Math.max(0, 1 - Math.abs(mhz - targetCarrierMhz) / 5.0);

    // Audible carrier base
    const baseFreq = 220 + (mhz % 30) * 25;
    this.carrierOsc.frequency.setTargetAtTime(baseFreq, now, 0.03);

    // Harmonic frequency detune based on encounter complexity
    const harmonicMultiplier = 1.0 + complexity * 0.5;
    this.harmonicOsc.frequency.setTargetAtTime(baseFreq * harmonicMultiplier + (1 - proximity) * 80, now, 0.03);

    // Noise level increases when away from carrier spike
    if (this.noiseGain) {
      const noiseLevel = 0.15 + (1 - proximity) * 0.55;
      this.noiseGain.gain.setTargetAtTime(noiseLevel, now, 0.04);
    }
  }

  /**
   * Set bandpass filter frequency and Q factor.
   */
  setBandpass(centerHz: number, q: number = SIGNAL.BANDPASS_DEFAULT_Q): void {
    if (!this.ctx || !this.bandpassFilter) return;
    const now = this.ctx.currentTime;
    const clampedHz = Math.min(Math.max(centerHz, SIGNAL.BANDPASS_MIN_FREQ), SIGNAL.BANDPASS_MAX_FREQ);
    this.bandpassFilter.frequency.setTargetAtTime(clampedHz, now, 0.02);
    this.bandpassFilter.Q.setTargetAtTime(Math.max(0.5, Math.min(q, 18.0)), now, 0.02);
  }

  /**
   * Update overall signal output volume based on phase lock & SNR.
   */
  setLockState(phaseLock: number, snr: number): void {
    if (!this.ctx || !this.signalGain) return;
    const now = this.ctx.currentTime;
    const targetGain = Math.min(Math.max(phaseLock * 0.85 + snr * 0.15, 0), 1.0) * AUDIO.SIGNAL_VOLUME;
    this.signalGain.gain.setTargetAtTime(targetGain, now, 0.05);
  }

  /**
   * Extract time-domain waveform data for oscilloscope rendering.
   */
  getWaveformData(): Float32Array {
    if (!this.analyser) {
      this.sampleBuffer.fill(0);
      return this.sampleBuffer;
    }
    this.analyser.getFloatTimeDomainData(this.sampleBuffer);
    return this.sampleBuffer;
  }

  /**
   * Gracefully mute the synth.
   */
  mute(): void {
    if (this.signalGain && this.ctx) {
      this.signalGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    }
  }

  dispose(): void {
    try {
      this.carrierOsc?.stop();
      this.harmonicOsc?.stop();
      this.noiseSource?.stop();
      this.carrierOsc?.disconnect();
      this.harmonicOsc?.disconnect();
      this.noiseSource?.disconnect();
      this.noiseGain?.disconnect();
      this.mixGain?.disconnect();
      this.bandpassFilter?.disconnect();
      this.notchFilter?.disconnect();
      this.signalGain?.disconnect();
      this.analyser?.disconnect();
      this.masterCompressor?.disconnect();
    } catch {
      // Ignore disconnect errors on shutdown
    }
    this.isInitialized = false;
  }
}

export const signalSynth = new SignalSynth();
