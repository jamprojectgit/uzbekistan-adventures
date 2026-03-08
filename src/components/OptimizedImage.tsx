import { cn } from '@/lib/utils';
import { getOptimizedUrl, buildSrcSet, IMAGE_WIDTHS } from '@/lib/image-utils';

type ImagePreset = keyof typeof IMAGE_WIDTHS;

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  /** Above-the-fold image — sets eager loading + high priority */
  priority?: boolean;
  /** Responsive sizes hint, e.g. "(max-width: 768px) 100vw, 50vw" */
  sizes?: string;
  /** Max width to cap the image at (default 1920) */
  maxWidth?: number;
  /** Preset determines which srcSet widths to generate */
  preset?: ImagePreset;
}

const OptimizedImage = ({
  src,
  alt,
  priority = false,
  sizes = '100vw',
  maxWidth = 1920,
  preset = 'gallery',
  className,
  style,
  ...props
}: OptimizedImageProps) => {
  const widths = IMAGE_WIDTHS[preset];
  const srcSet = buildSrcSet(src, [...widths]);
  // Use the largest preset width for the default src (WebP)
  const optimizedSrc = getOptimizedUrl(src, widths[widths.length - 1]);

  return (
    <img
      src={optimizedSrc}
      srcSet={srcSet || undefined}
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
