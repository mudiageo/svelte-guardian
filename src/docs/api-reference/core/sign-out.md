---
title: "signOut()"
description: "Function for signing out users with Svelte Guardian."
---

# signOut()

The `signOut()` function is used to end a user's session and sign them out of your application. It can be called from both server-side and client-side code.

## Server-Side Usage

### Syntax

```typescript
const result = await signOut(options: SignOutOptions): Promise<SignOutResult>
```

### Parameters

- `options`: A [SignOutOptions](/api-reference/types.md#signoutoptions) object containing:
  - `redirect`: Whether to redirect after sign out (default: true)
  - `callbackUrl`: Where to redirect after successful sign out
  - `cookies`: SvelteKit cookies object (required for server-side)

### Return Value

Returns a [SignOutResult](/api-reference/types.md#signoutresult) object with:
- `ok`: Boolean indicating success
- `error`: Error message if sign out failed
- `url`: Redirect URL if applicable

### Example (Server Side)

```typescript
// src/routes/api/signout/+server.ts
import { json, redirect } from '@sveltejs/kit';
import { signOut } from '$lib/auth';

export async function POST({ cookies }) {
  try {
    const result = await signOut({
      redirect: false,
      cookies
    });
    
    if (result.error) {
      return json({ error: result.error }, { status: 500 });
    }
    
    return json({ success: true });
  } catch (error) {
    return json({ error: 'Sign out failed' }, { status: 500 });
  }
}

export async function GET({ cookies }) {
  await signOut({
    callbackUrl: '/',
    cookies
  });
  throw redirect(302, '/');
}
```

## Client-Side Usage

### Syntax

```typescript
import { signOut } from 'svelte-guardian/client';

await signOut(options?: ClientSignOutOptions): Promise<ClientSignOutResult>
```

### Example (Client Side)

```typescript
import { signOut } from 'svelte-guardian/client';

async function handleSignOut() {
  try {
    const result = await signOut({
      redirect: false
    });
    
    if (result.error) {
      // Handle error
      console.error(result.error);
      return;
    }
    
    // Success, user is signed out
    console.log('Signed out successfully');
  } catch (error) {
    console.error('Sign out failed:', error);
  }
}

// With automatic redirect
function handleSignOutWithRedirect() {
  signOut({
    callbackUrl: '/'
  });
}
```

## Session Cleanup

When a user signs out, Svelte Guardian performs the following cleanup tasks:

1. Invalidates the current session
2. Removes session cookies from the browser
3. Updates session records in the database (for database sessions)
4. Triggers the `afterSignOut` event callback if configured

## Sign Out All Sessions

To sign out a user from all their active sessions:

```typescript
// Server-side
const result = await signOut({
  allSessions: true,
  userId: 'user-id-here',
  cookies
});

// Client-side
const result = await signOut({
  allSessions: true
});
```

## Related

- [signIn()](/api-reference/core/sign-in.md)
- [guardianAuth()](/api-reference/core/guardian-auth.md)
