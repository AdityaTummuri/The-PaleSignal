// ═════════════════════════════════════════════════════════════════════════════
// src/mechanics/signal/Demodulator.ts — Phase-Locked Loop & Waveform Demodulator
// ═════════════════════════════════════════════════════════════════════════════

import { clamp } from '@utils/math';
import { SIGNAL } from '@typings/constants';
import type { SignalTelemetry } from '@typings/index';

export class Demodulator {
  private lockIntegrator: number = 0;

  /**
   * Process incoming signal telemetry through the PLL model.
   */
  process(telemetry: SignalTelemetry, dt: number): { phaseLock: number; demodProgress: number } {
    if (!telemetry.carrierDetected) {
      // Rapid lock loss
      this.lockIntegrator = Math.max(0, this.lockIntegrator - dt * 2.5);
      return { phaseLock: 0, demodProgress: telemetry.demodulationProgress };
    }

    // Bandpass resonance matching: optimal center freq is ~1200-2400 Hz for shortwave sub-carrier
    const targetCenter = 1600;
    const bandpassAccuracy = 1.0 - clamp(Math.abs(telemetry.bandpassCenter - targetCenter) / 3000, 0, 1);
    const qBoost = clamp(telemetry.bandpassQ / 2.0, 0.5, 1.5);

    // Instantaneous signal quality factor
    const quality = telemetry.signalNoiseRatio * bandpassAccuracy * qBoost;

    if (quality >= 0.45) {
      // Slew up towards full lock
      this.lockIntegrator = clamp(this.lockIntegrator + dt * 1.2 * quality, 0, 1.0);
    } else {
      // Slew down
      this.lockIntegrator = clamp(this.lockIntegrator - dt * 1.5, 0, 1.0);
    }

    const phaseLock = this.lockIntegrator;
    let newProgress = telemetry.demodulationProgress;

    // Accumulate demodulation data stream if phase lock is solid (>= 0.85)
    if (phaseLock >= SIGNAL.LOCK_THRESHOLD) {
      newProgress = clamp(newProgress + dt * 0.35, 0, 1.0);
    }

    return {
      phaseLock,
      demodProgress: newProgress,
    };
  }

  reset(): void {
    this.lockIntegrator = 0;
  }
}

export const demodulator = new Demodulator();
