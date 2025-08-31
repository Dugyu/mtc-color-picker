import { useCallback, useMainThreadRef } from '@lynx-js/react';
import type { MainThread, CSSProperties } from '@lynx-js/types';
import { useMTSSlider } from './use-mts-slider';
import type { MTSWriterWithControlsRef } from './use-mts-slider';
import type { Expand } from '@/types/utils';

interface BTCMTSSliderProps {
  mtsWriteValue?: MTSWriterWithControlsRef<number>;
  initialValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onMTSChange?: (value: number) => void;
  onMTSCommit?: (value: number) => void;
  onMTSInit?: (ref: MainThread.Element) => void;

  // Styling
  rootStyle?: CSSProperties;
  trackStyle?: CSSProperties;
}

/** ================= Base Slider ================= */

function BTCMTSSlider(props: BTCMTSSliderProps) {
  const {
    mtsWriteValue,
    initialValue,
    onMTSInit,
    onMTSChange,
    onMTSCommit,
    min,
    rootStyle,
    trackStyle,
    ...restProps
  } = props;

  const mtsThumbRef = useMainThreadRef<MainThread.Element | null>(null);

  const mtsUpdateListenerRef = useMainThreadRef<(value: number) => void>();

  const onMTSDerivedChange = useCallback((value: number) => {
    'main thread';
    if (mtsUpdateListenerRef.current) {
      mtsUpdateListenerRef.current(value);
    }
  }, []);

  const {
    ratioRef,
    writeValue,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleElementLayoutChange,
  } = useMTSSlider({
    initialValue,
    mtsWriteValue,
    onMTSDerivedChange,
    onMTSChange,
    onMTSCommit,
    ...restProps,
  });

  const updateThumbStyle = () => {
    'main thread';
    if (mtsThumbRef.current) {
      mtsThumbRef.current.setStyleProperties({
        left: `${ratioRef.current * 100}%`,
      });
    }
  };

  const initRoot = useCallback((ref: MainThread.Element) => {
    'main thread';
    // Bind writeValue to mtsWriteValue
    if (ref) {
      writeValue.init();
    } else {
      writeValue.dispose();
    }
    // Initialization callback
    onMTSInit?.(ref);
  }, []);

  const initThumb = useCallback((ref: MainThread.Element) => {
    'main thread';
    mtsThumbRef.current = ref;
    if (ref) {
      mtsUpdateListenerRef.current = updateThumbStyle;
    } else {
      mtsUpdateListenerRef.current = undefined;
    }
    updateThumbStyle();
  }, []);

  return (
    // Root
    <view
      main-thread:ref={initRoot}
      main-thread:bindtouchstart={handlePointerDown}
      main-thread:bindtouchmove={handlePointerMove}
      main-thread:bindtouchend={handlePointerUp}
      main-thread:bindtouchcancel={handlePointerUp}
      className="relative px-5 bg-primary w-full h-10 flex flex-row items-center rounded-full"
      style={rootStyle}
    >
      {/* Track Positioner */}
      <view
        main-thread:bindlayoutchange={handleElementLayoutChange}
        className="relative w-full h-full flex flex-row items-center"
      >
        {/* Track Visualizer */}
        <view className="w-full h-full bg-secondary" style={trackStyle}></view>
        <view
          main-thread:ref={initThumb}
          className="absolute bg-white size-8 rounded-full -translate-x-1/2 shadow-md"
        ></view>
      </view>
    </view>
  );
}

type HSLSliderProps = Expand<Omit<BTCMTSSliderProps, 'min' | 'max' | 'step'>>;

/** ================= Hue Slider ================= */

function HueSlider(props: HSLSliderProps) {
  return <BTCMTSSlider min={0} max={360} step={1} {...props} />;
}

/** ================= Saturation Slider ================= */

function SaturationSlider(props: HSLSliderProps) {
  return <BTCMTSSlider min={0} max={100} step={1} {...props} />;
}

/** ================= Lightness Slider ================= */

function LightnessSlider(props: HSLSliderProps) {
  return <BTCMTSSlider min={0} max={100} step={1} {...props} />;
}

export { HueSlider, SaturationSlider, LightnessSlider };
