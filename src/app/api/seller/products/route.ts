import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ProductFormData } from '@/app/types/seller';
import { validateSellerAccess, createApiResponse } from '@/lib/utils';
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    const validation = await validateSellerAccess();
    if (!validation.success) {
      return createApiResponse(false, validation.error, validation.message, 401);
    }

    const { seller } = validation.data;

    const products = await prisma.product.findMany({
      where: { sellerId: seller.id },
      include: {
        inventoryLogs: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return createApiResponse(true, products);
  } catch (error) {
    console.error('Products Error:', error);
    return createApiResponse(false, error, 'Failed to fetch products', 500);
  }
}

export async function POST(request: Request) {
  try {
    const validation = await validateSellerAccess();
    if (!validation.success) {
      return createApiResponse(false, validation.error, validation.message, 401);
    }

    const { seller } = validation.data;
    const data: ProductFormData = await request.json();

    const productData = {
      sellerId: seller.id,
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.categoryId,
      inventory: data.quantity,
      tags: data.tags,
      images: data.images,
    };

    const product = await prisma.product.create({
      data: productData,
      include: {
        inventoryLogs: true,
      },
    });

    // Create initial inventory log
    await prisma.inventoryLog.create({
      data: {
        productId: product.id,
        quantity: data.quantity,
        type: 'restock',
        note: 'Initial inventory',
      },
    });

    return createApiResponse(true, product, 'Product created successfully', 201);
  } catch (error) {
    console.error('Create Product Error:', error);
    return createApiResponse(false, error, 'Failed to create product', 500);
  }
}

export async function PUT(request: Request) {
  try {
    const validation = await validateSellerAccess();
    if (!validation.success) {
      return createApiResponse(false, validation.error, validation.message, 401);
    }

    const { seller } = validation.data;
    const { id, ...data }: ProductFormData & { id: string } = await request.json();

    if (!id) {
      return createApiResponse(false, null, 'Product ID is required', 400);
    }

    // Verify product ownership
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return createApiResponse(false, null, 'Product not found', 404);
    }

    if (existingProduct.sellerId !== seller.id) {
      return createApiResponse(false, null, 'Unauthorized to modify this product', 403);
    }

    const updateData = {
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.categoryId,
      inventory: data.quantity,
      tags: data.tags,
      images: data.images,
    };

    const product = await prisma.product.update({
      where: {
        id,
        sellerId: seller.id,
      },
      data: updateData,
      include: {
        inventoryLogs: true,
      },
    });

    // Log inventory change if quantity changed
    if (existingProduct.inventory !== data.quantity) {
      await prisma.inventoryLog.create({
        data: {
          productId: product.id,
          quantity: data.quantity - existingProduct.inventory,
          type: 'adjustment',
          note: 'Manual inventory adjustment',
        },
      });
    }

    return createApiResponse(true, product, 'Product updated successfully');
  } catch (error) {
    console.error('Update Product Error:', error);
    return createApiResponse(false, error, 'Failed to update product', 500);
  }
}

export async function DELETE(request: Request) {
  try {
    const validation = await validateSellerAccess();
    if (!validation.success) {
      return createApiResponse(false, validation.error, validation.message, 401);
    }

    const { seller } = validation.data;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return createApiResponse(false, null, 'Product ID is required', 400);
    }

    // Verify product ownership
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return createApiResponse(false, null, 'Product not found', 404);
    }

    if (existingProduct.sellerId !== seller.id) {
      return createApiResponse(false, null, 'Unauthorized to delete this product', 403);
    }

    await prisma.product.delete({
      where: {
        id,
        sellerId: seller.id,
      },
    });

    return createApiResponse(true, null, 'Product deleted successfully', 200);
  } catch (error) {
    console.error('Delete Product Error:', error);
    return createApiResponse(false, error, 'Failed to delete product', 500);
  }
}
