import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Train, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
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
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookingRoute, setBookingRoute] = useState<TrainRoute | null>(null);
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    travel_date: '',
    passengers: 1,
    notes: '',
  });

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

  const handleSubmit = async () => {
    if (!bookingRoute || !form.full_name || !form.phone || !form.travel_date) return;

    // Find a matching train_ticket to link the request
    const { data: tickets } = await supabase
      .from('train_tickets')
      .select('id')
      .limit(1);

    const ticketId = tickets?.[0]?.id;
    if (!ticketId) {
      toast({ title: t('common.error'), variant: 'destructive' });
      return;
    }

    const { error } = await supabase.from('train_ticket_requests').insert({
      train_ticket_id: ticketId,
      user_id: user?.id || null,
      full_name: form.full_name,
      phone: form.phone,
      email: form.email || null,
      travel_date: form.travel_date,
      passengers: form.passengers,
      notes: form.notes || `${bookingRoute.train_type}: ${bookingRoute.from_city} → ${bookingRoute.to_city}, ${bookingRoute.departure_time}–${bookingRoute.arrival_time}`,
    });

    if (error) {
      toast({ title: t('common.error'), variant: 'destructive' });
    } else {
      toast({ title: t('trainTickets.requestSuccess') });
      setBookingRoute(null);
      setForm({ full_name: '', phone: '', email: '', travel_date: '', passengers: 1, notes: '' });
    }
  };

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
                      <TableHead className="w-36"></TableHead>
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
                          <Button size="sm" onClick={() => setBookingRoute(dep)}>
                            {t('trainTickets.submitRequest')}
                          </Button>
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

      <Dialog open={!!bookingRoute} onOpenChange={(open) => !open && setBookingRoute(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('trainTickets.requestForm')}</DialogTitle>
          </DialogHeader>
          {bookingRoute && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground pb-2 border-b border-border">
              <Train className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">{bookingRoute.train_type}</span>
              <span>—</span>
              <span>{bookingRoute.from_city} → {bookingRoute.to_city}</span>
              <span className="font-mono">({bookingRoute.departure_time})</span>
            </div>
          )}
          <div className="space-y-4 py-2">
            <div>
              <Label>{t('auth.fullName')} *</Label>
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div>
              <Label>{t('transfers.phone')} *</Label>
              <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <Label>{t('auth.email')}</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label>{t('trainTickets.travelDate')} *</Label>
              <Input type="date" value={form.travel_date} onChange={(e) => setForm({ ...form, travel_date: e.target.value })} />
            </div>
            <div>
              <Label>{t('booking.participants')}</Label>
              <Input type="number" min={1} value={form.passengers} onChange={(e) => setForm({ ...form, passengers: parseInt(e.target.value) || 1 })} />
            </div>
            <div>
              <Label>{t('trainTickets.notes')}</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <Button className="w-full" onClick={handleSubmit}>{t('trainTickets.send')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default TrainTickets;
