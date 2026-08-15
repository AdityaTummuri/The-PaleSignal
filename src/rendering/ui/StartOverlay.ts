// ═════════════════════════════════════════════════════════════════════════════
// src/rendering/ui/StartOverlay.ts — Autoplay Audio Unlock & Start Overlay
// ═════════════════════════════════════════════════════════════════════════════

import { Container, Graphics, Text, TextStyle, Rectangle } from 'pixi.js';
import gsap from 'gsap';
import { audioUnlockManager } from '@core/audio/AudioUnlockManager';
import { sfxBank } from '@core/audio/SFXBank';
import { globalEventBus } from '@core/events/EventBus';

export class StartOverlay {
  readonly view = new Container();
  private bg = new Graphics();
  private buttonGfx = new Graphics();
  private buttonText!: Text;
  private promptText!: Text;
  private subText!: Text;
  private isActivated: boolean = false;
  private onStartCallback?: () => void;

  constructor(onStart?: () => void) {
    this.onStartCallback = onStart;
    this.setupUI();
    this.bindEvents();
  }

  private setupUI(): void {
    this.view.label = 'StartOverlay';
    this.view.eventMode = 'static';
    this.view.cursor = 'pointer';

    const headerStyle = new TextStyle({
      fontFamily: 'VT323, "Courier New", monospace',
      fontSize: 32,
      fill: '#a8ffb2',
      letterSpacing: 3,
      align: 'center',
    });

    const subStyle = new TextStyle({
      fontFamily: 'IBM Plex Mono, "Courier New", monospace',
      fontSize: 14,
      fill: '#5b8c63',
      letterSpacing: 1,
      align: 'center',
    });

    const btnStyle = new TextStyle({
      fontFamily: 'VT323, "Courier New", monospace',
      fontSize: 28,
      fill: '#08110b',
      letterSpacing: 2,
    });

    this.promptText = new Text({
      text: '[ SHORTWAVE TELEMETRY SYSTEM // COASTAL SECTOR 7 ]',
      style: headerStyle,
    });
    this.promptText.anchor.set(0.5);

    this.subText = new Text({
      text: 'CLICK ANYWHERE OR PRESS BUTTON TO ENGAGE POWER & AUDIO SYNTHESIS',
      style: subStyle,
    });
    this.subText.anchor.set(0.5);

    this.buttonText = new Text({
      text: 'INITIALIZE RECEIVER',
      style: btnStyle,
    });
    this.buttonText.anchor.set(0.5);

    this.bg.eventMode = 'static';
    this.bg.cursor = 'pointer';
    this.buttonGfx.eventMode = 'static';
    this.buttonGfx.cursor = 'pointer';

    this.view.addChild(this.bg);
    this.view.addChild(this.promptText);
    this.view.addChild(this.subText);
    this.view.addChild(this.buttonGfx);
    this.view.addChild(this.buttonText);
  }

  private bindEvents(): void {
    const triggerStart = () => {
      if (this.isActivated) return;
      this.isActivated = true;

      // 1. Fire-and-forget hardware unlock
      audioUnlockManager.unlock().catch(() => {});
      try {
        sfxBank.playSwitchClick(true);
      } catch {}

      // 2. Animate out immediately without waiting
      gsap.to(this.view, {
        alpha: 0,
        duration: 0.35,
        ease: 'power2.out',
        onComplete: () => {
          this.view.visible = false;
          globalEventBus.emit('fsm:transition', { from: 'AUDIO_LOCKED', to: 'STATION_ACTIVE' });
          this.onStartCallback?.();
        },
      });
    };

    this.view.on('pointerdown', triggerStart);
    this.bg.on('pointerdown', triggerStart);
    this.buttonGfx.on('pointerdown', triggerStart);

    // Hover effect
    this.buttonGfx.on('pointerover', () => {
      if (!this.isActivated) {
        gsap.to(this.buttonGfx.scale, { x: 1.06, y: 1.06, duration: 0.2 });
        gsap.to(this.buttonText.scale, { x: 1.06, y: 1.06, duration: 0.2 });
      }
    });

    this.buttonGfx.on('pointerout', () => {
      if (!this.isActivated) {
        gsap.to(this.buttonGfx.scale, { x: 1.0, y: 1.0, duration: 0.2 });
        gsap.to(this.buttonText.scale, { x: 1.0, y: 1.0, duration: 0.2 });
      }
    });
  }

  resize(w: number, h: number): void {
    this.view.hitArea = new Rectangle(0, 0, w, h);
    this.bg.hitArea = new Rectangle(0, 0, w, h);

    this.bg.clear();
    this.bg.rect(0, 0, w, h);
    this.bg.fill({ color: 0x050a07, alpha: 0.92 });

    this.promptText.position.set(w / 2, h / 2 - 80);
    this.subText.position.set(w / 2, h / 2 - 35);

    const btnW = 320;
    const btnH = 55;
    const btnX = w / 2;
    const btnY = h / 2 + 50;

    this.buttonGfx.clear();
    this.buttonGfx.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
    this.buttonGfx.fill({ color: 0x73d982 });
    this.buttonGfx.stroke({ color: 0xa8ffb2, width: 2 });
    this.buttonGfx.position.set(btnX, btnY);
    this.buttonGfx.hitArea = new Rectangle(-btnW / 2, -btnH / 2, btnW, btnH);

    this.buttonText.position.set(btnX, btnY);
  }
}
