import { sendEmail } from '$lib/email';
import type { Actions } from '@sveltejs/kit';
import type { Adapter } from '@auth/core/adapters';
import type { EmailVerificationOptions } from '../types/config';
import type { EmailOptions, EmailProviderConfig } from '../email/types';
import crypto from 'crypto';

export class EmailVerificationService {
	private options;
	private adapter;
	private emailProvider;

	constructor(
		options: EmailVerificationOptions,
		adapter: Adapter,
		emailProvider: EmailProviderConfig
	) {
		this.options = options;
		this.adapter = adapter;
		this.emailProvider = emailProvider;
	}
	private generateOTP(length: number): string {
	  const min = 1 * (10**length);
	  const max = 9 * (10**length)
		return crypto.randomInt(min, max)
			.toString()
			.substring(0, length);
	}

	async sendOTP(email: string): Promise<string> {
		const otp = this.generateOTP(this.options.otpLength || 6);

		// Store OTP in database
		await this.adapter.createVerificationToken({
			identifier: email,
			token: otp,
			type: 'otp',
			expires: new Date(Date.now() + (this.options.otpExpiration || 15) * 60 * 1000)
		});

		// Send OTP via email
		await sendEmail(
			{
				to: email,
				subject: 'Your Verification Code',
				type: 'otp',
				otp
			} satisfies EmailOptions,
			this.emailProvider
		);

		return otp;
	}

	async sendLink(email: string): Promise<string> {
		const token = crypto.randomUUID();

		// Store  link token in database
		await this.adapter.createVerificationToken({
			identifier: email,
			token,
			expires: new Date(Date.now() + (this.options.tokenExpiration || 15) * 60 * 1000) // 15 minutes
		});

		// Send link via email
		const verificationLink = `${process.env.APP_URL}/verify-email?token=${token}&email=${email}`;
		await sendEmail(
			{
				to: email,
				subject: 'Verify Your Email',
				type: 'magicLink',
				url: verificationLink
			} satisfies EmailOptions,
			this.emailProvider
		);

		return token;
	}
	
	async initiateEmailVerification(email: string): Promise<void> {
if (this.options?.method === 'otp') {
  await this.sendOTP(email)
} else {
  await this.sendLink(email)
}
	}

	async verifyOTP(email: string, otp: string): Promise<{ success: boolean; error?: string }> {
		const existingUser = await this.adapter.getUserByEmail(email);

		if (!existingUser) {
			return { success: false, error: 'User not registered!' };
		}
		const verification = await this.adapter.useVerificationToken({
			identifier: email,
			token: otp
		});
		if (!verification) {
			return { success: false, error: 'OTP does not exist!' };
		}
		const hasExpired = new Date(verification.expires) < new Date();

		if (hasExpired) {
			return { success: false, error: 'Token has expired!' };
		}
		// Mark email as verified and remove verification record
		await this.adapter.updateUser({
			id: existingUser.id,
			email,
			emailVerified: new Date()
		});

		return { success: true };
	}
	
	async verifyToken(email: string, token: string): Promise<{ success: boolean; error?: string }> {
		const existingUser = await this.adapter.getUserByEmail(email);

		if (!existingUser) {
			return { success: false, error: 'User not registered!' };
		}
		const verification = await this.adapter.useVerificationToken({
			identifier: email,
			token
		});
		if (!verification) {
			return { success: false, error: 'Invalid token' };
		}
		const hasExpired = new Date(verification.expires) < new Date();

		if (hasExpired) {
			return { success: false, error: 'Token has expired!' };
		}
		// Mark email as verified and remove verification record
		await this.adapter.updateUser({
			id: existingUser.id,
			email,
			emailVerified: new Date()
		});

		return { success: true };
	}
}

export const getVerifyEmailActions = (
	options: EmailVerificationOptions,
	adapter: Adapter,
	emailProvider: EmailProviderConfig
) => {
	if (!options) throw new Error('Email verification config is required');
	if (!adapter) throw new Error('Adapter is required');
	if (!emailProvider) throw new Error('Email Provider is required');

	const emailService = new EmailVerificationService(options, adapter, emailProvider);

	const verifyEmailActions = {
		sendOTP: async ({ request }) => {
			const data = await request.formData();
			const email = data.get('email') as string;
			try {
				await emailService.sendOTP(email);
				return { success: true };
			} catch (error) {
				return { success: false, error: error.message };
			}
		},
		sendLink: async ({ request }) => {
			const data = await request.formData();
			const email = data.get('email') as string;
			try {
				await emailService.sendLink(email);
				return { success: true };
			} catch (error) {
				return { success: false, error: error.message };
			}
		},
		initiateEmailVerification: async ({ request }) => {
			const data = await request.formData();
			const email = data.get('email') as string;
			try {
				await emailService.initiateEmailVerification(email);
				return { success: true };
			} catch (error) {
				return { success: false, error: error.message };
			}
		},
		verifyOTP: async ({ request }) => {
			const data = await request.formData();
			const email = data.get('email') as string;
			const otp = data.get('otp') as string;

			try {
				const verified = await emailService.verifyOTP(email, otp);
				return verified;
			} catch (error) {
				return { success: false, error: error.message };
			}
		},
		verifyToken: async ({ request }) => {
			const data = await request.formData();
			const email = data.get('email') as string;
			const token = data.get('token') as string;

			try {
				const verified = await emailService.verifyToken(email, token);
				return verified;
			} catch (error) {
				return { success: false, error: error.message };
			}
		}
	} satisfies Actions;
	return verifyEmailActions;
};
