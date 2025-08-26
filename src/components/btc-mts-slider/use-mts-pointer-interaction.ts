import { useMainThreadRef, useCallback } from '@lynx-js/react';
import type { MainThread } from '@lynx-js/types';

// import { useMTSEffectEvent } from './use-mts-effect-event';
/**
 * Raw pointer position relative to an element's bounding box.
 */
interface PointerPosition {
  /**
   * Horizontal offset from the element's left edge, in pixels.
   * May be < 0 if the pointer is left of the element,
   * or > elementWidth if the pointer is right of the element.
   */
  offset: number;

  /**
   * Normalized ratio of offset / elementWidth.
   * May be < 0 or > 1 if pointer is outside.
   */
  offsetRatio: number;

  /** Width of the element's bounding box in pixels. */
  elementWidth: number;
}

/**
 * Pointer to element-local coordinates adapter.
 * - Converts global pointer X into element-relative offset and ratio.
 * - Does not apply clamp, min/max, or step logic (leave that to higher-level hooks).
 * - Internally stabilizes callbacks so listeners don't depend on caller memoization.
 */
interface UseMTSPointerInteractionProps {
  /** Called continuously while pointer moves (dragging). */
  onMTSUpdate?: (pos: PointerPosition) => void;
  /** Called once at the end of an interaction (pointer up). */
  onMTSCommit?: (pos: PointerPosition) => void;
}

/**
 * Pointer interactions with split responsibilities:
 * - The *container* (parent) handles pointer events to enlarge the hit/gesture area.
 * - The *element* (child) is the coordinate frame: we always compute offset/ratio
 *   against the element's measured bounding rect.
 *
 * Notes:
 * - We rely on `onElementLayoutChange` to keep `left/width` fresh.
 * - If element metrics are not ready when a pointer event arrives, we skip updates safely.
 */

function useMTSPointerInteraction({
  onMTSUpdate,
  onMTSCommit,
}: UseMTSPointerInteractionProps = {}) {
  /** Element (coordinate frame) metrics */
  const elementLeftRef = useMainThreadRef<number | null>(null);
  const elementWidthRef = useMainThreadRef(0);

  /** (Optional) Container metrics kept for future policies (hit-testing, scroll compensation, etc.) */
  const containerLeftRef = useMainThreadRef<number | null>(null);
  const containerWidthRef = useMainThreadRef(0);

  /** Last computed pointer position snapshot */
  const posRef = useMainThreadRef<PointerPosition | null>(null);

  const draggingRef = useMainThreadRef(false);

  // const stableUpdate = useMTSEffectEvent(onMTSUpdate);
  // const stableCommit = useMTSEffectEvent(onMTSCommit);

  const buildPosition = useCallback((x: number): PointerPosition | null => {
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
  }, []);

  const onPointerDown = useCallback(
    (e: MainThread.TouchEvent) => {
      'main thread';
      draggingRef.current = true;
      buildPosition(e.detail.x);
      if (posRef.current) {
        onMTSUpdate?.(posRef.current);
        //stableUpdate(posRef.current);
      }
    },
    [buildPosition],
  );

  const onPointerMove = useCallback(
    (e: MainThread.TouchEvent) => {
      'main thread';
      if (!draggingRef.current) return;
      buildPosition(e.detail.x);
      if (posRef.current) {
        onMTSUpdate?.(posRef.current);
        // stableUpdate(posRef.current);
      }
    },
    [buildPosition],
  );

  const onPointerUp = useCallback(
    (e: MainThread.TouchEvent) => {
      'main thread';
      draggingRef.current = false;
      buildPosition(e.detail.x);
      if (posRef.current) {
        onMTSUpdate?.(posRef.current);
        onMTSCommit?.(posRef.current);
        // stableUpdate(posRef.current);
        // stableCommit(posRef.current);
      }
    },
    [buildPosition],
  );

  const onElementLayoutChange = useCallback(
    async (e: MainThread.LayoutChangeEvent) => {
      'main thread';
      elementWidthRef.current = e.detail.width;
      const rect: { left: number } =
        await e.currentTarget.invoke('boundingClientRect');
      elementLeftRef.current = rect.left;
    },
    [],
  );

  const onContainerLayoutChange = useCallback(
    async (e: MainThread.LayoutChangeEvent) => {
      'main thread';
      containerWidthRef.current = e.detail.width;
      const rect: { left: number } =
        await e.currentTarget.invoke('boundingClientRect');
      containerLeftRef.current = rect.left;
    },
    [],
  );

  return {
    onMTSPointerDown: onPointerDown,
    onMTSPointerMove: onPointerMove,
    onMTSPointerUp: onPointerUp,
    onMTSElementLayoutChange: onElementLayoutChange,
    onMTSContainerLayoutChange: onContainerLayoutChange,
  };
}

interface UseMTSPointerInteractionReturnValue {
  onMTSPointerDown: (e: MainThread.TouchEvent) => void;
  onMTSPointerMove: (e: MainThread.TouchEvent) => void;
  onMTSPointerUp: (e: MainThread.TouchEvent) => void;
  onMTSElementLayoutChange: (e: MainThread.LayoutChangeEvent) => Promise<void>;
  onMTSContainerLayoutChange: (
    e: MainThread.LayoutChangeEvent,
  ) => Promise<void>;
}

export { useMTSPointerInteraction };
export type {
  PointerPosition,
  UseMTSPointerInteractionProps,
  UseMTSPointerInteractionReturnValue,
};
