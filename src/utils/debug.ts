// ═════════════════════════════════════════════════════════════════════════════
// src/utils/debug.ts — 60 FPS Profiler & Debug Diagnostics Overlay
// ═════════════════════════════════════════════════════════════════════════════

import { Container, Text, TextStyle } from 'pixi.js';

export class FPSDebugger {
  readonly view = new Container();
  private text: Text;
  private frames: number = 0;
  private lastTime: number = performance.now();
  private fps: number = 60;

  constructor() {
    this.view.label = 'FPSDebugger';
    this.view.eventMode = 'none';

    const style = new TextStyle({
      fontFamily: 'IBM Plex Mono, monospace',
      fontSize: 10,
      fill: '#1a3320',
    });

    this.text = new Text({
      text: '60 FPS',
      style,
    });
    this.text.eventMode = 'none';
    this.text.position.set(10, 10);
    this.view.addChild(this.text);
  }

  update(): void {
    this.frames++;
    const now = performance.now();
    const delta = now - this.lastTime;

    if (delta >= 500) {
      this.fps = Math.round((this.frames * 1000) / delta);
      this.frames = 0;
      this.lastTime = now;
      this.text.text = `${this.fps} FPS // ${(1000 / Math.max(this.fps, 1)).toFixed(1)}ms`;
    }
  }
}
