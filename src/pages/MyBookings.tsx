import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getLocalizedText } from '@/lib/i18n-utils';
import { Navigate } from 'react-router-dom';
import { format } from 'date-fns';

const MyBookings = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['my-bookings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, tours(title, slug)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (!authLoading && !user) return <Navigate to="/login" />;

  const statusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{t('booking.myBookings')}</h1>
        {isLoading ? (
          <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-24" />)}</div>
        ) : bookings && bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{getLocalizedText((booking.tours as any)?.title)}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(booking.booking_date), 'PPP')} · {booking.participants} {t('booking.participants').toLowerCase()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">${booking.total_price}</span>
                    <Badge variant={statusColor(booking.status)}>{t(`booking.${booking.status}`)}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-16">{t('booking.noBookings')}</p>
        )}
      </div>
    </Layout>
  );
};

export default MyBookings;
