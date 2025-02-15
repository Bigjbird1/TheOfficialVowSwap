import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        category: true,
        rating: true,
        images: true,
        seller: {
          select: {
            storeName: true
          }
        }
      },
      orderBy: {
        popularity: 'desc'
      },
      take: 8 // Limit to 8 most popular products
    });

    // Transform the data to match the expected ProductType format
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category || 'Uncategorized',
      rating: product.rating || 0,
      reviewCount: 0, // This could be added as a separate query if needed
      stockStatus: 'In Stock',
      images: product.images.map((url, index) => ({
        id: index.toString(),
        url: url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_SITE_URL}${url}`,
        alt: product.name
      })),
      specifications: {}, // This could be added as a separate field in the Product model
      shippingInfo: 'Ships within 2-3 business days',
      sellerName: product.seller.storeName,
      sellerRating: 4 // Default rating since we don't have this in the model yet
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
