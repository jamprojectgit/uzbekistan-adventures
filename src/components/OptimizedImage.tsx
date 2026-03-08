import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  /** Above-the-fold image — sets eager loading + high priority */
  priority?: boolean;
  /** Responsive sizes hint, e.g. "(max-width: 768px) 100vw, 50vw" */
  sizes?: string;
  /** Max width to cap the image at (default 1920) */
  maxWidth?: number;
}

/** Supabase Storage base to detect transformable URLs */
const SUPABASE_STORAGE_RE = /^(https:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\/public\/)(.+)$/;

/** Standard responsive breakpoints */
const SRCSET_WIDTHS = [320, 640, 960, 1280, 1920];

/**
 * Build a srcSet using Supabase Image Transformation API.
 * Appends ?width=X&format=webp to storage URLs for on-the-fly resizing.
 */
function buildSrcSet(src: string, maxWidth: number): string | undefined {
  const match = src.match(SUPABASE_STORAGE_RE);
  if (!match) return undefined;

  const [, base, path] = match;
  // Use render/image endpoint for transforms
  const transformBase = base.replace('/object/public/', '/render/image/public/');

  return SRCSET_WIDTHS
    .filter(w => w <= maxWidth)
    .map(w => `${transformBase}${path}?width=${w}&resize=contain&format=webp ${w}w`)
    .join(', ');
}

const OptimizedImage = ({
  src,
  alt,
  priority = false,
  sizes = '100vw',
  maxWidth = 1920,
  className,
  style,
  ...props
}: OptimizedImageProps) => {
  const srcSet = useMemo(() => buildSrcSet(src, maxWidth), [src, maxWidth]);

  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : undefined}
      srcSet={srcSet}
      sizes={sizes}
      className={cn('max-w-full', className)}
      style={{ maxWidth: `${maxWidth}px`, ...style }}
      {...props}
    />
  );
};

export default OptimizedImage;
