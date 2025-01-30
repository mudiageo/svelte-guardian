import type { Handle } from '@sveltejs/kit';
import type { SecurityConfig } from '../types/config';
import { sequence } from "@sveltejs/kit/hooks";
import { redirect } from '@sveltejs/kit';

export function createMiddleware(securityConfig: SecurityConfig): Handle {
	const authMiddleware: Handle = async ({ event, resolve }) => {
		const session = await event.locals.auth();

    const userRole = session?.user?.[securityConfig.roleKey || 'role'];
    const currentPath = event.url.pathname;

    // Check public routes first
    if (securityConfig.publicRoutes) {
        const publicRoute = Object.entries(securityConfig.publicRoutes).find(([route]) => 
            route === currentPath || currentPath.startsWith(route)
        );

        if (publicRoute) {
            if (session?.user && publicRoute[1].redirectPath) {
                redirect(303, publicRoute[1].redirectPath);
            }
            if (session?.user && securityConfig.authenticatedRedirect) {
                redirect(303, securityConfig.authenticatedRedirect);
            }
        }
    }

    // Check protected routes
    if (securityConfig.protectedRoutes) {
        const protectedRoute = Object.entries(securityConfig.protectedRoutes).find(([route]) => 
            route === currentPath || currentPath.startsWith(route)
        );

        if (protectedRoute) {
            const [route, routeConfig] = protectedRoute;

            if (!session?.user) {
                redirect(303, routeConfig.redirectPath || securityConfig.redirectPath || '/');
            }

            if (routeConfig.authenticated && !session.user) {
                redirect(303, routeConfig.redirectPath || securityConfig.redirectPath || '/');
            }

            if (routeConfig.allowedRoles && !routeConfig.allowedRoles.includes(userRole)) {
                redirect(303, routeConfig.redirectPath || securityConfig.redirectPath || '/');
            }
        }
    }

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

	return sequence(authMiddleware, securityHeadersMiddleware);
}
