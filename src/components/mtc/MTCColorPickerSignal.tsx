'main thread';
import { useSignal, useSignalEffect } from '@lynx-js/react/signals';
import {
  HueSlider,
  SaturationSlider,
  LightnessSlider,
} from './MTCSliderSignal';

import type { HSL } from '@/types/color';

interface ColorPickerProps {
  initialValue: HSL;
  onChange?: (next: HSL) => void;
}

function ColorPicker({ initialValue, onChange }: ColorPickerProps) {
  const h = useSignal(initialValue[0]);
  const s = useSignal(initialValue[1]);
  const l = useSignal(initialValue[2]);

  useSignalEffect(() => {
    onChange?.([h.value, s.value, l.value]);
  });

  return (
    <view className="w-full h-full flex flex-col gap-y-4">
      <HueSlider
        s={s}
        l={l}
        initialValue={initialValue[0]}
        onChange={(hue: number) => {
          h.value = hue;
        }}
      />
      <SaturationSlider
        h={h}
        l={l}
        initialValue={initialValue[1]}
        onChange={(sat: number) => {
          s.value = sat;
        }}
      />
      <LightnessSlider
        h={h}
        s={s}
        initialValue={initialValue[2]}
        onChange={(light: number) => {
          l.value = light;
        }}
      />
    </view>
  );
}

export { ColorPicker };
