---
title: "Two-Factor Authentication"
description: "Guide for enabling two-factor authentication in Svelte Guardian."
---

# Two-Factor Authentication

Two-Factor Authentication (2FA) adds an extra layer of security to your authentication system by requiring users to provide two different authentication factors to verify their identity.

## Overview

Svelte Guardian supports Time-Based One-Time Password (TOTP) two-factor authentication, commonly used with authenticator apps like Google Authenticator, Authy, and Microsoft Authenticator.

## Configuration

Configure 2FA in your Svelte Guardian setup:

```typescript
const { handle, signIn, signOut } = await guardianAuth({
  // Other configuration...
  security: {
    twoFactorAuth: {
      method: 'totp',             // Currently only TOTP is supported
      allowBackupCodes: true,     // Enable backup codes for account recovery
      backupCodeCount: 8,         // Number of backup codes to generate
      issuer: 'Your App Name',    // The name shown in authenticator apps
      digits: 6,                  // Number of digits in the OTP (default: 6)
      period: 30,                 // How long each code is valid in seconds (default: 30)
      algorithm: 'sha1'           // Algorithm used (default: sha1)
    }
  }
});
```

## Implementation

### Enabling 2FA for Users

2FA setup typically involves these steps:

1. Generate a secret for the user
2. Display the QR code to the user
3. Verify the user can generate valid codes
4. Save the verified secret to the user's account
5. Generate backup codes (optional)

### Server-Side Implementation

Svelte Guardian provides endpoints for handling 2FA setup and verification:

- `POST:/auth/2fa/generate`: Generates a new TOTP secret
- `POST:/auth/2fa/verify`: Verifies a TOTP code and enables 2FA
- `POST:/auth/2fa/disable`: Disables 2FA for a user
- `POST:/auth/2fa/backup-codes`: Generates backup codes

Here's a server-side example showing how to handle these requests:

```typescript
// src/routes/api/2fa/setup/+server.ts
import { json } from '@sveltejs/kit';
import { twoFactorAuth } from 'svelte-guardian/server';

export async function POST({ locals }) {
  // Get the authenticated user
  const session = await locals.auth();
  
  if (!session?.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Generate a new TOTP secret
  const { secret, qrCodeUrl } = await twoFactorAuth.generateSecret({
    userId: session.user.id,
    email: session.user.email
  });
  
  // Return the secret and QR code URL (the secret will be saved only after verification)
  return json({
    success: true,
    secret,
    qrCodeUrl
  });
}
```

### Client-Side Implementation

Create a 2FA setup flow in your application:

```svelte
<!-- src/routes/settings/two-factor/+page.svelte -->
<script>
  import { twoFactorAuth } from 'svelte-guardian/client';
  
  let step = 'intro';
  let secret = '';
  let qrCodeUrl = '';
  let verificationCode = '';
  let backupCodes = [];
  let error = '';
  
  async function startSetup() {
    try {
      const result = await fetch('/api/2fa/setup', {
        method: 'POST'
      });
      
      const data = await result.json();
      
      if (data.success) {
        secret = data.secret;
        qrCodeUrl = data.qrCodeUrl;
        step = 'scan';
      } else {
        error = data.error || 'Failed to start 2FA setup';
      }
    } catch (err) {
      error = 'An error occurred. Please try again.';
    }
  }
  
  async function verifyAndEnable() {
    try {
      const result = await twoFactorAuth.verify(secret, verificationCode);
      
      if (result.success) {
        backupCodes = result.backupCodes;
        step = 'backup-codes';
      } else {
        error = result.error || 'Invalid verification code';
      }
    } catch (err) {
      error = 'An error occurred. Please try again.';
    }
  }
  
  function downloadBackupCodes() {
    // Logic to download backup codes as a text file
    const text = backupCodes.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
</script>

<div class="two-factor-setup">
  {#if step === 'intro'}
    <h1>Set Up Two-Factor Authentication</h1>
    <p>Two-factor authentication adds an extra layer of security to your account.</p>
    
    <button on:click={startSetup}>Set Up Two-Factor Authentication</button>
  {:else if step === 'scan'}
    <h1>Scan QR Code</h1>
    <p>Scan this QR code with your authenticator app:</p>
    
    <div class="qr-code">
      <img src={qrCodeUrl} alt="QR Code for Two-Factor Authentication" />
    </div>
    
    <p>If you can't scan the QR code, enter this code manually:</p>
    <div class="manual-code">{secret}</div>
    
    <p>Now enter the verification code from your authenticator app:</p>
    
    {#if error}
      <div class="error">{error}</div>
    {/if}
    
    <form on:submit|preventDefault={verifyAndEnable}>
      <input 
        type="text" 
        bind:value={verificationCode} 
        placeholder="Enter 6-digit code" 
        pattern="[0-9]{6}" 
        required 
      />
      <button type="submit">Verify and Enable</button>
    </form>
  {:else if step === 'backup-codes'}
    <h1>Backup Codes</h1>
    <p>
      <strong>Important:</strong> Save these backup codes in a secure place. They can be used to
      regain access to your account if you lose your authenticator device.
    </p>
    
    <div class="backup-codes">
      {#each backupCodes as code}
        <div class="backup-code">{code}</div>
      {/each}
    </div>
    
    <div class="actions">
      <button on:click={downloadBackupCodes}>Download Backup Codes</button>
      <a href="/settings">Done</a>
    </div>
  {/if}
</div>

<style>
  .two-factor-setup {
    max-width: 500px;
    margin: 0 auto;
  }
  
  .qr-code {
    margin: 20px 0;
    text-align: center;
  }
  
  .qr-code img {
    max-width: 200px;
  }
  
  .manual-code {
    font-family: monospace;
    background: #f5f5f5;
    padding: 10px;
    border-radius: 4px;
    word-break: break-all;
    text-align: center;
    margin: 15px 0;
  }
  
  .backup-codes {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin: 20px 0;
  }
  
  .backup-code {
    font-family: monospace;
    background: #f5f5f5;
    padding: 10px;
    border-radius: 4px;
    text-align: center;
  }
  
  .error {
    color: #e53e3e;
    margin: 10px 0;
  }
  
  .actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }
</style>
```

## Login with 2FA

When 2FA is enabled for a user, they'll need to complete a two-step login process:

1. Enter their credentials (email/password or OAuth)
2. Enter the time-based code from their authenticator app

### Handling 2FA During Login

Svelte Guardian automatically handles the 2FA challenge during login. When a user with 2FA enabled attempts to log in, the `signIn` function will return a result indicating that a 2FA code is required:

```typescript
const result = await signIn('credentials', {
  email,
  password,
  redirect: false
});

if (result.twoFactorRequired) {
  // Redirect to 2FA verification page
  goto('/verify-2fa');
} else if (result.success) {
  // Redirect to dashboard
  goto('/dashboard');
} else {
  // Handle error
  error = result.error;
}
```

### 2FA Verification Page

Create a page for 2FA code verification:

```svelte
<!-- src/routes/verify-2fa/+page.svelte -->
<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { twoFactorAuth } from 'svelte-guardian/client';
  
  let code = '';
  let error = '';
  let loading = false;
  
  async function handleVerify() {
    loading = true;
    error = '';
    
    try {
      const result = await twoFactorAuth.verifyLogin(code);
      
      if (result.success) {
        // Redirect to the intended destination or dashboard
        const callbackUrl = $page.url.searchParams.get('callbackUrl') || '/dashboard';
        goto(callbackUrl);
      } else {
        error = result.error || 'Invalid verification code';
      }
    } catch (err) {
      error = 'An error occurred. Please try again.';
    } finally {
      loading = false;
    }
  }
  
  function handleUseBackupCode() {
    goto('/verify-2fa/backup');
  }
</script>

<div class="verify-2fa">
  <h1>Two-Factor Authentication</h1>
  <p>Enter the verification code from your authenticator app.</p>
  
  {#if error}
    <div class="error">{error}</div>
  {/if}
  
  <form on:submit|preventDefault={handleVerify}>
    <div>
      <input
        type="text"
        bind:value={code}
        placeholder="Enter 6-digit code"
        pattern="[0-9]{6}"
        required
        autocomplete="one-time-code"
      />
    </div>
    
    <button type="submit" disabled={loading}>
      {loading ? 'Verifying...' : 'Verify'}
    </button>
  </form>
  
  <div class="backup-link">
    <button class="text-button" on:click={handleUseBackupCode}>
      Use a backup code instead
    </button>
  </div>
</div>
```

## Using Backup Codes

If a user loses access to their authenticator device, they can use one of their backup codes to log in:

```svelte
<!-- src/routes/verify-2fa/backup/+page.svelte -->
<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { twoFactorAuth } from 'svelte-guardian/client';
  
  let backupCode = '';
  let error = '';
  let loading = false;
  
  async function handleVerify() {
    loading = true;
    error = '';
    
    try {
      const result = await twoFactorAuth.verifyBackupCode(backupCode);
      
      if (result.success) {
        // Redirect to the intended destination or dashboard
        const callbackUrl = $page.url.searchParams.get('callbackUrl') || '/dashboard';
        goto(callbackUrl);
      } else {
        error = result.error || 'Invalid backup code';
      }
    } catch (err) {
      error = 'An error occurred. Please try again.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="backup-verification">
  <h1>Use Backup Code</h1>
  <p>Enter one of your backup codes to sign in.</p>
  
  {#if error}
    <div class="error">{error}</div>
  {/if}
  
  <form on:submit|preventDefault={handleVerify}>
    <div>
      <input
        type="text"
        bind:value={backupCode}
        placeholder="Enter backup code"
        required
      />
    </div>
    
    <button type="submit" disabled={loading}>
      {loading ? 'Verifying...' : 'Verify'}
    </button>
  </form>
  
  <div class="note">
    <p>
      <strong>Note:</strong> Each backup code can only be used once. After using a backup code,
      you should disable 2FA and set it up again if you still don't have access to your authenticator app.
    </p>
  </div>
</div>
```

## Disabling 2FA

Allow users to disable 2FA if needed:

```typescript
// src/routes/api/2fa/disable/+server.ts
import { json } from '@sveltejs/kit';
import { twoFactorAuth } from 'svelte-guardian/server';

export async function POST({ locals, request }) {
  const session = await locals.auth();
  
  if (!session?.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const data = await request.json();
  const { password } = data;
  
  // Require password re-entry for security
  try {
    const result = await twoFactorAuth.disable({
      userId: session.user.id,
      password
    });
    
    if (result.success) {
      return json({ success: true });
    } else {
      return json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    return json({ error: 'Failed to disable 2FA' }, { status: 500 });
  }
}
```

## Security Considerations

1. **Account Recovery**: Always provide backup codes or an alternative recovery method.

2. **Password Confirmation**: Require password confirmation when enabling or disabling 2FA.

3. **Session Management**: Invalidate other sessions when 2FA is enabled or disabled.

4. **Remember Devices** (optional): Consider allowing users to trust devices to reduce 2FA prompts.

5. **Rate Limiting**: Apply strict rate limits to 2FA verification endpoints.

## Best Practices

1. **Clear Instructions**: Provide clear guidance for users setting up 2FA.

2. **QR Code and Manual Entry**: Support both QR code scanning and manual secret entry.

3. **Testing**: Verify code generation before finalizing setup.

4. **Backup Codes**: Generate and require users to save backup codes.

5. **Application Name**: Set a clear issuer name for the authenticator app.