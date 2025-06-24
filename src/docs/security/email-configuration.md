---
title: "Email Configuration"
description: "How to configure email providers for Svelte Guardian."
---

```typescript
// Example configurations
export const exampleConfigs = {
    gmailPassword: {
        type: 'nodemailer',
        service: 'gmail',
        auth: {
            method: 'password',
            user: 'your-email@gmail.com',
            pass: 'your-password'
        }
    } as NodemailerServiceConfig,

    gmailAppPassword: {
        type: 'nodemailer',
        service: 'gmail',
        auth: {
            method: ’app-password',
            user: 'your-email@gmail.com',
            appPass: 'your-app-password'
        },
        from: 'Your Name <your-email@gmail.com>'
    } as NodemailerServiceConfig,

    gmailOAuth2: {
        type: 'nodemailer',
        service: 'gmail',
        auth: {
            method: 'oauth2',
            user: 'your-email@gmail.com',
            clientId: 'your-client-id',
            clientSecret: 'your-client-secret',
            refreshToken: 'your-refresh-token',
            accessToken: 'optional-access-token',
            expires: Date.now() // Optional expiration timestamp
        },
        options: {
            pool: true,
            maxConnections: 5
        }
    } as NodemailerServiceConfig
};


```
