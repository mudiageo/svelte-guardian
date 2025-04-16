# Rate Limiting

Rate limiting is a crucial security feature that protects your application from brute force attacks, denial of service attacks, and abuse. Svelte Guardian provides flexible rate limiting options to secure your authentication endpoints.

## Overview

Rate limiting works by tracking the number of requests from a specific source (IP address or user ID) within a time window. When the number of requests exceeds the defined limit, further requests are blocked for a specified duration.

## Configuration

Rate limiting is configured in the `security.rateLimiting` section of your Svelte Guardian configuration:

```typescript
const { handle, signIn, signOut } = await guardianAuth({
  // Other configuration...
  security: {
    rateLimiting: {
      enabled: true,                 // Enable rate limiting
      strategy: 'memory',            // 'memory', 'redis', or 'upstash-redis'
      requestsPerMinute: 60,         // Alternatively, use maxRequests and windowMs
      maxRequests: 10,               // Max requests in time window
      windowMs: 60000,               // Time window in milliseconds (1 minute)
      blockDuration: 300000,         // Block duration in milliseconds (5 minutes)
      redisConfig: {                 // Required for 'redis' or 'upstash-redis' strategies
        url: 'redis://localhost:6379',
        // Additional Redis configuration...
      }
    }
  }
});
```

## Rate Limiting Strategies

Svelte Guardian supports three rate limiting strategies:

### In-Memory Rate Limiting

The simplest strategy, storing rate limit data in the application's memory.

```typescript
rateLimiting: {
  enabled: true,
  strategy: 'memory',
  requestsPerMinute: 60
}
```

**Pros:**
- Easy to set up, no external dependencies
- Works out of the box

**Cons:**
- Not suitable for multi-server deployments
- Rate limit data is lost on server restart
- Memory usage increases with more clients

### Redis Rate Limiting

Uses Redis to store rate limit data, suitable for production deployments.

```typescript
rateLimiting: {
  enabled: true,
  strategy: 'redis',
  requestsPerMinute: 60,
  redisConfig: {
    url: 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD,
    database: 0,
    tls: false
  }
}
```

**Pros:**
- Suitable for multi-server deployments
- Persists rate limit data across server restarts
- Efficient memory usage

**Cons:**
- Requires a Redis server
- Additional infrastructure to maintain

### Upstash Redis Rate Limiting

Uses [Upstash Redis](https://upstash.com/), a serverless Redis service, ideal for serverless deployments.

```typescript
rateLimiting: {
  enabled: true,
  strategy: 'upstash-redis',
  requestsPerMinute: 60,
  redisConfig: {
    url: process.env.UPSTASH_REDIS_URL,
    token: process.env.UPSTASH_REDIS_TOKEN
  }
}
```

**Pros:**
- Works well with serverless deployments
- No infrastructure to maintain
- Persists rate limit data across server restarts

**Cons:**
- External service dependency
- May have higher latency depending on region

## Rate Limiting Options

### Basic Options

- **enabled**: Boolean to enable or disable rate limiting
- **strategy**: `'memory'`, `'redis'`, or `'upstash-redis'`
- **requestsPerMinute**: Shorthand for setting up per-minute rate limiting

### Advanced Options

- **maxRequests**: Maximum number of requests allowed in the time window
- **windowMs**: Time window in milliseconds
- **blockDuration**: Duration to block requests after exceeding the limit
- **redisConfig**: Configuration for Redis-based strategies

### Redis Configuration

For Redis-based strategies, you can configure:

```typescript
redisConfig: {
  url?: string;                // Redis connection URL
  socket?: {                   // Alternative to URL
    host?: string;
    port?: number;
  };
  username?: string;           // Redis username (if required)
  password?: string;           // Redis password
  database?: number;           // Redis database number
  tls?: boolean;               // Enable TLS/SSL
  connectionOptions?: {        // Additional connection options
    connectTimeout?: number;
    disconnectTimeout?: number;
    pingInterval?: number;
    maxRetriesPerRequest?: number;
    retryStrategy?: (times: number) => number | null;
  }
}
```

## Custom Key Generation

By default, rate limiting uses the user ID (if authenticated) or IP address as the key. You can customize this behavior:

```typescript
rateLimiting: {
  enabled: true,
  strategy: 'memory',
  requestsPerMinute: 60,
  keyGenerator: (event: RequestEvent) => {
    // Custom key generation logic
    const user = event.locals.auth?.()?.user;
    if(user?.id) return \`custom:user:${user.id}\`;

    return \`custom:ip:${event.getClientAddress()}\`;
  }
}
```

## Rate Limiting Headers

When rate limiting is enabled, Svelte Guardian automatically adds these headers to responses:

- `X-RateLimit-Limit`: Maximum number of requests allowed in the time window
- `X-RateLimit-Remaining`: Number of requests remaining in the current time window
- `X-RateLimit-Reset`: Timestamp when the rate limit window resets (in milliseconds)

When a request is blocked, the response will have:
- Status code `429 Too Many Requests`
- `Retry-After` header indicating seconds to wait before retrying

## Route-Specific Rate Limiting

While Svelte Guardian applies rate limiting to all authentication endpoints by default, you may want different limits for specific routes:

```typescript
// This feature is coming in a future release
rateLimiting: {
  routes: {
    '/api/auth/signin': {
      maxRequests: 5,
      windowMs: 60000   // 1 minute
    },
    '/api/auth/signup': {
      maxRequests: 3,
      windowMs: 3600000 // 1 hour
    }
  }
}
```

## Handling Rate Limit Errors

When a client exceeds the rate limit, they receive a 429 response with a JSON payload:

```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded",
  "retryAfter": 1626547890123 // Timestamp when the block expires
}
```

Client-side example of handling rate limit errors:

```javascript
async function handleSignIn() {
  try {
    const result = await signIn('credentials', { 
      email, 
      password,
      redirect: false
    });
    
    if (result.success) {
      // Successful sign in
    } else {
      // Handle other errors
    }
  } catch (error) {
    if (error.status === 429) {
      const data = await error.response.json();
      const retryAfter = new Date(data.retryAfter);
      // Show user-friendly message
      errorMessage = \`Too many attempts. Please try again after ${retryAfter.toLocaleTimeString()}.\`;
    } else {
      // Handle other errors
    }
  }
}
```

## Monitoring and Debugging

Rate limiting events are logged by Svelte Guardian's logger:

```typescript
// Configure logger in your guardian configuration
logger: {
  enabled: true,
  level: 'warn', // 'debug', 'info', 'warn', or 'error'
  destinations: [
    { type: 'console' },
    { 
      type: 'file',
      file: 'logs/rate-limiting.log',
      maxSize: '10m',
      maxFiles: 5
    }
  ]
}
```

Example log message when a request is blocked:
```
[WARN] Rate limit exceeded for /auth/signin - IP: 192.168.1.1, User: null, Blocked until: 2023-06-12T15:30:45.123Z
```

## Best Practices

1. **Start Conservative**: Begin with lower limits and adjust based on legitimate usage patterns.

2. **Use Redis in Production**: The in-memory strategy is suitable for development but use Redis in production, especially with multiple servers.

3. **Apply Stricter Limits to Sensitive Routes**: Use stricter limits for authentication-related endpoints.

4. **Monitor Rate Limiting Events**: Regularly review logs to identify potential attacks and adjust limits if necessary.

5. **Consider User Experience**: Implement user-friendly error messages and UIs that explain rate limiting to legitimate users.

6. **Environment-Specific Configuration**: Use different rate limiting configurations for development, testing, and production environments.

## Implementation Examples

### Basic In-Memory Rate Limiting

```typescript
// Minimal configuration with in-memory rate limiting
security: {
  rateLimiting: {
    enabled: true,
    requestsPerMinute: 60
  }
}
```

### Production-Ready Redis Rate Limiting

```typescript
// Redis-based rate limiting for production
security: {
  rateLimiting: {
    enabled: true,
    strategy: 'redis',
    maxRequests: 100,
    windowMs: 60000,         // 1 minute
    blockDuration: 600000,   // 10 minutes
    redisConfig: {
      url: process.env.REDIS_URL,
      password: process.env.REDIS_PASSWORD,
      tls: true
    }
  }
}
```

### Serverless Deployment with Upstash

```typescript
// Upstash Redis rate limiting for serverless environments
security: {
  rateLimiting: {
    enabled: true,
    strategy: 'upstash-redis',
    maxRequests: 50,
    windowMs: 60000,
    blockDuration: 300000,
    redisConfig: {
      url: process.env.UPSTASH_REDIS_URL,
      token: process.env.UPSTASH_REDIS_TOKEN
    }
  }
}
```

### Development Configuration

```typescript
// Lenient configuration for development
security: {
  rateLimiting: {
    enabled: process.env.NODE_ENV === 'production',
    strategy: 'memory',
    maxRequests: 1000,
    windowMs: 60000,
    blockDuration: 10000     // Short block for testing
  }
}
```