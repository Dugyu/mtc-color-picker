import {
  useMainThreadRef,
  useEffect,
  useMemo,
  runOnMainThread,
} from '@lynx-js/react';

type AnyFunction = (...args: any[]) => any;

function useMTSEffectEvent<T extends AnyFunction>(fn: T): T {
  const ref = useMainThreadRef(fn);

  useEffect(() => {
    let active = true;
    async function updateRef() {
      await runOnMainThread(() => {
        'main thread';
        if (active) ref.current = fn;
      });
    }
    updateRef();
    return () => {
      active = false;
    };
  }, [fn]);

  // https://github.com/facebook/react/issues/19240
  return useMemo(
    () =>
      ((...args) => {
        'main thread';
        ref.current(...args);
      }) as T,
    [],
  );
}

const mtsNoop = <T extends any[] = any[]>(..._args: T): void => {
  'main thread';
};

export { useMTSEffectEvent, mtsNoop };
