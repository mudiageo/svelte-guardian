# 🔐 SvelteForge Auth
Patr
Powerful, flexible authentication for SvelteKit applications.

## 🚀 Features
- Multiple authentication providers
- Robust security measures
- Flexible configuration
- Comprehensive logging
- Two-factor authentication support

## 📦 Installation

```bash
npm install svelte-forge-auth
```

## 🔧 Basic Usage

```typescript
import { forgeAuth } from 'svelte-forge-auth';

export const { GET, POST } = forgeAuth({
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
[Full documentation available here]

## 🤝 Contributing
[Contribution guidelines]

## 📃 License
MIT
