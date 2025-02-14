import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCachedResponse, cacheResponse, invalidateCache } from '@/lib/redis';

import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const cacheKey = `product:${params.id}`;
  
  try {
    // Check cache first
    const cachedProduct = await getCachedResponse(cacheKey);
    if (cachedProduct) {
      return NextResponse.json(cachedProduct);
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        inventory: true,
        images: true,
        seller: {
          select: {
            storeName: true,
            description: true
          }
        }
      }
    });

    if (product) {
      // Cache the response for 5 minutes (300 seconds)
      await cacheResponse(cacheKey, product, 300);
      return NextResponse.json(product);
    } else {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Cache error:', error);
    // Fallback to direct response if cache fails
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        inventory: true,
        images: true,
        seller: {
          select: {
            storeName: true,
            description: true
          }
        }
      }
    });
    return product 
      ? NextResponse.json(product)
      : NextResponse.json({ message: 'Product not found' }, { status: 404 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const cacheKey = `product:${params.id}`;
  
  try {
    // Invalidate cache when product is updated/deleted
    await invalidateCache(cacheKey);
    return NextResponse.json({ message: 'Cache invalidated' });
  } catch (error) {
    console.error('Cache invalidation error:', error);
    return NextResponse.json(
      { message: 'Failed to invalidate cache' },
      { status: 500 }
    );
  }
}
