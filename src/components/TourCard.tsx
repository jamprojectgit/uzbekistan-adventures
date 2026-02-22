import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { getLocalizedText } from '@/lib/i18n-utils';
import { MapPin } from 'lucide-react';

interface TourCardProps {
  tour: {
    id: string;
    title: unknown;
    slug: string;
    description: unknown;
    price: number;
    duration: number;
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

  return (
    <Link to={`/tours/${tour.slug}`}>
      <Card className="overflow-hidden group hover:shadow-lg transition-shadow h-full">
        <div className="aspect-[4/3] overflow-hidden">
          <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <CardContent className="p-4 space-y-2">
          <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>
          {cityName && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {cityName}
            </p>
          )}
          <p className="text-sm text-muted-foreground line-clamp-2">{desc}</p>
          <div className="flex items-center justify-between pt-2">
            <span className="font-bold text-primary">${tour.price} <span className="text-xs font-normal text-muted-foreground">{t('tours.perPerson')}</span></span>
            <span className="text-sm text-muted-foreground">{tour.duration} {tour.duration === 1 ? t('tours.day') : t('tours.days')}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default TourCard;
