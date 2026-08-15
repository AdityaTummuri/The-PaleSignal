// ═════════════════════════════════════════════════════════════════════════════
// src/rendering/components/SignalMeter.ts — Analog VU Signal Strength Meter
// ═════════════════════════════════════════════════════════════════════════════

import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import gsap from 'gsap';

export class SignalMeter {
  readonly view = new Container();

  private bezelGfx = new Graphics();
  private needleGfx = new Graphics();
  private valueText!: Text;
  private labelText!: Text;

  private width: number = 220;
  private height: number = 140;
  private currentSnr: number = 0; // 0.0 to 1.0

  constructor() {
    this.setupUI();
  }

  private setupUI(): void {
    this.view.label = 'SignalMeter';

    this.drawDialFace();

    const labelStyle = new TextStyle({
      fontFamily: 'IBM Plex Mono, monospace',
      fontSize: 10,
      fill: '#5b8c63',
      letterSpacing: 1,
    });

    const valStyle = new TextStyle({
      fontFamily: 'VT323, monospace',
      fontSize: 22,
      fill: '#a8ffb2',
      letterSpacing: 2,
    });

    this.labelText = new Text({
      text: 'SIGNAL / NOISE (SNR)',
      style: labelStyle,
    });
    this.labelText.anchor.set(0.5);
    this.labelText.position.set(this.width / 2, this.height - 35);

    this.valueText = new Text({
      text: '0.00 dB',
      style: valStyle,
    });
    this.valueText.anchor.set(0.5);
    this.valueText.position.set(this.width / 2, this.height - 16);

    this.view.addChild(this.bezelGfx);
    this.view.addChild(this.needleGfx);
    this.view.addChild(this.labelText);
    this.view.addChild(this.valueText);

    this.drawNeedle();
  }

  private drawDialFace(): void {
    this.bezelGfx.clear();

    // Outer Bezel
    this.bezelGfx.roundRect(0, 0, this.width, this.height, 8);
    this.bezelGfx.fill({ color: 0x121815 });
    this.bezelGfx.stroke({ color: 0x223528, width: 2 });

    const pivotX = this.width / 2;
    const pivotY = this.height - 40;
    const radius = 65;

    // Scale Arc
    this.bezelGfx.arc(pivotX, pivotY, radius, -Math.PI * 0.75, -Math.PI * 0.25);
    this.bezelGfx.stroke({ color: 0x2e4f35, width: 4 });

    // Strong Signal Zone
    this.bezelGfx.arc(pivotX, pivotY, radius, -Math.PI * 0.42, -Math.PI * 0.25);
    this.bezelGfx.stroke({ color: 0x73d982, width: 4 });
  }

  private drawNeedle(): void {
    this.needleGfx.clear();
    const pivotX = this.width / 2;
    const pivotY = this.height - 40;
    const length = 55;

    this.needleGfx.position.set(pivotX, pivotY);
    this.needleGfx.rotation = -Math.PI * 0.75;

    // Needle
    this.needleGfx.moveTo(0, 0);
    this.needleGfx.lineTo(0, -length);
    this.needleGfx.stroke({ color: 0xffbb44, width: 2 });

    // Pivot cap
    this.needleGfx.circle(0, 0, 5);
    this.needleGfx.fill({ color: 0x222222 });
    this.needleGfx.stroke({ color: 0x777777, width: 1.5 });
  }

  setSNR(snr: number): void {
    this.currentSnr = Math.min(Math.max(snr, 0), 1.0);
    const db = this.currentSnr * 24.0;
    this.valueText.text = `+${db.toFixed(1)} dB`;

    // Map SNR 0-1 to angle [-0.75 PI, -0.25 PI]
    const targetAngle = -Math.PI * 0.75 + this.currentSnr * (Math.PI * 0.5);

    // Realistic VU spring bounce
    gsap.to(this.needleGfx, {
      rotation: targetAngle,
      duration: 0.3,
      ease: 'elastic.out(1, 0.4)',
    });
  }
}
