---
title: Core API Reference
description: Reference for core API functionalities including user creation, authentication, and session management.
---

# guardianAuth()

The `guardianAuth()` function is the primary entry point for setting up Svelte Guardian in your SvelteKit application. It configures authentication providers, security settings, and creates the necessary middleware for handling authentication.

## Syntax

```typescript
const { handle, signIn, signOut, middleware } = await guardianAuth(config: GuardianAuthConfig);
```

## Parameters

`config` - A [GuardianAuthConfig](/api-reference/types.md#guardianauthconfig) object containing all configuration options.

## Return Value

Returns an object with the following properties:

- `handle`: A SvelteKit handle function to be used in your hooks.server.ts file
- `signIn`: A function for programmatically signing in users
- `signOut`: A function for programmatically signing out users
- `middleware`: A function that can be composed with other SvelteKit middleware

## Example

```typescript
// src/lib/server/auth.ts
import { guardianAuth } from 'svelte-guardian';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import { env } from '$env/dynamic/private';

const prisma = new PrismaClient();
const adapter = PrismaAdapter(prisma);

export const { handle, signIn, signOut, middleware, createUser } = await guardianAuth({
  database: {
    type: 'custom',
    adapter
  },
  providers: {
    credentials: {
      allowRegistration: true,
      requireEmailVerification: true
    },
    oauth: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET
      }
    }
  },
  security: {
    session: {
      strategy: 'database',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    },
    emailVerification: {
      method: 'otp',
      otpLength: 6,
      otpExpiration: 15 // minutes
    }
  }
});

// In your src/hooks.server.ts file:
import { sequence } from '@sveltejs/kit/hooks';
import { handle as authHandle, middleware } from '$lib/auth';

export const handle = sequence(authHandle, middleware);
```

## Configuration Options

For detailed information about all available configuration options, see the [Configuration Options](/api-reference/config.md#configuration-options) documentation.

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
import { signIn } from '$lib/server/auth';

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
import { signOut } from '$lib/server/auth';

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

# createUser()

The `createUser()` function is used to programmatically create new users in your application. It's particularly useful for admin functionality, seeding databases, or implementing custom registration flows.

## Syntax

```typescript
const user = await createUser(userData: CreateUserData, options?: CreateUserOptions): Promise<User>
```

## Parameters

- `userData`: A [CreateUserData](/api-reference/types.md#createuserdata) object containing:
  - `email`: User's email address (required)
  - `password`: User's password (required for credentials provider)
  - `name`: User's display name (optional)
  - `role`: User's role (optional, defaults to 'user')
  - `emailVerified`: Whether the email is already verified (optional)
  - Additional custom fields as needed

- `options`: A [CreateUserOptions](/api-reference/types.md#createuseroptions) object containing:
  - `sendVerificationEmail`: Whether to send a verification email (default: false)
  - `skipPasswordHashing`: Whether the password is already hashed (default: false)
  - `skipValidation`: Whether to skip validation rules (default: false)
  - `provider`: Which auth provider to associate with the user (default: 'credentials')

## Return Value

Returns a [User](/api-reference/types.md#user) object representing the newly created user.

## Example

### Basic Usage

```typescript
import { createUser } from '$lib/server/auth';

const newUser = await createUser({
  email: 'user@example.com',
  password: 'securePassword123',
  name: 'New User',
  role: 'admin'
});

console.log('Created user:', newUser.id);
```

### With Email Verification

```typescript
const newUser = await createUser({
  email: 'user@example.com',
  password: 'securePassword123',
  name: 'New User'
}, {
  sendVerificationEmail: true
});
```

### With Pre-Hashed Password

```typescript
import { hashPassword } from 'svelte-guardian/server';

const hashedPassword = await hashPassword('securePassword123');

const newUser = await createUser({
  email: 'user@example.com',
  password: hashedPassword,
  emailVerified: new Date()
}, {
  skipPasswordHashing: true
});
```

### With Custom Fields

```typescript
const newUser = await createUser({
  email: 'user@example.com',
  password: 'securePassword123',
  name: 'New User',
  // Custom fields
  firstName: 'New',
  lastName: 'User',
  phoneNumber: '+1234567890',
  preferences: {
    theme: 'dark',
    notifications: true
  }
});
```

## Error Handling

The `createUser()` function throws errors that should be caught and handled appropriately:

```typescript
try {
  const newUser = await createUser({
    email: 'user@example.com',
    password: 'securePassword123'
  });
  
  // Success
  return newUser;
} catch (error) {
  if (error.code === 'USER_EXISTS') {
    // Handle duplicate user
    console.error('User already exists');
  } else if (error.code === 'VALIDATION_FAILED') {
    // Handle validation error
    console.error('Validation failed:', error.message);
  } else {
    // Handle other errors
    console.error('Failed to create user:', error);
  }
  throw error; // Re-throw or handle as appropriate
}
```

## Events

Creating a user triggers the following events if configured:

- `onUserCreation`: Called when a user is successfully created
- `afterRegistration`: Called after a user is created via registration
