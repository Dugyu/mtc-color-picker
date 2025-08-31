'main thread';

import { useState } from '@lynx-js/react';
import { useMTCPointerInteraction } from './use-mtc-pointer-interaction';
import type {
  PointerPosition,
  UseMTCPointerInteractionReturnValue,
} from './use-mtc-pointer-interaction';

interface UseMTCSliderProps {
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onChange?: (value: number) => void;
  onCommit?: (value: number) => void;
}

function useMTCSlider({
  min = 0,
  max = 100,
  step: stepProp = 1,
  defaultValue = min,
  disabled = false,
  onChange,
  onCommit,
}: UseMTCSliderProps) {
  const [value, setValue] = useState(defaultValue);

  const ratio = valueToRatio(value, min, max);
  const step = stepProp > 0 ? stepProp : 1;

  const quantize = ({ offsetRatio }: PointerPosition) => {
    const span = max - min;
    if (!Number.isFinite(span) || span <= 0) return min;
    const raw = min + offsetRatio * span;
    const aligned = Math.round((raw - min) / step) * step + min;
    return clamp(aligned, min, max);
  };

  const pointerReturnedValue = useMTCPointerInteraction({
    onUpdate: (pos) => {
      if (disabled) return;
      const next = quantize(pos);
      setValue(next);
      onChange?.(next);
    },
    onCommit: (pos) => {
      if (disabled) return;
      const next = quantize(pos);
      setValue(next);
      onCommit?.(next);
    },
  });

  return {
    value,
    ratio,
    min,
    max,
    step,
    disabled,
    ...pointerReturnedValue,
  };
}

interface UseMTCSliderReturnValue extends UseMTCPointerInteractionReturnValue {
  value: number;
  ratio: number;
  min: number;
  max: number;
  step: number;
  disabled: boolean;
}

function clamp(v: number, min: number, max: number): number {
  // Ensure value stays within [min, max]
  return Math.max(min, Math.min(max, v));
}

function clamp01(x: number) {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

function valueToRatio(v: number, min: number, max: number) {
  const span = max - min;
  if (!Number.isFinite(span) || span <= 0) return 0;
  return clamp01((v - min) / span);
}

export { useMTCSlider };
export type { UseMTCSliderProps, UseMTCSliderReturnValue };
