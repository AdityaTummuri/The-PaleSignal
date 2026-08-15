// ═════════════════════════════════════════════════════════════════════════════
// src/mechanics/maintenance/CoolingSystem.ts — Closed-Form Thermal Dissipation
// ═════════════════════════════════════════════════════════════════════════════

import { clamp } from '@utils/math';
import { THERMAL } from '@typings/constants';
import type { StationThermalState, PowerDistribution } from '@typings/index';

export class CoolingSystem {
  /**
   * Step the thermal simulation forward by dt using closed-form exponential dissipation.
   * Prevents thermal runaway in backgrounded tabs.
   */
  static step(
    current: StationThermalState,
    power: PowerDistribution,
    isDecrypting: boolean,
    dt: number
  ): StationThermalState {
    const fanSpeed = power.fanAllocation;

    // 1. Heat Generation from RF Amplifier tubes and deciphering processors
    const ampHeat = THERMAL.BASE_HEAT_RATE * (power.amplifierAllocation / 0.4);
    const computeHeat = isDecrypting ? 1.5 : 0.0;
    const totalHeatRate = ampHeat + computeHeat;

    // 2. Exponential Cooling Dissipation: k_eff scales with fan speed
    const k_eff = THERMAL.COOLING_COEFFICIENT * (0.5 + fanSpeed * 3.0);
    const dissipation = (current.currentTemperature - current.ambientTemperature) * (1 - Math.exp(-k_eff * dt));

    // 3. Next Temperature
    const nextTemp = clamp(
      current.currentTemperature + totalHeatRate * dt - dissipation,
      current.ambientTemperature,
      THERMAL.MAX_TEMPERATURE
    );

    const isOverheating = nextTemp >= THERMAL.WARNING_THRESHOLD;
    const isCritical = nextTemp >= THERMAL.CRITICAL_THRESHOLD;

    return {
      currentTemperature: nextTemp,
      ambientTemperature: current.ambientTemperature,
      heatGenerationRate: totalHeatRate,
      coolingRate: dissipation / Math.max(dt, 0.001),
      fanSpeed,
      isOverheating,
      isCritical,
    };
  }
}
