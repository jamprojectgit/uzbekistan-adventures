import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { getLocalizedText } from '@/lib/i18n-utils';
import { format } from 'date-fns';

const AdminBookings = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, tours(title), profiles(full_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success('Status updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{t('admin.bookings')}</h2>
      {isLoading ? <Skeleton className="h-48" /> : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tour</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Participants</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings?.map(b => (
              <TableRow key={b.id}>
                <TableCell>{getLocalizedText((b.tours as any)?.title)}</TableCell>
                <TableCell>{(b.profiles as any)?.full_name || 'N/A'}</TableCell>
                <TableCell>{format(new Date(b.booking_date), 'PP')}</TableCell>
                <TableCell>{b.participants}</TableCell>
                <TableCell>${b.total_price}</TableCell>
                <TableCell>
                  <Select value={b.status} onValueChange={(v) => updateStatus.mutate({ id: b.id, status: v })}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">{t('booking.pending')}</SelectItem>
                      <SelectItem value="confirmed">{t('booking.confirmed')}</SelectItem>
                      <SelectItem value="cancelled">{t('booking.cancelled')}</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default AdminBookings;
