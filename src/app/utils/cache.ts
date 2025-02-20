import { Redis } from 'ioredis';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

interface CacheConfig {
  ttl?: number; // Time to live in seconds
  staleWhileRevalidate?: number; // Additional time to serve stale content while revalidating
}

export async function withCache(
  request: NextRequest,
  handler: () => Promise<Response>,
  config: CacheConfig = {}
) {
  const cacheKey = request.url;
  const { ttl = 60, staleWhileRevalidate = 30 } = config;

  try {
    // Try to get cached data
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      const age = Math.floor((Date.now() - timestamp) / 1000);

      // If within TTL, return cached data
      if (age < ttl) {
        return new NextResponse(JSON.stringify(data), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': `max-age=${ttl}`,
            'X-Cache': 'HIT',
          },
        });
      }

      // If within stale-while-revalidate window, return stale data and trigger revalidation
      if (age < ttl + staleWhileRevalidate) {
        // Trigger revalidation in background
        revalidateCache(cacheKey, handler, ttl).catch(console.error);

        return new NextResponse(JSON.stringify(data), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': `max-age=0, stale-while-revalidate=${staleWhileRevalidate}`,
            'X-Cache': 'STALE',
          },
        });
      }
    }

    // If no cache or cache expired, fetch fresh data
    const response = await handler();
    const data = await response.json();

    // Cache the fresh data
    await redis.set(
      cacheKey,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      }),
      'EX',
      ttl + staleWhileRevalidate
    );

    return new NextResponse(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `max-age=${ttl}, stale-while-revalidate=${staleWhileRevalidate}`,
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('Cache error:', error);
    
    // If cache fails, execute handler directly
    const response = await handler();
    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'X-Cache': 'ERROR',
      },
    });
  }
}

async function revalidateCache(
  cacheKey: string,
  handler: () => Promise<Response>,
  ttl: number
) {
  try {
    const response = await handler();
    const data = await response.json();

    await redis.set(
      cacheKey,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      }),
      'EX',
      ttl
    );
  } catch (error) {
    console.error('Revalidation error:', error);
  }
}

// Example usage in an API route:
/*
export async function GET(request: NextRequest) {
  return withCache(
    request,
    async () => {
      // Your actual API logic here
      const data = await fetchSomeData();
      return NextResponse.json(data);
    },
    {
      ttl: 300, // 5 minutes
      staleWhileRevalidate: 60 // 1 minute
    }
  );
}
*/
