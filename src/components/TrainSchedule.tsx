import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
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

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-16">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-64 rounded-lg" />
      </section>
    );
  }

  if (!routes || routes.length === 0) return null;

  // Group by train_type
  const grouped = routes.reduce<Record<string, TrainRoute[]>>((acc, route) => {
    if (!acc[route.train_type]) acc[route.train_type] = [];
    acc[route.train_type].push(route);
    return acc;
  }, {});

  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-2xl md:text-3xl font-bold mb-2">{t('trainTickets.scheduleTitle')}</h2>
      <p className="text-muted-foreground mb-8">{t('trainTickets.scheduleSubtitle')}</p>

      <div className="space-y-10">
        {Object.entries(grouped).map(([trainType, trainRoutes]) => (
          <div key={trainType}>
            <div className="flex items-center gap-3 mb-4">
              <Train className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-bold">{trainType}</h3>
            </div>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('trainTickets.trainType')}</TableHead>
                    <TableHead>{t('trainTickets.from')}</TableHead>
                    <TableHead>{t('trainTickets.to')}</TableHead>
                    <TableHead>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {t('trainTickets.departure')}
                      </span>
                    </TableHead>
                    <TableHead>{t('trainTickets.arrival')}</TableHead>
                    <TableHead>{t('trainTickets.days')}</TableHead>
                    {trainRoutes.some(r => r.price > 0) && (
                      <TableHead>{t('trainTickets.price')}</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trainRoutes.map((route) => (
                    <TableRow key={route.id}>
                      <TableCell className="font-medium">{route.train_type}</TableCell>
                      <TableCell>{route.from_city}</TableCell>
                      <TableCell>{route.to_city}</TableCell>
                      <TableCell className="font-mono">{route.departure_time}</TableCell>
                      <TableCell className="font-mono">{route.arrival_time}</TableCell>
                      <TableCell>
                        {route.operating_days !== 'Daily' ? (
                          <Badge variant="secondary" className="text-xs">{route.operating_days}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">{route.operating_days}</span>
                        )}
                      </TableCell>
                      {trainRoutes.some(r => r.price > 0) && (
                        <TableCell className="font-semibold text-primary">
                          {route.price > 0 ? `$${route.price}` : '—'}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrainSchedule;
