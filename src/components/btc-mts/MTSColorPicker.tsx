import { useCallback, useMainThreadRef } from '@lynx-js/react';
import { HueSlider, LightnessSlider, SaturationSlider } from './MTSSlider';
import type { MTSWriter } from './MTSSlider';

type Color = readonly [number, number, number];
type Vector2 = readonly [number, number];

interface ColorPickerProps {
  initialHSL?: Color;
  onMTSHSLChange?: (next: Color) => void;
}
function ColorPicker({
  initialHSL = [199, 99, 72],
  onMTSHSLChange,
}: ColorPickerProps) {
  const mtsHueRef = useMainThreadRef<number>(initialHSL[0]);
  const mtsWriteSL = useMainThreadRef<MTSWriter<Vector2>>();

  const mtsSaturationRef = useMainThreadRef<number>(initialHSL[1]);
  const mtsWriteHL = useMainThreadRef<MTSWriter<Vector2>>();

  const mtsLightnessRef = useMainThreadRef<number>(initialHSL[2]);
  const mtsWriteHS = useMainThreadRef<MTSWriter<Vector2>>();

  const writeSliderGradients = useCallback(() => {
    'main thread';
    mtsWriteSL?.current?.([mtsSaturationRef.current, mtsLightnessRef.current]);
    mtsWriteHL?.current?.([mtsHueRef.current, mtsLightnessRef.current]);
    mtsWriteHS?.current?.([mtsHueRef.current, mtsSaturationRef.current]);
  }, []);

  const forwardOnHSLChange = useCallback(() => {
    'main thread';
    writeSliderGradients();
    onMTSHSLChange?.([
      mtsHueRef.current,
      mtsSaturationRef.current,
      mtsLightnessRef.current,
    ]);
  }, [onMTSHSLChange]);

  const onMTSHueChange = useCallback(
    (h: number) => {
      'main thread';
      mtsHueRef.current = h;
      forwardOnHSLChange();
    },
    [forwardOnHSLChange],
  );

  const onMTSSaturationChange = useCallback(
    (s: number) => {
      'main thread';
      mtsSaturationRef.current = s;
      forwardOnHSLChange();
    },
    [forwardOnHSLChange],
  );

  const onMTSLightnessChange = useCallback(
    (l: number) => {
      ('main thread');
      mtsLightnessRef.current = l;
      forwardOnHSLChange();
    },
    [forwardOnHSLChange],
  );

  return (
    <view className="w-full h-full flex flex-col gap-y-4">
      <HueSlider
        onMTSChange={onMTSHueChange}
        initialValue={initialHSL[0]}
        initialSL={[initialHSL[1], initialHSL[2]]}
        mtsWriteSL={mtsWriteSL}
      />
      <SaturationSlider
        initialValue={initialHSL[1]}
        onMTSChange={onMTSSaturationChange}
        initialHL={[initialHSL[0], initialHSL[2]]}
        mtsWriteHL={mtsWriteHL}
      />
      <LightnessSlider
        initialValue={initialHSL[2]}
        onMTSChange={onMTSLightnessChange}
        initialHS={[initialHSL[0], initialHSL[1]]}
        mtsWriteHS={mtsWriteHS}
      />
    </view>
  );
}

export { ColorPicker };
