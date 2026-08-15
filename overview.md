# MASTER GAME DESIGN & ARCHITECTURAL SPECIFICATION
**Project:** BTT Web Game Jam Summer 2026 Submission
**Target Execution Environment:** Modern Desktop/Mobile Web Browsers (60 FPS Locked)
**Development Pipeline:** Google Antigravity IDE (Plan Mode ➔ Build Mode ➔ QA Subagent)

---

## 1. Hackathon Constraints & Rules Summary
* **Deadline:** August 21, 2026 @ 6:00 PM CEST.
* **Deliverables:** Public GitHub Repository, Playable Web Link (Vercel / itch.io / GitHub Pages), and a 2–3 Minute Demo Video.
* **Judging Criteria:** Creativity (Concept Originality), Fun Factor (Player Engagement), and Technical Execution (Performance, Stability, Code Architecture).
* **Allowed Tooling:** Open-source WebGL/Canvas engines, Web Audio API, and AI coding assistants.

---

## 2. Core Antigravity IDE Agent Workflow

To avoid monolithic code degradation during vibe-coding, all development follows a strict separation of concerns:

```
[ Phase 1: Plan Mode (Gemini 2.5/Pro) ]
   └── Output: Immutable TypeScript Types, FSM Transition Tables, JSON Data Schemas, Module Contracts
[ Phase 2: Build Mode (Flash 3.7) ]
   └── Output: Pure Logic Modules, WebGL Pipelines, Sound Synthesizers, Isolated UI Components
[ Phase 3: Browser Subagent (Headless QA) ]
   └── Output: Profiling Draw Calls, Verifying 60 FPS under Load, Memory Leak Auditing
```

---

## 3. Platform Resilience & Zero-Crash Web Standards

Every blueprint strictly implements these three runtime safeguards:

### A. Web Audio API Autoplay Lifecycle Manager
* Browsers block programmatic audio until direct user gesture.
* **Mitigation:** The audio graph initializes in a `suspended` state. An `AudioUnlockManager` binds to pointer/touch events on the start overlay, executes `audioCtx.resume()`, and triggers a single-sample zero-gain buffer to prime hardware (crucial for iOS Safari).

### B. Semi-Fixed Timestep Accumulator
* Prevents physics tunneling and simulation runaway when backgrounded tabs throttle frame rates.
* **Step Equation:**
  $$\Delta t_{\text{clamped}} = \min(\Delta t_{\text{frame}}, \Delta t_{\text{max}})$$
  where $\Delta t_{\text{max}} = 0.25\text{ s}$ and fixed simulation step $dt = \frac{1}{60}\text{ s} \approx 0.01667\text{ s}$.
* **Accumulator Loop:**
  $$\text{accumulator} \mathrel{+}= \Delta t_{\text{clamped}}$$
  While $\text{accumulator} \ge dt$, step state by $dt$ and decrement $\text{accumulator}$.
* **Render Interpolation:**
  $$\alpha = \frac{\text{accumulator}}{dt}$$

### C. WebGL Resource Management & Context Recovery
* Context losses from system sleep or memory spikes are caught via `webglcontextlost` and `webglcontextrestored`.
* Shaders, render targets, and geometry buffers must implement explicit `.dispose()` methods. State transitions must explicitly purge display container trees.

---

## 4. Game Blueprints

---

### BLUEPRINT 1: The Pale Signal (RECOMMENDED PRIMARY TARGET)

* **Genre:** Analog Telemetry & Cryptic Shortwave Decryption / Card-Based Signal Processing
* **Atmosphere & Tone:** Coastal storm monitoring station (late 1970s). Melancholic solitude, cosmic intrigue, tactile mechanical hardware.
* **Core Loop:** 1. *Frequency Tuning:* Sweep analog dials across frequency bands to identify carrier spikes.
  2. *Signal Demodulation:* Adjust bandpass/phase filters on a dual-trace oscilloscope to lock the waveform.
  3. *Punch-Card Decryption:* Feed data blocks through an electro-mechanical reader using operation cards (`SHIFT`, `INVERT`, `AMPLIFY`, `FILTER`) to decode text and audio logs.
  4. *Hardware Maintenance:* Balance station power between cooling fans, tube amplifiers, and tape decks to prevent overheating and tape degradation.
* **Visual Juice & Shaders:** Custom GLSL CRT filter (barrel distortion, scanlines, phosphor persistence decay, chromatic aberration, and noise static). Interactive micro-parallax tilting on cursor movement.
* **Audio Pipeline:** Procedural Web Audio API oscillator synthesis, real-time dynamic biquad filtering, solenoid thuds, tape flutter, and binaural coastal rain.
* **Stack:** Vite + TypeScript + PixiJS v8 + GSAP + Web Audio API.

#### Content Schema: Procedural Signal Encounter
```json
{
  "$schema": "[http://json-schema.org/draft-07/schema#](http://json-schema.org/draft-07/schema#)",
  "title": "SignalEncounterSchema",
  "type": "object",
  "properties": {
    "encounterSeed": { "type": "integer" },
    "frequencyBand": { "type": "number", "minimum": 10.0, "maximum": 140.0 },
    "waveformComplexity": { "type": "integer", "minimum": 1, "maximum": 5 },
    "signalNoiseRatio": { "type": "number", "minimum": 0.1, "maximum": 0.95 },
    "targetParityPattern": { "type": "array", "items": { "type": "integer" } },
    "tapeDecayRate": { "type": "number" },
    "rewardCardPool": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "cardId": { "type": "string" },
          "operationType": { "type": "string", "enum": ["SHIFT", "INVERT", "AMPLIFY", "FILTER"] },
          "powerCost": { "type": "integer" }
        },
        "required": ["cardId", "operationType", "powerCost"]
      }
    }
  },
  "required": ["encounterSeed", "frequencyBand", "waveformComplexity", "signalNoiseRatio", "targetParityPattern", "rewardCardPool"]
}
```

---

### BLUEPRINT 2: Sovereign of the Sunken Spire

* **Genre:** Isometric Perspective Deduction & Chronometric Era Scrubbing
* **Atmosphere & Tone:** Serene, submerged clockwork sanctuary. Architectural elegance, cyclical history, meditative mechanical logic.
* **Core Loop:**
  1. *Orthographic Perspective Shifts:* Rotate the isometric geometry in $90^\circ$ steps to align physically disconnected platforms.
  2. *Temporal Era Scrubbing:* Scrub local room sectors between 3 eras (Intact Past, Flooded Present, Calcified Future) to alter traversal paths and physical matter.
  3. *Prismatic Light Beam Routing:* Align prism reflectors across different eras and water levels to activate hydraulic pumps.
* **Visual Juice & Shaders:** Three.js tilt-shift depth of field (diorama aesthetic), volumetric water caustics, and Sobel edge-detection outline filter. Camera quaternion slerp transitions with zoom punch.
* **Audio Pipeline:** Generative ambient synthesizers, microtonal crystal chimes, and underwater hydrophone turbulence via Howler.js.
* **Stack:** Vite + TypeScript + Three.js (r160+) + postprocessing (pmndrs) + Howler.js.

#### Content Schema: Procedural Spire Chamber
```json
{
  "$schema": "[http://json-schema.org/draft-07/schema#](http://json-schema.org/draft-07/schema#)",
  "title": "ChamberLayoutSchema",
  "type": "object",
  "properties": {
    "chamberId": { "type": "string" },
    "gridDimensions": {
      "type": "object",
      "properties": { "x": { "type": "integer" }, "y": { "type": "integer" }, "z": { "type": "integer" } },
      "required": ["x", "y", "z"]
    },
    "defaultRotation": { "type": "number" },
    "voxelBlocks": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "coord": { "type": "array", "items": { "type": "integer" }, "minItems": 3, "maxItems": 3 },
          "temporalAffiliation": { "type": "string", "enum": ["PAST", "PRESENT", "FUTURE", "PERMANENT"] },
          "type": "string", "enum": ["WALKWAY", "PRISM_MOUNT", "WATER_GATE", "PRESSURE_PLATE"]
        },
        "required": ["coord", "temporalAffiliation", "type"]
      }
    },
    "beamTargetCoord": { "type": "array", "items": { "type": "integer" }, "minItems": 3, "maxItems": 3 }
  },
  "required": ["chamberId", "gridDimensions", "voxelBlocks", "beamTargetCoord"]
}
```

---

### BLUEPRINT 3: Alchemist's Ledger: 1888

* **Genre:** Forensic Chemistry & Victorian Tabletop Diagnostic Simulation
* **Atmosphere & Tone:** Candlelit Victorian apothecary. Tactile ASMR crafting, moral ambiguity, socio-political intrigue.
* **Core Loop:**
  1. *Forensic Diagnosis:* Examine patient samples under a magnifying glass, applying diagnostic drops to reveal symptom markers.
  2. *Reagent Synthesis:* Measure elemental fluids (Salt, Sulfur, Mercury), ignite Bunsen burners to precise distillation temperatures, and grind powders.
  3. *Ledger Accounting:* Bottle solutions, fulfill client orders, and manage reputation across competing city factions (Labor, Crown, Occult Lodge).
* **Thermal Math Safeguard:** Closed-form exponential dissipation prevents thermal runaway in backgrounded tabs:
  $$T(t) = T_{\text{ambient}} + (T_0 - T_{\text{ambient}})e^{-kt}$$
* **Visual Juice & Shaders:** Dynamic 2D GLSL fluid simulation with surface tension meniscus, light refraction, and flickering candlelight shadows.
* **Audio Pipeline:** ASMR foley (glass clinks, boiling fluid loops, pestle grinding) with dynamic low-pass filters on zoom.
* **Stack:** Vite + TypeScript + PixiJS v8 + GSAP Draggable + Web Audio API.

#### Content Schema: Client Diagnostic Case
```json
{
  "$schema": "[http://json-schema.org/draft-07/schema#](http://json-schema.org/draft-07/schema#)",
  "title": "ClientAilmentSchema",
  "type": "object",
  "properties": {
    "daySeed": { "type": "integer" },
    "clientId": { "type": "string" },
    "faction": { "type": "string", "enum": ["LABOR", "CROWN", "OCCULT_LODGE"] },
    "symptoms": {
      "type": "array",
      "items": { "type": "string", "enum": ["LUNG_CALCIFICATION", "ASTRAL_FEVER", "MERCURIAL_TREMOR", "SHADOW_ROT"] }
    },
    "requiredCompound": {
      "type": "object",
      "properties": {
        "baseElement": { "type": "string", "enum": ["SALT", "SULFUR", "MERCURY"] },
        "purityThreshold": { "type": "number", "minimum": 0.75 },
        "maximumToxicity": { "type": "number", "maximum": 0.25 },
        "targetTemperature": { "type": "number" }
      },
      "required": ["baseElement", "purityThreshold", "maximumToxicity", "targetTemperature"]
    },
    "narrativeConsequence": { "type": "string" }
  },
  "required": ["daySeed", "clientId", "faction", "symptoms", "requiredCompound", "narrativeConsequence"]
}
```

---

## 5. 14-Day Vibe-Coding Implementation Schedule

| Day | Primary Agent Mode | Technical Milestone & Deliverables |
| :--- | :--- | :--- |
| **Day 1** | **Plan Mode** | Immutable TypeScript types, GameState interfaces, FSM transition contracts, EventBus. |
| **Day 2** | **Plan Mode** | Shader uniforms spec, Audio graph architecture, Procedural seed generator schema. |
| **Day 3** | **Build Mode** | Fixed-timestep engine loop, AudioUnlockManager, PixiJS/Three.js viewport setup. |
| **Day 4** | **Build Mode** | Interactive control surface (Dials/Sliders/Perspective rotators) + mouse parallax. |
| **Day 5** | **Build Mode** | Web Audio procedural sound generation + dynamic biquad filtering. |
| **Day 6** | **Build Mode** | Core mechanic visualizer (Oscilloscope / Voxel Parser / Fluid Shader). |
| **Day 7** | **Build Mode** | Primary game loop logic (Card decrypter / Beam reflection / Reagent synthesis). |
| **Day 8** | **Build Mode** | Post-processing WebGL pipeline (CRT shader / Tilt-shift DoF / Lighting passes). |
| **Day 9** | **Build Mode** | Deterministic procedural encounter engine driven by JSON schemas. |
| **Day 10** | **Build Mode** | Secondary management loop (Power & tape wear / Flooding pumps / Ledger economy). |
| **Day 11** | **Build Mode** | UI juice, screen shake, tactile spring physics, sound feedback synchronization. |
| **Day 12** | **QA Subagent** | Headless Chrome 60 FPS stress test, memory leak tracing over 500 state cycles. |
| **Day 13** | **QA Subagent** | Procedural seed balance validation, context-loss recovery tests, mobile touch fallback. |
| **Day 14** | **Build Mode** | Production bundle optimization, itch.io/Vercel deployment, demo video recording. |