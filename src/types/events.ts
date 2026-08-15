// ═════════════════════════════════════════════════════════════════════════════
// src/types/events.ts — Typed Event Payload Contracts
// ═════════════════════════════════════════════════════════════════════════════

import type { GamePhase, PunchCard, EncounterConfig } from './index';

export interface EventBusMap {
  // ── FSM Transitions ──
  'fsm:transition': { from: GamePhase; to: GamePhase };
  'fsm:phase-entered': { phase: GamePhase };

  // ── Signal Events ──
  'signal:carrier-detected': { frequency: number; snr: number };
  'signal:carrier-lost': undefined;
  'signal:lock-achieved': { phaseLock: number };
  'signal:demodulation-complete': { dataBlocks: readonly number[] };
  'signal:frequency-changed': { frequency: number };
  'signal:bandpass-changed': { center: number; q: number };

  // ── Card Events ──
  'card:played': { card: PunchCard; targetBlockIndex: number };
  'card:drawn': { card: PunchCard };
  'card:exhausted': { cardId: string };
  'deck:reshuffled': undefined;

  // ── Thermal Events ──
  'thermal:warning': { temperature: number };
  'thermal:critical': { temperature: number };
  'thermal:normalized': { temperature: number };

  // ── Power Events ──
  'power:redistributed': { fan: number; amp: number; tape: number };

  // ── Tape Events ──
  'tape:degraded': { integrity: number };
  'tape:destroyed': undefined;
  'tape:toggle-play': { isPlaying: boolean };

  // ── Encounter Events ──
  'encounter:loaded': { config: EncounterConfig };
  'encounter:completed': { score: number };
  'encounter:failed': { reason: string };

  // ── Audio Events ──
  'audio:unlocked': undefined;
  'audio:context-suspended': undefined;

  // ── Engine Events ──
  'engine:tick': { dt: number; alpha: number };
  'engine:paused': undefined;
  'engine:resumed': undefined;

  // ── Rendering Events ──
  'render:context-lost': undefined;
  'render:context-restored': undefined;
  'render:scene-ready': { sceneName: string };

  // ── Teletype / Cipher Events ──
  'cipher:started': { targetText: string; durationMs: number };
  'cipher:char-resolved': { char: string; index: number };
  'cipher:update': { renderedText: string; progress: number };
  'cipher:resolved': { decodedMessage: string };
}
