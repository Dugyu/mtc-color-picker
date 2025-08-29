'main thread';
import { signal } from '@lynx-js/react/signals';
import { MTCSlider } from './MTCSlider';

const color = signal('#A88AFF');

type Color = readonly [number, number, number];

interface MTCColorPicker {
  initialValue: Color;
  onMTCValueChange?: (next: Color) => void;
}

function MTCColorPicker({ initialValue, onMTCValueChange }: MTCColorPicker) {
  return (
    <view
      className="w-full h-full flex flex-col gap-y-4"
      bindtap={() => {
        color.value = 'red';
        onMTCValueChange?.([327, 92, 68]);
      }}
    >
      <MTCSlider />
      <text className="text-content">{`${initialValue}`}</text>
    </view>
  );
}

export { MTCColorPicker };
