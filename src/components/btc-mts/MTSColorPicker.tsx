import { useCallback, useMainThreadRef } from '@lynx-js/react';
import { HueSlider, LightnessSlider, SaturationSlider } from './MTSSlider';
import type { Writer } from './MTSSlider';

type Color = readonly [number, number, number];
type Vector2 = readonly [number, number];

interface ColorPickerProps {
  initialValue?: Color;
  'main-thread:onChange'?: (next: Color) => void;
}
function ColorPicker({
  initialValue: hsl = [199, 99, 72],
  ['main-thread:onChange']: onChange,
}: ColorPickerProps) {
  const hueRef = useMainThreadRef(hsl[0]);
  const writeSL = useMainThreadRef<Writer<Vector2>>();

  const satRef = useMainThreadRef(hsl[1]);
  const writeHL = useMainThreadRef<Writer<Vector2>>();

  const lightRef = useMainThreadRef(hsl[2]);
  const writeHS = useMainThreadRef<Writer<Vector2>>();

  const writeSliderGradients = useCallback(() => {
    'main thread';
    writeSL?.current?.([satRef.current, lightRef.current]);
    writeHL?.current?.([hueRef.current, lightRef.current]);
    writeHS?.current?.([hueRef.current, satRef.current]);
  }, []);

  const forwardOnHSLChange = useCallback(() => {
    'main thread';
    writeSliderGradients();
    onChange?.([hueRef.current, satRef.current, lightRef.current]);
  }, [onChange]);

  const handleHueChange = useCallback(
    (h: number) => {
      'main thread';
      hueRef.current = h;
      forwardOnHSLChange();
    },
    [forwardOnHSLChange],
  );

  const handleSaturationChange = useCallback(
    (s: number) => {
      'main thread';
      satRef.current = s;
      forwardOnHSLChange();
    },
    [forwardOnHSLChange],
  );

  const handleLightnessChange = useCallback(
    (l: number) => {
      ('main thread');
      lightRef.current = l;
      forwardOnHSLChange();
    },
    [forwardOnHSLChange],
  );

  return (
    <view className="w-full h-full flex flex-col gap-y-4">
      <HueSlider
        initialValue={hsl[0]}
        main-thread:onChange={handleHueChange}
        initialSL={[hsl[1], hsl[2]]}
        main-thread:writeSL={writeSL}
      />
      <SaturationSlider
        initialValue={hsl[1]}
        main-thread:onChange={handleSaturationChange}
        initialHL={[hsl[0], hsl[2]]}
        main-thread:writeHL={writeHL}
      />
      <LightnessSlider
        initialValue={hsl[2]}
        main-thread:onChange={handleLightnessChange}
        initialHS={[hsl[0], hsl[1]]}
        main-thread:writeHS={writeHS}
      />
    </view>
  );
}

export { ColorPicker };
