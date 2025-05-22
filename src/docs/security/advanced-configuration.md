---
title: Advanced Security Configuration
---

# Advanced Security Configuration

This guide covers advanced security configurations available in Svelte Guardian to enhance your application's security posture.

## Defence in Depth

Svelte Guardian follows the security principle of "defence in depth" by providing multiple layers of security controls:

## Advanced Rate Limiting

Fine-tune rate limiting for different routes:

```typescript
security: {
  rateLimiting: {
    enabled: true,
    // Global limits
    requestsPerMinute: 60,
    
    // Route-specific limits
    routes: {
      '/api/auth/*': {
        requestsPerMinute: 10,
        blockDuration: 15 * 60 * 1000 // 15 minutes
      },
      '/api/sensitive-data': {
        requestsPerMinute: 5
      }
    },
    
    // IP whitelist (e.g., for internal systems)
    whitelist: ['127.0.0.1', '192.168.1.0/24'],
    
    // Custom response for rate-limited requests
    limitExceededResponse: {
      status: 429,
      body: { error: 'Too many requests, please try again later' }
    }
  }
}
```

## Adaptive Security
//TODO
Configure security levels that adapt based on risk factors:

```typescript
security: {
  adaptive: {
    enabled: true,
    riskFactors: {
      newIpAddress: true,
      newDevice: true,
      unusualLocation: true,
      unusualLoginTime: true,
      failedAttempts: true
    },
    actions: {
      lowRisk: ['log'],
      mediumRisk: ['log', 'email_user', 'require_2fa'],
      highRisk: ['log', 'email_user', 'require_2fa', 'admin_alert', 'block']
    }
  }
}
```

## Content Security Policy

Configure a detailed Content Security Policy:
//TODO
```typescript
security: {
  contentSecurityPolicy: {
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https://*.example.com'],
      'connect-src': ["'self'", 'https://api.example.com'],
      'frame-ancestors': ["'none'"],
      'form-action': ["'self'"]
    },
    reportOnly: false,
    reportUri: '/api/csp-violations'
  }
}
```

## Custom Password Validators

Add custom password validation rules:

```typescript
security: {
  passwordPolicy: {
    minLength: 12,
    // Standard rules
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    
    //TODO
    // Custom validators
    customValidators: [
      {
        // Prevent common passwords
        validate: (password) => !commonPasswordsList.includes(password.toLowerCase()),
        message: 'This password is too common and easily guessable'
      },
      {
        // Prevent password containing username
        validate: (password, user) => !password.toLowerCase().includes(user.username.toLowerCase()),
        message: 'Password cannot contain your username'
      }
    ]
  }
}
```

## Advanced Session Configuration

Fine-tune session security:

```typescript
security: {
  session: {
    strategy: 'database',
    maxAge: 7 * 24 * 60 * 60, // 1 week
    
    //TODO
    // Advanced cookie settings
    cookieOptions: {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      domain: '.example.com',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week in milliseconds
    },

    //TODO
    // Session security features
    rolling: true,                     // Reset expiration on activity
    renewAfterInactivity: 30 * 60,     // 30 minutes
    restrictToIP: false,               // Whether to restrict session to originating IP
    singleSession: true,               // Only allow one active session per user
    fingerprint: {                     // Browser fingerprinting for session validation
      enabled: true,
      tolerance: 3                     // Number of fingerprint attributes that can change
    }
  }
}
```

## Security Event Hooks

Configure custom reactions to security events:
//TODO
```typescript
events: {
  onLoginSuccess: async (user, context) => {
    // Custom login success logic
    await logUserActivity(user.id, 'login_success', context);
  },
  onLoginFailure: async (username, reason, context) => {
    // Handle login failures
    await logFailedAttempt(username, reason, context);
    if (reason === 'too_many_attempts') {
      await notifySecurityTeam(username, context);
    }
  },
  onPasswordChange: async (user) => {
    // Handle password change
    await sendPasswordChangeNotification(user.email);
  },
  onUserBlocked: async (user, reason) => {
    // Handle user being blocked
    await notifyAdmins(`User ${user.email} was blocked: ${reason}`);
  }
}
```

## Secure Headers Customization

Add or customize security headers:
//TODO
```typescript
security: {
  headers: {
    // Standard security headers with custom values
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    
    // Custom headers
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin'
  }
}
```

## JWT Configuration

If using JWT for sessions, configure advanced options:
//TODO
```typescript
security: {
  jwt: {
    // Signing options
    algorithm: 'RS256',            // Algorithm (RS256 recommended for production)
    expiresIn: '1h',               // Short-lived tokens
    notBefore: '0s',               // Valid immediately
    
    // Token configuration
    issuer: 'https://auth.example.com',
    audience: 'https://api.example.com',
    
    // Encryption options (for enhanced security)
    encryption: {
      enabled: true,
      algorithm: 'RSA-OAEP',
      encryptionAlgorithm: 'A256GCM'
    },
    
    // Refresh token configuration
    refreshToken: {
      enabled: true,
      expiresIn: '7d',
      rotateOnRefresh: true       // Generate new refresh token on use
    }
  }
}
```

## Monitoring and Logging

Configure comprehensive security monitoring:
//TODO
```typescript
security: {
  monitoring: {
    enabled: true,
    events: [
      'login_success', 
      'login_failure', 
      'password_change', 
      'password_reset',
      'user_create', 
      'user_update', 
      'role_change', 
      'permission_change'
    ],
    
    // Logging configuration
    logs: {
      level: 'info',
      format: 'json',
      redactSensitiveData: true,
      destinations: [
        { type: 'console' },
        { type: 'file', path: 'logs/security.log' },
        { 
          type: 'http', 
          url: 'https://logs.example.com/ingest',
          headers: { 'x-api-key': process.env.LOGGING_API_KEY }
        }
      ]
    },
    
    // Alerts
    alerts: {
      suspiciousActivity: {
        enabled: true,
        threshold: 5,
        channels: ['email', 'slack']
      }
    }
  }
}
