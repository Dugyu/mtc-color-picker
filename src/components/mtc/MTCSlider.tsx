'main thread';
import { useSignal } from '@lynx-js/react/signals';

function MTCSlider() {
  const ratio = useSignal(0);

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
      <view className="relative w-full h-full flex flex-row items-center">
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
