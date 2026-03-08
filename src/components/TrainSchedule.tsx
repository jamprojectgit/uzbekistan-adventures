import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Train, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
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

interface TrainScheduleProps {
  limit?: number;
}

const TrainSchedule = ({ limit }: TrainScheduleProps) => {
  const { t } = useTranslation();

  const { data: routes, isLoading } = useQuery({
    queryKey: ['train-routes', limit],
    queryFn: async () => {
      let query = supabase
        .from('train_routes')
        .select('*')
        .eq('status', 'published')
        .order('train_type')
        .order('from_city')
        .order('departure_time');
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
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

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-16">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-64 rounded-lg" />
      </section>
    );
  }

  if (!routes || routes.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-2xl md:text-3xl font-bold mb-2">{t('trainTickets.scheduleTitle')}</h2>
      <p className="text-muted-foreground mb-8">{t('trainTickets.scheduleSubtitle')}</p>

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
                <Badge variant="outline" className="text-xs">{group.departures.length} {group.departures.length === 1 ? 'departure' : 'departures'}</Badge>
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
                  <TableHead className="w-28"></TableHead>
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
                      <Button size="sm" variant="outline">{t('trainTickets.submitRequest')}</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrainSchedule;
