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
 *
 * Web/native unified coords:
 * - Touch on Lynx Web: `touches[0].clientX` is populated.
 * - Touch on native: falls back to `e.detail.x`.
 * - Desktop web has no touch events; `bindmouse{down,move,up}` handlers cover it.
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

  const isWebPlatformRef = useMainThreadRef<boolean>(
    (SystemInfo.platform as string) === 'web',
  );

  /**
   * Extract the X coordinate from a touch event.
   * Prefers `clientX` (Lynx Web populates it), falls back to Lynx `detail.x`.
   */
  const pickCoord = (e: MainThread.TouchEvent): number | null => {
    'main thread';
    if (!isWebPlatformRef.current) {
      return e.detail?.x ?? null;
    }

    const t = e.touches?.[0] ?? e.changedTouches?.[0];
    const cx = (t as unknown as { clientX?: number } | undefined)?.clientX;
    if (cx != null) return cx;
    return e.detail?.x ?? null;
  };

  const buildPosition = (x: number | null): PointerPosition | null => {
    'main thread';
    if (x === null) return null;
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

  const updateFromX = (x: number) => {
    'main thread';
    const pos = buildPosition(x);
    if (pos) {
      onUpdate?.(pos);
    }
  };

  const commitCurrentPosition = () => {
    'main thread';
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (posRef.current) {
      onCommit?.(posRef.current);
    }
  };

  // ── Touch handlers (native + web touch devices) ──

  const handlePointerDown = (e: MainThread.TouchEvent) => {
    'main thread';
    // Clear the prior gesture's snapshot so a fallback commit from this
    // gesture can never re-emit the previous gesture's position.
    posRef.current = null;
    draggingRef.current = true;
    const x = pickCoord(e);
    if (x === null) return;
    updateFromX(x);
  };

  const handlePointerMove = (e: MainThread.TouchEvent) => {
    'main thread';
    if (!draggingRef.current) return;
    const x = pickCoord(e);
    if (x === null) return;
    updateFromX(x);
  };

  const handlePointerUp = (e: MainThread.TouchEvent) => {
    'main thread';
    draggingRef.current = false;
    const x = pickCoord(e);
    const pos = x === null ? null : buildPosition(x);
    if (pos) {
      onCommit?.(pos);
    } else if (posRef.current) {
      onCommit?.(posRef.current);
    }
  };

  // ── Mouse handlers (desktop web where touch events are unavailable) ──

  const handleMouseDown = (e: MainThread.MouseEvent) => {
    'main thread';
    posRef.current = null;
    draggingRef.current = true;
    const x = e.clientX ?? e.pageX;
    updateFromX(x);
  };

  const handleMouseMove = (e: MainThread.MouseEvent) => {
    'main thread';
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

  const handleMouseUp = (e: MainThread.MouseEvent) => {
    'main thread';
    const wasDragging = draggingRef.current;
    draggingRef.current = false;
    if (!wasDragging) return;
    const x = e.clientX ?? e.pageX;
    const pos = buildPosition(x);
    if (pos) {
      onCommit?.(pos);
    } else if (posRef.current) {
      onCommit?.(posRef.current);
    }
  };

  const handleMouseCancel = () => {
    'main thread';
    commitCurrentPosition();
  };

  const handleElementLayoutChange = async (
    e: MainThread.LayoutChangeEvent,
  ) => {
    'main thread';
    elementWidthRef.current = e.detail.width;
    // Screen-relative on native, viewport-relative on Lynx Web — matches
    // the coord source (`detail.x` / `clientX`) on each platform.
    const rect: { left: number } = await e.currentTarget.invoke(
      'boundingClientRect',
      { relativeTo: 'screen' },
    );
    elementLeftRef.current = rect.left;
  };

  return {
    handlePointerDown: handlePointerDown,
    handlePointerMove: handlePointerMove,
    handlePointerUp: handlePointerUp,
    handleMouseDown: handleMouseDown,
    handleMouseMove: handleMouseMove,
    handleMouseUp: handleMouseUp,
    handleMouseCancel: handleMouseCancel,
    handleElementLayoutChange: handleElementLayoutChange,
  };
}

type UsePointerInteractionReturnValue = UsePointerInteractionReturnValueBase<
  MainThread.TouchEvent,
  MainThread.LayoutChangeEvent,
  MainThread.MouseEvent
>;

export { usePointerInteraction };
export type { PointerPosition, UsePointerInteractionReturnValue };
