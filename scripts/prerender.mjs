/**
 * Static pre-rendering of per-page <head> metadata.
 *
 * Runs after `vite build`. Fetches dynamic routes (cities, tours, transfers,
 * train routes) from the backend and writes a copy of dist/index.html for each
 * route with unique title / description / canonical / og:* / twitter:* tags
 * baked in, so crawlers that do not execute JavaScript (Yandex, WhatsApp,
 * Telegram, Facebook) see the correct metadata.
 *
 * The app itself is untouched: React still hydrates the same bundle and
 * SEOHead keeps updating the head on client-side navigation.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist');
const BASE_URL = 'https://www.jamtrips.com';
const MAX_DESCRIPTION = 158;

// Env comes from the build environment; fall back to a local .env file.
function loadEnvFile() {
  try {
    const raw = readFileSync(path.resolve('.env'), 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch {
    /* no .env — rely on the build environment */
  }
}
loadEnvFile();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const truncateAtWord = (text, max = MAX_DESCRIPTION) => {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const slice = clean.slice(0, max - 1);
  const lastSpace = slice.lastIndexOf(' ');
  const base = (lastSpace > 40 ? slice.slice(0, lastSpace) : slice).replace(/[\s.,;:—-]+$/, '');
  return `${base}…`;
};

const localized = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.en || Object.values(value)[0] || '';
};

const slugify = (city) =>
  String(city || '').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

async function select(table, query) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  const url = `${SUPABASE_URL}/rest/v1/${table}?${query}`;
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) {
    console.warn(`[prerender] ${table}: ${res.status} ${await res.text()}`);
    return [];
  }
  return res.json();
}

// Sitewide organization node (also present statically in index.html).
const ORGANIZATION_REF = { '@id': `${BASE_URL}/#organization`, '@type': 'TravelAgency', name: 'JamTrips' };


const breadcrumb = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: `${BASE_URL}${item.path}`,
  })),
});

const renderJsonLd = (blocks) =>
  (blocks || [])
    .map(
      (block) =>
        `<script type="application/ld+json">${JSON.stringify(block).replace(/</g, '\\u003c')}</script>`,
    )
    .join('\n    ');


async function collectRoutes() {
  const routes = [
    {
      path: '/tours',
      title: 'Uzbekistan Tours | Private Tours in Samarkand, Bukhara & Khiva',
      description:
        'Browse and book guided tours across Uzbekistan. Explore Samarkand, Bukhara, Khiva, Tashkent and more with experienced local guides.',
    },
    {
      path: '/cities',
      title: 'Uzbekistan Cities Guide | Samarkand, Bukhara, Khiva & Tashkent',
      description:
        'Explore the ancient cities of Uzbekistan. Discover Samarkand, Bukhara, Khiva, Tashkent and plan your perfect trip.',
    },
    {
      path: '/transfers',
      title: 'Uzbekistan Private Transfers | Transport Between Cities',
      description:
        'Book comfortable private transfers across Uzbekistan. Airport pickups, intercity transfers between Samarkand, Bukhara, Khiva, Tashkent and more.',
    },
    {
      path: '/train-tickets',
      title: 'Uzbekistan Train Tickets | Afrosiyob High-Speed Railway Booking',
      description:
        'Book train tickets between Uzbekistan cities. Afrosiyob high-speed and Sharq train schedules, Tashkent to Samarkand, Bukhara, Khiva routes.',
    },
  ];

  const [cities, tours, transfers, trains] = await Promise.all([
    select('cities', 'select=slug,name,description,cover_image'),
    select('tours', 'select=slug,title,description,images,price,price_group_size,duration,cities(name,slug)'),
    select('transfers', 'select=from_city,to_city&status=eq.published'),
    select(
      'train_routes',
      'select=from_city,to_city,train_type,departure_time,arrival_time,price,currency,operating_days&status=eq.published',
    ),
  ]);

  for (const city of cities) {
    if (!city.slug) continue;
    const name = localized(city.name);
    const description =
      localized(city.description) ||
      `Explore ${name}, Uzbekistan. Book tours, transfers, and activities in ${name}.`;
    routes.push({
      path: `/cities/${city.slug}`,
      title: `${name} Travel Guide | Tours & Things to Do in ${name}, Uzbekistan`,
      description,
      image: city.cover_image,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'City',
          name,
          description: truncateAtWord(description, 300),
          containedInPlace: { '@type': 'Country', name: 'Uzbekistan' },
          url: `${BASE_URL}/cities/${city.slug}`,
          ...(city.cover_image ? { image: city.cover_image } : {}),
        },
        breadcrumb([
          { name: 'Home', path: '/' },
          { name: 'Cities', path: '/cities' },
          { name, path: `/cities/${city.slug}` },
        ]),
      ],
    });
  }

  for (const tour of tours) {
    if (!tour.slug) continue;
    const title = localized(tour.title);
    const cityName = localized(tour.cities?.name) || 'Uzbekistan';
    const description =
      localized(tour.description) || `${title} — book this tour in ${cityName} with JamTrips.`;
    const image = Array.isArray(tour.images) ? tour.images[0] : undefined;
    routes.push({
      path: `/tours/${tour.slug}`,
      title: `${title} — Tour in ${cityName}`,
      description,
      image,
      type: 'article',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'TouristTrip',
          name: title,
          description: truncateAtWord(description, 300),
          url: `${BASE_URL}/tours/${tour.slug}`,
          touristType: 'Leisure',
          ...(image ? { image } : {}),
          ...(tour.price
            ? {
                offers: {
                  '@type': 'Offer',
                  price: tour.price,
                  priceCurrency: 'USD',
                  availability: 'https://schema.org/InStock',
                  url: `${BASE_URL}/tours/${tour.slug}`,
                },
              }
            : {}),
          itinerary: {
            '@type': 'Place',
            name: cityName,
            address: { '@type': 'PostalAddress', addressCountry: 'UZ' },
          },
          provider: ORGANIZATION_REF,
        },
        breadcrumb([
          { name: 'Home', path: '/' },
          { name: 'Tours', path: '/tours' },
          { name: title, path: `/tours/${tour.slug}` },
        ]),
      ],
    });
  }

  const seen = new Set();
  for (const t of transfers) {
    const slug = `${slugify(t.from_city)}-to-${slugify(t.to_city)}-transfer`;
    if (seen.has(slug)) continue;
    seen.add(slug);
    routes.push({
      path: `/transfers/${slug}`,
      title: `${t.from_city} to ${t.to_city} Transfer | Private Car Service in Uzbekistan`,
      description: `Book a private transfer from ${t.from_city} to ${t.to_city}, Uzbekistan. Choose from sedan, minivan, or minibus options with professional drivers.`,
    });
  }

  const trainsBySlug = new Map();
  for (const r of trains) {
    const slug = `${slugify(r.from_city)}-to-${slugify(r.to_city)}-train`;
    if (!trainsBySlug.has(slug)) trainsBySlug.set(slug, []);
    trainsBySlug.get(slug).push(r);
  }
  for (const [slug, list] of trainsBySlug) {
    const r = list[0];
    const offers = list
      .filter((x) => Number(x.price) > 0)
      .map((x) => ({
        '@type': 'Offer',
        price: x.price,
        priceCurrency: x.currency || 'USD',
        availability: 'https://schema.org/InStock',
        description: `${x.train_type} — departs ${x.departure_time}, arrives ${x.arrival_time} (${x.operating_days})`,
      }));
    routes.push({
      path: `/train-tickets/${slug}`,
      title: `${r.from_city} to ${r.to_city} Train Tickets | Schedule & Prices — Uzbekistan Railway`,
      description: `Book train tickets from ${r.from_city} to ${r.to_city}, Uzbekistan. Afrosiyab high-speed and Sharq train schedules, prices, and booking assistance.`,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'TrainTrip',
          name: `${r.from_city} to ${r.to_city} train`,
          url: `${BASE_URL}/train-tickets/${slug}`,
          departureStation: { '@type': 'TrainStation', name: r.from_city },
          arrivalStation: { '@type': 'TrainStation', name: r.to_city },
          ...(r.departure_time ? { departureTime: r.departure_time } : {}),
          ...(r.arrival_time ? { arrivalTime: r.arrival_time } : {}),
          provider: ORGANIZATION_REF,
          ...(offers.length ? { offers } : {}),
        },
        breadcrumb([
          { name: 'Home', path: '/' },
          { name: 'Train tickets', path: '/train-tickets' },
          { name: `${r.from_city} → ${r.to_city}`, path: `/train-tickets/${slug}` },
        ]),
      ],
    });
  }


  return routes;
}

function applyMeta(html, route) {
  const fullTitle = route.title.includes('JamTrips') ? route.title : `${route.title} | JamTrips`;
  const description = truncateAtWord(route.description);
  const url = `${BASE_URL}${route.path}`;
  const type = route.type || 'website';

  let out = html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(fullTitle)}</title>`)
    .replace(
      /<meta\s+name="description"[^>]*>/i,
      `<meta name="description" content="${esc(description)}">`,
    )
    .replace(
      /<link\s+rel="canonical"[^>]*>/i,
      `<link rel="canonical" href="${esc(url)}" />`,
    )
    .replace(
      /<meta\s+property="og:title"[^>]*>/i,
      `<meta property="og:title" content="${esc(fullTitle)}">`,
    )
    .replace(
      /<meta\s+property="og:description"[^>]*>/i,
      `<meta property="og:description" content="${esc(description)}">`,
    )
    .replace(
      /<meta\s+property="og:url"[^>]*>/i,
      `<meta property="og:url" content="${esc(url)}" />`,
    )
    .replace(
      /<meta\s+property="og:type"[^>]*>/i,
      `<meta property="og:type" content="${esc(type)}" />`,
    )
    .replace(
      /<meta\s+name="twitter:title"[^>]*>/i,
      `<meta name="twitter:title" content="${esc(fullTitle)}">`,
    )
    .replace(
      /<meta\s+name="twitter:description"[^>]*>/i,
      `<meta name="twitter:description" content="${esc(description)}">`,
    );

  if (route.image) {
    out = out
      .replace(
        /<meta\s+property="og:image"[^>]*>/i,
        `<meta property="og:image" content="${esc(route.image)}">`,
      )
      .replace(
        /<meta\s+name="twitter:image"[^>]*>/i,
        `<meta name="twitter:image" content="${esc(route.image)}">`,
      );
  }

  // Per-page JSON-LD, injected into the same page's <head>.
  out = out.replace('<!-- PRERENDER_JSONLD -->', renderJsonLd(route.jsonLd));

  return out;
}

async function main() {
  const indexPath = path.join(DIST, 'index.html');
  if (!existsSync(indexPath)) {
    console.warn('[prerender] dist/index.html not found — skipping');
    return;
  }
  const template = await readFile(indexPath, 'utf8');
  const routes = await collectRoutes();

  for (const route of routes) {
    const dir = path.join(DIST, route.path);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'index.html'), applyMeta(template, route), 'utf8');
  }

  console.log(`[prerender] wrote ${routes.length} pre-rendered HTML pages`);
}

main().catch((err) => {
  console.error('[prerender] failed:', err);
  // Never break the build — the SPA still works, just without static meta.
});
