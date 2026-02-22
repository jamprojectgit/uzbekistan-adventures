import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { getLocalizedText } from '@/lib/i18n-utils';

interface CityCardProps {
  city: {
    id: string;
    name: unknown;
    slug: string;
    cover_image: string | null;
  };
}

const CityCard = ({ city }: CityCardProps) => {
  const { t } = useTranslation();
  const name = getLocalizedText(city.name);

  return (
    <Link to={`/tours?city=${city.slug}`}>
      <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
        <div className="aspect-[3/2] relative overflow-hidden">
          <img
            src={city.cover_image || '/placeholder.svg'}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-lg font-bold text-white">{name}</h3>
            <p className="text-sm text-white/80">{t('cities.viewTours')}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default CityCard;
