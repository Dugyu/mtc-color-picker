import {
  useCallback,
  useMemo,
  useMainThreadRef,
  MainThreadRef,
} from '@lynx-js/react';
import type { MainThread } from '@lynx-js/types';

import { useMTSPointerInteraction } from './use-mts-pointer-interaction';
import type { PointerPosition } from './use-mts-pointer-interaction';

import { useMTSControllable } from './use-mts-controllable';
import type {
  MTSWriter,
  MTSWriterRef,
  MTSWriterWithControls,
} from './use-mts-controllable';
// import { useMTSEffectEvent } from './use-mts-effect-event';

interface UseMTSSliderProps {
  mtsWriteValue?: MTSWriterRef<number>;
  initialValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onMTSChange?: (value: number) => void;
  onMTSCommit?: (value: number) => void;
}

function useMTSSlider(props: UseMTSSliderProps): UseMTSSliderReturnValue {
  const {
    mtsWriteValue,
    min = 0,
    max = 100,
    step: stepProp = 1,
    initialValue = min,
    disabled = false,
    onMTSChange,
    onMTSCommit,
  } = props;

  const step = useMemo(() => (stepProp > 0 ? stepProp : 1), [stepProp]);
  const ratioRef = useMainThreadRef(valueToRatio(initialValue, min, max));

  const forwardOnMTSChange = useCallback(
    (v: number) => {
      'main thread';
      ratioRef.current = mtsValueToRatio(v, min, max);
      onMTSChange?.(v);
    },
    [onMTSChange, min, max],
  );

  const [valueRef, writeValue] = useMTSControllable({
    mtsWriteValue,
    initialValue,
    onMTSChange: forwardOnMTSChange,
  });

  // const stableOnCommit = useMTSEffectEvent(onMTSCommit);

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

  const onMTSPointerUpdate = useCallback(
    (pos: PointerPosition) => {
      'main thread';
      if (disabled) return;
      const next = quantize(pos);
      writeValue(next); // write value and notify change, call onMTSChange
    },
    [disabled, quantize, writeValue],
  );

  const onMTSPointerCommit = useCallback(
    async (pos: PointerPosition) => {
      'main thread';
      if (disabled) return;
      const next = quantize(pos);
      onMTSCommit?.(next);
    },
    [disabled, quantize, writeValue],
  );

  const {
    onMTSPointerDown,
    onMTSPointerMove,
    onMTSPointerUp,
    onMTSElementLayoutChange,
  } = useMTSPointerInteraction({
    onMTSUpdate: onMTSPointerUpdate,
    onMTSCommit: onMTSPointerCommit,
  });

  const returnedValue = useMemo(
    () => ({
      valueRef,
      writeValue,
      ratioRef,
      min,
      max,
      step,
      disabled,
      onMTSPointerDown,
      onMTSPointerMove,
      onMTSPointerUp,
      onMTSTrackLayoutChange: onMTSElementLayoutChange,
    }),
    [
      writeValue,
      min,
      max,
      step,
      disabled,
      onMTSPointerDown,
      onMTSPointerMove,
      onMTSPointerUp,
      onMTSPointerUp,
      onMTSElementLayoutChange,
    ],
  );

  return returnedValue;
}

interface UseMTSSliderReturnValue {
  writeValue: MTSWriterWithControls<number>;
  valueRef: MainThreadRef<number>;
  ratioRef: MainThreadRef<number>;
  onMTSPointerDown: (e: MainThread.TouchEvent) => void;
  onMTSPointerMove: (e: MainThread.TouchEvent) => void;
  onMTSPointerUp: (e: MainThread.TouchEvent) => void;
  onMTSTrackLayoutChange: (e: MainThread.LayoutChangeEvent) => Promise<void>;
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

export { useMTSSlider };
export type {
  UseMTSSliderProps,
  UseMTSSliderReturnValue,
  MTSWriterRef,
  MTSWriter,
};
