'main thread';
import { useSignal } from '@lynx-js/react/signals';
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

  return (
    <view className="w-full h-full flex flex-col gap-y-4">
      <MTCHueSlider
        s={s}
        l={l}
        defaultValue={initialValue[0]}
        onChange={(hue: number) =>
          onMTCValueChange?.([hue, initialValue[1], initialValue[2]])
        }
      />
      <MTCSaturationSlider
        h={h}
        l={l}
        defaultValue={initialValue[1]}
        onChange={(sat: number) =>
          onMTCValueChange?.([initialValue[0], sat, initialValue[2]])
        }
      />
      <MTCLightnessSlider
        h={h}
        s={s}
        defaultValue={initialValue[2]}
        onChange={(light: number) =>
          onMTCValueChange?.([initialValue[0], initialValue[1], light])
        }
      />
    </view>
  );
}

export { MTCColorPicker };
