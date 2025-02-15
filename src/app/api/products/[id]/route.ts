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
            where: {
                id: params.id.toString() // Ensure ID is treated as string
            },
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                quantity: true,
                images: true,
                seller: {
                    select: {
                        storeName: true,
                        description: true,
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
        console.error('Error fetching product:', error);
        if (error instanceof Error) {
            return NextResponse.json({
                message: `Error loading product: ${error.message}`,
                details: 'Failed to fetch product data'
            }, { status: 500 });
        }
        return NextResponse.json({
            message: 'Error loading product',
            details: 'An unexpected error occurred'
        }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const cacheKey = `product:${params.id}`;

    try {
        const data = await request.json();
        const updatedProduct = await prisma.product.update({
            where: { id: params.id },
            data: data,
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                quantity: true,
                images: true,
                seller: {
                    select: {
                        storeName: true,
                        description: true,
                    }
                }
            }
        });

        // Invalidate cache
        await invalidateCache(cacheKey);

        // Cache the updated response
        await cacheResponse(cacheKey, updatedProduct, 300);

        return NextResponse.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const cacheKey = `product:${params.id}`;

    try {
      const deletedProduct = await prisma.product.delete({
        where: { id: params.id },
      });

      if (!deletedProduct) {
        return NextResponse.json({ message: 'Product not found' }, { status: 404 });
      }

        // Invalidate cache when product is updated/deleted
        await invalidateCache(cacheKey);
        return NextResponse.json({ message: 'Product deleted' });
    } catch (error) {
        console.error('Cache invalidation error:', error);
        return NextResponse.json(
            { message: 'Failed to invalidate cache' },
            { status: 500 }
        );
    }
}
