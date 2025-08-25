import { useMainThreadRef, useEffect, useMemo } from '@lynx-js/react';

type AnyFunction = (...args: any[]) => any;

function useMTSEffectEvent<T extends AnyFunction>(fn: T): T {
  const ref = useMainThreadRef(fn);

  useEffect(() => {
    'main thread';
    ref.current = fn;
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
