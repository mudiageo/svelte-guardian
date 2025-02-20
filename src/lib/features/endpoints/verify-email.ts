import { getVerifyEmailActions } from '../email-verification';
import { convertEventRequestBodyFromJsonToFormData } from '$lib/utils';
import type { RequestEvent } from '../../../routes/$types';
import type { Adapter } from '@auth/core/adapters';
import type { EmailProviderConfig } from '$lib/email/types';
import type { EmailVerificationOptions } from '$lib/types/config';

export const getVerifyEmailEndpoints = (
	options: EmailVerificationOptions,
	adapter: Adapter,
	emailProviderConfig: EmailProviderConfig
) => {
	return {
		'POST:/auth/verify-email/send-otp': async (event: RequestEvent) => {
			const updatedEvent = await convertEventRequestBodyFromJsonToFormData(event);

			return getVerifyEmailActions(options, adapter, emailProviderConfig).sendOTP(updatedEvent);
		},

		'POST:/auth/verify-email/verify-otp': async (event: RequestEvent) => {
			const updatedEvent = await convertEventRequestBodyFromJsonToFormData(event);

			return getVerifyEmailActions(options, adapter, emailProviderConfig).verifyOTP(updatedEvent);
		},

		'POST:/auth/verify-email/magic-link': async (event: RequestEvent) => {
			const updatedEvent = await convertEventRequestBodyFromJsonToFormData(event);

			return getVerifyEmailActions(options, adapter, emailProviderConfig).sendMagicLink(
				updatedEvent
			);
		}
	};
};
