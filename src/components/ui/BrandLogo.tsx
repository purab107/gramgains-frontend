import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export type BrandLogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;

export interface BrandLogoProps {
  size?: BrandLogoSize;
  showWordmark?: boolean;
  showSubtitle?: boolean;
  subtitle?: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  href?: string;
}

const SIZE_MAP: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl', number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
  '2xl': 80,
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showWordmark = false,
  showSubtitle = false,
  subtitle = 'Macro & Calorie Tracker',
  className,
  imageClassName,
  priority = false,
  href,
}) => {
  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size] || 40;

  const content = (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'relative flex items-center justify-center shrink-0',
          imageClassName
        )}
        style={{ width: pixelSize, height: pixelSize }}
      >
        <Image
          src="/images/logo-bg-remove.png"
          alt="GramGains Logo"
          width={pixelSize}
          height={pixelSize}
          priority={priority}
          className="w-full h-full object-contain select-none drop-shadow-sm"
        />
      </div>

      {showWordmark && (
        <div className="flex flex-col justify-center leading-none">
          <span
            className={cn(
              'font-bold tracking-tight text-foreground',
              pixelSize >= 48 ? 'text-2xl' : pixelSize >= 36 ? 'text-lg' : 'text-base'
            )}
          >
            GramGains
          </span>
          {showSubtitle && (
            <span className="text-[11px] text-muted-foreground mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
};
