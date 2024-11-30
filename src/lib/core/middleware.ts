import type { Handle } from '@sveltejs/kit';
import type { SecurityConfig } from '../types/config';
import { sequence } from '@sveltejs/kit/hooks';

export function createMiddleware(
  securityConfig: SecurityConfig
): Handle {
  const authMiddleware: Handle = async ({ event, resolve }) => {
    const session = await event.locals.auth();
    // Define protected routes based on security level
    let protectedRoutes = 
      securityConfig.level === 'strict' 
        ? ['/dashboard', '/admin', '/profile'] 
        : securityConfig.level === 'moderate' 
          ? ['/dashboard', '/profile'] 
          : [];
 protectedRoutes = securityConfig.protectedRoutes || protectedRoutes
 
 console.log(session)
 
    const path = event.url.pathname;
    const Location = securityConfig.redirectUrl || '/login'
    if (protectedRoutes.some(route => path.startsWith(route))) {
      if (!session) {
        return new Response(null, {
          status: 302,
          headers: { Location }
        });
      }
    }

    return resolve(event);
  };

  const securityHeadersMiddleware: Handle = async ({ event, resolve }) => {
    // Apply security headers based on config level
    // const headers: Record<string, string> = {
    //   'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    //   'X-Frame-Options': 'DENY',
    //   'X-Content-Type-Options': 'nosniff'
    // };

    // if (securityConfig.level === 'strict') {
    //   headers['Content-Security-Policy'] = 
    //     "default-src 'self'; script-src 'self' 'unsafe-inline'";
    // }

    // Object.entries(headers).forEach(([key, value]) => {
    //   event.setHeaders({ [key]: value });
    // });

    return resolve(event);
  };

  return sequence(
    authMiddleware, 
    securityHeadersMiddleware
  );
}
