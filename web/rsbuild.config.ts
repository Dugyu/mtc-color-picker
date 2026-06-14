import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [pluginReact()],
  root: __dirname,
  source: {
    entry: {
      index: './src/index.tsx',
    },
  },
  output: {
    distPath: {
      root: path.join(__dirname, 'dist'),
    },
  },
  server: {
    publicDir: [
      {
        name: path.join(__dirname, '..', 'dist'),
      },
    ],
  },
  html: {
    title: 'MTC Color Picker — Lynx for Web',
    meta: {
      viewport: 'width=device-width, initial-scale=1.0, viewport-fit=cover',
    },
  },
});
