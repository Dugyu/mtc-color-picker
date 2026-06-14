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
 *
 * Web/native unified coords:
 * - Touch on Lynx Web: `touches[0].clientX` is populated.
 * - Touch on native: falls back to `e.detail.x`.
 * - Desktop web has no touch events; `bindmouse{down,move,up}` handlers cover it.
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

  const isWebPlatformRef = useRef<boolean>(
    (SystemInfo.platform as string) === 'web',
  );

  /**
   * Extract the X coordinate from a touch event.
   * Prefers `clientX` (Lynx Web populates it), falls back to Lynx `detail.x`.
   */
  function pickCoord(e: MainThread.TouchEvent): number | null {
    if (!isWebPlatformRef.current) {
      return e.detail?.x ?? null;
    }

    const t = e.touches?.[0] ?? e.changedTouches?.[0];
    const cx = (t as unknown as { clientX?: number } | undefined)?.clientX;
    if (cx != null) return cx;
    return e.detail?.x ?? null;
  }

  function buildPosition(x: number | null): PointerPosition | null {
    if (x === null) return null;
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

  function updateFromX(x: number) {
    const pos = buildPosition(x);
    if (pos) {
      onUpdate?.(pos);
    }
  }

  function commitCurrentPosition() {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (posRef.current) {
      onCommit?.(posRef.current);
    }
  }

  // ── Touch handlers (native + web touch devices) ──

  function handlePointerDown(e: MainThread.TouchEvent) {
    // Clear the prior gesture's snapshot so a fallback commit from this
    // gesture can never re-emit the previous gesture's position.
    posRef.current = null;
    draggingRef.current = true;
    const x = pickCoord(e);
    if (x === null) return;
    updateFromX(x);
  }

  function handlePointerMove(e: MainThread.TouchEvent) {
    if (!draggingRef.current) return;
    const x = pickCoord(e);
    if (x === null) return;
    updateFromX(x);
  }

  function handlePointerUp(e: MainThread.TouchEvent) {
    draggingRef.current = false;
    const x = pickCoord(e);
    const pos = x === null ? null : buildPosition(x);
    if (pos) {
      onUpdate?.(pos);
      onCommit?.(pos);
    } else if (posRef.current) {
      onCommit?.(posRef.current);
    }
  }

  // ── Mouse handlers (desktop web where touch events are unavailable) ──

  function handleMouseDown(e: MainThread.MouseEvent) {
    posRef.current = null;
    draggingRef.current = true;
    const x = e.clientX ?? e.pageX;
    updateFromX(x);
  }

  function handleMouseMove(e: MainThread.MouseEvent) {
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
  }

  function handleMouseUp(e: MainThread.MouseEvent) {
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
  }

  function handleMouseCancel() {
    commitCurrentPosition();
  }

  function handleElementLayoutChange(e: MainThread.LayoutChangeEvent) {
    eleWidthRef.current = e.detail.width;

    // Screen-relative on native, viewport-relative on Lynx Web — matches
    // the coord source (`detail.x` / `clientX`) on each platform.
    e.currentTarget
      .invoke('boundingClientRect', { relativeTo: 'screen' })
      .then((rect: { left: number }) => {
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
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseCancel,
    handleElementLayoutChange,
  };
}

type UsePointerInteractionReturnValue = UsePointerInteractionReturnValueBase<
  MainThread.TouchEvent,
  MainThread.LayoutChangeEvent,
  MainThread.MouseEvent
>;

export { usePointerInteraction };
export type { PointerPosition, UsePointerInteractionReturnValue };
