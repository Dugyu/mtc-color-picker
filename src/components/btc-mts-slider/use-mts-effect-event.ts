import {
  useMainThreadRef,
  useEffect,
  // useMemo,
  runOnMainThread,
  useCallback,
} from '@lynx-js/react';

type AnyFunction = (...args: any[]) => any;

function useMTSEffectEvent<T extends AnyFunction>(fn: T | undefined): T {
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
  /*   return useMemo(
    () =>
      ((...args) => {
        'main thread';
        if (ref.current && typeof ref.current === 'function') {
          ref.current(...args);
        }
      }) as T,
    [],
  ); */

  return useCallback(
    ((...args) => {
      'main thread';
      if (ref.current && typeof ref.current === 'function') {
        ref.current(...args);
      }
    }) as T,
    [],
  );
}

export { useMTSEffectEvent };
