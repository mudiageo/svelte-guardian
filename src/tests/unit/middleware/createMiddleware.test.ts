import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMiddleware } from '$lib/core/middleware';
import { redirect, type RequestEvent } from '@sveltejs/kit';


// Mock the redirect function
vi.mock('@sveltejs/kit', () => ({
	redirect: vi.fn((status, path) => ({ status, path })),
	json: vi.fn((data) => data)
}));

// Mock the sequence function
vi.mock('@sveltejs/kit/hooks', () => ({
	sequence: vi.fn((...middlewares) => middlewares)
}));
vi.mock('$lib/features/endpoints/verify-email', () => ({
	getVerifyEmailEndpoints: () => ({
		'POST:/auth/verify-email/send-otp': vi
			.fn()
			.mockResolvedValue({ success: true, data: 'otp-sent' })
	})
}));

describe('createMiddleware', () => {
	const securityConfig = {
		emailVerification: {},
		emailProvider: {},
		routeProtection: {
			publicRoutes: {
				'/login': { redirectPath: '/dashboard' },
				'/about': {} // No redirect path
			},
			protectedRoutes: {
				'/admin': { allowedRoles: ['admin'], redirectPath: '/login' },
				'/dashboard': { authenticated: true, redirectPath: '/login' }
			},
			redirectPath: '/default-redirect',
			authenticatedRedirect: '/profile',
			roleKey: 'role'
		},
		level: 'strict' // Security headers level
	};

	let event: RequestEvent;
	let request: RequestEvent["request"];
	let	resolve: (event: RequestEvent) => string // For the purpose of this test

	beforeEach(() => {
	  request = new Request('http://localhost/')
		event = {
		  request,
			url: new URL(request.url),
			locals: {
				auth: vi.fn().mockResolvedValue(null) // No session by default
     //   auth: () => ({user: { id: 'user123' }  })
      },
      getClientAddress: () => '127.0.0.1',
			setHeaders: vi.fn() // Mock setHeaders
		};
		resolve = vi.fn().mockResolvedValue('response');
	});
	describe('authMiddleware', () => {
		it('should allow access to public routes without a session', async () => {
			event.url = new URL('http://localhost/login');

			const middleware = createMiddleware(securityConfig);
			const response = await middleware[1]({ event, resolve });

			expect(resolve).toHaveBeenCalledWith(event);
			expect(response).toBe('response');
		});

		it('should redirect authenticated users from public routes if configured', async () => {
			event.url = new URL('http://localhost/login');
			event.locals.auth = vi.fn().mockResolvedValue({ user: { role: 'user' } }); // Authenticated user

			const middleware = createMiddleware(securityConfig);
			await middleware[1]({ event, resolve });

			expect(redirect).toHaveBeenCalledWith(303, '/dashboard');
		});

		it('should deny access to protected routes for unauthenticated users', async () => {
			event.url = new URL('http://localhost/admin');

			const middleware = createMiddleware(securityConfig);
			await middleware[1]({ event, resolve });

			expect(redirect).toHaveBeenCalledWith(303, '/login');
		});

		it('should deny access to protected routes for users with invalid roles', async () => {
			event.url = new URL('http://localhost/admin');
			event.locals.auth = vi.fn().mockResolvedValue({ user: { role: 'user' } }); // User with invalid role

			const middleware = createMiddleware(securityConfig);
			await middleware[1]({ event, resolve });

			expect(redirect).toHaveBeenCalledWith(303, '/login');
		});

		it('should allow access to protected routes for users with valid roles', async () => {
			event.url = new URL('http://localhost/admin');
			event.locals.auth = vi.fn().mockResolvedValue({ user: { role: 'admin' } }); // User with valid role

			const middleware = createMiddleware(securityConfig);
			const response = await middleware[1]({ event, resolve });

			expect(resolve).toHaveBeenCalledWith(event);
			expect(response).toBe('response');
		});
	});

	describe('endpointsMiddleware', () => {
		const mockResolve = vi.fn();
		const mockAdapter = {};

		beforeEach(() => {
			vi.clearAllMocks();
		});

		it('should handle matching endpoint', async () => {
			const formData = new FormData();
			formData.append('email', 'test@example.com');
			
			const mockEvent = {
				request: new Request('httpp://localhost/auth/verify-email/send-otp', {
					method: 'POST',
					headers: { 'content-type': 'multipart/form-data' },
					body: formData
				})
			};

			const middleware = createMiddleware(securityConfig, mockAdapter);
			const result = await middleware[2]({ event: mockEvent, resolve: mockResolve });

			expect(result).toStrictEqual({ success: true, data: 'otp-sent' });
			expect(mockResolve).not.toHaveBeenCalled();
		});

		it('should pass through to resolve for non-matching endpoint', async () => {
			const mockEvent = {
				request: new Request('http://localhost/non-existent', { method: 'POST' })
			};

			const middleware = createMiddleware(securityConfig, mockAdapter);
			const result = await middleware[2]({ event: mockEvent, resolve: mockResolve });

			expect(mockResolve).toHaveBeenCalledWith(mockEvent);
			expect(result).toBeUndefined();
		});
	});

	describe('securityHeadersMiddleware', () => {
		it('should set security headers based on the config level', async () => {
			const middleware = createMiddleware(securityConfig);
			await middleware[3]({ event, resolve });
			const headers: Record<string, string> = {
				'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
				'X-Frame-Options': 'DENY',
				'X-Content-Type-Options': 'nosniff'
			};

			if (securityConfig.level === 'strict') {
				headers['Content-Security-Policy'] =
					"default-src 'self'; script-src 'self' 'unsafe-inline'";
			}

			Object.entries(headers).forEach(([key, value]) => {
				expect(event.setHeaders).toHaveBeenCalledWith({ [key]: value });
			});
		});
	});
	
	it('should return the sequence of middlewares', () => {
		const middleware = createMiddleware(securityConfig);
		expect(middleware.length).toBe(4); // authMiddleware, endpointsMiddleware and securityHeadersMiddleware
	});
});
