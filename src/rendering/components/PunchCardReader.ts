// ═════════════════════════════════════════════════════════════════════════════
// src/rendering/components/PunchCardReader.ts — Electro-Mechanical Card Feeder
// ═════════════════════════════════════════════════════════════════════════════

import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import gsap from 'gsap';
import { sfxBank } from '@core/audio/SFXBank';
import type { PunchCard } from '@typings/index';

export class PunchCardReader {
  readonly view = new Container();

  private slotGfx = new Graphics();
  private cardContainer = new Container();
  private cardGfx = new Graphics();
  private cardLabel!: Text;
  private cardOpText!: Text;
  private statusLabel!: Text;
  private sensorLedsGfx = new Graphics();

  private width: number = 320;
  private height: number = 180;
  private isProcessing: boolean = false;

  constructor() {
    this.setupUI();
  }

  private setupUI(): void {
    this.view.label = 'PunchCardReader';

    // 1. Heavy Metal Reader Chasis & Slot
    this.drawChassis();

    // 2. Card Visual in slot
    const opStyle = new TextStyle({
      fontFamily: 'VT323, monospace',
      fontSize: 24,
      fill: '#1c2820',
      letterSpacing: 2,
    });

    const subStyle = new TextStyle({
      fontFamily: 'IBM Plex Mono, monospace',
      fontSize: 10,
      fill: '#334d3a',
    });

    const statusStyle = new TextStyle({
      fontFamily: 'IBM Plex Mono, monospace',
      fontSize: 11,
      fill: '#5b8c63',
      letterSpacing: 1,
    });

    this.cardOpText = new Text({
      text: 'READY',
      style: opStyle,
    });
    this.cardOpText.anchor.set(0.5);

    this.cardLabel = new Text({
      text: 'PUNCH CARD FEEDER',
      style: subStyle,
    });
    this.cardLabel.anchor.set(0.5);
    this.cardLabel.position.set(0, 16);

    this.cardContainer.addChild(this.cardGfx);
    this.cardContainer.addChild(this.cardOpText);
    this.cardContainer.addChild(this.cardLabel);
    this.cardContainer.position.set(this.width / 2, -40); // Hidden initially

    this.statusLabel = new Text({
      text: 'FEEDER IDLE // INSERT CARD',
      style: statusStyle,
    });
    this.statusLabel.anchor.set(0.5);
    this.statusLabel.position.set(this.width / 2, this.height - 20);

    this.view.addChild(this.slotGfx);
    this.view.addChild(this.cardContainer);
    this.view.addChild(this.sensorLedsGfx);
    this.view.addChild(this.statusLabel);

    this.drawCardVisual('SHIFT', 2);
    this.cardContainer.visible = false;
  }

  private drawChassis(): void {
    this.slotGfx.clear();

    // Chassis Box
    this.slotGfx.roundRect(0, 0, this.width, this.height, 8);
    this.slotGfx.fill({ color: 0x121814 });
    this.slotGfx.stroke({ color: 0x223528, width: 2 });

    // Intake slot aperture
    const slotW = 260;
    const slotH = 24;
    const slotX = (this.width - slotW) / 2;
    const slotY = 45;

    this.slotGfx.roundRect(slotX, slotY, slotW, slotH, 4);
    this.slotGfx.fill({ color: 0x050806 });
    this.slotGfx.stroke({ color: 0x4a7352, width: 2 });

    // Metallic guide arrows
    this.slotGfx.moveTo(slotX - 12, slotY + slotH / 2);
    this.slotGfx.lineTo(slotX - 4, slotY + slotH / 2);
    this.slotGfx.stroke({ color: 0x73d982, width: 2 });

    this.slotGfx.moveTo(slotX + slotW + 12, slotY + slotH / 2);
    this.slotGfx.lineTo(slotX + slotW + 4, slotY + slotH / 2);
    this.slotGfx.stroke({ color: 0x73d982, width: 2 });
  }

  private drawCardVisual(op: string, cost: number): void {
    this.cardGfx.clear();
    const cardW = 220;
    const cardH = 90;

    // Manila cardboard texture
    this.cardGfx.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 4);
    this.cardGfx.fill({ color: 0xd9c89e });
    this.cardGfx.stroke({ color: 0x8a7a58, width: 2 });

    // Cut corner top-right (classic IBM punch card style)
    this.cardGfx.moveTo(cardW / 2 - 16, -cardH / 2);
    this.cardGfx.lineTo(cardW / 2, -cardH / 2 + 16);
    this.cardGfx.stroke({ color: 0xd9c89e, width: 3 });

    // Punch holes pattern
    for (let c = 0; c < 8; c++) {
      const hx = -cardW / 2 + 25 + c * 24;
      for (let r = 0; r < 3; r++) {
        const hy = -cardH / 2 + 18 + r * 14;
        if ((c + r) % 2 === 0) {
          this.cardGfx.rect(hx - 3, hy - 4, 6, 8);
          this.cardGfx.fill({ color: 0x221a0f });
        }
      }
    }

    this.cardOpText.text = `[ ${op} ] PWR: ${cost}`;
  }

  /**
   * Play the card intake & optical read sequence.
   */
  async feedCard(card: PunchCard): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    this.drawCardVisual(card.operationType, card.powerCost);
    this.cardContainer.visible = true;
    this.cardContainer.position.set(this.width / 2, -20);
    this.statusLabel.text = `PROCESSING ${card.operationType}...`;
    this.statusLabel.style.fill = '#e6b800';

    sfxBank.playCardFeed();

    // GSAP feed animation: card slides down into optical read chamber
    await gsap.to(this.cardContainer, {
      y: 55,
      duration: 0.35,
      ease: 'power2.inOut',
    });

    // Optical read LED blink pulse
    this.flashOpticalSensors();

    await new Promise((resolve) => setTimeout(resolve, 300));

    // Card drops fully into read hopper
    await gsap.to(this.cardContainer, {
      y: 110,
      alpha: 0,
      duration: 0.25,
      ease: 'power1.in',
      onComplete: () => {
        this.cardContainer.visible = false;
        this.cardContainer.alpha = 1;
        this.cardContainer.y = -40;
      },
    });

    this.statusLabel.text = 'OPERATION APPLIED // READY';
    this.statusLabel.style.fill = '#a8ffb2';
    this.isProcessing = false;
  }

  private flashOpticalSensors(): void {
    this.sensorLedsGfx.clear();
    const slotY = 45;
    for (let i = 0; i < 4; i++) {
      const lx = this.width / 2 - 45 + i * 30;
      this.sensorLedsGfx.circle(lx, slotY - 10, 3);
      this.sensorLedsGfx.fill({ color: 0x73d982 });
    }

    gsap.delayedCall(0.2, () => {
      this.sensorLedsGfx.clear();
    });
  }
}
