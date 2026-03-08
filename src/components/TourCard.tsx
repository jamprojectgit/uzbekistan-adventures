import { Link } from 'react-router-dom';
import OptimizedImage from '@/components/OptimizedImage';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { getLocalizedText } from '@/lib/i18n-utils';
import { formatDuration } from '@/lib/duration-utils';
import { MapPin, Clock, ChevronRight, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TourCardProps {
  tour: {
    id: string;
    title: unknown;
    slug: string;
    description: unknown;
    price: number;
    duration: number;
    duration_value?: number | null;
    duration_unit?: string | null;
    images: string[] | null;
    cities?: { name: unknown } | null;
  };
}

const PHONE = '998990152110';

const TourCard = ({ tour }: TourCardProps) => {
  const { t } = useTranslation();
  const title = getLocalizedText(tour.title);
  const desc = getLocalizedText(tour.description);
  const cityName = tour.cities ? getLocalizedText(tour.cities.name) : '';
  const image = tour.images?.[0] || '/placeholder.svg';

  const contactMessage = encodeURIComponent(`Hello, I'm interested in this tour: ${title}`);
  const waUrl = `https://wa.me/${PHONE}?text=${contactMessage}`;
  const tgUrl = `https://t.me/+${PHONE}?text=${contactMessage}`;

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow h-full flex flex-col">
      <Link to={`/tours/${tour.slug}`}>
        <div className="aspect-[4/3] overflow-hidden">
          <OptimizedImage src={image} alt={title} sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
      </Link>
      <CardContent className="p-4 space-y-1.5 flex-1 flex flex-col">
        <Link to={`/tours/${tour.slug}`} className="space-y-1.5 flex-1">
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
            <span className="font-bold text-primary">${tour.price} <span className="text-xs font-normal text-muted-foreground">{t('tours.perPerson')}</span></span>
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-muted group-hover:bg-muted-foreground/20 transition-colors">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </span>
          </div>
        </Link>
        <div className="flex gap-2 pt-2">
          <Button size="sm" className="bg-[#25D366] hover:bg-[#1da851] text-white flex-1 h-9" asChild>
            <a href={waUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
              <MessageCircle className="h-4 w-4 mr-1" />
              WhatsApp
            </a>
          </Button>
          <Button size="sm" className="bg-[#0088cc] hover:bg-[#006da3] text-white flex-1 h-9" asChild>
            <a href={tgUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
              <Send className="h-4 w-4 mr-1" />
              Telegram
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TourCard;
