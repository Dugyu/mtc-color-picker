'main thread';
import { useState } from '@lynx-js/react';
import {
  MTCHueSlider,
  MTCSaturationSlider,
  MTCLightnessSlider,
} from './MTCSliderState';

type Color = readonly [number, number, number];

interface MTCColorPickerProps {
  initialValue: Color;
  onMTCValueChange?: (next: Color) => void;
}

function MTCColorPicker({
  initialValue,
  onMTCValueChange,
}: MTCColorPickerProps) {
  const [h, setH] = useState(initialValue[0]);
  const [s, setS] = useState(initialValue[1]);
  const [l, setL] = useState(initialValue[2]);

  // useEffect not working

  /* useEffect(() => {
    onMTCValueChange?.([h, s, l]);
  }, [h, s, l]); */

  const forwardOnMTCValueChange = () => {
    onMTCValueChange?.([h, s, l]);
  };

  return (
    <view className="w-full h-full flex flex-col gap-y-4">
      <MTCHueSlider
        s={s}
        l={l}
        defaultValue={initialValue[0]}
        onChange={(hue: number) => {
          setH(hue);
          forwardOnMTCValueChange();
        }}
      />
      <MTCSaturationSlider
        h={h}
        l={l}
        defaultValue={initialValue[1]}
        onChange={(sat: number) => {
          setS(sat);
          forwardOnMTCValueChange();
        }}
      />
      <MTCLightnessSlider
        h={h}
        s={s}
        defaultValue={initialValue[2]}
        onChange={(light: number) => {
          setL(light);
          forwardOnMTCValueChange();
        }}
      />
    </view>
  );
}

export { MTCColorPicker };
