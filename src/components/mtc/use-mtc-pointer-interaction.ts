'main thread';

import { useRef } from '@lynx-js/react';
import type { MainThread } from '@lynx-js/types';

/** Pointer position in the element’s local frame. */
interface PointerPosition {
  /** Horizontal offset from element's left edge (px). Can be <0 or >width. */
  offset: number;
  /** offset / elementWidth. Can be <0 or >1. */
  offsetRatio: number;
  /** Measured width of the element (px). */
  elementWidth: number;
}

/** Interaction callbacks. */
interface UseMTCPointerInteractionProps {
  /** Fires during drag/move. */
  onUpdate?: (pos: PointerPosition) => void;
  /** Fires on pointer up (final value). */
  onCommit?: (pos: PointerPosition) => void;
}

/**
 * Pointer → element-local coordinates adapter (MTC).
 *
 * - Container usually hosts touch/pointer events (better hit area).
 * - Element defines the coordinate frame (layout + bounding rect).
 * - If no separate container is needed, bind handlers on the element itself.
 *
 * No clamping/step logic is applied here.
 */
function useMTCPointerInteraction({
  onUpdate,
  onCommit,
}: UseMTCPointerInteractionProps = {}): UseMTCPointerInteractionReturnValue {
  /** Element (coordinate frame) metrics */
  const eleLeftRef = useRef<number | null>(null);
  const eleWidthRef = useRef(0);

  /** Last computed pointer position snapshot */
  const posRef = useRef<PointerPosition | null>(null);

  const draggingRef = useRef(false);

  function buildPosition(x: number): PointerPosition | null {
    const width = eleWidthRef.current;
    const left = eleLeftRef.current;

    if (width > 0 && left != null) {
      const offset = x - left;
      const offsetRatio = offset / width;
      const pos: PointerPosition = { offset, offsetRatio, elementWidth: width };
      posRef.current = pos;
      return pos;
    }
    return null;
  }

  function handlePointerDown(e: MainThread.TouchEvent) {
    draggingRef.current = true;
    buildPosition(e.detail.x);
    if (posRef.current) {
      onUpdate?.(posRef.current);
    }
  }

  function handlePointerMove(e: MainThread.TouchEvent) {
    if (!draggingRef.current) return;
    buildPosition(e.detail.x);
    if (posRef.current) {
      onUpdate?.(posRef.current);
    }
  }

  function handlePointerUp(e: MainThread.TouchEvent) {
    draggingRef.current = false;
    buildPosition(e.detail.x);
    if (posRef.current) {
      // Fire update then commit on release.
      onUpdate?.(posRef.current);
      onCommit?.(posRef.current);
    }
  }

  async function handleElementLayoutChange(e: MainThread.LayoutChangeEvent) {
    eleWidthRef.current = e.detail.width;

    // Screen-based rect so it aligns with e.detail.x
    const rect: { left: number } =
      await e.currentTarget.invoke('boundingClientRect');
    eleLeftRef.current = rect.left;
  }

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleElementLayoutChange,
  };
}

interface UseMTCPointerInteractionReturnValue {
  /** Bind on CONTAINER (or ELEMENT if container === element): <view bindtouchstart={handlePointerDown} /> */
  handlePointerDown: (e: MainThread.TouchEvent) => void;
  /** Bind on CONTAINER (or ELEMENT if container === element): <view bindtouchmove={handlePointerMove} /> */
  handlePointerMove: (e: MainThread.TouchEvent) => void;
  /** Bind on CONTAINER (or ELEMENT if container===element): <view bindtouchend|bindtouchcancel={handlePointerUp} /> */
  handlePointerUp: (e: MainThread.TouchEvent) => void;
  /** Bind on ELEMENT: <view bindlayoutchange={handleElementLayoutChange} /> */
  handleElementLayoutChange: (e: MainThread.LayoutChangeEvent) => Promise<void>;
}

export { useMTCPointerInteraction };
export type {
  PointerPosition,
  UseMTCPointerInteractionProps,
  UseMTCPointerInteractionReturnValue,
};
