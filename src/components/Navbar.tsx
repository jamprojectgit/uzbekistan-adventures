import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const Navbar = () => {
  const { t } = useTranslation();
  const { user, isAdmin, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);


  const navLinks = (
    <>
      <Link to="/" className="hover:text-primary transition-colors" onClick={() => setMobileOpen(false)}>{t('nav.home')}</Link>
      <Link to="/tours" className="hover:text-primary transition-colors" onClick={() => setMobileOpen(false)}>{t('nav.tours')}</Link>
      <Link to="/cities" className="hover:text-primary transition-colors" onClick={() => setMobileOpen(false)}>{t('nav.cities')}</Link>
      <Link to="/transfers" className="hover:text-primary transition-colors" onClick={() => setMobileOpen(false)}>{t('nav.transfers')}</Link>
      <Link to="/train-tickets" className="hover:text-primary transition-colors" onClick={() => setMobileOpen(false)}>{t('nav.trainTickets')}</Link>
      {isAdmin && (
        <Link to="/admin" className="hover:text-primary transition-colors font-semibold" onClick={() => setMobileOpen(false)}>{t('nav.admin')}</Link>
      )}
    </>
  );

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="text-xl font-bold tracking-tight text-primary">
          JamTrips
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-foreground">
          {navLinks}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          {user && (
            <Button variant="outline" size="sm" onClick={signOut}>{t('nav.logout')}</Button>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 flex flex-col gap-4 text-sm font-medium">
          {navLinks}
          <div className="flex items-center gap-3 pt-2 border-t border-border">
            <LanguageSwitcher onChanged={() => setMobileOpen(false)} />
            {user && (
              <Button variant="outline" size="sm" onClick={() => { signOut(); setMobileOpen(false); }}>{t('nav.logout')}</Button>
            )}
          </div>
        </div>
      )}

        </div>
      )}
    </nav>
  );
};

export default Navbar;
