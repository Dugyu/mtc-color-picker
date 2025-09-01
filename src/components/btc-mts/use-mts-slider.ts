import { useMainThreadRef, MainThreadRef } from '@lynx-js/react';

import { usePointerInteraction } from './use-mts-pointer-interaction';
import type {
  PointerPosition,
  UsePointerInteractionReturnValue,
} from './use-mts-pointer-interaction';

import { useOwnable } from './use-mts-ownable';
import type {
  Writer,
  WriterRef,
  WriterWithControls,
  WriterWithControlsRef,
} from './use-mts-ownable';

import { MTSMathUtils } from '@/utils/mts-math-utils';
import { MathUtils } from '@/utils/math-utils';

import type {
  UseSliderPropsBase,
  UseSliderReturnValueBase,
} from '@/types/slider';

type UseSliderProps = UseSliderPropsBase<{
  writeValue?: WriterWithControlsRef<number>;
  onDerivedChange?: (value: number) => void;
}>;

type UseSliderReturnValue = UseSliderReturnValueBase<
  UsePointerInteractionReturnValue,
  {
    writeValue: WriterWithControls<number>;
    valueRef: MainThreadRef<number>;
    ratioRef: MainThreadRef<number>;
  }
>;

function useSlider({
  writeValue: externalWriterRef,
  min = 0,
  max = 100,
  step: stepProp = 1,
  initialValue = min,
  disabled = false,
  onDerivedChange,
  onChange,
}: UseSliderProps): UseSliderReturnValue {
  const step = stepProp > 0 ? stepProp : 1;
  const ratioRef = useMainThreadRef(
    MathUtils.valueToRatio(initialValue, min, max),
  );

  const forwardOnDerivedChange = (v: number) => {
    'main thread';
    ratioRef.current = MTSMathUtils.valueToRatio(v, min, max);
    onDerivedChange?.(v);
  };

  const [valueRef, writeValue] = useOwnable({
    writeValue: externalWriterRef,
    initialValue,
    onDerivedChange: forwardOnDerivedChange,
    onChange,
  });

  const quantize = ({ offsetRatio }: PointerPosition) => {
    'main thread';
    return MTSMathUtils.quantizeFromRatio(offsetRatio, min, max, step);
  };

  const handlePointerUpdate = (pos: PointerPosition) => {
    ('main thread');
    if (disabled) return;
    const next = quantize(pos);
    // external-owned: only notify change;
    // owned: update internals and notify change;
    writeValue(next);
  };

  const pointerReturnedValue = usePointerInteraction({
    onUpdate: handlePointerUpdate,
  });

  return {
    valueRef,
    writeValue,
    ratioRef,
    min,
    max,
    step,
    disabled,
    ...pointerReturnedValue,
  };
}

export { useSlider };
export type {
  UseSliderProps,
  UseSliderReturnValue,
  WriterRef,
  Writer,
  WriterWithControls,
  WriterWithControlsRef,
};
