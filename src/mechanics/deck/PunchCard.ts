// ═════════════════════════════════════════════════════════════════════════════
// src/mechanics/deck/PunchCard.ts — Punch Card Logic & Mathematical Operations
// ═════════════════════════════════════════════════════════════════════════════

import type { CardOperation, PunchCard } from '@typings/index';

export function createCard(
  cardId: string,
  operationType: CardOperation,
  powerCost: number = 1
): PunchCard {
  return Object.freeze({
    cardId,
    operationType,
    powerCost,
    isExhausted: false,
  });
}

/**
 * Apply the mathematical transformation of a punch card operation to a data block byte [0, 255].
 */
export function applyCardOperation(operation: CardOperation, byteVal: number, param: number = 1): number {
  const byte = Math.floor(byteVal) & 0xff;

  switch (operation) {
    case 'SHIFT':
      // Circular 8-bit left shift / rotation
      return ((byte << param) | (byte >> (8 - param))) & 0xff;

    case 'INVERT':
      // Bitwise 8-bit inversion (NOT)
      return (~byte) & 0xff;

    case 'AMPLIFY':
      // Scalar multiplication with modulo 256
      return (byte * 2) % 256;

    case 'FILTER':
      // High-pass threshold filter
      return byte >= 128 ? byte : (byte << 1) & 0xff;

    default:
      return byte;
  }
}
