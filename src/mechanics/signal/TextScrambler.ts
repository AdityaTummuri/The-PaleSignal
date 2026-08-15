// ═════════════════════════════════════════════════════════════════════════════
// src/mechanics/signal/TextScrambler.ts — Deterministic Procedural Cipher Scrambler
// ═════════════════════════════════════════════════════════════════════════════

import { TELETYPE, ENGINE } from '@typings/constants';
import type { CipherScramblerConfig, CipherScramblerState } from '@typings/index';

export interface TextScramblerCallbacks {
  onUpdate?: (renderedText: string, progress: number) => void;
  onCharResolved?: (char: string, index: number) => void;
  onComplete?: (fullDecodedText: string) => void;
}

export class TextScrambler {
  private targetText: string = '';
  private glyphPool: string = TELETYPE.DEFAULT_GLYPH_POOL;
  private durationMs: number = TELETYPE.DEFAULT_DURATION_MS;
  private elapsedMs: number = 0;
  private resolvedCount: number = 0;
  private isRunning: boolean = false;
  private isComplete: boolean = false;

  // Fixed accumulator for deterministic stepping
  private accumulator: number = 0;
  private readonly fixedDtMs: number = ENGINE.FIXED_DT * 1000; // ~16.667ms

  // Callbacks
  private callbacks: TextScramblerCallbacks;

  constructor(callbacks: TextScramblerCallbacks = {}) {
    this.callbacks = callbacks;
  }

  /**
   * Start a new cipher text decrypt / scramble reveal sequence.
   */
  start(config: Partial<CipherScramblerConfig> & { targetText: string }): void {
    this.targetText = config.targetText;
    this.glyphPool = config.glyphPool ?? TELETYPE.DEFAULT_GLYPH_POOL;
    this.durationMs = Math.max(config.durationMs ?? TELETYPE.DEFAULT_DURATION_MS, 500);
    this.elapsedMs = 0;
    this.resolvedCount = 0;
    this.accumulator = 0;
    this.isRunning = true;
    this.isComplete = false;

    this.emitUpdate();
  }

  /**
   * Step the scrambler simulation forward by dt (in seconds).
   * Safe against frame rate throttling via accumulator loop.
   */
  update(dtSeconds: number): void {
    if (!this.isRunning || this.isComplete || this.targetText.length === 0) return;

    this.accumulator += dtSeconds * 1000;

    while (this.accumulator >= this.fixedDtMs) {
      this.stepFixed(this.fixedDtMs);
      this.accumulator -= this.fixedDtMs;
      if (this.isComplete) break;
    }
  }

  private stepFixed(dtMs: number): void {
    this.elapsedMs += dtMs;
    const totalChars = this.targetText.length;
    const progress = Math.min(this.elapsedMs / this.durationMs, 1.0);

    // Calculate how many characters should be resolved by this timestamp
    const targetResolved = Math.floor(progress * totalChars);

    while (this.resolvedCount < targetResolved && this.resolvedCount < totalChars) {
      const resolvedChar = this.targetText[this.resolvedCount]!;
      this.callbacks.onCharResolved?.(resolvedChar, this.resolvedCount);
      this.resolvedCount++;
    }

    this.emitUpdate();

    if (this.resolvedCount >= totalChars || progress >= 1.0) {
      this.isComplete = true;
      this.isRunning = false;
      this.callbacks.onComplete?.(this.targetText);
    }
  }

  private emitUpdate(): void {
    const rendered = this.getRenderedText();
    const progress = this.targetText.length > 0 ? this.resolvedCount / this.targetText.length : 1.0;
    this.callbacks.onUpdate?.(rendered, progress);
  }

  /**
   * Produce the current visual representation with resolved chars + scrambling glyphs.
   */
  getRenderedText(): string {
    if (!this.isRunning && !this.isComplete) return '';

    let output = '';
    const poolLen = this.glyphPool.length;

    for (let i = 0; i < this.targetText.length; i++) {
      const char = this.targetText[i]!;

      if (i < this.resolvedCount) {
        // Resolved original character
        output += char;
      } else if (char === ' ' || char === '\n') {
        // Preserve whitespace & formatting structure
        output += char;
      } else {
        // Scrambling random glyph from pool
        const randIdx = Math.floor(Math.random() * poolLen);
        output += this.glyphPool[randIdx];
      }
    }

    return output;
  }

  getState(): CipherScramblerState {
    return {
      renderedText: this.getRenderedText(),
      resolvedCount: this.resolvedCount,
      totalChars: this.targetText.length,
      isComplete: this.isComplete,
      elapsedMs: this.elapsedMs,
    };
  }

  cancel(): void {
    this.isRunning = false;
    this.isComplete = true;
  }
}
