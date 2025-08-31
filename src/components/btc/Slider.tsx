import { useMemo } from '@lynx-js/react';
import type { CSSProperties } from '@lynx-js/types';
import { useSlider } from './use-slider';
import type { UseSliderProps } from './use-slider';
import { HSLGradients } from '@/utils/hsl-gradients';
import type { Expand } from '@/types/utils';

type SliderProps = Expand<
  UseSliderProps & {
    rootStyle?: CSSProperties;
    trackStyle?: CSSProperties;
  }
>;

/** ================= Base Slider ================= */
function Slider(props: SliderProps) {
  const { rootStyle, trackStyle, ...sliderProps } = props;

  const {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleElementLayoutChange,
    ratio,
  } = useSlider(sliderProps);

  return (
    // Root
    <view
      bindtouchstart={handlePointerDown}
      bindtouchmove={handlePointerMove}
      bindtouchend={handlePointerUp}
      bindtouchcancel={handlePointerUp}
      className="relative px-5 bg-primary w-full h-10 flex flex-row items-center rounded-full"
      style={rootStyle}
    >
      {/* Track Positioner */}
      <view
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

/** ================= Hue Slider ================= */

function HueSlider({
  value,
  defaultValue,
  s = 100,
  l = 50,
  onChange,
  onCommit,
  disabled,
}: {
  value?: number;
  defaultValue?: number;
  s?: number;
  l?: number;
  onChange?: (h: number) => void;
  onCommit?: (h: number) => void;
  disabled?: boolean;
}) {
  const { track: trackBg, edge: edgeBg } = useMemo(
    () => HSLGradients.hueGradientPair(s, l),
    [s, l],
  );

  return (
    <Slider
      value={value}
      defaultValue={defaultValue}
      min={0}
      max={360}
      step={1}
      disabled={disabled}
      onChange={onChange}
      onCommit={onCommit}
      rootStyle={{ backgroundImage: edgeBg }}
      trackStyle={{ backgroundImage: trackBg }}
    />
  );
}

export { Slider, HueSlider };
