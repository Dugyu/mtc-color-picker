import type { ComponentProps } from '@lynx-js/react';
import type { CSSProperties } from '@lynx-js/types';

interface MaskIconProps extends Omit<ComponentProps<'view'>, 'style'> {
  style?: CSSProperties;
  /**
   * The URL of the icon image (typically a white PNG with transparent background).
   * Example: "/assets/icons/icon-white.png"
   */
  iconUrl: string;
}

export function MaskIcon({ iconUrl, style, ...otherProps }: MaskIconProps) {
  return (
    <view
      style={{
        maskImage: `url(${iconUrl})`,
        maskRepeat: 'no-repeat',
        maskSize: 'contain',
        maskPosition: 'center',
        ...style,
      }}
      {...otherProps}
    />
  );
}
