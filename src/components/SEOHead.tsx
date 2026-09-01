import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getHreflangUrls, SITE_URL } from '@/lib/hreflang';
import { langFromPath, stripLangPrefix, withLang } from '@/lib/locale-path';

interface SEOHeadProps {
  title: string;
  description: string;
  path: string;
  type?: string;
}

const MAX_DESCRIPTION = 158;

/** Trim to a max length without cutting a word in half. */
export const truncateAtWord = (text: string, max = MAX_DESCRIPTION) => {
  const clean = (text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const slice = clean.slice(0, max - 1);
  const lastSpace = slice.lastIndexOf(' ');
  const base = (lastSpace > 40 ? slice.slice(0, lastSpace) : slice).replace(/[\s.,;:—-]+$/, '');
  return `${base}…`;
};

const SEOHead = ({ title, description, path, type = 'website' }: SEOHeadProps) => {
  const { pathname } = useLocation();
  const lang = langFromPath(pathname);
  const cleanPath = stripLangPrefix(path);
  const localizedPath = withLang(cleanPath, lang);
  const fullTitle = title.includes('JamTrips') ? title : `${title} | JamTrips`;
  const canonicalUrl = `${SITE_URL}${localizedPath}`;
  const metaDescription = truncateAtWord(description);
  const alternates = getHreflangUrls(cleanPath);

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (attr: string, key: string, content: string) => {
      const els = Array.from(document.querySelectorAll(`meta[${attr}="${key}"]`)) as HTMLMetaElement[];
      els.slice(1).forEach((el) => el.remove());
      let el = els[0];
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('name', 'description', metaDescription);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', metaDescription);
    setMeta('property', 'og:url', canonicalUrl);
    setMeta('property', 'og:type', type);
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', metaDescription);

    const canonicals = Array.from(document.querySelectorAll('link[rel="canonical"]')) as HTMLLinkElement[];
    canonicals.slice(1).forEach((el) => el.remove());
    const canonical = canonicals[0] || document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = canonicalUrl;
    if (!canonical.parentNode) document.head.appendChild(canonical);

    const setAlternate = (hreflang: string, href: string) => {
      const selector = `link[rel="alternate"][hreflang="${hreflang}"]`;
      const links = Array.from(document.querySelectorAll(selector)) as HTMLLinkElement[];
      links.slice(1).forEach((el) => el.remove());
      const alternate = links[0] || document.createElement('link');
      alternate.rel = 'alternate';
      alternate.hreflang = hreflang;
      alternate.href = href;
      if (!alternate.parentNode) document.head.appendChild(alternate);
    };

    setAlternate('ru', alternates.ru);
    setAlternate('en', alternates.en);
    setAlternate('x-default', alternates.ru);
  }, [alternates.en, alternates.ru, canonicalUrl, fullTitle, metaDescription, type]);

  return null;
};

export default SEOHead;
