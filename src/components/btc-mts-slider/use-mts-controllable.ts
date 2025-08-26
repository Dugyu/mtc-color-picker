import {
  useCallback,
  useMemo,
  useMainThreadRef,
  MainThreadRef,
} from '@lynx-js/react';

// import { useMTSEffectEvent } from './use-mts-effect-event';

type RefWriteAction<T> =
  | (T | undefined)
  | ((prev: T | undefined) => T | undefined);

function isUpdater<T>(v: RefWriteAction<T>): v is (prev: T | undefined) => T {
  'main thread';
  return typeof v === 'function';
}

type MTSWriter<T> = (next: RefWriteAction<T>) => void;
type MTSWriterRef<T> = MainThreadRef<MTSWriter<T> | undefined>;
type MTSWriterWithControls<T> = MTSWriter<T> & {
  init: () => void;
  dispose: () => void;
};

interface useMTSControllabeProps<T> {
  mtsWriteValue?: MTSWriterRef<T>;
  initialValue: T;
  onMTSChange?: (value: T) => void;
}

function useMTSControllable<T>({
  mtsWriteValue: externalWriterRef,
  initialValue,
  onMTSChange,
}: useMTSControllabeProps<T>) {
  const [currentRef, internalWriter] = useMTSUncontrolled({
    initialValue,
    onMTSChange,
  });

  const isBoundRef = useMainThreadRef(false);

  const initWriter = useCallback(() => {
    'main thread';
    if (externalWriterRef) {
      // Controlled
      externalWriterRef.current = internalWriter;
      isBoundRef.current = true;
    }
  }, [internalWriter]);

  const disposeWriter = useCallback(() => {
    'main thread';
    if (!externalWriterRef) return;
    if (externalWriterRef.current === internalWriter) {
      externalWriterRef.current = undefined;
    }
    isBoundRef.current = false;
  }, [internalWriter]);

  const writeCurrentBase = useCallback(
    (next: RefWriteAction<T | undefined>) => {
      'main thread';
      const target = externalWriterRef?.current ?? internalWriter;
      target(next);
    },
    [internalWriter],
  );

  const writeCurrent = useMemo<MTSWriterWithControls<T>>(() => {
    const fn = ((next: RefWriteAction<T | undefined>) => {
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
}: Omit<useMTSControllabeProps<T>, 'mtsWriteValue'>) {
  const currentRef = useMainThreadRef<T>(initialValue);

  // const stableOnChange = useMTSEffectEvent(onMTSChange);

  const writeCurrent = useCallback(
    (next: RefWriteAction<T | undefined>) => {
      'main thread';
      const resolved = isUpdater(next) ? next(currentRef.current) : next;
      if (resolved !== undefined) {
        if (resolved !== currentRef.current) {
          currentRef.current = resolved;
          onMTSChange?.(resolved);
          // stableOnChange(resolved);
        }
      }
    },
    [onMTSChange],
  );

  return [currentRef, writeCurrent] as const;
}

export { useMTSControllable, useMTSUncontrolled, isUpdater };
export type { RefWriteAction, MTSWriter, MTSWriterRef, MTSWriterWithControls };
