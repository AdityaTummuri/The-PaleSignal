import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    glsl(),
  ],
  resolve: {
    alias: {
      '@core': resolve(import.meta.dirname, 'src/core'),
      '@typings': resolve(import.meta.dirname, 'src/types'),
      '@rendering': resolve(import.meta.dirname, 'src/rendering'),
      '@mechanics': resolve(import.meta.dirname, 'src/mechanics'),
      '@utils': resolve(import.meta.dirname, 'src/utils'),
      '@data': resolve(import.meta.dirname, 'src/data'),
    },
  },
  build: {
    target: 'es2022',
    minify: 'esbuild',
    sourcemap: false,
  },
  server: {
    port: 5173,
    open: false,
  },
});
