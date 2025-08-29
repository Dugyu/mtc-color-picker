'main thread';
import { useSignal } from '@lynx-js/react/signals';
import { MTCHueSlider } from './MTCSlider';

type Color = readonly [number, number, number];

interface MTCColorPicker {
  initialValue: Color;
  onMTCValueChange?: (next: Color) => void;
}

function MTCColorPicker({ initialValue, onMTCValueChange }: MTCColorPicker) {
  const s = useSignal(initialValue[1]);
  const l = useSignal(initialValue[2]);

  return (
    <view className="w-full h-full flex flex-col gap-y-4">
      <MTCHueSlider
        s={s}
        l={l}
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
