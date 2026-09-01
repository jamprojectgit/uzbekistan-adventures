import { Link } from 'react-router-dom';
import OptimizedImage from '@/components/OptimizedImage';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { getLocalizedText } from '@/lib/i18n-utils';
import { formatDuration } from '@/lib/duration-utils';
import { getPriceLabel, getDisplayPrice, type PriceTier } from '@/lib/price-utils';
import { MapPin, Clock, ChevronRight } from 'lucide-react';
import ShareButton from '@/components/ShareButton';
import PaymentNote from '@/components/PaymentNote';


interface TourCardProps {
  tour: {
    id: string;
    title: unknown;
    slug: string;
    description: unknown;
    price: number;
    price_group_size?: number | null;
    pricing_type?: string | null;
    tour_price_tiers?: PriceTier[] | null;
    duration: number;
    duration_value?: number | null;
    duration_unit?: string | null;
    images: string[] | null;
    cities?: { name: unknown } | null;
  };
}

const TourCard = ({ tour }: TourCardProps) => {
  const { t } = useTranslation();
  const title = getLocalizedText(tour.title);
  const desc = getLocalizedText(tour.description);
  const cityName = tour.cities ? getLocalizedText(tour.cities.name) : '';
  const image = tour.images?.[0] || '/placeholder.svg';
  const displayPrice = getDisplayPrice({ pricingType: tour.pricing_type, price: tour.price, tiers: tour.tour_price_tiers });

  return (
    <Link to={`/tours/${tour.slug}`}>
      <Card className="overflow-hidden group hover:shadow-lg transition-shadow h-full">
        <div className="aspect-[4/3] overflow-hidden relative">
          <OptimizedImage src={image} alt={title} maxWidth={800} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <ShareButton title={title} url={`${window.location.origin}/tours/${tour.slug}`} className="absolute top-2 right-2 w-8 h-8 z-10" size={16} />
        </div>
        <CardContent className="p-4 space-y-1.5">
          <h3 className="font-semibold text-lg">{title}</h3>
          {cityName && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" /> {cityName}
            </p>
          )}
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 shrink-0" /> {formatDuration(tour.duration_value ?? tour.duration, tour.duration_unit ?? 'days')}
          </p>
          <p className="text-sm text-muted-foreground line-clamp-2">{desc}</p>
          <div className="pt-1.5 flex items-center justify-between">
            <span className="font-bold text-primary">${displayPrice} <span className="text-xs font-normal text-muted-foreground">{getPriceLabel(t, tour.price_group_size, tour.pricing_type)}</span></span>
            <span className="flex items-center justify-center w-[42px] h-[42px] rounded-full bg-primary shadow-md group-hover:shadow-lg transition-shadow">
              <ChevronRight className="h-5 w-5 text-primary-foreground" />
            </span>
          </div>
          <PaymentNote />
        </CardContent>

      </Card>
    </Link>
  );
};

export default TourCard;
