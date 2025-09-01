'main thread';

import { useComputed, useSignal } from '@lynx-js/react/signals';
import { usePointerInteraction } from './use-mtc-pointer-interaction';
import type {
  PointerPosition,
  UsePointerInteractionReturnValue,
} from './use-mtc-pointer-interaction';

import { MathUtils } from '@/utils/math-utils';

interface UseSliderProps {
  initialValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onChange?: (value: number) => void;
  onCommit?: (value: number) => void;
}

function useSlider({
  min = 0,
  max = 100,
  step: stepProp = 1,
  initialValue = min,
  disabled = false,
  onChange,
  onCommit,
}: UseSliderProps) {
  const value = useSignal(initialValue);
  const ratio = useComputed(() =>
    MathUtils.valueToRatio(value.value, min, max),
  );

  const step = stepProp > 0 ? stepProp : 1;

  const quantize = ({ offsetRatio }: PointerPosition) => {
    return MathUtils.quantizeFromRatio(offsetRatio, min, max, step);
  };

  const pointerReturnedValue = usePointerInteraction({
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

export { useSlider };
export type { UseSliderProps, UseSliderReturnValue };
