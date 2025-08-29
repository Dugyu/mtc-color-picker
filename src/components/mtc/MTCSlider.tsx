'main thread';
import { useSignal } from '@lynx-js/react/signals';
import { useMTCPointerInteraction } from './use-mtc-pointer-interaction';
import type { PointerPosition } from './use-mtc-pointer-interaction';

function MTCSlider() {
  const ratio = useSignal(0);
  const {
    onMTCElementLayoutChange,
    onMTCPointerDown,
    onMTCPointerMove,
    onMTCPointerUp,
  } = useMTCPointerInteraction({
    onMTCUpdate: (pos: PointerPosition) => {
      console.log(pos.offsetRatio);
    },
  });

  return (
    // Root
    <view
      className="relative px-5 bg-primary w-full h-10 flex flex-row items-center rounded-full"
      bindtap={() => {
        const result = Math.min(ratio.value + 10, 100);
        ratio.value = result;
      }}
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
        <view className="w-full h-full bg-secondary"></view>
        {/* Thumb */}
        <view
          className="absolute bg-white size-8 rounded-full -translate-x-1/2 shadow-md"
          style={{ left: `${ratio.value}%` }}
        ></view>
      </view>
    </view>
  );
}

export { MTCSlider };
