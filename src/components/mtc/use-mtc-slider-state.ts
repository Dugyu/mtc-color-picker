'main thread';

import { useState } from '@lynx-js/react';
import { usePointerInteraction } from './use-mtc-pointer-interaction';
import type {
  PointerPosition,
  UsePointerInteractionReturnValue,
} from './use-mtc-pointer-interaction';

import { MathUtils } from '@/utils/math-utils';

import type {
  UseSliderPropsBase,
  UseSliderReturnValueBase,
} from '@/types/slider';

type UseSliderProps = UseSliderPropsBase;
type UseSliderReturnValue =
  UseSliderReturnValueBase<UsePointerInteractionReturnValue>;

function useSlider({
  min = 0,
  max = 100,
  step: stepProp = 1,
  initialValue = min,
  disabled = false,
  onChange,
}: UseSliderProps): UseSliderReturnValue {
  const [value, setValue] = useState(initialValue);

  const ratio = MathUtils.valueToRatio(value, min, max);
  const step = stepProp > 0 ? stepProp : 1;

  const quantize = ({ offsetRatio }: PointerPosition) => {
    return MathUtils.quantizeFromRatio(offsetRatio, min, max, step);
  };

  const pointerReturnedValue = usePointerInteraction({
    onUpdate: (pos) => {
      if (disabled) return;
      const next = quantize(pos);
      setValue(next);
      onChange?.(next);
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
