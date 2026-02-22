import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import BookingForm from '@/components/BookingForm';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { getLocalizedText, getLocalizedArray } from '@/lib/i18n-utils';
import { ArrowLeft, MapPin, Clock, CheckCircle, XCircle } from 'lucide-react';

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
          <p className="text-muted-foreground">Tour not found</p>
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
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> {t('common.back')}
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            {tour.images && tour.images.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-lg overflow-hidden">
                <img src={tour.images[0]} alt={title} className="w-full h-64 md:h-80 object-cover md:col-span-2" />
                {tour.images.slice(1, 3).map((img: string, i: number) => (
                  <img key={i} src={img} alt={`${title} ${i + 2}`} className="w-full h-48 object-cover" />
                ))}
              </div>
            )}

            <div>
              <h1 className="text-3xl font-bold mb-2">{title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground mb-4">
                {cityName && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {cityName}</span>}
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {tour.duration} {tour.duration === 1 ? t('tours.day') : t('tours.days')}</span>
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

            {/* Itinerary */}
            {itinerary && (
              <div>
                <h3 className="font-semibold mb-3">{t('tours.itinerary')}</h3>
                <div className="bg-muted rounded-lg p-4 whitespace-pre-wrap text-sm">{itinerary}</div>
              </div>
            )}
          </div>

          {/* Sidebar - Booking */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <BookingForm tourId={tour.id} price={tour.price} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TourDetail;
