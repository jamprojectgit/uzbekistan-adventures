import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import PaymentNote from '@/components/PaymentNote';
import { calcTotalPrice, getDisplayPrice, getPriceLabel, formatTierRange, type PriceTier } from '@/lib/price-utils';


interface TourRequestWidgetProps {
  tourId: string;
  tourTitle: string;
  price: number;
  priceGroupSize?: number;
  pricingType?: string | null;
  tiers?: PriceTier[] | null;
}

const PHONE = '998990152110';

const timeSlots = Array.from({ length: 28 }, (_, i) => {
  const hour = Math.floor(i / 2) + 6;
  const minute = i % 2 === 0 ? '00' : '30';
  const h = hour.toString().padStart(2, '0');
  return `${h}:${minute}`;
});

const TourRequestWidget = ({ tourTitle, price, priceGroupSize = 1, pricingType, tiers }: TourRequestWidgetProps) => {
  const { t } = useTranslation();
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('');
  const [travelers, setTravelers] = useState(1);
  const [pickup, setPickup] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);

  const displayPrice = getDisplayPrice({ pricingType, price, tiers });
  const priceLabel = getPriceLabel(t, priceGroupSize, pricingType);
  const totalPrice = calcTotalPrice({ pricingType, price, priceGroupSize, tiers, travelers });

  const buildMessage = () => {
    return t('contact.tourRequestMessage', {
      tour: tourTitle,
      date: date ? format(date, 'dd.MM.yyyy') : '',
      time,
      travelers,
      pickup,
      total: totalPrice ?? t('tours.priceOnRequest'),
    });
  };

  const msg = encodeURIComponent(buildMessage());
  const waUrl = `https://wa.me/${PHONE}?text=${msg}`;
  const tgUrl = `https://t.me/+${PHONE}?text=${msg}`;

  const trackGoal = (goal: string) => {
    try { (window as any).ym?.(108500728, 'reachGoal', goal); } catch {}
  };

  const isValid = date && time && pickup;

  return (
    <Card className="shadow-lg border-0 overflow-hidden">
      {/* Price header */}
      <div className="bg-primary px-6 py-4">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-primary-foreground">${displayPrice}</span>
          <span className="text-primary-foreground/80 text-sm">{priceLabel}</span>
        </div>
        <PaymentNote className="text-primary-foreground/80" />
      </div>

      {pricingType === 'per_group' && tiers && tiers.length > 0 && (
        <div className="px-6 py-3 bg-primary/5 border-b border-border/60">
          <p className="text-xs font-semibold text-muted-foreground mb-2">{t('tours.groupPricing')}</p>
          <ul className="space-y-1">
            {tiers.map((tier, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{formatTierRange(tier)} {t('booking.people')}</span>
                <span className="font-semibold text-primary">${tier.price}</span>
              </li>
            ))}
          </ul>
        </div>
      )}




      <CardContent className="p-6 space-y-5">
        {/* Date */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            {t('booking.date')}
          </Label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal h-11',
                  !date && 'text-muted-foreground'
                )}
              >
                {date ? format(date, 'PPP') : t('booking.selectDate')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => { setDate(d); setCalendarOpen(false); }}
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
            {t('booking.startTime')}
          </Label>
          <Select value={time} onValueChange={setTime}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder={t('booking.selectTime')} />
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
            {t('booking.travelers')}
          </Label>
          <Select value={travelers.toString()} onValueChange={(v) => setTravelers(parseInt(v))}>
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                <SelectItem key={n} value={n.toString()}>
                  {n} {n === 1 ? t('booking.person') : t('booking.people')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pickup location */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            {t('booking.pickupLocation')}
          </Label>
          <Input
            className="h-11"
            placeholder={t('booking.pickupPlaceholder')}
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
          />
        </div>

        {/* Total */}
        <div className="pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">{t('booking.totalPrice')}</span>
            <span className="text-xl font-bold text-primary">
              {totalPrice === null ? t('tours.priceOnRequest') : `$${totalPrice}`}
            </span>
          </div>
          <PaymentNote />
        </div>


        {/* Buttons */}
        <div className="space-y-3 pt-2">
          <Button
            asChild
            className="w-full h-12 text-base font-semibold bg-[#25D366] hover:bg-[#1da851] text-white"
          >
            <a href={waUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackGoal('whatsapp_click')}>
              <MessageCircle className="h-5 w-5 mr-2" />
              WhatsApp
            </a>
          </Button>
          <Button
            asChild
            className="w-full h-12 text-base font-semibold bg-[#0088cc] hover:bg-[#006da3] text-white"
          >
            <a href={tgUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackGoal('telegram_click')}>
              <Send className="h-5 w-5 mr-2" />
              Telegram
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TourRequestWidget;
