# API Reference

Welcome to the Svelte Guardian API reference. This section provides detailed documentation for all components, functions, and types available in the library.

## Core APIs

- **[guardianAuth()](./core/guardian-auth.md)** - Main initialization function
- **[signIn()](./core/sign-in.md)** - Sign in function
- **[signOut()](./core/sign-out.md)** - Sign out function 
- **[createUser()](./core/create-user.md)** - User creation function

## Configuration

- **[Configuration Options](./config/options.md)** - All available configuration options
- **[Types and Interfaces](./types.md)** - TypeScript types and interfaces
- **[Environment Variables](./config/env-vars.md)** - Required and optional environment variables

## Client-Side Helpers

- **[Authentication Helpers](./client/auth-helpers.md)** - Client-side authentication utilities
- **[Form Actions](./client/form-actions.md)** - SvelteKit form actions
- **[Stores](./client/stores.md)** - Svelte stores for authentication state

## Security

- **[Email Verification](./security/email-verification.md)** - Email verification APIs
- **[Password Reset](./security/password-reset.md)** - Password reset APIs
- **[Two-Factor Authentication](./security/two-factor-auth.md)** - 2FA APIs
- **[Rate Limiting](./security/rate-limiting.md)** - Rate limiting APIs

## Database

- **[Adapters](./database/adapters.md)** - Database adapters
- **[Schema](./database/schema.md)** - Database schema
- **[Custom Adapters](./database/custom-adapters.md)** - Creating custom database adapters

## Email

- **[Email Providers](./email/providers.md)** - Available email providers
- **[Email Templates](./email/templates.md)** - Customizing email templates
- **[Custom Providers](./email/custom-providers.md)** - Creating custom email providers

## Middleware

- **[Authentication Middleware](./middleware/auth-middleware.md)** - Authentication middleware
- **[Rate Limiting Middleware](./middleware/rate-limiting.md)** - Rate limiting middleware
- **[Route Protection](./middleware/route-protection.md)** - Route protection middleware
- **[Security Headers](./middleware/security-headers.md)** - Security headers middleware
```