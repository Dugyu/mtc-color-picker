import { useCallback, useRef, useEffect } from '@lynx-js/react';
import type { RefObject } from '@lynx-js/react';
import type { LayoutChangeEvent, NodesRef, TouchEvent } from '@lynx-js/types';

import { usePointerInteraction } from './use-pointer-interaction';
import type { PointerPosition } from './use-pointer-interaction';

import { useControllable } from './use-controllable';
import { useEffectEvent, noop } from './use-effect-event';

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

  const stableOnCommit = useEffectEvent(onCommit ?? noop);

  const dragStartValueRef = useRef<number>(value);
  const prevDraggingRef = useRef(false);

  const step = stepProp > 0 ? stepProp : 1;

  const quantize = useCallback(
    ({ offsetRatio }: PointerPosition) => {
      const raw = min + offsetRatio * (max - min);
      const aligned = Math.round(raw / step) * step;
      return clamp(aligned, min, max);
    },
    [min, max, step],
  );

  const {
    elementRef: trackRef,
    dragging,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onElementLayoutChange,
  } = usePointerInteraction({
    onValueUpdate: (pos) => {
      if (disabled) return;
      const next = quantize(pos);
      setValue(next);
    },
    onValueCommit: (pos) => {
      if (disabled) return;
      const next = quantize(pos);
      if (next !== dragStartValueRef.current) {
        stableOnCommit(next);
      }
      setValue(next);
    },
  });

  useEffect(() => {
    if (dragging && !prevDraggingRef.current) {
      dragStartValueRef.current = value;
    }
    prevDraggingRef.current = dragging;
  }, [dragging, value]);

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
