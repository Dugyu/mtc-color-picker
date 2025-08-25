import {
  useCallback,
  useMemo,
  useMainThreadRef,
  MainThreadRef,
} from '@lynx-js/react';

import { useMTSEffectEvent, mtsNoop } from './use-mts-effect-event';

type RefWriteAction<T> =
  | (T | undefined)
  | ((prev: T | undefined) => T | undefined);

function isUpdater<T>(v: RefWriteAction<T>): v is (prev: T | undefined) => T {
  'main thread';
  return typeof v === 'function';
}

type MTSSetter<T> = (next: RefWriteAction<T | undefined>) => void;
type MTSSetterRef<T> = MainThreadRef<MTSSetter<T> | undefined>;
type MTSSetterWithControls<T> = MTSSetter<T> & {
  init: () => void;
  dispose: () => void;
};

interface useMTSControllabeProps<T> {
  mtsSetValue?: MTSSetterRef<T>;
  initialValue: T;
  onMTSChange?: (value: T) => void;
}

function useMTSControllable<T>({
  mtsSetValue: externalSetterRef,
  initialValue,
  onMTSChange,
}: useMTSControllabeProps<T>) {
  const [currentRef, internalSetter] = useMTSUncontrolled({
    initialValue,
    onMTSChange,
  });

  const isBoundRef = useMainThreadRef(false);

  const initSetCurrent = useCallback(() => {
    'main thread';
    if (externalSetterRef) {
      // Controlled
      externalSetterRef.current = internalSetter;
      isBoundRef.current = true;
    }
  }, [internalSetter]);

  const disposeSetCurrent = useCallback(() => {
    'main thread';
    if (!externalSetterRef) return;
    if (externalSetterRef.current === internalSetter) {
      externalSetterRef.current = undefined;
    }
    isBoundRef.current = false;
  }, [internalSetter]);

  const setCurrentBase = useCallback(
    (next: RefWriteAction<T | undefined>) => {
      'main thread';
      const target = externalSetterRef?.current ?? internalSetter;
      target(next);
    },
    [internalSetter],
  );

  const setCurrent = useMemo<MTSSetterWithControls<T>>(() => {
    const fn = ((next: RefWriteAction<T | undefined>) => {
      'main thread';
      setCurrentBase(next);
    }) as MTSSetterWithControls<T>;
    fn.init = initSetCurrent;
    fn.dispose = disposeSetCurrent;
    return fn;
  }, [setCurrentBase, initSetCurrent, disposeSetCurrent]);

  return [currentRef, setCurrent] as const;
}

function useMTSUncontrolled<T>({
  initialValue,
  onMTSChange,
}: Omit<useMTSControllabeProps<T>, 'mtsSetValue'>) {
  const currentRef = useMainThreadRef<T>(initialValue);

  const stableOnChange = useMTSEffectEvent(onMTSChange ?? mtsNoop);

  const setCurrent = useCallback((next: RefWriteAction<T | undefined>) => {
    'main thread';
    const resolved = isUpdater(next) ? next(currentRef.current) : next;
    if (resolved !== currentRef.current && resolved !== undefined) {
      currentRef.current = resolved;
      stableOnChange(resolved);
    }
  }, []);

  return [currentRef, setCurrent] as const;
}

export { useMTSControllable, useMTSUncontrolled };
export type { RefWriteAction, MTSSetter, MTSSetterRef, MTSSetterWithControls };
