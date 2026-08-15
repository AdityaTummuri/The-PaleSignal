// ═════════════════════════════════════════════════════════════════════════════
// src/types/constants.ts — Frozen Configuration & Simulation Constants
// ═════════════════════════════════════════════════════════════════════════════

export const ENGINE = Object.freeze({
  FIXED_DT: 1 / 60,               // 16.667ms fixed simulation step
  MAX_FRAME_DT: 0.25,             // Accumulator clamp (250ms max to prevent spiral of death)
  TARGET_FPS: 60,
});

export const THERMAL = Object.freeze({
  AMBIENT: 20.0,                  // Ambient room temperature in °C
  WARNING_THRESHOLD: 72.0,        // °C when yellow warning triggers
  CRITICAL_THRESHOLD: 85.0,       // °C when emergency overheat triggers
  RECOVERY_THRESHOLD: 55.0,       // °C cooled down enough to resume
  MAX_TEMPERATURE: 100.0,         // Absolute max physical threshold
  COOLING_COEFFICIENT: 0.085,     // Base exponential decay constant k
  BASE_HEAT_RATE: 2.8,            // °C/sec heat generated under baseline amplification
});

export const SIGNAL = Object.freeze({
  MIN_FREQUENCY: 10.0,            // MHz
  MAX_FREQUENCY: 140.0,           // MHz
  LOCK_THRESHOLD: 0.85,           // Phase lock ratio to achieve full carrier lock
  CARRIER_DETECT_SNR: 0.35,       // Minimum SNR to detect carrier presence
  BANDPASS_MIN_FREQ: 120,         // Hz
  BANDPASS_MAX_FREQ: 7500,        // Hz
  BANDPASS_DEFAULT_Q: 1.5,
  SAMPLE_BUFFER_SIZE: 256,        // Size of oscilloscope sample buffer
});

export const POWER = Object.freeze({
  TOTAL_WATTS: 100,
  MIN_ALLOCATION: 0.05,
  MAX_ALLOCATION: 0.90,
  DEFAULT_FAN: 0.35,
  DEFAULT_AMP: 0.40,
  DEFAULT_TAPE: 0.25,
});

export const CRT = Object.freeze({
  DEFAULT_CURVATURE: 3.5,
  DEFAULT_SCANLINE_INTENSITY: 0.30,
  DEFAULT_PHOSPHOR_DECAY: 0.92,
  DEFAULT_CHROMATIC_ABERRATION: 0.0025,
  DEFAULT_NOISE: 0.05,
  DEFAULT_VIGNETTE: 0.28,
});

export const TELETYPE = Object.freeze({
  DEFAULT_GLYPH_POOL: '0123456789ABCDEF!@#$%&*<>[]{}~^+=',
  CURSOR_BLINK_MS: 500,               // Cursor toggle interval
  DEFAULT_DURATION_MS: 3200,          // Default scramble→reveal duration
  CHARS_PER_STEP: 1,                  // Characters resolved per step
  MAX_LINE_WIDTH: 44,                 // Monospace chars per line
  FONT_SIZE: 16,                      // Terminal font size in px
  LINE_HEIGHT: 1.45,                  // Line height multiplier
  SOLENOID_PITCH_VARIANCE: 0.04,      // ±4% pitch micro-variation
  COMPLETION_CHIME_FREQ: 880,         // Hz — A5 harmonic chime base
});

export const AUDIO = Object.freeze({
  MASTER_VOLUME: 0.75,
  AMBIENCE_VOLUME: 0.45,
  SIGNAL_VOLUME: 0.50,
  SFX_VOLUME: 0.65,
});
