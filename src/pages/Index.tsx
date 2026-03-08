import { useTranslation } from 'react-i18next';
import OptimizedImage from '@/components/OptimizedImage';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Car } from 'lucide-react';
import { lazy, Suspense, useState } from 'react';
import { motion } from 'framer-motion';
import { getLocalizedText } from '@/lib/i18n-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const TourCard = lazy(() => import('@/components/TourCard'));
const CityCard = lazy(() => import('@/components/CityCard'));
const ContactButtons = lazy(() => import('@/components/ContactButtons'));
const SearchAutocomplete = lazy(() => import('@/components/SearchAutocomplete'));

const Index = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const { data: tours, isLoading: toursLoading } = useQuery({
    queryKey: ['featured-tours'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tours')
        .select('*, cities(name)')
        .order('order_number', { ascending: true, nullsFirst: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  const { data: cities, isLoading: citiesLoading } = useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cities').select('*').limit(6);
      if (error) throw error;
      return data;
    },
  });

  const { data: transfers, isLoading: transfersLoading } = useQuery({
    queryKey: ['home-transfers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transfers')
        .select('*')
        .eq('status', 'published')
        .order('from_city')
        .order('price');
      if (error) throw error;
      return data;
    },
  });

  const { data: trainRoutes, isLoading: trainRoutesLoading } = useQuery({
    queryKey: ['home-train-routes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('train_routes')
        .select('*')
        .eq('status', 'published')
        .order('train_type')
        .order('departure_time')
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  return (
    <Layout>
      <SEOHead
        title="JamTrips | Uzbekistan Tours, Train Tickets & Transfers"
        description="Uzbekistan travel marketplace offering Uzbekistan tours, private tours in Samarkand, Bukhara, Khiva and Tashkent, Uzbekistan train tickets booking, railway tickets between Uzbekistan and Russia, private transfers across Uzbekistan, and travel services for international tourists."
        path="/"
      />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TravelAgency",
            "name": "JamTrips",
            "url": "https://jamtrips.com",
            "description": "Uzbekistan travel marketplace offering Uzbekistan tours, private tours in Samarkand, Bukhara, Khiva and Tashkent, Uzbekistan train tickets booking, railway tickets between Uzbekistan and Russia, private transfers across Uzbekistan, and travel services for international tourists.",
            "makesOffer": [
              { "@type": "Offer", "itemOffered": { "@type": "TouristTrip", "name": "Uzbekistan tours" } },
              { "@type": "Offer", "itemOffered": { "@type": "TouristTrip", "name": "Private tours" } },
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Train ticket booking" } },
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Private transfers" } },
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Travel services for international tourists" } }
            ],
            "areaServed": {
              "@type": "Country",
              "name": "Uzbekistan"
            },
            "serviceType": ["Tours", "Train Tickets", "Private Transfers"],
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "UZ"
            }
          }),
        }}
      />

      {/* Hero */}
      <section className="relative bg-primary text-primary-foreground py-24 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-4 tracking-tight"
          >
            {t('home.heroTitle')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto"
          >
            {t('home.heroSubtitle')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-md mx-auto flex gap-2"
          >
            <Suspense fallback={<div className="flex-1 h-10 rounded-md bg-primary-foreground/10 animate-pulse" />}>
              <SearchAutocomplete value={search} onChange={setSearch} />
            </Suspense>
            <Button asChild variant="secondary">
              <Link to={`/tours${search ? `?search=${encodeURIComponent(search)}` : ''}`}>{t('home.ctaButton')}</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Tours by City */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-8">{t('home.toursByCity')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { name: { en: 'Samarkand', ru: 'Самарканд' }, slug: 'samarkand', image: 'https://yglewlxfbkbdndnyhetj.supabase.co/storage/v1/object/public/samarkand/samarkand.jpg.JPG' },
            { name: { en: 'Bukhara', ru: 'Бухара' }, slug: 'bukhara', image: 'https://yglewlxfbkbdndnyhetj.supabase.co/storage/v1/object/public/Bukhara/Screenshot%202024-07-30%20135255.jpg' },
            { name: { en: 'Tashkent', ru: 'Ташкент' }, slug: 'tashkent', image: 'https://yglewlxfbkbdndnyhetj.supabase.co/storage/v1/object/public/tashkent/04.png' },
            { name: { en: 'Khiva', ru: 'Хива' }, slug: 'khiva', image: 'https://yglewlxfbkbdndnyhetj.supabase.co/storage/v1/object/public/khiva/2323.jpg' },
            { name: { en: 'Shakhrisabz', ru: 'Шахрисабз' }, slug: 'shakhrisabz', image: 'https://yglewlxfbkbdndnyhetj.supabase.co/storage/v1/object/public/shakhrisabz/DSC_0736-0-0-0-0-1592546576.jpg' },
          ].map((city) => (
            <Link key={city.slug} to={`/tours?city=${city.slug}`} className="group">
              <div className="aspect-square rounded-xl overflow-hidden relative">
                <OptimizedImage src={city.image} alt={getLocalizedText(city.name)} sizes="(max-width: 640px) 50vw, 20vw" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <h3 className="absolute bottom-3 left-3 right-3 text-white font-semibold text-sm md:text-base">{getLocalizedText(city.name)}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Tours */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">{t('home.featuredTours')}</h2>
          <Button variant="ghost" asChild><Link to="/tours">{t('home.viewAll')} →</Link></Button>
        </div>
        {toursLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => <Skeleton key={i} className="h-80 rounded-lg" />)}
          </div>
        ) : tours && tours.length > 0 ? (
          <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{[1,2,3].map(i => <Skeleton key={i} className="h-80 rounded-lg" />)}</div>}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          </Suspense>
        ) : (
          <p className="text-muted-foreground text-center py-12">{t('tours.noTours')}</p>
        )}
      </section>

      {/* Popular Cities */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">{t('home.popularCities')}</h2>
            <Button variant="ghost" asChild><Link to="/cities">{t('home.viewAll')} →</Link></Button>
          </div>
          {citiesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => <Skeleton key={i} className="h-48 rounded-lg" />)}
            </div>
          ) : cities && cities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cities.map((city) => (
                <CityCard key={city.id} city={city} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-12">{t('tours.noTours')}</p>
          )}
        </div>
      </section>

      {/* Transfers Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">{t('home.transfers')}</h2>
          <Button variant="ghost" asChild><Link to="/transfers">{t('home.viewAll')} →</Link></Button>
        </div>
        <p className="text-muted-foreground mb-6">{t('home.transfersSubtitle')}</p>
        {transfersLoading ? (
          <div className="space-y-4">
            {[1,2].map(i => <Skeleton key={i} className="h-32 rounded-lg" />)}
          </div>
        ) : transfers && transfers.length > 0 ? (
          (() => {
            const grouped = new Map<string, typeof transfers>();
            transfers.forEach(tr => {
              const key = `${tr.from_city.trim().toLowerCase()}-${tr.to_city.trim().toLowerCase()}`;
              if (!grouped.has(key)) grouped.set(key, []);
              grouped.get(key)!.push(tr);
            });
            const entries = Array.from(grouped.entries()).slice(0, 4);
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {entries.map(([key, vehicles]) => {
                  const fromCity = vehicles[0].from_city.trim();
                  const toCity = vehicles[0].to_city.trim();
                  const slug = `${fromCity.toLowerCase().replace(/\s+/g, '-')}-to-${toCity.toLowerCase().replace(/\s+/g, '-')}-transfer`;
                  return (
                    <Card key={key} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <Link to={`/transfers/${slug}`}>
                          <CardTitle className="text-base flex items-center gap-2 hover:text-primary transition-colors">
                            <Car className="h-4 w-4 text-primary shrink-0" />
                            {fromCity} → {toCity}
                          </CardTitle>
                        </Link>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <div className="flex flex-wrap gap-3">
                          {vehicles.sort((a, b) => Number(a.price) - Number(b.price)).map(v => (
                            <span key={v.id} className="text-sm text-muted-foreground">
                              {v.vehicle_type} — <span className="font-semibold text-primary">${v.price}</span>
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            );
          })()
        ) : (
          <p className="text-muted-foreground text-center py-8">{t('transfers.noTransfers')}</p>
        )}
      </section>

      {/* Train Routes Section */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">{t('home.trainTickets')}</h2>
            <Button variant="ghost" asChild><Link to="/train-tickets">{t('home.viewAll')} →</Link></Button>
          </div>
          <p className="text-muted-foreground mb-6">{t('home.trainTicketsSubtitle')}</p>
          {trainRoutesLoading ? (
            <Skeleton className="h-48 rounded-lg" />
          ) : trainRoutes && trainRoutes.length > 0 ? (
            <div className="rounded-lg border border-border overflow-hidden bg-background">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('trainTickets.trainType')}</TableHead>
                    <TableHead>{t('trainTickets.from')}</TableHead>
                    <TableHead>{t('trainTickets.to')}</TableHead>
                    <TableHead>{t('trainTickets.departure')}</TableHead>
                    <TableHead>{t('trainTickets.arrival')}</TableHead>
                    <TableHead>{t('trainTickets.days')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trainRoutes.map((route) => (
                    <TableRow key={route.id}>
                      <TableCell className="font-medium">{route.train_type}</TableCell>
                      <TableCell>{route.from_city}</TableCell>
                      <TableCell>{route.to_city}</TableCell>
                      <TableCell className="font-mono">{route.departure_time}</TableCell>
                      <TableCell className="font-mono">{route.arrival_time}</TableCell>
                      <TableCell>
                        <Badge variant={route.operating_days === 'Daily' ? 'outline' : 'secondary'} className="text-xs">
                          {route.operating_days}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">{t('trainTickets.noTickets')}</p>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">{t('home.ctaTitle')}</h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">{t('home.ctaSubtitle')}</p>
        <ContactButtons size="lg" className="max-w-md mx-auto" />
      </section>
    </Layout>
  );
};

export default Index;
