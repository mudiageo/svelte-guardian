---
title: Security Best Practices
---

# Security Best Practices

This guide outlines security best practices when implementing authentication with Svelte Guardian.

## Authentication Security

### Password Policies

Always enforce strong password policies:

```typescript
security: {
  passwordPolicy: {
    minLength: 12,                // Minimum length of 12 characters
    requireUppercase: true,       // Require uppercase letters
    requireLowercase: true,       // Require lowercase letters
    requireNumbers: true,         // Require numbers
    requireSpecialChars: true     // Require special characters
  }
}
```

### Account Lockout

Protect against brute force attacks with account lockouts:

```typescript
security: {
  maxLoginAttempts: 5,             // Lock after 5 failed attempts
  lockoutDuration: 15 * 60 * 1000  // Lock for 15 minutes (in milliseconds)
}
```

### Multi-Factor Authentication

Always offer MFA options to your users:

```typescript
security: {
  twoFactorAuth: {
    method: 'totp',              // Time-based one-time passwords
    allowBackupCodes: true,      // For account recovery
    backupCodeCount: 10          // Number of backup codes
  }
}
```

## Transport Security

### HTTPS

Always use HTTPS in production environments. In SvelteKit, ensure your deployment platform enforces HTTPS, and configure secure cookies:

```typescript
security: {
  session: {
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production'  // Require HTTPS in production
    }
  }
}
```

### Security Headers

Use appropriate security headers:

```typescript
security: {
  level: 'strict'  // Applies strict security headers
}
```

This sets:
- `Strict-Transport-Security`: Enforces HTTPS
- `X-Frame-Options`: Prevents clickjacking
- `X-Content-Type-Options`: Prevents MIME type sniffing
- `Content-Security-Policy`: Controls resource loading

## Data Protection

### Database Security

1. **Use Parameterized Queries**: Svelte Guardian uses ORM adapters that protect against SQL injection.

2. **Encrypt Sensitive Data**: Always encrypt passwords and sensitive information.

3. **Minimize Data Storage**: Only store what you need.

### Environment Variables

Store sensitive configuration in environment variables:

```typescript
emailProvider: {
  type: 'nodemailer',
  service: 'gmail',
  auth: {
    method: 'app-password',
    user: env.EMAIL_USER,
    appPass: env.EMAIL_APP_PASSWORD
  }
}
```

Create a `.env` file for local development:

```
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password
AUTH_SECRET=your-random-secret
```

In production, set these through your hosting platform's environment variable system.

## Session Management

### HTTP-only Cookies

Always use HTTP-only cookies for session tokens:

```typescript
security: {
  session: {
    cookieOptions: {
      httpOnly: true,       // Prevents JavaScript access
      sameSite: 'lax',      // Protects against CSRF
      secure: true,         // Requires HTTPS
      path: '/'
    }
  }
}
```

### Session Rotation

Generate new sessions on sign-in to prevent session fixation attacks:

```typescript
security: {
  session: {
    generateNewSessionOnLogin: true
  }
}
```

## Rate Limiting

Implement rate limiting for authentication endpoints:

```typescript
security: {
  rateLimiting: {
    enabled: true,
    requestsPerMinute: 60,   // Maximum requests per minute
    burst: 10                // Allow short bursts above the limit
  }
}
```

## Validation

Always validate inputs on both client and server sides:

```typescript
// Server-side validation example
const validPassword = validatePassword(data.password, passwordPolicy);
if (!validPassword?.success) {
  return { success: false, error: validPassword.message };
}
```

## Logging and Monitoring

Configure proper logging for security events:

```typescript
logging: {
  enabled: true,
  level: 'info',
  destinations: [
    { type: 'console' },
    { type: 'file', path: 'logs/auth.log' }
  ]
}
```

## Regular Security Updates

Keep Svelte Guardian and its dependencies up to date:

```bash
npm update svelte-guardian
```

Run security audits regularly:

```bash
npm audit
```

## OWASP Top 10 Protections

Svelte Guardian implements protections against many OWASP Top 10 vulnerabilities:

1. **Broken Authentication**: Secure authentication flows
2. **Sensitive Data Exposure**: Password hashing, secure cookies
3. **Injection**: Parameterized queries via adapters
4. **Cross-Site Scripting (XSS)**: HTTP-only cookies
5. **Security Misconfiguration**: Sensible defaults
6. **Cross-Site Request Forgery (CSRF)**: SameSite cookies, CSRF tokens
7. **Using Components with Known Vulnerabilities**: Regular updates

## Additional Resources

- [OWASP Authentication Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
