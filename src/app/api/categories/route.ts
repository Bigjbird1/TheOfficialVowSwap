import { NextResponse } from 'next/server';
import { createApiResponse } from '@/lib/utils';

const WEDDING_CATEGORIES = [
  {
    id: 'dresses',
    name: 'Wedding Dresses',
    description: 'Bridal gowns and wedding dresses'
  },
  {
    id: 'suits',
    name: 'Suits & Tuxedos',
    description: 'Wedding suits and tuxedos'
  },
  {
    id: 'accessories',
    name: 'Accessories',
    description: 'Veils, jewelry, shoes, and other accessories'
  },
  {
    id: 'decor',
    name: 'Decorations',
    description: 'Wedding decorations and centerpieces'
  },
  {
    id: 'invitations',
    name: 'Invitations',
    description: 'Wedding invitations and stationery'
  },
  {
    id: 'favors',
    name: 'Wedding Favors',
    description: 'Guest favors and gifts'
  },
  {
    id: 'flowers',
    name: 'Flowers',
    description: 'Wedding flowers and bouquets'
  },
  {
    id: 'gifts',
    name: 'Wedding Gifts',
    description: 'Gifts for the wedding party'
  }
];

export async function GET() {
  try {
    return createApiResponse(true, WEDDING_CATEGORIES);
  } catch (error) {
    console.error('Categories Error:', error);
    return createApiResponse(false, error, 'Failed to fetch categories', 500);
  }
}
