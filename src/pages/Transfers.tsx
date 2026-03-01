import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Car, MapPin, Users } from 'lucide-react';

const Transfers = () => {
  const { t } = useTranslation();

  const { data: transfers, isLoading } = useQuery({
    queryKey: ['transfers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transfers')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <Layout>
      <section className="container mx-auto px-4 py-16">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">{t('transfers.title')}</h1>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        ) : transfers && transfers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {transfers.map((transfer) => (
              <Card key={transfer.id} className="flex flex-col">
                {transfer.image_url && (
                  <div className="h-48 overflow-hidden rounded-t-lg">
                    <img src={transfer.image_url} alt={`${transfer.from_city} → ${transfer.to_city}`} className="w-full h-full object-cover" />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                    {transfer.from_city} → {transfer.to_city}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Car className="h-4 w-4" />
                    <span>{transfer.vehicle_type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{t('transfers.upTo')} {transfer.max_passengers} {t('transfers.people')}</span>
                  </div>
                  {transfer.description && (
                    <p className="text-sm text-muted-foreground">{transfer.description}</p>
                  )}
                </CardContent>
                <CardFooter>
                  <span className="text-xl font-bold text-primary">${transfer.price}</span>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-12">{t('transfers.noTransfers')}</p>
        )}
      </section>
    </Layout>
  );
};

export default Transfers;
