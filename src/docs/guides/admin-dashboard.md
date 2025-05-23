---
title: Admin Dashboard Setup
---

# Admin Dashboard Setup

This guide explains how to create a secure admin dashboard in your SvelteKit application using Svelte Guardian's role-based authentication.

## Basic Admin Dashboard Setup

### 1. Configure Role-Based Route Protection

First, configure route protection in your auth setup:

```typescript
// src/lib/server/auth.ts
export const { handle, signIn, signOut, createUser } = await guardianAuth({
  // Other configuration...
  security: {
    // Other security settings...
    routeProtection: {
      protectedRoutes: {
        '/admin': {
          allowedRoles: ['admin'],
          redirectPath: '/unauthorized'
        },
        '/admin/*': {
          allowedRoles: ['admin'],
          redirectPath: '/unauthorized'
        }
      },
      publicRoutes: {
        '/signin': {
          redirectPath: '/admin'  // Redirect authenticated admins to the admin dashboard
        }
      },
      roleKey: 'role'  // The key in the user object that contains the role
    }
  }
});
```

### 2. Create Admin Routes

Create the admin dashboard routes:

```
src/routes/admin/
├── +layout.svelte
├── +page.svelte
├── +page.server.ts
├── users/
│   ├── +page.svelte
│   └── +page.server.ts
└── settings/
    ├── +page.svelte
    └── +page.server.ts
```

### 3. Create an Admin Dashboard Layout

Create a layout for your admin area in `src/routes/admin/+layout.svelte`:

```svelte
<script lang="ts">
  import { page } from '$app/stores';
  
  $: user = $page.data.user;
</script>

<div class="admin-dashboard">
  <header class="admin-header">
    <h1>Admin Dashboard</h1>
    <div class="admin-user">
      <span>Signed in as {user.name || user.email}</span>
      <form action="/signout" method="POST">
        <button type="submit">Sign Out</button>
      </form>
    </div>
  </header>
  
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <nav>
        <ul>
          <li><a href="/admin">Dashboard</a></li>
          <li><a href="/admin/users">Users</a></li>
          <li><a href="/admin/settings">Settings</a></li>
        </ul>
      </nav>
    </aside>
    
    <main class="admin-content">
      <slot />
    </main>
  </div>
</div>

<style>
  .admin-dashboard {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }
  
  .admin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background-color: #1a1a1a;
    color: white;
  }
  
  .admin-user {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .admin-layout {
    display: flex;
    flex: 1;
    overflow: hidden;
  }
  
  .admin-sidebar {
    width: 250px;
    background-color: #f5f5f5;
    padding: 1.5rem;
    overflow-y: auto;
  }
  
  .admin-sidebar nav ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .admin-sidebar nav ul li {
    margin-bottom: 0.75rem;
  }
  
  .admin-sidebar nav ul li a {
    display: block;
    padding: 0.5rem;
    text-decoration: none;
    color: #333;
    border-radius: 4px;
  }
  
  .admin-sidebar nav ul li a:hover {
    background-color: #e0e0e0;
  }
  
  .admin-content {
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
  }
</style>
```

### 5. Create Dashboard Home Page

Create the main dashboard page in `src/routes/admin/+page.svelte`:

```svelte
<script lang="ts">
  import { page } from '$app/stores';
</script>

<svelte:head>
  <title>Admin Dashboard</title>
</svelte:head>

<div class="dashboard-overview">
  <h2>Dashboard Overview</h2>
  
  <div class="stats-grid">
    <div class="stat-card">
      <h3>Total Users</h3>
      <p class="stat-value">125</p>
    </div>
    
    <div class="stat-card">
      <h3>New Users (Today)</h3>
      <p class="stat-value">12</p>
    </div>
    
    <div class="stat-card">
      <h3>Active Sessions</h3>
      <p class="stat-value">37</p>
    </div>
    
    <div class="stat-card">
      <h3>Failed Logins (24h)</h3>
      <p class="stat-value">5</p>
    </div>
  </div>
  
  <div class="recent-activity">
    <h3>Recent Activity</h3>
    <!-- Add activity log here -->
  </div>
</div>

<style>
  .dashboard-overview {
    max-width: 1200px;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
  }
  
  .stat-card {
    background-color: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .stat-card h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    color: #555;
  }
  
  .stat-value {
    font-size: 2rem;
    font-weight: bold;
    margin: 0;
    color: #2e7d32;
  }
  
  .recent-activity {
    background-color: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    margin-top: 2rem;
  }
</style>
```

## User Management

### Create User Management Page

Create a user management page at `src/routes/admin/users/+page.server.ts`:

```typescript
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      role: true,
      createdAt: true,
      isLocked: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  return { users };
};

export const actions = {
  lockUser: async ({ request }) => {
    const formData = await request.formData();
    const userId = formData.get('userId')?.toString();
    
    if (!userId) {
      return fail(400, { error: 'User ID is required' });
    }
    
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { 
          isLocked: true,
          lockUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Lock for 7 days
        }
      });
      
      return { success: true };
    } catch (error) {
      return fail(500, { error: 'Failed to lock user account' });
    }
  },
  
  unlockUser: async ({ request }) => {
    const formData = await request.formData();
    const userId = formData.get('userId')?.toString();
    
    if (!userId) {
      return fail(400, { error: 'User ID is required' });
    }
    
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { 
          isLocked: false,
          lockUntil: null,
          loginAttempts: 0
        }
      });
      
      return { success: true };
    } catch (error) {
      return fail(500, { error: 'Failed to unlock user account' });
    }
  },
  
  updateRole: async ({ request }) => {
    const formData = await request.formData();
    const userId = formData.get('userId')?.toString();
    const role = formData.get('role')?.toString();
    
    if (!userId || !role) {
      return fail(400, { error: 'User ID and role are required' });
    }
    
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { role }
      });
      
      return { success: true };
    } catch (error) {
      return fail(500, { error: 'Failed to update user role' });
    }
  }
};
```

And the corresponding page in `src/routes/admin/users/+page.svelte`:

```svelte
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData } from './$types';
  
  export let data: PageData;
  
  $: ({ users } = data);
</script>

<svelte:head>
  <title>User Management | Admin</title>
</svelte:head>

<div class="users-page">
  <h2>User Management</h2>
  
  <div class="users-table-container">
    <table class="users-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Email Verified</th>
          <th>Created At</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each users as user}
          <tr>
            <td>{user.name || 'N/A'}</td>
            <td>{user.email}</td>
            <td>
              <form method="POST" action="?/updateRole" use:enhance>
                <input type="hidden" name="userId" value={user.id} />
                <select name="role" value={user.role} on:change={(e) => e.target.form.submit()}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                </select>
              </form>
            </td>
            <td>{user.emailVerified ? '✓' : '✗'}</td>
            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
            <td>{user.isLocked ? 'Locked' : 'Active'}</td>
            <td class="actions">
              {#if user.isLocked}
                <form method="POST" action="?/unlockUser" use:enhance>
                  <input type="hidden" name="userId" value={user.id} />
                  <button type="submit" class="btn-unlock">Unlock</button>
                </form>
              {:else}
                <form method="POST" action="?/lockUser" use:enhance>
                  <input type="hidden" name="userId" value={user.id} />
                  <button type="submit" class="btn-lock">Lock</button>
                </form>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .users-page {
    max-width: 1200px;
  }
  
  .users-table-container {
    overflow-x: auto;
    margin-top: 2rem;
  }
  
  .users-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }
  
  .users-table th,
  .users-table td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .users-table th {
    background-color: #f5f5f5;
    font-weight: 600;
  }
  
  .users-table tr:hover {
    background-color: #f9f9f9;
  }
  
  .actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .btn-lock,
  .btn-unlock {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-size: 0.8rem;
  }
  
  .btn-lock {
    background-color: #ffcdd2;
    color: #c62828;
  }
  
  .btn-unlock {
    background-color: #c8e6c9;
    color: #2e7d32;
  }
</style>
```

## Security Considerations

When implementing an admin dashboard, consider these security best practices:

1. **Principle of Least Privilege**: Only grant admin privileges to users who absolutely need them.

2. **Admin Action Logging**: Log all important actions taken by administrators.

```typescript
// Example of action logging middleware
const adminActionLogger: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  
  if (event.url.pathname.startsWith('/admin') && event.request.method !== 'GET') {
    const session = await event.locals.auth();
    if (session?.user) {
      await prisma.adminActionLog.create({
        data: {
          userId: session.user.id,
          action: event.request.method,
          path: event.url.pathname,
          timestamp: new Date()
        }
      });
    }
  }
  
  return response;
};
```

3. **IP Restriction**: Consider restricting admin access to specific IP ranges.

4. **Two-Factor Authentication**: Require 2FA for admin accounts.

5. **Session Timeout**: Set shorter session timeouts for admin users.
//TODO Add confIg optIOn to IMPlemEMNT THIS
```typescript
// Example of shorter admin session timeout
if (session.user.role === 'admin') {
  event.cookies.set('authjs.session-token', sessionToken, {
    expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour for admins
    path: '/'
  });
}
```

## Next Steps

After setting up your basic admin dashboard, consider these improvements:

1. **Dashboard Analytics**: Add charts and visualizations for user data.
2. **Advanced Filtering**: Implement search, sort, and filter capabilities.
3. **Bulk Actions**: Add functionality for bulk user management operations.
4. **Audit Logs**: Create a view for security and admin action logs.
5. **User Details**: Add detailed user profiles with activity history.
