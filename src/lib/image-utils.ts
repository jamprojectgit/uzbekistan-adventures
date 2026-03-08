const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

/**
 * Detects if a URL points to Supabase Storage and rewrites it
 * to use the image transformation endpoint with width/format params.
 */
export function getOptimizedUrl(
  src: string,
  width: number,
  format: 'webp' | 'origin' = 'webp'
): string {
  if (!src || !SUPABASE_URL) return src;

  // Match Supabase storage public URLs
  const publicPath = '/storage/v1/object/public/';
  if (!src.includes(publicPath)) return src;

  // Replace /object/ with /render/image/ for transformation
  const renderUrl = src.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/'
  );

  const separator = renderUrl.includes('?') ? '&' : '?';
  return `${renderUrl}${separator}width=${width}&resize=contain&format=${format}`;
}

/**
 * Generates a srcSet string for responsive images.
 * Only applies transformations to Supabase Storage URLs.
 */
export function buildSrcSet(
  src: string,
  widths: number[]
): string {
  const publicPath = '/storage/v1/object/public/';
  if (!src.includes(publicPath)) return '';

  return widths
    .map((w) => `${getOptimizedUrl(src, w)} ${w}w`)
    .join(', ');
}

/** Preset width sets for different image roles */
export const IMAGE_WIDTHS = {
  hero: [640, 960, 1280, 1600],
  card: [320, 480, 600],
  thumbnail: [150, 300],
  gallery: [480, 768, 1200, 1600],
} as const;
