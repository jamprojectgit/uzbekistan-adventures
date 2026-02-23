import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import TourCard from '@/components/TourCard';
import CityCard from '@/components/CityCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Car, Train } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { getLocalizedText } from '@/lib/i18n-utils';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const { data: tours, isLoading: toursLoading } = useQuery({
    queryKey: ['featured-tours'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tours')
        .select('*, cities(name)')
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
      const { data, error } = await supabase.from('transfers').select('*').limit(4);
      if (error) throw error;
      return data;
    },
  });

  const { data: trainTickets, isLoading: trainTicketsLoading } = useQuery({
    queryKey: ['home-train-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase.from('train_tickets').select('*').limit(4);
      if (error) throw error;
      return data;
    },
  });

  return (
    <Layout>
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
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('home.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-background text-foreground"
              />
            </div>
            <Button asChild variant="secondary">
              <Link to={`/tours${search ? `?q=${search}` : ''}`}>{t('home.ctaButton')}</Link>
            </Button>
          </motion.div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3].map(i => <Skeleton key={i} className="h-48 rounded-lg" />)}
          </div>
        ) : transfers && transfers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {transfers.map((transfer) => (
              <Card key={transfer.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Car className="h-4 w-4 text-primary" />
                    {getLocalizedText(transfer.route)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-muted-foreground">{getLocalizedText(transfer.car_type)}</p>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <span className="font-bold text-primary">${transfer.price}</span>
                  <Button size="sm" asChild><Link to="/transfers">{t('transfers.book')}</Link></Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">{t('transfers.noTransfers')}</p>
        )}
      </section>

      {/* Train Tickets Section */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">{t('home.trainTickets')}</h2>
            <Button variant="ghost" asChild><Link to="/train-tickets">{t('home.viewAll')} →</Link></Button>
          </div>
          <p className="text-muted-foreground mb-6">{t('home.trainTicketsSubtitle')}</p>
          {trainTicketsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3].map(i => <Skeleton key={i} className="h-48 rounded-lg" />)}
            </div>
          ) : trainTickets && trainTickets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trainTickets.map((ticket) => (
                <Card key={ticket.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Train className="h-4 w-4 text-primary" />
                      {getLocalizedText(ticket.route)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">{getLocalizedText(ticket.train_type)}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center">
                    <span className="font-bold text-primary">{t('tours.from')} ${ticket.price_from}</span>
                    <Button size="sm" asChild><Link to="/train-tickets">{t('trainTickets.submitRequest')}</Link></Button>
                  </CardFooter>
                </Card>
              ))}
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
        <Button size="lg" asChild>
          <Link to="/tours">{t('home.ctaButton')}</Link>
        </Button>
      </section>
    </Layout>
  );
};

export default Index;
