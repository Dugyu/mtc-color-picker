'main thread';

import { useComputed, useSignal } from '@lynx-js/react/signals';
import { useMTCPointerInteraction } from './use-mtc-pointer-interaction';
import type { PointerPosition } from './use-mtc-pointer-interaction';

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
  const value = useSignal(defaultValue);
  const ratio = useComputed(() => valueToRatio(value.value, min, max));

  const step = stepProp > 0 ? stepProp : 1;

  const quantize = ({ offsetRatio }: PointerPosition) => {
    const span = max - min;
    if (!Number.isFinite(span) || span <= 0) return min;
    const raw = min + offsetRatio * span;
    const aligned = Math.round((raw - min) / step) * step + min;
    return clamp(aligned, min, max);
  };

  const {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleElementLayoutChange,
  } = useMTCPointerInteraction({
    onUpdate: (pos) => {
      if (disabled) return;
      const next = quantize(pos);
      value.value = next;
      onChange?.(next);
    },
    onCommit: (pos) => {
      if (disabled) return;
      const next = quantize(pos);
      value.value = next;
      onCommit?.(next);
    },
  });
  return {
    value,
    ratio,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleElementLayoutChange,
  };
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

export type { UseMTCSliderProps };
