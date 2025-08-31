'main thread';

import { useRef } from '@lynx-js/react';
import type { MainThread } from '@lynx-js/types';

import type {
  PointerPosition,
  UsePointerInteractionProps,
  UsePointerInteractionReturnValueBase,
} from '@/types/pointer';

/**
 * Pointer → element-local coordinates adapter (MTC).
 *
 * - Container usually hosts touch/pointer events (better hit area).
 * - Element defines the coordinate frame (layout + bounding rect).
 * - If no separate container is needed, bind handlers on the element itself.
 *
 * No clamping/step logic is applied here.
 */
function usePointerInteraction({
  onUpdate,
  onCommit,
}: UsePointerInteractionProps = {}): UsePointerInteractionReturnValue {
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

  function handleElementLayoutChange(e: MainThread.LayoutChangeEvent) {
    eleWidthRef.current = e.detail.width;

    e.currentTarget
      .invoke('boundingClientRect')
      .then((rect: { left: number }) => {
        // Screen-based rect so it aligns with e.detail.x
        eleLeftRef.current = rect.left;
      })
      .catch((err) => {
        console.error('Failed to get boundingClientRect:', err);
      });
  }
  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleElementLayoutChange,
  };
}

type UsePointerInteractionReturnValue = UsePointerInteractionReturnValueBase<
  MainThread.TouchEvent,
  MainThread.LayoutChangeEvent
>;

export { usePointerInteraction };
export type { PointerPosition, UsePointerInteractionReturnValue };
