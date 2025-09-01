import { useMainThreadRef, MainThreadRef } from '@lynx-js/react';

import type { Expand } from '@/types/utils';

type WriteAction<T> = T | ((prev: T) => T);

type Writer<T> = (next: WriteAction<T>) => void;
type WriterRef<T> = MainThreadRef<Writer<T> | undefined>;

type UseOwnableReturnValue<T> = {
  valueRef: MainThreadRef<T>;
  writer: Writer<T>;
  externalWriter: Writer<T>;
  initExternalWriter: () => void;
  disposeExternalWriter: () => void;
};

interface UseExternalOwnedProps<T> {
  writeValue: WriterRef<T>;
  initialValue: T;
  onChange?: (value: T) => void;
  onDerivedChange?: (value: T) => void;
}

interface UseOwnedProps<T> {
  initialValue: T;
  onChange?: (value: T) => void;
  onDerivedChange?: (value: T) => void;
}

type UseOwnableProps<T> = Expand<
  UseExternalOwnedProps<T> | (UseOwnedProps<T> & { writeValue?: never })
>;

function isUseExternalOwned<T>(
  props: UseOwnableProps<T>,
): props is UseExternalOwnedProps<T> {
  return props.writeValue != null;
}

function useOwnable<T>(props: UseOwnableProps<T>): UseOwnableReturnValue<T> {
  const { initialValue, onChange, onDerivedChange } = props;

  // Internal Single Source of Truth

  const currentRef = useMainThreadRef<T>(initialValue);

  const isExternalOwned = isUseExternalOwned(props);

  const externalWriterRef = isExternalOwned ? props.writeValue : undefined;

  const writeCurrentWithOptions = (
    next: WriteAction<T>,
    landAndDerive: boolean = true,
    notifyExternal: boolean = true,
  ) => {
    'main thread';
    const resolved = resolveNextValue(currentRef.current, next);
    if (resolved !== undefined && resolved !== currentRef.current) {
      if (landAndDerive) {
        // 1) Land into internal state
        currentRef.current = resolved;
        // 2) Fire derived/internal updates (ratios, layout, animations, etc.)
        onDerivedChange?.(resolved);
      }
      // 3) Optionally notify external listeners
      if (notifyExternal) onChange?.(resolved);
    }
  };

  /** Used by Owner */
  const writer = (next: WriteAction<T>) => {
    'main thread';
    if (isExternalOwned) {
      // Notify
      // external-owned mode
      writeCurrentWithOptions(next, false, true);
    } else {
      // Land + Derive, & Notify
      // owned mode
      writeCurrentWithOptions(next, true, true);
    }
  };

  /** Used by External Owner */
  const externalWriter = (next: WriteAction<T>) => {
    'main thread';
    // Land + Derive (no Notify)
    // external-owned mode
    writeCurrentWithOptions(next, true, false);
  };

  const initExternalWriter = () => {
    'main thread';
    if (externalWriterRef) {
      externalWriterRef.current = externalWriter;
    }
  };
  const disposeExternalWriter = () => {
    'main thread';
    if (externalWriterRef) {
      externalWriterRef.current = undefined;
    }
  };

  return {
    valueRef: currentRef,
    writer,
    externalWriter,
    initExternalWriter,
    disposeExternalWriter,
  };
}

function isUpdater<T>(v: WriteAction<T>): v is (prev: T) => T {
  'main thread';
  return typeof v === 'function';
}

function resolveNextValue<T>(current: T, next: WriteAction<T>): T {
  'main thread';
  return isUpdater(next) ? (next as (p: T) => T)(current) : next;
}

export { useOwnable, resolveNextValue };
export type {
  UseOwnableProps,
  UseOwnableReturnValue,
  UseOwnedProps,
  WriteAction,
  Writer,
  WriterRef,
};
