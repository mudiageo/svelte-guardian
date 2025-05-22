---
title: "Session Management"
description: "Working with authentication sessions in Svelte Guardian."
date: "2025-05-22"
---

# Session Management

Effective session management is a critical component of any authentication system. This guide explains how sessions work in Svelte Guardian and how to work with them in your SvelteKit application.

## Understanding Sessions

In Svelte Guardian, a session represents an authenticated user's state. Sessions are used to:

1. Track authenticated users across requests
2. Store user information for quick access
3. Apply appropriate security controls
4. Enable automatic route protection

## Session Strategies

Svelte Guardian supports different session strategies:

### Database Sessions

Database sessions store session information in your database:

```typescript
security: {
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    updateAge: 24 * 60 * 60 // Update session every 24 hours
  }
}
```

This is the most flexible and secure option, allowing for immediate session invalidation and detailed tracking.

### JWT Sessions

JWT sessions store session data in a JSON Web Token:

```typescript
security: {
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    secret: process.env.JWT_SECRET
  }
}
```

JWTs are stateless, making them efficient but harder to invalidate before expiration.

### Cookie Sessions

Cookie sessions store minimal session data directly in encrypted cookies:

```typescript
security: {
  session: {
    strategy: 'cookie',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    cookieOptions: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production'
    }
  }
}
```

## Accessing The Session

### Server-Side Access

Access the session in server-side code using the `locals` object:

```typescript
// In +page.server.ts or +layout.server.ts
export async function load({ locals }) {
  const session = await locals.getSession();
  
  if (session?.user) {
    return {
      user: {
        name: session.user.name,
        email: session.user.email,
        role: session.user.role
      }
    };
  }
  
  return { user: null };
}
```

### Client-Side Access

In client components, access the session through page data:

```svelte
<script>
  import { page } from '$app/stores';
  
  $: user = $page.data.session?.user;
</script>

{#if user}
  <div>
    <p>Welcome, {user.name || user.email}!</p>
    <p>Role: {user.role}</p>
  </div>
{:else}
  <p>Please sign in to continue.</p>
{/if}
```

## Session Events

Listen for session events in your configuration:

```typescript
events: {
  async afterSignIn(user) {
    console.log(`User signed in: ${user.email}`);
    // Update user's last login timestamp
    await updateLastLoginTime(user.id);
  },
  
  async afterSignOut(user) {
    console.log(`User signed out: ${user.email}`);
    // Perform any cleanup actions
  },
  
  async afterSessionUpdate(user) {
    console.log(`Session updated for user: ${user.email}`);
    // Track session activity
  }
}
```

## Session Expiration and Renewal

Sessions have a limited lifetime controlled by the `maxAge` parameter. Svelte Guardian automatically handles:

1. Session expiration
2. Session renewal when active
3. Redirecting expired sessions to the sign-in page

Define when sessions should be updated with the `updateAge` parameter:

```typescript
security: {
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60 // Update session if it's more than 24 hours old
  }
}
```

## Session Security

Enhance session security with these options:

```typescript
security: {
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60,
    
    // Security options
    cookieOptions: {
      httpOnly: true, // Prevents JavaScript access
      sameSite: 'lax', // Protects against CSRF
      secure: process.env.NODE_ENV === 'production', // Requires HTTPS in production
      path: '/'
    },
    
    // Prevent session fixation
    generateNewSessionOnLogin: true,
    
    // Track IP address and user agent
    trackClientInfo: true
  }
}
```

## Managing Sessions Programmatically

### Creating a New Session

Creating a session is typically handled by the `signIn` function:

```typescript
import { signIn } from '$lib/auth';

const result = await signIn('credentials', {
  email,
  password,
  redirectUrl: '/dashboard'
});
```

### Invalidating a Session

To sign out and invalidate the current session:

```typescript
import { signOut } from '$lib/auth';

await signOut({
  redirectUrl: '/'
});
```

### Getting Multiple Sessions

For user account management features, you might need to retrieve all sessions for a user:

```typescript
import { getUserSessions, revokeSession } from '$lib/auth';

// In a server route or API endpoint
export async function GET({ locals }) {
  const session = await locals.getSession();
  
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401
    });
  }
  
  const userSessions = await getUserSessions(session.user.id);
  
  return new Response(JSON.stringify({ sessions: userSessions }));
}

// Revoke a specific session
export async function POST({ request, locals }) {
  const session = await locals.getSession();
  const data = await request.json();
  
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401
    });
  }
  
  await revokeSession(data.sessionId);
  
  return new Response(JSON.stringify({ success: true }));
}
```

## Remember Me Functionality

Implement a "Remember Me" option:

```typescript
// In your signin form handler
const rememberMe = formData.get('rememberMe') === 'on';

const result = await signIn('credentials', {
  email,
  password,
  remember: rememberMe // Extends session lifetime
});
```

Configure different session durations:

```typescript
security: {
  session: {
    strategy: 'database',
    maxAge: 24 * 60 * 60, // 24 hours by default
    rememberMeMaxAge: 30 * 24 * 60 * 60 // 30 days when "Remember Me" is checked
  }
}
```

## Handling Session Data in SvelteKit Layouts

A common pattern is to include user session data in your root layout:

```typescript
// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  const session = await locals.getSession();
  
  return {
    session
  };
};
```

Then use it in your layout:

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { page } from '$app/stores';
  import AuthStatus from '$components/AuthStatus.svelte';
  
  export let data;
</script>

<header>
  <nav>
    <a href="/">Home</a>
    {#if $page.data.session?.user}
      <a href="/dashboard">Dashboard</a>
      {#if $page.data.session.user.role === 'admin'}
        <a href="/admin">Admin</a>
      {/if}
    {/if}
    
    <div class="auth-container">
      <AuthStatus />
    </div>
  </nav>
</header>

<main>
  <slot />
</main>

<footer>
  <p>© {new Date().getFullYear()} Your App</p>
</footer>
```

## Best Practices

1. **Short Session Lifetimes**: Use shorter session durations for sensitive applications
2. **Secure Cookies**: Always use secure, HTTP-only, SameSite cookies
3. **Session Rotation**: Generate new sessions on login and privilege changes
4. **Minimal Session Data**: Store only essential information in the session
5. **Session Monitoring**: Track and alert on suspicious session activity
6. **Clear Signout Flow**: Always invalidate sessions properly on sign out

## Next Steps

After implementing session management, explore these related topics:
- [Implementing Two-Factor Authentication](../guides/two-factor-auth.md)
- [Session Persistence Across Devices](../guides/advanced-session-management.md)
- [Handling JWT Token Refresh](../guides/jwt-auth.md)
