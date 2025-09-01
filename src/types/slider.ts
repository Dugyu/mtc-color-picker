import type { Expand } from '@/types/utils';

type SliderCoreProps = {
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
};

type ResolvedSliderCore = Readonly<{
  min: number;
  max: number;
  step: number;
  disabled: boolean;
}>;

type UseSliderPropsBase<TExtra = {}> = Expand<
  SliderCoreProps & {
    initialValue?: number;
    onChange?: (value: number) => void;
  } & TExtra
>;

type SliderReturnValueState = {
  value: number;
  ratio: number;
};

type UseSliderReturnValueBase<
  TPointerReturnValue,
  TSliderReturnValue = SliderReturnValueState,
> = Expand<TPointerReturnValue & TSliderReturnValue & ResolvedSliderCore>;

export type {
  SliderCoreProps,
  ResolvedSliderCore,
  UseSliderPropsBase,
  UseSliderReturnValueBase,
};
