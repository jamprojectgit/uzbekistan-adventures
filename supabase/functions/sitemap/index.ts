import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8',
};

const BASE_URL = 'https://jamtrips.com';

const staticPages = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/tours', priority: '0.9', changefreq: 'daily' },
  { path: '/cities', priority: '0.8', changefreq: 'weekly' },
  { path: '/transfers', priority: '0.8', changefreq: 'weekly' },
  { path: '/train-tickets', priority: '0.8', changefreq: 'weekly' },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const today = new Date().toISOString().split('T')[0];

  // Fetch tours
  const { data: tours } = await supabase.from('tours').select('slug, created_at');

  const urls = [
    ...staticPages.map(p => `
  <url>
    <loc>${BASE_URL}${p.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`),
    ...(tours || []).map((t: any) => `
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

  return new Response(xml, { headers: corsHeaders });
});
