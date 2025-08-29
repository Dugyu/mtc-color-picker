'main thread';
import { MTCSlider } from './MTCSlider';

type Color = readonly [number, number, number];

interface MTCColorPicker {
  initialValue: Color;
  onMTCValueChange?: (next: Color) => void;
}

function MTCColorPicker({ initialValue, onMTCValueChange }: MTCColorPicker) {
  return (
    <view className="w-full h-full flex flex-col gap-y-4">
      <MTCSlider
        min={0}
        max={360}
        defaultValue={initialValue[0]}
        onChange={(hue: number) => {
          onMTCValueChange?.([hue, initialValue[1], initialValue[2]]);
        }}
      />
      <text className="text-content">{`${initialValue}`}</text>
    </view>
  );
}

export { MTCColorPicker };
