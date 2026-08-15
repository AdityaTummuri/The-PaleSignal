// ═════════════════════════════════════════════════════════════════════════════
// src/mechanics/deck/CardDeck.ts — Immutable Deck, Hand & Discard Management
// ═════════════════════════════════════════════════════════════════════════════

import type { PunchCard } from '@typings/index';
import { createPRNG } from '@utils/math';

export interface DeckState {
  readonly drawPile: readonly PunchCard[];
  readonly hand: readonly PunchCard[];
  readonly discardPile: readonly PunchCard[];
}

export class CardDeck {
  /**
   * Shuffle an array of cards using Fisher-Yates and a seeded PRNG.
   */
  static shuffle(cards: readonly PunchCard[], seed: number = Date.now()): PunchCard[] {
    const prng = createPRNG(seed);
    const result = [...cards];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(prng() * (i + 1));
      const temp = result[i]!;
      result[i] = result[j]!;
      result[j] = temp;
    }
    return result;
  }

  /**
   * Draw up to `count` cards from drawPile to hand, reshuffling discard if empty.
   */
  static drawCards(state: DeckState, count: number, seed: number = Date.now()): DeckState {
    let drawPile = [...state.drawPile];
    let discardPile = [...state.discardPile];
    const hand = [...state.hand];

    for (let i = 0; i < count; i++) {
      if (drawPile.length === 0) {
        if (discardPile.length === 0) break; // Out of cards
        drawPile = CardDeck.shuffle(discardPile, seed + i);
        discardPile = [];
      }

      const drawnCard = drawPile.pop();
      if (drawnCard) {
        hand.push(drawnCard);
      }
    }

    return {
      drawPile: Object.freeze(drawPile),
      hand: Object.freeze(hand),
      discardPile: Object.freeze(discardPile),
    };
  }

  /**
   * Play a card from hand to discard pile.
   */
  static playCard(state: DeckState, cardId: string): { state: DeckState; playedCard: PunchCard | null } {
    const cardIdx = state.hand.findIndex((c) => c.cardId === cardId);
    if (cardIdx === -1) {
      return { state, playedCard: null };
    }

    const playedCard = state.hand[cardIdx]!;
    const nextHand = state.hand.filter((_, idx) => idx !== cardIdx);
    const nextDiscard = [...state.discardPile, playedCard];

    return {
      state: {
        drawPile: state.drawPile,
        hand: Object.freeze(nextHand),
        discardPile: Object.freeze(nextDiscard),
      },
      playedCard,
    };
  }
}
