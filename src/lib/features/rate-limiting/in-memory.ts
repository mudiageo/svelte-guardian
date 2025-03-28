import type { RequestEvent } from '@sveltejs/kit';

export class InMemoryRateLimiter {
	private requestLog: Map<string, Array<{ timestamp: number; requestCount: number }>> = new Map();
	private blockedUntil: Map<string, number> = new Map();

	limit(
		event: RequestEvent,
		config: RateLimitConfig
	): {
		allowed: boolean;
		remaining: number;
		resetTime: number;
		blockedUntil?: number;
	} {
		const now = Date.now();

		// Default key generation
		const key = this.defaultKeyGenerator(event);

		// Check if currently blocked
		const blockExpiration = this.blockedUntil.get(key) || 0;

		if (blockExpiration > now) {
			return {
				allowed: false,
				remaining: 0,
				resetTime: blockExpiration,
				blockedUntil: blockExpiration
			};
		}

		// Retrieve or initialize request log
		const currentLog = this.requestLog.get(key) || [];

		// Remove expired requests
		const filteredLog = currentLog.filter(
			(record) => now - record.timestamp < (config.windowMs || 60000)
		);
		// Default block duration to 5 minutes if not specified
		const blockDuration = config.blockDuration || 5 * 60 * 1000;

		// Check rate limit
		if (filteredLog.length >= (config.maxRequests || 10)) {
			// Block the key
			const blockUntil = now + blockDuration;
			this.blockedUntil.set(key, blockUntil);
			return {
				allowed: false,
				remaining: 0,
				resetTime: filteredLog[0].timestamp + config.windowMs,
				blockedUntil: blockUntil
			};
		}

		// Add current request
		filteredLog.push({ timestamp: now, requestCount: 1 });
		this.requestLog.set(key, filteredLog);

		return {
			allowed: true,
			remaining: (config.maxRequests || 10) - filteredLog.length,
			resetTime: now + (config.windowMs || 60000)
		};
	}

	private defaultKeyGenerator(event: RequestEvent): string {
		// Prioritize user ID if available
		const session = event.locals.auth?.() || event.locals.session;
		if (session?.user?.id) {
			return `user:${session.user.id}`;
		}

		// Fallback to IP address
		const ip = event.getClientAddress();
		return `ip:${ip}`;
	}
}
