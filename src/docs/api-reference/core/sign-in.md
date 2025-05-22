---
title: "signIn()"
description: "Function for handling user sign-in with Svelte Guardian."
---

# signIn()

The `signIn()` function is used to authenticate users with different providers. It can be called from both server-side and client-side code.

## Server-Side Usage

### Syntax

```typescript
const result = await signIn(provider: string, options: SignInOptions): Promise<SignInResult>
```

### Parameters

- `provider`: A string representing the authentication provider to use. Available values:
  - `"credentials"`: Email and password authentication
  - `"google"`: Google OAuth authentication
  - `"github"`: GitHub OAuth authentication
  - `"facebook"`: Facebook OAuth authentication
  - `"twitter"`: Twitter OAuth authentication
  - Any other OAuth provider configured in your application

- `options`: A [SignInOptions](/api-reference/types.md#signinoptions) object containing:
  - For Credentials provider:
    - `email`: User email
    - `password`: User password
    - `isRegistration`: Boolean indicating if this is a new user registration
    - `redirect`: Whether to redirect after sign in (default: true)
    - `callbackUrl`: Where to redirect after successful sign in
    - `cookies`: SvelteKit cookies object (required for server-side)
  - For OAuth providers:
    - `redirect`: Whether to redirect after sign in (default: true)
    - `callbackUrl`: Where to redirect after successful sign in
    - `cookies`: SvelteKit cookies object (required for server-side)

### Return Value

Returns a [SignInResult](/api-reference/types.md#signinresult) object with:
- `ok`: Boolean indicating success
- `error`: Error message if sign in failed
- `url`: Redirect URL if applicable
- `user`: User object if sign in succeeded

### Example (Server Side)

```typescript
// src/routes/api/signin/+server.ts
import { json } from '@sveltejs/kit';
import { signIn } from '$lib/auth';

export async function POST({ request, cookies }) {
  const body = await request.json();
  
  try {
    const result = await signIn('credentials', {
      email: body.email,
      password: body.password,
      redirect: false,
      cookies
    });
    
    if (result.error) {
      return json({ error: result.error }, { status: 401 });
    }
    
    return json({ success: true, user: result.user });
  } catch (error) {
    return json({ error: 'Authentication failed' }, { status: 500 });
  }
}
```

## Client-Side Usage

### Syntax

```typescript
import { signIn } from 'svelte-guardian/client';

const result = await signIn(provider: string, options?: ClientSignInOptions): Promise<ClientSignInResult>
```

### Example (Client Side)

```typescript
import { signIn } from 'svelte-guardian/client';

async function handleSignIn() {
  try {
    const result = await signIn('credentials', {
      email: 'user@example.com',
      password: 'password123',
      redirect: false
    });
    
    if (result.error) {
      // Handle error
      console.error(result.error);
      return;
    }
    
    // Success, user is signed in
    console.log('Signed in:', result.user);
  } catch (error) {
    console.error('Sign in failed:', error);
  }
}

// OAuth sign in with automatic redirect
function handleGoogleSignIn() {
  signIn('google', {
    callbackUrl: '/dashboard'
  });
}
```

## OAuth Flow

When using OAuth providers, the `signIn()` function initiates an OAuth flow:

1. `signIn('google')` redirects the user to the Google authorization page
2. After the user authorizes your app, Google redirects back to your application
3. Svelte Guardian handles the callback, verifies the tokens, and creates a session
4. The user is redirected to the callbackUrl or the default page

## Registration Flow

For new user registration with the credentials provider:

```typescript
const result = await signIn('credentials', {
  email: 'newuser@example.com',
  password: 'securepassword',
  name: 'New User', // Optional
  isRegistration: true,
  redirect: false
});
```

## Related

- [signOut()](/api-reference/core/sign-out.md)
- [createUser()](/api-reference/core/create-user.md)
- [guardianAuth()](/api-reference/core/guardian-auth.md)
