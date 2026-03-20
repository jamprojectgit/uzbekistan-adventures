import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import Breadcrumbs from '@/components/Breadcrumbs';
import OptimizedImage from '@/components/OptimizedImage';
import { Skeleton } from '@/components/ui/skeleton';
import { getLocalizedText } from '@/lib/i18n-utils';
import { lazy, Suspense } from 'react';

const TourCard = lazy(() => import('@/components/TourCard'));

const CityDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();

  const { data: city, isLoading: cityLoading } = useQuery({
    queryKey: ['city', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('slug', slug)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: tours, isLoading: toursLoading } = useQuery({
    queryKey: ['city-tours', city?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tours')
        .select('*, cities(name)')
        .eq('city_id', city!.id)
        .order('order_number', { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data;
    },
    enabled: !!city?.id,
  });

  if (cityLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 space-y-4">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-8 w-1/3" />
        </div>
      </Layout>
    );
  }

  if (!city) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">{t('cities.notFound')}</p>
        </div>
      </Layout>
    );
  }

  const name = getLocalizedText(city.name);
  const description = getLocalizedText(city.description);

  return (
    <Layout>
      <SEOHead
        title={`${name} Travel Guide | Tours & Things to Do in ${name}, Uzbekistan`}
        description={description ? description.substring(0, 155) : `Explore ${name}, Uzbekistan. Book tours, transfers, and activities in ${name}.`}
        path={`/cities/${slug}`}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "City",
            "name": name,
            "description": description,
            "containedInPlace": {
              "@type": "Country",
              "name": "Uzbekistan",
            },
            "url": `https://www.jamtrips.com/cities/${slug}`,
          }),
        }}
      />

      {/* Hero */}
      {city.cover_image && (
        <div className="relative h-64 md:h-96 overflow-hidden">
          <OptimizedImage
            src={city.cover_image}
            alt={name}
            priority
            sizes="100vw"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white">{name}</h1>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {!city.cover_image && (
          <h1 className="text-3xl md:text-4xl font-bold mb-6">{name}</h1>
        )}

        {description && (
          <div className="prose max-w-3xl mb-12">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">{description}</p>
          </div>
        )}

        {/* Tours in this city */}
        <h2 className="text-2xl font-bold mb-6">{t('cities.viewTours')} — {name}</h2>
        {toursLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-80 rounded-lg" />)}
          </div>
        ) : tours && tours.length > 0 ? (
          <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{[1,2,3].map(i => <Skeleton key={i} className="h-80 rounded-lg" />)}</div>}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tours.map(tour => <TourCard key={tour.id} tour={tour} />)}
            </div>
          </Suspense>
        ) : (
          <p className="text-muted-foreground text-center py-12">{t('tours.noTours')}</p>
        )}
      </div>
    </Layout>
  );
};

export default CityDetail;
