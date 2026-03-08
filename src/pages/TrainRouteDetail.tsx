import { useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import ContactButtons from '@/components/ContactButtons';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Train, Clock } from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

const TrainRouteDetail = () => {
  const { routeSlug } = useParams<{ routeSlug: string }>();
  const { t } = useTranslation();

  // Parse slug: "tashkent-to-samarkand-train"
  const { fromCity, toCity } = useMemo(() => {
    const match = routeSlug?.match(/^(.+?)-to-(.+?)-train$/);
    if (!match) return { fromCity: '', toCity: '' };
    const format = (s: string) => s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return { fromCity: format(match[1]), toCity: format(match[2]) };
  }, [routeSlug]);

  const { data: routes, isLoading } = useQuery({
    queryKey: ['train-route-detail', fromCity, toCity],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('train_routes')
        .select('*')
        .eq('status', 'published')
        .ilike('from_city', fromCity)
        .ilike('to_city', toCity)
        .order('train_type')
        .order('departure_time');
      if (error) throw error;
      return data;
    },
    enabled: !!fromCity && !!toCity,
  });

  const title = `${fromCity} to ${toCity} Train`;
  const desc = `Book train tickets from ${fromCity} to ${toCity}, Uzbekistan. Afrosiyab high-speed and Sharq train schedules, prices, and booking assistance.`;

  return (
    <Layout>
      <SEOHead
        title={`${title} Tickets | Schedule & Prices — Uzbekistan Railway`}
        description={desc}
        path={`/train-tickets/${routeSlug}`}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TrainTrip",
            "departureStation": {
              "@type": "TrainStation",
              "name": fromCity,
            },
            "arrivalStation": {
              "@type": "TrainStation",
              "name": toCity,
            },
            "provider": {
              "@type": "TravelAgency",
              "name": "JamTrips",
              "url": "https://jamtrips.com",
            },
            ...(routes && routes.length > 0 && {
              offers: routes.map(r => ({
                "@type": "Offer",
                "price": r.price,
                "priceCurrency": r.currency,
                "description": `${r.train_type} — departs ${r.departure_time}`,
              })),
            }),
          }),
        }}
      />

      <section className="container mx-auto px-4 py-16">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          <Train className="inline h-7 w-7 text-primary mr-2" />
          {fromCity} → {toCity} Train Tickets
        </h1>
        <p className="text-muted-foreground mb-8 max-w-2xl">{desc}</p>

        {isLoading ? (
          <Skeleton className="h-48 rounded-lg" />
        ) : routes && routes.length > 0 ? (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('trainTickets.trainType')}</TableHead>
                  <TableHead>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {t('trainTickets.departure')}
                    </span>
                  </TableHead>
                  <TableHead>{t('trainTickets.arrival')}</TableHead>
                  <TableHead>{t('trainTickets.days')}</TableHead>
                  <TableHead>{t('trainTickets.price')}</TableHead>
                  <TableHead className="w-56"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.map(route => (
                  <TableRow key={route.id}>
                    <TableCell className="font-medium">{route.train_type}</TableCell>
                    <TableCell className="font-mono">{route.departure_time}</TableCell>
                    <TableCell className="font-mono">{route.arrival_time}</TableCell>
                    <TableCell>
                      {route.operating_days !== 'Daily' ? (
                        <Badge variant="secondary" className="text-xs">{route.operating_days}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">{route.operating_days}</span>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold text-primary">
                      {route.price > 0 ? `$${route.price}` : '—'}
                    </TableCell>
                    <TableCell>
                      <ContactButtons
                        size="sm"
                        message={`Здравствуйте! Интересует ЖД билет: ${route.train_type}, ${fromCity} → ${toCity}, отправление ${route.departure_time}`}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No train schedules found for this route yet.</p>
            <ContactButtons
              message={`Здравствуйте! Интересует ЖД билет: ${fromCity} → ${toCity}`}
            />
          </div>
        )}
      </section>
    </Layout>
  );
};

export default TrainRouteDetail;
