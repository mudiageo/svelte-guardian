---
title: "Configuration"
description: "Configuration options for Svelte Guardian in your SvelteKit project."
---

# Configuring Svelte Guardian

This guide covers the basic and advanced configuration options for Svelte Guardian to customize it for your SvelteKit application.

## Basic Configuration

To set up Svelte Guardian, you need to initialize it in a server module. The recommended approach is to create a file at `src/lib/server/auth.ts`:

```typescript
//src/lib/server/auth.ts
import { guardianAuth } from 'svelte-guardian';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import { env } from '$env/dynamic/private';

// Initialize Prisma client
const prisma = new PrismaClient();
const adapter = PrismaAdapter(prisma);

// Configure Svelte Guardian
export const { handle, signIn, signOut, middleware, createUser } = await guardianAuth({
  database: {
    type: 'custom',
    adapter
  },
  providers: {
    credentials: {
      allowRegistration: true
    }
  },
  security: {
    // Basic security configuration
    session: {
      strategy: 'database',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    }
  }
});

//src/hooks.server.js
import { sequence } from '@sveltejs/kit/hooks';
import { handle as authHandle, middleware } from '$lib/auth';

export const handle = sequence(authHandle, middleware);
```

## Configuration Options

### Database Configuration

Configure the database backend for storing authentication data:

```typescript
database: {
  type: 'custom', // 'custom', 'mongodb', 'prisma', etc.
  adapter, // Your database adapter
  
  // Database-specific options (if not using an adapter) go here
}
```

### Authentication Providers

#### Credentials Authentication

Email and password authentication:

```typescript
providers: {
  credentials: {
    allowRegistration: true, // Allow users to register
    requireEmailVerification: true, // Require email verification
  }
}
```

#### OAuth Providers

Configuration for social login providers:

```typescript
providers: {
  // ... other providers
  oauth: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET
    },
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    }
  }
}
```

### Security Configuration

Configure security features:

```typescript
security: {
  // Rate limiting
  rateLimiting: {
    enabled: true,
    strategy: 'memory', // 'memory', 'redis', or 'upstash-redis'
    requestsPerMinute: 60,
    blockDuration: 15 * 60 // Block for 15 minutes after exceeding limit
  },
  
  // Email verification
  emailVerification: {
    method: 'otp', // 'otp' or 'link'
    otpLength: 6, // Length of OTP code
    otpExpiration: 15, // OTP validity in minutes
    tokenExpiration: 60, // Link token validity in minutes
    sendEmailOnRegistration: true //(TODO) Automatically send verification email
  },
  
  // Password reset
  passwordReset: {
    method: 'link', // 'link' or 'otp'
    tokenExpiration: 60, // Link token validity in minutes
    otpExpiration: 15 // OTP validity in minutes
  }
}
```

### Email Configuration

Configure email services for verification emails and password resets:

```typescript
security: {
  // ... other security settings
  
  emailProvider: {
    type: 'nodemailer',
    service: 'gmail', // 'gmail', 'outlook', 'mailgun', etc.
    from: 'Your App <your-email@gmail.com>',
    auth: {
      method: 'app-password', // 'password' or 'app-password'
      user: env.EMAIL_USER,
      appPass: env.EMAIL_APP_PASSWORD // or 'pass' for regular password
    },
    
    // Or use SMTP configuration
    /*
    type: 'nodemailer',
    host: 'smtp.example.com',
    port: 587,
    secure: false,
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASSWORD
    }
    */
  }
}
```

### Route Protection

Configure route protection based on authentication and roles:

```typescript
security: {
  // ... other security settings
  
  routeProtection: {
    // Routes that require authentication
    protectedRoutes: {
      '/dashboard': {
        authenticated: true, // Require any authenticated user
        redirectPath: '/signin'
      },
      '/admin': {
        allowedRoles: ['admin'], // Only allow users with 'admin' role
        redirectPath: '/unauthorized'
      },
      '/profile': {
        authenticated: true,
        redirectPath: '/signin'
      }
    },
    
    // Routes for unauthenticated users (will redirect if already authenticated)
    publicRoutes: {
      '/signin': {
        redirectPath: '/dashboard' // Redirect authenticated users
      },
      '/signup': {
        redirectPath: '/dashboard'
      },
      '/': {} // No redirect for homepage
    }
  }
}
```

## Advanced Configuration

For more advanced configuration options and detailed explanations, refer to the [API Reference](/api-reference/index.md).

## Next Steps

After configuring Svelte Guardian, you might want to:

1. Set up [authentication pages](./auth-pages.md) for sign-in and sign-up
2. Implement [email verification and password reset](../guides/email-verification-password-reset.md)
3. Add [OAuth providers](../guides/oauth-providers.md) for social login
4. Configure [two-factor authentication](../guides/two-factor-auth.md) for enhanced security
