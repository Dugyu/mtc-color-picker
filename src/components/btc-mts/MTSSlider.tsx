import { useCallback, useMainThreadRef, useState } from '@lynx-js/react';
import type { MainThread } from '@lynx-js/types';
import { useSlider } from './use-mts-slider';
import type { UseSliderProps } from './use-mts-slider';

import type {
  WriterRef,
  Writer,
  WriterWithControlsRef,
  WriterWithControls,
} from './use-mts-slider';
import type { RefWriteAction } from './use-mts-ownable';
import { resolveNextValue } from './use-mts-ownable';
import { HSLGradients } from '@/utils/hsl-gradients';
import { MTSHSLGradients } from '@/utils/mts-hsl-gradients';
import type { Expand, RenameKeys } from '@/types/utils';
import type { Vec2 } from '@/types/color';

type SliderProps = Expand<
  RenameKeys<
    Omit<UseSliderProps, 'onDerivedChange'>,
    {
      onChange?: 'main-thread:onChange';
    }
  > & {
    // Init callback: for attaching additional writers
    'main-thread:onInit'?: (ref: MainThread.Element) => void;
    // Styling
    'main-thread:writeRootStyle'?: WriterRef<Record<string, string>>;
    'main-thread:writeTrackStyle'?: WriterRef<Record<string, string>>;
    initialRootStyle?: Record<string, string>;
    initialTrackStyle?: Record<string, string>;
  }
>;

/** ================= Base Slider ================= */

function Slider({
  writeValue: externalWriterRef,
  ['main-thread:onInit']: onInit,
  ['main-thread:onChange']: onChange,
  ['main-thread:writeRootStyle']: writeRootStyle,
  ['main-thread:writeTrackStyle']: writeTrackStyle,
  initialRootStyle = {},
  initialTrackStyle = {},
  ...restProps
}: SliderProps) {
  const rootRef = useMainThreadRef<MainThread.Element | null>(null);
  const trackRef = useMainThreadRef<MainThread.Element | null>(null);
  const thumbRef = useMainThreadRef<MainThread.Element | null>(null);

  const rootStyleRef =
    useMainThreadRef<Record<string, string>>(initialRootStyle);
  const trackStyleRef =
    useMainThreadRef<Record<string, string>>(initialTrackStyle);

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

  function updateRootStyle(next: RefWriteAction<Record<string, string>>) {
    'main thread';
    if (rootRef.current) {
      const resolved = resolveNextValue(rootStyleRef.current, next);
      if (resolved !== undefined) {
        rootRef.current.setStyleProperties(resolved);
        rootStyleRef.current = resolved;
      }
    }
  }

  function updateTrackStyle(next: RefWriteAction<Record<string, string>>) {
    'main thread';
    if (trackRef.current) {
      const resolved = resolveNextValue(trackStyleRef.current, next);
      if (resolved !== undefined) {
        trackRef.current.setStyleProperties(resolved);
        trackStyleRef.current = resolved;
      }
    }
  }

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
    rootRef.current = ref;
    // Bind writeValue to prop
    if (ref) {
      writeValue.init();
    } else {
      writeValue.dispose();
    }
    // Initialization callback
    onInit?.(ref);
    if (writeRootStyle) {
      writeRootStyle.current = updateRootStyle;
    }
    // init root style
    updateRootStyle(rootStyleRef.current);
  }, []);

  const initTrack = useCallback((ref: MainThread.Element) => {
    'main thread';
    trackRef.current = ref;

    if (writeTrackStyle) {
      writeTrackStyle.current = updateTrackStyle;
    }
    // init track style
    updateTrackStyle(trackStyleRef.current);
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
    >
      {/* Track Positioner */}
      <view
        main-thread:bindlayoutchange={handleElementLayoutChange}
        className="relative w-full h-full flex flex-row items-center"
      >
        {/* Track Visualizer */}
        <view
          main-thread:ref={initTrack}
          className="w-full h-full bg-secondary"
        ></view>
        <view
          main-thread:ref={initThumb}
          className="absolute bg-white size-8 rounded-full -translate-x-1/2 shadow-md"
        ></view>
      </view>
    </view>
  );
}

/** ================= Hue Slider ================= */

function HueSlider({
  initialSL = [100, 50],
  ['main-thread:writeSL']: writeSL,
  ...restProps
}: HueSliderProps) {
  const [gradients] = useState(() => {
    return HSLGradients.hueGradientPair(initialSL[0], initialSL[1]);
  });
  const currentSLRef = useMainThreadRef<Vec2>(initialSL);
  const writeRootStyle = useMainThreadRef<Writer<Record<string, string>>>();
  const writeTrackStyle = useMainThreadRef<Writer<Record<string, string>>>();

  const updateStyle = (next: RefWriteAction<Vec2>) => {
    'main thread';
    const resolved = resolveNextValue(currentSLRef.current, next);
    if (resolved !== undefined) {
      const { edge: edgeBg, track: trackBg } = MTSHSLGradients.hueGradientPair(
        resolved[0],
        resolved[1],
      );
      writeRootStyle.current?.({ 'background-image': edgeBg });
      writeTrackStyle.current?.({ 'background-image': trackBg });
    }
  };
  const init = useCallback(() => {
    'main thread';
    if (writeSL) {
      writeSL.current = updateStyle;
    }
  }, []);

  return (
    <Slider
      min={0}
      max={360}
      step={1}
      main-thread:onInit={init}
      main-thread:writeRootStyle={writeRootStyle}
      main-thread:writeTrackStyle={writeTrackStyle}
      initialRootStyle={{ 'background-image': gradients.edge }}
      initialTrackStyle={{ 'background-image': gradients.track }}
      {...restProps}
    />
  );
}

/** ================= Saturation Slider ================= */

function SaturationSlider({
  initialHL = [0, 50],
  ['main-thread:writeHL']: writeHL,
  ...restProps
}: SaturationSliderProps) {
  const [gradients] = useState(() => {
    return HSLGradients.saturationGradientPair(initialHL[0], initialHL[1]);
  });

  const currentHLRef = useMainThreadRef<Vec2>(initialHL);

  const writeRootStyle = useMainThreadRef<Writer<Record<string, string>>>();
  const writeTrackStyle = useMainThreadRef<Writer<Record<string, string>>>();

  const updateStyle = (next: RefWriteAction<Vec2>) => {
    'main thread';
    const resolved = resolveNextValue(currentHLRef.current, next);
    if (resolved !== undefined) {
      const { edge: edgeBg, track: trackBg } =
        MTSHSLGradients.saturationGradientPair(resolved[0], resolved[1]);
      writeRootStyle.current?.({ 'background-image': edgeBg });
      writeTrackStyle.current?.({ 'background-image': trackBg });
    }
  };

  const init = useCallback(() => {
    'main thread';
    if (writeHL) {
      writeHL.current = updateStyle;
    }
  }, []);

  return (
    <Slider
      min={0}
      max={100}
      step={1}
      main-thread:onInit={init}
      main-thread:writeRootStyle={writeRootStyle}
      main-thread:writeTrackStyle={writeTrackStyle}
      initialRootStyle={{ 'background-image': gradients.edge }}
      initialTrackStyle={{ 'background-image': gradients.track }}
      {...restProps}
    />
  );
}

/** ================= Lightness Slider ================= */

function LightnessSlider({
  initialHS = [0, 100],
  ['main-thread:writeHS']: writeHS,
  ...restProps
}: LightnessSliderProps) {
  const [gradients] = useState(() => {
    return HSLGradients.lightnessGradientPair(initialHS[0], initialHS[1]);
  });

  const currentHSRef = useMainThreadRef<Vec2>(initialHS);

  const writeRootStyle = useMainThreadRef<Writer<Record<string, string>>>();
  const writeTrackStyle = useMainThreadRef<Writer<Record<string, string>>>();

  const updateStyle = (next: RefWriteAction<Vec2>) => {
    'main thread';
    const resolved = resolveNextValue(currentHSRef.current, next);
    if (resolved !== undefined) {
      const { edge: edgeBg, track: trackBg } =
        MTSHSLGradients.lightnessGradientPair(resolved[0], resolved[1]);
      writeRootStyle.current?.({ 'background-image': edgeBg });
      writeTrackStyle.current?.({ 'background-image': trackBg });
    }
  };

  const init = useCallback(() => {
    'main thread';
    if (writeHS) {
      writeHS.current = updateStyle;
    }
  }, []);

  return (
    <Slider
      min={0}
      max={100}
      step={1}
      main-thread:onInit={init}
      main-thread:writeRootStyle={writeRootStyle}
      main-thread:writeTrackStyle={writeTrackStyle}
      initialRootStyle={{ 'background-image': gradients.edge }}
      initialTrackStyle={{ 'background-image': gradients.track }}
      {...restProps}
    />
  );
}

export { Slider, HueSlider, LightnessSlider, SaturationSlider };
export type { WriterRef, Writer, WriterWithControls, WriterWithControlsRef };

/** ================= HSL Sliders Shared Types ================= */

type StyledSliderProps = Pick<
  SliderProps,
  'initialValue' | 'main-thread:onChange' | 'disabled' | 'writeValue'
>;

type HueSliderProps = Expand<
  StyledSliderProps & {
    initialSL?: Vec2;
    ['main-thread:writeSL']?: WriterRef<Vec2>;
  }
>;

type LightnessSliderProps = Expand<
  StyledSliderProps & {
    initialHS?: Vec2;
    ['main-thread:writeHS']?: WriterRef<Vec2>;
  }
>;

type SaturationSliderProps = Expand<
  StyledSliderProps & {
    initialHL?: Vec2;
    ['main-thread:writeHL']?: WriterRef<Vec2>;
  }
>;
