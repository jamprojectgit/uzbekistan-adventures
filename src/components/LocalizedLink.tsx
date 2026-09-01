import { forwardRef } from 'react';
import { Link as RouterLink, LinkProps } from 'react-router-dom';
import { useLocalizedPath } from '@/lib/locale-path';

/**
 * Drop-in replacement for react-router's <Link> that keeps the visitor inside
 * the current language tree (Russian at "/", English under "/en").
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(({ to, ...rest }, ref) => {
  const localize = useLocalizedPath();
  const target = typeof to === 'string' && to.startsWith('/') ? localize(to) : to;
  return <RouterLink ref={ref} to={target} {...rest} />;
});

Link.displayName = 'LocalizedLink';

export default Link;
