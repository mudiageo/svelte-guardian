---
title: "Role-Based Authorization"
description: "Implementing role-based access control with Svelte Guardian."
---

# Role-Based Authorization

This guide explains how to implement role-based access control (RBAC) in your SvelteKit application using Svelte Guardian.

## Understanding Roles in Svelte Guardian

Role-based authorization allows you to control what users can access based on their assigned roles. Common examples include:

- **Admin**: Full access to all features
- **Editor**: Can create and edit content
- **Moderator**: Can review and approve content
- **User**: Standard access to protected features
- **Guest**: Limited access to public features

## Setting Up User Roles

### 1. Database Schema

Svelte Guardian includes a `role` field in the default User model. When using Prisma, your schema might look like:

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  password      String?
  image         String?
  role          String?   @default("user") // Role field
  accounts      Account[]
  sessions      Session[]
}
```

For more complex permission systems, you might create separate models:

```prisma
model Role {
  id          String       @id @default(cuid())
  name        String       @unique
  description String?
  users       User[]
  permissions Permission[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model Permission {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  roles       Role[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model User {
  // Other fields...
  roles       Role[]
}
```

### 2. Including Role in Session

Roles are included in the session by defailt. Simply ensure you use yge role field, or spefify your rolefiel name in roleKey config

## Protecting Routes Based on Roles

### 1. Server-Side Route Protection

Configure route protection in your Svelte Guardian setup:

```typescript
// src/hooks.server.ts
const { handle } = await guardianAuth({
  // Other config...
  security: {
    routeProtection: {
      protectedRoutes: {
        '/admin': {
          allowedRoles: ['admin'],
          redirectPath: '/unauthorized'
        },
        '/editor': {
          allowedRoles: ['admin', 'editor'],
          redirectPath: '/unauthorized'
        },
        '/dashboard': {
          authenticated: true, // Any authenticated user
          redirectPath: '/signin'
        }
      }
    }
  }
});
```

### 2. Page-Level Role Checks

In your SvelteKit pages, you can check roles in `+page.server.ts` files:

```typescript
// src/routes/admin/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.getSession();
  
  if (!session?.user) {
    redirect(302, '/signin');
  }
  
  if (session.user.role !== 'admin') {
    redirect(302, '/unauthorized');
  }
  
  // Admin-specific data loading
  const adminData = await getAdminData();
  
  return {
    adminData
  };
};
```

## Role-Based UI Elements

### 1. Conditional UI in Svelte Components

Make UI elements appear based on the user's role:

```svelte
<script>
  import { page } from '$app/stores';
  
  $: user = $page.data.session?.user;
  $: isAdmin = user?.role === 'admin';
  $: isEditor = user?.role === 'editor' || isAdmin;
</script>

<nav>
  <a href="/">Home</a>
  {#if user}
    <a href="/dashboard">Dashboard</a>
    
    {#if isEditor}
      <a href="/editor">Content Editor</a>
    {/if}
    
    {#if isAdmin}
      <a href="/admin">Admin Panel</a>
    {/if}
  {/if}
</nav>

<div class="user-actions">
  {#if isAdmin}
    <button on:click={deleteItem}>Delete</button>
  {/if}
  
  {#if isEditor}
    <button on:click={editItem}>Edit</button>
  {/if}
  
  <button on:click={viewItem}>View</button>
</div>
```

### 2. Creating Reusable Role Guards

Create reusable components to handle role-based UI protection:

```svelte
<!-- src/components/RoleGuard.svelte -->
<script lang="ts">
  import { page } from '$app/state';
  
  export let roles: string | string[] = [];
  export let showError = false;
  
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  $: user = page.data.session?.user;
  $: hasAccess = !!user && (
    allowedRoles.length === 0 || 
    allowedRoles.includes(user.role)
  );
</script>

{#if hasAccess}
  <slot />
{:else if showError}
  <slot name="error">
    <div class="error-message">
      You don't have permission to access this content.
    </div>
  </slot>
{/if}
```
//TODO Add this component to library

Using the guard component:

```svelte
<RoleGuard roles={['admin', 'editor']}>
  <div class="admin-panel">
    <!-- Admin/editor content here -->
    <h2>Content Management</h2>
    <button>Create New Post</button>
  </div>
  
  <div slot="error">
    <!-- Custom error display -->
    <p>This section requires editor privileges.</p>
    <a href="/contact">Request Access</a>
  </div>
</RoleGuard>
```

## Advanced Role-Based Features

### 1. Custom Authorization Logic

For complex permission rules, you can use custom authorization functions(Not yet implemented):

```typescript
const { handle } = await guardianAuth({
  security: {
    routeProtection: {
      protectedRoutes: {
        '/projects/:projectId': {
          authorize: async ({ user, params, request }) => {
            // Check if the user has access to the specific project
            if (!user) return false;
            
            // For admins, allow all access
            if (user.role === 'admin') return true;
            
            // For others, check project membership
            const projectId = params.projectId;
            const hasAccess = await checkProjectAccess(user.id, projectId);
            return hasAccess;
          },
          redirectPath: '/unauthorized'
        }
      }
    }
  }
});
```

### 2. Permission-Based Authorization

For more granular control, implement a permission system:
//TODO
```typescript
// src/lib/permissions.ts
export const PERMISSIONS = {
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  POST_CREATE: 'post:create',
  POST_UPDATE: 'post:update',
  POST_DELETE: 'post:delete',
  SETTINGS_UPDATE: 'settings:update'
};

export const ROLE_PERMISSIONS = {
  admin: Object.values(PERMISSIONS),
  editor: [
    PERMISSIONS.POST_CREATE,
    PERMISSIONS.POST_UPDATE,
    PERMISSIONS.POST_DELETE
  ],
  user: []
};

export function hasPermission(user, permission) {
  if (!user) return false;
  
  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
  return userPermissions.includes(permission);
}
```

Use in components:

```svelte
<script>
  import { page } from '$app/stores';
  import { hasPermission, PERMISSIONS } from '$lib/permissions';
  
  $: user = $page.data.session?.user;
  $: canCreatePost = hasPermission(user, PERMISSIONS.POST_CREATE);
  $: canDeletePost = hasPermission(user, PERMISSIONS.POST_DELETE);
</script>

<div class="post-controls">
  {#if canCreatePost}
    <button on:click={createPost}>New Post</button>
  {/if}
  
  {#if canDeletePost}
    <button on:click={deletePost} class="danger">Delete</button>
  {/if}
</div>
```


## Best Practices

1. **Defense in Depth**: Never rely only on UI hiding - always enforce role checks on the server
2. **Principle of Least Privilege**: Assign users the minimum roles they need
3. **Role Auditing**: Log role changes for security tracking
4. **Regular Role Review**: Periodically review and update role assignments
5. **Clear Role Definitions**: Clearly document what each role can and cannot do
6. **Role Inheritance**: Design roles to inherit permissions from less privileged roles
7. **Separation of Concerns**: Separate role checking logic from business logic

## Next Steps

- [Advanced Route Protection](./advanced-route-protection.md)
- [Custom Authorization Policies](../api-reference/security/authorization.md)
- [Managing User Data](../getting-started/user-profiles.md)
