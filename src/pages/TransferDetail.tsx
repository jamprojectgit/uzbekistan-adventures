import { useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import ContactButtons from '@/components/ContactButtons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Car, Users, MapPin, Briefcase } from 'lucide-react';

const vehicleIcons: Record<string, string> = {
  Sedan: '🚗',
  Minivan: '🚐',
  Minibus: '🚌',
};

const luggageEstimate: Record<string, string> = {
  Sedan: '2-3',
  Minivan: '4-6',
  Minibus: '8-12',
};

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
        .ilike('to_city', toCity)
        .order('price');
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
          <Skeleton className="h-48 rounded-lg" />
        ) : transfers && transfers.length > 0 ? (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Car className="h-5 w-5 text-primary" />
                {t('transfers.vehicleOptions')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left pb-3 font-medium">{t('transfers.vehicleType')}</th>
                      <th className="text-left pb-3 font-medium">{t('transfers.passengersCol')}</th>
                      <th className="text-left pb-3 font-medium">{t('transfers.luggageCol')}</th>
                      <th className="text-left pb-3 font-medium">{t('trainTickets.price')}</th>
                      <th className="text-right pb-3 font-medium">{t('contact.bookVia')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transfers.map((v) => (
                      <tr key={v.id} className="border-b border-border last:border-0">
                        <td className="py-3 font-medium">
                          <span className="mr-2">{vehicleIcons[v.vehicle_type] || '🚗'}</span>
                          {v.vehicle_type}
                        </td>
                        <td className="py-3">
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            {t('transfers.upTo')} {v.max_passengers}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <Briefcase className="h-4 w-4" />
                            {luggageEstimate[v.vehicle_type] || '2-3'} {t('transfers.bags')}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="text-lg font-bold text-primary">${v.price}</span>
                        </td>
                        <td className="py-3">
                          <ContactButtons
                            size="sm"
                            className="justify-end"
                            message={t('contact.transferMessage', { from: fromCity, to: toCity, vehicle: v.vehicle_type, price: v.price })}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile stacked */}
              <div className="md:hidden space-y-4">
                {transfers.map((v) => (
                  <div key={v.id} className="rounded-lg border border-border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-base">
                        {vehicleIcons[v.vehicle_type] || '🚗'} {v.vehicle_type}
                      </span>
                      <span className="text-lg font-bold text-primary">${v.price}</span>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        {t('transfers.upTo')} {v.max_passengers}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="h-4 w-4" />
                        {luggageEstimate[v.vehicle_type] || '2-3'} {t('transfers.bags')}
                      </span>
                    </div>
                    <ContactButtons
                      size="sm"
                      message={t('contact.transferMessage', { from: fromCity, to: toCity, vehicle: v.vehicle_type, price: v.price })}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
