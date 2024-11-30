import { guardianAuth } from '$lib';

export const {handle, middleware, signIn, signOut} = guardianAuth({
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
    protectedRoutes:['/admin', '/protect'],
    redirectUrl:'/'
  }
});