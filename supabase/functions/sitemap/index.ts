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

function slugify(city: string) {
  return city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const today = new Date().toISOString().split('T')[0];

  // Fetch all dynamic data in parallel
  const [toursRes, citiesRes, transfersRes, trainRoutesRes] = await Promise.all([
    supabase.from('tours').select('slug, created_at'),
    supabase.from('cities').select('slug, created_at'),
    supabase.from('transfers').select('from_city, to_city, created_at').eq('status', 'published'),
    supabase.from('train_routes').select('from_city, to_city, created_at').eq('status', 'published'),
  ]);

  const tours = toursRes.data || [];
  const cities = citiesRes.data || [];
  const transfers = transfersRes.data || [];
  const trainRoutes = trainRoutesRes.data || [];

  // Deduplicate transfer routes
  const transferSlugs = new Set<string>();
  const transferUrls: string[] = [];
  for (const tr of transfers) {
    const slug = `${slugify(tr.from_city)}-to-${slugify(tr.to_city)}-transfer`;
    if (!transferSlugs.has(slug)) {
      transferSlugs.add(slug);
      transferUrls.push(`
  <url>
    <loc>${BASE_URL}/transfers/${slug}</loc>
    <lastmod>${tr.created_at?.split('T')[0] || today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
    }
  }

  // Deduplicate train routes
  const trainSlugs = new Set<string>();
  const trainUrls: string[] = [];
  for (const r of trainRoutes) {
    const slug = `${slugify(r.from_city)}-to-${slugify(r.to_city)}-train`;
    if (!trainSlugs.has(slug)) {
      trainSlugs.add(slug);
      trainUrls.push(`
  <url>
    <loc>${BASE_URL}/train-tickets/${slug}</loc>
    <lastmod>${r.created_at?.split('T')[0] || today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
    }
  }

  const urls = [
    ...staticPages.map(p => `
  <url>
    <loc>${BASE_URL}${p.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`),
    ...(tours).map((t: any) => `
  <url>
    <loc>${BASE_URL}/tours/${t.slug}</loc>
    <lastmod>${t.created_at?.split('T')[0] || today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`),
    ...(cities).map((c: any) => `
  <url>
    <loc>${BASE_URL}/cities/${c.slug}</loc>
    <lastmod>${c.created_at?.split('T')[0] || today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`),
    ...transferUrls,
    ...trainUrls,
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new Response(xml, { headers: corsHeaders });
});
