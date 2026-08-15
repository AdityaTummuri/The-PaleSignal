// ═════════════════════════════════════════════════════════════════════════════
// src/core/engine/GameFSM.ts — Game State Machine Instance & Transition Rules
// ═════════════════════════════════════════════════════════════════════════════

import { FSM, type TransitionRule } from './FSM';
import type { GamePhase } from '@typings/index';
import { globalEventBus } from '@core/events/EventBus';

export const GAME_PHASE_RULES: readonly TransitionRule<GamePhase>[] = [
  // Asset load complete
  { from: 'BOOT', to: 'AUDIO_LOCKED' },

  // User unlocks Web Audio API
  { from: 'AUDIO_LOCKED', to: 'STATION_ACTIVE' },

  // Frequency dial / encounter sweep initiated
  { from: 'STATION_ACTIVE', to: 'INTERCEPTING' },

  // Carrier lock achieved, data stream received
  { from: 'INTERCEPTING', to: 'DECRYPTING' },

  // Overheat safety cutouts
  { from: ['INTERCEPTING', 'DECRYPTING'], to: 'MAINTENANCE_OVERHEAT' },

  // Recovered from overheat cooling cycle
  { from: 'MAINTENANCE_OVERHEAT', to: 'STATION_ACTIVE' },

  // All blocks decoded and parity verified
  { from: 'DECRYPTING', to: 'TRANSMISSION_RESOLVED' },

  // Advancing to next signal or restart
  { from: 'TRANSMISSION_RESOLVED', to: 'STATION_ACTIVE' },
];

export function createGameFSM(initialPhase: GamePhase = 'BOOT'): FSM<GamePhase> {
  const fsm = new FSM<GamePhase>(initialPhase, GAME_PHASE_RULES);

  fsm.onTransition((from, to) => {
    globalEventBus.emit('fsm:transition', { from, to });
    globalEventBus.emit('fsm:phase-entered', { phase: to });
  });

  return fsm;
}
