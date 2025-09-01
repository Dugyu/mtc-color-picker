import { useCallback, useMainThreadRef, MainThreadRef } from '@lynx-js/react';

import { usePointerInteraction } from './use-mts-pointer-interaction';
import type {
  PointerPosition,
  UsePointerInteractionReturnValue,
} from './use-mts-pointer-interaction';

import { useControllable } from './use-mts-controllable';
import type {
  Writer,
  WriterRef,
  WriterWithControls,
  WriterWithControlsRef,
} from './use-mts-controllable';

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

  const forwardOnDerivedChange = useCallback(
    (v: number) => {
      'main thread';
      ratioRef.current = MTSMathUtils.valueToRatio(v, min, max);
      onDerivedChange?.(v);
    },
    [onDerivedChange, min, max],
  );

  const [valueRef, writeValue] = useControllable({
    writeValue: externalWriterRef,
    initialValue,
    onDerivedChange: forwardOnDerivedChange,
    onChange,
  });

  const quantize = useCallback(
    ({ offsetRatio }: PointerPosition) => {
      'main thread';
      return MTSMathUtils.quantizeFromRatio(offsetRatio, min, max, step);
    },
    [min, max, step],
  );

  const handlePointerUpdate = useCallback(
    (pos: PointerPosition) => {
      ('main thread');
      if (disabled) return;
      const next = quantize(pos);
      // Controlled: only notify change;
      // Uncontrolled: update internals and notify change;
      writeValue(next);
    },
    [disabled, quantize, writeValue],
  );

  const {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleElementLayoutChange,
  } = usePointerInteraction({
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
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleElementLayoutChange,
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
