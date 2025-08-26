import type { RefObject } from '@lynx-js/react';
import type { LayoutChangeEvent, NodesRef, TouchEvent } from '@lynx-js/types';

import { usePointerInteraction } from './use-pointer-interaction';
import type { PointerPosition } from './use-pointer-interaction';

import { useControllable } from './use-controllable';

interface UseSliderProps {
  value?: number;
  defaultValue?: number;
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
    defaultValue = min,
    disabled = false,
    onChange,
    onCommit,
  } = props;

  const [value = defaultValue, setValue] = useControllable<number>({
    value: controlledValue,
    defaultValue,
    onChange,
  });

  const step = stepProp > 0 ? stepProp : 1;

  const quantize = ({ offsetRatio }: PointerPosition) => {
    const span = max - min;
    if (!Number.isFinite(span) || span <= 0) return min;
    const raw = min + offsetRatio * span;
    const aligned = Math.round((raw - min) / step) * step + min;
    return clamp(aligned, min, max);
  };

  const {
    elementRef: trackRef,
    dragging,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onElementLayoutChange,
  } = usePointerInteraction({
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
    ratio: min === max ? 0 : (value - min) / (max - min),
    dragging,
    min,
    max,
    step,
    disabled,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    trackRef,
    onTrackLayoutChange: onElementLayoutChange,
  };
}

interface UseSliderReturnValue {
  value: number;
  ratio: number;
  dragging: boolean;
  onPointerDown: (e: TouchEvent) => void;
  onPointerMove: (e: TouchEvent) => void;
  onPointerUp: (e: TouchEvent) => void;
  onTrackLayoutChange: (e: LayoutChangeEvent) => void;
  trackRef: RefObject<NodesRef>;
  min: number;
  max: number;
  step: number;
  disabled: boolean;
}

function clamp(v: number, min: number, max: number): number {
  // Ensure value stays within [min, max]
  return Math.max(min, Math.min(max, v));
}

export { useSlider };
export type { UseSliderProps, UseSliderReturnValue };
