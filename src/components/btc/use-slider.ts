import { usePointerInteraction } from './use-pointer-interaction';
import type {
  PointerPosition,
  UsePointerInteractionReturnValue,
} from './use-pointer-interaction';

import { useControllable } from './use-controllable';

import { MathUtils } from '@/utils/math-utils';

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
  const ratio = MathUtils.valueToRatio(value, min, max);

  const quantize = ({ offsetRatio }: PointerPosition) => {
    return MathUtils.quantizeFromRatio(offsetRatio, min, max, step);
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

export { useSlider };
export type { UseSliderProps, UseSliderReturnValue };
