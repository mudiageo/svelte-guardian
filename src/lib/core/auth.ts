import type { Handle } from '@sveltejs/kit';
import type { SvelteKitAuthConfig } from '@auth/sveltekit';
import { SvelteKitAuth } from '@auth/sveltekit';
import { encode, decode } from '@auth/core/jwt';
import { createProviders, type AuthProvider } from './providers';
import { getAdapter } from '../adapter';
import { createMiddleware } from './middleware';
import { createEventHandlers } from './events';
import { type GuardianAuthConfig, DefaultGuardianAuthConfig } from '../types/config';
import { createLogger } from './logger';
import { AUTH_SECRET } from '$env/static/private';
import { hashPassword } from '../utils/security';
import { validatePassword, isValidSecurityConfig } from '../utils/validation';
import { getVerifyEmailActions } from '../features/email-verification';
import type { RequestEvent } from '../../routes/$types';

import { RegistrationError, ConfigError } from './errors';
import type { Adapter } from '@auth/core/adapters';

export class GuardianAuth {
	private config: GuardianAuthConfig;
	private logger;
	private adapter: Adapter | null;

	constructor(userConfig: Partial<GuardianAuthConfig> = {}) {
		// Merge user config with default config
		this.config = {
			...DefaultGuardianAuthConfig,
			...userConfig
		};

		// Initialize logger
		this.logger = createLogger(this.config.logging);
	}

	// Create authentication providers
	private createProviders(): AuthProvider[] {
		return createProviders(this.config.providers, this.config.security, this.adapter);
	}

	// Create authentication middleware
	private createMiddleware(): Handle {
		return createMiddleware(this.config.security, this.adapter);
	}

	// Initialize authentication
	public async init() {
		//Get adapter
		this.adapter = await getAdapter(this.config.database);
		const providers = this.createProviders();
		const adapter = this.adapter;
		const middleware = this.createMiddleware();
		const secret = AUTH_SECRET || crypto.randomUUID();
		// Log initialization
		this.logger.info('Initializing...', {
			providers: providers.map((p) => p.name),
			securityLevel: this.config.security.level
		});
		//Checks

		let sessionStrategy = this.config.advanced?.sessionStrategy || 'database';

		//If session strategy is not set, and config databse is not set, default to jwt
		if (!this.config.advanced?.sessionStrategy && !this.config.database) {
			sessionStrategy = 'jwt';
		}

		//If session strategy is databse rewuire databse config
		if (sessionStrategy === 'database' && !this.config.database) {
			throw new ConfigError(
				"You must configure a database in config.database when setting config.advanced.sessionStrategy to 'database'."
			);
		}
		// Validate SecurityConfignfor emailconfig
		if (!isValidSecurityConfig(this.config.security))
			throw new ConfigError(
				'config.security.emailProvider is rrquired when config.security.emailVerification, passwordReset, or twoFactorAuth options are set.'
			);

		const response = SvelteKitAuth((event: RequestEvent) => {
			const authConfig: SvelteKitAuthConfig = {
				adapter,
				providers,
				events: createEventHandlers(this.config.events, this.logger),
				callbacks: {
					async session(data) {
						const { session, user, token } = data;
						if (sessionStrategy === 'jwt') {
							if (token.sub && session.user) {
								session.user.id = token.sub;
							}

							if (token.role && session.user) {
								session.user.role = token.role;
							}

							if (session.user) {
								session.user.isOAuth = token.isOAuth;
								session.user.isTwoFactorEnabled = token.isTwoFactorEnabled;
								session.user.name = token.name;
								session.user.email = token.email;
							}
						} else {
							session.user.id = user.id;
							session.user.name = user.name;
							session.user.email = user.email;
							session.user.role = user.role;
						}
						return session;
					},
					async jwt({ token, user }) {
						if (user) {
							token.id = user.id;
							token.name = user.name;
							token.role = user.role;
						}
						return token;
					},
					async signIn(data) {
						const { user, credentials } = data;
						// Check if this sign in callback is being called in the credentials authentication flow.
						// If so,  create a session entry in the database
						if (credentials && credentials.email && credentials.password) {
							if (user) {
								const sessionToken = crypto.randomUUID();
								// Set expiry to 30 days
								const sessionExpiry = new Date(Date.now() + 60 * 60 * 24 * 30 * 1000);
								await adapter.createSession({
									sessionToken: sessionToken,
									userId: user.id,
									expires: sessionExpiry
								});

								console.log('sesiion created');
								event.cookies.set('authjs.session-token', sessionToken, {
									expires: sessionExpiry,
									path: '/'
								});
							}
						}

						return true;
					}
				},
				jwt: {
					// Add a callback to the encode method to return the session token from a cookie
					// when in the credentials provider callback flow.
					encode: async (params) => {
						if (
							event.url.pathname?.includes('callback') &&
							event.url.pathname?.includes('credentials') &&
							event.request.method === 'POST'
						) {
							// Get the session token cookie
							const cookie = event.cookies.get('authjs.session-token');
							// Return the cookie value, or an empty string if it is not defined
							return cookie ?? '';
						}
						// Revert to default behaviour when not in the credentials provider callback flow
						return encode(params);
					},
					decode: async (params) => {
						if (
							event.url.pathname?.includes('callback') &&
							event.url.pathname?.includes('credentials') &&
							event.request.method === 'POST'
						) {
							return null;
						}

						// Revert to default behaviour when not in the credentials provider callback flow
						return decode(params);
					}
				},
				session: {
					strategy: sessionStrategy,
					maxAge: 60 * 60 * 24 * 30, // 30 days
					updateAge: 60 * 60 * 24, // 24 hours
					generateSessionToken: () => {
						return crypto.randomUUID();
					}
				},
				debug: true,
				trustHost: true, //TODO link to environment variable and explore other options
				secret
			};

			if (this.config.pages) authConfig.pages = this.config.pages;

			return authConfig;
		});

		const createUser = async (data) => {
			try {
				const passwordPolicy = this.config.security?.passwordPolicy;
				const validPassword = validatePassword(data.password, passwordPolicy);
				if (!validPassword?.success) return { success: false, error: validPassword.message };

				// Check if user already exists
				const existingUser = await adapter.getUserByEmail(data.email);

				if (existingUser) {
					return { success: false, error: 'User with this email already exists' };
				}

				const hashedPassword = await hashPassword(data.password);

				const user = await adapter.createUser({
					...data,
					password: hashedPassword,
					emailVerified: null,
					lastLoginAt: null,
					loginAttempts: 0,
					isLocked: false
				});

				await adapter.linkAccount({
					userId: user.id,
					type: 'credentials',
					provider: 'credentials',
					providerAccountId: user.id
				});
				// TODO  send verification email

				if (this.config?.providers?.credentials?.requireEmailVerification) {
					if (this.config?.security?.emailVerification?.enabled === false)
						return { success: true, user };

					const { sendOTP } = await getVerifyEmailActions(
						this.config?.security?.emailVerification,
						this.adapter,
						this.config?.security?.emailProvider
					);

					const formData = new FormData();
					formData.append('email', user.email);

					const request = new Request(new URL('https://localhost:3211'), {
						method: 'POST',
						body: formData
					});

					const result = await sendOTP({ request });
					console.log(result);
					if (result.success === false) return result;
				}
				return { success: true, user };
			} catch (error) {
				this.logger.error('Unable to create user', error);
				throw new RegistrationError(error);

				return {
					success: false,
					error: 'errorMessages'
				};
			}
		};
		let hooksAndActions = {
			...response,
			middleware,
			createUser
		};

		if (this.config?.security?.emailVerification) {
			const verifyEmailActions = await getVerifyEmailActions(
				this.config?.security?.emailVerification,
				this.adapter,
				this.config?.security?.emailProvider
			);
			hooksAndActions = { ...hooksAndActions, verifyEmailActions };
		}

		return hooksAndActions;
	}

	// Advanced methods for runtime configuration
	public updateConfig(newConfig: Partial<GuardianAuthConfig>) {
		this.config = {
			...this.config,
			...newConfig
		};
		this.logger.info('Auth configuration updated', newConfig);
	}
}

// Singleton export for ease of use
export const guardianAuth = (config?: Partial<GuardianAuthConfig>) =>
	new GuardianAuth(config).init();
