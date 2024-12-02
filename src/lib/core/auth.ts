import type { Handle } from '@sveltejs/kit';
import { SvelteKitAuth } from '@auth/sveltekit';
import { encode, decode } from '@auth/core/jwt';
import { adapter } from '../adapter';
import { 
  createProviders, 
  type AuthProvider 
} from './providers';
import { getAdapter } from '../adapter'
import { 
  createMiddleware 
} from './middleware';
import { 
  createEventHandlers 
} from './events';
import { 
  GuardianAuthConfig, 
  DefaultGuardianAuthConfig 
} from '../types/config';
import { createLogger } from './logger';
import { AUTH_SECRET } from '$env/static/private';

export class GuardianAuth {
  private config: GuatdianAuthConfig;
  private logger;

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
    return createProviders(this.config.providers);
  }

  // Create authentication middleware
  private createMiddleware(): Handle {
    return createMiddleware(this.config.security);
  }
  private getAdapter() {
    return getAdapter(this.config.database);
  }

  // Initialize authentication
  public async init() {
    const providers = this.createProviders();
    const adapter = this.getAdapter();
   const middleware = this.createMiddleware();
   const secret = AUTH_SECRET
    // Log initialization
    this.logger.info('Initializing Svelte Guardian Auth', {
      providers: providers.map(p => p.name),
      securityLevel: this.config.security.level
    });
    const event = null
    
const response = await SvelteKitAuth( event => {
  
  return {
        adapter,
        providers,
        events: createEventHandlers(this.config.events, this.logger),
        callbacks: {
       async session({ session, user }) {
          try{
            session.user.id = user.id;
            session.user.role = user.role;
          
            return session;
            
          } catch(e){
            console.log(e)
          }
          }, 
      async signIn({ user, credentials }) {
                // Check if this sign in callback is being called in the credentials authentication flow.
                // If so,  create a session entry in the database
                if (credentials && credentials.email && credentials.password) {
                    if (user) {

                      const sessionToken = crypto.randomUUID();
                        // Set expiry to 30 days
                        const sessionExpiry = new Date(Date.now() + 60 * 60 * 24 * 30 * 1000);
                      console.log("sesiion created")
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
            strategy: 'database',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            updateAge: 60 * 60 * 24, // 24 hours
            generateSessionToken: () => {
                return crypto.randomUUID();
            }
        },
        debug:true,
        secret
      }
      
      })
 const handle = async ({event, resolve}) => {
  event.cookies.set("me", "john", {path:'/'})

  return response.handle({event, resolve})
}
    return {
      ...response,
      handle,
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
  new GuardianAuth(config).init()
