# 🔐 Svelte Guardian

Batteries included authentication for SvelteKit applications.

## 🚀 Features
- Secure credentuals authentication
- Multiple authentication providers
- Robust security measures
- Flexible configuration
- Comprehensive logging
- Two-factor authentication support (incoming)

## 📦 Installation

```bash
pnpm install svelte-guardian # or use your favorite package manager
```

## 🔧 Basic Usage

```typescript
import { guardianAuth } from 'svelte-guardian';

export const { handle } = guardianAuth({
  providers: {
    google: { enabled: true },
    credentials: { enabled: true }
  },
  security: {
    level: 'strict',
    maxLoginAttempts: 5
  }
});
```

## 📄 Documentation
[Full documentation to be made available here]

## 🔧 Configuration API

### GuardianAuthOptions Interface

```typescript
interface GuardianAuthOptions {
  // Provider Configurations
  providers: {
    google?: {
      enabled: boolean;
      clientId?: string;
      clientSecret?: string;
      strict?: boolean;
    };
    credentials?: {
      enabled: boolean;
      allowRegistration?: boolean;
      passwordless?: boolean;
    };
    github?: {
      enabled: boolean;
      clientId?: string;
      clientSecret?: string;
    };
    // Extensible for more providers
  };

  // Security Configurations
  security: {
    maxLoginAttempts?: number;
    lockoutDuration?: number;
    requireEmailVerification?: boolean;
    twoFactor?: {
      enabled: boolean;
      method?: 'email' | 'totp' | 'sms';
    };
    passwordPolicy?: {
      minLength?: number;
      requireUppercase?: boolean;
      requireLowercase?: boolean;
      requireNumbers?: boolean;
      requireSpecialChars?: boolean;
    };
  };

  // Customization Options
  events?: {
    onSignIn?: (user: User) => Promise;
    onRegistration?: (user: User) => Promise;
    onPasswordReset?: (user: User) => Promise;
  };

  // Advanced Configurations
  advanced?: {
    sessionStrategy?: 'jwt' | 'database';
    tokenEncryption?: boolean;
    rateLimiting?: {
      enabled: boolean;
      requestsPerMinute?: number;
    };
  };
}
```

## 🛡️ Enhanced Security Features

### 1. Two-Factor Authentication

```typescript
guardianAuth({
  security: {
    twoFactor: {
      enabled: true,
      method: 'totp' // Time-based One-Time Password
    }
  }
});
```

### 2. Rate Limiting Configuration

```typescript
guardianAuth({
  advanced: {
    rateLimiting: {
      enabled: true,
      requestsPerMinute: 10
    }
  }
});
```

## 📝 Comprehensive Logging

```typescript
// src/lib/logger.ts
import { createLogger } from 'svelte-guardian/logger';

export const authLogger = createLogger({
  level: 'info',
  destinations: [
    { type: 'console' },
    { 
      type: 'file', 
      path: './logs/auth.log',
      maxSize: '10M',
      maxFiles: 5
    },
    {
      type: 'remote',
      endpoint: 'https://your-logging-service.com/logs'
    }
  ]
});
```

## 🔒 Environment Variables

Create a `.env` file in your project root:

```env
# Authentication Providers
GUARDIAN_GOOGLE_CLIENT_ID=your_google_client_id
GUARDIAN_GOOGLE_CLIENT_SECRET=your_google_client_secret
GUARDIAN_GITHUB_CLIENT_ID=your_github_client_id
GUARDIAN_GITHUB_CLIENT_SECRET=your_github_client_secret

# Security
GUARDIAN_JWT_SECRET=your_jwt_secret
GUARDIAN_ENCRYPTION_KEY=your_encryption_key

# Database
DATABASE_URL=your_database_connection_string
```


## 🔬 Advanced Usage Example
```typescript
import { guardianAuth, type User } from 'svelte-guardian';
import { authLogger } from '$lib/logger';

export const { handle } = guardianAuth({
  providers: {
    google: { enabled: true },
    credentials: { 
      enabled: true,
      allowRegistration: true 
    }
  },
  security: {
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000,
    twoFactor: {
      enabled: true,
      method: 'totp'
    },
    passwordPolicy: {
      minLength: 12,
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialChars: true
    }
  },
  events: {
    async onSignIn(user: User) {
      authLogger.info(`User signed in: ${user.email}`);
      // Additional custom logic
    },
    async onRegistration(user: User) {
      authLogger.info(`New user registered: ${user.email}`);
      // Send welcome email, etc.
    }
  },
  advanced: {
    sessionStrategy: 'database',
    rateLimiting: {
      enabled: true,
      requestsPerMinute: 10
    }
  }
});
```

## 🛠 TODO
- [ ] Implement logging
- [ ] Implement two factor auth, rate limiting, refresh token rotation
- [ ] Implement password security configuration
- [ ] Implement createUser function and handle registration internally
- [ ] Create comprehensive documentation site
- [ ] Add more authentication providers
- [ ] Implement more granular role-based access control
- [ ] Develop admin dashboard for user management

## 🤝 Contributing
[Contribution guidelines]

## 📄 License
MIT License
