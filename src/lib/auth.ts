import { guardianAuth, type GuardianAuthConfig } from '$lib';

export const { handle, signIn, signOut, middleware, createUser } = await guardianAuth({
	providers: {
		google: {
			enabled: true,
			strict: true
		},
		credentials: {
			enabled: true,
			allowRegistration: true
		}
	},
	security: {
		maxLoginAttempts: 5,
		lockoutDuration: 15 * 60 * 1000, // 15 minutes
		requireEmailVerification: true,
		protectedRoutes: ['/admin', '/protect'],
		redirectUrl: '/'
	}
} satisfies GuardianAuthConfig);
