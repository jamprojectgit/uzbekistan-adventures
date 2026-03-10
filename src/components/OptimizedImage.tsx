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

const BREAKPOINTS = [400, 800, 1200, 1600];
const SUPABASE_STORAGE_HOST = 'yckbiauwtyrozzxatxjb.supabase.co/storage/v1';

function isSupabaseStorageUrl(src: string): boolean {
  return src.includes(SUPABASE_STORAGE_HOST);
}

function buildTransformUrl(src: string, width: number): string {
  // Convert /object/public/ to /render/image/public/ with width & format params
  const base = src.replace('/object/public/', '/render/image/public/');
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}width=${width}&format=webp`;
}

function buildSrcSet(src: string, maxWidth: number): string | undefined {
  if (!isSupabaseStorageUrl(src)) return undefined;
  return BREAKPOINTS
    .filter((w) => w <= maxWidth)
    .map((w) => `${buildTransformUrl(src, w)} ${w}w`)
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
  const srcSet = buildSrcSet(src, maxWidth);
  const optimizedSrc = isSupabaseStorageUrl(src)
    ? buildTransformUrl(src, Math.min(maxWidth, BREAKPOINTS[BREAKPOINTS.length - 1]))
    : src;

  return (
    <img
      src={optimizedSrc}
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
