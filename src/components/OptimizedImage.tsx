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

/**
 * Optimized image component with:
 * - lazy loading (default) or eager + high priority
 * - async decoding
 * - responsive sizes hints
 * - max-width constraint (1920px default)
 */
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
  return (
    <img
      src={src}
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
