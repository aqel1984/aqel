import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

interface RateLimitConfig {
    limit?: number
    window?: string
    redis?: Redis
}

export async function rateLimit(
    request: NextRequest,
    config: RateLimitConfig = {}
) {
    try {
        const { limit = 10, window = '10 s' } = config
        const ip = request.ip ?? '127.0.0.1'
        const key = `rate-limit:${ip}`

        const redis = config.redis ?? new Redis({
            url: process.env.REDIS_URL!,
            token: process.env.REDIS_TOKEN!,
        })

        const [response] = await redis
            .multi()
            .incr(key)
            .expire(key, window)
            .exec()

        const currentCount = response as number

        if (currentCount > limit) {
            return new NextResponse(JSON.stringify({ error: 'Too many requests' }), {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                },
            })
        }

        return null
    } catch (error) {
        console.error('Rate limit error:', error)
        return null
    }
}
