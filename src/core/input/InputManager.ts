// ═════════════════════════════════════════════════════════════════════════════
// src/core/input/InputManager.ts — Unified Pointer & Keyboard Input Subsystem
// ═════════════════════════════════════════════════════════════════════════════

export interface PointerState {
  readonly x: number;
  readonly y: number;
  readonly isDown: boolean;
  readonly dragStartX: number;
  readonly dragStartY: number;
  readonly dragDeltaX: number;
  readonly dragDeltaY: number;
}

export class InputManager {
  private pointer: {
    x: number;
    y: number;
    isDown: boolean;
    dragStartX: number;
    dragStartY: number;
    dragDeltaX: number;
    dragDeltaY: number;
  } = {
    x: 0,
    y: 0,
    isDown: false,
    dragStartX: 0,
    dragStartY: 0,
    dragDeltaX: 0,
    dragDeltaY: 0,
  };

  private activeKeys = new Set<string>();
  private keyPressCallbacks = new Map<string, Set<() => void>>();

  constructor() {
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);

    if (typeof window !== 'undefined') {
      window.addEventListener('pointerdown', this.handlePointerDown, { passive: false });
      window.addEventListener('pointermove', this.handlePointerMove, { passive: true });
      window.addEventListener('pointerup', this.handlePointerUp, { passive: true });
      window.addEventListener('pointercancel', this.handlePointerUp, { passive: true });
      window.addEventListener('keydown', this.handleKeyDown);
      window.addEventListener('keyup', this.handleKeyUp);
    }
  }

  get pointerState(): Readonly<PointerState> {
    return this.pointer;
  }

  isKeyPressed(key: string): boolean {
    return this.activeKeys.has(key.toLowerCase());
  }

  onKeyPress(key: string, callback: () => void): () => void {
    const k = key.toLowerCase();
    let set = this.keyPressCallbacks.get(k);
    if (!set) {
      set = new Set();
      this.keyPressCallbacks.set(k, set);
    }
    set.add(callback);
    return () => set?.delete(callback);
  }

  private handlePointerDown(e: PointerEvent): void {
    this.pointer.isDown = true;
    this.pointer.x = e.clientX;
    this.pointer.y = e.clientY;
    this.pointer.dragStartX = e.clientX;
    this.pointer.dragStartY = e.clientY;
    this.pointer.dragDeltaX = 0;
    this.pointer.dragDeltaY = 0;
  }

  private handlePointerMove(e: PointerEvent): void {
    this.pointer.x = e.clientX;
    this.pointer.y = e.clientY;
    if (this.pointer.isDown) {
      this.pointer.dragDeltaX = e.clientX - this.pointer.dragStartX;
      this.pointer.dragDeltaY = e.clientY - this.pointer.dragStartY;
    }
  }

  private handlePointerUp(): void {
    this.pointer.isDown = false;
    this.pointer.dragDeltaX = 0;
    this.pointer.dragDeltaY = 0;
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const k = e.key.toLowerCase();
    const isRepeat = e.repeat;
    this.activeKeys.add(k);

    if (!isRepeat) {
      const callbacks = this.keyPressCallbacks.get(k);
      if (callbacks) {
        for (const cb of callbacks) {
          try { cb(); } catch (err) { console.error('[InputManager] Error in key handler:', err); }
        }
      }
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    this.activeKeys.delete(e.key.toLowerCase());
  }

  dispose(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('pointerdown', this.handlePointerDown);
      window.removeEventListener('pointermove', this.handlePointerMove);
      window.removeEventListener('pointerup', this.handlePointerUp);
      window.removeEventListener('pointercancel', this.handlePointerUp);
      window.removeEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('keyup', this.handleKeyUp);
    }
    this.activeKeys.clear();
    this.keyPressCallbacks.clear();
  }
}

export const inputManager = new InputManager();
