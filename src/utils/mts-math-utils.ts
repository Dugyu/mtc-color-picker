/** Clamp value into [min, max]. */
function clamp(v: number, min: number, max: number): number {
  'main thread';
  // Ensure value stays within [min, max]
  return Math.max(min, Math.min(max, v));
}

/** Map absolute value -> [0,1] ratio within [min, max]. */
function valueToRatio(v: number, min: number, max: number) {
  'main thread';
  const span = max - min;
  if (!Number.isFinite(span) || span <= 0) return 0;
  return clamp((v - min) / span, 0, 1);
}

/** Map [0,1] ratio -> absolute value within [min, max]. */
export function ratioToValue(ratio: number, min: number, max: number): number {
  'main thread';
  const r = clamp(ratio, 0, 1);
  return min + r * (max - min);
}

/** Quantize an absolute value to a step grid anchored at `min`, then clamp. */
export function quantizeValue(
  value: number,
  min: number,
  max: number,
  step: number,
): number {
  'main thread';
  const span = max - min;
  if (!Number.isFinite(span) || span <= 0) return min;
  if (!Number.isFinite(step) || step <= 0) return clamp(value, min, max);

  const k = Math.round((value - min) / step);
  const aligned = min + k * step;
  return clamp(aligned, min, max);
}

/** Quantize from a ratio ([0,1]) with [min,max] & step. */
export function quantizeFromRatio(
  offsetRatio: number,
  min: number,
  max: number,
  step: number,
): number {
  'main thread';
  const raw = ratioToValue(offsetRatio, min, max);
  return quantizeValue(raw, min, max, step);
}

/* ===================== Namespace ===================== */
export const MTSMathUtils = {
  valueToRatio,
  clamp,
  quantizeFromRatio,
};
