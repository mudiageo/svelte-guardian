# 🔐 Svelte Guardian

Batteries included  authentication for SvelteKit applications.

## 🚀 Features
- Secure credentuals authentication
- Multiple authentication providers
- Robust security measures
- Flexible configuration
- Comprehensive logging
- Two-factor authentication support

## 📦 Installation

```bash
npm install svelte-guardian
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

## 🤝 Contributing
[Contribution guidelines]

## 📃 License
MIT
