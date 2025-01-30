import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMiddleware } from "$lib/core/middleware";
import { redirect } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

// Mock the redirect function
vi.mock("@sveltejs/kit", () => ({
    redirect: vi.fn((status, path) => ({ status, path })),
}));

// Mock the sequence function
vi.mock("@sveltejs/kit/hooks", () => ({
    sequence: vi.fn((...middlewares) => middlewares),
}));

describe("createMiddleware", () => {
    const securityConfig = {
        publicRoutes: {
            "/login": { redirectPath: "/dashboard" },
            "/about": {}, // No redirect path
        },
        protectedRoutes: {
            "/admin": { allowedRoles: ["admin"], redirectPath: "/login" },
            "/dashboard": { authenticated: true, redirectPath: "/login" },
        },
        redirectPath: "/default-redirect",
        authenticatedRedirect: "/profile",
        roleKey: "role",
        level: "strict", // Security headers level
    };

    let event: any;
    let resolve: any;

    beforeEach(() => {
        event = {
            url: new URL("http://localhost/"),
            locals: {
                auth: vi.fn().mockResolvedValue(null), // No session by default
            },
            setHeaders: vi.fn(), // Mock setHeaders
        };
        resolve = vi.fn().mockResolvedValue("response");
    });

    it("should allow access to public routes without a session", async () => {
        event.url = new URL("http://localhost/login");

        const middleware = createMiddleware(securityConfig);
        const response = await middleware[0]({ event, resolve });

        expect(resolve).toHaveBeenCalledWith(event);
        expect(response).toBe("response");
    });

    it("should redirect authenticated users from public routes if configured", async () => {
        event.url = new URL("http://localhost/login");
        event.locals.auth = vi.fn().mockResolvedValue({ user: { role: "user" } }); // Authenticated user

        const middleware = createMiddleware(securityConfig);
        await middleware[0]({ event, resolve });

        expect(redirect).toHaveBeenCalledWith(303, "/dashboard");
    });

    it("should deny access to protected routes for unauthenticated users", async () => {
        event.url = new URL("http://localhost/admin");

        const middleware = createMiddleware(securityConfig);
        await middleware[0]({ event, resolve });

        expect(redirect).toHaveBeenCalledWith(303, "/login");
    });

    it("should deny access to protected routes for users with invalid roles", async () => {
        event.url = new URL("http://localhost/admin");
        event.locals.auth = vi.fn().mockResolvedValue({ user: { role: "user" } }); // User with invalid role

        const middleware = createMiddleware(securityConfig);
        await middleware[0]({ event, resolve });

        expect(redirect).toHaveBeenCalledWith(303, "/login");
    });

    it("should allow access to protected routes for users with valid roles", async () => {
        event.url = new URL("http://localhost/admin");
        event.locals.auth = vi.fn().mockResolvedValue({ user: { role: "admin" } }); // User with valid role

        const middleware = createMiddleware(securityConfig);
        const response = await middleware[0]({ event, resolve });

        expect(resolve).toHaveBeenCalledWith(event);
        expect(response).toBe("response");
    });

    it("should set security headers based on the config level", async () => {
        const middleware = createMiddleware(securityConfig);
        await middleware[1]({ event, resolve });
  const headers: Record<string, string> = {
			'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
			'X-Frame-Options': 'DENY',
			'X-Content-Type-Options': 'nosniff'
		};

		if (securityConfig.level === 'strict') {
			headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline'";
		}

		Object.entries(headers).forEach(([key, value]) => {
		  expect(event.setHeaders).toHaveBeenCalledWith({ [key]: value });
		});
        
    
    });

    it("should return the sequence of middlewares", () => {
        const middleware = createMiddleware(securityConfig);
        expect(middleware.length).toBe(2); // authMiddleware and securityHeadersMiddleware
    });
});