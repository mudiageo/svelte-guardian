import { sendEmail } from '$lib/email';
import { hashPassword } from '$lib/utils/security';
import { validatePassword } from '$lib/utils/validation';
import type { Actions } from '@sveltejs/kit';
import type { Adapter } from '@auth/core/adapters';
import type { PasswordResetOptions, SecurityConfig } from '../types/config';
import type { EmailOptions, EmailProviderConfig } from '../email/types';

export class PasswordResetService {
	private options;
	private adapter;
	private emailProvider;

	constructor(options: PasswordResetOptions, adapter: Adapter, emailProvider: EmailProviderConfig) {
		this.options = options;
		this.adapter = adapter;
		this.emailProvider = emailProvider;
	}

	async initiatePasswordReset(email: string): Promise<string> {
		const token = crypto.randomUUID();

		// Store password reset token in database
		await this.adapter.createVerificationToken({
			identifier: email,
			token,
			expires: new Date(Date.now() + (this.options.tokenExpiration || 15) * 60 * 1000) // 15 minutes
		});

		// Send password reset email
		const resetLink = `${process.env.APP_URL}/reset-password?token=${token}&email=${email}`;
		console.log(resetLink);
		await sendEmail(
			{
				to: email,
				subject: 'Password Reset Request',
				type: 'passwordReset',
				url: resetLink
			} satisfies EmailOptions,
			this.emailProvider
		);

		return token;
	}

	async resetPassword(
		email: string,
		token: string,
		newPassword: string,
		passwordPolicy: SecurityConfig['passwordPolicy']
	): Promise<{ success: boolean; error?: string }> {
		const validPassword = validatePassword(newPassword, passwordPolicy);
		if (!validPassword?.success) return { success: false, error: validPassword.message };

		// get token and delete from db
		const resetRequest = await this.adapter.useVerificationToken({
			token,
			identifier: email
		});

		if (!resetRequest) {
			return { success: false, error: 'Invalid or expired link!' };
		}
		const hasExpired = new Date(resetRequest.expires) < new Date();

		if (hasExpired) {
			return { success: false, error: 'Link has expired!' };
		}

		// Hash new password
		const hashedPassword = await hashPassword(newPassword);

		const existingUser = await this.adapter.getUserByEmail(resetRequest.identifier);

		if (!existingUser) {
			return { success: false, error: 'User not registered!' };
		}
		// Update user password
		await this.adapter.updateUser({
			id: existingUser.id,
			password: hashedPassword
		});

		return { success: true };
	}
}

export const getResetPasswordActions = (
	options: PasswordResetOptions = {},
	adapter: Adapter,
	emailProvider: EmailProviderConfig,
	passwordPolicy: SecurityConfig['passwordPolicy']
) => {
	if (!adapter) throw new Error('Adapter is required');
	if (!emailProvider) throw new Error('Email Provider is required');

	const service = new PasswordResetService(options, adapter, emailProvider);

	const resetPasswordActions = {
		initiateReset: async ({ request }) => {
			const data = await request.formData();
			const email = data.get('email') as string;

			try {
				await service.initiatePasswordReset(email);
				return { success: true };
			} catch (error) {
				return { success: false, error: error.message };
			}
		},

		resetPassword: async ({ request }) => {
			const data = await request.formData();
			const token = data.get('token') as string;
			const email = data.get('email') as string;
			const newPassword = data.get('newPassword') as string;
			try {
				await service.resetPassword(email, token, newPassword, passwordPolicy);
				return { success: true };
			} catch (error) {
				return { success: false, error: error.message };
			}
		}
	} satisfies Actions;
	return resetPasswordActions;
};
