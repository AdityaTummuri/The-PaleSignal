// ═════════════════════════════════════════════════════════════════════════════
// src/mechanics/signal/FrequencyScanner.ts — Carrier Detection & SNR Math
// ═════════════════════════════════════════════════════════════════════════════

import { clamp, smoothstep } from '@utils/math';
import { SIGNAL } from '@typings/constants';
import type { SignalTelemetry, EncounterConfig, PowerDistribution } from '@typings/index';

export interface ScanResult {
  readonly carrierDetected: boolean;
  readonly proximity: number; // 0.0 to 1.0
  readonly effectiveSNR: number; // 0.0 to 1.0
}

export class FrequencyScanner {
  private readonly bandwidthWindow: number = 3.5; // MHz capture width

  /**
   * Scan current frequency telemetry against target encounter.
   */
  evaluate(
    currentFreq: number,
    encounter: EncounterConfig | null,
    power: PowerDistribution
  ): ScanResult {
    if (!encounter) {
      return { carrierDetected: false, proximity: 0, effectiveSNR: 0 };
    }

    const dist = Math.abs(currentFreq - encounter.frequencyBand);
    if (dist > this.bandwidthWindow) {
      return { carrierDetected: false, proximity: 0, effectiveSNR: 0 };
    }

    // Proximity curve with smoothstep rolloff
    const normDist = dist / this.bandwidthWindow;
    const proximity = 1.0 - smoothstep(0, 1, normDist);

    // Amplifier power boost
    const ampFactor = clamp(power.amplifierAllocation / 0.4, 0.2, 1.8);
    const effectiveSNR = clamp(proximity * encounter.signalNoiseRatio * ampFactor, 0, 1);

    const carrierDetected = effectiveSNR >= SIGNAL.CARRIER_DETECT_SNR;

    return {
      carrierDetected,
      proximity,
      effectiveSNR,
    };
  }

  /**
   * Produce updated SignalTelemetry object immutably.
   */
  updateTelemetry(
    prev: SignalTelemetry,
    currentFreq: number,
    encounter: EncounterConfig | null,
    power: PowerDistribution
  ): SignalTelemetry {
    const scan = this.evaluate(currentFreq, encounter, power);

    return {
      ...prev,
      currentFrequency: currentFreq,
      carrierDetected: scan.carrierDetected,
      carrierFrequency: encounter ? encounter.frequencyBand : 0,
      signalNoiseRatio: scan.effectiveSNR,
    };
  }
}

export const frequencyScanner = new FrequencyScanner();
