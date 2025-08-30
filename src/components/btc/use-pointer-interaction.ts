import { useRef, useCallback } from '@lynx-js/react';
import type { MutableRefObject } from '@lynx-js/react';
import type { LayoutChangeEvent, NodesRef, TouchEvent } from '@lynx-js/types';

import { useEffectEvent, noop } from './use-effect-event';

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
interface UsePointerInteractionProps {
  /** Fires during drag/move. */
  onUpdate?: (pos: PointerPosition) => void;
  /** Fires on pointer up (final value). */
  onCommit?: (pos: PointerPosition) => void;
}

/**
 * Pointer → element-local coordinates adapter.
 *
 * - The container usually hosts touch/pointer events (recommended for larger hit area).
 * - The element provides the measurement frame (layout + bounding rect).
 * - If you don't need a separate container, you may bind all handlers on the element
 *   itself (container === element).
 *
 * No clamping/step logic is applied here.
 */
function usePointerInteraction({
  onUpdate,
  onCommit,
}: UsePointerInteractionProps = {}): UsePointerInteractionReturnValue {
  /** Element (coordinate frame) & metrics */
  const eleRef = useRef<NodesRef | null>(null);
  const eleLeftRef = useRef<number | null>(null);
  const eleWidthRef = useRef(0);

  /** Last computed pointer position snapshot */
  const posRef = useRef<PointerPosition | null>(null);

  const draggingRef = useRef(false);

  const onUpdateStable = useEffectEvent(onUpdate ?? noop);
  const onCommitStable = useEffectEvent(onCommit ?? noop);

  const buildPosition = useCallback((x: number): PointerPosition | null => {
    const width = eleWidthRef.current;
    const left = eleLeftRef.current;

    if (width > 0 && left != null) {
      const offset = x - left;
      const offsetRatio = offset / width;
      const pos = { offset, offsetRatio, elementWidth: width };
      posRef.current = pos;
      return pos;
    }
    return null;
  }, []);

  const handlePointerDown = useCallback(
    (e: TouchEvent) => {
      draggingRef.current = true;
      buildPosition(e.detail.x);
      if (posRef.current) {
        onUpdateStable(posRef.current);
      }
    },
    [buildPosition, onUpdateStable],
  );

  const handlePointerMove = useCallback(
    (e: TouchEvent) => {
      if (!draggingRef.current) return;
      buildPosition(e.detail.x);
      if (posRef.current) {
        onUpdateStable(posRef.current);
      }
    },
    [buildPosition, onUpdateStable],
  );

  const handlePointerUp = useCallback(
    (e: TouchEvent) => {
      draggingRef.current = false;
      buildPosition(e.detail.x);
      if (posRef.current) {
        onUpdateStable(posRef.current);
        onCommitStable(posRef.current);
      }
    },
    [buildPosition, onUpdateStable, onCommitStable],
  );

  const handleElementLayoutChange = useCallback((e: LayoutChangeEvent) => {
    eleWidthRef.current = e.detail.width;

    eleRef.current
      ?.invoke({
        method: 'boundingClientRect',
        params: { relativeTo: 'screen' }, // screen-based so it matches e.detail.x
        success: (res) => {
          eleLeftRef.current = res.left;
        },
      })
      .exec();
  }, []);

  return {
    elementRef: eleRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleElementLayoutChange,
  };
}
interface UsePointerInteractionReturnValue {
  /** Ref for the measured element (coordinate frame). */
  elementRef: MutableRefObject<NodesRef | null>;
  /** Bind on CONTAINER (or ELEMENT if container === element): <view bindtouchstart={handlePointerDown} /> */
  handlePointerDown: (e: TouchEvent) => void;
  /** Bind on CONTAINER (or ELEMENT if container === element): <view bindtouchmove={handlePointerMove} /> */
  handlePointerMove: (e: TouchEvent) => void;
  /** Bind on CONTAINER (or ELEMENT if container===element): <view bindtouchend|bindtouchcancel={handlePointerUp} /> */
  handlePointerUp: (e: TouchEvent) => void;
  /** Bind on ELEMENT: <view bindlayoutchange={handleElementLayoutChange} /> */
  handleElementLayoutChange: (e: LayoutChangeEvent) => void;
}

export { usePointerInteraction };
export type {
  PointerPosition,
  UsePointerInteractionProps,
  UsePointerInteractionReturnValue,
};
