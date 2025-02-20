import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PasswordResetService } from '$lib/features/password-reset';
import { sendEmail } from '$lib/email';
import { hashPassword } from '$lib/utils/security';
import type { Adapter } from '@auth/core/adapters';
import type { PasswordResetOptions } from '$lib/types/config';
import type { EmailProviderConfig } from '$lib/email/types';

// Mock dependencies
vi.mock('$lib/email', () => ({
	sendEmail: vi.fn()
}));
vi.mock('$lib/utils/security', () => ({
	hashPassword: vi.fn((data) => data)
}));

describe('PasswordResetService', () => {
	let passwordResetService: PasswordResetService;
	let mockAdapter: Adapter;
	let mockEmailProvider: EmailProviderConfig;
	let defaultOptions: PasswordResetOptions;

	beforeEach(() => {
		vi.clearAllMocks();

		mockAdapter = {
			createVerificationToken: vi.fn(),
			useVerificationToken: vi.fn(),
			getUserByEmail: vi.fn(),
			updateUser: vi.fn()
		};

		mockEmailProvider = {
			type: 'resend',
			apiKey: 'mock-api-key'
		};

		defaultOptions = {
			tokenExpiration: 15
		};

		passwordResetService = new PasswordResetService(defaultOptions, mockAdapter, mockEmailProvider);
	});
	afterEach(() => {
		vi.resetAllMocks();
	});

	describe('initiatePasswordReset', () => {
		it('should generate and store reset token', async () => {
			const email = 'test@example.com';
			const token = await passwordResetService.initiatePasswordReset(email);

			expect(token).toMatch(/^[0-9a-f-]{36}$/); // UUID format
			expect(mockAdapter.createVerificationToken).toHaveBeenCalledWith({
				identifier: email,
				token,
				expires: expect.any(Date)
			});
		});

		it('should send reset email', async () => {
			const email = 'test@example.com';

			const token = await passwordResetService.initiatePasswordReset(email);

			expect(sendEmail).toHaveBeenCalledWith(
				{
					to: email,
					subject: 'Password Reset Request',
					type: 'passwordReset',
					url: expect.stringContaining(token)
				},
				mockEmailProvider
			);
		});
	});

	describe('resetPassword', () => {
		const passwordPolicy = {
			minimumPasswordLength: 8,
			requireSpecialChars: true,
			requireNumbers: true,
			requireUppercase: true
		};
		const newPassword = 'New@20Pass';
		const email = 'test@example.com';
		const userId = 'user-123';

		it('should validate unexpired token', async () => {
			const token = 'valid-token';

			mockAdapter.useVerificationToken.mockResolvedValue({
				id: 1,
				identifier: email,
				token,
				expires: new Date(Date.now() + 1000 * 60 * 15)
			});
			mockAdapter.getUserByEmail.mockResolvedValue({
				id: 1,
				identifier: email
			});

			const result = await passwordResetService.resetPassword(
				email,
				token,
				newPassword,
				passwordPolicy
			);

			expect(mockAdapter.useVerificationToken).toHaveBeenCalledWith({
				token,
				identifier: email
			});

			expect(result).toEqual({ success: true });
		});

		it('should return error if token has expired', async () => {
			const token = 'expired-token';
			mockAdapter.useVerificationToken.mockResolvedValue({
				id: 1,
				identifier: email,
				token,
				expires: new Date(Date.now() - 1000 * 60 * 15)
			});
			mockAdapter.getUserByEmail.mockResolvedValue({
				id: 1,
				identifier: email
			});

			mockAdapter.getUserByEmail.mockResolvedValue({ id: userId, email });
			mockAdapter.useVerificationToken.mockResolvedValue({
				expires: new Date(Date.now() - 1000) // expired date
			});

			const result = await passwordResetService.resetPassword(
				email,
				token,
				newPassword,
				passwordPolicy
			);

			expect(result).toEqual({
				success: false,
				error: 'Link has expired!'
			});
		});

		it('should reset password with valid token and password', async () => {
			const token = 'valid-token';
			const newPassword = 'ValidP@ss123';
			const hashedPassword = 'hashed-password';

			hashPassword.mockResolvedValueOnce(hashedPassword);

			mockAdapter.useVerificationToken.mockResolvedValue({
				id: 1,
				identifier: email,
				token,
				expires: new Date(Date.now() + 1000 * 60 * 15)
			});
			mockAdapter.getUserByEmail.mockResolvedValue({
				id: 1,
				identifier: email
			});

			const result = await passwordResetService.resetPassword(
				email,
				token,
				newPassword,
				passwordPolicy
			);

			expect(result).toEqual({ success: true });
			expect(mockAdapter.updateUser).toHaveBeenCalledWith({
				id: 1,
				password: hashedPassword
			});
		});

		it('should reject password that does not meet requirements', async () => {
			const token = 'valid-token';
			const newPassword = 'weak';

			const result = await passwordResetService.resetPassword(
				email,
				token,
				newPassword,
				passwordPolicy
			);

			expect(result.success).toEqual(false);
			expect(result.error).toContain('Password must be at least 8 characters long');
		});

		it('should reject invalid token', async () => {
			await expect(
				await passwordResetService.resetPassword(
					email,
					'invalid-token',
					'ValidP@ss123',
					passwordPolicy
				)
			).toEqual({ success: false, error: 'Invalid or expired link!' });
		});
	});
});
