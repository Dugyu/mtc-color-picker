export type Expand<T> = {
  [K in keyof T]: T[K];
} & {};

export type Modify<T, R> = Omit<T, keyof R> & R;

export type RenameKeys<T, Map extends Record<string, PropertyKey>> = Omit<
  T,
  keyof Map
> & { [K in keyof Map as Map[K]]: K extends keyof T ? T[K] : never };

export type OmitKeys<P, K extends PropertyKey> = Omit<P, Extract<K, keyof P>>;
