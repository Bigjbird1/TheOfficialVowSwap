'use client';

import { ReactNode } from 'react';
import { WishlistProvider } from '@/app/contexts/WishlistContext';
import { RegistryProvider } from '@/app/contexts/RegistryContext';

interface DashboardClientLayoutProps {
  children: ReactNode;
}

export default function DashboardClientLayout({ children }: DashboardClientLayoutProps) {
  return (
    <RegistryProvider>
      <WishlistProvider>
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </WishlistProvider>
    </RegistryProvider>
  );
}
