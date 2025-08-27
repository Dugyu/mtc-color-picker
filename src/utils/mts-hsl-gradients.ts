// hsl-gradients.ts
export type HueStops = number[];

export interface GradientPair {
  track: string; // main gradient
  edge: string; // edge overlay to avoid endpoint artifacts
}

const clamp = (v: number, min: number, max: number) => {
  'main thread';
  return Math.min(Math.max(v, min), max);
};

const linearToRight = (...stops: string[]) => {
  'main thread';
  return `linear-gradient(to right, ${stops.join(', ')})`;
};

const hsl = (h: number, s: number, l: number) => {
  'main thread';
  return `hsl(${h}, ${s}%, ${l}%)`;
};

/* ===================== Hue ===================== */
const DEFAULT_HUE_STOPS: number[] = [0, 60, 120, 180, 240, 300, 360];
const normHue = (h: number) => {
  'main thread';
  return ((h % 360) + 360) % 360;
};

export function hueTrack(
  s: number,
  l: number,
  stops: HueStops = DEFAULT_HUE_STOPS,
): string {
  'main thread';
  const S = clamp(s, 0, 100);
  const L = clamp(l, 0, 100);
  return linearToRight(...stops.map((h) => hsl(normHue(h), S, L)));
}

export function hueEdge(s: number, l: number): string {
  'main thread';
  const S = clamp(s, 0, 100);
  const L = clamp(l, 0, 100);
  return linearToRight(hsl(0, S, L), hsl(0, S, L));
}

export const hueGradientPair = (
  s: number,
  l: number,
  stops?: HueStops,
): GradientPair => {
  'main thread';
  return {
    track: hueTrack(s, l, stops),
    edge: hueEdge(s, l),
  };
};

/** ===================== Lightness ===================== */
export function lightnessTrack(h: number, s: number): string {
  'main thread';
  const H = normHue(h);
  const S = clamp(s, 0, 100);
  return linearToRight(hsl(H, S, 0), hsl(H, S, 50), hsl(H, S, 100));
}

export function lightnessEdge(h: number, s: number): string {
  'main thread';
  const H = normHue(h);
  const S = clamp(s, 0, 100);
  return linearToRight(
    hsl(H, S, 0),
    hsl(H, S, 0),
    hsl(H, S, 100),
    hsl(H, S, 100),
  );
}

export const lightnessGradientPair = (h: number, s: number): GradientPair => {
  'main thread';
  return {
    track: lightnessTrack(h, s),
    edge: lightnessEdge(h, s),
  };
};

/* ===================== Saturation ===================== */
export function saturationTrack(h: number, l: number): string {
  'main thread';
  const H = normHue(h);
  const L = clamp(l, 0, 100);
  return linearToRight(hsl(H, 0, L), hsl(H, 100, L));
}

export function saturationEdge(h: number, l: number): string {
  'main thread';
  const H = normHue(h);
  const L = clamp(l, 0, 100);
  return linearToRight(
    hsl(H, 0, L),
    hsl(H, 0, L),
    hsl(H, 100, L),
    hsl(H, 100, L),
  );
}

export const saturationGradientPair = (h: number, l: number): GradientPair => {
  'main thread';
  return {
    track: saturationTrack(h, l),
    edge: saturationEdge(h, l),
  };
};

/* ===================== Namespace ===================== */
export const MTSHSLGradients = {
  hueTrack,
  hueEdge,
  hueGradientPair,
  lightnessTrack,
  lightnessEdge,
  lightnessGradientPair,
  saturationTrack,
  saturationEdge,
  saturationGradientPair,
};
