import { getVerifyEmailEndpoints } from './verify-email';
import { getResetPasswordEndpoints } from './reset-password';
import type { EmailProviderConfig } from '../../email/types';
import type { SecurityConfig } from '../../types/config';
import type { Adapter } from '@auth/core/adapters';

export const getEndpoints = (
	securityConfig: SecurityConfig,
	adapter: Adapter,
	emailProviderConfig: EmailProviderConfig
) => {
	return {
		...getVerifyEmailEndpoints(securityConfig.emailVerification, adapter, emailProviderConfig),
		...getResetPasswordEndpoints(
			securityConfig.passwordReset,
			adapter,
			emailProviderConfig,
			securityConfig.passwordPolicy
		)
	};
};
