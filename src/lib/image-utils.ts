/** Image helpers for the admin panel: size formatting + client-side compression. */

export const formatBytes = (bytes: number): string => {
  if (!bytes || bytes < 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
};

export const MAX_IMAGE_BYTES = 300 * 1024;

/** Fetch the byte size of a remote image (HEAD, falls back to GET). */
export const getRemoteSize = async (url: string): Promise<number> => {
  try {
    const head = await fetch(url, { method: 'HEAD' });
    const len = head.headers.get('content-length');
    if (len) return parseInt(len, 10);
  } catch {
    /* ignore */
  }
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return blob.size;
  } catch {
    return 0;
  }
};

const loadBitmap = async (blob: Blob): Promise<{ width: number; height: number; draw: CanvasImageSource }> => {
  if ('createImageBitmap' in window) {
    const bmp = await createImageBitmap(blob);
    return { width: bmp.width, height: bmp.height, draw: bmp };
  }
  const url = URL.createObjectURL(blob);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });
    return { width: img.naturalWidth, height: img.naturalHeight, draw: img };
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
};

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> =>
  new Promise((resolve) => canvas.toBlob(resolve, type, quality));

/**
 * Compress an image (JPEG / PNG / WebP) down to `maxBytes` while keeping the
 * highest quality possible: first tries quality steps at full resolution,
 * then progressively downscales.
 */
export const compressImage = async (
  blob: Blob,
  maxBytes: number = MAX_IMAGE_BYTES,
): Promise<{ blob: Blob; type: string; ext: string }> => {
  // Prefer WebP (best quality/size); fall back to JPEG if unsupported.
  const probe = document.createElement('canvas');
  probe.width = probe.height = 1;
  const supportsWebp = probe.toDataURL('image/webp').startsWith('data:image/webp');
  const type = supportsWebp ? 'image/webp' : 'image/jpeg';
  const ext = supportsWebp ? 'webp' : 'jpg';

  const { width, height, draw } = await loadBitmap(blob);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  let best: Blob | null = null;

  for (const scale of [1, 0.85, 0.7, 0.55, 0.45, 0.35, 0.25]) {
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(draw, 0, 0, canvas.width, canvas.height);

    for (const quality of [0.92, 0.85, 0.78, 0.7, 0.62, 0.55, 0.45]) {
      const out = await canvasToBlob(canvas, type, quality);
      if (!out) continue;
      if (!best || out.size < best.size) best = out;
      if (out.size <= maxBytes) return { blob: out, type, ext };
    }
  }

  if (!best) throw new Error('Compression failed');
  return { blob: best, type, ext };
};
