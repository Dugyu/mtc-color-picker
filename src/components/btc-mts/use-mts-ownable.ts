import {
  useCallback,
  useMemo,
  useMainThreadRef,
  MainThreadRef,
} from '@lynx-js/react';

import type { Expand } from '@/types/utils';

type WriteAction<T> = T | ((prev: T) => T);

type Writer<T> = (next: WriteAction<T>) => void;
type WriterRef<T> = MainThreadRef<Writer<T> | undefined>;

type WriterWithControls<T> = Writer<T> & {
  /** Default write: land + derive + notify */
  write: (next: WriteAction<T>) => void;
  /** Silent write: land + derive only (no external notify) */
  writeSilent: (next: WriteAction<T>) => void;
  /** Notify only: emit external change (no land, no derive) */
  notify: (next: WriteAction<T>) => void;
  /** Lifecycle hooks (no-op in owned mode) */
  init: () => void;
  dispose: () => void;
};
type WriterWithControlsRef<T> = MainThreadRef<
  WriterWithControls<T> | undefined
>;

type UseOwnableReturnValue<T> = Readonly<
  [MainThreadRef<T>, WriterWithControls<T>]
>;

type UseOwnedReturnValue<T> = Readonly<
  [MainThreadRef<T>, WriterWithControls<T>]
>;

interface UseExternalOwnedProps<T> {
  writeValue: WriterWithControlsRef<T>;
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
  const [currentRef, internalWriter] = useOwned({
    initialValue,
    onChange,
    onDerivedChange,
  });

  const isExternalOwned = isUseExternalOwned(props);
  const externalWriterRef = isExternalOwned ? props.writeValue : undefined;

  const bindExternal = useCallback(() => {
    'main thread';
    if (externalWriterRef) {
      externalWriterRef.current = internalWriter;
    }
  }, [internalWriter]);

  const unbindExternal = useCallback(() => {
    'main thread';
    if (!externalWriterRef) return;
    if (externalWriterRef.current === internalWriter) {
      externalWriterRef.current = undefined; // Only dispose if set by us (not by external logic)
    }
  }, [internalWriter]);

  const write = useCallback(
    (next: WriteAction<T>) => {
      'main thread';
      if (isExternalOwned) {
        // Default behaviour for external-owned mode: only notify
        internalWriter.notify(next);
      } else {
        internalWriter.write(next);
      }
    },
    [isExternalOwned, internalWriter],
  );

  const writeSilent = useCallback(
    (next: WriteAction<T>) => {
      'main thread';
      internalWriter.writeSilent(next);
    },
    [internalWriter],
  );

  const notify = useCallback(
    (next: WriteAction<T>) => {
      'main thread';
      internalWriter.notify(next);
    },
    [internalWriter],
  );

  /**
   * Wrap the internal writer to attach lifecycle:
   * - default callable = write
   * - writeSilent / notifyOnly delegated
   * - init/dispose bind/unbind external writer ref safely
   */

  const writeCurrent = useMemo<WriterWithControls<T>>(() => {
    const fn = ((next: WriteAction<T>) => {
      'main thread';
      write(next);
    }) as WriterWithControls<T>;
    fn.write = write;
    fn.writeSilent = writeSilent;
    fn.notify = notify;
    fn.init = bindExternal;
    fn.dispose = unbindExternal;
    return fn;
  }, [write, writeSilent, notify, bindExternal, unbindExternal]);

  return [currentRef, writeCurrent] as const;
}

function useOwned<T>({
  initialValue,
  onDerivedChange,
  onChange,
}: UseOwnedProps<T>): UseOwnedReturnValue<T> {
  const currentRef = useMainThreadRef<T>(initialValue);

  /**
   * Notify-only path:
   * - Does NOT land into internal state
   * - Does NOT trigger derived updates
   * - ONLY emits external onChange (if changed)
   */
  const notify = useCallback<Writer<T>>(
    (next) => {
      'main thread';
      const resolved = resolveNextValue(currentRef.current, next);
      if (resolved !== undefined && resolved !== currentRef.current) {
        // External Notify
        onChange?.(resolved);
      }
    },
    [onChange],
  );

  /**
   * Internal commit:
   * - Resolves next value from current
   * - Lands into internal state (single source of truth)
   * - Triggers derived/internal updates
   * - Optionally emits external onChange
   */
  const commit = useCallback(
    (next: WriteAction<T>, notifyExternal: boolean) => {
      'main thread';
      const resolved = resolveNextValue(currentRef.current, next);
      if (resolved !== undefined && resolved !== currentRef.current) {
        // 1) Land into internal state
        currentRef.current = resolved;
        // 2) Fire derived/internal updates (ratios, layout, animations, etc.)
        onDerivedChange?.(resolved);
        // 3) Optionally notify external listeners
        if (notifyExternal) onChange?.(resolved);
      }
    },
    [onChange, onDerivedChange, currentRef],
  );
  /** Write with external notification (land + derive + notify) */
  const write = useCallback<Writer<T>>(
    (n) => {
      'main thread';
      commit(n, true);
    },
    [commit],
  );

  /** Write silently (land + derive, but NO external notify) */
  const writeSilent = useCallback<Writer<T>>(
    (n) => {
      'main thread';
      commit(n, false);
    },
    [commit],
  );

  const noop = useCallback(() => {
    'main thread';
  }, []);

  /**
   * Expose a function-object:
   * - callable default = write (land + derive + notify)
   * - writeSilent = land + derive (no notify)
   * - notifyOnly = emit only (no land, no derive)
   * - init/dispose = no-op here; meaningful in the higher-level compositors
   */
  const writeCurrent = useMemo<WriterWithControls<T>>(() => {
    const fn = ((next: WriteAction<T>) => {
      'main thread';
      write(next);
    }) as WriterWithControls<T>;
    fn.write = write;
    fn.writeSilent = writeSilent;
    fn.notify = notify;
    fn.init = noop;
    fn.dispose = noop;
    return fn;
  }, [write, writeSilent, notify]);

  return [currentRef, writeCurrent] as const;
}

function isUpdater<T>(v: WriteAction<T>): v is (prev: T) => T {
  'main thread';
  return typeof v === 'function';
}

function resolveNextValue<T>(current: T, next: WriteAction<T>): T {
  'main thread';
  return isUpdater(next) ? (next as (p: T) => T)(current) : next;
}

export { useOwnable, useOwned, resolveNextValue };
export type {
  UseOwnableProps,
  UseOwnedProps,
  WriteAction,
  Writer,
  WriterRef,
  WriterWithControls,
  WriterWithControlsRef,
};
