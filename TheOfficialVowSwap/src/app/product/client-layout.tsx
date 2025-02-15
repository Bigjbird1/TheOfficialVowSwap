'use client';

import { ReactNode } from 'react';
import { WishlistProvider } from '@/app/contexts/WishlistContext';
import { RegistryProvider } from '@/app/contexts/RegistryContext';

interface ProductClientLayoutProps {
  children: ReactNode;
}

export default function ProductClientLayout({ children }: ProductClientLayoutProps) {
  return (
    <RegistryProvider>
      <WishlistProvider>
        {children}
      </WishlistProvider>
    </RegistryProvider>
  );
}
