import { goto } from '$app/navigation';
import type { EmailVerificationOptions, PasswordResetOptions, TwoFactorAuthOptions } from './index';

interface ApiResponse {
	success: boolean;
	error?: string;
	data?: any;
}

// Utility function for API calls
async function apiCall(
	endpoint: string,
	method: 'GET' | 'POST' = 'POST',
	data?: any
): Promise<ApiResponse> {
	try {
		const response = await fetch(`/auth/${endpoint}`, {
			method,
			headers: {
				'Content-Type': 'application/json'
			},
			body: data ? JSON.stringify(data) : undefined
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || 'Request failed');
		}

		return await response.json();
	} catch (error) {
		return {
			success: false,
			error: error.message || 'An error occurred'
		};
	}
}

// Email Verification Functions
export const emailVerification = {
	// Request OTP verification
	async requestOTP(email: string): Promise<ApiResponse> {
		return await apiCall('verify-email/send-otp', 'POST', { email });
	},

	// Verify OTP
	async verifyOTP(email: string, otp: string): Promise<ApiResponse> {
		return await apiCall('verify-email/verify-otp', 'POST', { email, otp });
	},

	// Request magic link
	async requestMagicLink(email: string): Promise<ApiResponse> {
		return await apiCall('verify-email/magic-link', 'POST', { email });
	},

	// Verify magic link token
	async verifyMagicLink(token: string): Promise<ApiResponse> {
		return await apiCall('verify-email/verify-magic-link', 'POST', { token });
	},

	// Utility function to handle email verification flow
	async handleEmailVerification(
		email: string,
		method: EmailVerificationOptions['method']
	): Promise<ApiResponse> {
		if (method === 'otp') {
			const result = await this.requestOTP(email);
			if (result.success) {
				// Show OTP input form
				return {
					success: true,
					data: { verificationId: result.data?.verificationId }
				};
			}
			return result;
		} else {
			return await this.requestMagicLink(email);
		}
	}
};

// Password Reset Functions
export const passwordReset = {
	// Request password reset
	async requestReset(email: string): Promise<ApiResponse> {
		return await apiCall('reset-password/request', 'POST', { email });
	},

	// Validate reset token
	async validateToken(token: string): Promise<ApiResponse> {
		return await apiCall('reset-password/validate-token', 'POST', { token });
	},

	// Reset password
	async resetPassword(
		token: string,
		newPassword: string,
		confirmPassword: string
	): Promise<ApiResponse> {
		if (newPassword !== confirmPassword) {
			return {
				success: false,
				error: 'Passwords do not match'
			};
		}

		return await apiCall('reset-password/reset', 'POST', {
			token,
			newPassword
		});
	},

	// Password validation
	validatePassword(
		password: string,
		options: PasswordResetOptions = {}
	): { valid: boolean; errors: string[] } {
		const errors: string[] = [];

		if (password.length < (options.minimumPasswordLength || 8)) {
			errors.push(
				`Password must be at least ${options.minimumPasswordLength || 8} characters long`
			);
		}

		if (options.requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
			errors.push('Password must contain at least one special character');
		}

		if (options.requireNumber && !/\d/.test(password)) {
			errors.push('Password must contain at least one number');
		}

		if (options.requireUppercase && !/[A-Z]/.test(password)) {
			errors.push('Password must contain at least one uppercase letter');
		}

		return {
			valid: errors.length === 0,
			errors
		};
	},

	// Complete password reset flow
	async handlePasswordReset(email: string): Promise<ApiResponse> {
		const result = await this.requestReset(email);
		if (result.success) {
			// Redirect to check email page
			await goto('/auth/check-email');
		}
		return result;
	}
};

// Two-Factor Authentication Functions
export const twoFactorAuth = {
	// Setup 2FA
	async setup(method: TwoFactorAuthOptions['method']): Promise<ApiResponse> {
		return await apiCall('two-factor/setup', 'POST', { method });
	},

	// Generate QR code for TOTP
	async generateQRCode(secret: string): Promise<string> {
		const qrcode = await import('qrcode');
		const otpauth = `otpauth://totp/${window.location.hostname}?secret=${secret}`;
		return await qrcode.toDataURL(otpauth);
	},

	// Verify 2FA token
	async verifyToken(token: string): Promise<ApiResponse> {
		return await apiCall('two-factor/verify', 'POST', { token });
	},

	// Verify backup code
	async verifyBackupCode(code: string): Promise<ApiResponse> {
		return await apiCall('two-factor/verify-backup', 'POST', { code });
	},

	// Disable 2FA
	async disable(): Promise<ApiResponse> {
		return await apiCall('two-factor/disable', 'POST');
	},

	// Handle complete 2FA setup flow
	async handleSetup(method: TwoFactorAuthOptions['method']): Promise<ApiResponse> {
		const result = await this.setup(method);

		if (result.success && method === '2fa-totp') {
			const qrCode = await this.generateQRCode(result.data.secret);
			return {
				...result,
				data: {
					...result.data,
					qrCode
				}
			};
		}

		return result;
	}
};
export * from '@auth/sveltekit/client';
