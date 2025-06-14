---
title: "Email Verification and Password Reset"
description: "Guide for email verification and password reset in Svelte Guardian."
date: "2025-05-22"
---

# Email Verification and Password Reset

Svelte Guardian provides built-in support for email verification and password reset functionality to enhance the security of your application.

## Email Verification

Email verification ensures that users register with valid email addresses that they own. This prevents spam accounts and provides an additional layer of security.

### Configuration

Configure email verification in your Svelte Guardian configuration:

```typescript
security: {
  emailVerification: {
    method: 'otp',          // 'otp' or 'link'
    otpLength: 6,           // Length of OTP code (if using 'otp' method)
    otpExpiration: 15,      // OTP validity in minutes
    tokenExpiration: 60,    // Link token validity in minutes (if using 'link' method)
    sendEmailOnRegistration: true // Automatically send verification email on registration
  },
  emailProvider: {
    // Email provider configuration
    // ...
  }
}
```

### Verification Methods

Svelte Guardian supports two verification methods:

1. **One-Time Password (OTP)**
   - A numeric code is sent to the user's email
   - User enters the code on your verification page
   - Simpler user experience for mobile users

2. **Verification Link**
   - A unique URL with a token is sent to the user's email
   - User clicks the link to verify their email
   - More familiar experience for many users

### Implementation

#### Server-Side Setup

The email verification endpoints are automatically set up by Svelte Guardian:

- `POST:/auth/verify-email/send-otp`: Sends a verification code or link
- `POST:/auth/verify-email/verify-otp`: Verifies the OTP or token

#### Client-Side Implementation

Create a verification page that allows users to request and submit verification codes:

```svelte
<!-- src/routes/verify-email/+page.svelte -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { emailVerification } from 'svelte-guardian/client';
  
  export let data;
  let email = data?.session?.email || '';
  let otp = '';
  let loading = false;
  let error = '';
  let verificationSent = data?.verificationSent || false;

  async function handleSendOTP() {
    loading = true;
    error = '';

    const result = await emailVerification.handleEmailVerification(email, 'otp');

    if (result.success) {
      verificationSent = true;
    } else {
      error = result.error || 'Failed to send verification code';
    }

    loading = false;
  }

  async function handleVerifyOTP() {
    loading = true;
    error = '';

    const result = await emailVerification.verifyOTP(email, otp);
    
    if (result.success) {
      // Redirect to success page or dashboard
      goto('/dashboard');
    } else {
      error = result.error || 'Invalid verification code';
    }

    loading = false;
  }
</script>

<div>
  {#if !verificationSent}
    <h1>Verify Your Email</h1>
    <p>We need to verify your email address.</p>
    
    <form on:submit|preventDefault={handleSendOTP}>
      <input type="email" bind:value={email} required />
      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send Verification Code'}
      </button>
    </form>
  {:else}
    <h1>Enter Verification Code</h1>
    <p>We've sent a verification code to {email}.</p>
    
    {#if error}
      <div class="error">{error}</div>
    {/if}
    
    <form on:submit|preventDefault={handleVerifyOTP}>
      <input type="text" bind:value={otp} placeholder="Enter code" required />
      <button type="submit" disabled={loading}>
        {loading ? 'Verifying...' : 'Verify Email'}
      </button>
    </form>
  {/if}
</div>
```

## Password Reset

Password reset functionality allows users to regain access to their accounts when they forget their passwords.

### Configuration

Configure password reset in your Svelte Guardian configuration:

```typescript
security: {
  passwordReset: {
    tokenExpiration: 15, // Token validity in minutes
    tokenLength: 64,     // Length of reset token
    // Additional password reset options
  },
  emailProvider: {
    // Email provider configuration
    // ...
  }
}
```

### How It Works

1. User requests a password reset by providing their email
2. A unique reset token is generated and stored
3. A reset link containing the token is sent to the user's email
4. User clicks the link and is directed to your reset password page
5. User enters a new password
6. The system verifies the token and updates the password

### Implementation

#### Server-Side Setup

The password reset endpoints are automatically set up by Svelte Guardian:

- `POST:/auth/reset-password/initiate-reset`: Initiates the password reset process
- `POST:/auth/reset-password/reset`: Handles the actual password reset

#### Client-Side Implementation

Create a reset password page:

```svelte
<!-- src/routes/reset-password/+page.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { passwordReset } from 'svelte-guardian/client';

  let email = $page.url.searchParams.get('email') || '';
  let password = '';
  let confirmPassword = '';
  let loading = false;
  let error = '';
  let success = false;

  // Get token from URL if present
  const token = $page.url.searchParams.get('token');

  async function handlePasswordReset() {
    loading = true;
    error = '';

    if (token && email) {
      // Reset password with token
      const result = await passwordReset.resetPassword(email, token, password, confirmPassword);
      
      if (result.success) {
        success = true;
        setTimeout(() => goto('/signin?reset=success'), 3000);
      } else {
        error = result.error || 'Failed to reset password';
      }
    } else {
      // Request password reset
      const result = await passwordReset.handlePasswordReset(email);

      if (result.success) {
        success = true;
      } else {
        error = result.error || 'Failed to send reset email';
      }
    }

    loading = false;
  }
</script>

<div>
  {#if success && !token}
    <h1>Check Your Email</h1>
    <p>We've sent password reset instructions to {email}.</p>
  {:else if success && token}
    <h1>Password Reset Complete</h1>
    <p>Your password has been successfully reset. Redirecting to login...</p>
  {:else if token}
    <h1>Reset Your Password</h1>
    
    {#if error}
      <div class="error">{error}</div>
    {/if}
    
    <form on:submit|preventDefault={handlePasswordReset}>
      <div>
        <label for="email">Email</label>
        <input type="email" id="email" bind:value={email} required readonly />
      </div>
      
      <div>
        <label for="password">New Password</label>
        <input type="password" id="password" bind:value={password} required />
      </div>
      
      <div>
        <label for="confirmPassword">Confirm Password</label>
        <input 
          type="password" 
          id="confirmPassword" 
          bind:value={confirmPassword} 
          required
        />
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>
    </form>
  {:else}
    <h1>Reset Your Password</h1>
    <p>Enter your email address and we'll send you instructions to reset your password.</p>
    
    {#if error}
      <div class="error">{error}</div>
    {/if}
    
    <form on:submit|preventDefault={handlePasswordReset}>
      <div>
        <label for="email">Email</label>
        <input type="email" id="email" bind:value={email} required />
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send Reset Instructions'}
      </button>
    </form>
  {/if}
</div>
```

## Customizing Email Templates

You can customize the email templates for verification and password reset emails:

```typescript
emailProvider: {
  // Email provider configuration
  templates: {
    verification: {
      subject: 'Verify your email address',
      textTemplate: 'Your verification code is: {{otp}}',
      htmlTemplate: '<p>Your verification code is: <strong>{{otp}}</strong></p>'
    },
    passwordReset: {
      subject: 'Reset your password',
      textTemplate: 'Click this link to reset your password: {{url}}',
      htmlTemplate: '<p>Click <a href="{{url}}">here</a> to reset your password.</p>'
    }
  }
}
```

## Security Considerations

1. **Token Expiration**: Set appropriate expiration times for verification and reset tokens. Shorter times are more secure, but might inconvenience users.

2. **Rate Limiting**: Apply strict rate limits to verification and password reset endpoints to prevent abuse.

3. **Email Sending Failures**: Implement proper error handling for situations where emails cannot be sent.

4. **Token Storage**: Verification tokens are securely hashed before being stored in the database.

5. **Password Requirements**: Enforce strong password requirements when users set new passwords during reset.

## Testing

For development and testing purposes, you might want to log emails instead of sending them:

```typescript
emailProvider: {
  type: 'log',  // Log emails to console instead of sending them
  from: 'noreply@example.com'
}
```

This allows you to get verification codes and reset links without setting up an actual email service.