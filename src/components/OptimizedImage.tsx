import { cn } from '@/lib/utils';

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

const SUPABASE_STORAGE_HOST = 'yglewlxfbkbdndnyhetj.supabase.co';

const WIDTHS = [320, 640, 960, 1200, 1600];

/**
 * Rewrites a Supabase Storage public URL to use the image transformation API.
 * Returns null if the URL is not a Supabase storage URL.
 */
function getTransformUrl(src: string, width: number, format: 'webp' | 'origin' = 'webp'): string | null {
  if (!src.includes(SUPABASE_STORAGE_HOST) || !src.includes('/storage/v1/object/public/')) return null;
  // Replace /object/public/ with /render/image/public/ and add query params
  const transformed = src.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
  const sep = transformed.includes('?') ? '&' : '?';
  return `${transformed}${sep}width=${width}&format=${format}`;
}

function buildSrcSet(src: string, maxWidth: number): string | undefined {
  const urls: string[] = [];
  for (const w of WIDTHS) {
    if (w > maxWidth) break;
    const url = getTransformUrl(src, w);
    if (url) urls.push(`${url} ${w}w`);
  }
  // Always include maxWidth
  const maxUrl = getTransformUrl(src, maxWidth);
  if (maxUrl) urls.push(`${maxUrl} ${maxWidth}w`);

  return urls.length > 0 ? urls.join(', ') : undefined;
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
  const srcSet = buildSrcSet(src, maxWidth);
  // For the default src, serve a mid-size WebP if possible
  const defaultSrc = getTransformUrl(src, Math.min(960, maxWidth)) || src;

  return (
    <img
      src={defaultSrc}
      srcSet={srcSet}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : undefined}
      sizes={sizes}
      className={cn('max-w-full', className)}
      style={{ maxWidth: `${maxWidth}px`, ...style }}
      {...props}
    />
  );
};

export default OptimizedImage;
