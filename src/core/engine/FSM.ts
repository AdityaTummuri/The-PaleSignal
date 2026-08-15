// ═════════════════════════════════════════════════════════════════════════════
// src/core/engine/FSM.ts — Generic Finite State Machine
// ═════════════════════════════════════════════════════════════════════════════

export type TransitionGuard<S extends string> = (from: S, to: S) => boolean;
export type StateHook<S extends string> = (state: S) => void;
export type TransitionHook<S extends string> = (from: S, to: S) => void;

export interface TransitionRule<S extends string> {
  from: S | readonly S[];
  to: S;
  guard?: TransitionGuard<S>;
}

export class FSM<S extends string> {
  private currentState: S;
  private allowedTransitions = new Map<S, Set<S>>();
  private guards = new Map<string, TransitionGuard<S>>();
  private enterHooks = new Map<S, Set<StateHook<S>>>();
  private exitHooks = new Map<S, Set<StateHook<S>>>();
  private globalTransitionHooks = new Set<TransitionHook<S>>();

  constructor(initialState: S, rules: readonly TransitionRule<S>[]) {
    this.currentState = initialState;

    for (const rule of rules) {
      const fromStates = Array.isArray(rule.from) ? rule.from : [rule.from];
      for (const from of fromStates) {
        let set = this.allowedTransitions.get(from);
        if (!set) {
          set = new Set();
          this.allowedTransitions.set(from, set);
        }
        set.add(rule.to);

        if (rule.guard) {
          this.guards.set(`${from}->${rule.to}`, rule.guard);
        }
      }
    }
  }

  get state(): S {
    return this.currentState;
  }

  /**
   * Check if transition to target state is valid and passes guards.
   */
  canTransition(to: S): boolean {
    const validTargets = this.allowedTransitions.get(this.currentState);
    if (!validTargets || !validTargets.has(to)) {
      return false;
    }

    const guard = this.guards.get(`${this.currentState}->${to}`);
    if (guard && !guard(this.currentState, to)) {
      return false;
    }

    return true;
  }

  /**
   * Attempt transition to target state. Returns true if successful.
   */
  transition(to: S): boolean {
    if (!this.canTransition(to)) {
      console.warn(`[FSM] Invalid state transition requested: ${this.currentState} -> ${to}`);
      return false;
    }

    const from = this.currentState;

    // Trigger exit hooks for current state
    const exits = this.exitHooks.get(from);
    if (exits) {
      for (const hook of exits) {
        try { hook(from); } catch (e) { console.error('[FSM] Error in exit hook:', e); }
      }
    }

    this.currentState = to;

    // Trigger enter hooks for new state
    const enters = this.enterHooks.get(to);
    if (enters) {
      for (const hook of enters) {
        try { hook(to); } catch (e) { console.error('[FSM] Error in enter hook:', e); }
      }
    }

    // Trigger global transition hooks
    for (const hook of this.globalTransitionHooks) {
      try { hook(from, to); } catch (e) { console.error('[FSM] Error in global transition hook:', e); }
    }

    return true;
  }

  /**
   * Register hook called when entering state.
   */
  onEnter(state: S, hook: StateHook<S>): () => void {
    let set = this.enterHooks.get(state);
    if (!set) {
      set = new Set();
      this.enterHooks.set(state, set);
    }
    set.add(hook);
    return () => set?.delete(hook);
  }

  /**
   * Register hook called when exiting state.
   */
  onExit(state: S, hook: StateHook<S>): () => void {
    let set = this.exitHooks.get(state);
    if (!set) {
      set = new Set();
      this.exitHooks.set(state, set);
    }
    set.add(hook);
    return () => set?.delete(hook);
  }

  /**
   * Register hook called on any valid state transition.
   */
  onTransition(hook: TransitionHook<S>): () => void {
    this.globalTransitionHooks.add(hook);
    return () => this.globalTransitionHooks.delete(hook);
  }
}
