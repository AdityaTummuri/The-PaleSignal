// ═════════════════════════════════════════════════════════════════════════════
// src/rendering/components/Oscilloscope.ts — Dual-Trace Cathode Ray Oscilloscope
// ═════════════════════════════════════════════════════════════════════════════

import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { signalSynth } from '@core/audio/SignalSynth';

export class Oscilloscope {
  readonly view = new Container();

  private bezelGfx = new Graphics();
  private gridGfx = new Graphics();
  private traceGfx = new Graphics();
  private lockIndicatorGfx = new Graphics();
  private lockLabel!: Text;

  private width: number = 380;
  private height: number = 220;
  private isLocked: boolean = false;
  private phaseLock: number = 0;

  constructor(width: number = 380, height: number = 220) {
    this.width = width;
    this.height = height;

    this.setupUI();
  }

  private setupUI(): void {
    this.view.label = 'Oscilloscope';

    // 1. Outer Bezel & Dark CRT Glass Screen
    this.bezelGfx.roundRect(0, 0, this.width, this.height, 10);
    this.bezelGfx.fill({ color: 0x071109 });
    this.bezelGfx.stroke({ color: 0x223528, width: 3 });

    // 2. Graticule / Reticle Grid
    this.drawGrid();

    // 3. Lock Status Indicator
    const lockStyle = new TextStyle({
      fontFamily: 'IBM Plex Mono, monospace',
      fontSize: 11,
      fill: '#5b8c63',
      letterSpacing: 1,
    });

    this.lockLabel = new Text({
      text: 'CARRIER UNLOCKED',
      style: lockStyle,
    });
    this.lockLabel.position.set(16, this.height - 24);

    this.view.addChild(this.bezelGfx);
    this.view.addChild(this.gridGfx);
    this.view.addChild(this.traceGfx);
    this.view.addChild(this.lockIndicatorGfx);
    this.view.addChild(this.lockLabel);

    this.updateLockIndicator(0);
  }

  private drawGrid(): void {
    this.gridGfx.clear();
    const cols = 10;
    const rows = 6;
    const colStep = this.width / cols;
    const rowStep = this.height / rows;

    // Subtle grid lines
    for (let c = 1; c < cols; c++) {
      this.gridGfx.moveTo(c * colStep, 0);
      this.gridGfx.lineTo(c * colStep, this.height);
      this.gridGfx.stroke({ color: 0x14281a, width: 1 });
    }

    for (let r = 1; r < rows; r++) {
      this.gridGfx.moveTo(0, r * rowStep);
      this.gridGfx.lineTo(this.width, r * rowStep);
      this.gridGfx.stroke({ color: 0x14281a, width: 1 });
    }

    // Center Crosshairs (brighter)
    const midX = this.width / 2;
    const midY = this.height / 2;

    this.gridGfx.moveTo(midX, 0);
    this.gridGfx.lineTo(midX, this.height);
    this.gridGfx.stroke({ color: 0x24422c, width: 1.5 });

    this.gridGfx.moveTo(0, midY);
    this.gridGfx.lineTo(this.width, midY);
    this.gridGfx.stroke({ color: 0x24422c, width: 1.5 });
  }

  setLockState(phaseLock: number): void {
    this.phaseLock = phaseLock;
    this.isLocked = phaseLock >= 0.85;
    this.updateLockIndicator(phaseLock);
  }

  private updateLockIndicator(lock: number): void {
    this.lockIndicatorGfx.clear();
    const x = this.width - 24;
    const y = this.height - 18;

    this.lockIndicatorGfx.circle(x, y, 6);
    if (this.isLocked) {
      this.lockIndicatorGfx.fill({ color: 0x73d982 });
      this.lockLabel.text = 'CARRIER PHASE LOCKED [OK]';
      this.lockLabel.style.fill = '#a8ffb2';
    } else if (lock > 0.3) {
      this.lockIndicatorGfx.fill({ color: 0xe6b800 });
      this.lockLabel.text = `LOCKING... ${(lock * 100).toFixed(0)}%`;
      this.lockLabel.style.fill = '#e6b800';
    } else {
      this.lockIndicatorGfx.fill({ color: 0x331111 });
      this.lockLabel.text = 'NO CARRIER SIGNAL';
      this.lockLabel.style.fill = '#5b8c63';
    }
  }

  update(): void {
    this.traceGfx.clear();

    const samples = signalSynth.getWaveformData();
    if (!samples || samples.length === 0) return;

    const midY = this.height / 2;
    const stepX = this.width / samples.length;

    // Trace A: Main Signal Waveform (Bright Phosphor Green)
    this.traceGfx.moveTo(0, midY + (samples[0] ?? 0) * (this.height * 0.4));

    for (let i = 1; i < samples.length; i++) {
      const val = samples[i] ?? 0;
      const x = i * stepX;
      const y = midY + val * (this.height * 0.4);
      this.traceGfx.lineTo(x, y);
    }

    const traceColor = this.isLocked ? 0xa8ffb2 : 0x73d982;
    this.traceGfx.stroke({ color: traceColor, width: 2, alpha: 0.9 });

    // Trace B: Reference Demodulator wave (Orange/Amber) if locking
    if (this.phaseLock > 0.1) {
      const time = performance.now() * 0.005;
      this.traceGfx.moveTo(0, midY);

      for (let i = 0; i < samples.length; i += 2) {
        const x = i * stepX;
        const refY = midY + Math.sin(time + i * 0.08) * (this.height * 0.25 * this.phaseLock);
        this.traceGfx.lineTo(x, refY);
      }

      this.traceGfx.stroke({ color: 0xffbb55, width: 1.5, alpha: this.phaseLock * 0.7 });
    }
  }
}
