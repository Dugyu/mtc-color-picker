import { useRef } from '@lynx-js/react';
import type { LayoutChangeEvent, TouchEvent, MouseEvent } from '@lynx-js/types';
import type {
  PointerPosition,
  UsePointerInteractionProps,
  UsePointerInteractionReturnValueBase,
} from '@/types/pointer';

/**
 * Pointer → element-local coordinates adapter.
 *
 * - The container usually hosts touch/pointer events (recommended for larger hit area).
 * - The element provides the measurement frame (layout + bounding rect).
 * - If you don't need a separate container, you may bind all handlers on the element
 *   itself (container === element).
 *
 * No clamping/step logic is applied here.
 *
 * Web/native unified coords:
 * - Touch on Lynx Web: `touches[0].clientX` is populated.
 * - Touch on native: falls back to `e.detail.x`.
 * - Desktop web has no touch events; `bindmouse{down,move,up}` handlers cover it.
 * - `boundingClientRect` keeps `relativeTo: 'screen'`, which Lynx maps to
 *   the viewport on web and to the screen on native — matching the coord
 *   source on each platform.
 */
function usePointerInteraction({
  onUpdate,
  onCommit,
}: UsePointerInteractionProps = {}): UsePointerInteractionReturnValue {
  /** Element (coordinate frame) & metrics */
  const eleLeftRef = useRef<number | null>(null);
  const eleWidthRef = useRef(0);

  /** Last computed pointer position snapshot */
  const posRef = useRef<PointerPosition | null>(null);

  const draggingRef = useRef(false);

  const isWebPlatformRef = useRef<boolean>(
    (SystemInfo.platform as string) === 'web',
  );

  /** Keep the last known element id so we can re-query rect on demand (web compat). */
  const targetIdRef = useRef<number | string | null>(null);

  /**
   * Extract the X coordinate from a touch event.
   * Prefers `clientX` (Lynx Web populates it), falls back to Lynx `detail.x`.
   */
  const pickCoord = (e: TouchEvent): number | null => {
    if (!isWebPlatformRef.current) {
      return e.detail?.x ?? null;
    }

    const t = e.touches?.[0] ?? e.changedTouches?.[0];
    const cx = (t as unknown as { clientX?: number } | undefined)?.clientX;
    if (cx != null) return cx;
    return e.detail?.x ?? null;
  };

  const queryRectById = (
    id: number | string | null,
    onSuccess?: () => void,
    onFail?: () => void,
  ) => {
    if (id == null) {
      onFail?.();
      return;
    }

    const query = lynx.createSelectorQuery();
    // @ts-expect-error Lynx internal UniqueID typing
    const currentTarget = query.selectUniqueID(id);

    if (!currentTarget) {
      onFail?.();
      return;
    }

    currentTarget
      .invoke({
        method: 'boundingClientRect',
        // Screen-relative on native, viewport-relative on Lynx Web — matches
        // the coord source (`detail.x` / `clientX`) on each platform.
        params: { relativeTo: 'screen' },
        success: (res: { left: number; width?: number }) => {
          eleLeftRef.current = res.left;
          if (Number.isFinite(res.width) && (res.width ?? 0) > 0) {
            eleWidthRef.current = res.width ?? eleWidthRef.current;
          }
          onSuccess?.();
        },
        fail: onFail,
      })
      .exec();
  };

  const buildPosition = (x: number | null): PointerPosition | null => {
    if (x === null) return null;
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
  };

  const updateFromX = (x: number) => {
    const pos = buildPosition(x);
    if (pos) onUpdate?.(pos);
  };

  const updateFromFreshRect = (x: number) => {
    queryRectById(
      targetIdRef.current,
      () => {
        if (draggingRef.current) updateFromX(x);
      },
      () => {
        if (draggingRef.current) updateFromX(x);
      },
    );
  };

  const commitCurrentPosition = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (posRef.current) onCommit?.(posRef.current);
  };

  // ── Touch handlers (native + web touch devices) ──

  const handlePointerDown = (e: TouchEvent) => {
    // Clear the prior gesture's snapshot so a fallback commit from this
    // gesture can never re-emit the previous gesture's position.
    posRef.current = null;
    draggingRef.current = true;
    const x = pickCoord(e);
    if (x === null) return;
    updateFromFreshRect(x);
  };

  const handlePointerMove = (e: TouchEvent) => {
    if (!draggingRef.current) return;
    const x = pickCoord(e);
    if (x === null) return;
    updateFromX(x);
  };

  const handlePointerUp = (e: TouchEvent) => {
    draggingRef.current = false;
    const x = pickCoord(e);
    if (x === null) {
      if (posRef.current) onCommit?.(posRef.current);
      return;
    }
    const pos = buildPosition(x);
    if (pos) {
      onUpdate?.(pos);
      onCommit?.(pos);
    } else if (posRef.current) {
      onCommit?.(posRef.current);
    }
  };

  // ── Mouse handlers (desktop web where touch events are unavailable) ──

  const handleMouseDown = (e: MouseEvent) => {
    posRef.current = null;
    draggingRef.current = true;
    const x = e.clientX ?? e.pageX;
    updateFromFreshRect(x);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!draggingRef.current) return;
    // Self-heal: if the user released the button outside the slider, the
    // local `mouseup` never fires. Detect via `buttons` and finalize here so
    // `draggingRef` doesn't stay stuck across unrelated future interactions.
    if (e.buttons != null && (e.buttons & 1) === 0) {
      commitCurrentPosition();
      return;
    }
    const x = e.clientX ?? e.pageX;
    updateFromX(x);
  };

  const handleMouseUp = (e: MouseEvent) => {
    const wasDragging = draggingRef.current;
    draggingRef.current = false;
    if (!wasDragging) return;
    const x = e.clientX ?? e.pageX;
    const pos = buildPosition(x);
    if (pos) {
      onUpdate?.(pos);
      onCommit?.(pos);
    } else if (posRef.current) {
      onCommit?.(posRef.current);
    }
  };

  const handleMouseCancel = () => {
    commitCurrentPosition();
  };

  const handleElementLayoutChange = (e: LayoutChangeEvent) => {
    eleWidthRef.current = e.detail.width;

    // @ts-expect-error Lynx internal UniqueID typing
    const id = e.currentTarget.uid ?? e.currentTarget.uniqueId;
    targetIdRef.current = id;

    queryRectById(id);
  };

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseCancel,
    handleElementLayoutChange,
  };
}

type UsePointerInteractionReturnValue = UsePointerInteractionReturnValueBase<
  TouchEvent,
  LayoutChangeEvent,
  MouseEvent
>;

export { usePointerInteraction };
export type {
  PointerPosition,
  UsePointerInteractionProps,
  UsePointerInteractionReturnValue,
};
