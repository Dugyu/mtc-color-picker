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
import { useMTSEffectEvent, mtsNoop } from './use-mts-effect-event';

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

  const [valueRef, writeValue] = useMTSControllable({
    mtsWriteValue,
    initialValue,
    onMTSChange,
  });

  const ratioRef = useMainThreadRef(
    min === max ? 0 : (initialValue - min) / (max - min),
  );

  const stableOnCommit = useMTSEffectEvent(onMTSCommit ?? mtsNoop);

  const step = useMemo(() => (stepProp > 0 ? stepProp : 1), [stepProp]);

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
      writeValue(next);
      ratioRef.current =
        min === max ? 0 : (valueRef.current - min) / (max - min);
    },
    [disabled, quantize, writeValue],
  );

  const onMTSPointerCommit = useCallback(
    async (pos: PointerPosition) => {
      'main thread';
      if (disabled) return;
      const next = quantize(pos);
      stableOnCommit(next);
      writeValue(next);
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

  return {
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
  };
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

export { useMTSSlider };
export type {
  UseMTSSliderProps,
  UseMTSSliderReturnValue,
  MTSWriterRef,
  MTSWriter,
};
