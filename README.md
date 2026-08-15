```
 ═══════════════════════════════════════════════════════════════════════════════════
  ████████╗██╗  ██╗███████╗    ██████╗  █████╗ ██╗     ███████╗    ███████╗██╗ ██████╗ 
  ╚══██╔══╝██║  ██║██╔════╝    ██╔══██╗██╔══██╗██║     ██╔════╝    ██╔════╝██║██╔════╝ 
     ██║   ███████║█████╗      ██████╔╝███████║██║     █████╗      ███████╗██║██║  ███╗
     ██║   ██╔══██║██╔══╝      ██╔═══╝ ██╔══██║██║     ██╔══╝      ╚════██║██║██║   ██║
     ██║   ██║  ██║███████╗    ██║     ██║  ██║███████╗███████╗    ███████║██║╚██████╔╝
     ╚═╝   ╚═╝  ╚═╝╚══════╝    ╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝    ╚══════╝╚═╝ ╚═════╝ 
                      [ SHORTWAVE TELEMETRY // COASTAL STATION 7-B ]
 ═══════════════════════════════════════════════════════════════════════════════════
```

<div align="center">

> **"Sweep the dark spectrum. Align the dual-trace carrier. Punch the decipher cards before the vacuum tubes ignite."**

[![Locked 60 FPS](https://img.shields.io/badge/FPS-60%20LOCKED-73d982?style=for-the-badge&logo=speedtest&logoColor=black)](https://github.com/AdityaTummuri/The-PaleSignal)
[![Vite 6](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7%20Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PixiJS v8](https://img.shields.io/badge/PixiJS-v8.8.1-E72264?style=for-the-badge&logo=pixijs&logoColor=white)](https://pixijs.com/)
[![Web Audio API](https://img.shields.io/badge/Audio-Web%20Audio%20API-FF8800?style=for-the-badge&logo=audiomack&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Jam Target](https://img.shields.io/badge/BTT%20Game%20Jam-Summer%202026-brightgreen?style=for-the-badge)](https://devpost.com)

### 🎮 **[Play Live in Browser](https://the-pale-signal.vercel.app)** ｜ 🎬 **[Watch 3-Min Gameplay Demo](https://youtu.be/example)** ｜ 📦 **[Devpost Submission](https://devpost.com)**

---

</div>

## 📻 1. Narrative Briefing // Intercept Log

```
[STATION IDENT: SECTOR 7-B // BLACKWOOD POINT MARITIME ARRAY]
[DATE: OCTOBER 14, 1978 — 03:42:19 UTC]
[WEATHER: CAT-5 GALE // BAROMETRIC PRESSURE: 942 MBAR // SEA STATE: EXTREME]
[SYSTEM LOG: ALL AUTOMATED BUOYS SILENT. UNREGISTERED CARRIER DETECTED.]

"Operator, the mainland lines went down forty minutes ago. The only thing 
reaching this coast is an uncalibrated shortwave broadcast buried deep in 
the static. The receivers are drawing maximum wattage, and the cooling fans 
can barely keep the tube housing below 85°C. 

Tune the dial. Lock the oscilloscope. Feed the punch cards through the optical 
gate. If that transmitter goes underwater before you decode the third packet, 
nobody is finding out what happened out on the reef."
```

---

## 🕹️ 2. Core Gameplay & Tactile Mechanics

**The Pale Signal** is an analog shortwave decryption and station survival simulation. You operate a tactile 1970s telemetry desk where rendering, physical simulation, and audio synthesis react in real time.

```
       ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
       │  1. TUNE DIAL   │  ──►  │  2. LOCK PHASE  │  ──►  │ 3. FEED CARDS   │
       │ Frequency Sweep │       │  Oscilloscope   │       │ Parity Decrypt  │
       └─────────────────┘       └─────────────────┘       └─────────────────┘
                ▲                                                   │
                │             ┌─────────────────┐                   ▼
                └───────────  │ 4. MANAGE HEAT  │  ◄────────────────┘
                              │ Power Grid & Fan│
                              └─────────────────┘
```

### 🎛️ 1. Analog Rotary Tuning
- Drag the heavy knurled aluminum dial across the **10.0 – 140.0 MHz** spectrum.
- Listen for acoustic carrier spikes breaking through the ambient coastal rain and radio static floor.
- Detent ticks provide crisp mechanical audio feedback on every step.

### 📈 2. Dual-Trace Oscilloscope Phase Alignment
- **Trace A (Green):** Displays raw input RF waveform extracted from real-time FFT sample buffers.
- **Trace B (Amber):** Displays the internal demodulator phase reference.
- Align frequency and bandpass filter parameters to achieve **Carrier Phase Lock (≥ 85%)**, triggering the automatic punch-card deciphering gate.

### 🗂️ 3. Punch-Card Cipher Decryption & Parity Validation
- Select operation cards from your hand (`SHIFT`, `INVERT`, `AMPLIFY`, `FILTER`) and feed them into the electro-mechanical reader slot:
  - **`SHIFT`**: 8-bit circular bitwise barrel roll.
  - **`INVERT`**: Bitwise byte inversion (`~byte & 0xFF`).
  - **`AMPLIFY`**: Scalar multiplication with modulo wrap.
  - **`FILTER`**: High-pass threshold gating.
- Calculate and match the target parity checksum sequence ($P = \text{even parity bits}$) to unlock the incoming log transmission.

### ⚡ 4. Station Power Grid & Vacuum Tube Thermal Management
- Distribute **100 Watts** of power using interactive HUD sliders across:
  - **Cooling Fans:** Drives exponential heat dissipation ($T(t) = T_{\text{ambient}} + (T_0 - T_{\text{ambient}})e^{-kt}$).
  - **RF Amplifier:** Amplifies weak shortwave carrier SNR at the cost of aggressive heat generation.
  - **Tape Deck Motor:** Powers the magnetic reel-to-reel recorder to capture deciphered data without tape oxide degradation.
- **Overheat Cutout:** Exceeding **85.0°C** triggers emergency circuit breakers, screen shake trauma, and alarm klaxons until cooled below 55°C.

### 🖨️ 5. Tactile Teletype & Solenoid Audio Feedback
- Decoded transmissions stream onto a Model 33 ASR phosphor terminal driven by a deterministic cipher scrambler.
- Every individual character resolution fires a synchronized sub-5ms mechanical solenoid transient click with randomized pitch micro-variance (±4%), culminating in an A5 harmonic chime.

---

## 🔬 3. "The Secret Sauce" // Technical Polish & Architecture

Built from the ground up with **zero black-box game engines**, **The Pale Signal** delivers an authentic analog tactile experience directly in modern web browsers:

```
                  ┌────────────────────────────────────────────────────────┐
                  │                 WEBGL2 / PIXI V8 PIPELINE              │
                  │                                                        │
                  │  [Scene Hierarchy] ──► [GLSL CRT Filter] ──► [Canvas]  │
                  │   ├─ Parallax Desk      ├─ Barrel Distortion           │
                  │   ├─ Oscilloscope       ├─ Scanline Sync Modulation    │
                  │   ├─ Tape Deck          ├─ Phosphor Decay Grille       │
                  │   └─ Teletype Text      ├─ Chromatic Aberration        │
                  │                         └─ RF Dynamic Noise            │
                  └────────────────────────────────────────────────────────┘
```

### 1. Multi-Pass Custom GLSL CRT Shader (`crt.frag.glsl`)
- **Radial Barrel Distortion:** Radial UV coordinate warping simulating thick spherical cathode ray tube glass.
- **Cathode Aperture Grille & Scanlines:** High-frequency horizontal sync line modulation with 60Hz AC mains flicker.
- **Radial Chromatic Aberration:** Color channel displacement separating Red, Green, and Blue samples toward the screen periphery.
- **Phosphor Persistence Decay:** Simulates P1 green/amber CRT phosphor luminescence and dark-room vignette falloff.

### 2. Semi-Fixed Timestep Engine Loop (`Engine.ts`)
- Implements a strict semi-fixed accumulator loop at fixed $dt = \frac{1}{60}\text{s} \approx 0.01667\text{s}$.
- Clamps frame deltas to $\Delta t_{\text{max}} = 0.25\text{s}$ to prevent simulation runaway or physics tunneling when browser tabs are backgrounded or throttled.
- Generates sub-frame interpolation factor $\alpha = \frac{\text{accumulator}}{dt}$ for render smoothing.

### 3. Pure Procedural Web Audio Engine (`SignalSynth.ts`, `AmbientSoundscape.ts`)
- **Zero Static Audio Assets:** 100% of all ambient rain, howling wind drones, 60Hz hums, carrier tones, and solenoid clicks are synthesized in real time via native Web Audio nodes.
- **Paul Kellet's Pink Noise Algorithm:** Multi-pole IIR filtered white noise buffer creates natural coastal rain texture and shortwave static.
- **Dynamic Biquad Filter Routing:** Resonant bandpass sweeps and phase notch filters sculpting carrier harmonics.

### 4. Zero-Crash Autoplay Lifecycle Manager (`AudioUnlockManager.ts`)
- Adheres to strict modern browser autoplay security policies.
- Automatically suspends audio graph, binds to first user interaction on the authorization overlay, and triggers a single-sample zero-gain buffer to prime audio hardware across iOS Safari, iPadOS, Android Chrome, and Desktop browsers.

---

## 🏛️ 4. Modular Directory Architecture

The repository enforces strict separation of concerns: state knows nothing about rendering, rendering reads state immutably, and the engine loop coordinates both via typed event contracts.

```
The-PaleSignal/
├── index.html                          # Minimal shell & canvas mount
├── vite.config.ts                      # Vite 6 config with GLSL shader compiler
├── tsconfig.json                       # Strict TypeScript 5.7 configuration
├── package.json
│
├── public/
│   └── fonts/                          # IBM Plex Mono, VT323 typography
│
└── src/
    ├── main.ts                         # Application bootstrap & lifecycle
    │
    ├── types/                          # ── STRICT IMMUTABLE TYPES ──
    │   ├── index.ts                    # GameState, SignalTelemetry, PunchCard, ThermalState
    │   ├── events.ts                   # EventBusMap typed event contracts
    │   └── constants.ts                # Frozen physical simulation constants
    │
    ├── core/                           # ── CORE ENGINE & AUDIO ──
    │   ├── engine/
    │   │   ├── Engine.ts               # Semi-fixed timestep loop (dt = 1/60s)
    │   │   ├── FSM.ts                  # Generic typed Finite State Machine
    │   │   └── GameFSM.ts             # 7-phase game state transition rules
    │   ├── events/
    │   │   └── EventBus.ts             # Zero-dependency typed pub/sub bus
    │   ├── audio/
    │   │   ├── AudioUnlockManager.ts   # Autoplay lifecycle hardware primer
    │   │   ├── SignalSynth.ts          # Procedural carrier oscillator & bandpass
    │   │   ├── AmbientSoundscape.ts    # Procedural coastal storm ambience
    │   │   ├── SFXBank.ts             # Mechanical switches, detents, card feed foley
    │   │   └── SolenoidSynth.ts       # Sub-5ms mechanical click & completion chime
    │   ├── state/
    │   │   ├── GameStateManager.ts     # Immutable state store & listeners
    │   │   ├── ThermalSimulation.ts    # Station thermal lifecycle model
    │   │   └── EncounterGenerator.ts   # Seeded shortwave encounter loader
    │   └── input/
    │       └── InputManager.ts         # Unified pointer, drag & keyboard system
    │
    ├── rendering/                      # ── PIXI.JS V8 & SHADER VIEW ──
    │   ├── scenes/
    │   │   ├── SceneManager.ts         # Scene lifecycle with GSAP crossfades
    │   │   ├── BootScene.ts            # Cathode calibration power-up sequence
    │   │   ├── StationScene.ts         # Main gameplay telemetry command desk
    │   │   └── TransmissionScene.ts    # Decoded message reveal & score summary
    │   ├── components/
    │   │   ├── FrequencyDial.ts        # Heavy rotary knob with detent physics
    │   │   ├── Oscilloscope.ts         # Dual-trace CRT waveform visualizer
    │   │   ├── PunchCardReader.ts      # IBM punch card feed mechanism
    │   │   ├── ThermalGauge.ts         # Galvanometer core temperature meter
    │   │   ├── SignalMeter.ts          # VU signal-to-noise ratio meter
    │   │   └── TapeDeck.ts            # Reel-to-reel magnetic tape transport
    │   ├── typography/
    │   │   └── TeletypeTerminalView.ts # Monospace terminal with 500ms cursor blink
    │   ├── shaders/
    │   │   ├── crt.frag.glsl           # Multi-pass GLSL CRT phosphor shader
    │   │   └── CRTFilter.ts           # PixiJS v8 custom Filter wrapper
    │   ├── effects/
    │   │   ├── Parallax.ts             # Cursor-driven micro-parallax
    │   │   ├── ScreenShake.ts          # Non-linear trauma shake
    │   │   └── VHSGlitch.ts           # Scanline sync tear overlay
    │   └── ui/
    │       ├── StartOverlay.ts         # Audio unlock authorization overlay
    │       ├── HUD.ts                  # Power distribution sliders & badges
    │       └── CardHand.ts            # Manila punch card fan-spread
    │
    ├── mechanics/                      # ── PURE GAMEPLAY LOGIC ──
    │   ├── signal/
    │   │   ├── FrequencyScanner.ts     # Carrier spike detection & proximity math
    │   │   ├── Demodulator.ts          # Phase-Locked Loop (PLL) accumulator
    │   │   └── TextScrambler.ts        # Deterministic accumulator cipher reveal
    │   ├── deck/
    │   │   ├── PunchCard.ts            # 8-bit byte transformations
    │   │   ├── CardDeck.ts            # Draw, discard, and Fisher-Yates shuffle
    │   │   ├── Decryptor.ts           # Block byte transformation pipeline
    │   │   └── ParityChecker.ts       # Even-parity checksum validator
    │   └── maintenance/
    │       ├── PowerGrid.ts            # 3-channel power balancing math
    │       ├── CoolingSystem.ts        # Exponential thermal dissipation
    │       └── TapeWearSystem.ts       # Magnetic oxide degradation model
    │
    ├── data/                           # ── JSON ENCOUNTER DATASETS ──
    │   ├── encounters/                 # Shortwave distress logs 1, 2, 3
    │   └── cards/base_deck.json        # Starter punch card pool
    │
    └── utils/
        ├── math.ts                     # Lerp, clamp, smoothstep, seeded PRNG
        ├── dispose.ts                  # WebGL context & texture cleanup
        └── debug.ts                    # 60 FPS real-time profiler
```

---

## ⚡ 5. Local Setup & Quickstart Guide

### Prerequisites
- Node.js 18+ (tested on Node v20/v24 LTS)
- Modern browser with WebGL2 and Web Audio support (Chrome, Firefox, Safari, Edge)

### Installation & Run Commands

```bash
# 1. Clone the repository
git clone https://github.com/AdityaTummuri/The-PaleSignal.git
cd The-PaleSignal

# 2. Install dependencies
npm install

# 3. Start development server with Hot Module Replacement (HMR)
npm run dev

# 4. Open in browser: http://localhost:5173
```

### Production Build & Type Checking

```bash
# Typecheck and compile optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🏆 6. Judging Criteria Scorecard Matrix

| Hackathon Criteria | Implementation in The Pale Signal | Technical Reference |
|:---|:---|:---|
| **🎨 Creativity & Concept** | Merges 1970s coastal weather station lore with tactile analog radio demodulation and IBM punch-card parity arithmetic. Subverts typical game jam tropes with mechanical tactile ASMR hardware. | [`StationScene.ts`](file:///src/rendering/scenes/StationScene.ts), [`overview.md`](file:///overview.md) |
| **🕹️ Fun Factor & Polish** | High-tactility interactions: rotary frequency dials with audio detents, spring-mass galvanometer needles, reel-to-reel tape transport, micro-parallax cursor tilting, and real-time teletype solenoid chatter. | [`FrequencyDial.ts`](file:///src/rendering/components/FrequencyDial.ts), [`SolenoidSynth.ts`](file:///src/core/audio/SolenoidSynth.ts) |
| **⚙️ Technical Execution** | **Zero TS errors** across 40+ strict files. Custom GLSL CRT barrel shader, deterministic fixed-step loop ($dt = \frac{1}{60}\text{s}$), pure procedural Web Audio graph, and clean architecture without bloated frameworks. | [`crt.frag.glsl`](file:///src/rendering/shaders/crt.frag.glsl), [`Engine.ts`](file:///src/core/engine/Engine.ts) |
| **🛡️ Resilience & Zero-Crash** | WebGL context recovery listeners, browser autoplay unlock safeguards for mobile/desktop, and clamped delta accumulators preventing tab background runaway. | [`AudioUnlockManager.ts`](file:///src/core/audio/AudioUnlockManager.ts), [`main.ts`](file:///src/main.ts) |

---

## 📜 7. Credits & Open-Source Attributions

- **Game Design & Architecture:** Aditya Tummuri
- **Development Tooling:** Google Antigravity IDE (Plan Mode ➔ Build Mode ➔ Subagent QA Pipeline)
- **Frameworks & Libraries:**
  - [PixiJS v8](https://pixijs.com/) — Next-generation WebGL2/WebGPU 2D rendering
  - [GSAP 3](https://gsap.com/) — Smooth UI spring transitions and timeline tweens
  - [Vite 6](https://vitejs.dev/) & [vite-plugin-glsl](https://github.com/UstymUkhman/vite-plugin-glsl) — Lightning fast ESM bundler and GLSL shader loader
  - [Google Fonts](https://fonts.google.com/) — *IBM Plex Mono* & *VT323*

### License
Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">

```
[ END OF TRANSMISSION // ALL SECTORS MONITORED // BEACON STANDBY ]
```

</div>