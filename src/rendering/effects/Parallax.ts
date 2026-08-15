// ═════════════════════════════════════════════════════════════════════════════
// src/rendering/effects/Parallax.ts — Interactive Micro-Parallax Controller
// ═════════════════════════════════════════════════════════════════════════════

import type { Container } from 'pixi.js';

export interface ParallaxLayer {
  container: Container;
  depth: number; // e.g. 0.02 for station desk, 0.05 for instruments, 0.08 for overlays
}

export class Parallax {
  private targetX: number = 0;
  private targetY: number = 0;
  private currentX: number = 0;
  private currentY: number = 0;
  private layers: ParallaxLayer[] = [];
  private enabled: boolean = true;

  constructor() {
    this.handleMouseMove = this.handleMouseMove.bind(this);
    if (typeof window !== 'undefined') {
      window.addEventListener('pointermove', this.handleMouseMove, { passive: true });
    }
  }

  addLayer(container: Container, depth: number): void {
    this.layers.push({ container, depth });
  }

  private handleMouseMove(e: PointerEvent): void {
    if (!this.enabled) return;
    const normX = (e.clientX / window.innerWidth) * 2 - 1;
    const normY = (e.clientY / window.innerHeight) * 2 - 1;
    this.targetX = normX * 25; // max ±25px offset
    this.targetY = normY * 18; // max ±18px offset
  }

  update(dt: number): void {
    // Smooth lerp follow
    const factor = Math.min(1.0, dt * 8.0);
    this.currentX += (this.targetX - this.currentX) * factor;
    this.currentY += (this.targetY - this.currentY) * factor;

    for (const layer of this.layers) {
      layer.container.x = this.currentX * layer.depth;
      layer.container.y = this.currentY * layer.depth;
    }
  }

  dispose(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('pointermove', this.handleMouseMove);
    }
    this.layers = [];
  }
}
