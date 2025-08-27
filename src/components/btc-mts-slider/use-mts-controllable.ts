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
  init: () => void;
  dispose: () => void;
};

interface UseMTSControlledProps<T> {
  mtsWriteValue: MTSWriterRef<T>;
  initialValue: T;
  onMTSChange?: (value: T) => void;
}

interface UseMTSUncontrolledProps<T> {
  initialValue: T;
  onMTSChange?: (value: T) => void;
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

function useMTSControllable<T>(props: UseMTSControllabeProps<T>) {
  const { initialValue, onMTSChange } = props;

  // Internal Single Source of Truth
  const [currentRef, internalWriter] = useMTSUncontrolled({
    initialValue,
    onMTSChange,
  });

  const isControlled = isUseMTSControlled(props);
  const externalWriterRef = isControlled ? props.mtsWriteValue : undefined;

  const notifier = useCallback<MTSWriter<T>>(
    (next) => {
      'main thread';
      const resolved = resolveNextValue(currentRef.current, next);
      if (resolved !== undefined && resolved !== currentRef.current) {
        onMTSChange?.(resolved);
      }
    },
    [onMTSChange],
  );

  const externalWriter = useCallback<MTSWriter<T>>(
    (next) => {
      'main thread';
      internalWriter(next);
    },
    [internalWriter],
  );

  const initWriter = useCallback(() => {
    'main thread';
    if (externalWriterRef) {
      externalWriterRef.current = externalWriter;
    }
  }, [externalWriter]);

  const disposeWriter = useCallback(() => {
    'main thread';
    if (!externalWriterRef) return;
    if (externalWriterRef.current === externalWriter) {
      // Only dispose if it is set by *our* initWriter, not by some other logic
      externalWriterRef.current = undefined;
    }
  }, [externalWriter]);

  const writeCurrentBase = useCallback<MTSWriter<T>>(
    (next) => {
      'main thread';
      console.log('isControlled :', isControlled);
      const target = isControlled ? notifier : internalWriter;
      target(next);
    },
    [isControlled, notifier, internalWriter],
  );

  const writeCurrent = useMemo<MTSWriterWithControls<T>>(() => {
    const fn = ((next: RefWriteAction<T>) => {
      'main thread';
      writeCurrentBase(next);
    }) as MTSWriterWithControls<T>;
    fn.init = initWriter;
    fn.dispose = disposeWriter;
    return fn;
  }, [writeCurrentBase, initWriter, disposeWriter]);

  return [currentRef, writeCurrent] as const;
}

function useMTSUncontrolled<T>({
  initialValue,
  onMTSChange,
}: UseMTSUncontrolledProps<T>) {
  const currentRef = useMainThreadRef<T>(initialValue);

  // const stableOnChange = useMTSEffectEvent(onMTSChange);

  const writeCurrent = useCallback<MTSWriter<T>>(
    (next) => {
      'main thread';
      const resolved = resolveNextValue(currentRef.current, next);
      if (resolved !== undefined && resolved !== currentRef.current) {
        // Update Internals
        currentRef.current = resolved;
        // Notify
        onMTSChange?.(resolved);
        // stableOnChange(resolved);
      }
    },
    [onMTSChange],
  );

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
};
