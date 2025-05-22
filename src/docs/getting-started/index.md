---
title: "Getting Started with Svelte Guardian"
description: "Guide to set up Svelte Guardian in your SvelteKit project."
---

# Getting Started with Svelte Guardian

Welcome to the getting started section of the Svelte Guardian documentation. These guides will help you set up and configure Svelte Guardian in your SvelteKit project to implement comprehensive authentication and authorization functionality.

## In This Section

- [Installation](#installation) - Install and configure Svelte Guardian
- [Configuration](/getting-started/configuration.md) - Configure Svelte Guardian options
- [Authentication Pages](/getting-started/auth-pages.md) - Create sign-in, sign-up, and other auth pages
- [Route Protection](/getting-started/route-protection.md) - Protect routes based on authentication status
- [Session Management](/getting-started/session-management.md) - Manage user sessions
- [User Profiles](/getting-started/user-profiles.md) - Work with user data
- [Directory Structure](/getting-started/directory-structure.md) - Understand project organization

## Prerequisites

- A SvelteKit project (v2.0.0 or higher)
- Node.js (v20 or higher)
- A database for storing user information (Prisma is recommended)

## Installation

```bash
# Using npm
npm install svelte-guardian

# Using pnpm
pnpm add svelte-guardian

# Using yarn
yarn add svelte-guardian
```

## Basic Setup

### 1. Database Setup

Svelte Guardian works with various databases through adapters. We recommend using Prisma:

```bash
# Install Prisma and the Prisma adapter
npm install prisma @prisma/client @auth/prisma-adapter
npx prisma init
```

Add the required schema to your `prisma/schema.prisma` file:

```prisma
model Account {
  id                String    @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  user              User      @relation(fields: [userId], references: [id])

  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  @@unique([provider, providerAccountId])
}

model Session {
   id           String   @id @default(cuid())
  userId       String
  expires      DateTime
  sessionToken String   @unique
  user         User     @relation(fields: [userId], references: [id])
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  password      String?
  image         String?
  role          String?   @default("user")
  accounts      Account[]
  sessions      Session[]
}

model VerificationToken {
  id          String   @id @default(cuid())
  identifier  String
  type        String?
  token       String   @unique
  expires     DateTime

  @@unique([identifier, token])
}
```

Run the migration:

```bash
npx prisma migrate dev --name init
```

### 2. Configure Svelte Guardian

Create a file at `src/lib/server/auth.ts`:

```typescript
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
    }
  },
  security: {
    emailVerification: {
      method: 'otp',
      otpLength: 6,
      otpExpiration: 15 // in minutes
    },
    emailProvider: {
      type: 'nodemailer',
      service: 'gmail',
      from: 'Your App <your-email@gmail.com>',
      auth: {
        method: 'app-password',
        user: process.env.EMAIL_USER,
        appPass: process.env.EMAIL_APP_PASSWORD
      }
    }
  }
});
```

Then create or modify your `src/hooks.server.js` (or `.ts`) file:

```typescript
import { sequence } from '@sveltejs/kit/hooks';
import { handle as authHandle, middleware } from '$lib/auth';

export const handle = sequence(authHandle, middleware);
```

### 3. Create Sign-in and Sign-up Pages

Create basic sign-in and sign-up pages in your project. Here's a simple example for `src/routes/signin/+page.svelte`:

```svelte
<script>
  import { signIn } from '$lib/server/auth';
  
  let email = '';
  let password = '';
  let error = '';
  
  async function handleSubmit() {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/dashboard'
      });
      
      if (result.error) {
        error = 'Invalid email or password';
      }
    } catch (err) {
      error = 'An error occurred. Please try again.';
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <h1>Sign In</h1>
  
  {#if error}
    <div class="error">{error}</div>
  {/if}
  
  <div>
    <label for="email">Email</label>
    <input type="email" id="email" bind:value={email} required />
  </div>
  
  <div>
    <label for="password">Password</label>
    <input type="password" id="password" bind:value={password} required />
  </div>
  
  <button type="submit">Sign In</button>
  
  <p>
    Don't have an account? <a href="/signup">Sign up</a>
  </p>
</form>
```

### 4. Configure Route Protection

To protect routes based on authentication status or user roles, add route protection to your configuration:

```typescript
security: {
  // Other security settings...
  routeProtection: {
    protectedRoutes: {
      '/admin': {
        allowedRoles: ['admin'],
        redirectPath: '/signin'
      },
      '/dashboard': {
        authenticated: true,
        redirectPath: '/signin'
      }
    },
    publicRoutes: {
      '/signin': {
        redirectPath: '/dashboard'
      },
      '/signup': {}
    }
  }
}
```

## Getting Started Guides

Our getting started documentation is organized into the following sections:

1. [Introduction to Svelte Guardian](./introduction.md) - Overview of Svelte Guardian features and concepts
2. [Installation](./installation.md) - Step-by-step installation instructions
3. [Configuration](./configuration.md) - Detailed configuration options
4. [Authentication Pages](./auth-pages.md) - Creating sign-in, sign-up, and other authentication pages
5. [Route Protection](./route-protection.md) - Protecting routes based on authentication status and user roles
6. [Session Management](./session-management.md) - Working with user sessions
7. [User Data and Profiles](./user-profiles.md) - Managing user data and profiles

## Next Steps

After completing the getting started guides, you might want to explore these additional features:

- [Email Verification and Password Reset](../guides/email-verification-password-reset.md)
- [OAuth Providers](../guides/oauth-providers.md)
- [Two-Factor Authentication](../guides/two-factor-auth.md)
- [Advanced Security Features](../security/index.md)
- [Implementing Two-Factor Authentication](/guides/two-factor-auth.md)
- [Customizing Email Templates](/guides/email-templates.md)
- [Rate Limiting and Security Features](/security/rate-limiting.md)

For a complete list of configuration options, check the [Configuration Reference](/api-reference/configuration.md).