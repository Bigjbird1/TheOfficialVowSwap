import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ProductFilters, SortOption } from '@/app/types/filters';
import prismaClient from '@prisma/client';
const { Prisma } = prismaClient;

// Custom error class for API errors
class APIError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Validate query parameters
function validateQueryParams(params: URLSearchParams) {
  const page = Number(params.get('page'));
  const limit = Number(params.get('limit'));
  const minPrice = params.get('minPrice');
  const maxPrice = params.get('maxPrice');

  if (page && (isNaN(page) || page < 1)) {
    throw new APIError('Invalid page number', 400, 'INVALID_PAGE');
  }

  if (limit && (isNaN(limit) || limit < 1 || limit > 100)) {
    throw new APIError('Invalid limit. Must be between 1 and 100', 400, 'INVALID_LIMIT');
  }

  if (minPrice && (isNaN(Number(minPrice)) || Number(minPrice) < 0)) {
    throw new APIError('Invalid minimum price', 400, 'INVALID_MIN_PRICE');
  }

  if (maxPrice && (isNaN(Number(maxPrice)) || Number(maxPrice) < 0)) {
    throw new APIError('Invalid maximum price', 400, 'INVALID_MAX_PRICE');
  }

  if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
    throw new APIError('Minimum price cannot be greater than maximum price', 400, 'INVALID_PRICE_RANGE');
  }
}

export async function GET(request: NextRequest) {
  let isConnected = false;
  
  try {
    // Validate query parameters first
    validateQueryParams(request.nextUrl.searchParams);
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
          in: filters.categories
        }
      });
    }

    // Theme filter
    if (filters.themes?.length) {
      where.AND.push({
        theme: {
          in: filters.themes
        }
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

    // Establish database connection
    await prisma.$connect();
    isConnected = true;

    // Execute query with enhanced error handling
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
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          throw new APIError(`Database error: ${error.message}`, 500, error.code);
        }
        throw new APIError('Failed to fetch products');
      }),
      prisma.product.count({ where }).catch((error: unknown) => {
        console.error('Error counting products:', error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          throw new APIError(`Database error: ${error.message}`, 500, error.code);
        }
        throw new APIError('Failed to count products');
      })
    ]);

    // Always try to disconnect after query
    if (isConnected) {
      await prisma.$disconnect().catch(error => {
        console.error('Error disconnecting from database:', error);
      });
    }

    const response = NextResponse.json({
      products,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        perPage: limit
      }
    });

    // Set cache control headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error: unknown) {
    console.error('Products API Error:', error);
    
    // Ensure connection is closed in case of error
    if (isConnected) {
      await prisma.$disconnect().catch(error => {
        console.error('Error disconnecting from database:', error);
      });
    }

    // Handle different types of errors
    if (error instanceof APIError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status }
      );
    } else if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        { error: 'Database connection failed', code: 'DB_CONNECT_ERROR' },
        { status: 503 }
      );
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: 'Database query failed', code: error.code },
        { status: 500 }
      );
    }

    // Generic error handler
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
