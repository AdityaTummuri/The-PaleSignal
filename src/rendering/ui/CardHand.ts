// ═════════════════════════════════════════════════════════════════════════════
// src/rendering/ui/CardHand.ts — Interactive Punch Card Hand Fan
// ═════════════════════════════════════════════════════════════════════════════

import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import gsap from 'gsap';
import { sfxBank } from '@core/audio/SFXBank';
import { globalEventBus } from '@core/events/EventBus';
import type { PunchCard } from '@typings/index';

export class CardHand {
  readonly view = new Container();

  private cardViews: Container[] = [];
  private currentCards: readonly PunchCard[] = [];
  private width: number = 1920;
  private height: number = 1080;
  private onCardSelected?: (card: PunchCard) => void;

  constructor(onCardSelected?: (card: PunchCard) => void) {
    this.onCardSelected = onCardSelected;
    this.view.label = 'CardHand';
  }

  setCards(cards: readonly PunchCard[]): void {
    this.currentCards = cards;
    this.renderHand();
  }

  private renderHand(): void {
    // Clear old card views
    for (const cv of this.cardViews) {
      this.view.removeChild(cv);
      cv.destroy({ children: true });
    }
    this.cardViews = [];

    const total = this.currentCards.length;
    if (total === 0) return;

    const cardWidth = 140;
    const cardHeight = 190;
    const spacing = Math.min(150, (this.width - 200) / total);
    const startX = this.width / 2 - ((total - 1) * spacing) / 2;
    const baseY = this.height - 110;

    this.currentCards.forEach((card, idx) => {
      const cardContainer = new Container();
      cardContainer.label = `Card_${card.cardId}`;
      cardContainer.eventMode = 'static';
      cardContainer.cursor = 'pointer';

      // Slight fan rotation: -6 deg to +6 deg
      const rot = total > 1 ? ((idx / (total - 1)) - 0.5) * 0.15 : 0;
      const posX = startX + idx * spacing;
      const posY = baseY + Math.abs(rot) * 20;

      cardContainer.position.set(posX, posY);
      cardContainer.rotation = rot;

      // Card Background Gfx (Manila card with punched perforations)
      const bg = new Graphics();
      bg.roundRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 6);
      bg.fill({ color: 0xd9c89e });
      bg.stroke({ color: 0x5a4a30, width: 2 });

      // Corner Notch
      bg.moveTo(cardWidth / 2 - 12, -cardHeight / 2);
      bg.lineTo(cardWidth / 2, -cardHeight / 2 + 12);
      bg.stroke({ color: 0xd9c89e, width: 3 });

      // Card Operation Title
      const titleStyle = new TextStyle({
        fontFamily: 'VT323, monospace',
        fontSize: 24,
        fill: '#1a1f1b',
        letterSpacing: 1,
      });

      const title = new Text({
        text: card.operationType,
        style: titleStyle,
      });
      title.anchor.set(0.5);
      title.position.set(0, -cardHeight / 2 + 30);

      // Power Cost Badge
      const costBadge = new Graphics();
      costBadge.circle(0, 0, 12);
      costBadge.fill({ color: 0x223528 });
      costBadge.position.set(cardWidth / 2 - 18, -cardHeight / 2 + 18);

      const costText = new Text({
        text: `${card.powerCost}P`,
        style: new TextStyle({ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, fill: '#a8ffb2' }),
      });
      costText.anchor.set(0.5);
      costText.position.set(cardWidth / 2 - 18, -cardHeight / 2 + 18);

      // Perforated hole pattern in center
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const hx = -30 + c * 20;
          const hy = -10 + r * 18;
          if ((idx + r + c) % 2 === 0) {
            bg.rect(hx - 2, hy - 3, 4, 6);
            bg.fill({ color: 0x332617 });
          }
        }
      }

      cardContainer.addChild(bg);
      cardContainer.addChild(title);
      cardContainer.addChild(costBadge);
      cardContainer.addChild(costText);

      // Hover / Click Interactions
      cardContainer.on('pointerover', () => {
        gsap.to(cardContainer, {
          y: baseY - 35,
          rotation: 0,
          scale: 1.08,
          duration: 0.2,
          ease: 'power1.out',
        });
      });

      cardContainer.on('pointerout', () => {
        gsap.to(cardContainer, {
          y: posY,
          rotation: rot,
          scale: 1.0,
          duration: 0.2,
          ease: 'power1.in',
        });
      });

      cardContainer.on('pointerdown', () => {
        sfxBank.playSwitchClick(true);
        globalEventBus.emit('card:played', { card, targetBlockIndex: 0 });
        this.onCardSelected?.(card);
      });

      this.view.addChild(cardContainer);
      this.cardViews.push(cardContainer);
    });
  }

  resize(w: number, h: number): void {
    this.width = w;
    this.height = h;
    this.renderHand();
  }
}
