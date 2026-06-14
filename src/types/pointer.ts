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

type UsePointerInteractionReturnValueBase<TTouch, TLayout, TMouse = unknown> = {
  /** Bind on CONTAINER (or ELEMENT if container === element): <view bindtouchstart={handlePointerDown} /> */
  handlePointerDown: (e: TTouch) => void;
  /** Bind on CONTAINER (or ELEMENT if container === element): <view bindtouchmove={handlePointerMove} /> */
  handlePointerMove: (e: TTouch) => void;
  /** Bind on CONTAINER (or ELEMENT if container===element): <view bindtouchend|bindtouchcancel={handlePointerUp} /> */
  handlePointerUp: (e: TTouch) => void;
  /** Bind on ELEMENT: <view bindlayoutchange={handleElementLayoutChange} /> */
  handleElementLayoutChange: (e: TLayout) => void;
  /** Web compat: <view bindmousedown={handleMouseDown} /> */
  handleMouseDown: (e: TMouse) => void;
  /** Web compat: <view bindmousemove={handleMouseMove} /> */
  handleMouseMove: (e: TMouse) => void;
  /** Web compat: <view bindmouseup={handleMouseUp} /> */
  handleMouseUp: (e: TMouse) => void;
  /** Web compat: <view global-bindmouseup={handleMouseCancel} /> */
  handleMouseCancel: () => void;
};

export type {
  PointerPosition,
  UsePointerInteractionProps,
  UsePointerInteractionReturnValueBase,
};
