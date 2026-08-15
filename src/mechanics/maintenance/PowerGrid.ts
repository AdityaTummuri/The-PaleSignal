// ═════════════════════════════════════════════════════════════════════════════
// src/mechanics/maintenance/PowerGrid.ts — Station Electrical Power Routing
// ═════════════════════════════════════════════════════════════════════════════

import { clamp } from '@utils/math';
import { POWER } from '@typings/constants';
import type { PowerDistribution } from '@typings/index';

export class PowerGrid {
  /**
   * Distribute power percentages between Fans, RF Amp, and Tape Deck.
   * Auto-balances allocations so their sum strictly equals 1.0.
   */
  static rebalance(
    changedChannel: 'fan' | 'amp' | 'tape',
    newValue: number,
    current: PowerDistribution
  ): PowerDistribution {
    const targetVal = clamp(newValue, POWER.MIN_ALLOCATION, POWER.MAX_ALLOCATION);
    const remaining = 1.0 - targetVal;

    let fan = current.fanAllocation;
    let amp = current.amplifierAllocation;
    let tape = current.tapeDeckAllocation;

    if (changedChannel === 'fan') {
      fan = targetVal;
      const otherSum = amp + tape;
      if (otherSum > 0) {
        amp = (amp / otherSum) * remaining;
        tape = (tape / otherSum) * remaining;
      } else {
        amp = remaining * 0.6;
        tape = remaining * 0.4;
      }
    } else if (changedChannel === 'amp') {
      amp = targetVal;
      const otherSum = fan + tape;
      if (otherSum > 0) {
        fan = (fan / otherSum) * remaining;
        tape = (tape / otherSum) * remaining;
      } else {
        fan = remaining * 0.6;
        tape = remaining * 0.4;
      }
    } else {
      tape = targetVal;
      const otherSum = fan + amp;
      if (otherSum > 0) {
        fan = (fan / otherSum) * remaining;
        amp = (amp / otherSum) * remaining;
      } else {
        fan = remaining * 0.5;
        amp = remaining * 0.5;
      }
    }

    return {
      totalPower: current.totalPower,
      fanAllocation: fan,
      amplifierAllocation: amp,
      tapeDeckAllocation: tape,
    };
  }
}
