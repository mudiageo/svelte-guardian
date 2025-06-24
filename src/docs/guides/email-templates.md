---
title: "Email Templates"
description: "Customizing email templates in Svelte Guardian."
---

# Custom Email Templates

Svelte Guardian sends various emails for authentication flows such as email verification, password reset, and two-factor authentication. This guide shows you how to customize these email templates to match your application's branding and requirements.

## Default Email Templates

By default, Svelte Guardian provides simple but functional email templates for:

- Email verification
- Password reset
- Two-factor authentication codes
- Welcome emails
- Security notifications

These templates include your application's name, necessary links or codes, and brief instructions.

## Customization Options

There are several ways to customize email templates in Svelte Guardian:

1. **Basic Configuration**: Simple text and branding changes
2. **Custom HTML Templates**: Complete control over email design
3. **Dynamic Templates**: Templates with custom variables and logic
4. **Template Providers**: Integration with email services like SendGrid, Mailjet, etc.

## Basic Configuration

For simple customization, you can modify text and branding in your Svelte Guardian configuration:

```typescript
// src/hooks.server.ts
const { handle } = await guardianAuth({
  // Other config...
  security: {
    emailProvider: {
      // Email provider config...
      branding: {
        appName: 'Your App Name',
        appUrl: 'https://yourdomain.com',
        logo: 'https://yourdomain.com/logo.png',
        primaryColor: '#4F46E5',
        footerText: '© 2025 Your Company. All rights reserved.'
      }
    }
  }
});
```

This will customize the default templates with your branding elements.

## Custom HTML Templates

For more control, provide your own HTML templates:

```typescript
const { handle } = await guardianAuth({
  security: {
    emailProvider: {
      // Other email config...
      templates: {
        verificationEmail: {
          subject: 'Verify your email for {{appName}}',
          htmlTemplate: './src/emails/verification.html',
          textTemplate: './src/emails/verification.txt'
        },
        passwordReset: {
          subject: 'Reset your password for {{appName}}',
          htmlTemplate: './src/emails/password-reset.html',
          textTemplate: './src/emails/password-reset.txt'
        },
        twoFactorCode: {
          subject: 'Your two-factor authentication code',
          htmlTemplate: './src/emails/two-factor.html',
          textTemplate: './src/emails/two-factor.txt'
        },
        welcome: {
          subject: 'Welcome to {{appName}}!',
          htmlTemplate: './src/emails/welcome.html',
          textTemplate: './src/emails/welcome.txt'
        }
      }
    }
  }
});
```

HTML templates can use variables with the `{{variable}}` syntax.

### Example HTML Template

Here's an example verification email template (`./src/emails/verification.html`):

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your email</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 20px 0;
    }
    .logo {
      max-height: 60px;
    }
    .code {
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      padding: 20px;
      margin: 20px 0;
      background-color: #f5f5f5;
      border-radius: 4px;
      letter-spacing: 2px;
    }
    .button {
      display: block;
      width: 200px;
      margin: 30px auto;
      padding: 12px 20px;
      background-color: {{primaryColor}};
      color: #ffffff;
      text-align: center;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #666;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="{{logo}}" alt="{{appName}} Logo" class="logo">
  </div>
  
  <h1>Verify your email address</h1>
  
  <p>Hello {{name}},</p>
  
  <p>Thank you for signing up for {{appName}}. To complete your registration, please verify your email address.</p>
  
  {{#if otpMethod}}
    <p>Your verification code is:</p>
    <div class="code">{{otp}}</div>
    <p>Enter this code on the verification page to confirm your email address.</p>
  {{else}}
    <p>Click the button below to verify your email address:</p>
    <a href="{{verificationUrl}}" class="button">Verify Email</a>
    <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
    <p>{{verificationUrl}}</p>
  {{/if}}
  
  <p>This {{#if otpMethod}}code{{else}}link{{/if}} will expire in {{expirationMinutes}} minutes.</p>
  
  <p>If you didn't create an account with us, you can safely ignore this email.</p>
  
  <div class="footer">
    <p>{{footerText}}</p>
    <p>{{appName}} - <a href="{{appUrl}}">{{appUrl}}</a></p>
  </div>
</body>
</html>
```

### Available Template Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{{appName}}` | Your application name | "Svelte Guardian" |
| `{{appUrl}}` | Your application URL | "https://example.com" |
| `{{logo}}` | URL to your logo | "https://example.com/logo.png" |
| `{{primaryColor}}` | Your brand color | "#4F46E5" |
| `{{name}}` | User's name | "John Doe" |
| `{{email}}` | User's email | "john@example.com" |
| `{{otp}}` | Verification/reset code | "123456" |
| `{{verificationUrl}}` | Full verification URL | "https://example.com/verify?token=abc123" |
| `{{resetUrl}}` | Full password reset URL | "https://example.com/reset?token=abc123" |
| `{{expirationMinutes}}` | Expiration time in minutes | "15" |
| `{{footerText}}` | Custom footer text | "© 2025 Your Company" |

## Dynamic Templates with Template Functions

For more complex templates with logic, provide template functions instead of static files:

```typescript
const { handle } = await guardianAuth({
  security: {
    emailProvider: {
      templates: {
        verificationEmail: {
          subject: (data) => `Verify your ${data.appName} account`,
          html: (data) => {
            const { user, otp, url, appName, expiryMinutes } = data;
            
            // Generate HTML with conditional logic
            return `
              <h1>Welcome to ${appName}, ${user.name || 'there'}!</h1>
              <p>Your verification code is: <strong>${otp}</strong></p>
              <!-- Additional custom HTML -->
            `;
          },
          text: (data) => {
            // Plain text version
            return `Verify your ${data.appName} account\n\nYour code: ${data.otp}`;
          }
        }
      }
    }
  }
});
```

## Using Template Providers

For advanced email needs, you can integrate with template providers like SendGrid, Mailjet, or Mailchimp:

```typescript
import { sendgridTemplateProvider } from 'svelte-guardian/email';

const { handle } = await guardianAuth({
  security: {
    emailProvider: {
      type: 'sendgrid',
      apiKey: process.env.SENDGRID_API_KEY,
      templateProvider: sendgridTemplateProvider({
        templates: {
          verificationEmail: 'd-abc123456789',
          passwordReset: 'd-def123456789',
          twoFactorCode: 'd-ghi123456789',
          welcome: 'd-jkl123456789'
        },
        defaultSender: {
          email: 'no-reply@yourdomain.com',
          name: 'Your App Name'
        }
      })
    }
  }
});
```

## Testing Email Templates

To test your email templates during development:

1. Enable console logging for emails:

```typescript
const { handle } = await guardianAuth({
  security: {
    emailProvider: {
      // Regular email config...
      debug: process.env.NODE_ENV !== 'production' // Log emails to console in development
    }
  }
});
```

2. Or use a development email service like Mailhog or Ethereal:

```typescript
const { handle } = await guardianAuth({
  security: {
    emailProvider: process.env.NODE_ENV === 'production'
      ? productionEmailProvider
      : {
          type: 'nodemailer',
          host: 'localhost',
          port: 1025, // Mailhog
          secure: false,
          auth: { user: '', pass: '' }
        }
  }
});
```

## Localization

For multi-language support, use template functions with translations:

```typescript
import i18n from '$lib/i18n'; // Your translation system

const { handle } = await guardianAuth({
  security: {
    emailProvider: {
      templates: {
        verificationEmail: {
          subject: (data) => {
            const locale = data.user.locale || 'en';
            return i18n.t('email.verification.subject', { appName: data.appName }, locale);
          },
          html: (data) => {
            const locale = data.user.locale || 'en';
            return renderTemplate('verification-email', { ...data, t: (key) => i18n.t(key, {}, locale) });
          }
        }
      }
    }
  }
});
```

## Best Practices for Email Templates

1. **Always include plain text versions** for better deliverability and accessibility
2. **Keep your design responsive** for mobile devices
3. **Test across email clients** (Gmail, Outlook, Apple Mail, etc.)
4. **Use inline CSS** as many email clients strip `<style>` tags
5. **Keep emails simple** and focused on a single call to action
6. **Include your company's physical address** to comply with anti-spam laws
7. **Provide clear unsubscribe options** for marketing emails

## Next Steps

- [Email Configuration Guide](../security/email-configuration.md)
- [Email Verification and Password Reset](./email-verification-password-reset.md)
- [Custom Email Providers](../api-reference/email/custom-providers.md)
