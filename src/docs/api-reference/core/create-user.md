---
title: "createUser()"
description: "Function for creating new users with Svelte Guardian."
---

# createUser()

The `createUser()` function is used to programmatically create new users in your application. It's particularly useful for admin functionality, seeding databases, or implementing custom registration flows.

## Syntax

```typescript
const user = await createUser(userData: CreateUserData, options?: CreateUserOptions): Promise<User>
```

## Parameters

- `userData`: A [CreateUserData](/api-reference/types.md#createuserdata) object containing:
  - `email`: User's email address (required)
  - `password`: User's password (required for credentials provider)
  - `name`: User's display name (optional)
  - `role`: User's role (optional, defaults to 'user')
  - `emailVerified`: Whether the email is already verified (optional)
  - Additional custom fields as needed

- `options`: A [CreateUserOptions](/api-reference/types.md#createuseroptions) object containing:
  - `sendVerificationEmail`: Whether to send a verification email (default: false)
  - `skipPasswordHashing`: Whether the password is already hashed (default: false)
  - `skipValidation`: Whether to skip validation rules (default: false)
  - `provider`: Which auth provider to associate with the user (default: 'credentials')

## Return Value

Returns a [User](/api-reference/types.md#user) object representing the newly created user.

## Example

### Basic Usage

```typescript
import { createUser } from 'svelte-guardian/server';

const newUser = await createUser({
  email: 'user@example.com',
  password: 'securePassword123',
  name: 'New User',
  role: 'admin'
});

console.log('Created user:', newUser.id);
```

### With Email Verification

```typescript
const newUser = await createUser({
  email: 'user@example.com',
  password: 'securePassword123',
  name: 'New User'
}, {
  sendVerificationEmail: true
});
```

### With Pre-Hashed Password

```typescript
import { hashPassword } from 'svelte-guardian/server';

const hashedPassword = await hashPassword('securePassword123');

const newUser = await createUser({
  email: 'user@example.com',
  password: hashedPassword,
  emailVerified: new Date()
}, {
  skipPasswordHashing: true
});
```

### With Custom Fields

```typescript
const newUser = await createUser({
  email: 'user@example.com',
  password: 'securePassword123',
  name: 'New User',
  // Custom fields
  firstName: 'New',
  lastName: 'User',
  phoneNumber: '+1234567890',
  preferences: {
    theme: 'dark',
    notifications: true
  }
});
```

## Error Handling

The `createUser()` function throws errors that should be caught and handled appropriately:

```typescript
try {
  const newUser = await createUser({
    email: 'user@example.com',
    password: 'securePassword123'
  });
  
  // Success
  return newUser;
} catch (error) {
  if (error.code === 'USER_EXISTS') {
    // Handle duplicate user
    console.error('User already exists');
  } else if (error.code === 'VALIDATION_FAILED') {
    // Handle validation error
    console.error('Validation failed:', error.message);
  } else {
    // Handle other errors
    console.error('Failed to create user:', error);
  }
  throw error; // Re-throw or handle as appropriate
}
```

## Events

Creating a user triggers the following events if configured:

- `onUserCreation`: Called when a user is successfully created
- `afterRegistration`: Called after a user is created via registration

## Related

- [signIn()](/api-reference/core/sign-in.md)
- [updateUser()](/api-reference/core/update-user.md)
- [deleteUser()](/api-reference/core/delete-user.md)
