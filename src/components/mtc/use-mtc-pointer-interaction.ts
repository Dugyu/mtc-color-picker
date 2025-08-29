'main thread';
import { useRef } from '@lynx-js/react';
import type { MainThread } from '@lynx-js/types';

interface PointerPosition {
  offset: number;
  offsetRatio: number;
  elementWidth: number;
}

interface UseMTCPointerInteractionProps {
  onMTCUpdate?: (pos: PointerPosition) => void;
  onMTCCommit?: (pos: PointerPosition) => void;
}

function useMTCPointerInteraction({
  onMTCUpdate,
  onMTCCommit,
}: UseMTCPointerInteractionProps = {}) {
  /** Element (coordinate frame) metrics */
  const elementLeftRef = useRef<number | null>(null);
  const elementWidthRef = useRef(0);

  /** Last computed pointer position snapshot */
  const posRef = useRef<PointerPosition | null>(null);

  const draggingRef = useRef(false);

  function buildPosition(x: number): PointerPosition | null {
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
  }

  function onPointerDown(e: MainThread.TouchEvent) {
    draggingRef.current = true;
    buildPosition(e.detail.x);
    if (posRef.current) {
      onMTCUpdate?.(posRef.current);
    }
  }

  function onPointerMove(e: MainThread.TouchEvent) {
    if (!draggingRef.current) return;
    buildPosition(e.detail.x);
    if (posRef.current) {
      onMTCUpdate?.(posRef.current);
    }
  }

  function onPointerUp(e: MainThread.TouchEvent) {
    draggingRef.current = false;
    buildPosition(e.detail.x);
    if (posRef.current) {
      onMTCCommit?.(posRef.current);
    }
  }

  async function onElementLayoutChange(e: MainThread.LayoutChangeEvent) {
    elementWidthRef.current = e.detail.width;
    const rect: { left: number } =
      await e.currentTarget.invoke('boundingClientRect');
    elementLeftRef.current = rect.left;
  }

  return {
    onMTCPointerDown: onPointerDown,
    onMTCPointerMove: onPointerMove,
    onMTCPointerUp: onPointerUp,
    onMTCElementLayoutChange: onElementLayoutChange,
  };
}

interface UseMTCPointerInteractionReturnValue {
  onMTCPointerDown: (e: MainThread.TouchEvent) => void;
  onMTCPointerMove: (e: MainThread.TouchEvent) => void;
  onMTCPointerUp: (e: MainThread.TouchEvent) => void;
  onMTCElementLayoutChange: (e: MainThread.LayoutChangeEvent) => Promise<void>;
}

export { useMTCPointerInteraction };
export type {
  PointerPosition,
  UseMTCPointerInteractionProps,
  UseMTCPointerInteractionReturnValue,
};
