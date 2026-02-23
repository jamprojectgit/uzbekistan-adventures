import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { getLocalizedText } from '@/lib/i18n-utils';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Car, MapPin, Users } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const Transfers = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTransfer, setSelectedTransfer] = useState<string | null>(null);
  const [form, setForm] = useState({
    pickup_date: '',
    pickup_time: '',
    passengers: 1,
    pickup_address: '',
    dropoff_address: '',
    phone: '',
  });

  const { data: transfers, isLoading } = useQuery({
    queryKey: ['transfers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transfers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleBook = async () => {
    if (!user) {
      toast({ title: t('booking.loginRequired'), variant: 'destructive' });
      return;
    }
    if (!selectedTransfer || !form.pickup_date || !form.pickup_time || !form.phone) return;

    const { error } = await supabase.from('transfer_bookings').insert({
      transfer_id: selectedTransfer,
      user_id: user.id,
      pickup_date: form.pickup_date,
      pickup_time: form.pickup_time,
      passengers: form.passengers,
      pickup_address: form.pickup_address,
      dropoff_address: form.dropoff_address,
      phone: form.phone,
    });

    if (error) {
      toast({ title: t('common.error'), variant: 'destructive' });
    } else {
      toast({ title: t('transfers.bookingSuccess') });
      setSelectedTransfer(null);
      setForm({ pickup_date: '', pickup_time: '', passengers: 1, pickup_address: '', dropoff_address: '', phone: '' });
    }
  };

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
                {transfer.image && (
                  <div className="h-48 overflow-hidden rounded-t-lg">
                    <img src={transfer.image} alt={getLocalizedText(transfer.route)} className="w-full h-full object-cover" />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                    {getLocalizedText(transfer.route)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Car className="h-4 w-4" />
                    <span>{getLocalizedText(transfer.car_type)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{getLocalizedText(transfer.description)}</p>
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">${transfer.price}</span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button onClick={() => setSelectedTransfer(transfer.id)}>
                        {t('transfers.book')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t('transfers.bookTransfer')}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label>{t('transfers.pickupDate')}</Label>
                          <Input type="date" value={form.pickup_date} onChange={(e) => setForm({ ...form, pickup_date: e.target.value })} />
                        </div>
                        <div>
                          <Label>{t('transfers.pickupTime')}</Label>
                          <Input type="time" value={form.pickup_time} onChange={(e) => setForm({ ...form, pickup_time: e.target.value })} />
                        </div>
                        <div>
                          <Label>{t('booking.participants')}</Label>
                          <Input type="number" min={1} value={form.passengers} onChange={(e) => setForm({ ...form, passengers: parseInt(e.target.value) || 1 })} />
                        </div>
                        <div>
                          <Label>{t('transfers.pickupAddress')}</Label>
                          <Input value={form.pickup_address} onChange={(e) => setForm({ ...form, pickup_address: e.target.value })} />
                        </div>
                        <div>
                          <Label>{t('transfers.dropoffAddress')}</Label>
                          <Input value={form.dropoff_address} onChange={(e) => setForm({ ...form, dropoff_address: e.target.value })} />
                        </div>
                        <div>
                          <Label>{t('transfers.phone')}</Label>
                          <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                        </div>
                        <Button className="w-full" onClick={handleBook}>{t('transfers.confirmBooking')}</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
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
