import { defineConfig } from '@lynx-js/rspeedy';

import { pluginQRCode } from '@lynx-js/qrcode-rsbuild-plugin';
import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin';
import { pluginTypeCheck } from '@rsbuild/plugin-type-check';
import { pluginTailwindCSS } from 'rsbuild-plugin-tailwindcss';

export default defineConfig({
  source: {
    entry: {},
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
