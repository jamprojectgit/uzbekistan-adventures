import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import TourCard from '@/components/TourCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getLocalizedText } from '@/lib/i18n-utils';

const Tours = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const cityFilter = searchParams.get('city') || '';

  const { data: cities } = useQuery({
    queryKey: ['all-cities'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cities').select('*');
      if (error) throw error;
      return data;
    },
  });

  const { data: tours, isLoading } = useQuery({
    queryKey: ['tours', cityFilter],
    queryFn: async () => {
      let query = supabase.from('tours').select('*, cities(name, slug)');
      if (cityFilter) {
        const city = cities?.find(c => c.slug === cityFilter);
        if (city) query = query.eq('city_id', city.id);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !cityFilter || !!cities,
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{t('tours.title')}</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Select
            value={cityFilter || 'all'}
            onValueChange={(v) => {
              if (v === 'all') {
                searchParams.delete('city');
              } else {
                searchParams.set('city', v);
              }
              setSearchParams(searchParams);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t('tours.filterByCity')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('tours.allCities')}</SelectItem>
              {cities?.map(city => (
                <SelectItem key={city.id} value={city.slug}>{getLocalizedText(city.name)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-80 rounded-lg" />)}
          </div>
        ) : tours && tours.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map(tour => <TourCard key={tour.id} tour={tour} />)}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-16">{t('tours.noTours')}</p>
        )}
      </div>
    </Layout>
  );
};

export default Tours;
