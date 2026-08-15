// ═════════════════════════════════════════════════════════════════════════════
// src/mechanics/maintenance/TapeWearSystem.ts — Magnetic Oxide Wear Degradation
// ═════════════════════════════════════════════════════════════════════════════

import { clamp } from '@utils/math';
import type { TapeDeckState } from '@typings/index';

export class TapeWearSystem {
  /**
   * Step magnetic tape wear simulation forward.
   */
  static step(current: TapeDeckState, decayRateMultiplier: number, dt: number): TapeDeckState {
    if (!current.isPlaying || current.tapeIntegrity <= 0) {
      return current;
    }

    const wearDelta = current.decayRate * decayRateMultiplier * dt;
    const nextIntegrity = clamp(current.tapeIntegrity - wearDelta, 0, 1.0);
    const flutterIntensity = clamp((1.0 - nextIntegrity) * 0.85, 0, 1.0);

    // Loop position across 100 seconds per reel
    const nextPos = (current.playbackPosition + (dt / 100.0)) % 1.0;

    return {
      tapeIntegrity: nextIntegrity,
      decayRate: current.decayRate,
      isPlaying: nextIntegrity > 0,
      playbackPosition: nextPos,
      flutterIntensity,
    };
  }
}
