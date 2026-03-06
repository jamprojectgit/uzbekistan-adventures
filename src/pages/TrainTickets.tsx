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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TrainRoute {
  id: string;
  train_type: string;
  from_city: string;
  to_city: string;
  departure_time: string;
  arrival_time: string;
  operating_days: string;
  price: number;
  currency: string;
}

interface RouteGroup {
  key: string;
  train_type: string;
  from_city: string;
  to_city: string;
  departures: TrainRoute[];
}

const TrainTickets = () => {
  const { t } = useTranslation();

  const { data: routes, isLoading } = useQuery({
    queryKey: ['train-routes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('train_routes')
        .select('*')
        .eq('status', 'published')
        .order('train_type')
        .order('from_city')
        .order('departure_time');
      if (error) throw error;
      return data as TrainRoute[];
    },
  });

  const grouped = useMemo<RouteGroup[]>(() => {
    if (!routes) return [];
    const map = new Map<string, RouteGroup>();
    for (const r of routes) {
      const key = `${r.train_type}||${r.from_city}||${r.to_city}`;
      if (!map.has(key)) {
        map.set(key, { key, train_type: r.train_type, from_city: r.from_city, to_city: r.to_city, departures: [] });
      }
      map.get(key)!.departures.push(r);
    }
    return Array.from(map.values()).sort((a, b) =>
      a.train_type.localeCompare(b.train_type) || a.from_city.localeCompare(b.from_city) || a.to_city.localeCompare(b.to_city)
    );
  }, [routes]);

  return (
    <Layout>
      <section className="container mx-auto px-4 py-16">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('trainTickets.title')}</h1>
        <p className="text-muted-foreground mb-8 max-w-2xl">{t('trainTickets.scheduleSubtitle')}</p>

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map((group) => (
              <div key={group.key} className="rounded-lg border border-border overflow-hidden">
                <div className="flex items-center justify-between bg-muted/50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Train className="h-5 w-5 text-primary" />
                    <div>
                      <span className="font-semibold">{group.train_type}</span>
                      <span className="mx-2 text-muted-foreground">—</span>
                      <span>{group.from_city} → {group.to_city}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {group.departures.length} {group.departures.length === 1 ? 'departure' : 'departures'}
                    </Badge>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {t('trainTickets.departure')}
                        </span>
                      </TableHead>
                      <TableHead>{t('trainTickets.arrival')}</TableHead>
                      <TableHead>{t('trainTickets.days')}</TableHead>
                      {group.departures.some(r => r.price > 0) && (
                        <TableHead>{t('trainTickets.price')}</TableHead>
                      )}
                      <TableHead className="w-56"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.departures.map((dep) => (
                      <TableRow key={dep.id}>
                        <TableCell className="font-mono">{dep.departure_time}</TableCell>
                        <TableCell className="font-mono">{dep.arrival_time}</TableCell>
                        <TableCell>
                          {dep.operating_days !== 'Daily' ? (
                            <Badge variant="secondary" className="text-xs">{dep.operating_days}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">{dep.operating_days}</span>
                          )}
                        </TableCell>
                        {group.departures.some(r => r.price > 0) && (
                          <TableCell className="font-semibold text-primary">
                            {dep.price > 0 ? `$${dep.price}` : '—'}
                          </TableCell>
                        )}
                        <TableCell>
                          <ContactButtons
                            size="sm"
                            message={`Здравствуйте! Интересует ЖД билет: ${dep.train_type}, ${dep.from_city} → ${dep.to_city}, отправление ${dep.departure_time}`}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default TrainTickets;
