import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  path: string;
  type?: string;
}

const BASE_URL = 'https://www.jamtrips.com';
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
  const fullTitle = title.includes('JamTrips') ? title : `${title} | JamTrips`;
  const canonicalUrl = `${BASE_URL}${path}`;
  const metaDescription = truncateAtWord(description);

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (attr: string, key: string, content: string) => {
      const els = Array.from(
        document.querySelectorAll(`meta[${attr}="${key}"]`)
      ) as HTMLMetaElement[];
      // Remove accidental duplicates so crawlers see a single value
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

    const links = Array.from(
      document.querySelectorAll('link[rel="canonical"]')
    ) as HTMLLinkElement[];
    links.slice(1).forEach((el) => el.remove());
    let link = links[0];
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonicalUrl);
  }, [fullTitle, metaDescription, canonicalUrl, type]);

  return null;
};

export default SEOHead;
