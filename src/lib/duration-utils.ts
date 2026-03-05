import i18n from '@/i18n';

export function formatDuration(value: number, unit: string): string {
  const t = i18n.t.bind(i18n);
  if (unit === 'hours') {
    return `${value} ${value === 1 ? t('tours.hour') : t('tours.hours')}`;
  }
  return `${value} ${value === 1 ? t('tours.day') : t('tours.days')}`;
}
