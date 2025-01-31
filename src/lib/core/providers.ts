import GoogleProvider from '@auth/core/providers/google';
import GitHubProvider from '@auth/core/providers/github';
import CredentialsProvider from '@auth/core/providers/credentials';
import type { Provider } from '@auth/core/providers';
import type { Adapter } from "@auth/core/adapters"
 
import type { GuardianAuthConfig } from '../types/config.js';
import { validateCredentials } from '../utils/validation.js';
import { verifyPassword } from '../utils/security.js';
import { AuthenticationError } from './errors.js'
export type AuthProvider = Provider;

export function createProviders(
	providerConfig: GuardianAuthConfig['providers'],
	securityConfig: GuardianAuthConfig['security'],
	adapter: Adapter
): AuthProvider[] {
	const providers: AuthProvider[] = [];

	// Google Provider
	if (providerConfig.google?.enabled) {
		providers.push(
			GoogleProvider({
				clientId: providerConfig.google.clientId,
				clientSecret: providerConfig.google.clientSecret,
				authorization: {
					params: {
						prompt: 'consent',
						access_type: 'offline',
						response_type: 'code'
					}
				}
			})
		);
	}

	// GitHub Provider
	if (providerConfig.github?.enabled) {
		providers.push(
			GitHubProvider({
				clientId: providerConfig.github.clientId,
				clientSecret: providerConfig.github.clientSecret
			})
		);
	}

	// Credentials Provider
	if (providerConfig.credentials?.enabled !== false) {
		const config: GuardianAuthConfig['providers']['credentials'] = providerConfig.credentials;

		providers.push(
			CredentialsProvider({
				name: 'Credentials',
				credentials: {
					email: { label: 'Email', type: 'email' },
					password: { label: 'Password', type: 'password' }
				},
				async authorize(credentials) {
					const { email, password } = credentials;

					// Validate credentials
					const isValidCredentials = validateCredentials(email, password);
					if (!isValidCredentials) {
						throw new AuthenticationError('Invalid credentials');
					}

					// Find user and verify password
					const user = await adapter.getUserByEmail(email);

					if (!user) {
						throw new AuthenticationError('User not found');
					}

      // Check account lock status
      if (user.isLocked && user.lockUntil.getTime() > Date.now()) {
        throw new AuthenticationError('Account is temporarily locked')
      }
					const isValidPassword = await verifyPassword(user.password, password);

					
     if (!isValidPassword) {
        // Increment login attempts and potentially lock account
       
        handleFailedLoginAttempt(user)
        throw new AuthenticationError('Invalid email or password')
      }
					// Prepare user object for session
					const sessionUser = {
						id: user.id,
						email: user.email,
						name: user.name
					};

					// Add custom fields if specified
					if (config?.additionalUserFields) {
						config.additionalUserFields.forEach((field) => {
							if (user[field] !== undefined) {
								sessionUser[field] = user[field];
							}
						});
					}


    // Reset login attempts on successful login amd  Update last login
      const updatedData = { 
          id: user.id,
          isLocked: false,
          lockUntil: null,
          lastLoginAt: new Date(),
          loginAttempts: 0
      }
      const updatedUser = await adapter.updateUser(updatedData)
      
					return {...sessionUser, ...updatedData};
				}
			})
		);
	}

	return providers;
	




 // Handle failed login attempts
  async function handleFailedLoginAttempt(user: any) {
    const maxLoginAttempts = securityConfig.maxLoginAttempts || 5
    const lockDuration = securityConfig.lockoutDuration || 15 * 60 * 1000 // 15 minutes

    const updatedUser = await adapter.updateUser({
        id: user.id,
        loginAttempts: user.loginAttempts + 1 ,
        isLocked: user.loginAttempts + 1 >= maxLoginAttempts,
        lockUntil: user.loginAttempts + 1 >= maxLoginAttempts 
          ? new Date(Date.now() + lockDuration) 
          : null
    })

    return updatedUser
  }


  // Send email verification
   async function sendVerificationEmail(user: any) {
    // TODO Implement email verification logic
    // Use Nodemailer.
  }

  // Password reset functionality
  async function initiatePasswordReset(email: string) {
    const user = await adapter.getUserByEmail(email)

    if (!user) {
      throw new AuthenticationError('No account found with this email')
    }

    const resetToken = uuidv4()
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    await adapter.updateUser({ 
        id: user.id,
        passwordResetToken: resetToken,
        passwordResetExpiry: resetTokenExpiry
      })

    // Send password reset email with resetToken
    await sendPasswordResetEmail(user, resetToken)
  }

  function  sendPasswordResetEmail(user: any, token: string) {
    // TODO Implement email sending logic
  }
}