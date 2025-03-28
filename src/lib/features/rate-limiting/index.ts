import { RedisRateLimiter } from './redis';
import { UpstashRedisRateLimiter } from './upstash-redis';
import { InMemoryRateLimiter } from './in-memory';

import type { RequestEvent } from '@sveltejs/kit';

export type RateLimitStrategy = 'redis' | 'upstash' | 'memory';

export interface RedisConfig {
	url?: string;
	socket?: {
		host?: string;
		port?: number;
	};
	username?: string;
	password?: string;
	database?: number;
	tls?: boolean;
	// Additional Redis client options
	connectionOptions?: {
		connectTimeout?: number;
		disconnectTimeout?: number;
		pingInterval?: number;
		maxRetriesPerRequest?: number;
		retryStrategy?: (times: number) => number | null;
	};
}

export interface RateLimitingConfig {
	enabled?: boolean;
	requestsPerMinute?: number;
	blockDuration?: number; // Duration in milliseconds to block after rate limit is exceeded

	strategy?: RateLimitStrategy;
	windowMs: number;
	maxRequests: number;
	redisConfig?: RedisConfig;
	keyGenerator?: (event: RequestEvent) => string;
}

export class RateLimiterFactory {
	private static instance: RedisRateLimiter | UpstashRedisRateLimiter | InMemoryRateLimiter;

	static create(config: RateLimitingConfig): RedisRateLimiter | UpstashRedisRateLimiter | InMemoryRateLimiter {
		// Check if rate limiting is disabled
		if (config.enabled === false) {
			return {
				limit: async () => ({
					allowed: true,
					remaining: Number.MAX_SAFE_INTEGER,
					resetTime: Date.now()
				})
			};
		}

		// Convert requestsPerMinute to existing configuration
		if (config.requestsPerMinute !== undefined) {
			config.maxRequests = config.requestsPerMinute;
			config.windowMs = 60 * 1000; // 1 minute
		}

		// Ensure maxRequests is set
		config.maxRequests = config.maxRequests || 10;
		config.windowMs = config.windowMs || 60 * 1000;

		// Use singleton pattern to reuse rate limiter
		if (this.instance) return this.instance;

		switch (config.strategy || 'memory') {
			case 'redis':
				if (!config.redisConfig) {
					throw new Error('Redis configuration is required for Redis strategy');
				}
				this.instance = new RedisRateLimiter(config.redisConfig.url, config.redisConfig.token);
				break;
			case 'upstash-redis':
				if (!config.redisConfig) {
					throw new Error('Redis configuration is required for Uostash Redis strategy');
				}
				this.instance = new UpstashRedisRateLimiter(config.redisConfig);
				break;
			case 'memory':
			default:
				this.instance = new InMemoryRateLimiter();
				break;
		}

		return this.instance;
	}
}
