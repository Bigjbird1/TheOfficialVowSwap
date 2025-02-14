import Redis from 'ioredis'

// Create Redis connection pool
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  connectTimeout: 5000,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000)
    return delay
  }
})

// Cache response with TTL
export async function cacheResponse(
  key: string,
  data: any,
  ttl: number
): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(data), 'EX', ttl)
  } catch (error) {
    console.error('Redis cache error:', error)
  }
}

// Get cached response
export async function getCachedResponse<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Redis cache error:', error)
    return null
  }
}

// Invalidate cache by key pattern
export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch (error) {
    console.error('Redis cache invalidation error:', error)
  }
}

// Rate limiting function
export async function checkRateLimit(
  key: string,
  limit: number,
  windowInSeconds: number
): Promise<{
  success: boolean
  remaining: number
  resetInSeconds: number
}> {
  const now = Math.floor(Date.now() / 1000)
  const windowStart = now - windowInSeconds

  const multi = redis.multi()
  // Remove old entries
  multi.zremrangebyscore(key, '-inf', windowStart)
  // Add current request
  multi.zadd(key, now.toString(), now.toString())
  // Get count of requests in window
  multi.zcount(key, windowStart, '+inf')
  // Set expiry on the key
  multi.expire(key, windowInSeconds)

  const [, , count] = await multi.exec()
  const currentCount = count?.[1] as number || 0

  return {
    success: currentCount <= limit,
    remaining: Math.max(0, limit - currentCount),
    resetInSeconds: windowInSeconds - (now % windowInSeconds)
  }
}

// Health check
export async function checkRedisHealth(): Promise<boolean> {
  try {
    await redis.ping()
    return true
  } catch (error) {
    console.error('Redis health check failed:', error)
    return false
  }
}

export default redis
