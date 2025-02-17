import withPWA from 'next-pwa';
import { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'localhost',
      'vowswap.com',
      'vowswapimages.supabase.co', // Supabase storage domain
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  // Configure PWA
  ...withPWA({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
  }),
  // Add other Next.js config options here
};

export default config;
