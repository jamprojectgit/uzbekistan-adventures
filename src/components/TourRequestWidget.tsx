import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, MapPin, Users, Clock, MessageCircle, Send } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TourRequestWidgetProps {
  tourId: string;
  tourTitle: string;
  price: number;
}

const PHONE = '998990152110';

const timeSlots = Array.from({ length: 28 }, (_, i) => {
  const hour = Math.floor(i / 2) + 6;
  const minute = i % 2 === 0 ? '00' : '30';
  const h = hour.toString().padStart(2, '0');
  return `${h}:${minute}`;
});

const TourRequestWidget = ({ tourId, tourTitle, price }: TourRequestWidgetProps) => {
  const { t } = useTranslation();
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('');
  const [travelers, setTravelers] = useState(1);
  const [pickup, setPickup] = useState('');
  const [loading, setLoading] = useState(false);

  const buildMessage = () => {
    return `Hello!

I want to request this tour.

Tour: ${tourTitle}
Date: ${date ? format(date, 'dd.MM.yyyy') : ''}
Start time: ${time}
Travelers: ${travelers}
Pickup location: ${pickup}

Please confirm availability.`;
  };

  const saveAndOpen = async (channel: 'whatsapp' | 'telegram') => {
    if (!date || !time || !pickup) {
      toast.error(t('booking.fillAllFields', 'Please fill in all fields'));
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('tour_requests').insert({
      tour_id: tourId,
      tour_title: tourTitle,
      date: format(date, 'yyyy-MM-dd'),
      time,
      travelers,
      pickup_location: pickup,
    });

    if (error) {
      console.error('Error saving tour request:', error);
    }

    const msg = encodeURIComponent(buildMessage());

    if (channel === 'whatsapp') {
      window.open(`https://wa.me/${PHONE}?text=${msg}`, '_blank');
    } else {
      window.open(`https://t.me/+${PHONE}?text=${msg}`, '_blank');
    }

    setLoading(false);
  };

  const isValid = date && time && pickup;

  return (
    <Card className="shadow-lg border-0 overflow-hidden">
      {/* Price header */}
      <div className="bg-primary px-6 py-4">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-primary-foreground">${price}</span>
          <span className="text-primary-foreground/80 text-sm">{t('tours.perPerson')}</span>
        </div>
      </div>

      <CardContent className="p-6 space-y-5">
        {/* Date */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            {t('booking.date', 'Date')}
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal h-11',
                  !date && 'text-muted-foreground'
                )}
              >
                {date ? format(date, 'PPP') : t('booking.selectDate', 'Select date')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(d) => d < new Date()}
                className={cn('p-3 pointer-events-auto')}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <Clock className="h-4 w-4 text-muted-foreground" />
            {t('booking.startTime', 'Start time')}
          </Label>
          <Select value={time} onValueChange={setTime}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder={t('booking.selectTime', 'Select time')} />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((slot) => (
                <SelectItem key={slot} value={slot}>
                  {slot}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Travelers */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <Users className="h-4 w-4 text-muted-foreground" />
            {t('booking.travelers', 'Travelers')}
          </Label>
          <Select value={travelers.toString()} onValueChange={(v) => setTravelers(parseInt(v))}>
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                <SelectItem key={n} value={n.toString()}>
                  {n} {n === 1 ? t('booking.person', 'person') : t('booking.people', 'people')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pickup location */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            {t('booking.pickupLocation', 'Pickup location')}
          </Label>
          <Input
            className="h-11"
            placeholder={t('booking.pickupPlaceholder', 'Hotel name, address, airport...')}
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
          />
        </div>

        {/* Buttons */}
        <div className="space-y-3 pt-2">
          <Button
            className="w-full h-12 text-base font-semibold bg-[#25D366] hover:bg-[#1da851] text-white"
            disabled={!isValid || loading}
            onClick={() => saveAndOpen('whatsapp')}
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            WhatsApp
          </Button>
          <Button
            className="w-full h-12 text-base font-semibold bg-[#0088cc] hover:bg-[#006da3] text-white"
            disabled={!isValid || loading}
            onClick={() => saveAndOpen('telegram')}
          >
            <Send className="h-5 w-5 mr-2" />
            Telegram
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TourRequestWidget;
