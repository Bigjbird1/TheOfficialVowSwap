import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createApiResponse } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');
    const requestedQuantity = parseInt(searchParams.get('quantity') || '1', 10);

    if (!productId) {
      return createApiResponse(false, null, 'Product ID is required', 400);
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        inventory: true,
        isActive: true,
      },
    });

    if (!product) {
      return createApiResponse(false, null, 'Product not found', 404);
    }

    if (!product.isActive) {
      return createApiResponse(false, null, 'Product is not available', 400);
    }

    const isAvailable = product.inventory >= requestedQuantity;
    const remainingStock = product.inventory;

    return createApiResponse(true, {
      isAvailable,
      remainingStock,
      requestedQuantity,
    });
  } catch (error) {
    console.error('Check availability error:', error);
    return createApiResponse(false, error, 'Failed to check product availability', 500);
  }
}
