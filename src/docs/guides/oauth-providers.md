# OAuth Providers

Svelte Guardian supports multiple OAuth providers to allow users to sign in with their existing accounts on other platforms. This guide will walk you through integrating various OAuth providers with your SvelteKit application.

## Supported OAuth Providers

Svelte Guardian supports the following OAuth providers:

- Google
- GitHub
- Microsoft
- Facebook
- Twitter
- Discord
- And more (any provider supported by Auth.js)

## General Configuration

OAuth providers are configured in the `providers` section of your Svelte Guardian configuration:

```typescript
const { handle, signIn, signOut } = await guardianAuth({
  // Other configuration...
  providers: {
    google: {
      enabled: true,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      scope: ['profile', 'email']
    },
    github: {
      enabled: true,
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET
    }
    // Add more providers as needed
  }
});
```

## Provider Setup Guide

### Google

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application" as the application type
6. Add your domain to "Authorized JavaScript origins" (e.g., `https://yourdomain.com`)
7. Add your redirect URI to "Authorized redirect URIs" (e.g., `https://yourdomain.com/auth/callback/google`)
8. Click "Create" and note your Client ID and Client Secret

```typescript
google: {
  enabled: true,
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  scope: ['profile', 'email']
}
```

### GitHub

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in your application details
4. Set the Authorization callback URL to your redirect URI (e.g., `https://yourdomain.com/auth/callback/github`)
5. Click "Register application" and note your Client ID
6. Generate a new client secret and note it

```typescript
github: {
  enabled: true,
  clientId: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET
}
```

### Microsoft

1. Go to the [Microsoft Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" > "App registrations"
3. Click "New registration"
4. Enter a name for your application
5. Set the redirect URI to your callback URL (e.g., `https://yourdomain.com/auth/callback/microsoft`)
6. Click "Register"
7. Note your Application (client) ID
8. Under "Certificates & secrets", create a new client secret and note it

```typescript
microsoft: {
  enabled: true,
  clientId: process.env.MICROSOFT_CLIENT_ID,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  tenantId: process.env.MICROSOFT_TENANT_ID // Optional, defaults to 'common'
}
```

### Facebook

1. Go to [Facebook for Developers](https://developers.facebook.com/)
2. Create a new app or select an existing one
3. Navigate to "Settings" > "Basic"
4. Note your App ID and App Secret
5. Under "Facebook Login" > "Settings", add your redirect URI (e.g., `https://yourdomain.com/auth/callback/facebook`)

```typescript
facebook: {
  enabled: true,
  clientId: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET
}
```

## Client-Side Implementation

### Sign-in Button

Add OAuth sign-in buttons to your sign-in page:

```svelte
<script>
  import { signIn } from '$lib/auth';
  
  function handleOAuthSignIn(provider) {
    signIn(provider, { callbackUrl: '/dashboard' });
  }
</script>

<div class="oauth-buttons">
  <button type="button" on:click={() => handleOAuthSignIn('google')}>
    Sign in with Google
  </button>
  
  <button type="button" on:click={() => handleOAuthSignIn('github')}>
    Sign in with GitHub
  </button>
  
  <!-- Add more provider buttons as needed -->
</div>
```

### Custom Styling

Style your OAuth buttons to match the provider's branding:

```svelte
<style>
  .google-button {
    background-color: white;
    color: #757575;
    border: 1px solid #ddd;
  }
  
  .github-button {
    background-color: #24292e;
    color: white;
  }
  
  .facebook-button {
    background-color: #1877f2;
    color: white;
  }
  
  /* Add more provider-specific styles */
</style>
```

## Account Linking

Svelte Guardian supports linking multiple OAuth providers to a single user account.

### Linking Accounts

To enable account linking, add a method to your profile or settings page:

```svelte
<script>
  import { linkAccount } from 'svelte-guardian/client';
  
  function handleLinkAccount(provider) {
    linkAccount(provider);
  }
</script>

<div>
  <h2>Connected Accounts</h2>
  <!-- Display currently connected accounts -->
  
  <div class="link-accounts">
    <button on:click={() => handleLinkAccount('google')}>
      Connect Google Account
    </button>
    <button on:click={() => handleLinkAccount('github')}>
      Connect GitHub Account
    </button>
    <!-- Add more providers as needed -->
  </div>
</div>
```

## Customizing User Profiles

When users sign in with OAuth providers, their profile information (name, email, avatar) is automatically fetched. You can customize how this information is handled:

```typescript
providers: {
  google: {
    enabled: true,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    profile(profile) {
      return {
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        image: profile.picture,
        role: 'user', // Set default role
        // Add any other custom fields
      };
    }
  }
}
```

## Handling OAuth Callbacks

Svelte Guardian automatically handles OAuth callbacks, but you can customize the behavior:

```typescript
callbacks: {
  async signIn({ user, account, profile }) {
    // Custom logic before completing sign in
    if (user.email.endsWith('@yourdomain.com')) {
      user.role = 'employee';
    }
    return true; // Allow sign in
  },
  async redirect({ url, baseUrl }) {
    // Customize redirect behavior
    if (url.startsWith(baseUrl)) return url;
    return baseUrl;
  }
}
```

## Environment Variables

Store your OAuth credentials as environment variables:

```
# .env file
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret
# Add more provider credentials as needed
```

## Testing OAuth Providers

During development, you may want to test OAuth providers locally:

1. Use `http://localhost:5173` (or your dev server URL) as an allowed origin in provider settings
2. Add `http://localhost:5173/auth/callback/[provider]` as a redirect URI
3. Use development credentials separate from production

## Troubleshooting

### Common Issues:

1. **Redirect URI Mismatch**: Ensure the redirect URI in your provider settings exactly matches your application's callback URL.

2. **Scope Issues**: Some providers require specific scopes to access user information. Check the provider's documentation.

3. **CORS Errors**: During development, you might encounter CORS issues. Make sure your development URL is allowed in the provider settings.

4. **Session Not Persisting**: Ensure your application is configured to handle cookies properly, especially in development.

## Security Considerations

1. **Store Credentials Securely**: Never commit OAuth credentials to your repository. Use environment variables.

2. **Use HTTPS**: Always use HTTPS in production to secure OAuth redirects and tokens.

3. **Validate Email Domains**: If your application is for a specific organization, consider validating email domains before allowing sign-in.

4. **Review Scopes**: Only request the OAuth scopes you actually need to minimize security risks and privacy concerns.