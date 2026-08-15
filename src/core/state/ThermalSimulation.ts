// ═════════════════════════════════════════════════════════════════════════════
// src/core/state/ThermalSimulation.ts — Station Thermal Model & Lifecycle Events
// ═════════════════════════════════════════════════════════════════════════════

import { CoolingSystem } from '@mechanics/maintenance/CoolingSystem';
import { globalEventBus } from '@core/events/EventBus';
import { sfxBank } from '@core/audio/SFXBank';
import type { GameState } from '@typings/index';

export class ThermalSimulation {
  private lastWasWarning: boolean = false;
  private lastWasCritical: boolean = false;

  update(state: GameState, dt: number): Partial<GameState> {
    const isDecrypting = state.phase === 'DECRYPTING';
    const nextThermal = CoolingSystem.step(state.thermal, state.power, isDecrypting, dt);

    // Event Triggers
    if (nextThermal.isCritical && !this.lastWasCritical) {
      this.lastWasCritical = true;
      sfxBank.playOverheatAlarm();
      globalEventBus.emit('thermal:critical', { temperature: nextThermal.currentTemperature });
    } else if (!nextThermal.isCritical && this.lastWasCritical && nextThermal.currentTemperature < 60.0) {
      this.lastWasCritical = false;
      globalEventBus.emit('thermal:normalized', { temperature: nextThermal.currentTemperature });
    }

    if (nextThermal.isOverheating && !this.lastWasWarning) {
      this.lastWasWarning = true;
      globalEventBus.emit('thermal:warning', { temperature: nextThermal.currentTemperature });
    } else if (!nextThermal.isOverheating && this.lastWasWarning) {
      this.lastWasWarning = false;
    }

    return {
      thermal: nextThermal,
    };
  }
}

export const thermalSimulation = new ThermalSimulation();
