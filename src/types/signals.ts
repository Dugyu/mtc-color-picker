import { signal, computed } from '@lynx-js/react/signals';

type ReadonlySignal<T> = ReturnType<typeof computed<T>>;
type Signal<T> = ReturnType<typeof signal<T>>;

export type { Signal, ReadonlySignal };
