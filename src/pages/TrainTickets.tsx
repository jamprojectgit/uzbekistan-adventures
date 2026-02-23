import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { getLocalizedText } from '@/lib/i18n-utils';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Train, Clock, DollarSign } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const TrainTickets = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    travel_date: '',
    passengers: 1,
    notes: '',
  });

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['train-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('train_tickets')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async () => {
    if (!selectedTicket || !form.full_name || !form.phone || !form.travel_date) return;

    const { error } = await supabase.from('train_ticket_requests').insert({
      train_ticket_id: selectedTicket,
      user_id: user?.id || null,
      full_name: form.full_name,
      phone: form.phone,
      email: form.email || null,
      travel_date: form.travel_date,
      passengers: form.passengers,
      notes: form.notes || null,
    });

    if (error) {
      toast({ title: t('common.error'), variant: 'destructive' });
    } else {
      toast({ title: t('trainTickets.requestSuccess') });
      setSelectedTicket(null);
      setForm({ full_name: '', phone: '', email: '', travel_date: '', passengers: 1, notes: '' });
    }
  };

  return (
    <Layout>
      <section className="container mx-auto px-4 py-16">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('trainTickets.title')}</h1>
        <p className="text-muted-foreground mb-8 max-w-2xl">{t('trainTickets.subtitle')}</p>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-56 rounded-lg" />
            ))}
          </div>
        ) : tickets && tickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket) => (
              <Card key={ticket.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Train className="h-5 w-5 text-primary" />
                    {getLocalizedText(ticket.route)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Train className="h-4 w-4" />
                      {getLocalizedText(ticket.train_type)}
                    </span>
                    {ticket.duration > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {ticket.duration} {t('trainTickets.hours')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{getLocalizedText(ticket.description)}</p>
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary flex items-center gap-1">
                    <DollarSign className="h-5 w-5" />
                    {t('tours.from')} ${ticket.price_from}
                  </span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button onClick={() => setSelectedTicket(ticket.id)}>
                        {t('trainTickets.submitRequest')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t('trainTickets.requestForm')}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
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
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-12">{t('trainTickets.noTickets')}</p>
        )}
      </section>
    </Layout>
  );
};

export default TrainTickets;
