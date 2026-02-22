import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-3">🇺🇿 UzTours</h3>
            <p className="text-sm opacity-80">{t('home.heroSubtitle')}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">{t('nav.tours')}</h4>
            <div className="flex flex-col gap-2 text-sm opacity-80">
              <Link to="/tours" className="hover:opacity-100 transition-opacity">{t('tours.title')}</Link>
              <Link to="/cities" className="hover:opacity-100 transition-opacity">{t('cities.title')}</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Account</h4>
            <div className="flex flex-col gap-2 text-sm opacity-80">
              <Link to="/login" className="hover:opacity-100 transition-opacity">{t('nav.login')}</Link>
              <Link to="/signup" className="hover:opacity-100 transition-opacity">{t('nav.signup')}</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-primary-foreground/20 text-center text-sm opacity-60">
          © {new Date().getFullYear()} UzTours. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
