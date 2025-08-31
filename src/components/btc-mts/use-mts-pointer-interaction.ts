import { useMainThreadRef } from '@lynx-js/react';
import type { MainThread } from '@lynx-js/types';

import type {
  PointerPosition,
  UsePointerInteractionProps,
  UsePointerInteractionReturnValueBase,
} from '@/types/pointer';

/**
 * Pointer interactions with split responsibilities:
 * - The *container* (parent) handles pointer events to enlarge the hit/gesture area.
 * - The *element* (child) is the coordinate frame: we always compute offset/ratio
 *   against the element's measured bounding rect.
 *
 * Notes:
 * - We rely on `handleElementLayoutChange` to keep `left/width` fresh.
 * - If element metrics are not ready when a pointer event arrives, we skip updates safely.
 */

function usePointerInteraction({
  onUpdate,
  onCommit,
}: UsePointerInteractionProps = {}) {
  /** Element (coordinate frame) metrics */
  const elementLeftRef = useMainThreadRef<number | null>(null);
  const elementWidthRef = useMainThreadRef(0);

  /** Last computed pointer position snapshot */
  const posRef = useMainThreadRef<PointerPosition | null>(null);

  const draggingRef = useMainThreadRef(false);

  const buildPosition = (x: number): PointerPosition | null => {
    'main thread';
    const elementWidth = elementWidthRef.current;
    const elementLeft = elementLeftRef.current;

    if (elementWidth > 0 && elementLeft != null) {
      const offset = x - elementLeft;
      const offsetRatio = offset / elementWidth;
      const pos = { offset, offsetRatio, elementWidth };
      posRef.current = pos;
      return pos;
    }
    return null;
  };

  const handlePointerDown = (e: MainThread.TouchEvent) => {
    'main thread';
    draggingRef.current = true;
    buildPosition(e.detail.x);
    if (posRef.current) {
      onUpdate?.(posRef.current);
    }
  };

  const handlePointerMove = (e: MainThread.TouchEvent) => {
    'main thread';
    if (!draggingRef.current) return;
    buildPosition(e.detail.x);
    if (posRef.current) {
      onUpdate?.(posRef.current);
    }
  };

  const handlePointerUp = (e: MainThread.TouchEvent) => {
    'main thread';
    draggingRef.current = false;
    buildPosition(e.detail.x);
    if (posRef.current) {
      onCommit?.(posRef.current);
    }
  };

  const handleElementLayoutChange = async (e: MainThread.LayoutChangeEvent) => {
    'main thread';
    elementWidthRef.current = e.detail.width;
    const rect: { left: number } =
      await e.currentTarget.invoke('boundingClientRect');
    elementLeftRef.current = rect.left;
  };

  return {
    handlePointerDown: handlePointerDown,
    handlePointerMove: handlePointerMove,
    handlePointerUp: handlePointerUp,
    handleElementLayoutChange: handleElementLayoutChange,
  };
}

type UsePointerInteractionReturnValue = UsePointerInteractionReturnValueBase<
  MainThread.TouchEvent,
  MainThread.LayoutChangeEvent
>;

export { usePointerInteraction };
export type { PointerPosition, UsePointerInteractionReturnValue };
