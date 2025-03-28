import type { Handle } from '@sveltejs/kit';
import type { SecurityConfig } from '../types/config';
import type { Adapter } from '@auth/core/adapters';
import { RateLimiterFactory, type RateLimitingConfig } from '../features/rate-limiting';

import { sequence } from '@sveltejs/kit/hooks';
import { json, redirect } from '@sveltejs/kit';

import { getEndpoints } from '../features/endpoints';

export function createMiddleware(securityConfig: SecurityConfig, adapter: Adapter, logger): Handle {
	const endpoints = getEndpoints(securityConfig, adapter, securityConfig.emailProvider) || {};
	 

  const rateLimitingMiddleware: Handle = async ({ event, resolve }) => {

// TODO  Determine rate limit configuration based on route or request type
  
    const rateLimitingConfig: RateLimitingConfig = securityConfig.rateLimiting
    
    const rateLimiter = RateLimiterFactory.create(rateLimitingConfig)

    // Apply rate limiting
    const rateLimitResult = rateLimiter.limit(event, rateLimitingConfig);

    if (!rateLimitResult.allowed) {
        // Optionally log the blocked request
        logger.warn(`Rate limit exceeded for ${event.route?.id || 'unknown route'}`, {
            ip: event.getClientAddress(),
            user: event.locals.auth?.()?.user?.id,
            blockedUntil: rateLimitResult.blockedUntil
        });

        // Throw a redirect or return an error response
        redirect(429, '/rate-limited');
    }
    
    // Attach rate limit headers for transparency
    const headers: Record<string, string> = {
			'X-RateLimit-Limit': String(rateLimitingConfig.maxRequests || 10),
			'X-RateLimit-Remaining': String(rateLimitResult.remaining),
			'X-RateLimit-Reset': String(rateLimitResult.resetTime)
		};
    Object.entries(headers).forEach(([key, value]) => {
			event.setHeaders({ [key]: value });
		});

    return resolve(event);
    
};

  const authMiddleware: Handle = async ({ event, resolve }) => {
		const session = await event.locals.auth();
		const routeProtection = securityConfig?.routeProtection;
		const userRole = session?.user?.[routeProtection?.roleKey || 'role'];
		const currentPath = event.url.pathname;

		// Check public routes first
		if (routeProtection?.publicRoutes) {
			const publicRoute = Object.entries(routeProtection?.publicRoutes).find(
				([route]) => route === currentPath || currentPath.startsWith(route)
			);

			if (publicRoute) {
				if (session?.user && publicRoute[1].redirectPath) {
					redirect(303, publicRoute[1].redirectPath);
				}
				if (session?.user && routeProtection?.authenticatedRedirect) {
					redirect(303, routeProtection?.authenticatedRedirect);
				}
			}
		}

		// Check protected routes
		if (routeProtection?.protectedRoutes) {
			const protectedRoute = Object.entries(routeProtection?.protectedRoutes).find(
				([route]) => route === currentPath || currentPath.startsWith(route)
			);

			if (protectedRoute) {
				const routeConfig = protectedRoute[1];

				if (!session?.user) {
					redirect(303, routeConfig.redirectPath || routeProtection?.redirectPath || '/');
				}

				if (routeConfig.authenticated && !session.user) {
					redirect(303, routeConfig.redirectPath || routeProtection?.redirectPath || '/');
				}

				if (routeConfig.allowedRoles && !routeConfig.allowedRoles.includes(userRole)) {
					redirect(303, routeConfig.redirectPath || routeProtection?.redirectPath || '/');
				}
			}
		}

		return resolve(event);
	};

	const endpointsMiddleware: Handle = async ({ event, resolve }) => {
		const { method, url } = event.request;
		const path = new URL(url).pathname;
		const endpointKey = `${method}:${path}`;
		const endpoint = endpoints[endpointKey];

		if (endpoint) return json(await endpoint(event));
		return resolve(event);
	};

	const securityHeadersMiddleware: Handle = async ({ event, resolve }) => {
		// Apply security headers based on config level
		const headers: Record<string, string> = {
			'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
			'X-Frame-Options': 'DENY',
			'X-Content-Type-Options': 'nosniff'
		};

		if (securityConfig.level === 'strict') {
			headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline'";
		}
		Object.entries(headers).forEach(([key, value]) => {
			event.setHeaders({ [key]: value });
		});

		return resolve(event);
	};

	return sequence(rateLimitingMiddleware, authMiddleware, endpointsMiddleware, securityHeadersMiddleware);
}
