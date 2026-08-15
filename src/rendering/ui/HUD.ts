// ═════════════════════════════════════════════════════════════════════════════
// src/rendering/ui/HUD.ts — Station Power Distribution Sliders & Top Telemetry Bar
// ═════════════════════════════════════════════════════════════════════════════

import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { PowerGrid } from '@mechanics/maintenance/PowerGrid';
import { globalEventBus } from '@core/events/EventBus';
import type { GameState } from '@typings/index';

export class HUD {
  readonly view = new Container();

  private topBarGfx = new Graphics();
  private powerPanelGfx = new Graphics();
  private stationTitleText!: Text;
  private phaseBadgeText!: Text;
  private scoreText!: Text;

  // Power Sliders
  private fanSliderGfx = new Graphics();
  private ampSliderGfx = new Graphics();
  private tapeSliderGfx = new Graphics();
  private fanText!: Text;
  private ampText!: Text;
  private tapeText!: Text;

  private isDraggingSlider: 'fan' | 'amp' | 'tape' | null = null;
  private currentPower = { fan: 0.35, amp: 0.40, tape: 0.25 };

  constructor() {
    this.setupUI();
    this.bindEvents();
  }

  private setupUI(): void {
    this.view.label = 'HUD';

    const headerStyle = new TextStyle({
      fontFamily: 'VT323, monospace',
      fontSize: 22,
      fill: '#a8ffb2',
      letterSpacing: 2,
    });

    const badgeStyle = new TextStyle({
      fontFamily: 'IBM Plex Mono, monospace',
      fontSize: 12,
      fill: '#08110b',
      fontWeight: 'bold',
    });

    const labelStyle = new TextStyle({
      fontFamily: 'IBM Plex Mono, monospace',
      fontSize: 10,
      fill: '#5b8c63',
    });

    this.stationTitleText = new Text({
      text: 'STATION 7-B // COASTAL MONITOR',
      style: headerStyle,
    });
    this.stationTitleText.position.set(20, 10);

    this.phaseBadgeText = new Text({
      text: 'STATUS: STATION ACTIVE',
      style: badgeStyle,
    });
    this.phaseBadgeText.anchor.set(0.5);

    this.scoreText = new Text({
      text: 'LOGGED: 0 / 3',
      style: headerStyle,
    });
    this.scoreText.anchor.set(1, 0);

    this.fanText = new Text({ text: 'COOLING FANS: 35%', style: labelStyle });
    this.ampText = new Text({ text: 'RF AMPLIFIER: 40%', style: labelStyle });
    this.tapeText = new Text({ text: 'TAPE MOTOR: 25%', style: labelStyle });

    this.view.addChild(this.topBarGfx);
    this.view.addChild(this.stationTitleText);
    this.view.addChild(this.phaseBadgeText);
    this.view.addChild(this.scoreText);

    this.view.addChild(this.powerPanelGfx);
    this.view.addChild(this.fanSliderGfx);
    this.view.addChild(this.ampSliderGfx);
    this.view.addChild(this.tapeSliderGfx);
    this.view.addChild(this.fanText);
    this.view.addChild(this.ampText);
    this.view.addChild(this.tapeText);
  }

  private drawPowerPanel(): void {
    this.powerPanelGfx.clear();
    const px = 20;
    const py = 50;
    const pw = 280;
    const ph = 110;

    this.powerPanelGfx.roundRect(px, py, pw, ph, 6);
    this.powerPanelGfx.fill({ color: 0x0c140e, alpha: 0.9 });
    this.powerPanelGfx.stroke({ color: 0x1f3824, width: 1.5 });

    this.drawSlider(this.fanSliderGfx, px + 12, py + 22, pw - 24, this.currentPower.fan, 0x51cf66);
    this.drawSlider(this.ampSliderGfx, px + 12, py + 52, pw - 24, this.currentPower.amp, 0xff922b);
    this.drawSlider(this.tapeSliderGfx, px + 12, py + 82, pw - 24, this.currentPower.tape, 0xcc5de8);

    this.fanText.position.set(px + 12, py + 8);
    this.ampText.position.set(px + 12, py + 38);
    this.tapeText.position.set(px + 12, py + 68);

    this.fanText.text = `COOLING FANS: ${(this.currentPower.fan * 100).toFixed(0)}%`;
    this.ampText.text = `RF AMPLIFIER: ${(this.currentPower.amp * 100).toFixed(0)}%`;
    this.tapeText.text = `TAPE MOTOR: ${(this.currentPower.tape * 100).toFixed(0)}%`;
  }

  private drawSlider(gfx: Graphics, x: number, y: number, w: number, val: number, color: number): void {
    gfx.clear();
    const h = 8;

    // Track
    gfx.roundRect(x, y, w, h, 3);
    gfx.fill({ color: 0x050806 });
    gfx.stroke({ color: 0x1a2e20, width: 1 });

    // Filled bar
    gfx.roundRect(x, y, w * val, h, 3);
    gfx.fill({ color });

    // Thumb Handle
    const thumbX = x + w * val;
    gfx.rect(thumbX - 3, y - 3, 6, h + 6);
    gfx.fill({ color: 0xffffff });
  }

  private bindEvents(): void {
    this.powerPanelGfx.eventMode = 'static';
    this.powerPanelGfx.cursor = 'pointer';

    this.powerPanelGfx.on('pointerdown', (e) => {
      const localPos = this.view.toLocal(e.global);
      const py = 50;
      if (localPos.y >= py + 10 && localPos.y < py + 40) {
        this.isDraggingSlider = 'fan';
      } else if (localPos.y >= py + 40 && localPos.y < py + 70) {
        this.isDraggingSlider = 'amp';
      } else if (localPos.y >= py + 70 && localPos.y < py + 105) {
        this.isDraggingSlider = 'tape';
      }
      this.handleSliderMove(e.global.x);
    });

    const onMove = (e: any) => {
      if (this.isDraggingSlider) {
        this.handleSliderMove(e.global.x);
      }
    };

    const onUp = () => {
      this.isDraggingSlider = null;
    };

    this.powerPanelGfx.on('globalpointermove', onMove);
    this.powerPanelGfx.on('pointerup', onUp);
    this.powerPanelGfx.on('pointerupoutside', onUp);
  }

  private handleSliderMove(globalX: number): void {
    if (!this.isDraggingSlider) return;

    const px = 32;
    const pw = 256;
    const ratio = Math.max(0, Math.min((globalX - px) / pw, 1.0));

    const rebalanced = PowerGrid.rebalance(this.isDraggingSlider, ratio, {
      totalPower: 100,
      fanAllocation: this.currentPower.fan,
      amplifierAllocation: this.currentPower.amp,
      tapeDeckAllocation: this.currentPower.tape,
    });

    this.currentPower = {
      fan: rebalanced.fanAllocation,
      amp: rebalanced.amplifierAllocation,
      tape: rebalanced.tapeDeckAllocation,
    };

    this.drawPowerPanel();
    globalEventBus.emit('power:redistributed', {
      fan: rebalanced.fanAllocation,
      amp: rebalanced.amplifierAllocation,
      tape: rebalanced.tapeDeckAllocation,
    });
  }

  updateState(state: GameState): void {
    // Phase badge
    this.phaseBadgeText.text = `STATUS: ${state.phase.replace('_', ' ')}`;
    this.scoreText.text = `LOGGED: ${state.encounterIndex} / ${state.totalEncounters}`;

    if (state.currentEncounter) {
      this.stationTitleText.text = state.currentEncounter.sourceStationName;
    }
  }

  resize(w: number, _h: number): void {
    // Top Bar
    this.topBarGfx.clear();
    this.topBarGfx.rect(0, 0, w, 40);
    this.topBarGfx.fill({ color: 0x080f0a, alpha: 0.95 });
    this.topBarGfx.stroke({ color: 0x1a2e20, width: 1 });

    // Phase Badge Background
    const badgeW = 200;
    const badgeH = 24;
    const badgeX = w / 2;
    const badgeY = 20;

    this.topBarGfx.roundRect(badgeX - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH, 4);
    this.topBarGfx.fill({ color: 0x73d982 });

    this.phaseBadgeText.position.set(badgeX, badgeY);
    this.scoreText.position.set(w - 20, 10);

    this.drawPowerPanel();
  }
}
