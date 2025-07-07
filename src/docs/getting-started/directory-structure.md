---
title: Directory Structure
---

# Directory Structure

This guide explains the recommended directory structure for a SvelteKit project using Svelte Guardian.

## Overview

```
src/
├── lib/
│   └── server/
│       └── auth.ts               # Main authentication setup
├── routes/
│   ├── +hooks.server.ts          # SvelteKit hooks using auth handle
│   ├── signin/
│   │   ├── +page.svelte          # Sign-in form UI
│   │   └── +page.server.ts       # Server actions for sign-in
│   ├── signup/
│   │   ├── +page.svelte          # Registration form UI
│   │   └── +page.server.ts       # Server actions for registration
│   ├── signout/
│   │   └── +page.server.ts       # Sign out logic
│   ├── verify-email/
│   │   ├── +page.svelte          # Email verification UI
│   │   └── +page.server.ts       # Email verification logic
│   └── reset-password/
│       ├── +page.svelte          # Password reset form UI
│       └── +page.server.ts       # Password reset logic
└── app.d.ts                      # TypeScript definitions
```

## Key Files

### `src/lib/server/auth.ts`

This is the main configuration file for Svelte Guardian. It exports the authentication functions and middleware used throughout your application.

```typescript
import { guardianAuth } from 'svelte-guardian';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import { env } from '$env/dynamic/private';

const prisma = new PrismaClient();
const adapter = PrismaAdapter(prisma);

export const { handle, signIn, signOut, middleware, createUser } = await guardianAuth({
  // Configuration options...
});
```

### `src/hooks.server.ts`

This file links your authentication system to SvelteKit's request handling pipeline.

```typescript
import { sequence } from '@sveltejs/kit/hooks';
import { handle as authHandle, middleware } from '$lib/auth';

export const handle = sequence(authHandle, middleware);
```

### Authentication Routes

These routes handle user authentication flows:

- `src/routes/signin/` - User sign-in
- `src/routes/signup/` - User registration
- `src/routes/signout/` - User sign-out
- `src/routes/verify-email/` - Email verification
- `src/routes/reset-password/` - Password reset

### TypeScript Definitions (Optional)

For TypeScript users, you'll want to extend the app.d.ts file to include session types:

```typescript
// src/app.d.ts
declare global {
  namespace App {
    interface Locals {
      auth(): Promise<import('@auth/core').Session | null>
    }
    interface PageData {
      session: import('@auth/core').Session | null
    }
  }
}

export {};
```

## Best Practices

1. **Separation of Concerns**: Keep authentication configuration in the server directory to prevent client-side bundling.

2. **Type Safety**: Use TypeScript for better autocompletion and error checking.

3. **Environment Variables**: Store sensitive values like API keys in environment variables.

4. **Progressive Enhancement**: Design your forms to work without JavaScript by using form actions.

5. **Security**: Follow the principle of least privilege when setting up route protection.
