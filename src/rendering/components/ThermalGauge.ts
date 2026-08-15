// ═════════════════════════════════════════════════════════════════════════════
// src/rendering/components/ThermalGauge.ts — Analog Galvanometer Thermal Meter
// ═════════════════════════════════════════════════════════════════════════════

import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import gsap from 'gsap';
import { THERMAL } from '@typings/constants';

export class ThermalGauge {
  readonly view = new Container();

  private bezelGfx = new Graphics();
  private needleGfx = new Graphics();
  private warningGfx = new Graphics();
  private tempText!: Text;
  private labelText!: Text;

  private width: number = 220;
  private height: number = 140;
  private currentTemp: number = 20.0;
  private needleAngle: number = -0.75; // Radians

  constructor() {
    this.setupUI();
  }

  private setupUI(): void {
    this.view.label = 'ThermalGauge';

    this.drawDialFace();

    const labelStyle = new TextStyle({
      fontFamily: 'IBM Plex Mono, monospace',
      fontSize: 10,
      fill: '#5b8c63',
      letterSpacing: 1,
    });

    const tempStyle = new TextStyle({
      fontFamily: 'VT323, monospace',
      fontSize: 22,
      fill: '#a8ffb2',
      letterSpacing: 2,
    });

    this.labelText = new Text({
      text: 'CORE TEMPERATURE',
      style: labelStyle,
    });
    this.labelText.anchor.set(0.5);
    this.labelText.position.set(this.width / 2, this.height - 35);

    this.tempText = new Text({
      text: '20.0 °C',
      style: tempStyle,
    });
    this.tempText.anchor.set(0.5);
    this.tempText.position.set(this.width / 2, this.height - 16);

    this.view.addChild(this.bezelGfx);
    this.view.addChild(this.warningGfx);
    this.view.addChild(this.needleGfx);
    this.view.addChild(this.labelText);
    this.view.addChild(this.tempText);

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

    // Green Safe Arc (-0.75 to 0.0 rad)
    this.bezelGfx.arc(pivotX, pivotY, radius, -Math.PI * 0.75, -Math.PI * 0.45);
    this.bezelGfx.stroke({ color: 0x73d982, width: 5 });

    // Yellow Warning Arc (-0.45 to -0.3 rad)
    this.bezelGfx.arc(pivotX, pivotY, radius, -Math.PI * 0.45, -Math.PI * 0.32);
    this.bezelGfx.stroke({ color: 0xe6b800, width: 5 });

    // Red Critical Arc (-0.3 to -0.25 rad)
    this.bezelGfx.arc(pivotX, pivotY, radius, -Math.PI * 0.32, -Math.PI * 0.25);
    this.bezelGfx.stroke({ color: 0xdd3333, width: 5 });
  }

  private drawNeedle(): void {
    this.needleGfx.clear();
    const pivotX = this.width / 2;
    const pivotY = this.height - 40;
    const length = 55;

    this.needleGfx.position.set(pivotX, pivotY);
    this.needleGfx.rotation = this.needleAngle;

    // Needle Arm
    this.needleGfx.moveTo(0, 0);
    this.needleGfx.lineTo(0, -length);
    this.needleGfx.stroke({ color: 0xff4444, width: 2 });

    // Pivot cap
    this.needleGfx.circle(0, 0, 5);
    this.needleGfx.fill({ color: 0x222222 });
    this.needleGfx.stroke({ color: 0x777777, width: 1.5 });
  }

  setTemperature(tempC: number): void {
    this.currentTemp = Math.min(Math.max(tempC, 0), THERMAL.MAX_TEMPERATURE);
    this.tempText.text = `${this.currentTemp.toFixed(1)} °C`;

    // Map 0-100°C to angle range [-0.75 PI, -0.25 PI]
    const ratio = this.currentTemp / THERMAL.MAX_TEMPERATURE;
    const targetAngle = -Math.PI * 0.75 + ratio * (Math.PI * 0.5);

    gsap.to(this.needleGfx, {
      rotation: targetAngle,
      duration: 0.25,
      ease: 'power2.out',
    });

    if (this.currentTemp >= THERMAL.CRITICAL_THRESHOLD) {
      this.tempText.style.fill = '#ff4444';
      this.warningGfx.circle(this.width - 18, 18, 5);
      this.warningGfx.fill({ color: 0xff2222 });
    } else if (this.currentTemp >= THERMAL.WARNING_THRESHOLD) {
      this.tempText.style.fill = '#e6b800';
      this.warningGfx.circle(this.width - 18, 18, 5);
      this.warningGfx.fill({ color: 0xe6b800 });
    } else {
      this.tempText.style.fill = '#a8ffb2';
      this.warningGfx.clear();
    }
  }
}
