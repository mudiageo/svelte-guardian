import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

import { guardianAuth, type GuardianAuthConfig } from '$lib';

export const { handle, signIn, signOut, middleware, createUser } = await guardianAuth({
	database: {type: 'prisma', client: prisma},
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
		routeProtection: {
			protectedRoutes: ['/protect','/admin'],
			unauthorizedRedirect: '/'
		}
	},
	advanced: {
		sessionStrategy: 'jwt'
	}
} satisfies GuardianAuthConfig);
