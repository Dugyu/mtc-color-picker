import { useSlider } from './use-slider';

interface SliderProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onChange?: (value: number) => void;
  onCommit?: (value: number) => void;
}

function Slider(props: SliderProps) {
  const {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onTrackLayoutChange,
    trackRef,
    ratio,
  } = useSlider(props);

  return (
    // Root
    <view
      bindtouchstart={onPointerDown}
      bindtouchmove={onPointerMove}
      bindtouchend={onPointerUp}
      bindtouchcancel={onPointerUp}
      className="relative px-5 bg-primary w-full h-10 flex flex-row items-center rounded-full"
    >
      {/* Positioning */}
      <view
        ref={trackRef}
        bindlayoutchange={onTrackLayoutChange}
        className="relative w-full h-full flex flex-row items-center"
      >
        {/* Track */}
        <view className="w-full h-full bg-secondary opacity-25"></view>
        {/* Thumb */}
        <view
          className="absolute bg-white size-8 rounded-full -translate-x-1/2 shadow-md"
          style={{ left: `${ratio * 100}%` }}
        ></view>
      </view>
    </view>
  );
}

export { Slider };
