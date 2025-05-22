---
title: "Route Protection"
description: "Implementing authentication-based route protection in SvelteKit with Svelte Guardian."
---

# Route Protection

One of the key features of Svelte Guardian is the ability to protect routes based on authentication status and user roles. This guide will show you how to implement route protection in your SvelteKit application.

## Basic Concepts

Route protection in Svelte Guardian works at two levels:

1. **Server-Side Protection**: Prevents unauthorized server rendering and API access
2. **Client-Side Protection**: Redirects unauthenticated users in the browser

Both levels work together to ensure a seamless and secure user experience.

## Configuration

Route protection is configured in the `security.routeProtection` section of your Svelte Guardian configuration:

```typescript
// src/hooks.server.ts
const { handle, signIn, signOut } = await guardianAuth({
  // Other configuration...
  security: {
    // Other security settings...
    routeProtection: {
      // Routes that require authentication
      protectedRoutes: {
        '/dashboard': {
          authenticated: true,
          redirectPath: '/signin'
        },
        '/admin': {
          allowedRoles: ['admin'],
          redirectPath: '/unauthorized'
        },
        '/profile': {
          authenticated: true,
          redirectPath: '/signin'
        },
        '/api/protected': {
          authenticated: true
        }
      },
      
      // Routes for unauthenticated users
      publicRoutes: {
        '/signin': {
          redirectPath: '/dashboard' // Redirect if user is already authenticated
        },
        '/signup': {
          redirectPath: '/dashboard'
        },
        '/': {} // No redirect for homepage
      }
    }
  }
});
```

## Protected Routes Options

When configuring protected routes, you have several options:

### Authentication Only

To protect a route for any authenticated user:

```typescript
'/dashboard': {
  authenticated: true,
  redirectPath: '/signin'
}
```

### Role-Based Protection

To restrict access to users with specific roles:

```typescript
'/admin': {
  allowedRoles: ['admin'],
  redirectPath: '/unauthorized'
}
```

You can specify multiple roles:

```typescript
'/reports': {
  allowedRoles: ['admin', 'manager', 'analyst'],
  redirectPath: '/unauthorized'
}
```

### Custom Authorization Logic

For more complex authorization requirements, you can use a custom function:

```typescript
'/projects/:projectId': {
  authorize: async ({ user, params, request }) => {
    // Check if user has access to the specific project
    const projectId = params.projectId;
    const hasAccess = await checkProjectAccess(user.id, projectId);
    return hasAccess;
  },
  redirectPath: '/unauthorized'
}
```

## Public Routes

Public routes are accessible to all users. However, you can configure them to redirect authenticated users elsewhere:

```typescript
'/signin': {
  redirectPath: '/dashboard' // Redirect if user is already authenticated
}
```

If no redirection is needed, use an empty object:

```typescript
'/': {} // No redirect for homepage
```

## API Route Protection

API routes can also be protected:

```typescript
'/api/user-data': {
  authenticated: true,
  // For API routes, no redirectPath is needed as they return 401/403 status codes
}
```

When an unauthenticated request is made to a protected API route, Svelte Guardian returns:
- 401 Unauthorized for unauthenticated requests
- 403 Forbidden for authenticated users without proper permissions

## Route Protection in SvelteKit

### Using server-side load functions

You can implement additional protection in your page's load function:

```typescript
// src/routes/admin/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.getSession();
  
  if (!session?.user) {
    throw redirect(302, '/signin');
  }
  
  if (session.user.role !== 'admin') {
    throw redirect(302, '/unauthorized');
  }
  
  return {
    user: session.user
  };
};
```

### Creating a protected layout

For sections of your site that should all be protected, create a protected layout:

```typescript
// src/routes/(protected)/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  const session = await locals.getSession();
  
  if (!session?.user) {
    throw redirect(302, '/signin');
  }
  
  return {
    user: session.user
  };
};
```

Then place your protected routes under this layout:
```
src/routes/(protected)/
  +layout.server.ts
  dashboard/
    +page.svelte
  profile/
    +page.svelte
  settings/
    +page.svelte
```

## Client-Side Protection with Guards

Create client-side guards for additional protection in SvelteKit:

```typescript
// src/lib/guards.ts
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { get } from 'svelte/store';

export function requireAuth(redirectTo = '/signin') {
  if (browser) {
    const currentPage = get(page);
    if (!currentPage.data.session?.user) {
      goto(redirectTo);
      return false;
    }
    return true;
  }
  return false;
}

export function requireRole(role: string | string[], redirectTo = '/unauthorized') {
  if (browser) {
    const currentPage = get(page);
    const user = currentPage.data.session?.user;
    
    if (!user) {
      goto('/signin');
      return false;
    }
    
    const roles = Array.isArray(role) ? role : [role];
    if (!roles.includes(user.role)) {
      goto(redirectTo);
      return false;
    }
    
    return true;
  }
  return false;
}
```

Use these guards in your pages:

```svelte
<script>
  import { requireAuth } from '$lib/guards';
  import { onMount } from 'svelte';
  
  onMount(() => {
    requireAuth();
  });
</script>
```

## Error Pages

Create custom error pages for unauthorized access:

```svelte
<!-- src/routes/unauthorized/+page.svelte -->
<script>
  import { page } from '$app/stores';
</script>

<div class="error-container">
  <h1>Access Denied</h1>
  <p>You do not have permission to access this page.</p>
  <p>
    <a href="/">Go to Homepage</a>
    {#if !$page.data.session?.user}
      or <a href="/signin">Sign In</a>
    {/if}
  </p>
</div>

<style>
  .error-container {
    max-width: 600px;
    margin: 4rem auto;
    text-align: center;
  }
</style>
```

## Best Practices

1. **Defense in Depth**: Use both server-side and client-side protection
2. **Least Privilege**: Give users only the access they need
3. **Clear Feedback**: Provide meaningful error messages when access is denied
4. **Secure API Routes**: Always protect API routes that access sensitive data
5. **Test All Paths**: Verify that all protected routes are properly secured

## Next Steps

After implementing route protection, you might want to explore:

- [Role-based UI components](../guides/role-based-authorization.md)
- [Managing user roles](../guides/user-management.md)
- [Custom authorization policies](../guides/custom-authorization.md)
