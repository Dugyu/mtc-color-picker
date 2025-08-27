import {
  useCallback,
  useMemo,
  useMainThreadRef,
  MainThreadRef,
} from '@lynx-js/react';

// import { useMTSEffectEvent } from './use-mts-effect-event';

type RefWriteAction<T> = T | ((prev: T) => T);

function isUpdater<T>(v: RefWriteAction<T>): v is (prev: T) => T {
  'main thread';
  return typeof v === 'function';
}

type MTSWriter<T> = (next: RefWriteAction<T>) => void;
type MTSWriterRef<T> = MainThreadRef<MTSWriter<T> | undefined>;

type MTSWriterWithControls<T> = MTSWriter<T> & {
  /** Default write: land + derive + notify */
  write: (next: RefWriteAction<T>) => void;
  /** Silent write: land + derive only (no external notify) */
  writeSilent: (next: RefWriteAction<T>) => void;
  /** Notify only: emit external change (no land, no derive) */
  notify: (next: RefWriteAction<T>) => void;
  /** Lifecycle hooks (no-op in uncontrolled mode) */
  init: () => void;
  dispose: () => void;
};
type MTSWriterWithControlsRef<T> = MainThreadRef<
  MTSWriterWithControls<T> | undefined
>;

type UseMTSControllableReturnValue<T> = Readonly<
  [MainThreadRef<T>, MTSWriterWithControls<T>]
>;

type UseMTSUncontrolledReturnValue<T> = Readonly<
  [MainThreadRef<T>, MTSWriterWithControls<T>]
>;

interface UseMTSControlledProps<T> {
  mtsWriteValue: MTSWriterWithControlsRef<T>;
  initialValue: T;
  onMTSChange?: (value: T) => void;
  onMTSDerivedChange?: (value: T) => void;
}

interface UseMTSUncontrolledProps<T> {
  initialValue: T;
  onMTSChange?: (value: T) => void;
  onMTSDerivedChange?: (value: T) => void;
}

type ShallowExpand<T> = {
  [K in keyof T]: T[K];
} & {};

type UseMTSControllabeProps<T> = ShallowExpand<
  | UseMTSControlledProps<T>
  | (UseMTSUncontrolledProps<T> & { mtsWriteValue?: never })
>;

function isUseMTSControlled<T>(
  props: UseMTSControllabeProps<T>,
): props is UseMTSControlledProps<T> {
  return 'mtsWriteValue' in props;
}

function useMTSControllable<T>(
  props: UseMTSControllabeProps<T>,
): UseMTSControllableReturnValue<T> {
  const { initialValue, onMTSChange, onMTSDerivedChange } = props;

  // Internal Single Source of Truth
  const [currentRef, internalWriter] = useMTSUncontrolled({
    initialValue,
    onMTSChange,
    onMTSDerivedChange,
  });

  const isControlled = isUseMTSControlled(props);
  const externalWriterRef = isControlled ? props.mtsWriteValue : undefined;

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
    (next: RefWriteAction<T>) => {
      'main thread';
      if (isControlled) {
        // Default behaviour for controlled mode: only notify
        internalWriter.notify(next);
      } else {
        internalWriter.write(next);
      }
    },
    [isControlled, internalWriter],
  );

  const writeSilent = useCallback(
    (next: RefWriteAction<T>) => {
      'main thread';
      internalWriter.writeSilent(next);
    },
    [internalWriter],
  );

  const notify = useCallback(
    (next: RefWriteAction<T>) => {
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

  const writeCurrent = useMemo<MTSWriterWithControls<T>>(() => {
    const fn = ((next: RefWriteAction<T>) => {
      'main thread';
      write(next);
    }) as MTSWriterWithControls<T>;
    fn.write = write;
    fn.writeSilent = writeSilent;
    fn.notify = notify;
    fn.init = bindExternal;
    fn.dispose = unbindExternal;
    return fn;
  }, [write, writeSilent, notify, bindExternal, unbindExternal]);

  return [currentRef, writeCurrent] as const;
}

function useMTSUncontrolled<T>({
  initialValue,
  onMTSDerivedChange,
  onMTSChange,
}: UseMTSUncontrolledProps<T>): UseMTSUncontrolledReturnValue<T> {
  const currentRef = useMainThreadRef<T>(initialValue);

  /**
   * Notify-only path:
   * - Does NOT land into internal state
   * - Does NOT trigger derived updates
   * - ONLY emits external onMTSChange (if changed)
   */
  const notify = useCallback<MTSWriter<T>>(
    (next) => {
      'main thread';
      const resolved = resolveNextValue(currentRef.current, next);
      if (resolved !== undefined && resolved !== currentRef.current) {
        // External Notify
        onMTSChange?.(resolved);
      }
    },
    [onMTSChange],
  );

  /**
   * Internal commit:
   * - Resolves next value from current
   * - Lands into internal state (single source of truth)
   * - Triggers derived/internal updates
   * - Optionally emits external onMTSChange
   */
  const commit = useCallback(
    (next: RefWriteAction<T>, notifyExternal: boolean) => {
      'main thread';
      const resolved = resolveNextValue(currentRef.current, next);
      if (resolved !== undefined && resolved !== currentRef.current) {
        // 1) Land into internal state
        currentRef.current = resolved;
        // 2) Fire derived/internal updates (ratios, layout, animations, etc.)
        onMTSDerivedChange?.(resolved);
        // 3) Optionally notify external listeners
        if (notifyExternal) onMTSChange?.(resolved);
      }
    },
    [onMTSChange, onMTSDerivedChange, currentRef],
  );
  /** Write with external notification (land + derive + notify) */
  const write = useCallback<MTSWriter<T>>(
    (n) => {
      'main thread';
      commit(n, true);
    },
    [commit],
  );

  /** Write silently (land + derive, but NO external notify) */
  const writeSilent = useCallback<MTSWriter<T>>(
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
  const writeCurrent = useMemo<MTSWriterWithControls<T>>(() => {
    const fn = ((next: RefWriteAction<T>) => {
      'main thread';
      write(next);
    }) as MTSWriterWithControls<T>;
    fn.write = write;
    fn.writeSilent = writeSilent;
    fn.notify = notify;
    fn.init = noop;
    fn.dispose = noop;
    return fn;
  }, [write, writeSilent, notify]);

  return [currentRef, writeCurrent] as const;
}

function resolveNextValue<T>(current: T, next: RefWriteAction<T>): T {
  'main thread';
  return isUpdater(next) ? (next as (p: T) => T)(current) : next;
}

export {
  useMTSControllable,
  useMTSUncontrolled,
  resolveNextValue,
  isUseMTSControlled,
};
export type {
  UseMTSControllabeProps,
  UseMTSUncontrolledProps,
  RefWriteAction,
  MTSWriter,
  MTSWriterRef,
  MTSWriterWithControls,
  MTSWriterWithControlsRef,
};
