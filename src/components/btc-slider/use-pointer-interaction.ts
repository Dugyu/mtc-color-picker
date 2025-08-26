import { useState, useRef, useCallback } from '@lynx-js/react';
import type { MutableRefObject } from '@lynx-js/react';
import type { LayoutChangeEvent, NodesRef, TouchEvent } from '@lynx-js/types';

import { useEffectEvent, noop } from './use-effect-event';

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
interface UsePointerInteractionProps {
  /** Called continuously while pointer moves (dragging). */
  onUpdate?: (pos: PointerPosition) => void;
  /** Called once at the end of an interaction (pointer up). */
  onCommit?: (pos: PointerPosition) => void;
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
function usePointerInteraction({
  onUpdate,
  onCommit,
}: UsePointerInteractionProps = {}): UsePointerInteractionReturnValue {
  /** Element (coordinate frame) metrics */
  const elementLeftRef = useRef<number | null>(null);
  const elementWidthRef = useRef(0);

  /** (Optional) Container metrics kept for future policies (hit-testing, scroll compensation, etc.) */
  const containerLeftRef = useRef<number | null>(null);
  const containerWidthRef = useRef(0);

  /** Last computed pointer position snapshot */
  const posRef = useRef<PointerPosition | null>(null);

  /** Separate refs: container for events, element for measurement */
  const containerRef = useRef<NodesRef | null>(null);
  const elementRef = useRef<NodesRef | null>(null);

  const [dragging, _setDragging] = useState(false);
  const draggingRef = useRef(false);
  const setDragging = useCallback((next: boolean) => {
    draggingRef.current = next;
    _setDragging(next);
  }, []);

  const stableUpdate = useEffectEvent(onUpdate ?? noop);
  const stableCommit = useEffectEvent(onCommit ?? noop);

  const buildPosition = useCallback((x: number): PointerPosition | null => {
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
    (e: TouchEvent) => {
      setDragging(true);
      buildPosition(e.detail.x);
      if (posRef.current) {
        stableUpdate(posRef.current);
      }
    },
    [buildPosition, setDragging, stableUpdate],
  );

  const onPointerMove = useCallback(
    (e: TouchEvent) => {
      if (!draggingRef.current) return;
      buildPosition(e.detail.x);
      if (posRef.current) {
        stableUpdate(posRef.current);
      }
    },
    [buildPosition, setDragging, stableUpdate],
  );

  const onPointerUp = useCallback(
    (e: TouchEvent) => {
      setDragging(false);
      buildPosition(e.detail.x);
      if (posRef.current) {
        stableUpdate(posRef.current);
        stableCommit(posRef.current);
      }
    },
    [buildPosition, setDragging, stableUpdate, stableCommit],
  );

  const onElementLayoutChange = useCallback((e: LayoutChangeEvent) => {
    elementWidthRef.current = e.detail.width;
    elementRef.current
      ?.invoke({
        method: 'boundingClientRect',
        params: { relativeTo: 'screen' }, // screen-based so it matches e.detail.x
        success: (res) => {
          elementLeftRef.current = res.left;
        },
      })
      .exec();
  }, []);

  const onContainerLayoutChange = useCallback((e: LayoutChangeEvent) => {
    containerWidthRef.current = e.detail.width;
    containerRef.current
      ?.invoke({
        method: 'boundingClientRect',
        params: { relativeTo: 'screen' },
        success: (res) => {
          containerLeftRef.current = res.left;
        },
      })
      .exec();
  }, []);

  return {
    elementRef,
    containerRef,
    dragging,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onElementLayoutChange,
    onContainerLayoutChange,
  };
}
interface UsePointerInteractionReturnValue {
  elementRef: MutableRefObject<NodesRef | null>;
  containerRef: MutableRefObject<NodesRef | null>;
  dragging: boolean;
  onPointerDown: (e: TouchEvent) => void;
  onPointerMove: (e: TouchEvent) => void;
  onPointerUp: (e: TouchEvent) => void;
  onElementLayoutChange: (e: LayoutChangeEvent) => void;
  onContainerLayoutChange: (e: LayoutChangeEvent) => void;
}

export { usePointerInteraction };
export type {
  PointerPosition,
  UsePointerInteractionProps,
  UsePointerInteractionReturnValue,
};
