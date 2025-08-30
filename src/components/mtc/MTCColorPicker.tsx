'main thread';
import { useSignal, useSignalEffect } from '@lynx-js/react/signals';
import {
  MTCHueSlider,
  MTCSaturationSlider,
  MTCLightnessSlider,
} from './MTCSlider';

type Color = readonly [number, number, number];

interface MTCColorPicker {
  initialValue: Color;
  onMTCValueChange?: (next: Color) => void;
}

function MTCColorPicker({ initialValue, onMTCValueChange }: MTCColorPicker) {
  const h = useSignal(initialValue[0]);
  const s = useSignal(initialValue[1]);
  const l = useSignal(initialValue[2]);

  useSignalEffect(() => {
    onMTCValueChange?.([h.value, s.value, l.value]);
  });

  return (
    <view className="w-full h-full flex flex-col gap-y-4">
      <MTCHueSlider
        s={s}
        l={l}
        defaultValue={initialValue[0]}
        onChange={(hue: number) => {
          h.value = hue;
        }}
      />
      <MTCSaturationSlider
        h={h}
        l={l}
        defaultValue={initialValue[1]}
        onChange={(sat: number) => {
          s.value = sat;
        }}
      />
      <MTCLightnessSlider
        h={h}
        s={s}
        defaultValue={initialValue[2]}
        onChange={(light: number) => {
          l.value = light;
        }}
      />
    </view>
  );
}

export { MTCColorPicker };
