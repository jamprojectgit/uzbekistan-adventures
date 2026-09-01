import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useLocalizedPath } from '@/lib/locale-path';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { getLocalizedText } from '@/lib/i18n-utils';

interface SearchResult {
  type: 'tour' | 'city';
  label: string;
  slug: string;
  citySlug?: string;
}

interface SearchAutocompleteProps {
  value: string;
  onChange: (v: string) => void;
  onNavigate?: () => void;
}

const SearchAutocomplete = ({ value, onChange, onNavigate }: SearchAutocompleteProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const localize = useLocalizedPath();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data: tours } = useQuery({
    queryKey: ['search-tours'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tours')
        .select('id, title, slug, description, cities(name, slug)');
      if (error) throw error;
      return data;
    },
    staleTime: 60000,
  });

  const { data: cities } = useQuery({
    queryKey: ['search-cities'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cities').select('id, name, slug');
      if (error) throw error;
      return data;
    },
    staleTime: 60000,
  });

  const suggestions: SearchResult[] = (() => {
    if (!value.trim() || value.trim().length < 2) return [];
    const q = value.toLowerCase().trim();
    const results: SearchResult[] = [];

    // Match cities
    cities?.forEach((city) => {
      const nameEn = ((city.name as any)?.en || '').toLowerCase();
      const nameRu = ((city.name as any)?.ru || '').toLowerCase();
      if (nameEn.includes(q) || nameRu.includes(q)) {
        results.push({
          type: 'city',
          label: getLocalizedText(city.name),
          slug: city.slug,
        });
      }
    });

    // Match tours
    tours?.forEach((tour) => {
      const titleEn = ((tour.title as any)?.en || '').toLowerCase();
      const titleRu = ((tour.title as any)?.ru || '').toLowerCase();
      const descEn = ((tour.description as any)?.en || '').toLowerCase();
      const descRu = ((tour.description as any)?.ru || '').toLowerCase();
      const cityName = tour.cities ? getLocalizedText((tour.cities as any).name) : '';
      
      if (
        titleEn.includes(q) ||
        titleRu.includes(q) ||
        descEn.includes(q) ||
        descRu.includes(q) ||
        cityName.toLowerCase().includes(q)
      ) {
        results.push({
          type: 'tour',
          label: getLocalizedText(tour.title),
          slug: tour.slug,
          citySlug: (tour.cities as any)?.slug,
        });
      }
    });

    return results.slice(0, 8);
  })();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    onChange('');
    if (result.type === 'tour') {
      navigate(localize(`/tours/${result.slug}`));
    } else {
      navigate(localize(`/tours?city=${result.slug}`));
    }
    onNavigate?.();
  };

  return (
    <div ref={wrapperRef} className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={t('home.searchPlaceholder')}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => value.trim().length >= 2 && setOpen(true)}
        className="pl-10 bg-background text-foreground"
      />
      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
          {suggestions.map((s, i) => (
            <button
              key={`${s.type}-${s.slug}-${i}`}
              className="w-full text-left px-4 py-2.5 hover:bg-muted text-sm flex items-center gap-2 transition-colors"
              onClick={() => handleSelect(s)}
            >
              <span className="text-xs font-medium text-muted-foreground uppercase w-10 shrink-0">
                {s.type === 'tour' ? (i18n.language === 'ru' ? 'Тур' : 'Tour') : (i18n.language === 'ru' ? 'Город' : 'City')}
              </span>
              <span className="text-foreground">{s.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;
