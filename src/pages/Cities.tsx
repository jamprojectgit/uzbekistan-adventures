import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import CityCard from '@/components/CityCard';
import { Skeleton } from '@/components/ui/skeleton';

const Cities = () => {
  const { t } = useTranslation();

  const { data: cities, isLoading } = useQuery({
    queryKey: ['all-cities'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cities').select('*');
      if (error) throw error;
      return data;
    },
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{t('cities.title')}</h1>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-48 rounded-lg" />)}
          </div>
        ) : cities && cities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cities.map(city => <CityCard key={city.id} city={city} />)}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-16">{t('tours.noTours')}</p>
        )}
      </div>
    </Layout>
  );
};

export default Cities;
