import type { TFunction } from 'i18next';

export type PricingType = 'per_person' | 'per_group';

export interface PriceTier {
  id?: string;
  min_people: number;
  max_people: number;
  price: number;
}

export const getPricingType = (value: unknown): PricingType =>
  value === 'per_group' ? 'per_group' : 'per_person';

export const sortTiers = <T extends PriceTier>(tiers: T[]): T[] =>
  [...(tiers || [])].sort((a, b) => a.min_people - b.min_people);

export const findTier = <T extends PriceTier>(tiers: T[] | null | undefined, travelers: number): T | null =>
  (tiers || []).find((tier) => travelers >= tier.min_people && travelers <= tier.max_people) ?? null;

/** Total price for the given traveler count, or null when no matching group tier exists. */
export const calcTotalPrice = (params: {
  pricingType?: unknown;
  price: number;
  priceGroupSize?: number | null;
  tiers?: PriceTier[] | null;
  travelers: number;
}): number | null => {
  const { price, priceGroupSize, tiers, travelers } = params;
  if (getPricingType(params.pricingType) === 'per_group') {
    const tier = findTier(tiers, travelers);
    return tier ? tier.price : null;
  }
  const size = Math.max(1, Number(priceGroupSize) || 1);
  return Math.ceil(travelers / size) * price;
};

/** Label shown next to a price (e.g. "per person" / "per group"). */
export const getPriceLabel = (
  t: TFunction,
  priceGroupSize?: number | null,
  pricingType?: unknown,
): string => {
  if (getPricingType(pricingType) === 'per_group') return t('tours.perGroup');
  const size = Math.max(1, Number(priceGroupSize) || 1);
  return size > 1 ? t('tours.forUpTo', { count: size }) : t('tours.perPerson');
};

/** Headline price used on cards / detail header. For per_group it's the cheapest tier. */
export const getDisplayPrice = (params: {
  pricingType?: unknown;
  price: number;
  tiers?: PriceTier[] | null;
}): number => {
  if (getPricingType(params.pricingType) === 'per_group') {
    const tiers = params.tiers || [];
    if (tiers.length > 0) return Math.min(...tiers.map((tier) => tier.price));
  }
  return params.price;
};

export const formatTierRange = (tier: PriceTier): string =>
  tier.min_people === tier.max_people ? `${tier.min_people}` : `${tier.min_people}–${tier.max_people}`;

/** Returns an error message (RU, admin-facing) or null when the tier set is valid. */
export const validateTiers = (tiers: PriceTier[]): string | null => {
  if (!tiers.length) return 'Добавьте хотя бы один ценовой диапазон';
  for (const tier of tiers) {
    if (!Number.isInteger(tier.min_people) || !Number.isInteger(tier.max_people) || tier.min_people < 1 || tier.max_people < 1) {
      return 'Количество путешественников должно быть положительным целым числом';
    }
    if (tier.min_people > tier.max_people) return 'Значение From не может быть больше To';
    if (!Number.isFinite(tier.price) || tier.price < 0) return 'Цена не может быть отрицательной';
  }
  const sorted = sortTiers(tiers);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].min_people <= sorted[i - 1].max_people) {
      return `Диапазоны пересекаются: ${formatTierRange(sorted[i - 1])} и ${formatTierRange(sorted[i])}`;
    }
  }
  return null;
};
