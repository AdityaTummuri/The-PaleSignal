// ═════════════════════════════════════════════════════════════════════════════
// src/rendering/scenes/StationScene.ts — Main Coastal Telemetry Station View
// ═════════════════════════════════════════════════════════════════════════════

import { Container, Graphics } from 'pixi.js';
import type { Scene } from './SceneManager';
import { HUD } from '@rendering/ui/HUD';
import { FrequencyDial } from '@rendering/components/FrequencyDial';
import { Oscilloscope } from '@rendering/components/Oscilloscope';
import { ThermalGauge } from '@rendering/components/ThermalGauge';
import { SignalMeter } from '@rendering/components/SignalMeter';
import { TapeDeck } from '@rendering/components/TapeDeck';
import { PunchCardReader } from '@rendering/components/PunchCardReader';
import { TeletypeTerminalView } from '@rendering/typography/TeletypeTerminalView';
import { CardHand } from '@rendering/ui/CardHand';
import { gameStateStore } from '@core/state/GameStateManager';
import { frequencyScanner } from '@mechanics/signal/FrequencyScanner';
import { demodulator } from '@mechanics/signal/Demodulator';
import { thermalSimulation } from '@core/state/ThermalSimulation';
import { TapeWearSystem } from '@mechanics/maintenance/TapeWearSystem';
import { TextScrambler } from '@mechanics/signal/TextScrambler';
import { signalSynth } from '@core/audio/SignalSynth';
import { CardDeck } from '@mechanics/deck/CardDeck';
import { Decryptor } from '@mechanics/deck/Decryptor';
import { ParityChecker } from '@mechanics/deck/ParityChecker';
import { encounterGenerator } from '@core/state/EncounterGenerator';
import { globalEventBus } from '@core/events/EventBus';
import type { PunchCard } from '@typings/index';

export class StationScene implements Scene {
  readonly view = new Container();

  // Background Console
  private consoleGfx = new Graphics();

  // Components
  readonly hud = new HUD();
  readonly dial = new FrequencyDial(34.5);
  readonly oscilloscope = new Oscilloscope(380, 210);
  readonly thermalGauge = new ThermalGauge();
  readonly signalMeter = new SignalMeter();
  readonly tapeDeck = new TapeDeck();
  readonly cardReader = new PunchCardReader();
  readonly teletype = new TeletypeTerminalView(420, 220);
  readonly cardHand = new CardHand((card) => this.handleCardPlay(card));

  // Logic engines
  private scrambler = new TextScrambler({
    onUpdate: (rendered, progress) => {
      globalEventBus.emit('cipher:update', { renderedText: rendered, progress });
    },
    onCharResolved: (char, index) => {
      globalEventBus.emit('cipher:char-resolved', { char, index });
    },
    onComplete: (fullText) => {
      globalEventBus.emit('cipher:resolved', { decodedMessage: fullText });
      this.handleEncounterCompleted();
    },
  });

  private onGameOverOrVictory?: () => void;

  constructor(onComplete?: () => void) {
    this.onGameOverOrVictory = onComplete;
    this.setupDisplayHierarchy();
  }

  private setupDisplayHierarchy(): void {
    this.view.label = 'StationScene';

    this.view.addChild(this.consoleGfx);
    this.view.addChild(this.dial.view);
    this.view.addChild(this.oscilloscope.view);
    this.view.addChild(this.thermalGauge.view);
    this.view.addChild(this.signalMeter.view);
    this.view.addChild(this.tapeDeck.view);
    this.view.addChild(this.cardReader.view);
    this.view.addChild(this.teletype.view);
    this.view.addChild(this.cardHand.view);
    this.view.addChild(this.hud.view);
  }

  enter(): void {
    // 1. Initialize starting deck & encounter 1
    const baseDeck = encounterGenerator.getBaseDeck();
    const firstEncounter = encounterGenerator.getEncounter(0);

    const deckState = CardDeck.drawCards(
      { drawPile: baseDeck, hand: [], discardPile: [] },
      4
    );

    gameStateStore.setState({
      phase: 'INTERCEPTING',
      currentEncounter: firstEncounter,
      encounterIndex: 1,
      totalEncounters: encounterGenerator.totalEncounters,
      hand: deckState.hand,
      drawPile: deckState.drawPile,
      discardPile: deckState.discardPile,
      dataBlocks: firstEncounter ? [...firstEncounter.rawEncryptedBlocks] : [],
    });

    this.cardHand.setCards(deckState.hand);

    if (firstEncounter) {
      this.dial.setFrequency(firstEncounter.frequencyBand - 2.5);
    }
  }

  exit(): void {
    this.scrambler.cancel();
  }

  private async handleCardPlay(card: PunchCard): Promise<void> {
    const state = gameStateStore.getState();
    if (state.phase !== 'DECRYPTING') return;

    // 1. Feed card into reader visual
    await this.cardReader.feedCard(card);

    // 2. Apply card operation to working data blocks
    const nextBlocks = Decryptor.applyCardToAllBlocks(state.dataBlocks, card.operationType);

    // 3. Validate Parity
    const parityResult = state.currentEncounter
      ? ParityChecker.validate(nextBlocks, state.currentEncounter.targetParityPattern)
      : { isMatch: false, matchRatio: 0 };

    // 4. Update Deck
    const deckResult = CardDeck.playCard(
      { drawPile: state.drawPile, hand: state.hand, discardPile: state.discardPile },
      card.cardId
    );
    const replenished = CardDeck.drawCards(deckResult.state, 1);

    gameStateStore.setState({
      dataBlocks: nextBlocks,
      hand: replenished.hand,
      drawPile: replenished.drawPile,
      discardPile: replenished.discardPile,
      score: state.score + 50,
    });

    this.cardHand.setCards(replenished.hand);

    // If parity is resolved, trigger teletype message reveal!
    if (parityResult.isMatch && state.currentEncounter) {
      this.scrambler.start({
        targetText: state.currentEncounter.targetDecodedText,
        durationMs: 3500,
      });
      globalEventBus.emit('cipher:started', {
        targetText: state.currentEncounter.targetDecodedText,
        durationMs: 3500,
      });
    }
  }

  private handleEncounterCompleted(): void {
    const state = gameStateStore.getState();
    const nextIndex = state.encounterIndex + 1;

    setTimeout(() => {
      if (nextIndex <= state.totalEncounters) {
        const nextEncounter = encounterGenerator.getEncounter(nextIndex - 1);
        gameStateStore.setState({
          phase: 'INTERCEPTING',
          currentEncounter: nextEncounter,
          encounterIndex: nextIndex,
          dataBlocks: nextEncounter ? [...nextEncounter.rawEncryptedBlocks] : [],
        });
        if (nextEncounter) {
          this.dial.setFrequency(nextEncounter.frequencyBand - 4.0);
        }
      } else {
        gameStateStore.setState({ phase: 'TRANSMISSION_RESOLVED' });
        this.onGameOverOrVictory?.();
      }
    }, 2500);
  }

  fixedUpdate(dt: number): void {
    const state = gameStateStore.getState();
    if (state.phase === 'BOOT' || state.phase === 'AUDIO_LOCKED') return;

    // 1. Scan Frequency Telemetry
    const scan = frequencyScanner.evaluate(this.dial.frequency, state.currentEncounter, state.power);
    const telemetry = frequencyScanner.updateTelemetry(state.signal, this.dial.frequency, state.currentEncounter, state.power);

    // 2. Demodulate Signal (PLL)
    const demod = demodulator.process(telemetry, dt);
    const updatedTelemetry = {
      ...telemetry,
      phaseLock: demod.phaseLock,
      demodulationProgress: demod.demodProgress,
    };

    // 3. Audio Synth sync
    if (state.currentEncounter) {
      signalSynth.setRadioFrequency(this.dial.frequency, state.currentEncounter.frequencyBand, state.currentEncounter.waveformComplexity);
      signalSynth.setLockState(demod.phaseLock, scan.effectiveSNR);
    }

    // 4. Update Gauges
    this.oscilloscope.setLockState(demod.phaseLock);
    this.signalMeter.setSNR(scan.effectiveSNR);

    // 5. Check if carrier lock triggers DECRYPTING phase
    if (state.phase === 'INTERCEPTING' && demod.phaseLock >= 0.85) {
      gameStateStore.setState({ phase: 'DECRYPTING' });
      this.teletype.setText('CARRIER LOCKED. READY FOR PUNCH-CARD PARITY DECODE.');
    }

    // 6. Step Thermal Model
    const thermalPatch = thermalSimulation.update(state, dt);

    // 7. Step Tape Transport
    const nextTape = TapeWearSystem.step(state.tape, state.currentEncounter?.tapeDecayRate ?? 0.005, dt);
    this.tapeDeck.update(dt);

    // 8. Step Cipher Scrambler
    this.scrambler.update(dt);
    this.teletype.update(dt);

    // Commit sub-state updates
    gameStateStore.setState({
      signal: updatedTelemetry,
      tape: nextTape,
      ...thermalPatch,
    });

    if (thermalPatch.thermal) {
      this.thermalGauge.setTemperature(thermalPatch.thermal.currentTemperature);
    }

    this.hud.updateState(gameStateStore.getState());
  }

  render(_alpha: number): void {
    this.oscilloscope.update();
  }

  resize(w: number, h: number): void {
    this.consoleGfx.clear();
    this.consoleGfx.rect(0, 0, w, h);
    this.consoleGfx.fill({ color: 0x090e0b });

    // Inner console metal framing
    this.consoleGfx.roundRect(15, 45, w - 30, h - 60, 10);
    this.consoleGfx.stroke({ color: 0x1a2e20, width: 2 });

    this.hud.resize(w, h);

    // Layout Instruments
    const leftX = w * 0.18;
    const midX = w * 0.50;
    const rightX = w * 0.82;

    this.dial.view.position.set(leftX, 220);
    this.thermalGauge.view.position.set(leftX - 110, 360);
    this.signalMeter.view.position.set(leftX - 110, 520);

    this.oscilloscope.view.position.set(midX - 190, 70);
    this.cardReader.view.position.set(midX - 160, 300);

    this.teletype.view.position.set(rightX - 210, 70);
    this.tapeDeck.view.position.set(rightX - 160, 310);

    this.cardHand.resize(w, h);
  }
}
