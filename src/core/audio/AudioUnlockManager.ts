// ═════════════════════════════════════════════════════════════════════════════
// src/core/audio/AudioUnlockManager.ts — Web Audio Autoplay Lifecycle Safeguard
// ═════════════════════════════════════════════════════════════════════════════

import { globalEventBus } from '@core/events/EventBus';

export class AudioUnlockManager {
  private ctx: AudioContext | null = null;
  private unlocked: boolean = false;
  private unlockListenersBound: boolean = false;

  constructor() {
    this.handleInteraction = this.handleInteraction.bind(this);
  }

  /**
   * Lazily obtain or create the shared AudioContext.
   */
  getContext(): AudioContext {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    return this.ctx;
  }

  get isUnlocked(): boolean {
    return this.unlocked && this.ctx?.state === 'running';
  }

  /**
   * Bind DOM listeners for first user gesture to unlock Web Audio API.
   */
  bindUnlockEvents(): void {
    if (this.unlocked || this.unlockListenersBound) return;

    this.unlockListenersBound = true;
    const events = ['pointerdown', 'touchstart', 'keydown', 'click'];
    for (const evt of events) {
      window.addEventListener(evt, this.handleInteraction, { once: true, capture: true, passive: true });
    }
  }

  /**
   * Attempt to unlock and prime audio hardware upon direct user interaction.
   */
  async unlock(): Promise<boolean> {
    if (this.unlocked && this.ctx?.state === 'running') {
      return true;
    }

    const ctx = this.getContext();

    try {
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // Hardware priming: play 1-sample silent buffer (essential for iOS Safari and mobile Chrome)
      const silentBuffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = silentBuffer;
      source.connect(ctx.destination);
      source.start(0);

      this.unlocked = true;
      this.cleanupUnlockEvents();
      globalEventBus.emit('audio:unlocked');
      return true;
    } catch (err) {
      console.warn('[AudioUnlockManager] Failed to unlock audio context:', err);
      return false;
    }
  }

  private handleInteraction(): void {
    void this.unlock();
  }

  private cleanupUnlockEvents(): void {
    const events = ['pointerdown', 'touchstart', 'keydown', 'click'];
    for (const evt of events) {
      window.removeEventListener(evt, this.handleInteraction, { capture: true });
    }
    this.unlockListenersBound = false;
  }
}

export const audioUnlockManager = new AudioUnlockManager();
