import type { TFunction } from 'i18next';

export const getPriceLabel = (t: TFunction, priceGroupSize?: number | null): string => {
  const size = Math.max(1, Number(priceGroupSize) || 1);
  return size > 1 ? t('tours.forUpTo', { count: size }) : t('tours.perPerson');
};
