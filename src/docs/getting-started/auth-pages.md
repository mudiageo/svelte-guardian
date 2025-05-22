---
title: "Authentication Pages"
description: "Creating authentication pages for your Svelte Guardian integration."
---

# Creating Authentication Pages

This guide will walk you through creating the necessary authentication pages for your SvelteKit application using Svelte Guardian, including sign-in, sign-up, password reset, and email verification.

## Sign-In Page

Create a basic sign-in page at `src/routes/signin/+page.svelte`:

```svelte
<script lang="ts">
  import { signIn } from 'svelte-guardian/client';
  import { enhance } from '$app/forms';
  
  let email = '';
  let password = '';
  let error = '';
  let loading = false;
  
  async function handleSubmit() {
    loading = true;
    error = '';
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/dashboard'
      });
      
      if (result?.error) {
        error = result.error;
      }
    } catch (err: any) {
      error = err.message || 'An error occurred during sign in';
    } finally {
      loading = false;
    }
  }
</script>

<div class="auth-container">
  <h1>Sign In</h1>
  
  {#if error}
    <div class="error">{error}</div>
  {/if}
  
  <form on:submit|preventDefault={handleSubmit}>
    <div class="form-group">
      <label for="email">Email</label>
      <input 
        type="email" 
        id="email" 
        bind:value={email} 
        required 
        autocomplete="email"
      />
    </div>
    
    <div class="form-group">
      <label for="password">Password</label>
      <input 
        type="password" 
        id="password" 
        bind:value={password} 
        required 
        autocomplete="current-password"
      />
    </div>
    
    <div class="form-actions">
      <a href="/reset-password">Forgot password?</a>
      <button type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </div>
  </form>
  
  <div class="social-auth">
    <h2>Or sign in with</h2>
    <div class="social-buttons">
      <button on:click={() => signIn('google')}>Google</button>
      <button on:click={() => signIn('github')}>GitHub</button>
    </div>
  </div>
  
  <p class="auth-link">
    Don't have an account? <a href="/signup">Sign up</a>
  </p>
</div>

<style>
  .auth-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
  }
  
  input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  .form-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
  }
  
  .error {
    background-color: #ffebee;
    color: #c62828;
    padding: 0.5rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }
  
  .social-auth {
    margin-top: 2rem;
    text-align: center;
  }
  
  .social-buttons {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .auth-link {
    text-align: center;
    margin-top: 1.5rem;
  }
</style>
```

## Sign-Up Page

Create a sign-up page at `src/routes/signup/+page.svelte`:

```svelte
<script lang="ts">
  import { signIn } from 'svelte-guardian/client';
  import { enhance } from '$app/forms';
  
  let name = '';
  let email = '';
  let password = '';
  let confirmPassword = '';
  let error = '';
  let loading = false;
  
  async function handleSubmit() {
    loading = true;
    error = '';
    
    if (password !== confirmPassword) {
      error = 'Passwords do not match';
      loading = false;
      return;
    }
    
    try {
      const result = await signIn('credentials', {
        name,
        email,
        password,
        isRegistration: true,
        redirect: false,
        callbackUrl: '/dashboard'
      });
      
      if (result?.error) {
        error = result.error;
      }
    } catch (err: any) {
      error = err.message || 'An error occurred during sign up';
    } finally {
      loading = false;
    }
  }
</script>

<div class="auth-container">
  <h1>Create an Account</h1>
  
  {#if error}
    <div class="error">{error}</div>
  {/if}
  
  <form on:submit|preventDefault={handleSubmit}>
    <div class="form-group">
      <label for="name">Full Name</label>
      <input 
        type="text" 
        id="name" 
        bind:value={name} 
        required 
        autocomplete="name"
      />
    </div>
    
    <div class="form-group">
      <label for="email">Email</label>
      <input 
        type="email" 
        id="email" 
        bind:value={email} 
        required 
        autocomplete="email"
      />
    </div>
    
    <div class="form-group">
      <label for="password">Password</label>
      <input 
        type="password" 
        id="password" 
        bind:value={password} 
        required 
        autocomplete="new-password"
      />
      <small>Password must be at least 8 characters long</small>
    </div>
    
    <div class="form-group">
      <label for="confirmPassword">Confirm Password</label>
      <input 
        type="password" 
        id="confirmPassword" 
        bind:value={confirmPassword} 
        required 
        autocomplete="new-password"
      />
    </div>
    
    <div class="form-actions">
      <button type="submit" disabled={loading}>
        {loading ? 'Creating account...' : 'Sign Up'}
      </button>
    </div>
  </form>
  
  <div class="social-auth">
    <h2>Or sign up with</h2>
    <div class="social-buttons">
      <button on:click={() => signIn('google')}>Google</button>
      <button on:click={() => signIn('github')}>GitHub</button>
    </div>
  </div>
  
  <p class="auth-link">
    Already have an account? <a href="/signin">Sign in</a>
  </p>
</div>

<style>
  /* Same styling as sign-in page */
  .auth-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
  }
  
  input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  small {
    display: block;
    color: #666;
    margin-top: 0.25rem;
  }
  
  .form-actions {
    margin-top: 1rem;
  }
  
  .error {
    background-color: #ffebee;
    color: #c62828;
    padding: 0.5rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }
  
  .social-auth {
    margin-top: 2rem;
    text-align: center;
  }
  
  .social-buttons {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .auth-link {
    text-align: center;
    margin-top: 1.5rem;
  }
</style>
```

## Password Reset Page

Create a password reset page at `src/routes/reset-password/+page.svelte`:

```svelte
<script lang="ts">
  import { requestPasswordReset } from 'svelte-guardian/client';
  import { page } from '$app/stores';
  
  let email = '';
  let token = $page.url.searchParams.get('token') || '';
  let newPassword = '';
  let confirmPassword = '';
  let success = false;
  let error = '';
  let loading = false;
  let step = token ? 'reset' : 'request';
  
  async function handleRequestReset() {
    loading = true;
    error = '';
    
    try {
      await requestPasswordReset(email);
      success = true;
    } catch (err: any) {
      error = err.message || 'Failed to send password reset email';
    } finally {
      loading = false;
    }
  }
  
  async function handleResetPassword() {
    loading = true;
    error = '';
    
    if (newPassword !== confirmPassword) {
      error = 'Passwords do not match';
      loading = false;
      return;
    }
    
    try {
      await completePasswordReset(token, newPassword);
      success = true;
    } catch (err: any) {
      error = err.message || 'Failed to reset password';
    } finally {
      loading = false;
    }
  }
</script>

<div class="auth-container">
  {#if step === 'request'}
    <h1>Reset Your Password</h1>
    
    {#if success}
      <div class="success">
        Password reset email sent. Please check your inbox.
      </div>
    {:else}
      {#if error}
        <div class="error">{error}</div>
      {/if}
      
      <p>Enter your email address to receive a password reset link.</p>
      
      <form on:submit|preventDefault={handleRequestReset}>
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            bind:value={email} 
            required 
            autocomplete="email"
          />
        </div>
        
        <div class="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </div>
      </form>
    {/if}
  {:else if step === 'reset'}
    <h1>Create New Password</h1>
    
    {#if success}
      <div class="success">
        Password reset successful. You can now <a href="/signin">sign in</a> with your new password.
      </div>
    {:else}
      {#if error}
        <div class="error">{error}</div>
      {/if}
      
      <form on:submit|preventDefault={handleResetPassword}>
        <div class="form-group">
          <label for="newPassword">New Password</label>
          <input 
            type="password" 
            id="newPassword" 
            bind:value={newPassword} 
            required 
            autocomplete="new-password"
          />
          <small>Password must be at least 8 characters long</small>
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input 
            type="password" 
            id="confirmPassword" 
            bind:value={confirmPassword} 
            required 
            autocomplete="new-password"
          />
        </div>
        
        <div class="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </div>
      </form>
    {/if}
  {/if}
  
  <p class="auth-link">
    <a href="/signin">Back to Sign In</a>
  </p>
</div>

<style>
  /* Similar styling as other auth pages */
  .auth-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
  }
  
  input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  .form-actions {
    margin-top: 1rem;
  }
  
  .error {
    background-color: #ffebee;
    color: #c62828;
    padding: 0.5rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }
  
  .success {
    background-color: #e8f5e9;
    color: #2e7d32;
    padding: 0.5rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }
  
  .auth-link {
    text-align: center;
    margin-top: 1.5rem;
  }
</style>
```

## Email Verification Page

Create an email verification page at `src/routes/verify-email/+page.svelte`:

```svelte
<script lang="ts">
  import { verifyEmail, resendVerificationEmail } from 'svelte-guardian/client';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  
  let token = $page.url.searchParams.get('token') || '';
  let email = $page.url.searchParams.get('email') || '';
  let otp = '';
  let success = false;
  let error = '';
  let loading = false;
  let resendLoading = false;
  let resendSuccess = false;
  let verificationMethod = token ? 'link' : 'otp';
  
  onMount(async () => {
    if (token) {
      await handleVerifyWithLink();
    }
  });
  
  async function handleVerifyWithLink() {
    loading = true;
    error = '';
    
    try {
      await verifyEmail({ token });
      success = true;
    } catch (err: any) {
      error = err.message || 'Failed to verify email';
    } finally {
      loading = false;
    }
  }
  
  async function handleVerifyWithOTP() {
    loading = true;
    error = '';
    
    try {
      await verifyEmail({ email, otp });
      success = true;
    } catch (err: any) {
      error = err.message || 'Failed to verify email';
    } finally {
      loading = false;
    }
  }
  
  async function handleResendEmail() {
    resendLoading = true;
    error = '';
    
    try {
      await resendVerificationEmail(email);
      resendSuccess = true;
    } catch (err: any) {
      error = err.message || 'Failed to resend verification email';
    } finally {
      resendLoading = false;
    }
  }
</script>

<div class="auth-container">
  <h1>Email Verification</h1>
  
  {#if success}
    <div class="success">
      Your email has been successfully verified. You can now <a href="/signin">sign in</a> to your account.
    </div>
  {:else}
    {#if error}
      <div class="error">{error}</div>
    {/if}
    
    {#if verificationMethod === 'link'}
      {#if loading}
        <div class="loading">Verifying your email...</div>
      {:else}
        <p>Invalid or expired verification link. Please request a new one.</p>
        
        <form on:submit|preventDefault={handleResendEmail}>
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              bind:value={email} 
              required 
              autocomplete="email"
            />
          </div>
          
          <div class="form-actions">
            <button type="submit" disabled={resendLoading}>
              {resendLoading ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </div>
        </form>
        
        {#if resendSuccess}
          <div class="success">
            Verification email has been sent. Please check your inbox.
          </div>
        {/if}
      {/if}
    {:else}
      <p>Please enter the verification code that was sent to your email.</p>
      
      <form on:submit|preventDefault={handleVerifyWithOTP}>
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            bind:value={email} 
            required 
            autocomplete="email"
          />
        </div>
        
        <div class="form-group">
          <label for="otp">Verification Code</label>
          <input 
            type="text" 
            id="otp" 
            bind:value={otp} 
            required 
            pattern="[0-9]*"
            inputmode="numeric"
            autocomplete="one-time-code"
          />
        </div>
        
        <div class="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </div>
      </form>
      
      <div class="resend-link">
        Didn't receive the code?
        <button on:click={handleResendEmail} disabled={resendLoading}>
          {resendLoading ? 'Sending...' : 'Resend'}
        </button>
      </div>
      
      {#if resendSuccess}
        <div class="success">
          Verification code has been sent. Please check your inbox.
        </div>
      {/if}
    {/if}
  {/if}
  
  <p class="auth-link">
    <a href="/signin">Back to Sign In</a>
  </p>
</div>

<style>
  /* Similar styling as other auth pages */
  .auth-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
  }
  
  input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  .form-actions {
    margin-top: 1rem;
  }
  
  .error {
    background-color: #ffebee;
    color: #c62828;
    padding: 0.5rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }
  
  .success {
    background-color: #e8f5e9;
    color: #2e7d32;
    padding: 0.5rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }
  
  .loading {
    text-align: center;
    margin: 2rem 0;
  }
  
  .resend-link {
    margin-top: 1rem;
    font-size: 0.875rem;
  }
  
  .auth-link {
    text-align: center;
    margin-top: 1.5rem;
  }
</style>
```

## Server-Side Request Handling

For some authentication operations, you'll need server-side handlers. Here's an example of a sign-in handler in `src/routes/signin/+page.server.ts`:

```typescript
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { signIn } from '$lib/server/auth';

export const actions = {
  default: async ({ request, cookies }) => {
    const formData = await request.formData();
    const email = formData.get('email')?.toString();
    const password = formData.get('password')?.toString();
    
    if (!email || !password) {
      return fail(400, {
        error: 'Email and password are required'
      });
    }
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        cookies
      });
      
      if (result.error) {
        return fail(400, { error: result.error });
      }
      
      throw redirect(303, '/dashboard');
    } catch (error) {
      if (error instanceof Response) throw error;
      return fail(500, { error: 'An error occurred during sign in' });
    }
  }
} satisfies Actions;
```

## Auth Utility Component

Create a reusable authentication status component at `src/components/AuthStatus.svelte`:

```svelte
<script lang="ts">
  import { page } from '$app/stores';
  import { signOut } from 'svelte-guardian/client';
  
  export let showUsername = true;
  
  function handleSignOut() {
    signOut({ callbackUrl: '/' });
  }
</script>

{#if $page.data.session?.user}
  <div class="auth-status">
    {#if showUsername}
      <span class="username">
        {$page.data.session.user.name ?? $page.data.session.user.email}
      </span>
    {/if}
    <button on:click={handleSignOut}>Sign Out</button>
  </div>
{:else}
  <div class="auth-status">
    <a href="/signin">Sign In</a>
    <a href="/signup">Sign Up</a>
  </div>
{/if}

<style>
  .auth-status {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .username {
    font-weight: 500;
  }
</style>
```

## Next Steps

After setting up these authentication pages, you should:

1. Customize the styling to match your application's design
2. Add validation for form inputs
3. Implement loading states and error handling
4. Test the complete authentication flow

For more advanced authentication features, refer to the [OAuth Providers](../guides/oauth-providers.md) and [Two-Factor Authentication](../guides/two-factor-auth.md) guides.
