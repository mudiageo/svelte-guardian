import type { User } from './user';
import type { LoggerConfig } from '../core/logger';
import type { DatabaseConfig } from '../database';

export interface ProviderConfig {
	enabled: boolean;
	clientId?: string;
	clientSecret?: string;
}

export interface SecurityConfig {
	level: 'strict' | 'moderate' | 'relaxed';
	maxLoginAttempts?: number;
	lockoutDuration?: number; // in ms
	twoFactor?: {
		enabled: boolean;
		method?: 'totp' | 'email' | 'sms';
	};
	// Route protection configuration
	routeProtection?: {
		// Define which routes are accessible by user based on role or if authenticated 
		protectedRoutes?: {
        [route: string]: {
            allowedRoles?: string[];
            authenticated?: boolean;
            redirectPath?: string;
        };
    };
    //Define which routes are inaccessible by authenticated users
    publicRoutes?: {
        [route: string]: {
            redirectPath?: string;
        };
    };
		

		//Global fallback redirect for unauthorized access
		redirectPath?: string;
		//Global redirect path for authenticated users accessing public routes
		authenticatedRedirect?: string;
		
		//Custom session object path for user roles (default: 'role')
    roleKey?: string;

	};
	passwordPolicy?: {
		minLength?: number;
		maxLength?: number;
		requireUppercase?: boolean | number;
		requireLowercase?: boolean | number;
		requireNumbers?: boolean | number;
		requireSpecialChars?: boolean | number;
		//Define custom special characters set
		specialChars?: string;
	};
}

export interface EventHandlers {
	onSignIn?: (user: User) => Promise<void>;
	onRegistration?: (user: User) => Promise<void>;
	onPasswordReset?: (user: User) => Promise<void>;
}

export interface GuardianAuthConfig {
	database?: DatabaseConfig;
	providers: {
		google?: ProviderConfig;
		github?: ProviderConfig;
		credentials?: ProviderConfig & {
			passwordless?: boolean;
			additionalUserFields?: string[]; // Additional fields to pass to session.user
			allowRegistration?: boolean; // Handle new user registration internally
		};
	};
	security: SecurityConfig;
	events?: EventHandlers;
	logging: LoggerConfig;

	// Advanced Configurations
	advanced?: {
		sessionStrategy?: 'jwt' | 'database';
		tokenEncryption?: boolean;
		rateLimiting?: {
			enabled: boolean;
			requestsPerMinute?: number;
		};
	};
}

export const DefaultGuardianAuthConfig: GuardianAuthConfig = {
	providers: {
		credentials: {
			enabled: true,
			allowRegistration: true
		}
	},
	security: {
		level: 'moderate',
		maxLoginAttempts: 5,
		lockoutDuration: 15 * 60 * 1000, // 15 minutes
		twoFactor: {
			enabled: false
		},
		passwordPolicy: {
			minLength: 12,
			requireUppercase: true,
			requireNumbers: true,
			requireSpecialChars: true
		}
	},
	events: {},
	logging: {
		enabled: true,
		level: 'info',
		destinations: [{ type: 'console' }]
	}
};
