---
title: "Configuration"
description: "Configuration options for Svelte Guardian in your SvelteKit project."
date: "2025-05-22"
---

# Configuring Svelte Guardian

This guide covers the basic and advanced configuration options for Svelte Guardian to customize it for your SvelteKit application.

## Basic Configuration

To set up Svelte Guardian, you need to initialize it in your SvelteKit hooks file. Create or modify your `src/hooks.server.js` (or `.ts` for TypeScript projects):

```typescript
import { guardianAuth } from 'svelte-guardian';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import { sequence } from '@sveltejs/kit/hooks';

// Initialize Prisma client
const prisma = new PrismaClient();
const adapter = PrismaAdapter(prisma);

// Configure Svelte Guardian
const { handle: authHandle, signIn, signOut, middleware } = await guardianAuth({
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

// Combine SvelteKit hooks
export const handle = sequence(authHandle, middleware);
export { signIn, signOut };
```

## Configuration Options

### Database Configuration

Configure the database backend for storing authentication data:

```typescript
database: {
  type: 'custom', // 'custom', 'mongodb', 'prisma', etc.
  adapter, // Your database adapter
  
  // Direct database connection (if not using an adapter)
  url: process.env.DATABASE_URL,
  options: {
    // Database-specific options
  }
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
    passwordPolicy: {
      minLength: 8,
      requireLetters: true,
      requireNumbers: true,
      requireSymbols: true,
      requireUppercase: true,
      requireLowercase: true
    },
    loginFields: ['email', 'password'], // Fields required for login
    registrationFields: ['email', 'password', 'name'] // Fields required for registration
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
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowRegistration: true // Allow new users to register via Google
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      allowRegistration: true
    }
  }
}
```

### Security Configuration

Configure security features:

```typescript
security: {
  // Session configuration
  session: {
    strategy: 'database', // 'database', 'jwt', or 'cookie'
    maxAge: 30 * 24 * 60 * 60, // Session max age in seconds
    updateAge: 24 * 60 * 60 // Update session every 24 hours
  },
  
  // CSRF protection
  csrf: {
    enabled: true,
    cookieName: 'guardian-csrf',
    headerName: 'guardian-csrf-token'
  },
  
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
    sendEmailOnRegistration: true // Automatically send verification email
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
      user: process.env.EMAIL_USER,
      appPass: process.env.EMAIL_APP_PASSWORD // or 'pass' for regular password
    },
    
    // Or use SMTP configuration
    /*
    type: 'nodemailer',
    host: 'smtp.example.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
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

### Callbacks and Events

Configure custom callbacks and event handlers:

```typescript
callbacks: {
  // Called when a user signs in
  async onSignIn({ user, account, profile }) {
    // Custom logic, e.g., recording login attempts
    return true; // Return false to block sign-in
  },
  
  // Called when a new user is created
  async onUserCreation(user) {
    // Custom logic, e.g., adding to CRM system
    return user;
  },
  
  // Called when a JWT is created
  async onJwtCreation({ token, user }) {
    // Add custom claims to JWT
    if (user) {
      token.role = user.role;
      token.customData = user.customData;
    }
    return token;
  }
},

events: {
  // Triggered after successful sign-in
  async afterSignIn(user) {
    console.log(`User signed in: ${user.email}`);
  },
  
  // Triggered after signing out
  async afterSignOut(user) {
    console.log(`User signed out: ${user.email}`);
  },
  
  // Triggered after email verification
  async afterEmailVerification(user) {
    console.log(`Email verified for user: ${user.email}`);
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
