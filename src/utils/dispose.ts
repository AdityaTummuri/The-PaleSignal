// ═════════════════════════════════════════════════════════════════════════════
// src/utils/dispose.ts — Memory Cleanup & Texture Disposal Utilities
// ═════════════════════════════════════════════════════════════════════════════

import type { Container } from 'pixi.js';

export function disposeHierarchy(container: Container): void {
  try {
    container.destroy({
      children: true,
      texture: true,
      textureSource: true,
    });
  } catch (err) {
    console.warn('[Dispose] Warning during container cleanup:', err);
  }
}
