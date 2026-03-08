import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import ContactButtons from '@/components/ContactButtons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Car, MapPin, Users, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Transfer {
  id: string;
  from_city: string;
  to_city: string;
  vehicle_type: string;
  max_passengers: number;
  price: number;
  currency: string;
  description: string | null;
  image_url: string | null;
  status: string;
}

interface RouteGroup {
  key: string;
  from_city: string;
  to_city: string;
  slug: string;
  vehicles: Transfer[];
}

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

function groupByRoute(transfers: Transfer[]): RouteGroup[] {
  const map = new Map<string, RouteGroup>();
  for (const t of transfers) {
    const fromCity = t.from_city.trim();
    const toCity = t.to_city.trim();
    const key = `${fromCity.toLowerCase()}-${toCity.toLowerCase()}`;
    if (!map.has(key)) {
      const slug = `${fromCity.toLowerCase().replace(/\s+/g, '-')}-to-${toCity.toLowerCase().replace(/\s+/g, '-')}-transfer`;
      map.set(key, { key, from_city: fromCity, to_city: toCity, slug, vehicles: [] });
    }
    map.get(key)!.vehicles.push(t);
  }
  for (const group of map.values()) {
    group.vehicles.sort((a, b) => Number(a.price) - Number(b.price));
  }
  return Array.from(map.values());
}

const Transfers = () => {
  const { t } = useTranslation();

  const { data: transfers, isLoading } = useQuery({
    queryKey: ['transfers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transfers')
        .select('*')
        .eq('status', 'published')
        .order('from_city')
        .order('price');
      if (error) throw error;
      return data as Transfer[];
    },
  });

  const routes = transfers ? groupByRoute(transfers) : [];

  return (
    <Layout>
      <SEOHead
        title="Uzbekistan Private Transfers | Transport Between Cities"
        description="Book comfortable private transfers across Uzbekistan. Airport pickups, intercity transfers between Samarkand, Bukhara, Khiva, Tashkent and more."
        path="/transfers"
      />
      <section className="container mx-auto px-4 py-16">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">{t('transfers.title')}</h1>

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        ) : routes.length > 0 ? (
          <div className="space-y-6">
            {routes.map((route) => (
              <Card key={route.key}>
                <CardHeader className="pb-4">
                  <Link to={`/transfers/${route.slug}`}>
                    <CardTitle className="flex items-center gap-2 text-xl hover:text-primary transition-colors">
                      <MapPin className="h-5 w-5 text-primary shrink-0" />
                      {route.from_city} → {route.to_city}
                    </CardTitle>
                  </Link>
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
                        {route.vehicles.map((v) => (
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
                                message={t('contact.transferMessage', { from: route.from_city, to: route.to_city, vehicle: v.vehicle_type, price: v.price })}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile stacked */}
                  <div className="md:hidden space-y-4">
                    {route.vehicles.map((v) => (
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
                          message={t('contact.transferMessage', { from: route.from_city, to: route.to_city, vehicle: v.vehicle_type, price: v.price })}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
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
