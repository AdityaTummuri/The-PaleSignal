// ═════════════════════════════════════════════════════════════════════════════
// src/core/state/GameStateManager.ts — Immutable Game State Store
// ═════════════════════════════════════════════════════════════════════════════

import type {
  GameState,
  SignalTelemetry,
  StationThermalState,
  PowerDistribution,
  TapeDeckState,
  CipherScramblerState,
} from '@typings/index';
import { THERMAL, POWER, SIGNAL } from '@typings/constants';

export type StateListener = (state: GameState, prevState: GameState) => void;

export function createInitialState(): GameState {
  const initialSignal: SignalTelemetry = {
    currentFrequency: 45.0,
    carrierDetected: false,
    carrierFrequency: 0,
    signalNoiseRatio: 0,
    bandpassCenter: 1000,
    bandpassQ: SIGNAL.BANDPASS_DEFAULT_Q,
    phaseLock: 0,
    demodulationProgress: 0,
    waveformSamples: new Float32Array(SIGNAL.SAMPLE_BUFFER_SIZE),
  };

  const initialThermal: StationThermalState = {
    currentTemperature: THERMAL.AMBIENT,
    ambientTemperature: THERMAL.AMBIENT,
    heatGenerationRate: 0,
    coolingRate: 0,
    fanSpeed: POWER.DEFAULT_FAN,
    isOverheating: false,
    isCritical: false,
  };

  const initialPower: PowerDistribution = {
    totalPower: POWER.TOTAL_WATTS,
    fanAllocation: POWER.DEFAULT_FAN,
    amplifierAllocation: POWER.DEFAULT_AMP,
    tapeDeckAllocation: POWER.DEFAULT_TAPE,
  };

  const initialTape: TapeDeckState = {
    tapeIntegrity: 1.0,
    decayRate: 0.005,
    isPlaying: false,
    playbackPosition: 0,
    flutterIntensity: 0,
  };

  return {
    phase: 'BOOT',
    signal: initialSignal,
    thermal: initialThermal,
    power: initialPower,
    tape: initialTape,
    hand: [],
    drawPile: [],
    discardPile: [],
    currentEncounter: null,
    encounterIndex: 0,
    totalEncounters: 3,
    dataBlocks: [],
    decodedBlocks: [],
    score: 0,
    elapsedTime: 0,
    cipherScrambler: null,
  };
}

export class GameStateManager {
  private state: GameState;
  private listeners = new Set<StateListener>();

  constructor(initialState: GameState = createInitialState()) {
    this.state = initialState;
  }

  getState(): Readonly<GameState> {
    return this.state;
  }

  /**
   * Update state immutably by applying a partial patch or updater function.
   */
  setState(updater: Partial<GameState> | ((prev: GameState) => GameState)): void {
    const prevState = this.state;
    const nextState = typeof updater === 'function' ? updater(prevState) : { ...prevState, ...updater };

    this.state = Object.freeze(nextState);

    for (const listener of this.listeners) {
      try {
        listener(this.state, prevState);
      } catch (err) {
        console.error('[GameStateManager] Error in state listener:', err);
      }
    }
  }

  /**
   * Helper to update only the signal telemetry sub-state.
   */
  updateSignal(updater: Partial<SignalTelemetry> | ((prev: SignalTelemetry) => SignalTelemetry)): void {
    this.setState((prev) => ({
      ...prev,
      signal: typeof updater === 'function' ? updater(prev.signal) : { ...prev.signal, ...updater },
    }));
  }

  /**
   * Helper to update only the station thermal sub-state.
   */
  updateThermal(updater: Partial<StationThermalState> | ((prev: StationThermalState) => StationThermalState)): void {
    this.setState((prev) => ({
      ...prev,
      thermal: typeof updater === 'function' ? updater(prev.thermal) : { ...prev.thermal, ...updater },
    }));
  }

  /**
   * Helper to update power allocations.
   */
  updatePower(fan: number, amp: number, tape: number): void {
    const sum = fan + amp + tape;
    const normalizedFan = sum > 0 ? fan / sum : POWER.DEFAULT_FAN;
    const normalizedAmp = sum > 0 ? amp / sum : POWER.DEFAULT_AMP;
    const normalizedTape = sum > 0 ? tape / sum : POWER.DEFAULT_TAPE;

    this.setState((prev) => ({
      ...prev,
      power: {
        totalPower: prev.power.totalPower,
        fanAllocation: normalizedFan,
        amplifierAllocation: normalizedAmp,
        tapeDeckAllocation: normalizedTape,
      },
    }));
  }

  /**
   * Helper to update tape state.
   */
  updateTape(updater: Partial<TapeDeckState> | ((prev: TapeDeckState) => TapeDeckState)): void {
    this.setState((prev) => ({
      ...prev,
      tape: typeof updater === 'function' ? updater(prev.tape) : { ...prev.tape, ...updater },
    }));
  }

  /**
   * Helper to update cipher scrambler state.
   */
  updateCipherScrambler(scrambler: CipherScramblerState | null): void {
    this.setState({ cipherScrambler: scrambler });
  }

  /**
   * Subscribe to state updates.
   */
  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const gameStateStore = new GameStateManager();
