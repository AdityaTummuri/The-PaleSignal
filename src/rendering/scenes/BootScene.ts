// ═════════════════════════════════════════════════════════════════════════════
// src/rendering/scenes/BootScene.ts — Atmospheric Station Boot Sequence
// ═════════════════════════════════════════════════════════════════════════════

import { Container, Text, TextStyle, Graphics } from 'pixi.js';
import type { Scene } from './SceneManager';
import gsap from 'gsap';

export class BootScene implements Scene {
  readonly view = new Container();
  private titleText!: Text;
  private statusText!: Text;
  private progressBar = new Graphics();
  private scanlineGfx = new Graphics();
  private progress: number = 0;
  private width: number = 1920;
  private height: number = 1080;
  private onBootComplete?: () => void;

  constructor(onBootComplete?: () => void) {
    this.onBootComplete = onBootComplete;
    this.setupUI();
  }

  private setupUI(): void {
    const titleStyle = new TextStyle({
      fontFamily: 'VT323, monospace',
      fontSize: 48,
      fill: '#a8ffb2',
      letterSpacing: 4,
    });

    const statusStyle = new TextStyle({
      fontFamily: 'IBM Plex Mono, monospace',
      fontSize: 16,
      fill: '#5b8c63',
      letterSpacing: 2,
    });

    this.titleText = new Text({
      text: 'THE PALE SIGNAL // STATION 7-B',
      style: titleStyle,
    });
    this.titleText.anchor.set(0.5);

    this.statusText = new Text({
      text: 'CALIBRATING VACUUM TUBES & RF OSCILLATOR...',
      style: statusStyle,
    });
    this.statusText.anchor.set(0.5);

    this.view.addChild(this.scanlineGfx);
    this.view.addChild(this.titleText);
    this.view.addChild(this.statusText);
    this.view.addChild(this.progressBar);
  }

  enter(): void {
    this.progress = 0;
    this.titleText.alpha = 0;
    this.statusText.alpha = 0;

    const tl = gsap.timeline({
      onComplete: () => {
        if (this.onBootComplete) {
          this.onBootComplete();
        }
      },
    });

    tl.to(this.titleText, { alpha: 1, duration: 0.8, ease: 'rough' })
      .to(this.statusText, { alpha: 1, duration: 0.4 }, '-=0.2')
      .to(this, {
        progress: 1.0,
        duration: 1.6,
        ease: 'power1.inOut',
        onUpdate: () => {
          if (this.progress > 0.35 && this.progress < 0.7) {
            this.statusText.text = 'PRIMING ANALOG DEMODULATOR & TAPE REELS...';
          } else if (this.progress >= 0.7) {
            this.statusText.text = 'RECEIVER READY. STANDBY FOR OPERATOR INPUT.';
          }
          this.drawProgress();
        },
      });
  }

  private drawProgress(): void {
    this.progressBar.clear();
    const barWidth = 400;
    const barHeight = 8;
    const x = (this.width - barWidth) / 2;
    const y = this.height / 2 + 60;

    // Track
    this.progressBar.rect(x - 2, y - 2, barWidth + 4, barHeight + 4);
    this.progressBar.stroke({ color: 0x22442a, width: 1 });

    // Fill
    this.progressBar.rect(x, y, barWidth * this.progress, barHeight);
    this.progressBar.fill({ color: 0x73d982 });
  }

  exit(): void {
    gsap.killTweensOf(this);
    gsap.killTweensOf(this.titleText);
    gsap.killTweensOf(this.statusText);
  }

  resize(w: number, h: number): void {
    this.width = w;
    this.height = h;

    this.titleText.position.set(w / 2, h / 2 - 40);
    this.statusText.position.set(w / 2, h / 2 + 20);
    this.drawProgress();
  }
}
