import GoogleProvider from '@auth/core/providers/google';
import GitHubProvider from '@auth/core/providers/github';
import CredentialsProvider from '@auth/core/providers/credentials';
import type { Provider } from '@auth/core/providers';
import type { GuardianAuthConfig } from '../types/config.js';
import { validateCredentials } from '../utils/validation.js';
import { verifyPassword } from '../utils/security.js';
import { getUserByEmail } from '../database.js';
import type { DatabaseConfig } from '$lib/database.js';

export type AuthProvider = Provider;

export function createProviders(
	providerConfig: GuardianAuthConfig['providers'],
	databaseConfig: DatabaseConfig
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
						console.log(isValidCredentials);
						throw new Error('Invalid credentials');
					}

					// Find user and verify password
					const user = await getUserByEmail(databaseConfig, email);

					if (!user) {
						throw new Error('User not found');
					}
					const isValidPassword = await verifyPassword(user.password, password);

					if (!isValidPassword) return null;

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
					// Password validation would happen here with proper hashing
					return sessionUser;
				}
			})
		);
	}

	return providers;
}
