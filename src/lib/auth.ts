import { guardianAuth, type GuardianAuthConfig } from '$lib';
import { PrismaClient } from '@prisma/client';
import {PrismaAdapter} from '@auth/prisma-adapter';
const prisma = new PrismaClient()
const adapter = PrismaAdapter(prisma)


export const { handle, signIn, signOut, middleware, createUser } = await guardianAuth({
  database: {
    type: 'custom',
    adapter
  },
	providers: {
		google: {
			enabled: true,
			strict: true
		},
		credentials: {
			additionalUserFields: ['role'],
			allowRegistration: true
		}
	},
	security: {
		maxLoginAttempts: 5,
		lockoutDuration: 15 * 60 * 1000, // 15 minutes
		requireEmailVerification: true,
    protectedRoutes: {
        '/admin': { 
            allowedRoles: ['admin', 'superadmin'],
            redirectPath: '/signin'
        },
        '/dashboard': {
            authenticated: true,
            redirectPath: '/signin'
        }
    },
    publicRoutes: {
        '/signin': {
            redirectPath: '/dashboard'
        },
        '/signup': {}
    },
    redirectPath: '/default-unauthorized',
    authenticatedRedirect: '/dashboard',
    roleKey: 'role',
	}
} satisfies GuardianAuthConfig);
