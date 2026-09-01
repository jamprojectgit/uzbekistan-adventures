import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';

export type AppLang = 'ru' | 'en';

/** Russian lives at the site root; English is served under /en. */
export const DEFAULT_LANG: AppLang = 'ru';
export const PREFIXED_LANG: AppLang = 'en';

/** Paths that are never language-prefixed (private / non-indexed areas). */
const UNPREFIXED = ['/admin', '/login', '/signup', '/my-bookings'];

export const langFromPath = (pathname: string): AppLang =>
  /^\/en(\/|$)/.test(pathname) ? 'en' : 'ru';

export const stripLangPrefix = (pathname: string): string => {
  const p = (pathname || '/').replace(/^\/en(?=\/|$)/, '');
  return p === '' ? '/' : p;
};

export const withLang = (path: string, lang: AppLang): string => {
  const raw = path.startsWith('/') ? path : `/${path}`;
  const clean = stripLangPrefix(raw);
  if (lang !== 'en') return clean;
  if (UNPREFIXED.some((p) => clean === p || clean.startsWith(`${p}/`))) return clean;
  return clean === '/' ? '/en' : `/en${clean}`;
};

/** Current language derived from the URL (single source of truth). */
export const useLang = (): AppLang => langFromPath(useLocation().pathname);

/** Prefixes an app path with the current language segment. */
export const useLocalizedPath = () => {
  const lang = useLang();
  return useCallback((path: string) => withLang(path, lang), [lang]);
};
