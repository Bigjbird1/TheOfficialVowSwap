import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

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

export default redis
