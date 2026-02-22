import i18n from '@/i18n';

export function getLocalizedText(jsonb: unknown): string {
  if (!jsonb) return '';
  if (typeof jsonb === 'string') return jsonb;
  const lang = i18n.language || 'en';
  const obj = jsonb as Record<string, string>;
  return obj[lang] || obj['en'] || '';
}

export function getLocalizedArray(jsonb: unknown): string[] {
  if (!jsonb) return [];
  if (Array.isArray(jsonb)) return jsonb;
  const lang = i18n.language || 'en';
  const obj = jsonb as Record<string, string[]>;
  return obj[lang] || obj['en'] || [];
}
