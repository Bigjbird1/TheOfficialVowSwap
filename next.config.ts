import withPWA from 'next-pwa';
import { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'vowswap.com', // Production domain
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // Common image hosting
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com', // Google Cloud Storage
      },
      {
        protocol: 'https',
        hostname: 'amazonaws.com', // AWS S3
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
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
