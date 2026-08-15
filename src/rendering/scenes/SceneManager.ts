// ═════════════════════════════════════════════════════════════════════════════
// src/rendering/scenes/SceneManager.ts — Scene Lifecycle & Transition Manager
// ═════════════════════════════════════════════════════════════════════════════

import { Container } from 'pixi.js';
import gsap from 'gsap';
import { globalEventBus } from '@core/events/EventBus';

export interface Scene {
  readonly view: Container;
  enter(): Promise<void> | void;
  exit(): Promise<void> | void;
  fixedUpdate?(dt: number): void;
  render?(alpha: number): void;
  resize?(width: number, height: number): void;
  dispose?(): void;
}

export class SceneManager {
  readonly stage = new Container();
  private currentScene: Scene | null = null;
  private currentSceneName: string = '';
  private width: number = 1920;
  private height: number = 1080;

  constructor() {
    this.stage.label = 'SceneManagerRoot';
  }

  get activeScene(): Scene | null {
    return this.currentScene;
  }

  get sceneName(): string {
    return this.currentSceneName;
  }

  /**
   * Transition to a new scene with an optional crossfade.
   */
  async switchScene(name: string, newScene: Scene, duration: number = 0.35): Promise<void> {
    if (this.currentScene) {
      if (duration > 0) {
        await gsap.to(this.currentScene.view, {
          alpha: 0,
          duration,
          ease: 'power2.out',
        });
      }
      await this.currentScene.exit();
      this.stage.removeChild(this.currentScene.view);
      this.currentScene.dispose?.();
    }

    this.currentScene = newScene;
    this.currentSceneName = name;

    newScene.view.alpha = 0;
    this.stage.addChild(newScene.view);

    if (newScene.resize) {
      newScene.resize(this.width, this.height);
    }

    await newScene.enter();

    if (duration > 0) {
      await gsap.to(newScene.view, {
        alpha: 1,
        duration,
        ease: 'power2.in',
      });
    } else {
      newScene.view.alpha = 1;
    }

    globalEventBus.emit('render:scene-ready', { sceneName: name });
  }

  fixedUpdate(dt: number): void {
    this.currentScene?.fixedUpdate?.(dt);
  }

  render(alpha: number): void {
    this.currentScene?.render?.(alpha);
  }

  resize(w: number, height: number): void {
    this.width = w;
    this.height = height;
    this.currentScene?.resize?.(w, height);
  }
}
