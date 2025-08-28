import { defineConfig } from '@lynx-js/rspeedy';

import { pluginQRCode } from '@lynx-js/qrcode-rsbuild-plugin';
import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin';
import { pluginTypeCheck } from '@rsbuild/plugin-type-check';
import { pluginTailwindCSS } from 'rsbuild-plugin-tailwindcss';

const blockingEnabled = process.env.LYNX_DEMO_BLOCKING_ENABLED === 'true';

export default defineConfig({
  source: {
    entry: {
      BTCMTSColorPicker: './src/demos/BTCMTSColorPicker.tsx',
      BTCMTSSlider: './src/demos/BTCMTSSlider.tsx',
      BTCSlider: './src/demos/BTCSlider.tsx',
    },
    define: {
      __ENABLE_BACKGROUND_BLOCKING__: JSON.stringify(blockingEnabled),
    },
  },
  plugins: [
    pluginQRCode({
      schema(url) {
        // We use `?fullscreen=true` to open the page in LynxExplorer in full screen mode
        return `${url}?fullscreen=true`;
      },
    }),
    pluginReactLynx({
      enableCSSInheritance: true,
      enableParallelElement: false,
    }),
    pluginTypeCheck(),
    pluginTailwindCSS({
      config: 'tailwind.config.ts',
    }),
  ],
});
