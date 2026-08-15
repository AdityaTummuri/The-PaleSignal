// ═════════════════════════════════════════════════════════════════════════════
// src/rendering/components/TapeDeck.ts — Reel-to-Reel Magnetic Tape Transport
// ═════════════════════════════════════════════════════════════════════════════

import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { sfxBank } from '@core/audio/SFXBank';
import { globalEventBus } from '@core/events/EventBus';

export class TapeDeck {
  readonly view = new Container();

  private chassisGfx = new Graphics();
  private leftReelGfx = new Graphics();
  private rightReelGfx = new Graphics();
  private tapeRibbonGfx = new Graphics();
  private playBtnGfx = new Graphics();
  private playBtnText!: Text;
  private integrityText!: Text;

  private width: number = 320;
  private height: number = 180;
  private isPlaying: boolean = false;
  private leftReelAngle: number = 0;
  private rightReelAngle: number = 0;
  private tapeIntegrity: number = 1.0;

  constructor() {
    this.setupUI();
    this.bindEvents();
  }

  private setupUI(): void {
    this.view.label = 'TapeDeck';

    this.drawChassis();

    // Setup Reels
    this.leftReelGfx.position.set(75, 70);
    this.rightReelGfx.position.set(this.width - 75, 70);
    this.drawReel(this.leftReelGfx, 40, true);
    this.drawReel(this.rightReelGfx, 40, false);

    // Play Button & Text
    const btnStyle = new TextStyle({
      fontFamily: 'VT323, monospace',
      fontSize: 18,
      fill: '#08110b',
      letterSpacing: 1,
    });

    const infoStyle = new TextStyle({
      fontFamily: 'IBM Plex Mono, monospace',
      fontSize: 10,
      fill: '#5b8c63',
    });

    this.playBtnText = new Text({
      text: '▶ PLAY RECORDER',
      style: btnStyle,
    });
    this.playBtnText.anchor.set(0.5);
    this.playBtnText.position.set(this.width / 2, this.height - 24);

    this.integrityText = new Text({
      text: 'TAPE INTEGRITY: 100%',
      style: infoStyle,
    });
    this.integrityText.anchor.set(0.5);
    this.integrityText.position.set(this.width / 2, 20);

    this.view.addChild(this.chassisGfx);
    this.view.addChild(this.tapeRibbonGfx);
    this.view.addChild(this.leftReelGfx);
    this.view.addChild(this.rightReelGfx);
    this.view.addChild(this.playBtnGfx);
    this.view.addChild(this.playBtnText);
    this.view.addChild(this.integrityText);

    this.drawPlayButton();
    this.drawTapeRibbon();
  }

  private drawChassis(): void {
    this.chassisGfx.clear();

    // Metal Case
    this.chassisGfx.roundRect(0, 0, this.width, this.height, 8);
    this.chassisGfx.fill({ color: 0x121815 });
    this.chassisGfx.stroke({ color: 0x223528, width: 2 });

    // Recessed Reel Bay
    this.chassisGfx.roundRect(15, 32, this.width - 30, 85, 6);
    this.chassisGfx.fill({ color: 0x080e0a });
    this.chassisGfx.stroke({ color: 0x1c2e21, width: 1.5 });

    // Center Magnetic Read/Write Head Block
    const headX = this.width / 2;
    const headY = 95;
    this.chassisGfx.roundRect(headX - 18, headY, 36, 18, 3);
    this.chassisGfx.fill({ color: 0x334438 });
    this.chassisGfx.stroke({ color: 0x557760, width: 1 });
  }

  private drawReel(gfx: Graphics, radius: number, isLeft: boolean): void {
    gfx.clear();

    // Dark tape spool
    const tapeRadius = isLeft ? radius * 0.85 : radius * 0.45;
    gfx.circle(0, 0, tapeRadius);
    gfx.fill({ color: 0x24170d }); // Magnetic oxide brown

    // Aluminum 3-spoke reel flange
    gfx.circle(0, 0, radius);
    gfx.stroke({ color: 0x5b8c63, width: 2 });

    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      gfx.moveTo(0, 0);
      gfx.lineTo(Math.cos(angle) * (radius - 4), Math.sin(angle) * (radius - 4));
      gfx.stroke({ color: 0x3e5e44, width: 3 });
    }

    // Center spindle
    gfx.circle(0, 0, 8);
    gfx.fill({ color: 0x111111 });
    gfx.stroke({ color: 0x73d982, width: 1.5 });
  }

  private drawTapeRibbon(): void {
    this.tapeRibbonGfx.clear();
    const lx = 75;
    const rx = this.width - 75;
    const ly = 70;
    const ry = 70;
    const headX = this.width / 2;
    const headY = 95;

    // Tape path across heads
    this.tapeRibbonGfx.moveTo(lx, ly + 30);
    this.tapeRibbonGfx.lineTo(headX - 16, headY + 4);
    this.tapeRibbonGfx.lineTo(headX + 16, headY + 4);
    this.tapeRibbonGfx.lineTo(rx, ry + 30);
    this.tapeRibbonGfx.stroke({ color: 0x3a2215, width: 3 });
  }

  private drawPlayButton(): void {
    this.playBtnGfx.clear();
    const btnW = 160;
    const btnH = 32;
    const btnX = this.width / 2;
    const btnY = this.height - 24;

    this.playBtnGfx.roundRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 4);
    this.playBtnGfx.fill({ color: this.isPlaying ? 0xffbb44 : 0x73d982 });
    this.playBtnGfx.stroke({ color: 0xa8ffb2, width: 1.5 });

    this.playBtnText.text = this.isPlaying ? '⏹ STOP RECORDER' : '▶ PLAY RECORDER';
  }

  private bindEvents(): void {
    this.playBtnGfx.eventMode = 'static';
    this.playBtnGfx.cursor = 'pointer';

    this.playBtnGfx.on('pointerdown', () => {
      this.isPlaying = !this.isPlaying;
      sfxBank.playTapeClunk();
      this.drawPlayButton();
      globalEventBus.emit('tape:toggle-play', { isPlaying: this.isPlaying });
    });
  }

  setIntegrity(val: number): void {
    this.tapeIntegrity = Math.max(0, Math.min(val, 1.0));
    const pct = Math.floor(this.tapeIntegrity * 100);
    this.integrityText.text = `TAPE INTEGRITY: ${pct}%`;
    if (this.tapeIntegrity < 0.25) {
      this.integrityText.style.fill = '#ff4444';
    } else {
      this.integrityText.style.fill = '#5b8c63';
    }
  }

  update(dt: number): void {
    if (this.isPlaying && this.tapeIntegrity > 0) {
      // Rotate reels
      const speed = dt * 4.5;
      this.leftReelAngle += speed;
      this.rightReelAngle += speed;

      this.leftReelGfx.rotation = this.leftReelAngle;
      this.rightReelGfx.rotation = this.rightReelAngle;

      // Slowly degrade tape integrity during active playback
      this.setIntegrity(this.tapeIntegrity - dt * 0.003);
    }
  }
}
