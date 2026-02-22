import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface BookingFormProps {
  tourId: string;
  price: number;
}

const BookingForm = ({ tourId, price }: BookingFormProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [date, setDate] = useState<Date>();
  const [participants, setParticipants] = useState(1);
  const [loading, setLoading] = useState(false);

  const totalPrice = price * participants;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !date) return;

    setLoading(true);
    const { error } = await supabase.from('bookings').insert({
      tour_id: tourId,
      user_id: user.id,
      booking_date: format(date, 'yyyy-MM-dd'),
      participants,
      total_price: totalPrice,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('booking.success'));
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6 text-center space-y-4">
          <p className="text-muted-foreground">{t('booking.loginRequired')}</p>
          <Button asChild><Link to="/login">{t('nav.login')}</Link></Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('booking.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t('booking.date')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : t('booking.date')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) => d < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>{t('booking.participants')}</Label>
            <Input
              type="number"
              min={1}
              max={20}
              value={participants}
              onChange={(e) => setParticipants(parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="flex justify-between items-center py-3 border-t border-border">
            <span className="font-medium">{t('booking.totalPrice')}</span>
            <span className="text-xl font-bold text-primary">${totalPrice}</span>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !date}>
            {loading ? t('common.loading') : t('booking.submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BookingForm;
