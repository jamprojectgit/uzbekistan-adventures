import type { AppLang } from './locale-path';
import { stripLangPrefix, withLang } from './locale-path';

export const SITE_URL = 'https://www.jamtrips.com';

export const localizedAbsoluteUrl = (path: string, lang: AppLang) =>
  `${SITE_URL}${withLang(stripLangPrefix(path), lang)}`;

export const getHreflangUrls = (path: string) => ({
  ru: localizedAbsoluteUrl(path, 'ru'),
  en: localizedAbsoluteUrl(path, 'en'),
});
