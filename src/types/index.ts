// ═════════════════════════════════════════════════════════════════════════════
// src/types/index.ts — The Pale Signal Immutable Type System
// ═════════════════════════════════════════════════════════════════════════════

// ──── Game FSM States ────
export type GamePhase =
  | 'BOOT'
  | 'AUDIO_LOCKED'
  | 'STATION_ACTIVE'
  | 'INTERCEPTING'
  | 'DECRYPTING'
  | 'MAINTENANCE_OVERHEAT'
  | 'TRANSMISSION_RESOLVED';

// ──── Punch Card Operations ────
export type CardOperation = 'SHIFT' | 'INVERT' | 'AMPLIFY' | 'FILTER';

// ──── Signal Telemetry ────
export interface SignalTelemetry {
  readonly currentFrequency: number;        // 10.0 – 140.0 MHz
  readonly carrierDetected: boolean;
  readonly carrierFrequency: number;        // Target carrier freq (MHz)
  readonly signalNoiseRatio: number;        // 0.0 – 1.0
  readonly bandpassCenter: number;          // Hz
  readonly bandpassQ: number;               // Resonance quality
  readonly phaseLock: number;               // 0.0 – 1.0 (lock strength)
  readonly demodulationProgress: number;    // 0.0 – 1.0
  readonly waveformSamples: Float32Array;   // Current oscilloscope buffer
}

// ──── Punch Card ────
export interface PunchCard {
  readonly cardId: string;
  readonly operationType: CardOperation;
  readonly powerCost: number;
  readonly isExhausted: boolean;
}

// ──── Station Thermal State ────
export interface StationThermalState {
  readonly currentTemperature: number;      // °C (ambient ~20, critical ~85)
  readonly ambientTemperature: number;      // °C
  readonly heatGenerationRate: number;      // °C/s from active equipment
  readonly coolingRate: number;             // °C/s from fans
  readonly fanSpeed: number;                // 0.0 – 1.0
  readonly isOverheating: boolean;          // true when >= 75°C
  readonly isCritical: boolean;             // true when >= 85°C (triggers FSM)
}

// ──── Power Distribution ────
export interface PowerDistribution {
  readonly totalPower: number;              // Total available units (e.g. 100)
  readonly fanAllocation: number;           // 0.0 – 1.0
  readonly amplifierAllocation: number;     // 0.0 – 1.0
  readonly tapeDeckAllocation: number;      // 0.0 – 1.0
}

// ──── Tape Deck ────
export interface TapeDeckState {
  readonly tapeIntegrity: number;           // 1.0 (pristine) → 0.0 (destroyed)
  readonly decayRate: number;               // Integrity loss per second of playback
  readonly isPlaying: boolean;
  readonly playbackPosition: number;        // 0.0 – 1.0
  readonly flutterIntensity: number;        // Audio flutter from wear
}

// ──── Encounter Configuration ────
export interface EncounterConfig {
  readonly encounterSeed: number;
  readonly frequencyBand: number;           // 10.0 – 140.0 MHz
  readonly waveformComplexity: 1 | 2 | 3 | 4 | 5;
  readonly signalNoiseRatio: number;        // 0.1 – 0.95
  readonly targetParityPattern: readonly number[];
  readonly tapeDecayRate: number;
  readonly rewardCardPool: readonly PunchCard[];
  readonly rawEncryptedBlocks: readonly number[];
  readonly targetDecodedText: string;
  readonly sourceStationName: string;
}

// ──── Teletype / Cipher Scrambler ────
export interface CipherScramblerConfig {
  readonly targetText: string;
  readonly durationMs: number;
  readonly glyphPool: string;
  readonly charsPerStep: number;            // Characters revealed per fixed step
}

export interface CipherScramblerState {
  readonly renderedText: string;            // Current visual output
  readonly resolvedCount: number;           // How many chars are resolved
  readonly totalChars: number;
  readonly isComplete: boolean;
  readonly elapsedMs: number;
}

// ──── Core Game State (Single Source of Truth) ────
export interface GameState {
  readonly phase: GamePhase;
  readonly signal: SignalTelemetry;
  readonly thermal: StationThermalState;
  readonly power: PowerDistribution;
  readonly tape: TapeDeckState;
  readonly hand: readonly PunchCard[];      // Player's active cards
  readonly drawPile: readonly PunchCard[];
  readonly discardPile: readonly PunchCard[];
  readonly currentEncounter: EncounterConfig | null;
  readonly encounterIndex: number;          // Which encounter we're on
  readonly totalEncounters: number;
  readonly dataBlocks: readonly number[];   // Current working encrypted data blocks
  readonly decodedBlocks: readonly number[];// Decrypted output so far
  readonly score: number;
  readonly elapsedTime: number;             // Total session time in seconds
  readonly cipherScrambler: CipherScramblerState | null; // Active teletype decode
}
