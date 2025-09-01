import type { Expand, OmitKeys } from './utils';

type StyledSliderPropsBase<
  P extends object = {},
  SK extends string = 'trackStyle' | 'rootStyle',
> = OmitKeys<P, 'min' | 'max' | 'step' | SK>;

type HSLValue<T> = {
  h?: T;
  s?: T;
  l?: T;
};

type HSLSliderPropsBase<
  S,
  V,
  T extends keyof HSLValue<V>,
  K extends keyof HSLValue<V>,
> = Expand<S & Pick<HSLValue<V>, T | K>>;

export type { StyledSliderPropsBase, HSLSliderPropsBase };
