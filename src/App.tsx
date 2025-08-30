import { useMemo } from '@lynx-js/react';
import type { ReactNode } from '@lynx-js/react';
import logoUrl from '@/assets/icons/lynx-logo-knockout.png';
import { MaskIcon } from '@/components/shared/MaskIcon';

import './App.css';

export interface AppLayoutProps {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  /** Hue (0–360) */
  h?: number;
  /** Saturation (0–100) */
  s?: number;
  /** Lightness (0–100) */
  l?: number;
}
export function AppLayout({
  title = 'Demo',
  subtitle,
  children,
  h,
  s,
  l,
}: AppLayoutProps) {
  const color: string | null = useMemo(() => {
    if (h == null || s == null || l == null) return null;
    if (h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100) return null;
    return `hsl(${h}, ${s}%, ${l}%)`;
  }, [h, s, l]);

  return (
    <page className={`dark flex-col items-center bg-base-1`}>
      <view
        className={`absolute w-full h-20 flex-col justify-end items-center ${subtitle ? 'bottom-[calc(33.33%+336px)]' : 'bottom-[calc(33.33%+372px)]'}`}
      >
        <text className="text-content text-3xl">{title}</text>
        {subtitle && (
          <text className="text-content text-2xl opacity-60">{subtitle}</text>
        )}
      </view>
      {/* ColorDisplay */}
      <MaskIcon
        iconUrl={logoUrl}
        className="absolute bottom-1/3 rounded-full size-72 bg-content"
        style={color ? { backgroundColor: color } : undefined}
      />
      {/* BottomSheet */}
      <view className="absolute bottom-0 w-full h-[calc(33.33%+24px)] p-4 flex-col items-center bg-base-4 rounded-t-lg shadow-xl">
        {children}
      </view>
    </page>
  );
}
