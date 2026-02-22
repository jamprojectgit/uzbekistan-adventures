import { useTranslation } from 'react-i18next';
import { Navigate, Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const AdminLayout = () => {
  const { t } = useTranslation();
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Layout><div className="container mx-auto p-8"><Skeleton className="h-96" /></div></Layout>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" />;
  }

  const tabs = [
    { path: '/admin', label: t('admin.tours') },
    { path: '/admin/cities', label: t('admin.cities') },
    { path: '/admin/bookings', label: t('admin.bookings') },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('admin.title')}</h1>
        <div className="flex gap-2 mb-6 border-b border-border pb-4">
          {tabs.map(tab => (
            <Button
              key={tab.path}
              variant={location.pathname === tab.path ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to={tab.path}>{tab.label}</Link>
            </Button>
          ))}
        </div>
        <Outlet />
      </div>
    </Layout>
  );
};

export default AdminLayout;
