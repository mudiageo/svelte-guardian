---
title: Configuration Reference
description: Detailed configuration options and environment variables.
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

# Environment Variables

Svelte Guardian uses several environment variables for configuration. This page documents all the environment variables that can be used with Svelte Guardian.

## Core Environment Variables

These are the core environment variables that Svelte Guardian uses:

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `AUTH_SECRET` | Secret key for encrypting JWTs and cookies | Yes | `52cb883e3b5054d8e5f10115285fb7a7` |
| `AUTH_TRUST_HOST` | Whether to trust the host header for callback URLs | In production | `true` |
| `DATABASE_URL` | Connection string for your database | Yes | `postgresql://user:pass@localhost:5432/db` |
| `AUTH_URL` | Base URL of your application | Yes | `https://example.com` |

## Provider Credentials

These environment variables are used for configuring OAuth providers:

| Variable | Description | Required For | Example |
|----------|-------------|--------------|---------|
| `GOOGLE_CLIENT_ID` | Client ID for Google OAuth | Google provider | `123456789-abc.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Client secret for Google OAuth | Google provider | `GOCSPX-abcdefghijklmnopqrst` |
| `GITHUB_CLIENT_ID` | Client ID for GitHub OAuth | GitHub provider | `abcdef1234567890` |
| `GITHUB_CLIENT_SECRET` | Client secret for GitHub OAuth | GitHub provider | `abcdef1234567890abcdef1234567890` |
| `FACEBOOK_CLIENT_ID` | Client ID for Facebook OAuth | Facebook provider | `123456789012345` |
| `FACEBOOK_CLIENT_SECRET` | Client secret for Facebook OAuth | Facebook provider | `abcdefghijklmnopqrstuvwxyz123456` |
| `TWITTER_CLIENT_ID` | Client ID for Twitter OAuth | Twitter provider | `abcdefghijklmnopqrstuv` |
| `TWITTER_CLIENT_SECRET` | Client secret for Twitter OAuth | Twitter provider | `abcdefghijklmnopqrstuvwxyz1234567890abcdefgh` |

## Email Configuration

These environment variables are used for configuring email services:

| Variable | Description | Required For | Example |
|----------|-------------|--------------|---------|
| `EMAIL_USER` | Email address for sending emails | Email features | `your-app@example.com` |
| `EMAIL_APP_PASSWORD` | App password for Gmail or other providers | Email features | `abcdefghijklmnop` |
| `EMAIL_PASSWORD` | Regular password (less secure) | Alternative to app password | `your-email-password` |
| `EMAIL_HOST` | SMTP host | Custom SMTP | `smtp.example.com` |
| `EMAIL_PORT` | SMTP port | Custom SMTP | `587` |
| `EMAIL_FROM` | From address for emails | Email features | `Your App <no-reply@example.com>` |

## Security Settings
//TODO
These environment variables affect security settings:

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `AUTH_JWT_SECRET` | Secret for JWT encoding (fallback to AUTH_SECRET) | `AUTH_SECRET` | `abcdefghijklmnopqrstuvwxyz1234567` |
| `AUTH_MAX_AGE` | Maximum session age in seconds | `2592000` (30 days) | `86400` (1 day) |
| `AUTH_REMEMBER_MAX_AGE` | "Remember Me" session max age in seconds | `7776000` (90 days) | `2592000` (30 days) |
| `AUTH_COOKIE_DOMAIN` | Cookie domain | Current domain | `.example.com` |
| `AUTH_COOKIE_PREFIX` | Prefix for auth cookies | `guardian` | `myapp` |
| `AUTH_SECURE_COOKIES` | Whether to use secure cookies | `true` in production | `true` |
| `AUTH_RATE_LIMIT_MAX` | Maximum requests per minute | `60` | `100` |

## Advanced Configuration
//TODO
These environment variables are used for advanced configuration:

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `AUTH_DEBUG` | Enable debug logging | `false` | `true` |
| `AUTH_EVENTS_MAX_RETENTION` | Days to retain auth events | `30` | `90` |
| `AUTH_DISABLE_CSRF` | Disable CSRF protection | `false` | `true` |
| `AUTH_SESSION_STRATEGY` | Session strategy | `database` | `jwt` |
| `AUTH_ADAPTER` | Adapter type shortcut | Auto-detected | `prisma` |
| `AUTH_SKIP_EMAIL_VERIFICATION` | Skip email verification | `false` | `true` |

## Development and Testing

These environment variables are useful during development and testing:
//TODO
| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `AUTH_DEV_EMAIL_CONSOLE` | Log emails to console in development | `false` | `true` |
| `AUTH_TEST_MODE` | Enable test mode with simplified auth flows | `false` | `true` |
| `AUTH_MOCK_USER` | JSON for a mocked user in development | `undefined` | `{"id":"1","email":"test@example.com"}` |

## Setting Environment Variables

### Development

For local development, create a `.env` file in your project root:

```
# Authentication
AUTH_SECRET=52cb883e3b5054d8e5f10115285fb7a7
AUTH_URL=http://localhost:5173
AUTH_TRUST_HOST=true

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/mydatabase

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password
```

### Production

For production environments, set environment variables according to your hosting platform's documentation.

#### Vercel

Set environment variables in the Vercel dashboard or using the Vercel CLI:

```bash
vercel env add AUTH_SECRET
vercel env add DATABASE_URL
# etc.
```

#### Netlify

Set environment variables in the Netlify dashboard or using the Netlify CLI:

```bash
netlify env:set AUTH_SECRET "your-secret"
netlify env:set DATABASE_URL "your-database-url"
# etc.
```

## Generating Secure Secrets

For `AUTH_SECRET` and similar variables, generate a secure random string:

```bash
# Using Node.js
node -e "console.log(crypto.randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

## Related
- [guardianAuth()](/api-reference/core.md#guardianauth())
