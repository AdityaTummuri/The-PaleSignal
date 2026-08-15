// ═════════════════════════════════════════════════════════════════════════════
// src/rendering/typography/TeletypeTerminalView.ts — Monospace Teletype Display
// ═════════════════════════════════════════════════════════════════════════════

import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { TELETYPE } from '@typings/constants';
import { solenoidSynth } from '@core/audio/SolenoidSynth';
import { globalEventBus } from '@core/events/EventBus';

export class TeletypeTerminalView {
  readonly view = new Container();

  private backgroundGfx = new Graphics();
  private terminalText!: Text;
  private headerText!: Text;
  private statusText!: Text;

  private width: number = 420;
  private height: number = 240;
  private rawContent: string = '';
  private isCursorVisible: boolean = true;
  private cursorTimer: number = 0;
  private isComplete: boolean = false;

  constructor(width: number = 420, height: number = 240) {
    this.width = width;
    this.height = height;

    this.setupUI();
    this.bindEvents();
  }

  private setupUI(): void {
    this.view.label = 'TeletypeTerminalView';

    // 1. Dark phosphor CRT Terminal backing
    this.backgroundGfx.roundRect(0, 0, this.width, this.height, 8);
    this.backgroundGfx.fill({ color: 0x050a07 });
    this.backgroundGfx.stroke({ color: 0x1a2e20, width: 2 });

    const headerStyle = new TextStyle({
      fontFamily: 'IBM Plex Mono, monospace',
      fontSize: 10,
      fill: '#44734d',
      letterSpacing: 1,
    });

    const bodyStyle = new TextStyle({
      fontFamily: 'IBM Plex Mono, monospace',
      fontSize: TELETYPE.FONT_SIZE,
      fill: '#a8ffb2',
      lineHeight: TELETYPE.FONT_SIZE * TELETYPE.LINE_HEIGHT,
      wordWrap: true,
      wordWrapWidth: this.width - 32,
      letterSpacing: 1,
    });

    const statusStyle = new TextStyle({
      fontFamily: 'VT323, monospace',
      fontSize: 14,
      fill: '#5b8c63',
    });

    this.headerText = new Text({
      text: 'TELETYPE RECEIVER // MODEL 33 ASR // BUFFER ACTIVE',
      style: headerStyle,
    });
    this.headerText.position.set(16, 12);

    this.terminalText = new Text({
      text: 'STANDBY FOR INCOMING TELEMETRY...',
      style: bodyStyle,
    });
    this.terminalText.position.set(16, 36);

    this.statusText = new Text({
      text: '[LINE IDLE]',
      style: statusStyle,
    });
    this.statusText.position.set(16, this.height - 22);

    this.view.addChild(this.backgroundGfx);
    this.view.addChild(this.headerText);
    this.view.addChild(this.terminalText);
    this.view.addChild(this.statusText);
  }

  private bindEvents(): void {
    // 1. Solenoid mechanical click audio on char resolved
    globalEventBus.on('cipher:char-resolved', () => {
      solenoidSynth.playCharClick();
    });

    // 2. Text update stream
    globalEventBus.on('cipher:update', ({ renderedText, progress }) => {
      this.rawContent = renderedText;
      this.statusText.text = `[DECRYPTING ${(progress * 100).toFixed(0)}%]`;
      this.statusText.style.fill = '#e6b800';
      this.refreshDisplay();
    });

    // 3. Message deciphered
    globalEventBus.on('cipher:resolved', ({ decodedMessage }) => {
      this.isComplete = true;
      this.rawContent = decodedMessage;
      this.statusText.text = '[TRANSMISSION VERIFIED // COMPLETE]';
      this.statusText.style.fill = '#73d982';
      solenoidSynth.playCompletionChime();
      this.refreshDisplay();
    });

    // 4. Cipher stream started
    globalEventBus.on('cipher:started', () => {
      this.isComplete = false;
      this.rawContent = '';
      this.statusText.text = '[STREAM INCOMING // SYNCING...]';
      this.statusText.style.fill = '#e6b800';
      this.refreshDisplay();
    });
  }

  setText(text: string): void {
    this.rawContent = text;
    this.refreshDisplay();
  }

  private refreshDisplay(): void {
    const cursor = !this.isComplete && this.isCursorVisible ? '█' : '';
    this.terminalText.text = `${this.rawContent}${cursor}`;
  }

  update(dt: number): void {
    // Cursor blink timer (500ms cycle)
    this.cursorTimer += dt * 1000;
    if (this.cursorTimer >= TELETYPE.CURSOR_BLINK_MS) {
      this.cursorTimer = 0;
      this.isCursorVisible = !this.isCursorVisible;
      this.refreshDisplay();
    }
  }

  resize(w: number, h: number): void {
    this.width = w;
    this.height = h;

    this.backgroundGfx.clear();
    this.backgroundGfx.roundRect(0, 0, w, h, 8);
    this.backgroundGfx.fill({ color: 0x050a07 });
    this.backgroundGfx.stroke({ color: 0x1a2e20, width: 2 });

    this.terminalText.style.wordWrapWidth = w - 32;
    this.statusText.position.set(16, h - 22);
  }
}
