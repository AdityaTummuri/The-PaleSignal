// ═════════════════════════════════════════════════════════════════════════════
// src/rendering/components/FrequencyDial.ts — Heavy Rotary Radio Tuning Dial
// ═════════════════════════════════════════════════════════════════════════════

import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import gsap from 'gsap';
import { sfxBank } from '@core/audio/SFXBank';
import { globalEventBus } from '@core/events/EventBus';
import { SIGNAL } from '@typings/constants';

export class FrequencyDial {
  readonly view = new Container();

  private baseGfx = new Graphics();
  private knobGfx = new Graphics();
  private readoutText!: Text;
  private labelText!: Text;

  private radius: number = 80;
  private currentFrequency: number = 45.0; // MHz
  private visualAngle: number = 0; // Radians
  private isDragging: boolean = false;
  private lastDragAngle: number = 0;
  private lastTickStep: number = 0;

  constructor(initialFreq: number = 45.0) {
    this.currentFrequency = initialFreq;
    this.setupVisuals();
    this.bindEvents();
    this.updateKnobRotation();
  }

  get frequency(): number {
    return this.currentFrequency;
  }

  setFrequency(mhz: number): void {
    this.currentFrequency = Math.min(Math.max(mhz, SIGNAL.MIN_FREQUENCY), SIGNAL.MAX_FREQUENCY);
    this.updateKnobRotation();
    this.updateReadout();
  }

  private setupVisuals(): void {
    this.view.label = 'FrequencyDial';
    this.view.eventMode = 'static';
    this.view.cursor = 'grab';

    // 1. Base Bezel with etched frequency markings
    this.drawBezel();

    // 2. Rotary Knob Face
    this.drawKnob();

    // 3. Readout & Label Texts
    const labelStyle = new TextStyle({
      fontFamily: 'IBM Plex Mono, monospace',
      fontSize: 12,
      fill: '#5b8c63',
      letterSpacing: 2,
    });

    const readoutStyle = new TextStyle({
      fontFamily: 'VT323, monospace',
      fontSize: 26,
      fill: '#a8ffb2',
      letterSpacing: 2,
    });

    this.labelText = new Text({
      text: 'CARRIER FREQUENCY (MHz)',
      style: labelStyle,
    });
    this.labelText.anchor.set(0.5);
    this.labelText.position.set(0, this.radius + 28);

    this.readoutText = new Text({
      text: `${this.currentFrequency.toFixed(1)} MHz`,
      style: readoutStyle,
    });
    this.readoutText.anchor.set(0.5);
    this.readoutText.position.set(0, this.radius + 52);

    this.view.addChild(this.baseGfx);
    this.view.addChild(this.knobGfx);
    this.view.addChild(this.labelText);
    this.view.addChild(this.readoutText);
  }

  private drawBezel(): void {
    this.baseGfx.clear();

    // Outer mounting ring
    this.baseGfx.circle(0, 0, this.radius + 18);
    this.baseGfx.fill({ color: 0x121815 });
    this.baseGfx.stroke({ color: 0x223528, width: 2 });

    // Tick marks around circumference
    const tickCount = 36;
    for (let i = 0; i < tickCount; i++) {
      const angle = (i / tickCount) * Math.PI * 2;
      const isMajor = i % 4 === 0;
      const innerR = this.radius + (isMajor ? 4 : 8);
      const outerR = this.radius + 14;

      const x1 = Math.cos(angle) * innerR;
      const y1 = Math.sin(angle) * innerR;
      const x2 = Math.cos(angle) * outerR;
      const y2 = Math.sin(angle) * outerR;

      this.baseGfx.moveTo(x1, y1);
      this.baseGfx.lineTo(x2, y2);
      this.baseGfx.stroke({
        color: isMajor ? 0x73d982 : 0x2e4f35,
        width: isMajor ? 2 : 1,
      });
    }
  }

  private drawKnob(): void {
    this.knobGfx.clear();

    // Brushed metal dial body
    this.knobGfx.circle(0, 0, this.radius);
    this.knobGfx.fill({ color: 0x1e2a22 });
    this.knobGfx.stroke({ color: 0x4a7352, width: 3 });

    // Inner knurled ring
    this.knobGfx.circle(0, 0, this.radius - 12);
    this.knobGfx.fill({ color: 0x16201a });
    this.knobGfx.stroke({ color: 0x2e4635, width: 1.5 });

    // Raised indicator notch
    this.knobGfx.roundRect(-4, -this.radius + 4, 8, 22, 2);
    this.knobGfx.fill({ color: 0xa8ffb2 });

    // Center jewel cap
    this.knobGfx.circle(0, 0, 14);
    this.knobGfx.fill({ color: 0x0e1411 });
    this.knobGfx.stroke({ color: 0x73d982, width: 1 });
  }

  private bindEvents(): void {
    this.knobGfx.eventMode = 'static';
    this.knobGfx.cursor = 'grab';

    this.knobGfx.on('pointerdown', (e) => {
      this.isDragging = true;
      this.view.cursor = 'grabbing';
      this.knobGfx.cursor = 'grabbing';

      const localPos = this.view.toLocal(e.global);
      this.lastDragAngle = Math.atan2(localPos.y, localPos.x);
    });

    const onPointerMove = (e: any) => {
      if (!this.isDragging) return;

      const localPos = this.view.toLocal(e.global);
      const currentAngle = Math.atan2(localPos.y, localPos.x);
      let deltaAngle = currentAngle - this.lastDragAngle;

      // Handle wrapping across ±PI
      if (deltaAngle > Math.PI) deltaAngle -= Math.PI * 2;
      if (deltaAngle < -Math.PI) deltaAngle += Math.PI * 2;

      this.lastDragAngle = currentAngle;
      this.visualAngle += deltaAngle;

      // Map rotation to frequency: 1 full turn (2PI) = 30 MHz change
      const freqDelta = (deltaAngle / (Math.PI * 2)) * 30.0;
      this.currentFrequency = Math.min(
        Math.max(this.currentFrequency + freqDelta, SIGNAL.MIN_FREQUENCY),
        SIGNAL.MAX_FREQUENCY
      );

      // Play notched click audio every 0.5 MHz step
      const currentStep = Math.floor(this.currentFrequency * 2);
      if (currentStep !== this.lastTickStep) {
        sfxBank.playDialTick();
        this.lastTickStep = currentStep;
      }

      this.knobGfx.rotation = this.visualAngle;
      this.updateReadout();

      globalEventBus.emit('signal:frequency-changed', { frequency: this.currentFrequency });
    };

    const onPointerUp = () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.view.cursor = 'grab';
        this.knobGfx.cursor = 'grab';
      }
    };

    this.knobGfx.on('globalpointermove', onPointerMove);
    this.knobGfx.on('pointerup', onPointerUp);
    this.knobGfx.on('pointerupoutside', onPointerUp);
  }

  private updateKnobRotation(): void {
    // Map frequency to angle
    const ratio = (this.currentFrequency - SIGNAL.MIN_FREQUENCY) / (SIGNAL.MAX_FREQUENCY - SIGNAL.MIN_FREQUENCY);
    this.visualAngle = ratio * Math.PI * 8; // 4 full revolutions across band
    gsap.to(this.knobGfx, {
      rotation: this.visualAngle,
      duration: 0.1,
      ease: 'none',
    });
  }

  private updateReadout(): void {
    this.readoutText.text = `${this.currentFrequency.toFixed(1)} MHz`;
  }
}
