import type { Config } from 'tailwindcss';

import preset from '@lynx-js/tailwind-preset';

export default {
  // 'content' config will be replaced by pluginTailwindCSS,
  // retains here for correct typing
  content: [],
  presets: [preset],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: 'var(--color-base-1)',
          1: 'var(--color-base-1)',
          2: 'var(--color-base-2)',
          3: 'var(--color-base-3)',
          4: 'var(--color-base-4)',
          content: 'var(--color-base-content)',
        },
        content: 'var(--color-base-content)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          content: 'var(--color-primary-content)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          content: 'var(--color-secondary-content)',
        },
        muted: {
          DEFAULT: 'var(--color-muted)',
          content: 'var(--color-muted-content)',
        },
        neutral: {
          DEFAULT: 'var(--color-neutral)',
          content: 'var(--color-neutral-content)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
      },
    },
  },
  // other config keys...
} satisfies Config;
