import { usePointerInteraction } from './use-pointer-interaction';
import type {
  PointerPosition,
  UsePointerInteractionReturnValue,
} from './use-pointer-interaction';

import { useControllable } from './use-controllable';

interface UseSliderProps {
  value?: number;
  initialValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onChange?: (value: number) => void;
  onCommit?: (value: number) => void;
}

function useSlider(props: UseSliderProps): UseSliderReturnValue {
  const {
    value: controlledValue,
    min = 0,
    max = 100,
    step: stepProp = 1,
    initialValue = min,
    disabled = false,
    onChange,
    onCommit,
  } = props;

  const [value = initialValue, setValue] = useControllable<number>({
    value: controlledValue,
    initialValue,
    onChange,
  });

  const step = stepProp > 0 ? stepProp : 1;
  const ratio = valueToRatio(value, min, max);

  const quantize = ({ offsetRatio }: PointerPosition) => {
    const span = max - min;
    if (!Number.isFinite(span) || span <= 0) return min;
    const raw = min + offsetRatio * span;
    const aligned = Math.round((raw - min) / step) * step + min;
    return clamp(aligned, min, max);
  };

  const pointerReturnedValue = usePointerInteraction({
    onUpdate: (pos) => {
      if (disabled) return;
      const next = quantize(pos);
      setValue(next);
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

interface UseSliderReturnValue extends UsePointerInteractionReturnValue {
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

export { useSlider };
export type { UseSliderProps, UseSliderReturnValue };
