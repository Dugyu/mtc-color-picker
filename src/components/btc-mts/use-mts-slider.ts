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

interface UseSliderProps {
  writeValue?: WriterWithControlsRef<number>;
  initialValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;

  onDerivedChange?: (value: number) => void;
  onChange?: (value: number) => void;
  onCommit?: (value: number) => void;
}

function useSlider(props: UseSliderProps): UseSliderReturnValue {
  const {
    writeValue: externalWriterRef,
    min = 0,
    max = 100,
    step: stepProp = 1,
    initialValue = min,
    disabled = false,
    onDerivedChange,
    onChange,
    onCommit,
  } = props;

  const step = stepProp > 0 ? stepProp : 1;
  const ratioRef = useMainThreadRef(valueToRatio(initialValue, min, max));

  const forwardOnDerivedChange = useCallback(
    (v: number) => {
      'main thread';
      ratioRef.current = mtsValueToRatio(v, min, max);
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
      const span = max - min;
      if (!Number.isFinite(span) || span <= 0) return min;
      const raw = min + offsetRatio * span;
      const aligned = Math.round((raw - min) / step) * step + min;
      return clamp(aligned, min, max);
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

  const handlePointerCommit = (pos: PointerPosition) => {
    ('main thread');
    if (disabled) return;
    const next = quantize(pos);
    // Controlled: only notify change;
    // Uncontrolled: update internals and notify change;
    writeValue(next);
    onCommit?.(next);
  };

  const {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleElementLayoutChange,
  } = usePointerInteraction({
    onUpdate: handlePointerUpdate,
    onCommit: handlePointerCommit,
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

interface UseSliderReturnValue extends UsePointerInteractionReturnValue {
  writeValue: WriterWithControls<number>;
  valueRef: MainThreadRef<number>;
  ratioRef: MainThreadRef<number>;
  min: number;
  max: number;
  step: number;
  disabled: boolean;
}

function clamp(v: number, min: number, max: number): number {
  'main thread';
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

function mtsValueToRatio(v: number, min: number, max: number) {
  'main thread';
  const span = max - min;
  if (!Number.isFinite(span) || span <= 0) return 0;
  return clamp((v - min) / span, 0, 1);
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
