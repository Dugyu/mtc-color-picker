import { useState, useEffect, useRef, useCallback } from '@lynx-js/react';
import type { Dispatch, SetStateAction } from '@lynx-js/react';

import { useEffectEvent, noop } from './use-effect-event';
import type { Expand } from '@/types/utils';

function isUpdater<T>(v: SetStateAction<T>): v is (prev: T) => T {
  return typeof v === 'function';
}

interface UseControllabeProps<T> {
  value?: T | undefined;
  initialValue?: T | undefined;
  onChange?: (value: T) => void;
}

function useControllable<T>({
  value: controlled,
  onChange,
  initialValue,
}: UseControllabeProps<T>) {
  const [uncontrolled, setUncontrolled] = useUncontrolled({
    initialValue,
    onChange,
  });

  const isControlled = controlled !== undefined;

  const stableOnChange = useEffectEvent(onChange ?? noop);

  const current = isControlled ? controlled : uncontrolled;

  const setCurrent: Dispatch<SetStateAction<T | undefined>> = useCallback(
    (next) => {
      if (isControlled) {
        const resolved = isUpdater(next) ? next(controlled) : next;
        if (resolved !== controlled && resolved !== undefined) {
          stableOnChange(resolved);
        }
      } else {
        setUncontrolled(next);
      }
    },
    [isControlled, controlled, setUncontrolled, stableOnChange],
  );

  return [current, setCurrent] as const;
}

function useUncontrolled<T>({
  initialValue,
  onChange,
}: Expand<Omit<UseControllabeProps<T>, 'value'>>) {
  const [current, setCurrent] = useState<T | undefined>(initialValue);
  const prevRef = useRef(current);
  const stableOnChange = useEffectEvent(onChange ?? noop);

  useEffect(() => {
    if (prevRef.current !== current) {
      if (current !== undefined) {
        stableOnChange(current);
      }
      prevRef.current = current;
    }
  }, [current, stableOnChange]);

  return [current, setCurrent] as const;
}

export { useControllable, useUncontrolled };
