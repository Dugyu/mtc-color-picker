import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  runOnBackground,
} from '@lynx-js/react';
import { HueSlider, LightnessSlider, SaturationSlider } from './BTCMTSSlider';
import { HSLGradients } from '@/utils/hsl-gradients';

type Color = readonly [number, number, number];

interface ColorPickerProps {
  initialHSL?: Color;
  onHSLChange?: (next: Color) => void;
}

function ColorPicker({
  initialHSL = [199, 99, 72],
  onHSLChange,
}: ColorPickerProps) {
  const [hue, setHue] = useState(initialHSL[0]);
  const [saturation, setSaturation] = useState(initialHSL[1]);
  const [lightness, setLightness] = useState(initialHSL[2]);

  const { edge: hueEdge, track: hueTrack } = useMemo(
    () => HSLGradients.hueGradientPair(saturation, lightness),
    [saturation, lightness],
  );

  const { edge: satEdge, track: satTrack } = useMemo(
    () => HSLGradients.saturationGradientPair(hue, lightness),
    [hue, lightness],
  );

  const { edge: lightEdge, track: lightTrack } = useMemo(
    () => HSLGradients.lightnessGradientPair(hue, saturation),
    [hue, saturation],
  );

  const handleHueChange = useCallback((v: number) => {
    'main thread';
    runOnBackground(setHue)(v);
  }, []);

  const handleSaturtaionChange = useCallback((v: number) => {
    'main thread';
    runOnBackground(setSaturation)(v);
  }, []);

  const handleLightnessChange = useCallback((v: number) => {
    'main thread';
    runOnBackground(setLightness)(v);
  }, []);

  useEffect(() => {
    onHSLChange?.([hue, saturation, lightness]);
  }, [hue, saturation, lightness]);

  return (
    <view className="w-full h-full flex flex-col gap-y-4">
      <HueSlider
        initialValue={hue}
        onMTSChange={handleHueChange}
        rootStyle={{ backgroundImage: hueEdge }}
        trackStyle={{ backgroundImage: hueTrack }}
      />
      <SaturationSlider
        initialValue={saturation}
        onMTSChange={handleSaturtaionChange}
        rootStyle={{ backgroundImage: satEdge }}
        trackStyle={{ backgroundImage: satTrack }}
      />
      <LightnessSlider
        initialValue={lightness}
        onMTSChange={handleLightnessChange}
        rootStyle={{ backgroundImage: lightEdge }}
        trackStyle={{ backgroundImage: lightTrack }}
      />
    </view>
  );
}

export { ColorPicker };
