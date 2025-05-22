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

To make the user's role available in the session, ensure it's included when creating the session:

```typescript
// src/hooks.server.ts
const { handle } = await guardianAuth({
  // Other config...
  callbacks: {
    async onSessionCreation({ session, user }) {
      // Include the role in the session
      session.user.role = user.role;
      
      // For multiple roles
      session.user.roles = user.roles?.map(r => r.name) || [];
      
      return session;
    }
  }
});
```

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
    throw redirect(302, '/signin');
  }
  
  if (session.user.role !== 'admin') {
    throw redirect(302, '/unauthorized');
  }
  
  // Admin-specific data loading
  const adminData = await getAdminData();
  
  return {
    adminData
  };
};
```

### 3. Layout-Based Role Protection

For protecting entire sections of your app:

```typescript
// src/routes/(admin)/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  const session = await locals.getSession();
  
  if (!session?.user) {
    throw redirect(302, '/signin');
  }
  
  if (session.user.role !== 'admin') {
    throw redirect(302, '/unauthorized');
  }
  
  return {
    user: session.user
  };
};
```

Then place your admin routes under the `(admin)` layout group:

```
src/routes/(admin)/
  +layout.server.ts
  +layout.svelte
  dashboard/
  users/
  settings/
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
  import { page } from '$app/stores';
  
  export let roles: string | string[] = [];
  export let showError = false;
  
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  $: user = $page.data.session?.user;
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

For complex permission rules, you can use custom authorization functions:

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

### 2. API Route Protection

Protect API routes based on roles:

```typescript
// src/routes/api/admin/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  const session = await locals.getSession();
  
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (session.user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { 
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Admin-specific API logic
  const data = await getAdminData();
  
  return json(data);
};
```

### 3. Permission-Based Authorization

For more granular control, implement a permission system:

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

## Managing User Roles

### 1. Admin Panel for Role Management

Create an admin interface for managing user roles:

```svelte
<!-- src/routes/admin/users/+page.svelte -->
<script>
  import { enhance } from '$app/forms';
  
  export let data;
  
  const { users, roles } = data;
</script>

<h1>User Management</h1>

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Current Role</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {#each users as user}
      <tr>
        <td>{user.name || 'N/A'}</td>
        <td>{user.email}</td>
        <td>{user.role || 'user'}</td>
        <td>
          <form action="?/updateRole" method="POST" use:enhance>
            <input type="hidden" name="userId" value={user.id} />
            <select name="role">
              {#each roles as role}
                <option value={role} selected={role === user.role}>
                  {role}
                </option>
              {/each}
            </select>
            <button type="submit">Update Role</button>
          </form>
        </td>
      </tr>
    {/each}
  </tbody>
</table>
```

With the corresponding server action:

```typescript
// src/routes/admin/users/+page.server.ts
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/database';

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.getSession();
  
  if (!session?.user || session.user.role !== 'admin') {
    throw redirect(302, '/unauthorized');
  }
  
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    },
    orderBy: {
      email: 'asc'
    }
  });
  
  const roles = ['user', 'editor', 'admin'];
  
  return { users, roles };
};

export const actions = {
  updateRole: async ({ request, locals }) => {
    const session = await locals.getSession();
    
    if (!session?.user || session.user.role !== 'admin') {
      return fail(403, { error: 'Unauthorized' });
    }
    
    const formData = await request.formData();
    const userId = formData.get('userId')?.toString();
    const role = formData.get('role')?.toString();
    
    if (!userId || !role) {
      return fail(400, { error: 'Missing required fields' });
    }
    
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { role }
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to update user role:', error);
      return fail(500, { error: 'Failed to update user role' });
    }
  }
} satisfies Actions;
```

### 2. Self-Service Role Requests

For applications where users can request role upgrades:

```svelte
<!-- src/routes/request-role/+page.svelte -->
<script>
  import { enhance } from '$app/forms';
  
  export let data;
  export let form;
  
  const { availableRoles } = data;
</script>

<h1>Request Role Upgrade</h1>

{#if form?.success}
  <div class="alert success">
    Your role upgrade request has been submitted. You'll be notified when it's processed.
  </div>
{:else}
  <form method="POST" use:enhance>
    <div class="form-group">
      <label for="role">Requested Role</label>
      <select name="role" id="role" required>
        <option value="">Select a role</option>
        {#each availableRoles as role}
          <option value={role.id}>{role.name}</option>
        {/each}
      </select>
    </div>
    
    <div class="form-group">
      <label for="reason">Reason for Request</label>
      <textarea 
        name="reason" 
        id="reason" 
        rows="4" 
        placeholder="Please explain why you need this role upgrade"
        required
      ></textarea>
    </div>
    
    <button type="submit">Submit Request</button>
  </form>
{/if}
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
