import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { lazy, Suspense } from 'react';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { Skeleton } from '@/components/ui/skeleton';

const TourGallery = lazy(() => import('@/components/TourGallery'));
const TourRequestWidget = lazy(() => import('@/components/TourRequestWidget'));
import { Button } from '@/components/ui/button';
import { getLocalizedText, getLocalizedArray } from '@/lib/i18n-utils';
import { formatDuration } from '@/lib/duration-utils';
import { ArrowLeft, MapPin, Clock, CheckCircle, XCircle } from 'lucide-react';
import ShareButton from '@/components/ShareButton';

const TourDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: tour, isLoading } = useQuery({
    queryKey: ['tour', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tours')
        .select('*, cities(name)')
        .eq('slug', slug)
        .single();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 space-y-4">
          <Skeleton className="h-96 w-full rounded-lg" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-full" />
        </div>
      </Layout>
    );
  }

  if (!tour) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">{t('tours.notFound')}</p>
        </div>
      </Layout>
    );
  }

  const title = getLocalizedText(tour.title);
  const desc = getLocalizedText(tour.description);
  const itinerary = getLocalizedText(tour.itinerary);
  const included = getLocalizedArray(tour.included);
  const excluded = getLocalizedArray(tour.excluded);
  const cityName = tour.cities ? getLocalizedText(tour.cities.name) : '';

  return (
    <Layout>
      <SEOHead
        title={`${title} — Tour in ${cityName || 'Uzbekistan'}`}
        description={desc.substring(0, 155)}
        path={`/tours/${slug}`}
        type="article"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TouristTrip",
            "name": title,
            "description": desc.substring(0, 300),
            "url": `https://www.jamtrips.com/tours/${slug}`,
            "touristType": "Leisure",
            ...(tour.images?.[0] && { image: tour.images[0] }),
            "offers": {
              "@type": "Offer",
              "price": tour.price,
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock",
            },
            "provider": {
              "@type": "TravelAgency",
              "name": "JamTrips",
              "url": "https://www.jamtrips.com",
            },
            ...(cityName && {
              "itinerary": {
                "@type": "Place",
                "name": cityName,
                "address": { "@type": "PostalAddress", "addressCountry": "UZ" },
              },
            }),
          }),
        }}
      />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> {t('common.back')}
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {tour.images && tour.images.length > 0 && (
              <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
                <TourGallery images={tour.images} title={title} />
              </Suspense>
            )}

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{title}</h1>
                <ShareButton title={title} url={`${window.location.origin}/tours/${slug}`} className="w-9 h-9 shrink-0" size={18} />
              </div>
              <div className="flex items-center gap-4 text-muted-foreground mb-4">
                {cityName && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {cityName}</span>}
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {formatDuration(tour.duration_value ?? tour.duration, tour.duration_unit ?? 'days')}</span>
                <span className="font-bold text-primary text-lg">${tour.price} {t('tours.perPerson')}</span>
              </div>
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">{desc}</p>
            </div>

            {/* Included / Excluded */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {included.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">{t('tours.included')}</h3>
                  <ul className="space-y-2">
                    {included.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {excluded.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">{t('tours.excluded')}</h3>
                  <ul className="space-y-2">
                    {excluded.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {itinerary && (
              <div>
                <h3 className="font-semibold mb-3">{t('tours.itinerary')}</h3>
                <div className="bg-muted rounded-lg p-4 whitespace-pre-wrap text-sm">{itinerary}</div>
              </div>
            )}
          </div>

          {/* Sidebar - Booking Request */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg" />}>
                <TourRequestWidget
                  tourId={tour.id}
                  tourTitle={title}
                  price={tour.price}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TourDetail;
