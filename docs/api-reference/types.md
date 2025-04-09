# Types and Interfaces

This page provides a comprehensive reference for all TypeScript types and interfaces used in Svelte Guardian.

## Core Types

### GuardianAuthConfig

The main configuration interface for setting up Svelte Guardian.

```typescript
interface GuardianAuthConfig {
  database: DatabaseConfig;
  providers: ProvidersConfig;
  security?: SecurityConfig;
  pages?: PagesConfig;
  events?: EventsConfig;
  callbacks?: CallbacksConfig;
}
```

### User

Represents a user in the system.

```typescript
interface User {
  id: string;
  name?: string;
  email?: string;
  emailVerified?: Date;
  image?: string;
  role?: string;
  [key: string]: any; // Additional custom fields
}
```

### Session

Represents a user session.

```typescript
interface Session {
  user: User;
  expires: Date;
  sessionToken: string;
}
```

### Account

Represents an OAuth account linked to a user.

```typescript
interface Account {
  id: string;
  userId: string;
  provider: string;
  providerAccountId: string;
  type: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
}
```

## Configuration Types

### DatabaseConfig

Configuration for the database backend.

```typescript
interface DatabaseConfig {
  type: 'prisma' | 'mongoose' | 'custom';
  url?: string;
  adapter?: Adapter;
  // Additional database-specific options
}
```

### ProvidersConfig

Configuration for authentication providers.

```typescript
interface ProvidersConfig {
  credentials?: CredentialsProviderConfig;
  google?: OAuthProviderConfig;
  github?: OAuthProviderConfig;
  facebook?: OAuthProviderConfig;
  microsoft?: OAuthProviderConfig;
  [key: string]: ProviderConfig | undefined;
}

interface CredentialsProviderConfig {
  enabled?: boolean;
  allowRegistration?: boolean;
  requireEmailVerification?: boolean;
  additionalUserFields?: string[];
}

interface OAuthProviderConfig {
  enabled?: boolean;
  clientId?: string;
  clientSecret?: string;
  scope?: string[];
  profile?: (profile: any) => User;
}
```

### SecurityConfig

Configuration for security features.

```typescript
interface SecurityConfig {
  level?: 'strict' | 'moderate' | 'relaxed';
  maxLoginAttempts?: number;
  lockoutDuration?: number;
  emailVerification?: EmailVerificationOptions;
  passwordReset?: PasswordResetOptions;
  twoFactorAuth?: TwoFactorAuthOptions;
  emailProvider?: EmailProviderConfig;
  rateLimiting: RateLimitingConfig;
  routeProtection?: RouteProtectionConfig;
  passwordPolicy?: PasswordPolicyConfig;
}
```

### EmailVerificationOptions

Configuration for email verification.

```typescript
interface EmailVerificationOptions {
  method: 'link' | 'otp';
  otpLength?: number;
  otpExpiration?: number;
  tokenExpiration?: number;
  sendEmailOnRegistration?: boolean;
}
```

### PasswordResetOptions

Configuration for password reset functionality.

```typescript
interface PasswordResetOptions {
  tokenExpiration: number;
  tokenLength?: number;
}
```

### TwoFactorAuthOptions

Configuration for two-factor authentication.

```typescript
interface TwoFactorAuthOptions {
  method: 'totp' | 'email';
  allowBackupCodes?: boolean;
  backupCodeCount?: number;
  issuer?: string;
}
```

### RateLimitingConfig

Configuration for rate limiting.

```typescript
interface RateLimitingConfig {
  enabled?: boolean;
  strategy?: 'memory' | 'redis' | 'upstash-redis';
  requestsPerMinute?: number;
  blockDuration?: number;
  windowMs?: number;
  maxRequests?: number;
  redisConfig?: RedisConfig;
  keyGenerator?: (event: RequestEvent) => string;
}
```

### RouteProtectionConfig

Configuration for route protection.

```typescript
interface RouteProtectionConfig {
  protectedRoutes?: {
    [route: string]: {
      allowedRoles?: string[];
      authenticated?: boolean;
      redirectPath?: string;
    };
  };
  publicRoutes?: {
    [route: string]: {
      redirectPath?: string;
    };
  };
  redirectPath?: string;
  authenticatedRedirect?: string;
  roleKey?: string;
}
```

### PagesConfig

Configuration for custom page paths.

```typescript
interface PagesConfig {
  signIn?: string;
  signUp?: string;
  error?: string;
  verifyEmail?: string;
  resetPassword?: string;
}
```

### EventsConfig

Configuration for event handlers.

```typescript
interface EventsConfig {
  createUser?: (user: User) => void | Promise<void>;
  signIn?: (user: User) => void | Promise<void>;
  signOut?: (user: User) => void | Promise<void>;
  linkAccount?: (account: Account) => void | Promise<void>;
  updateUser?: (user: User) => void | Promise<void>;
  session?: (session: Session) => void | Promise<void>;
}
```

### CallbacksConfig

Configuration for authentication callbacks.

```typescript
interface CallbacksConfig {
  signIn?: (params: { user: User, account: Account, profile: any }) => boolean | Promise<boolean>;
  redirect?: (params: { url: string, baseUrl: string }) => string | Promise<string>;
  session?: (params: { session: Session, user: User }) => Session | Promise<Session>;
  jwt?: (params: { token: JWT, user: User, account: Account }) => JWT | Promise<JWT>;
}
```

## Email Provider Types

### EmailProviderConfig

Configuration for email providers.

```typescript
interface EmailProviderConfig {
  type: 'nodemailer' | 'sendgrid' | 'ses' | 'resend' | 'log';
  from: string;
  service?: string;
  host?: string;
  port?: number;
  secure?: boolean;
  auth?: EmailAuthConfig;
  templates?: EmailTemplatesConfig;
}
```

### EmailTemplatesConfig

Configuration for email templates.

```typescript
interface EmailTemplatesConfig {
  verification?: {
    subject?: string;
    textTemplate?: string;
    htmlTemplate?: string;
  };
  passwordReset?: {
    subject?: string;
    textTemplate?: string;
    htmlTemplate?: string;
  };
  twoFactorAuth?: {
    subject?: string;
    textTemplate?: string;
    htmlTemplate?: string;
  };
}
```

## Result Types

### SignInResult

Result of a sign-in operation.

```typescript
interface SignInResult {
  success: boolean;
  user?: User;
  error?: string;
  url?: string;
}
```

### SignOutResult

Result of a sign-out operation.

```typescript
interface SignOutResult {
  success: boolean;
  error?: string;
  url?: string;
}
```

### CreateUserResult

Result of a user creation operation.

```typescript
interface CreateUserResult {
  success: boolean;
  user?: User;
  error?: string;
}
```

### VerificationResult

Result of an email verification operation.

```typescript
interface VerificationResult {
  success: boolean;
  error?: string;
  data?: string;
}
```

### PasswordResetResult

Result of a password reset operation.

```typescript
interface PasswordResetResult {
  success: boolean;
  error?: string;
}
```

## Utility Types

### JWT

JSON Web Token structure.

```typescript
interface JWT {
  name?: string;
  email?: string;
  picture?: string;
  sub?: string;
  iat?: number;
  exp?: number;
  jti?: string;
  [key: string]: any;
}
```

### RequestEvent

SvelteKit request event.

```typescript
interface RequestEvent {
  request: Request;
  url: URL;
  params: Record<string, string>;
  locals: App.Locals;
  route: {
    id: string;
  };
  getClientAddress(): string;
  setHeaders(headers: Record<string, string>): void;
}
```