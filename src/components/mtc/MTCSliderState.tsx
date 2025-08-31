'main thread';

import type { CSSProperties } from '@lynx-js/types';
import { useMTCSlider } from './use-mtc-slider-state';
import type { UseMTCSliderProps } from './use-mtc-slider-state';
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
    ratio, // Render-time Value
    handleElementLayoutChange,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  } = useMTCSlider(sliderProps);

  return (
    // Root
    <view
      // @ts-expect-error
      bindlayoutchange={handleElementLayoutChange}
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
          style={{ left: `${ratio * 100}%` }}
        ></view>
      </view>
    </view>
  );
}

/** ================= HSL Sliders Shared ================= */

type HSLBaseSliderProps = Omit<
  MTCSliderProps,
  'min' | 'max' | 'step' | 'trackStyle' | 'rootStyle'
>;

const defaultHue = 0;
const defaultSaturation = 100;
const defaultLightness = 50;

/** ================= Hue Slider ================= */

function MTCHueSlider({
  s = defaultSaturation,
  l = defaultLightness,
  ...restProps
}: Expand<
  HSLBaseSliderProps & {
    s?: number;
    l?: number;
  }
>) {
  const gradients = HSLGradients.hueGradientPair(s, l);

  return (
    <MTCSlider
      min={0}
      max={360}
      step={1}
      rootStyle={{ backgroundImage: gradients.edge }}
      trackStyle={{ backgroundImage: gradients.track }}
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
    h?: number;
    l?: number;
  }
>) {
  const gradients = HSLGradients.saturationGradientPair(h, l);

  return (
    <MTCSlider
      min={0}
      max={100}
      step={1}
      rootStyle={{ backgroundImage: gradients.edge }}
      trackStyle={{ backgroundImage: gradients.track }}
      {...restProps}
    />
  );
}

/** ================= Lightness Slider ================= */

function MTCLightnessSlider({
  h = defaultHue,
  s = defaultSaturation,
  ...restProps
}: Expand<
  HSLBaseSliderProps & {
    h?: number;
    s?: number;
  }
>) {
  const gradients = HSLGradients.lightnessGradientPair(h, s);

  return (
    <MTCSlider
      min={0}
      max={100}
      step={1}
      rootStyle={{ backgroundImage: gradients.edge }}
      trackStyle={{ backgroundImage: gradients.track }}
      {...restProps}
    />
  );
}

export { MTCSlider, MTCHueSlider, MTCSaturationSlider, MTCLightnessSlider };
