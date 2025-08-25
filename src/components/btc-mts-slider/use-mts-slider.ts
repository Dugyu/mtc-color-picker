import {
  useCallback,
  useEffect,
  useMainThreadRef,
  MainThreadRef,
} from '@lynx-js/react';
import type { MainThread } from '@lynx-js/types';

import { useMTSPointerInteraction } from './use-mts-pointer-interaction';
import type { PointerPosition } from './use-mts-pointer-interaction';

import { useMTSControllable, type MTSSetterRef } from './use-mts-controllable';
import { useMTSEffectEvent, mtsNoop } from './use-mts-effect-event';

interface UseMTSSliderProps {
  mtsSetValue?: MTSSetterRef<number>;
  initialValue: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onMTSChange?: (value: number) => void;
  onMTSCommit?: (value: number) => void;
}

function useMTSSlider(props: UseMTSSliderProps): UseMTSSliderReturnValue {
  const {
    mtsSetValue: externalSetterRef,
    min = 0,
    max = 100,
    step: stepProp = 1,
    initialValue = min,
    disabled = false,
    onMTSChange,
    onMTSCommit,
  } = props;

  const [valueRef, setValue] = useMTSControllable({
    mtsSetValue: externalSetterRef,
    initialValue,
    onMTSChange,
  });

  const ratioRef = useMainThreadRef(
    min === max ? 0 : (initialValue - min) / (max - min),
  );

  const stableOnCommit = useMTSEffectEvent(onMTSCommit ?? mtsNoop);

  const step = stepProp > 0 ? stepProp : 1;

  const quantize = useCallback(
    ({ offsetRatio }: PointerPosition) => {
      'main thread';
      const raw = min + offsetRatio * (max - min);
      const aligned = Math.round(raw / step) * step;
      return clamp(aligned, min, max);
    },
    [min, max, step],
  );

  const {
    onMTSPointerDown,
    onMTSPointerMove,
    onMTSPointerUp,
    onMTSElementLayoutChange,
  } = useMTSPointerInteraction({
    onMTSValueUpdate: (pos) => {
      'main thread';
      if (disabled) return;
      const next = quantize(pos);
      setValue(next);
    },
    onMTSValueCommit: async (pos) => {
      'main thread';
      if (disabled) return;
      const next = quantize(pos);
      stableOnCommit(next);
      setValue(next);
    },
  });

  useEffect(() => {}, []);

  return {
    valueRef,
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
export type { UseMTSSliderProps, UseMTSSliderReturnValue };
