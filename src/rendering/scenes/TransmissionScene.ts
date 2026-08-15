// ═════════════════════════════════════════════════════════════════════════════
// src/rendering/scenes/TransmissionScene.ts — Transmission Resolved Victory View
// ═════════════════════════════════════════════════════════════════════════════

import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { Scene } from './SceneManager';
import { TeletypeTerminalView } from '@rendering/typography/TeletypeTerminalView';
import { TextScrambler } from '@mechanics/signal/TextScrambler';
import { gameStateStore } from '@core/state/GameStateManager';
import { globalEventBus } from '@core/events/EventBus';
import { sfxBank } from '@core/audio/SFXBank';
import gsap from 'gsap';

export class TransmissionScene implements Scene {
  readonly view = new Container();

  private bgGfx = new Graphics();
  private titleText!: Text;
  private subText!: Text;
  private scoreText!: Text;
  private teletype = new TeletypeTerminalView(640, 260);
  private restartBtnGfx = new Graphics();
  private restartBtnText!: Text;

  private scrambler = new TextScrambler({
    onUpdate: (rendered, progress) => {
      globalEventBus.emit('cipher:update', { renderedText: rendered, progress });
    },
    onCharResolved: (char, index) => {
      globalEventBus.emit('cipher:char-resolved', { char, index });
    },
    onComplete: (fullText) => {
      globalEventBus.emit('cipher:resolved', { decodedMessage: fullText });
    },
  });

  private onRestartCallback?: () => void;

  constructor(onRestart?: () => void) {
    this.onRestartCallback = onRestart;
    this.setupUI();
    this.bindEvents();
  }

  private setupUI(): void {
    this.view.label = 'TransmissionScene';

    const headerStyle = new TextStyle({
      fontFamily: 'VT323, monospace',
      fontSize: 42,
      fill: '#a8ffb2',
      letterSpacing: 4,
    });

    const subStyle = new TextStyle({
      fontFamily: 'IBM Plex Mono, monospace',
      fontSize: 14,
      fill: '#5b8c63',
      letterSpacing: 2,
    });

    const scoreStyle = new TextStyle({
      fontFamily: 'VT323, monospace',
      fontSize: 32,
      fill: '#e6b800',
      letterSpacing: 2,
    });

    const btnStyle = new TextStyle({
      fontFamily: 'VT323, monospace',
      fontSize: 24,
      fill: '#08110b',
      letterSpacing: 2,
    });

    this.titleText = new Text({
      text: 'TRANSMISSION RESOLVED // ARCHIVE VERIFIED',
      style: headerStyle,
    });
    this.titleText.anchor.set(0.5);

    this.subText = new Text({
      text: 'ALL CARRIER SPIKES DECRYPTED. TELEMETRY RECORDED TO STATION LOG.',
      style: subStyle,
    });
    this.subText.anchor.set(0.5);

    this.scoreText = new Text({
      text: 'TOTAL SCORE: 350 PTS',
      style: scoreStyle,
    });
    this.scoreText.anchor.set(0.5);

    this.restartBtnText = new Text({
      text: 'MONITOR NEXT STORM SECTOR',
      style: btnStyle,
    });
    this.restartBtnText.anchor.set(0.5);

    this.view.addChild(this.bgGfx);
    this.view.addChild(this.titleText);
    this.view.addChild(this.subText);
    this.view.addChild(this.teletype.view);
    this.view.addChild(this.scoreText);
    this.view.addChild(this.restartBtnGfx);
    this.view.addChild(this.restartBtnText);
  }

  private bindEvents(): void {
    this.restartBtnGfx.eventMode = 'static';
    this.restartBtnGfx.cursor = 'pointer';

    this.restartBtnGfx.on('pointerdown', () => {
      sfxBank.playSwitchClick(true);
      this.onRestartCallback?.();
    });

    this.restartBtnGfx.on('pointerover', () => {
      gsap.to(this.restartBtnGfx.scale, { x: 1.05, y: 1.05, duration: 0.2 });
    });

    this.restartBtnGfx.on('pointerout', () => {
      gsap.to(this.restartBtnGfx.scale, { x: 1.0, y: 1.0, duration: 0.2 });
    });
  }

  enter(): void {
    const state = gameStateStore.getState();
    this.scoreText.text = `TOTAL ARCHIVE SCORE: ${state.score + 150} PTS`;

    const summaryText =
      'ALL RECEPTOR ARRAYS SYNCHRONIZED.\n' +
      'SIGNAL 1: MAYDAY DRIFT BUOY 14 (CONFIRMED)\n' +
      'SIGNAL 2: BAROMETRIC HARMONIC ANOMALY (RECORDED)\n' +
      'SIGNAL 3: DEEPWATER CHORUS ORIGIN (LOGGED)\n\n' +
      'OPERATOR STATION 7-B STANDBY SECURED.';

    this.scrambler.start({
      targetText: summaryText,
      durationMs: 4000,
    });
    globalEventBus.emit('cipher:started', { targetText: summaryText, durationMs: 4000 });
  }

  exit(): void {
    this.scrambler.cancel();
  }

  fixedUpdate(dt: number): void {
    this.scrambler.update(dt);
    this.teletype.update(dt);
  }

  resize(w: number, _h: number): void {
    this.bgGfx.clear();
    this.bgGfx.rect(0, 0, w, _h);
    this.bgGfx.fill({ color: 0x050a07, alpha: 0.96 });

    this.titleText.position.set(w / 2, 80);
    this.subText.position.set(w / 2, 125);

    this.teletype.resize(680, 280);
    this.teletype.view.position.set(w / 2 - 340, 160);

    this.scoreText.position.set(w / 2, 480);

    const btnW = 340;
    const btnH = 50;
    const btnX = w / 2;
    const btnY = 550;

    this.restartBtnGfx.clear();
    this.restartBtnGfx.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
    this.restartBtnGfx.fill({ color: 0x73d982 });
    this.restartBtnGfx.stroke({ color: 0xa8ffb2, width: 2 });
    this.restartBtnGfx.position.set(btnX, btnY);

    this.restartBtnText.position.set(btnX, btnY);
  }
}
