import { useState, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Images } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import useEmblaCarousel from 'embla-carousel-react';
import { useEffect } from 'react';

interface TourGalleryProps {
  images: string[];
  title: string;
  maxThumbnails?: number;
}

const TourGallery = ({ images, title, maxThumbnails = 4 }: TourGalleryProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const isMobile = useIsMobile();

  // Mobile carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setCurrentSlide(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  const thumbnails = images.slice(1, maxThumbnails + 1);
  const extraCount = Math.max(0, images.length - maxThumbnails - 1);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setZoomed(false);
    setLightboxOpen(true);
  }, []);

  const navigateLightbox = useCallback((dir: 1 | -1) => {
    setZoomed(false);
    setLightboxIndex((prev) => (prev + dir + images.length) % images.length);
  }, [images.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(diff) > 50) {
      navigateLightbox(diff > 0 ? -1 : 1);
    }
    setTouchStart(null);
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
    if (e.key === 'Escape') setLightboxOpen(false);
  }, [navigateLightbox]);

  if (!images.length) return null;

  return (
    <>
      {/* Mobile: Swipeable Carousel */}
      {isMobile ? (
        <div className="relative rounded-xl overflow-hidden">
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex">
              {images.map((img, i) => (
                <div
                  key={i}
                  className="flex-[0_0_100%] min-w-0 relative aspect-[4/3] cursor-pointer"
                  onClick={() => openLightbox(i)}
                >
                  <img
                    src={img}
                    alt={`${title} — photo ${i + 1}`}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Counter pill */}
          <div className="absolute bottom-3 right-3 bg-background/80 backdrop-blur-sm text-foreground text-xs font-medium px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5">
            <Images className="h-3.5 w-3.5" />
            {currentSlide + 1} / {images.length}
          </div>
          {/* Dot indicators */}
          {images.length > 1 && images.length <= 8 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all",
                    i === currentSlide ? "bg-primary-foreground scale-125" : "bg-primary-foreground/50"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Desktop: Grid layout */
        <div className="grid grid-cols-4 grid-rows-2 gap-1.5 rounded-xl overflow-hidden h-[400px]">
          <div
            className="col-span-3 row-span-2 relative cursor-pointer group"
            onClick={() => openLightbox(0)}
          >
            <img
              src={images[0]}
              alt={`${title} — main photo`}
              loading="eager"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
          <div className="col-span-1 row-span-2 flex flex-col gap-1.5">
            {thumbnails.map((img, i) => {
              const realIndex = i + 1;
              const isLast = i === thumbnails.length - 1 && extraCount > 0;
              return (
                <div
                  key={realIndex}
                  className="relative flex-1 min-h-0 cursor-pointer group overflow-hidden"
                  onClick={() => openLightbox(realIndex)}
                >
                  <img
                    src={img}
                    alt={`${title} — photo ${realIndex + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {isLast && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center transition-colors group-hover:bg-black/40">
                      <span className="text-white font-semibold text-lg flex items-center gap-1.5">
                        <Images className="h-5 w-5" />+{extraCount}
                      </span>
                    </div>
                  )}
                  {!isLast && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          className="max-w-[100vw] max-h-[100vh] w-screen h-screen p-0 border-0 bg-black/95 rounded-none [&>button]:hidden"
          onKeyDown={handleKeyDown}
        >
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3 md:p-4">
            <span className="text-white/80 text-sm font-medium">
              {lightboxIndex + 1} / {images.length}
            </span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10 h-9 w-9" onClick={() => setZoomed((z) => !z)}>
                {zoomed ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10 h-9 w-9" onClick={() => setLightboxOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div
            className="flex items-center justify-center w-full h-full"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={images[lightboxIndex]}
              alt={`${title} — photo ${lightboxIndex + 1}`}
              className={cn(
                "max-h-[85vh] max-w-[90vw] object-contain transition-transform duration-300 select-none",
                zoomed && "scale-150 cursor-zoom-out",
                !zoomed && "cursor-zoom-in"
              )}
              onClick={() => setZoomed((z) => !z)}
              draggable={false}
            />
          </div>

          {images.length > 1 && (
            <>
              <Button variant="ghost" size="icon" className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white hover:bg-white/10 h-10 w-10 md:h-12 md:w-12 rounded-full z-20" onClick={() => navigateLightbox(-1)}>
                <ChevronLeft className="h-6 w-6 md:h-7 md:w-7" />
              </Button>
              <Button variant="ghost" size="icon" className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white hover:bg-white/10 h-10 w-10 md:h-12 md:w-12 rounded-full z-20" onClick={() => navigateLightbox(1)}>
                <ChevronRight className="h-6 w-6 md:h-7 md:w-7" />
              </Button>
            </>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 z-20 p-3 md:p-4">
              <div className="flex justify-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => { setLightboxIndex(i); setZoomed(false); }}
                    className={cn(
                      "flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-md overflow-hidden border-2 transition-all",
                      i === lightboxIndex ? "border-white opacity-100 scale-105" : "border-transparent opacity-50 hover:opacity-80"
                    )}
                  >
                    <img src={img} alt={`${title} — thumbnail ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TourGallery;
