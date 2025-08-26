import { useMainThreadRef, useState } from '@lynx-js/react';
import type { MainThread } from '@lynx-js/types';
import { useMTSSlider } from './use-mts-slider';
import type { MTSWriterRef, MTSWriter } from './use-mts-slider';
import type { RefWriteAction } from './use-mts-controllable';
import { isUpdater } from './use-mts-controllable';
import { HSLGradients } from '@/utils/hsl-gradients';
import { MTSHSLGradients } from '@/utils/mts-hsl-gradients';

interface MTSSliderProps {
  mtsWriteValue?: MTSWriterRef<number>;
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

  const currentRootStyleRef =
    useMainThreadRef<Record<string, string>>(initialRootStyle);
  const currentTrackStyleRef =
    useMainThreadRef<Record<string, string>>(initialTrackStyle);

  const onChange = (value: number) => {
    'main thread';
    updateThumbStyle();
    onMTSChange?.(value);
  };

  const {
    ratioRef,
    writeValue,
    onMTSPointerDown,
    onMTSPointerMove,
    onMTSPointerUp,
    onMTSTrackLayoutChange,
  } = useMTSSlider({
    initialValue,
    mtsWriteValue,
    onMTSChange: onChange,
    onMTSCommit: onMTSCommit,
    ...restProps,
  });

  function updateRootStyle(
    next: RefWriteAction<Record<string, string> | undefined>,
  ) {
    'main thread';
    if (mtsRootRef.current) {
      const resolved = isUpdater(next)
        ? next(currentRootStyleRef.current)
        : next;
      if (resolved !== undefined) {
        mtsRootRef.current.setStyleProperties(resolved);
        currentRootStyleRef.current = resolved;
      }
    }
  }

  function updateTrackStyle(
    next: RefWriteAction<Record<string, string> | undefined>,
  ) {
    'main thread';
    if (mtsTrackRef.current) {
      const resolved = isUpdater(next)
        ? next(currentTrackStyleRef.current)
        : next;
      if (resolved !== undefined) {
        mtsTrackRef.current.setStyleProperties(resolved);
        currentTrackStyleRef.current = resolved;
      }
    }
  }

  function updateThumbStyle() {
    'main thread';
    if (mtsThumbRef.current) {
      mtsThumbRef.current.setStyleProperties({
        left: `${ratioRef.current * 100}%`,
      });
    }
  }

  const initRoot = (ref: MainThread.Element) => {
    'main thread';
    mtsRootRef.current = ref;

    // Bind writeValue to mtsWriteValue
    writeValue.init();

    // Initialization callback
    onMTSInit?.(ref);

    if (mtsWriteRootStyle) {
      mtsWriteRootStyle.current = updateRootStyle;
    }
    // init root style
    updateRootStyle(currentRootStyleRef.current);
  };

  const initTrack = (ref: MainThread.Element) => {
    'main thread';
    mtsTrackRef.current = ref;
    if (mtsWriteTrackStyle) {
      mtsWriteTrackStyle.current = updateTrackStyle;
    }
    // init track style
    updateTrackStyle(currentTrackStyleRef.current);
  };

  const initThumb = (ref: MainThread.Element) => {
    'main thread';
    mtsThumbRef.current = ref;
    updateThumbStyle();
  };

  return (
    // Root
    <view
      main-thread:ref={initRoot}
      main-thread:bindtouchstart={onMTSPointerDown}
      main-thread:bindtouchmove={onMTSPointerMove}
      main-thread:bindtouchend={onMTSPointerUp}
      main-thread:bindtouchcancel={onMTSPointerUp}
      className="relative px-5 bg-primary w-full h-10 flex flex-row items-center rounded-full"
    >
      {/* Track Positioner */}
      <view
        className="relative w-full h-full flex flex-row items-center"
        main-thread:ref={initTrack}
        main-thread:bindlayoutchange={onMTSTrackLayoutChange}
      >
        {/* Track Visualizer */}
        <view className="w-full h-full bg-secondary"></view>
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
}: Omit<MTSSliderProps, 'min' | 'max' | 'step'> & {
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

  const updateStyle = (
    next: RefWriteAction<readonly [number, number] | undefined>,
  ) => {
    'main thread';
    const resolved = isUpdater(next) ? next(currentSLRef.current) : next;
    if (resolved !== undefined) {
      const { edge: edgeBg, track: trackBg } = MTSHSLGradients.hueGradientPair(
        resolved[0],
        resolved[1],
      );
      mtsWriteRootStyle.current?.({ backgroundImage: edgeBg });
      mtsWriteTrackStyle.current?.({ backgroundImage: trackBg });
    }
  };
  const init = () => {
    'main thread';
    if (mtsWriteSL) {
      mtsWriteSL.current = updateStyle;
    }
  };

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
      initialRootStyle={{ backgroundImage: gradients.edge }}
      initialTrackStyle={{ backgroundImage: gradients.track }}
    />
  );
}

export { MTSSlider, HueSlider };
