---
title: "Advanced Route Protection"
description: "Implementing complex route protection strategies with Svelte Guardian."
---

# Advanced Route Protection

This guide covers advanced route protection techniques with Svelte Guardian, allowing you to create sophisticated access control rules for your SvelteKit application.

## Beyond Basic Authentication

While basic route protection ensures users are logged in, advanced protection allows for:

- Fine-grained control based on user attributes
- Dynamic authorization based on resource ownership
- Multi-factor authentication requirements
- Contextual access (time-based, location-based, etc.)
- Custom authorization policies

## Configuration-Based Protection

### Dynamic Route Patterns and Parameters

You can protect dynamic routes with parameter-based authorization:

```typescript
// src/lib/server/auth.ts
const { handle, middleware } = await guardianAuth({
  security: {
    routeProtection: {
      protectedRoutes: {
        // Basic authentication
        '/dashboard': {
          authenticated: true,
          redirectPath: '/signin'
        },
        
        // Role-based protection
        '/admin/:section': {
          allowedRoles: ['admin'],
          redirectPath: '/unauthorized'
        },
        
        // Dynamic protection with parameters
        '/projects/:projectId': {
          authorize: async ({ user, params }) => {
            if (!user) return false;
            if (user.role === 'admin') return true;
            
            // Check if user is a member of the project
            return await isProjectMember(user.id, params.projectId);
          },
          redirectPath: '/unauthorized'
        },
        
        // Protecting API routes
        '/api/users/:userId': {
          authorize: async ({ user, params }) => {
            return user?.id === params.userId || user?.role === 'admin';
          },
          // Return error response for API routes instead of redirecting
          errorResponse: (request) => {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 403,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }
      }
    }
  }
});
```

### Custom Authorization Functions

The `authorize` function gives you complete control over access decisions:

```typescript
authorize: async ({ user, params, request, url }) => {
  // Check user is authenticated
  if (!user) return false;
  
  // Access to URL parameters and query strings
  const projectId = params.projectId;
  const mode = url.searchParams.get('mode');
  
  // Access to request method
  if (request.method === 'GET') {
    // More permissive for GET requests
    return await canViewProject(user.id, projectId);
  } else {
    // Stricter for mutations
    return await canEditProject(user.id, projectId);
  }
}
```

### Advanced Guard Functions

You can create reusable authorization guards:

```typescript
// src/lib/guards.ts
import type { AuthorizeParams } from 'svelte-guardian';

export function adminOnly({ user }: AuthorizeParams) {
  return user?.role === 'admin';
}

export function projectMemberGuard({ user, params }: AuthorizeParams) {
  if (!user) return false;
  return isProjectMember(user.id, params.projectId);
}

export function contentOwnerGuard({ user, params }: AuthorizeParams) {
  if (!user) return false;
  return isContentOwner(user.id, params.contentId);
}

// Combined guards
export function adminOrContentOwner({ user, params }: AuthorizeParams) {
  if (!user) return false;
  return user.role === 'admin' || isContentOwner(user.id, params.contentId);
}
```

Then use these guards in your configuration:

```typescript
const { handle,middleware } = await guardianAuth({
  security: {
    routeProtection: {
      protectedRoutes: {
        '/admin': {
          authorize: adminOnly,
          redirectPath: '/unauthorized'
        },
        '/projects/:projectId': {
          authorize: projectMemberGuard,
          redirectPath: '/unauthorized'
        },
        '/content/:contentId/edit': {
          authorize: contentOwnerGuard,
          redirectPath: '/unauthorized'
        }
      }
    }
  }
});
```

## Manual Route Protection

For more complex cases, you can implement protection manually in your page server load functions:

```typescript
// src/routes/projects/[projectId]/+page.server.ts
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/database';

export const load: PageServerLoad = async ({ params, locals }) => {
  const session = await locals.getSession();
  
  if (!session?.user) {
    redirect(302, '/signin');
  }
  
  const projectId = params.projectId;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: true,
      tasks: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });
  
  if (!project) {
    error(404, 'Project not found');
  }
  
  // Access control logic
  const canAccess = 
    session.user.role === 'admin' ||
    project.ownerId === session.user.id ||
    project.members.some(member => member.userId === session.user.id);
  
  if (!canAccess) {
    error(403, 'You do not have permission to access this project');
  }
  
  // Determine user capabilities based on their role in the project
  const isOwner = project.ownerId === session.user.id;
  const memberRecord = project.members.find(m => m.userId === session.user.id);
  const memberRole = memberRecord?.role || 'viewer';
  
  const capabilities = {
    canEdit: isOwner || memberRole === 'editor' || session.user.role === 'admin',
    canDelete: isOwner || session.user.role === 'admin',
    canInvite: isOwner || memberRole === 'manager' || session.user.role === 'admin',
    canManageMembers: isOwner || memberRole === 'manager' || session.user.role === 'admin'
  };
  
  return {
    project,
    capabilities,
    memberRole
  };
};
```

## Multi-Factor Authentication (MFA) Protection

Require MFA for sensitive routes:

```typescript
// src/hooks.server.ts
const { handle } = await guardianAuth({
  security: {
    routeProtection: {
      protectedRoutes: {
        '/settings/security': {
          authenticated: true,
          requireMfa: true, // Require MFA
          redirectPath: '/signin'
        },
        '/admin/:section': {
          allowedRoles: ['admin'],
          requireMfa: true, // Require MFA
          redirectPath: '/signin'
        }
      }
    },
    
    twoFactorAuth: {
      enabled: true,
      method: 'totp',
      allowRememberDevice: true,
      rememberDeviceDuration: 30 * 24 * 60 * 60 // 30 days
    }
  }
});
```

## Step-Up Authentication

For sensitive operations, you can implement step-up authentication (re-authentication before critical actions):

```typescript
// src/routes/settings/delete-account/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireRecentAuth } from '$lib/auth';

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.getSession();
  
  if (!session?.user) {
    redirect(302, '/signin');
  }
  
  return {};
};

export const actions = {
  deleteAccount: async ({ request, locals }) => {
    const session = await locals.getSession();
    
    if (!session?.user) {
      return fail(401, { error: 'Unauthorized' });
    }
    
    // Check for recent authentication (within last 15 minutes)
    const recentAuth = await requireRecentAuth(session.user.id, 15);
    
    if (!recentAuth) {
      // Redirect to re-authentication page
      return {
        requireReauth: true,
        nextAction: 'delete-account'
      };
    }
    
    // Proceed with account deletion
    try {
      await deleteUserAccount(session.user.id);
      return redirect(302, '/account-deleted');
    } catch (error) {
      return fail(500, { error: 'Failed to delete account' });
    }
  }
} satisfies Actions;
```

## Time-Based Access Control

Limit access to working hours or specific time periods:

```typescript
const { handle } = await guardianAuth({
  security: {
    routeProtection: {
      protectedRoutes: {
        '/admin/financial-reports': {
          authorize: async ({ user }) => {
            if (!user || user.role !== 'admin') return false;
            
            // Check current time
            const now = new Date();
            const hour = now.getHours();
            const day = now.getDay();
            
            // Only allow access during business hours (9am-5pm, Monday-Friday)
            return day >= 1 && day <= 5 && hour >= 9 && hour < 17;
          },
          redirectPath: '/access-restricted',
          errorMessage: 'Financial reports are only available during business hours (Mon-Fri, 9am-5pm).'
        }
      }
    }
  }
});
```

## IP-Based Restrictions

Restrict access to certain IP ranges:

```typescript
const { handle } = await guardianAuth({
  security: {
    routeProtection: {
      protectedRoutes: {
        '/admin/system': {
          authorize: async ({ user, request }) => {
            if (!user || user.role !== 'admin') return false;
            
            // Get client IP
            const clientIp = request.headers.get('x-forwarded-for') || 
              request.headers.get('x-real-ip');
            
            // Check if IP is in allowed range (example with simplified check)
            const allowedIps = ['192.168.1.1', '10.0.0.1'];
            const ipMatches = allowedIps.includes(clientIp);
            
            // Or use an IP range checking library for more complex cases
            return ipMatches;
          },
          redirectPath: '/unauthorized',
          errorMessage: 'Admin system access is restricted to office IP addresses.'
        }
      }
    }
  }
});
```

## Content-Based Access Control

Protect specific content dynamically:

```typescript
// src/routes/documents/[documentId]/+page.server.ts
export const load: PageServerLoad = async ({ params, locals }) => {
  const session = await locals.getSession();
  
  if (!session?.user) {
     redirect(302, '/signin');
  }
  
  const documentId = params.documentId;
  
  // Load the document
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      accessRights: true,
      owner: true
    }
  });
  
  if (!document) {
    error(404, 'Document not found');
  }
  
  // Check access rights
  const canAccess = 
    session.user.role === 'admin' || 
    document.ownerId === session.user.id ||
    document.accessRights.some(right => 
      right.userId === session.user.id && 
      (right.accessLevel === 'view' || right.accessLevel === 'edit')
    );
  
  if (!canAccess) {
      error(403, 'You do not have permission to view this document');
  }
  
  // Check edit rights separately
  const canEdit = 
    session.user.role === 'admin' || 
    document.ownerId === session.user.id ||
    document.accessRights.some(right => 
      right.userId === session.user.id && 
      right.accessLevel === 'edit'
    );
  
  return {
    document,
    permissions: {
      canEdit,
      canDelete: session.user.role === 'admin' || document.ownerId === session.user.id,
      canShare: session.user.role === 'admin' || document.ownerId === session.user.id
    }
  };
};
```

## Creating an Authorization Service

For complex applications, create a dedicated authorization service:

```typescript
// src/lib/services/authorization.ts
type Resource = 'document' | 'project' | 'user' | 'setting';
type Action = 'read' | 'create' | 'update' | 'delete' | 'share' | 'publish';

export class AuthorizationService {
  constructor(private readonly prisma: any) {}
  
  async can(userId: string, action: Action, resource: Resource, resourceId?: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    
    if (!user) return false;
    
    // Admin override
    if (user.role === 'admin') return true;
    
    // Resource-specific checks
    switch (resource) {
      case 'document':
        return this.canAccessDocument(userId, action, resourceId);
      case 'project':
        return this.canAccessProject(userId, action, resourceId);
      case 'user':
        return this.canAccessUser(userId, action, resourceId);
      default:
        return false;
    }
  }
  
  private async canAccessDocument(userId: string, action: Action, documentId: string): Promise<boolean> {
    if (!documentId) return false;
    
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      select: {
        ownerId: true,
        accessRights: {
          where: { userId },
          select: { accessLevel: true }
        }
      }
    });
    
    if (!document) return false;
    
    // Owner can do anything
    if (document.ownerId === userId) return true;
    
    // Check access rights for non-owners
    if (document.accessRights.length === 0) return false;
    
    const accessLevel = document.accessRights[0].accessLevel;
    
    switch (action) {
      case 'read':
        return accessLevel === 'view' || accessLevel === 'edit';
      case 'update':
        return accessLevel === 'edit';
      case 'share':
      case 'delete':
        return false; // Only owner can delete or share
      default:
        return false;
    }
  }
  
  private async canAccessProject(userId: string, action: Action, projectId: string): Promise<boolean> {
    // Similar implementation for projects
    // ...
  }
  
  private async canAccessUser(userId: string, action: Action, targetUserId: string): Promise<boolean> {
    // Users can read and update themselves
    if (action === 'read' || action === 'update') {
      return userId === targetUserId;
    }
    
    // Only admins can delete users (handled by admin check in main method)
    return false;
  }
}

// Create and export instance
import { prisma } from '$lib/database';
export const authz = new AuthorizationService(prisma);
```

Using the authorization service:

```typescript
// In page server load function
import { error, redirect } from '@sveltejs/kit';
import { authz } from '$lib/services/authorization';

export const load: PageServerLoad = async ({ params, locals }) => {
  const session = await locals.getSession();
  
  if (!session?.user) {
     redirect(302, '/signin');
  }
  
  const documentId = params.documentId;
  
  // Check access
  const canView = await authz.can(session.user.id, 'read', 'document', documentId);
  if (!canView) {
     error(403, 'Access denied');
  }
  
  // Additional permission checks
  const [canEdit, canDelete, canShare] = await Promise.all([
    authz.can(session.user.id, 'update', 'document', documentId),
    authz.can(session.user.id, 'delete', 'document', documentId),
    authz.can(session.user.id, 'share', 'document', documentId)
  ]);
  
  // Load document
  const document = await prisma.document.findUnique({
    where: { id: documentId }
  });
  
  return {
    document,
    permissions: {
      canEdit,
      canDelete,
      canShare
    }
  };
};
```

## Best Practices

1. **Defense in Depth**: Implement security at multiple layers
2. **Fail Secure**: Default to denying access when checks fail
3. **Least Privilege**: Grant only the minimum necessary permissions
4. **Audit Access**: Log access attempts and authorization decisions
5. **Keep It Simple**: Start with simple rules and add complexity only as needed
6. **Consistent Interface**: Use the same authorization patterns across your app
7. **Test Thoroughly**: Create tests for authorization logic

## Related

- [Role-Based Authorization](./role-based-authorization.md)
- [Session Management](../getting-started/session-management.md)
- [Two-Factor Authentication](./two-factor-auth.md)
