'main thread';
import { useMTCSlider } from './use-mtc-slider';
import type { UseMTCSliderProps } from './use-mtc-slider';

function MTCSlider(props: UseMTCSliderProps) {
  const {
    ratio, // ReadonlySignal
    onMTCElementLayoutChange,
    onMTCPointerDown,
    onMTCPointerMove,
    onMTCPointerUp,
  } = useMTCSlider(props);

  return (
    // Root
    <view className="relative px-5 bg-primary w-full h-10 flex flex-row items-center rounded-full">
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
        <view className="w-full h-full bg-secondary"></view>
        {/* Thumb */}
        <view
          className="absolute bg-white size-8 rounded-full -translate-x-1/2 shadow-md"
          style={{ left: `${ratio.value * 100}%` }}
        ></view>
      </view>
    </view>
  );
}

export { MTCSlider };
