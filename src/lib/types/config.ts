import type { User } from './user';
import type { LoggerConfig } from '../core/logger';

export interface ProviderConfig {
  enabled: boolean;
  clientId?: string;
  clientSecret?: string;
}

export interface SecurityConfig {
  level: 'strict' | 'moderate' | 'relaxed';
  protectedRoutes: string[];
  redirectUrl: string;
  maxLoginAttempts: number;
  lockoutDuration: number;
  twoFactor: {
    enabled: boolean;
    method?: 'totp' | 'email' | 'sms';
  };
}

export interface EventHandlers {
  onSignIn?: (user: User) => Promise<void>;
  onRegistration?: (user: User) => Promise<void>;
  onPasswordReset?: (user: User) => Promise<void>;
}

export interface GuardianAuthConfig {
  providers: {
    google?: ProviderConfig;
    github?: ProviderConfig;
    credentials?: ProviderConfig & {
      allowRegistration?: boolean;
    };
  };
  security: SecurityConfig;
  events?: EventHandlers;
  logging: LoggerConfig;
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
    lockoutDuration: 15 * 60 * 1000,
    twoFactor: {
      enabled: false
    }
  },
  events: {},
  logging: {
    level: 'info',
    destinations: [
      { type: 'console' }
    ]
  }
};