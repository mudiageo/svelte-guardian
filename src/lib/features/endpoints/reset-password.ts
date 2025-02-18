import { getResetPasswordActions } from '../password-reset';
import { convertEventRequestBodyFromJsonToFormData } from '$lib/utils';
import type { Adapter } from '@auth/core/adapters';
import type { PasswordResetOptions, SecurityConfig } from '$lib/types/config';
import type { EmailProviderConfig } from '$lib/email/types';
import type { RequestEvent } from '../../../routes/$types';

export const getResetPasswordEndpoints = (
	options: PasswordResetOptions,
	adapter: Adapter,
	emailProviderConfig: EmailProviderConfig,
	passwordPolicy: SecurityConfig['passwordPolicy']
) => {
	return {
		'POST:/auth/reset-password/initiate-reset': async (event: RequestEvent) => {
			const updatedEvent = await convertEventRequestBodyFromJsonToFormData(event);

			return getResetPasswordActions(
				options,
				adapter,
				emailProviderConfig,
				passwordPolicy
			).initiateReset(updatedEvent);
		},

		'POST:/auth/reset-password/reset': async (event: RequestEvent) => {
			const updatedEvent = await convertEventRequestBodyFromJsonToFormData(event);

			return getResetPasswordActions(
				options,
				adapter,
				emailProviderConfig,
				passwordPolicy
			).resetPassword(updatedEvent);
		}
	};
};
