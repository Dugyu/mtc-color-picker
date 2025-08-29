'main thread';

import { useComputed, useSignal, signal } from '@lynx-js/react/signals';
import type { CSSProperties } from '@lynx-js/types';

import { useMTCSlider } from './use-mtc-slider';
import type { UseMTCSliderProps } from './use-mtc-slider';
import { HSLGradients } from '@/utils/hsl-gradients';

interface MTCSliderProps extends UseMTCSliderProps {
  // Styling
  rootStyle?: CSSProperties;
  trackStyle?: CSSProperties;
}

/** ================= Base Slider ================= */

function MTCSlider({ rootStyle, trackStyle, ...sliderProps }: MTCSliderProps) {
  const {
    ratio, // ReadonlySignal
    onMTCElementLayoutChange,
    onMTCPointerDown,
    onMTCPointerMove,
    onMTCPointerUp,
  } = useMTCSlider(sliderProps);

  return (
    // Root
    <view
      className="relative px-5 bg-primary w-full h-10 flex flex-row items-center rounded-full"
      style={rootStyle}
    >
      {/* Track Positioner */}
      <view
        className="relative w-full h-full flex flex-row items-center"
        // @ts-expect-error
        bindlayoutchange={onMTCElementLayoutChange}
        // @ts-expect-error
        bindtouchstart={onMTCPointerDown}
        // @ts-expect-error
        bindtouchmove={onMTCPointerMove}
        // @ts-expect-error
        bindtouchend={onMTCPointerUp}
        // @ts-expect-error
        bindtouchcancel={onMTCPointerUp}
      >
        {/* Track Visualizer */}
        <view className="w-full h-full bg-secondary" style={trackStyle}></view>
        {/* Thumb */}
        <view
          className="absolute bg-white size-8 rounded-full -translate-x-1/2 shadow-md"
          style={{ left: `${ratio.value * 100}%` }}
        ></view>
      </view>
    </view>
  );
}

/** ================= Hue Slider ================= */

const defaultSaturation = signal(100);
const defaultLightness = signal(50);

function MTCHueSlider({
  s = defaultSaturation,
  l = defaultLightness,
  defaultValue,
  onChange,
  onCommit,
  disabled,
}: Omit<MTCSliderProps, 'min' | 'max' | 'step'> & {
  s?: ReturnType<typeof useSignal<number>>;
  l?: ReturnType<typeof useSignal<number>>;
}) {
  // const trackColor = useComputed(() => `hsl(${199}, ${s.value}%, ${l.value}%)`);
  const edgeGradient = useComputed(() =>
    HSLGradients.hueEdge(
      s.value ?? defaultSaturation.value,
      l.value ?? defaultLightness.value,
    ),
  );

  const trackGradient = useComputed(() =>
    HSLGradients.hueTrack(
      s.value ?? defaultSaturation.value,
      l.value ?? defaultLightness.value,
    ),
  );

  return (
    <MTCSlider
      defaultValue={defaultValue}
      min={0}
      max={360}
      step={1}
      disabled={disabled}
      onChange={onChange}
      onCommit={onCommit}
      rootStyle={{ backgroundImage: edgeGradient.value }}
      trackStyle={{ backgroundImage: trackGradient.value }}
    />
  );
}
export { MTCSlider, MTCHueSlider };
