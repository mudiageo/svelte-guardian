---
title: "Configuration Options"
description: "Complete reference for all Svelte Guardian configuration options."
---

# Configuration Options

This page documents all available configuration options for Svelte Guardian. These options are passed to the `guardianAuth()` function when setting up authentication.

## Complete Configuration Object

Below is the complete configuration object with all available options. All options are typed with TypeScript for better development experience.

```typescript
const config = {
  // Database configuration
  database: {
    type: 'prisma', // 'prisma', 'mongodb', 'postgres', 'custom'
    adapter: customAdapter, // For 'custom' type
    url: process.env.DATABASE_URL,
    options: {
      // Database-specific options
    }
  },
  
  // Authentication providers
  providers: {
    // Credentials provider (email/password)
    credentials: {
      enabled: true,
      allowRegistration: true,
      requireEmailVerification: true,
      passwordPolicy: {
        minLength: 8,
        requireLetters: true,
        requireNumbers: true,
        requireSymbols: true,
        requireUppercase: true,
        requireLowercase: true
      },
      loginFields: ['email', 'password'],
      registrationFields: ['email', 'password', 'name']
    },
    
    // OAuth providers
    oauth: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        allowRegistration: true,
        scope: ['profile', 'email']
      },
      github: {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        allowRegistration: true,
        scope: ['user:email']
      },
      // Other OAuth providers follow the same pattern
    }
  },
  
  // Security settings
  security: {
    // Session configuration
    session: {
      strategy: 'database', // 'database', 'jwt', or 'cookie'
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
      updateAge: 24 * 60 * 60, // 24 hours in seconds
      rememberMeMaxAge: 90 * 24 * 60 * 60, // 90 days in seconds
      cookieOptions: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    
    // CSRF protection
    csrf: {
      enabled: true,
      cookieName: 'guardian-csrf',
      headerName: 'guardian-csrf-token'
    },
    
    // Email verification
    emailVerification: {
      method: 'otp', // 'otp' or 'link'
      otpLength: 6,
      otpExpiration: 15, // minutes
      tokenExpiration: 60, // minutes
      sendEmailOnRegistration: true
    },
    
    // Password reset
    passwordReset: {
      method: 'link', // 'link' or 'otp'
      tokenExpiration: 60, // minutes
      otpExpiration: 15 // minutes
    },
    
    // Rate limiting
    rateLimiting: {
      enabled: true,
      strategy: 'memory', // 'memory', 'redis', or 'upstash-redis'
      requestsPerMinute: 60,
      blockDuration: 15 * 60 // seconds
    },
    
    // Two-factor authentication
    twoFactorAuth: {
      method: 'totp', // Currently only TOTP is supported
      allowBackupCodes: true,
      backupCodeCount: 8,
      issuer: 'Your App Name'
    },
    
    // Email provider configuration
    emailProvider: {
      type: 'nodemailer',
      service: 'gmail', // 'gmail', 'outlook', etc.
      host: 'smtp.example.com', // For custom SMTP
      port: 587,
      secure: false,
      from: 'Your App <your-email@example.com>',
      auth: {
        method: 'app-password', // 'password' or 'app-password'
        user: process.env.EMAIL_USER,
        appPass: process.env.EMAIL_APP_PASSWORD
      }
    },
    
    // Route protection
    routeProtection: {
      protectedRoutes: {
        '/dashboard': {
          authenticated: true,
          redirectPath: '/signin'
        },
        '/admin': {
          allowedRoles: ['admin'],
          redirectPath: '/unauthorized'
        }
      },
      publicRoutes: {
        '/signin': {
          redirectPath: '/dashboard'
        },
        '/signup': {
          redirectPath: '/dashboard'
        }
      }
    }
  },
  
  // Custom pages
  pages: {
    signIn: '/signin',
    signUp: '/signup',
    error: '/auth/error',
    verifyEmail: '/verify-email',
    resetPassword: '/reset-password',
    unauthorized: '/unauthorized'
  },
  
  // Event callbacks
  events: {
    async onSignIn(user) {
      console.log(`User signed in: ${user.email}`);
    },
    async onSignOut(user) {
      console.log(`User signed out: ${user.email}`);
    },
    async onUserCreation(user) {
      console.log(`User created: ${user.email}`);
    },
    async afterEmailVerification(user) {
      console.log(`Email verified: ${user.email}`);
    },
    async afterPasswordReset(user) {
      console.log(`Password reset for: ${user.email}`);
    }
  },
  
  // Additional callbacks
  callbacks: {
    async onJwtCreation({ token, user }) {
      // Add custom claims to JWT
      if (user) {
        token.role = user.role;
        token.customData = user.customData;
      }
      return token;
    },
    async onSessionCreation({ session, user }) {
      // Customize session data
      session.user.role = user.role;
      return session;
    },
    async authorize({ credentials }) {
      // Custom authorization logic
      return customAuthorizationCheck(credentials);
    }
  }
};
```

## Database Options

The `database` section configures how Svelte Guardian connects to your database for storing authentication data.

```typescript
database: {
  type: 'prisma', // 'prisma', 'mongodb', 'postgres', 'custom'
  adapter: customAdapter, // For 'custom' type
  url: process.env.DATABASE_URL, // Direct connection URL
  options: {
    // Database-specific options
  }
}
```

- For Prisma, you'll typically use:
```typescript
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const adapter = PrismaAdapter(prisma);

database: {
  type: 'custom',
  adapter
}
```

## Providers Options

The `providers` section configures authentication methods available in your application.

### Credentials Provider

```typescript
credentials: {
  enabled: true,
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
  loginFields: ['email', 'password'], // Required login fields
  registrationFields: ['email', 'password', 'name'] // Required registration fields
}
```

### OAuth Providers

```typescript
oauth: {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    allowRegistration: true, // Allow new users to register via Google
    scope: ['profile', 'email'],
    // Optional advanced settings
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://openidconnect.googleapis.com/v1/userinfo',
    profile(profile) {
      // Custom profile mapping
      return {
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        image: profile.picture
      };
    }
  }
}
```

Similar configuration applies to other OAuth providers like GitHub, Facebook, Twitter, etc.

## Security Options

### Session Configuration

```typescript
session: {
  strategy: 'database', // 'database', 'jwt', or 'cookie'
  maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  updateAge: 24 * 60 * 60, // Update session every 24 hours
  cookieOptions: {
    httpOnly: true, // Prevents JavaScript access
    sameSite: 'lax', // CSRF protection
    path: '/',
    secure: process.env.NODE_ENV === 'production' // HTTPS only in production
  }
}
```

### Email Verification

```typescript
emailVerification: {
  method: 'otp', // 'otp' or 'link'
  otpLength: 6, // Length of OTP code
  otpExpiration: 15, // OTP validity in minutes
  tokenExpiration: 60, // Link token validity in minutes
  sendEmailOnRegistration: true // Automatically send verification email
}
```

### Route Protection

```typescript
routeProtection: {
  // Routes that require authentication
  protectedRoutes: {
    '/dashboard': {
      authenticated: true,
      redirectPath: '/signin'
    },
    '/admin': {
      allowedRoles: ['admin'],
      redirectPath: '/unauthorized'
    },
    '/projects/:projectId': {
      authorize: async ({ user, params }) => {
        // Custom authorization check
        return checkProjectAccess(user.id, params.projectId);
      },
      redirectPath: '/unauthorized'
    }
  },
  
  // Routes for unauthenticated users (will redirect if authenticated)
  publicRoutes: {
    '/signin': {
      redirectPath: '/dashboard'
    },
    '/signup': {
      redirectPath: '/dashboard'
    }
  }
}
```

## Event Callbacks

Svelte Guardian provides various events you can hook into:

```typescript
events: {
  async onSignIn(user) {
    // Called when a user signs in
    logUserActivity(user.id, 'sign_in');
  },
  
  async onSignOut(user) {
    // Called when a user signs out
    logUserActivity(user.id, 'sign_out');
  },
  
  async onUserCreation(user) {
    // Called when a new user is created
    await addUserToNewsletter(user);
  },
  
  async afterEmailVerification(user) {
    // Called after a user verifies their email
    await grantInitialCredits(user.id);
  }
  
  // Other available events:
  // - afterPasswordReset
  // - afterTwoFactorSetup
  // - afterTwoFactorVerification
  // - onSessionUpdate
}
```

## Advanced Callbacks

For more customization, Svelte Guardian offers advanced callbacks:

```typescript
callbacks: {
  async onJwtCreation({ token, user }) {
    // Customize JWT token data
    if (user) {
      token.role = user.role;
      token.permissions = await getUserPermissions(user.id);
    }
    return token;
  },
  
  async onSessionCreation({ session, user, token }) {
    // Customize session data
    session.user.role = user.role;
    session.user.lastActive = new Date();
    return session;
  },
  
  async authorize({ credentials }) {
    // Custom authorization logic for credentials
    if (isUnderMaintenance() && credentials.email !== 'admin@example.com') {
      return null; // Block all users except admin during maintenance
    }
    return true; // Allow default authorization to proceed
  }
}
```

## Related

- [Environment Variables](/api-reference/config/env-vars.md)
- [Types and Interfaces](/api-reference/types.md)
- [guardianAuth()](/api-reference/core/guardian-auth.md)
