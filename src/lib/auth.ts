import { guardianAuth, type GuardianAuthConfig } from '$lib';
import { env } from '$env/dynamic/private';
import { building } from '$app/environment'
import { PrismaClient } from '@prisma/client';
import { PrismaAdapter } from '@auth/prisma-adapter';
const prisma = new PrismaClient();
const adapter = PrismaAdapter(prisma);

export const { handle, signIn, signOut, middleware, createUser } = await guardianAuth({
	database: {
		type: 'custom',
		adapter
	},
	providers: {
		google: {
			enabled: true
		},
		credentials: {
			additionalUserFields: ['role'],
			allowRegistration: true,
			requireEmailVerification: true
		}
	},
	security: {
		maxLoginAttempts: 5,
		lockoutDuration: 15 * 60 * 1000, // 15 minutes
		emailVerification: {
			method: 'otp',
			otpLength: 6,
			otpExpiration: 15 // in minutes
		},
		passwordReset: {
			tokenExpiration: 15
		},
		twoFactorAuth: {
			method: 'totp',
			allowBackupCodes: true,
			backupCodeCount: 5
		},
		emailProvider: {
			type: 'nodemailer',
			service: 'gmail',
			from: 'Your Company <your-email@gmail.com>',
			auth: {
				method: 'app-password',
				user: building ? '' : env.GMAIL_USER,
				appPass: building ? '' : env.GMAIL_APP_PASSWORD 
			}
		},
		routeProtection: {
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
			roleKey: 'role'
		}
	},
	pages: {
		signIn: '/signin'
	}
} satisfies GuardianAuthConfig);
