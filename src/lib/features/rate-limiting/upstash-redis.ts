import { Redis } from '@upstash/redis';
import type { RequestEvent } from '@sveltejs/kit';
import type { RateLimitingConfig } from './';

export class UpstashRedisRateLimiter {
	private redis: Redis;

	constructor(redisUrl: string, redisToken: string) {
		this.redis = new Redis({
			url: redisUrl,
			token: redisToken
		});
	}

	async limit(
		event: RequestEvent,
		config: RateLimitingConfig
	): Promise<{
		allowed: boolean;
		remaining: number;
		resetTime: number;
		blockedUntil?: number;
	}> {
		const now = Date.now();

		// Default key generation
		const key = this.defaultKeyGenerator(event);

		try {
			// Check for existing block
			const blockKey = `block:${key}`;
			const isBlocked = await this.redis.exists(blockKey);

			if (isBlocked) {
				const blockExpiration = await this.redis.ttl(blockKey);
				return {
					allowed: false,
					remaining: 0,
					resetTime: now + blockExpiration * 1000,
					blockedUntil: now + blockExpiration * 1000
				};
			}
			// Increment request count
			const current = await this.redis.incr(key);

			// Set expiration if this is the first request
			if (current === 1) {
				await this.redis.expire(key, Math.ceil((config.windowMs || 60000) / 1000));
			}

			// Default block duration to 5 minutes
			const blockDuration = config.blockDuration || 5 * 60 * 1000;

			// Check if limit is exceeded
			if (current > (config.maxRequests || 10)) {
				// Create block key
				await this.redis.set(blockKey, 'blocked', 'PX', blockDuration);
				return {
					allowed: false,
					remaining: 0,
					resetTime: now + config.windowMs,
					blockedUntil: now + blockDuration
				};
			}

			return {
				allowed: true,
				remaining: (config.maxRequests || 10) - current,
				resetTime: now + (config.windowMs || 60000)
			};
		} catch (error) {
			console.error('Upstash Redis rate limiting error:', error);
			// Fail open if Redis is unavailable
			return {
				allowed: true,
				remaining: config.maxRequests || 10,
				resetTime: now + (config.windowMs || 60000)
			};
		}
	}

	private defaultKeyGenerator(event: RequestEvent): string {
		// Prioritize user ID if available
		const session = event.locals.auth?.() || event.locals.session;
		if (session?.user?.id) {
			return `rate_limit:user:${session.user.id}`;
		}

		// Fallback to IP address
		const ip = event.getClientAddress();
		return `rate_limit:ip:${ip}`;
	}
}
