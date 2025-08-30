# mtc-color-picker

Demo repo showing why Main Thread Components (MTC) are needed in Lynx

## Rspeedy project

This is a ReactLynx project bootstrapped with `create-rspeedy`.

## Getting Started

First, install the dependencies:

```bash
pnpm install
```

Then, run the development server:

```bash
pnpm run dev
```

Scan the QRCode in the terminal with your LynxExplorer App to see the result.

## Testing Background Blocking

This demo includes a toggle for simulating background thread blocking, to verify that Main-Thread Scripting (MTS) ensures UI responsiveness even under heavy background load.

Run with blocking enabled:

```bash
pnpm run demo
```

This command sets the environment variable:

```json
"scripts": {
  "demo": "cross-env LYNX_DEMO_BLOCKING_ENABLED=true rspeedy dev",
  "build": "cross-env LYNX_DEMO_BLOCKING_ENABLED=false rspeedy build",
  "dev": "cross-env LYNX_DEMO_BLOCKING_ENABLED=false rspeedy dev",
  "preview": "cross-env LYNX_DEMO_BLOCKING_ENABLED=false rspeedy preview"
}
```

- `LYNX_DEMO_BLOCKING_ENABLED=true` which enables background blocking test mode.
- By default (dev, build, preview) blocking is disabled.

This makes it easy to reproduce blocking scenarios and confirm that the UI is unaffected thanks to MTS.
