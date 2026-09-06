import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
] as const;

interface Props {
  className?: string;
  onChanged?: () => void;
}

const LanguageSwitcher = ({ className, onChanged }: Props) => {
  const { i18n } = useTranslation();
  const current = (i18n.resolvedLanguage || i18n.language || 'en').slice(0, 2);

  const setLang = (code: string) => {
    if (code === current) return;
    try {
      localStorage.setItem('i18nextLng', code);
    } catch {
      /* storage may be blocked */
    }
    i18n.changeLanguage(code);
    onChanged?.();
  };

  return (
    <div className={cn('flex items-center rounded-md border border-border overflow-hidden', className)}>
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          aria-label={`Switch language to ${l.label}`}
          aria-pressed={current === l.code}
          onClick={() => setLang(l.code)}
          className={cn(
            'px-2.5 py-1.5 text-xs font-semibold transition-colors',
            current === l.code
              ? 'bg-primary text-primary-foreground'
              : 'bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
