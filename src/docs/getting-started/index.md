# Getting Started with Svelte Guardian

This guide will help you set up Svelte Guardian in your SvelteKit project and implement basic authentication functionality.

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

Create or modify your `src/hooks.server.js` (or `.ts`) file:

```typescript
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

export const handle = sequence(authHandle, middleware);
export { signIn, signOut };
```

### 3. Create Sign-in and Sign-up Pages

Create basic sign-in and sign-up pages in your project. Here's a simple example for `src/routes/signin/+page.svelte`:

```svelte
<script>
  import { signIn } from '$lib/auth';
  
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

## Next Steps

After completing this basic setup, you might want to explore these additional features:

- [Adding OAuth Providers](/guides/oauth-providers.md)
- [Implementing Two-Factor Authentication](/guides/two-factor-auth.md)
- [Customizing Email Templates](/guides/email-templates.md)
- [Rate Limiting and Security Features](/security/rate-limiting.md)

For a complete list of configuration options, check the [Configuration Reference](/api-reference/configuration.md).