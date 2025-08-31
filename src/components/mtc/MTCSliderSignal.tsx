'main thread';

import { useComputed, useSignal, signal } from '@lynx-js/react/signals';
import type { CSSProperties } from '@lynx-js/types';

import { useMTCSlider } from './use-mtc-slider-signal';
import type { UseMTCSliderProps } from './use-mtc-slider-signal';
import { HSLGradients } from '@/utils/hsl-gradients';
import type { Expand } from '@/types/utils';

type MTCSliderProps = Expand<
  UseMTCSliderProps & {
    // Styling
    rootStyle?: CSSProperties;
    trackStyle?: CSSProperties;
  }
>;

/** ================= Base Slider ================= */

function MTCSlider({ rootStyle, trackStyle, ...sliderProps }: MTCSliderProps) {
  const {
    ratio, // ReadonlySignal
    handleElementLayoutChange,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  } = useMTCSlider(sliderProps);

  return (
    // Root
    <view
      // @ts-expect-error
      bindtouchstart={handlePointerDown}
      // @ts-expect-error
      bindtouchmove={handlePointerMove}
      // @ts-expect-error
      bindtouchend={handlePointerUp}
      // @ts-expect-error
      bindtouchcancel={handlePointerUp}
      className="relative px-5 bg-primary w-full h-10 flex flex-row items-center rounded-full"
      style={rootStyle}
    >
      {/* Track Positioner */}
      <view
        // @ts-expect-error
        bindlayoutchange={handleElementLayoutChange}
        className="relative w-full h-full flex flex-row items-center"
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

/** ================== HSL Sliders Shared ================= */

type HSLBaseSliderProps = Omit<
  MTCSliderProps,
  'min' | 'max' | 'step' | 'trackStyle' | 'rootStyle'
>;

const defaultHue = signal(0);
const defaultSaturation = signal(100);
const defaultLightness = signal(50);

/** ================= Hue Slider ================= */

function MTCHueSlider({
  s = defaultSaturation,
  l = defaultLightness,
  ...restProps
}: Expand<
  HSLBaseSliderProps & {
    s?: ReturnType<typeof useSignal<number>>;
    l?: ReturnType<typeof useSignal<number>>;
  }
>) {
  const gradients = useComputed(() =>
    HSLGradients.hueGradientPair(
      s.value ?? defaultSaturation.value,
      l.value ?? defaultLightness.value,
    ),
  );

  return (
    <MTCSlider
      min={0}
      max={360}
      step={1}
      rootStyle={{ backgroundImage: gradients.value.edge }}
      trackStyle={{ backgroundImage: gradients.value.track }}
      {...restProps}
    />
  );
}

/** ================= Saturation Slider ================= */

function MTCSaturationSlider({
  h = defaultHue,
  l = defaultLightness,
  ...restProps
}: Expand<
  HSLBaseSliderProps & {
    h?: ReturnType<typeof useSignal<number>>;
    l?: ReturnType<typeof useSignal<number>>;
  }
>) {
  const gradients = useComputed(() =>
    HSLGradients.saturationGradientPair(
      h.value ?? defaultHue.value,
      l.value ?? defaultLightness.value,
    ),
  );

  return (
    <MTCSlider
      min={0}
      max={100}
      step={1}
      rootStyle={{ backgroundImage: gradients.value.edge }}
      trackStyle={{ backgroundImage: gradients.value.track }}
      {...restProps}
    />
  );
}

/** ================= Lightness Slider ================= */

function MTCLightnessSlider({
  h = defaultHue,
  s = defaultSaturation,
  ...restProps
}: Expand<Omit<MTCSliderProps, 'min' | 'max' | 'step'>> & {
  h?: ReturnType<typeof useSignal<number>>;
  s?: ReturnType<typeof useSignal<number>>;
}) {
  const gradients = useComputed(() =>
    HSLGradients.lightnessGradientPair(
      h.value ?? defaultHue.value,
      s.value ?? defaultSaturation.value,
    ),
  );

  return (
    <MTCSlider
      min={0}
      max={100}
      step={1}
      rootStyle={{ backgroundImage: gradients.value.edge }}
      trackStyle={{ backgroundImage: gradients.value.track }}
      {...restProps}
    />
  );
}

export { MTCSlider, MTCHueSlider, MTCSaturationSlider, MTCLightnessSlider };
