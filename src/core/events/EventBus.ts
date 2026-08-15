// ═════════════════════════════════════════════════════════════════════════════
// src/core/events/EventBus.ts — Zero-Dependency Typed Event Bus
// ═════════════════════════════════════════════════════════════════════════════

import type { EventBusMap } from '@typings/events';

type EventHandler<T> = (payload: T) => void;

export class EventBus {
  private handlers = new Map<keyof EventBusMap, Set<EventHandler<any>>>();

  /**
   * Subscribe to a typed event.
   * Returns an unsubscribe function for easy cleanup.
   */
  on<K extends keyof EventBusMap>(
    event: K,
    handler: EventHandler<EventBusMap[K]>
  ): () => void {
    let set = this.handlers.get(event);
    if (!set) {
      set = new Set();
      this.handlers.set(event, set);
    }
    set.add(handler as EventHandler<any>);

    return () => this.off(event, handler);
  }

  /**
   * Subscribe to an event for a single invocation only.
   */
  once<K extends keyof EventBusMap>(
    event: K,
    handler: EventHandler<EventBusMap[K]>
  ): () => void {
    const wrapper: EventHandler<EventBusMap[K]> = (payload) => {
      this.off(event, wrapper);
      handler(payload);
    };
    return this.on(event, wrapper);
  }

  /**
   * Unsubscribe a handler from an event.
   */
  off<K extends keyof EventBusMap>(
    event: K,
    handler: EventHandler<EventBusMap[K]>
  ): void {
    const set = this.handlers.get(event);
    if (set) {
      set.delete(handler as EventHandler<any>);
      if (set.size === 0) {
        this.handlers.delete(event);
      }
    }
  }

  /**
   * Emit an event with type-checked payload.
   */
  emit<K extends keyof EventBusMap>(
    event: K,
    ...args: EventBusMap[K] extends undefined ? [] : [payload: EventBusMap[K]]
  ): void {
    const set = this.handlers.get(event);
    if (!set || set.size === 0) return;

    const payload = args[0] as EventBusMap[K];
    // Copy the set to allow mutation during iteration (e.g. once handlers)
    const activeHandlers = Array.from(set);
    for (let i = 0; i < activeHandlers.length; i++) {
      try {
        activeHandlers[i]!(payload);
      } catch (err) {
        console.error(`[EventBus] Error in handler for event "${String(event)}":`, err);
      }
    }
  }

  /**
   * Remove all handlers for all events.
   */
  clear(): void {
    this.handlers.clear();
  }
}

// Default singleton instance for game-wide pub/sub
export const globalEventBus = new EventBus();
