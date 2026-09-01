import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export interface BreadcrumbEntry {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbEntry[];
  className?: string;
}

const BASE_URL = 'https://www.jamtrips.com';

const Breadcrumbs = ({ items, className }: BreadcrumbsProps) => {
  const allItems: BreadcrumbEntry[] = [{ label: 'Home', href: '/' }, ...items];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allItems
      .filter((item) => item.href || allItems.indexOf(item) === allItems.length - 1)
      .map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.label,
        ...(item.href ? { item: `${BASE_URL}${item.href}` } : {}),
      })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb className={className}>
        <BreadcrumbList>
          {allItems.map((entry, i) => {
            const isLast = i === allItems.length - 1;
            return (
              <BreadcrumbItem key={i}>
                {i > 0 && <BreadcrumbSeparator />}
                {isLast ? (
                  <BreadcrumbPage>{entry.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={entry.href!}>{entry.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
};

export default Breadcrumbs;
