import type { Handle } from '@sveltejs/kit';
import type { AuthConfig } from '@auth/core/types';
import { SvelteKitAuth } from '@auth/sveltekit';
import { encode, decode } from '@auth/core/jwt';
import { createProviders, type AuthProvider } from './providers.js';
import { getAdapter } from '../adapter.js';
import { createMiddleware } from './middleware.js';
import { createEventHandlers } from './events.js';
import { type GuardianAuthConfig, DefaultGuardianAuthConfig } from '../types/config.js';
import { createLogger } from './logger.js';
import { AUTH_SECRET } from '$env/static/private';
import { hashPassword } from '../utils/security.js';
import { validatePassword } from '../utils/validation.js';
import type { RequestEvent } from '../../routes/$types.js';

export class GuardianAuth {
	private config: GuardianAuthConfig;
	private logger;
	private adapter;

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
		return createProviders(this.config.providers, this.adapter);
	}

	// Create authentication middleware
	private createMiddleware(): Handle {
		return createMiddleware(this.config.security);
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
			throw new Error("You must add a databse when setting sessionStrategy to 'database'");
		}

		const response = SvelteKitAuth((event: RequestEvent) => {
			const authConfig: AuthConfig = {
				adapter,
				providers,
				events: createEventHandlers(this.config.events, this.logger),
				callbacks: {
					async session(data) {
						const { session, user } = data;
						console.log('sesson data', data);
						session.user.id = user.id;
						session.user.name = user.name;
						session.user.role = user.role;

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
						console.log(data);
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
				trustHost: true,
				secret
			};

			return authConfig;
		});

		const createUser = async (data) => {
			try {
				const passwordPolicy = this.config.security?.passwordPolicy
				const validPassword = validatePassword(data.password, passwordPolicy)
				if(!validPassword?.success) return {success:false, error: validPassword.message}

				const hashedPassword = await hashPassword(data.password);
				
				const user = await adapter.createUser({ ...data, password: hashedPassword });

				const account = await adapter.linkAccount({
					userId: user.id,
					type: 'credentials',
					provider: 'credentials',
					providerAccountId: user.id
				});
				return {success: true, user};
			} catch (error) {
				this.logger.error('Unable to create user', error);
			throw new Error(error)
			
			return {
			  success:false,
			  error: 'errorMessages', 
			};

			}
		};

		return {
			...response,
			createUser,
			middleware
		};
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
