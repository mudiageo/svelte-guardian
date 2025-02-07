import { getVerifyEmailActions } from '../email-verification';
import { convertEventRequestBodyFromJsonToFormData } from '../../utils';
export const getVerifyEmailEndpoints = (options, adapter, emailProviderConfig) => {
	return {
		'POST:/auth/verify-email/send-otp': async (event) => {
			const updatedEvent = await convertEventRequestBodyFromJsonToFormData(event);

			return getVerifyEmailActions(options, adapter, emailProviderConfig).sendOTP(updatedEvent);
		},

		'POST:/auth/verify-email/verify-otp': async (event) => {
			const updatedEvent = await convertEventRequestBodyFromJsonToFormData(event);

			return getVerifyEmailActions(options, adapter, emailProviderConfig).verifyOTP(updatedEvent);
		},

		'POST:/auth/verify-email/magic-link': async (event) => {
			const updatedEvent = await convertEventRequestBodyFromJsonToFormData(event);

			return getVerifyEmailActions(options, adapter, emailProviderConfig).sendMagicLink(updatedEvent);
		}
	};
};
