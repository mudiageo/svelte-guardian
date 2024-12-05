import { guardianAuth, type GuardianAuthConfig } from '$lib';
import { PrismaClient } from '@prisma/client';
import { PrismaAdapter } from '@auth/prisma-adapter';
const prisma = new PrismaClient();
const adapter = PrismaAdapter(prisma);

export const getUserByEmail = async (email) => {
	return prisma.user.findUnique({ where: { email } });
};

export const { handle, signIn, signOut, middleware, createUser } = await guardianAuth({
	database: {
		type: 'custom',
		adapter,
		getUserByEmail
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
		routeProtection: {
			protectedRoutes: ['/protect', '/admin'],
			unauthorizedRedirect: '/'
		}
	}
} satisfies GuardianAuthConfig);
