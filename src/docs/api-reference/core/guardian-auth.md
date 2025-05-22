---
title: "guardianAuth()"
description: "Main initialization function for Svelte Guardian."
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

- `handle`: A SvelteKit handle function to be used in your hooks.server.js file
- `signIn`: A function for programmatically signing in users
- `signOut`: A function for programmatically signing out users
- `middleware`: A function that can be composed with other SvelteKit middleware

## Example

```typescript
// src/hooks.server.ts
import { guardianAuth } from 'svelte-guardian';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import { sequence } from '@sveltejs/kit/hooks';

const prisma = new PrismaClient();
const adapter = PrismaAdapter(prisma);

const { handle: authHandle, signIn, signOut, middleware } = await guardianAuth({
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

// Combine with other SvelteKit middleware
export const handle = sequence(authHandle, middleware);
export { signIn, signOut };
```

## Configuration Options

For detailed information about all available configuration options, see the [Configuration Options](/api-reference/config/options.md) documentation.

## Related

- [signIn()](/api-reference/core/sign-in.md)
- [signOut()](/api-reference/core/sign-out.md)
- [createUser()](/api-reference/core/create-user.md)
