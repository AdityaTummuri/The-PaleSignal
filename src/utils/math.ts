// ═════════════════════════════════════════════════════════════════════════════
// src/utils/math.ts — Pure Mathematical Utilities & Deterministic PRNG
// ═════════════════════════════════════════════════════════════════════════════

export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

export function inverseLerp(a: number, b: number, val: number): number {
  if (Math.abs(b - a) < 1e-6) return 0;
  return clamp((val - a) / (b - a), 0, 1);
}

export function smoothstep(min: number, max: number, val: number): number {
  const x = clamp((val - min) / (max - min), 0, 1);
  return x * x * (3 - 2 * x);
}

/**
 * Fast, 32-bit deterministic seeded pseudo-random number generator (Mulberry32).
 */
export function createPRNG(seed: number): () => number {
  let s = Math.floor(seed) >>> 0;
  return function next(): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
