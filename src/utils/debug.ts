// ═════════════════════════════════════════════════════════════════════════════
// src/utils/debug.ts — Dev-Only 60 FPS Profiler & State Inspector
// ═════════════════════════════════════════════════════════════════════════════

import { Container, Text, TextStyle } from 'pixi.js';

export class FPSDebugger {
  readonly view = new Container();
  private fpsText!: Text;
  private frameCount: number = 0;
  private lastTime: number = performance.now();
  private currentFps: number = 60;

  constructor() {
    this.view.label = 'FPSDebugger';

    const style = new TextStyle({
      fontFamily: 'IBM Plex Mono, monospace',
      fontSize: 11,
      fill: '#51cf66',
    });

    this.fpsText = new Text({
      text: '60 FPS // 16.6ms',
      style,
    });
    this.fpsText.position.set(10, 10);
    this.view.addChild(this.fpsText);
  }

  update(): void {
    this.frameCount++;
    const now = performance.now();
    const delta = now - this.lastTime;

    if (delta >= 500) {
      this.currentFps = Math.round((this.frameCount * 1000) / delta);
      const frameMs = (1000 / Math.max(this.currentFps, 1)).toFixed(1);
      this.fpsText.text = `${this.currentFps} FPS // ${frameMs}ms`;
      this.frameCount = 0;
      this.lastTime = now;
    }
  }
}
