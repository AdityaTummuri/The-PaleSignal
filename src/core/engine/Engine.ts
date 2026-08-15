// ═════════════════════════════════════════════════════════════════════════════
// src/core/engine/Engine.ts — Semi-Fixed Timestep Engine Loop with Clamping
// ═════════════════════════════════════════════════════════════════════════════

import { ENGINE } from '@typings/constants';
import { globalEventBus } from '@core/events/EventBus';

export interface EngineCallbacks {
  /** Called at fixed dt intervals (1/60s) for deterministic state/physics/sim updates */
  fixedUpdate(dt: number): void;

  /** Called once per animation frame with interpolation alpha for smooth rendering */
  render(alpha: number): void;

  /** Called once per animation frame before fixedUpdate for input polling */
  processInput?(): void;
}

export class Engine {
  private accumulator: number = 0;
  private lastTimestamp: number = 0;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private rafId: number = 0;

  constructor(
    private readonly fixedDt: number = ENGINE.FIXED_DT,
    private readonly maxFrameDt: number = ENGINE.MAX_FRAME_DT,
    private readonly callbacks: EngineCallbacks
  ) {
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.tick = this.tick.bind(this);
  }

  /**
   * Start the main engine loop and bind lifecycle event listeners.
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.isPaused = false;
    this.accumulator = 0;
    this.lastTimestamp = performance.now();

    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('blur', this.handleVisibilityChange);
    window.addEventListener('focus', this.handleVisibilityChange);

    this.rafId = requestAnimationFrame(this.tick);
    globalEventBus.emit('engine:resumed');
  }

  /**
   * Stop the loop and cleanup RAF and window event listeners.
   */
  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    cancelAnimationFrame(this.rafId);

    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('blur', this.handleVisibilityChange);
    window.removeEventListener('focus', this.handleVisibilityChange);

    globalEventBus.emit('engine:paused');
  }

  /**
   * Pause state updates without stopping the RAF render loop.
   */
  pause(): void {
    if (!this.isPaused) {
      this.isPaused = true;
      globalEventBus.emit('engine:paused');
    }
  }

  /**
   * Resume state updates.
   */
  resume(): void {
    if (this.isPaused) {
      this.isPaused = false;
      this.lastTimestamp = performance.now();
      this.accumulator = 0;
      globalEventBus.emit('engine:resumed');
    }
  }

  get running(): boolean {
    return this.isRunning;
  }

  get paused(): boolean {
    return this.isPaused;
  }

  private handleVisibilityChange(): void {
    // When tab is hidden or blurred, reset timestamp to prevent huge frame deltas when returning
    this.lastTimestamp = performance.now();
    this.accumulator = 0;
  }

  private tick(timestamp: number): void {
    if (!this.isRunning) return;

    // Convert ms to seconds
    const rawDt = (timestamp - this.lastTimestamp) / 1000;
    // Clamp to prevent simulation runaway if tab was throttled
    const clampedDt = Math.min(Math.max(rawDt, 0), this.maxFrameDt);
    this.lastTimestamp = timestamp;

    if (!this.isPaused) {
      if (this.callbacks.processInput) {
        this.callbacks.processInput();
      }

      this.accumulator += clampedDt;

      // Drain accumulator in deterministic fixedDt slices
      while (this.accumulator >= this.fixedDt) {
        this.callbacks.fixedUpdate(this.fixedDt);
        this.accumulator -= this.fixedDt;
      }
    }

    // Calculate sub-frame interpolation factor alpha: [0.0, 1.0)
    const alpha = this.fixedDt > 0 ? this.accumulator / this.fixedDt : 1.0;
    this.callbacks.render(alpha);

    globalEventBus.emit('engine:tick', { dt: clampedDt, alpha });

    this.rafId = requestAnimationFrame(this.tick);
  }
}
