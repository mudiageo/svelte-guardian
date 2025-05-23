---
title: Security Features
---

# Security Features

Svelte Guardian provides multiple security features to protect your application and users from common threats.

## Password Security

### Password Policies

Configure strong password requirements:

```typescript
security: {
  passwordPolicy: {
    minLength: 12,                // Minimum password length
    maxLength: 128,               // Maximum password length
    requireUppercase: true,       // Require at least one uppercase letter
    requireLowercase: true,       // Require at least one lowercase letter
    requireNumbers: true,         // Require at least one number
    requireSpecialChars: true,    // Require at least one special character
    specialChars: '!@#$%^&*()_+' // Define custom special characters
  }
}
```

You can specify a specific number of characters for each requirement:

```typescript
passwordPolicy: {
  requireUppercase: 2,  // Require at least 2 uppercase letters
  requireNumbers: 3     // Require at least 3 numbers
}
```

### Account Lockout

Protect against brute force attacks:

```typescript
security: {
  maxLoginAttempts: 5,             // Number of attempts before locking
  lockoutDuration: 15 * 60 * 1000  // Lock duration in milliseconds (15 minutes)
}
```

## Multi-factor Authentication

### TOTP (Time-based One-Time Password)

Enable authenticator app MFA:

```typescript
security: {
  twoFactorAuth: {
    method: 'totp',              // Use time-based one-time passwords
    allowBackupCodes: true,      // Allow backup codes for account recovery
    backupCodeCount: 10          // Number of backup codes to generate
  }
}
```

### Backup Codes

When enabled, backup codes let users regain access if they lose their authenticator device.

## Session Security

### HTTP-only Cookies

Protect against JavaScript attacks by using HTTP-only cookies:

```typescript
security: {
  session: {
    cookieOptions: {
      httpOnly: true,       // Prevent JavaScript access
      sameSite: 'lax',      // Protect against CSRF
      secure: true,         // Require HTTPS
      path: '/'
    }
  }
}
```

### Session Fixation Protection

Generate new sessions on authentication to prevent session fixation attacks:

```typescript
security: {
  session: {
    generateNewSessionOnLogin: true
  }
}
```

## Security Headers

Configure robust security headers based on your security needs:

```typescript
security: {
  level: 'strict'  // Options: 'strict', 'moderate', 'relaxed'
}
```

The `strict` level applies the following headers:
- Strict-Transport-Security
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Content-Security-Policy with restrictive defaults

## Rate Limiting

Protection against excessive requests:

```typescript
security: {
  rateLimiting: {
    enabled: true,
    requestsPerMinute: 60,   // Maximum requests per minute per IP
    burst: 10,               // Allow short bursts above the limit
    trustProxy: true         // Trust X-Forwarded-For headers
  }
}
```

## Cross-Site Request Forgery (CSRF) Protection

CSRF tokens are automatically generated and validated for all POST, PUT, PATCH, and DELETE requests.

## Route Protection

Define access rules for different routes:

```typescript
security: {
  routeProtection: {
    protectedRoutes: {
      '/admin': {
        allowedRoles: ['admin'],      // Only admin role can access
        redirectPath: '/unauthorized'  // Where to redirect unauthorized users
      },
      '/dashboard': {
        authenticated: true,           // Any authenticated user can access
        redirectPath: '/signin'        // Where to redirect unauthenticated users
      }
    },
    publicRoutes: {
      '/signin': {
        redirectPath: '/dashboard'     // Redirect authenticated users away
      }
    },
    redirectPath: '/signin',           // Default redirect for unauthorized access
    roleKey: 'role'                    // Property name for role in user object
  }
}
```

## Email Security

### Email Verification

Require email verification before allowing full access:

```typescript
security: {
  emailVerification: {
    method: 'otp',           // Options: 'otp', 'magic-link'
    otpLength: 6,            // Length of verification code
    otpExpiration: 15        // Expiration in minutes
  }
}
```

### Secure Password Reset

Configure secure password reset flows:

```typescript
security: {
  passwordReset: {
    tokenExpiration: 15      // Token expiration in minutes
  }
}
```

## Logging and Auditing

Enable security event logging:

```typescript
logging: {
  enabled: true,
  level: 'info',             // Log level: 'debug', 'info', 'warn', 'error'
  destinations: [
    { type: 'console' },     // Log to console
    { type: 'file', path: 'logs/auth.log' }  // Log to file
  ]
}
```
