import { useState, useEffect, useRef, useCallback } from '@lynx-js/react';
import type { Dispatch, SetStateAction } from '@lynx-js/react';

import { useEffectEvent, noop } from './use-effect-event';

function isUpdater<T>(v: SetStateAction<T>): v is (prev: T) => T {
  return typeof v === 'function';
}

interface useControllabeProps<T> {
  value?: T | undefined;
  defaultValue?: T | undefined;
  onChange?: (value: T) => void;
}

function useControllable<T>({
  value: controlled,
  onChange,
  defaultValue,
}: useControllabeProps<T>) {
  const [uncontrolled, setUncontrolled] = useUncontrolled({
    defaultValue,
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
    [isControlled, controlled, setUncontrolled],
  );

  return [current, setCurrent] as const;
}

function useUncontrolled<T>({
  defaultValue,
  onChange,
}: Omit<useControllabeProps<T>, 'value'>) {
  const [current, setCurrent] = useState<T | undefined>(defaultValue);
  const prevRef = useRef(current);
  const stableOnChange = useEffectEvent(onChange ?? noop);

  useEffect(() => {
    if (prevRef.current !== current) {
      if (current !== undefined) {
        stableOnChange(current);
      }
      prevRef.current = current;
    }
  }, [current]);

  return [current, setCurrent] as const;
}

export { useControllable, useUncontrolled };
