'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { NotificationProvider } from '@/app/providers/NotificationProvider';
import { CartProvider } from '@/app/contexts/CartContext';
import { WishlistProvider } from '@/app/contexts/WishlistContext';
import { RegistryProvider } from '@/app/contexts/RegistryContext';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <NotificationProvider>
        <CartProvider>
          <WishlistProvider>
            <RegistryProvider>
              {children}
            </RegistryProvider>
          </WishlistProvider>
        </CartProvider>
      </NotificationProvider>
    </SessionProvider>
  );
}

export default Providers;
