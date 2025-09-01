'main thread';

import { useComputed, signal } from '@lynx-js/react/signals';
import type { CSSProperties } from '@lynx-js/types';

import { useSlider } from './use-mtc-slider-signal';
import type { UseSliderProps } from './use-mtc-slider-signal';
import { HSLGradients } from '@/utils/hsl-gradients';
import type { Expand } from '@/types/utils';
import type { ReadonlySignal } from '@/types/signals';

import type {
  StyledSliderPropsBase,
  HSLSliderPropsBase,
} from '@/types/hsl-slider';

type SliderProps = Expand<
  UseSliderProps & {
    // Styling
    rootStyle?: CSSProperties;
    trackStyle?: CSSProperties;
  }
>;

/** ================= Base Slider ================= */

function Slider({ rootStyle, trackStyle, ...sliderProps }: SliderProps) {
  const {
    ratio, // ReadonlySignal
    handleElementLayoutChange,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  } = useSlider(sliderProps);

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

const defaultHue = signal(0);
const defaultSaturation = signal(100);
const defaultLightness = signal(50);

/** ================= Hue Slider ================= */

function HueSlider({
  s = defaultSaturation,
  l = defaultLightness,
  ...restProps
}: HueSliderProps) {
  const gradients = useComputed(() =>
    HSLGradients.hueGradientPair(
      s.value ?? defaultSaturation.value,
      l.value ?? defaultLightness.value,
    ),
  );

  return (
    <Slider
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

function SaturationSlider({
  h = defaultHue,
  l = defaultLightness,
  ...restProps
}: SaturationSliderProps) {
  const gradients = useComputed(() =>
    HSLGradients.saturationGradientPair(
      h.value ?? defaultHue.value,
      l.value ?? defaultLightness.value,
    ),
  );

  return (
    <Slider
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

function LightnessSlider({
  h = defaultHue,
  s = defaultSaturation,
  ...restProps
}: LightnessSliderProps) {
  const gradients = useComputed(() =>
    HSLGradients.lightnessGradientPair(
      h.value ?? defaultHue.value,
      s.value ?? defaultSaturation.value,
    ),
  );

  return (
    <Slider
      min={0}
      max={100}
      step={1}
      rootStyle={{ backgroundImage: gradients.value.edge }}
      trackStyle={{ backgroundImage: gradients.value.track }}
      {...restProps}
    />
  );
}

export { Slider, HueSlider, SaturationSlider, LightnessSlider };

/** ================= HSL Sliders Shared Types ================= */
type StyledSliderProps = StyledSliderPropsBase<
  SliderProps,
  'trackStyle' | 'rootStyle'
>;

type HueSliderProps = HSLSliderPropsBase<
  StyledSliderProps,
  ReadonlySignal<number>,
  's',
  'l'
>;
type SaturationSliderProps = HSLSliderPropsBase<
  StyledSliderProps,
  ReadonlySignal<number>,
  'h',
  'l'
>;

type LightnessSliderProps = HSLSliderPropsBase<
  StyledSliderProps,
  ReadonlySignal<number>,
  'h',
  's'
>;
