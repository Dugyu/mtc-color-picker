'main thread';
import { useState } from '@lynx-js/react';
import { HueSlider, SaturationSlider, LightnessSlider } from './MTCSliderState';

import type { HSL } from '@/types/color';

interface ColorPickerProps {
  initialValue: HSL;
  onChange?: (next: HSL) => void;
}

function ColorPicker({ initialValue, onChange }: ColorPickerProps) {
  const [h, setH] = useState(initialValue[0]);
  const [s, setS] = useState(initialValue[1]);
  const [l, setL] = useState(initialValue[2]);

  const forwardOnValueChange = () => {
    onChange?.([h, s, l]);
  };

  return (
    <view className="w-full h-full flex flex-col gap-y-4">
      <HueSlider
        s={s}
        l={l}
        initialValue={initialValue[0]}
        onChange={(hue: number) => {
          setH(hue);
          forwardOnValueChange();
        }}
      />
      <SaturationSlider
        h={h}
        l={l}
        initialValue={initialValue[1]}
        onChange={(sat: number) => {
          setS(sat);
          forwardOnValueChange();
        }}
      />
      <LightnessSlider
        h={h}
        s={s}
        initialValue={initialValue[2]}
        onChange={(light: number) => {
          setL(light);
          forwardOnValueChange();
        }}
      />
    </view>
  );
}

export { ColorPicker };
