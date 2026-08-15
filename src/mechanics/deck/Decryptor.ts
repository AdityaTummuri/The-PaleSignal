// ═════════════════════════════════════════════════════════════════════════════
// src/mechanics/deck/Decryptor.ts — Block Decryption Processor
// ═════════════════════════════════════════════════════════════════════════════

import { applyCardOperation } from './PunchCard';
import type { CardOperation } from '@typings/index';

export class Decryptor {
  /**
   * Apply a punch card operation to a specific target data block index.
   */
  static applyCardToBlock(
    blocks: readonly number[],
    targetIndex: number,
    operation: CardOperation
  ): readonly number[] {
    if (targetIndex < 0 || targetIndex >= blocks.length) {
      return blocks;
    }

    const currentVal = blocks[targetIndex] ?? 0;
    const transformed = applyCardOperation(operation, currentVal);

    const nextBlocks = [...blocks];
    nextBlocks[targetIndex] = transformed;

    return Object.freeze(nextBlocks);
  }

  /**
   * Apply an operation to all data blocks at once (e.g. global filter).
   */
  static applyCardToAllBlocks(
    blocks: readonly number[],
    operation: CardOperation
  ): readonly number[] {
    return Object.freeze(blocks.map((b) => applyCardOperation(operation, b)));
  }

  /**
   * Convert decoded byte blocks to readable ASCII characters.
   */
  static blocksToText(blocks: readonly number[]): string {
    return blocks.map((b) => String.fromCharCode(b & 0x7f)).join('');
  }
}
