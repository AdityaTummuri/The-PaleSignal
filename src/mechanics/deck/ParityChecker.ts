// ═════════════════════════════════════════════════════════════════════════════
// src/mechanics/deck/ParityChecker.ts — Parity Checksum & Pattern Validation
// ═════════════════════════════════════════════════════════════════════════════

export interface ParityResult {
  readonly isMatch: boolean;
  readonly matchCount: number;
  readonly totalExpected: number;
  readonly matchRatio: number; // 0.0 to 1.0
  readonly currentParities: readonly number[];
}

export class ParityChecker {
  /**
   * Calculate 8-bit even parity bit for a single byte value.
   * Returns 1 if number of 1-bits is odd, 0 if even (even parity scheme).
   */
  static calculateByteParity(val: number): number {
    let x = val & 0xff;
    x ^= x >> 4;
    x ^= x >> 2;
    x ^= x >> 1;
    return x & 1;
  }

  /**
   * Calculate the parity pattern for an entire array of data blocks.
   */
  static calculatePattern(blocks: readonly number[]): readonly number[] {
    return Object.freeze(blocks.map((b) => ParityChecker.calculateByteParity(b)));
  }

  /**
   * Validate current blocks against target encounter parity pattern.
   */
  static validate(
    blocks: readonly number[],
    targetPattern: readonly number[]
  ): ParityResult {
    const currentParities = ParityChecker.calculatePattern(blocks);
    const totalExpected = Math.max(targetPattern.length, 1);
    let matchCount = 0;

    for (let i = 0; i < targetPattern.length; i++) {
      if (i < currentParities.length && currentParities[i] === targetPattern[i]) {
        matchCount++;
      }
    }

    const matchRatio = matchCount / totalExpected;
    const isMatch = matchCount === targetPattern.length && blocks.length === targetPattern.length;

    return {
      isMatch,
      matchCount,
      totalExpected,
      matchRatio,
      currentParities,
    };
  }
}
