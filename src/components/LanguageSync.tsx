import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { langFromPath, stripLangPrefix, withLang } from '@/lib/locale-path';

const STORAGE_KEY = 'i18nextLng';

/**
 * Keeps i18next, <html lang> and the URL language segment in sync.
 * "/" = Russian, "/en/..." = English.
 */
const LanguageSync = () => {
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const lang = langFromPath(pathname);

  // First visit only: send non-Russian browsers to the English tree.
  useEffect(() => {
    if (lang !== 'ru') return;
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* storage blocked */
    }
    if (stored) return;
    const nav = (navigator.language || '').toLowerCase();
    if (nav.startsWith('ru') || nav.startsWith('uz') || nav.startsWith('kk')) return;
    const target = withLang(stripLangPrefix(pathname), 'en');
    if (target !== pathname) navigate(`${target}${search}${hash}`, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (i18n.language !== lang) i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
  }, [lang, i18n]);

  return null;
};

export default LanguageSync;
