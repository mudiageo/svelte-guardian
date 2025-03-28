import Redis from 'redis';
import type { RequestEvent } from '@sveltejs/kit';

import type { RedisConfig, RateLimitingConfig } from './';

export class RedisRateLimiter {
	private redis: Redis.RedisClientType;

	constructor(config: RedisConfig) {
		// Prepare Redis connection options
		const connectionOptions: Redis.RedisClientOptions = {
			url: config.url,
			socket: config.socket ? {
				host: config.socket.host,
				port: config.socket.port,
				tls: config.tls
			} : undefined,
			username: config.username,
			password: config.password,
			database: config.database
		};

		// Add any additional connection options
		if (config.connectionOptions) {
			Object.assign(connectionOptions, {
				connectTimeout: config.connectionOptions.connectTimeout,
				disconnectTimeout: config.connectionOptions.disconnectTimeout,
				pingInterval: config.connectionOptions.pingInterval,
				maxRetriesPerRequest: config.connectionOptions.maxRetriesPerRequest,
				retryStrategy: config.connectionOptions.retryStrategy
			});
		}

		// Create Redis client
		this.redis = Redis.createClient(connectionOptions);

		// Connect to Redis
		this.redis.connect().catch(console.error);
	}

	// Optional: Factory method for backward compatibility
	static fromUrl(url: string, token?: string): RedisRateLimiter {
		return new RedisRateLimiter({
			url,
			password: token
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

		// Use custom key generator if provided, otherwise use default
		const key = config.keyGenerator 
			? config.keyGenerator(event) 
			: this.defaultKeyGenerator(event);

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
				await this.redis.set(blockKey, 'blocked', {
					PX: blockDuration // Redis: PX means milliseconds expiration
				});

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
			console.error('Redis rate limiting error:', error);
			// Fail open if Redis is unavailable
			//TODO Consider falling back to in memory rate limiter
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

	// Cleanup method to close Redis connection
	async close() {
		await this.redis.quit();
	}
}