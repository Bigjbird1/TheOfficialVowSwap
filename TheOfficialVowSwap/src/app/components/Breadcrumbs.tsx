'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

export const Breadcrumbs = () => {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    // Remove any query parameters
    const pathWithoutQuery = pathname?.split('?')[0];
    
    // Split pathname into segments
    const segments = pathWithoutQuery?.split('/')
      .filter((segment) => segment.length > 0);

    if (!segments?.length) return [];

    // Reduce the segments array into an array of breadcrumb items
    return segments.map((segment, index) => {
      // Build the URL for this breadcrumb
      const href = `/${segments.slice(0, index + 1).join('/')}`;
      
      // Format the label (capitalize and replace hyphens with spaces)
      const label = segment
        .replace(/-/g, ' ')
        .replace(/\[.*?\]/, '') // Remove Next.js dynamic route parameters
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      return {
        href,
        label,
      };
    });
  }, [pathname]);

  if (!breadcrumbs.length) return null;

  return (
    <nav aria-label="Breadcrumb" className="py-2 px-4">
      <ol className="flex items-center space-x-2 text-sm">
        <li>
          <Link 
            href="/" 
            className="text-gray-500 hover:text-gray-700"
          >
            Home
          </Link>
        </li>
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.href} className="flex items-center">
            <span className="text-gray-400 mx-2">/</span>
            {index === breadcrumbs.length - 1 ? (
              <span className="text-gray-900 font-medium">
                {breadcrumb.label}
              </span>
            ) : (
              <Link
                href={breadcrumb.href}
                className="text-gray-500 hover:text-gray-700"
              >
                {breadcrumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
