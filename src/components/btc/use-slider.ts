import { usePointerInteraction } from './use-pointer-interaction';
import type {
  PointerPosition,
  UsePointerInteractionReturnValue,
} from './use-pointer-interaction';

import { useControllable } from './use-controllable';

import { MathUtils } from '@/utils/math-utils';

import type {
  UseSliderPropsBase,
  UseSliderReturnValueBase,
} from '@/types/slider';

type UseSliderProps = UseSliderPropsBase<{ value?: number }>;
type UseSliderReturnValue =
  UseSliderReturnValueBase<UsePointerInteractionReturnValue>;

function useSlider(props: UseSliderProps): UseSliderReturnValue {
  const {
    value: controlledValue,
    min = 0,
    max = 100,
    step: stepProp = 1,
    initialValue = min,
    disabled = false,
    onChange,
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

export { useSlider };
export type { UseSliderProps, UseSliderReturnValue };
