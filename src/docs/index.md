---
title: "Svelte Guardian Documentation"
description: "Official documentation for Svelte Guardian, a comprehensive authentication and authorization library for SvelteKit applications."
---

# Svelte Guardian Documentation

Welcome to the official documentation for Svelte Guardian, a comprehensive authentication and authorization library for SvelteKit applications.

## About Svelte Guardian

Svelte Guardian provides a robust, easy-to-use authentication system for your SvelteKit applications with features like:

- Multiple authentication strategies (credentials, OAuth providers)
- Email verification
- Password reset functionality
- Two-factor authentication
- Rate limiting and brute force protection
- Role-based route protection
- Customizable security policies

## Documentation Sections

- [Getting Started](/getting-started/index.md): Quick setup guides to get Svelte Guardian working in your project
- [Guides](/guides/index.md): In-depth guides for implementing specific features
- [API Reference](/api-reference/index.md): Detailed API documentation for developers
- [Security](/security/index.md): Security features and best practices
- [Features](/features/index.md): Overview of all available features

## Installation

```bash
# Using npm
npm install svelte-guardian

# Using pnpm
pnpm add svelte-guardian

# Using yarn
yarn add svelte-guardian
```

## Quick Start

```typescript
// src/hooks.server.ts
import { guardianAuth } from 'svelte-guardian';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const adapter = PrismaAdapter(prisma);

export const { handle, signIn, signOut } = await guardianAuth({
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
    emailVerification: {
      method: 'otp'
    }
  }
});
```

## Support

If you encounter any issues or have questions, please file an issue on our [GitHub repository](https://github.com/yourusername/svelte-guardian).

## License

Svelte Guardian is licensed under the MIT License.