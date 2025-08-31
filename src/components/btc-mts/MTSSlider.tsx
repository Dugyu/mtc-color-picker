import { useCallback, useMainThreadRef, useState } from '@lynx-js/react';
import type { MainThread } from '@lynx-js/types';
import { useMTSSlider } from './use-mts-slider';
import type {
  MTSWriterRef,
  MTSWriter,
  MTSWriterWithControlsRef,
  MTSWriterWithControls,
} from './use-mts-slider';
import type { RefWriteAction } from './use-mts-controllable';
import { resolveNextValue } from './use-mts-controllable';
import { HSLGradients } from '@/utils/hsl-gradients';
import { MTSHSLGradients } from '@/utils/mts-hsl-gradients';
import type { Expand } from '@/types/utils';

interface MTSSliderProps {
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
  mtsWriteRootStyle?: MTSWriterRef<Record<string, string>>;
  mtsWriteTrackStyle?: MTSWriterRef<Record<string, string>>;
  initialRootStyle?: Record<string, string>;
  initialTrackStyle?: Record<string, string>;
}

/** ================= Base Slider ================= */

function MTSSlider(props: MTSSliderProps) {
  const {
    mtsWriteValue,
    initialValue,
    onMTSInit,
    onMTSChange,
    onMTSCommit,
    mtsWriteRootStyle,
    mtsWriteTrackStyle,
    initialRootStyle = {},
    initialTrackStyle = {},
    min,
    ...restProps
  } = props;

  const mtsRootRef = useMainThreadRef<MainThread.Element | null>(null);
  const mtsTrackRef = useMainThreadRef<MainThread.Element | null>(null);
  const mtsThumbRef = useMainThreadRef<MainThread.Element | null>(null);

  const mtsRootStyleRef =
    useMainThreadRef<Record<string, string>>(initialRootStyle);
  const mtsTrackStyleRef =
    useMainThreadRef<Record<string, string>>(initialTrackStyle);

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

  function updateRootStyle(next: RefWriteAction<Record<string, string>>) {
    'main thread';
    if (mtsRootRef.current) {
      const resolved = resolveNextValue(mtsRootStyleRef.current, next);
      if (resolved !== undefined) {
        mtsRootRef.current.setStyleProperties(resolved);
        mtsRootStyleRef.current = resolved;
      }
    }
  }

  function updateTrackStyle(next: RefWriteAction<Record<string, string>>) {
    'main thread';
    if (mtsTrackRef.current) {
      const resolved = resolveNextValue(mtsTrackStyleRef.current, next);
      if (resolved !== undefined) {
        mtsTrackRef.current.setStyleProperties(resolved);
        mtsTrackStyleRef.current = resolved;
      }
    }
  }

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
    mtsRootRef.current = ref;
    // Bind writeValue to mtsWriteValue
    if (ref) {
      writeValue.init();
    } else {
      writeValue.dispose();
    }
    // Initialization callback
    onMTSInit?.(ref);
    if (mtsWriteRootStyle) {
      mtsWriteRootStyle.current = updateRootStyle;
    }
    // init root style
    updateRootStyle(mtsRootStyleRef.current);
  }, []);

  const initTrack = useCallback((ref: MainThread.Element) => {
    'main thread';
    mtsTrackRef.current = ref;

    if (mtsWriteTrackStyle) {
      mtsWriteTrackStyle.current = updateTrackStyle;
    }
    // init track style
    updateTrackStyle(mtsTrackStyleRef.current);
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
  mtsWriteValue,
  initialValue,
  onMTSChange,
  onMTSCommit,
  initialSL = [100, 50],
  mtsWriteSL,
  disabled,
}: Expand<Omit<MTSSliderProps, 'min' | 'max' | 'step'>> & {
  initialSL?: readonly [number, number];
  mtsWriteSL?: MTSWriterRef<readonly [number, number]>;
}) {
  const [gradients] = useState(() => {
    return HSLGradients.hueGradientPair(initialSL[0], initialSL[1]);
  });
  const currentSLRef = useMainThreadRef<readonly [number, number]>(initialSL);

  const mtsWriteRootStyle =
    useMainThreadRef<MTSWriter<Record<string, string>>>();

  const mtsWriteTrackStyle =
    useMainThreadRef<MTSWriter<Record<string, string>>>();

  const updateStyle = (next: RefWriteAction<readonly [number, number]>) => {
    'main thread';
    const resolved = resolveNextValue(currentSLRef.current, next);
    if (resolved !== undefined) {
      const { edge: edgeBg, track: trackBg } = MTSHSLGradients.hueGradientPair(
        resolved[0],
        resolved[1],
      );
      mtsWriteRootStyle.current?.({ 'background-image': edgeBg });
      mtsWriteTrackStyle.current?.({ 'background-image': trackBg });
    }
  };
  const init = useCallback(() => {
    'main thread';
    if (mtsWriteSL) {
      mtsWriteSL.current = updateStyle;
    }
  }, []);

  return (
    <MTSSlider
      mtsWriteValue={mtsWriteValue}
      initialValue={initialValue}
      onMTSInit={init}
      onMTSChange={onMTSChange}
      onMTSCommit={onMTSCommit}
      min={0}
      max={360}
      step={1}
      disabled={disabled}
      mtsWriteRootStyle={mtsWriteRootStyle}
      mtsWriteTrackStyle={mtsWriteTrackStyle}
      initialRootStyle={{ 'background-image': gradients.edge }}
      initialTrackStyle={{ 'background-image': gradients.track }}
    />
  );
}

/** ================= Saturation Slider ================= */

function SaturationSlider({
  mtsWriteValue,
  initialValue,
  onMTSChange,
  onMTSCommit,
  initialHL = [0, 50],
  mtsWriteHL,
  disabled,
}: Expand<Omit<MTSSliderProps, 'min' | 'max' | 'step'>> & {
  initialHL?: readonly [number, number];
  mtsWriteHL?: MTSWriterRef<readonly [number, number]>;
}) {
  const [gradients] = useState(() => {
    return HSLGradients.saturationGradientPair(initialHL[0], initialHL[1]);
  });

  const currentHLRef = useMainThreadRef<readonly [number, number]>(initialHL);

  const mtsWriteRootStyle =
    useMainThreadRef<MTSWriter<Record<string, string>>>();
  const mtsWriteTrackStyle =
    useMainThreadRef<MTSWriter<Record<string, string>>>();

  const updateStyle = (next: RefWriteAction<readonly [number, number]>) => {
    'main thread';
    const resolved = resolveNextValue(currentHLRef.current, next);
    if (resolved !== undefined) {
      const { edge: edgeBg, track: trackBg } =
        MTSHSLGradients.saturationGradientPair(resolved[0], resolved[1]);
      mtsWriteRootStyle.current?.({ 'background-image': edgeBg });
      mtsWriteTrackStyle.current?.({ 'background-image': trackBg });
    }
  };

  const init = useCallback(() => {
    'main thread';
    if (mtsWriteHL) {
      mtsWriteHL.current = updateStyle;
    }
  }, []);

  return (
    <MTSSlider
      mtsWriteValue={mtsWriteValue}
      initialValue={initialValue}
      onMTSInit={init}
      onMTSChange={onMTSChange}
      onMTSCommit={onMTSCommit}
      min={0}
      max={100}
      step={1}
      disabled={disabled}
      mtsWriteRootStyle={mtsWriteRootStyle}
      mtsWriteTrackStyle={mtsWriteTrackStyle}
      initialRootStyle={{ 'background-image': gradients.edge }}
      initialTrackStyle={{ 'background-image': gradients.track }}
    />
  );
}

/** ================= Lightness Slider ================= */

function LightnessSlider({
  mtsWriteValue,
  initialValue,
  onMTSChange,
  onMTSCommit,
  initialHS = [0, 100],
  mtsWriteHS,
  disabled,
}: Expand<Omit<MTSSliderProps, 'min' | 'max' | 'step'>> & {
  initialHS?: readonly [number, number];
  mtsWriteHS?: MTSWriterRef<readonly [number, number]>;
}) {
  const [gradients] = useState(() => {
    return HSLGradients.lightnessGradientPair(initialHS[0], initialHS[1]);
  });

  const currentHSRef = useMainThreadRef<readonly [number, number]>(initialHS);

  const mtsWriteRootStyle =
    useMainThreadRef<MTSWriter<Record<string, string>>>();
  const mtsWriteTrackStyle =
    useMainThreadRef<MTSWriter<Record<string, string>>>();

  const updateStyle = (next: RefWriteAction<readonly [number, number]>) => {
    'main thread';
    const resolved = resolveNextValue(currentHSRef.current, next);
    if (resolved !== undefined) {
      const { edge: edgeBg, track: trackBg } =
        MTSHSLGradients.lightnessGradientPair(resolved[0], resolved[1]);
      mtsWriteRootStyle.current?.({ 'background-image': edgeBg });
      mtsWriteTrackStyle.current?.({ 'background-image': trackBg });
    }
  };

  const init = useCallback(() => {
    'main thread';
    if (mtsWriteHS) {
      mtsWriteHS.current = updateStyle;
    }
  }, []);

  return (
    <MTSSlider
      mtsWriteValue={mtsWriteValue}
      initialValue={initialValue}
      onMTSInit={init}
      onMTSChange={onMTSChange}
      onMTSCommit={onMTSCommit}
      min={0}
      max={100}
      step={1}
      disabled={disabled}
      mtsWriteRootStyle={mtsWriteRootStyle}
      mtsWriteTrackStyle={mtsWriteTrackStyle}
      initialRootStyle={{ 'background-image': gradients.edge }}
      initialTrackStyle={{ 'background-image': gradients.track }}
    />
  );
}

export { MTSSlider, HueSlider, LightnessSlider, SaturationSlider };
export type {
  MTSWriterRef,
  MTSWriter,
  MTSWriterWithControls,
  MTSWriterWithControlsRef,
};
