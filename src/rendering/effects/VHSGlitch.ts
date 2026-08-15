// ═════════════════════════════════════════════════════════════════════════════
// src/rendering/effects/VHSGlitch.ts — VHS Signal Tear & Distortion Overlay
// ═════════════════════════════════════════════════════════════════════════════

import { Container, Graphics } from 'pixi.js';

export class VHSGlitch {
  readonly view = new Container();
  private glitchGfx = new Graphics();
  private activeTime: number = 0;
  private duration: number = 0;
  private intensity: number = 0;
  private width: number = 1920;
  private height: number = 1080;

  constructor() {
    this.view.addChild(this.glitchGfx);
  }

  resize(w: number, h: number): void {
    this.width = w;
    this.height = h;
  }

  /**
   * Trigger a burst of horizontal scanline sync tears.
   */
  triggerGlitch(intensity: number = 0.5, duration: number = 0.25): void {
    this.intensity = intensity;
    this.duration = duration;
    this.activeTime = duration;
  }

  update(dt: number): void {
    this.glitchGfx.clear();

    if (this.activeTime <= 0) return;

    this.activeTime -= dt;
    const progress = this.activeTime / this.duration;

    // Draw 3-8 random horizontal noise bands
    const bandCount = Math.floor(3 + Math.random() * 5 * this.intensity);

    for (let i = 0; i < bandCount; i++) {
      const y = Math.random() * this.height;
      const bandHeight = 2 + Math.random() * 8 * this.intensity;
      const alpha = (0.15 + Math.random() * 0.35) * progress * this.intensity;

      // Inverted or bright noise bar
      const isBright = Math.random() > 0.4;
      const color = isBright ? 0xccffdd : 0x05080c;

      this.glitchGfx.rect(0, y, this.width, bandHeight);
      this.glitchGfx.fill({ color, alpha });
    }
  }
}
