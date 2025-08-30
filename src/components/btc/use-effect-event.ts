import { useRef, useEffect, useMemo } from '@lynx-js/react';

type AnyFunction = (...args: any[]) => any;

/**
 * useEffectEvent
 *
 * Community Implementation of React's upcoming useEffectEvent hook
 * Provides a stable callback reference that always calls the latest `fn`,
 * avoiding stale closures while keeping identity stable across renders.
 * See: https://react.dev/reference/react/experimental_useEffectEvent
 *
 * - Internally stores the latest `fn` in a ref, updated via useEffect.
 * - Returns a memoized proxy function that delegates calls to `ref.current`.
 * - Useful when passing callbacks to event handlers, timers, or child
 *   components that should not re-bind on every render.
 *
 * @param fn The callback function to be stabilized.
 * @returns A stable function that always invokes the latest `fn`.
 */

function useEffectEvent<T extends AnyFunction>(fn: T): T {
  const ref = useRef(fn);

  useEffect(() => {
    ref.current = fn;
  }, [fn]);

  // useMemo is clearer here: to memoize a proxy function as a value,
  // not define an inline handler as with useCallback.
  return useMemo(() => ((...args) => ref.current(...args)) as T, []);
}

const noop = <T extends any[] = any[]>(..._args: T): void => {};

export { useEffectEvent, noop };
