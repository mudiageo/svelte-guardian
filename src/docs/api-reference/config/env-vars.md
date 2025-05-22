---
title: "Environment Variables"
description: "Environment variables used by Svelte Guardian."
---

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

- [Configuration Options](/api-reference/config/options.md)
- [guardianAuth()](/api-reference/core/guardian-auth.md)
