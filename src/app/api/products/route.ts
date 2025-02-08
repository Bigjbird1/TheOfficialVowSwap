import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ProductFilters, SortOption } from '@/app/types/filters';
import prismaClient from '@prisma/client';
const { Prisma } = prismaClient;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse filter parameters
    const filters: ProductFilters = {
      categories: searchParams.get('categories')?.split(','),
      themes: searchParams.get('themes')?.split(','),
      ratings: searchParams.get('ratings')?.split(',').map(Number),
      search: searchParams.get('search') || undefined,
      sortBy: searchParams.get('sortBy') as SortOption,
      newArrivals: searchParams.get('newArrivals') === 'true',
      priceRange: searchParams.has('minPrice') && searchParams.has('maxPrice')
        ? {
            min: Number(searchParams.get('minPrice')),
            max: Number(searchParams.get('maxPrice'))
          }
        : undefined
    };

    // Construct where clause based on filters
    const where: any = {
      isActive: true,
      AND: []
    };

    // Category filter
    if (filters.categories?.length) {
      where.AND.push({
        category: {
          name: {
            in: filters.categories
          }
        }
      });
    }

    // Theme filter
    if (filters.themes?.length) {
      where.AND.push({
        OR: filters.themes.map(theme => ({
          theme: theme
        }))
      });
    }

    // Rating filter
    if (filters.ratings?.length) {
      where.AND.push({
        rating: {
          gte: Math.min(...filters.ratings)
        }
      });
    }

    // Price range filter
    if (filters.priceRange) {
      where.AND.push({
        price: {
          gte: filters.priceRange.min,
          lte: filters.priceRange.max
        }
      });
    }

    // Search filter
    if (filters.search) {
      where.AND.push({
        OR: [
          {
            name: {
              contains: filters.search,
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: filters.search,
              mode: 'insensitive'
            }
          },
          {
            tags: {
              has: filters.search
            }
          }
        ]
      });
    }

    // New Arrivals filter
    if (filters.newArrivals) {
      where.AND.push({
        isNewArrival: true
      });
    }

    // Remove empty AND array if no filters applied
    if (!where.AND?.length) {
      delete where.AND;
    }

    // Construct orderBy based on sort option
    let orderBy: any = {};
    switch (filters.sortBy) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'popularity':
        orderBy = { popularity: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'new_arrivals':
        orderBy = [
          { isNewArrival: 'desc' },
          { createdAt: 'desc' }
        ];
        break;
      default:
        orderBy = { popularity: 'desc' };
    }

    // Execute query with pagination
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 12;
    const skip = (page - 1) * limit;

    // First verify database connection
    await prisma.$connect();

    // Execute query with proper error handling
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          seller: {
            select: {
              storeName: true
            }
          }
        }
      }).catch((error: unknown) => {
        console.error('Error fetching products:', error);
        throw new Error('Failed to fetch products');
      }),
      prisma.product.count({ where }).catch((error: unknown) => {
        console.error('Error counting products:', error);
        throw new Error('Failed to count products');
      })
    ]);

    // Disconnect after query
    await prisma.$disconnect();

    return NextResponse.json({
      products,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        perPage: limit
      }
    });
  } catch (error: unknown) {
    console.error('Products API Error:', error);
    
    // Ensure connection is closed in case of error
    try {
      await prisma.$disconnect();
    } catch (disconnectError: unknown) {
      console.error('Error disconnecting from database:', disconnectError);
    }

    // Return more detailed error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Failed to fetch products: ${errorMessage}` },
      { status: 500 }
    );
  }
}
