// ═════════════════════════════════════════════════════════════════════════════
// src/main.ts — Application Bootstrap, Engine Wireup & WebGL Context Lifecycle
// ═════════════════════════════════════════════════════════════════════════════

import { Application, Rectangle } from 'pixi.js';
import { Engine } from '@core/engine/Engine';
import { createGameFSM } from '@core/engine/GameFSM';
import { globalEventBus } from '@core/events/EventBus';
import { audioUnlockManager } from '@core/audio/AudioUnlockManager';
import { signalSynth } from '@core/audio/SignalSynth';
import { ambientSoundscape } from '@core/audio/AmbientSoundscape';
import { SceneManager } from '@rendering/scenes/SceneManager';
import { BootScene } from '@rendering/scenes/BootScene';
import { StationScene } from '@rendering/scenes/StationScene';
import { TransmissionScene } from '@rendering/scenes/TransmissionScene';
import { CRTFilter } from '@rendering/shaders/CRTFilter';
import { Parallax } from '@rendering/effects/Parallax';
import { ScreenShake } from '@rendering/effects/ScreenShake';
import { VHSGlitch } from '@rendering/effects/VHSGlitch';
import { FPSDebugger } from '@utils/debug';

async function bootstrap() {
  console.info('🌊 Initializing The Pale Signal...');

  const container = document.getElementById('game-container');
  if (!container) {
    throw new Error('Could not find #game-container in DOM.');
  }

  // 1. Initialize PixiJS v8 Application (Async)
  const app = new Application();
  await app.init({
    resizeTo: window,
    backgroundColor: 0x05070a,
    autoDensity: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    antialias: false,
    powerPreference: 'high-performance',
  });

  app.canvas.style.display = 'block';
  app.canvas.style.width = '100%';
  app.canvas.style.height = '100%';
  container.appendChild(app.canvas);

  // Enable top-level stage interaction
  app.stage.eventMode = 'static';
  app.stage.hitArea = new Rectangle(0, 0, window.innerWidth, window.innerHeight);

  // 2. Setup Systems & Managers
  const fsm = createGameFSM('BOOT');
  const sceneManager = new SceneManager();
  const parallax = new Parallax();
  const screenShake = new ScreenShake();
  const vhsGlitch = new VHSGlitch();
  const fpsDebugger = new FPSDebugger();

  app.stage.addChild(sceneManager.stage);
  app.stage.addChild(vhsGlitch.view);
  app.stage.addChild(fpsDebugger.view);

  screenShake.attach(sceneManager.stage);
  parallax.addLayer(sceneManager.stage, 0.04);

  // 3. Setup CRT Post-Processing Filter (Protected)
  let crtFilter: CRTFilter | null = null;
  try {
    crtFilter = new CRTFilter(window.innerWidth, window.innerHeight);
    app.stage.filters = [crtFilter];
  } catch (err) {
    console.warn('[Bootstrap] CRT Shader filter fallback:', err);
  }

  // 4. Scenes Definition
  let stationScene: StationScene;

  const launchStation = async () => {
    fsm.transition('STATION_ACTIVE');
    signalSynth.init();
    ambientSoundscape.init();
    ambientSoundscape.updateForPhase('STATION_ACTIVE');

    stationScene = new StationScene(async () => {
      // Climax victory transmission scene
      const transScene = new TransmissionScene(async () => {
        await launchStation();
      });
      await sceneManager.switchScene('TRANSMISSION', transScene, 0.5);
    });

    await sceneManager.switchScene('STATION', stationScene, 0.4);
  };

  // 5. Seamless First-Interaction Audio Unlock
  const unlockAudioOnUserGesture = () => {
    audioUnlockManager.unlock().catch(() => {});
    window.removeEventListener('pointerdown', unlockAudioOnUserGesture);
    window.removeEventListener('keydown', unlockAudioOnUserGesture);
  };
  window.addEventListener('pointerdown', unlockAudioOnUserGesture, { once: true });
  window.addEventListener('keydown', unlockAudioOnUserGesture, { once: true });

  // 6. Initialize Engine with Fixed Simulation Loop
  const engine = new Engine(1 / 60, 0.25, {
    fixedUpdate: (dt: number) => {
      sceneManager.fixedUpdate(dt);
      parallax.update(dt);
      screenShake.update(dt);
      vhsGlitch.update(dt);
    },
    render: (alpha: number) => {
      if (crtFilter) {
        crtFilter.update(1 / 60);
      }
      fpsDebugger.update();
      sceneManager.render(alpha);
    },
  });

  // 7. Event Bus Reaction Hooks
  globalEventBus.on('thermal:critical', () => {
    screenShake.addTrauma(0.6);
    vhsGlitch.triggerGlitch(0.8, 0.5);
  });

  globalEventBus.on('signal:lock-achieved', () => {
    vhsGlitch.triggerGlitch(0.4, 0.3);
  });

  // 8. WebGL Context Loss / Recovery Safeguards
  app.canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    console.warn('[WebGL] Context lost. Pausing engine loop.');
    engine.pause();
    globalEventBus.emit('render:context-lost');
  });

  app.canvas.addEventListener('webglcontextrestored', () => {
    console.info('[WebGL] Context restored. Reinitializing render pipeline.');
    engine.resume();
    globalEventBus.emit('render:context-restored');
  });

  // 9. Window Resize Listener
  const handleResize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    app.renderer.resize(w, h);
    app.stage.hitArea = new Rectangle(0, 0, w, h);
    if (crtFilter) {
      crtFilter.setResolution(w, h);
    }
    sceneManager.resize(w, h);
    vhsGlitch.resize(w, h);
  };

  window.addEventListener('resize', handleResize);
  handleResize();

  // 10. Boot sequence with instant-skip on click -> launch station
  let bootFinished = false;
  const finishBootAndLaunch = async () => {
    if (bootFinished) return;
    bootFinished = true;
    window.removeEventListener('pointerdown', skipBootHandler);
    window.removeEventListener('keydown', skipBootHandler);
    await launchStation();
  };

  const skipBootHandler = () => {
    finishBootAndLaunch();
  };

  window.addEventListener('pointerdown', skipBootHandler, { once: true });
  window.addEventListener('keydown', skipBootHandler, { once: true });

  const bootScene = new BootScene(() => {
    finishBootAndLaunch();
  });

  await sceneManager.switchScene('BOOT', bootScene, 0);
  engine.start();

  console.info('🌊 The Pale Signal initialized successfully.');
}

// Immediate bootstrap invocation (safe against readyState race conditions)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    bootstrap().catch((err) => console.error('Fatal initialization error:', err));
  });
} else {
  bootstrap().catch((err) => console.error('Fatal initialization error:', err));
}
