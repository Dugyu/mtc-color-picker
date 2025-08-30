import { useRef, useEffect, useMemo } from '@lynx-js/react';

type AnyFunction = (...args: any[]) => any;

function useEffectEvent<T extends AnyFunction>(fn: T): T {
  const ref = useRef(fn);

  useEffect(() => {
    ref.current = fn;
  }, [fn]);

  // https://github.com/facebook/react/issues/19240
  return useMemo(() => ((...args) => ref.current(...args)) as T, []);
}

const noop = <T extends any[] = any[]>(..._args: T): void => {};

export { useEffectEvent, noop };
