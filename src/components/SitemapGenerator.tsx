import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const BASE_URL = 'https://www.uztravelmarket.uz';

const staticPages = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/tours', priority: '0.9', changefreq: 'daily' },
  { path: '/cities', priority: '0.8', changefreq: 'weekly' },
  { path: '/transfers', priority: '0.8', changefreq: 'weekly' },
  { path: '/train-tickets', priority: '0.8', changefreq: 'weekly' },
];

const SitemapGenerator = () => {
  const { data: tours } = useQuery({
    queryKey: ['sitemap-tours'],
    queryFn: async () => {
      const { data } = await supabase.from('tours').select('slug, created_at');
      return data || [];
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  useEffect(() => {
    if (!tours) return;

    const today = new Date().toISOString().split('T')[0];

    const urls = [
      ...staticPages.map(p => `
  <url>
    <loc>${BASE_URL}${p.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`),
      ...tours.map(t => `
  <url>
    <loc>${BASE_URL}/tours/${t.slug}</loc>
    <lastmod>${t.created_at?.split('T')[0] || today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

    // Store for the edge function to serve
    sessionStorage.setItem('sitemap-xml', xml);
  }, [tours]);

  return null;
};

export default SitemapGenerator;
