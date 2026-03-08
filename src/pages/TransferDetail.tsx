import { useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import ContactButtons from '@/components/ContactButtons';
import OptimizedImage from '@/components/OptimizedImage';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Car, Users, MapPin } from 'lucide-react';

const TransferDetail = () => {
  const { routeSlug } = useParams<{ routeSlug: string }>();
  const { t } = useTranslation();

  const { fromCity, toCity } = useMemo(() => {
    const match = routeSlug?.match(/^(.+?)-to-(.+?)-transfer$/);
    if (!match) return { fromCity: '', toCity: '' };
    const format = (s: string) => s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return { fromCity: format(match[1]), toCity: format(match[2]) };
  }, [routeSlug]);

  const { data: transfers, isLoading } = useQuery({
    queryKey: ['transfers-route', fromCity, toCity],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transfers')
        .select('*')
        .eq('status', 'published')
        .ilike('from_city', fromCity)
        .ilike('to_city', toCity);
      if (error) throw error;
      return data;
    },
    enabled: !!fromCity && !!toCity,
  });

  const title = t('transfers.routeTitle', { from: fromCity, to: toCity });
  const desc = t('transfers.routeDesc', { from: fromCity, to: toCity });

  return (
    <Layout>
      <SEOHead
        title={`${fromCity} to ${toCity} Transfer | Private Car Service in Uzbekistan`}
        description={`Book a private transfer from ${fromCity} to ${toCity}, Uzbekistan. Choose from sedan, minivan, or minibus options with professional drivers.`}
        path={`/transfers/${routeSlug}`}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": `${fromCity} to ${toCity} Transfer`,
            "description": `Book a private transfer from ${fromCity} to ${toCity}, Uzbekistan.`,
            "provider": {
              "@type": "TravelAgency",
              "name": "JamTrips",
              "url": "https://jamtrips.com",
            },
            "areaServed": {
              "@type": "Country",
              "name": "Uzbekistan",
            },
            "serviceType": "Private Transfer",
            ...(transfers && transfers.length > 0 && {
              offers: transfers.map(tr => ({
                "@type": "Offer",
                "price": tr.price,
                "priceCurrency": tr.currency,
                "description": `${tr.vehicle_type} — up to ${tr.max_passengers} passengers`,
              })),
            }),
          }),
        }}
      />

      <section className="container mx-auto px-4 py-16">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          <MapPin className="inline h-7 w-7 text-primary mr-2" />
          {title}
        </h1>
        <p className="text-muted-foreground mb-8 max-w-2xl">{desc}</p>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-lg" />)}
          </div>
        ) : transfers && transfers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {transfers.map(transfer => (
              <Card key={transfer.id} className="flex flex-col">
                {transfer.image_url && (
                  <div className="h-48 overflow-hidden rounded-t-lg">
                    <OptimizedImage
                      src={transfer.image_url}
                      alt={`${transfer.vehicle_type} ${fromCity} to ${toCity}`}
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Car className="h-5 w-5 text-primary" />
                    {transfer.vehicle_type}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{t('transfers.upTo')} {transfer.max_passengers} {t('transfers.passengers')}</span>
                  </div>
                  {transfer.description && (
                    <p className="text-sm text-muted-foreground">{transfer.description}</p>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  <span className="text-xl font-bold text-primary w-full">${transfer.price}</span>
                  <ContactButtons
                    size="sm"
                    message={t('contact.transferMessage', { from: fromCity, to: toCity, vehicle: transfer.vehicle_type, price: transfer.price })}
                  />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">{t('transfers.noOptionsYet')}</p>
            <ContactButtons
              message={t('contact.transferMessageShort', { from: fromCity, to: toCity })}
            />
          </div>
        )}
      </section>
    </Layout>
  );
};

export default TransferDetail;
