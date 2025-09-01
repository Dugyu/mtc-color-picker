import { useCallback, useMainThreadRef } from '@lynx-js/react';
import type { MainThread, CSSProperties } from '@lynx-js/types';
import { useSlider } from './use-mts-slider';
import type { UseSliderProps } from './use-mts-slider';
import type { Expand, RenameKeys } from '@/types/utils';

type SliderProps = Expand<
  RenameKeys<
    Omit<UseSliderProps, 'onDerivedChange'>,
    {
      onChange?: 'main-thread:onChange';
      writeValue?: 'main-thread:writeValue';
    }
  > & {
    // Init callback: for attaching additional writers
    'main-thread:onInit'?: (ref: MainThread.Element) => void;
    // Styling
    rootStyle?: CSSProperties;
    trackStyle?: CSSProperties;
  }
>;

/** ================= Base Slider ================= */

function Slider(props: SliderProps) {
  const {
    ['main-thread:writeValue']: externalWriterRef,
    ['main-thread:onInit']: onInit,
    ['main-thread:onChange']: onChange,
    min,
    rootStyle,
    trackStyle,
    ...restProps
  } = props;

  const thumbRef = useMainThreadRef<MainThread.Element | null>(null);

  const updateListenerRef = useMainThreadRef<(value: number) => void>();

  const handleDerivedChange = useCallback((value: number) => {
    'main thread';
    if (updateListenerRef.current) {
      updateListenerRef.current(value);
    }
  }, []);

  const {
    ratioRef,
    writeValue,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleElementLayoutChange,
  } = useSlider({
    writeValue: externalWriterRef,
    onDerivedChange: handleDerivedChange,
    onChange: onChange,
    ...restProps,
  });

  const updateThumbStyle = () => {
    'main thread';
    if (thumbRef.current) {
      thumbRef.current.setStyleProperties({
        left: `${ratioRef.current * 100}%`,
      });
    }
  };

  const initRoot = useCallback((ref: MainThread.Element) => {
    'main thread';
    // Bind writeValue to prop
    if (ref) {
      writeValue.init();
    } else {
      writeValue.dispose();
    }
    // Initialization callback
    onInit?.(ref);
  }, []);

  const initThumb = useCallback((ref: MainThread.Element) => {
    'main thread';
    thumbRef.current = ref;
    if (ref) {
      updateListenerRef.current = updateThumbStyle;
    } else {
      updateListenerRef.current = undefined;
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

/** ================= HSL Sliders Shared ================= */

type HSLSliderProps = Expand<
  Omit<SliderProps, 'min' | 'max' | 'step' | 'main-thread:onInit'>
>;

/** ================= Hue Slider ================= */

function HueSlider(props: HSLSliderProps) {
  return <Slider min={0} max={360} step={1} {...props} />;
}

/** ================= Saturation Slider ================= */

function SaturationSlider(props: HSLSliderProps) {
  return <Slider min={0} max={100} step={1} {...props} />;
}

/** ================= Lightness Slider ================= */

function LightnessSlider(props: HSLSliderProps) {
  return <Slider min={0} max={100} step={1} {...props} />;
}

export { HueSlider, SaturationSlider, LightnessSlider };
