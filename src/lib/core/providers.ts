import GoogleProvider from '@auth/core/providers/google';
import GitHubProvider from '@auth/core/providers/github';
import CredentialsProvider from '@auth/core/providers/credentials';
import type { Provider } from '@auth/core/providers';
import type { GuardianAuthConfig } from '../types/config';
import { validateCredentials } from '../utils/validation';
import { verifyPassword } from '../utils/security';
import {prisma} from '../db';

export type AuthProvider = Provider;

export function createProviders(
  providerConfig: GuardianAuthConfig['providers']
): AuthProvider[] {
  const providers: AuthProvider[] = [];

  // Google Provider
  if (providerConfig.google?.enabled) {
    providers.push(GoogleProvider({
      clientId: providerConfig.google.clientId,
      clientSecret: providerConfig.google.clientSecret,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline'
        }
      }
    }));
  }

  // GitHub Provider
  if (providerConfig.github?.enabled) {
    providers.push(GitHubProvider({
      clientId: providerConfig.github.clientId,
      clientSecret: providerConfig.github.clientSecret
    }));
  }

  // Credentials Provider
  if (providerConfig.credentials?.enabled) {
    providers.push(CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const { email, password } = credentials;

        // Validate credentials
        const isValidCredentials = validateCredentials(email, password)
        if(!isValidCredentials){
          console.log(isValid)
          throw new Error('Invalid credentials');
        }

        // Find user and verify password
        const user = await prisma.user.findUnique({ 
          where: { email } 
        });

        if (!user) {
          throw new Error('User not found');
        }
      const isValidPassword = await verifyPassword(user.password, password);
 
 if(!isValidPassword)  return null
 
         // Password validation would happen here with proper hashing
        return {
          id: user.id,
          email: user.email,
          role: user.role
        };
      }
    }));
  }

  return providers;
}
