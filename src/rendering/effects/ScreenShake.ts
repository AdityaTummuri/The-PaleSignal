// ═════════════════════════════════════════════════════════════════════════════
// src/rendering/effects/ScreenShake.ts — Impulse-Driven Camera Shake
// ═════════════════════════════════════════════════════════════════════════════

import type { Container } from 'pixi.js';

export class ScreenShake {
  private trauma: number = 0; // 0.0 to 1.0
  private targetContainer: Container | null = null;
  private originX: number = 0;
  private originY: number = 0;
  private maxOffset: number = 18;
  private maxAngle: number = 0.03; // radians
  private time: number = 0;

  attach(container: Container): void {
    this.targetContainer = container;
    this.originX = container.x;
    this.originY = container.y;
  }

  /**
   * Add shock impulse (0.0 to 1.0). Trauma is non-linear (squared).
   */
  addTrauma(amount: number): void {
    this.trauma = Math.min(1.0, this.trauma + amount);
  }

  update(dt: number): void {
    if (!this.targetContainer) return;

    if (this.trauma > 0) {
      this.time += dt * 35;
      const shake = this.trauma * this.trauma; // Non-linear response curve

      // Simplex-style pseudo noise
      const offsetX = (Math.sin(this.time * 1.3) + Math.cos(this.time * 2.7)) * this.maxOffset * shake;
      const offsetY = (Math.cos(this.time * 1.7) + Math.sin(this.time * 3.1)) * this.maxOffset * shake;
      const angle = Math.sin(this.time * 2.1) * this.maxAngle * shake;

      this.targetContainer.x = this.originX + offsetX;
      this.targetContainer.y = this.originY + offsetY;
      this.targetContainer.rotation = angle;

      // Decay trauma over time
      this.trauma = Math.max(0, this.trauma - dt * 1.6);
    } else {
      this.targetContainer.x = this.originX;
      this.targetContainer.y = this.originY;
      this.targetContainer.rotation = 0;
    }
  }
}
