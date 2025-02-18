import { z } from 'zod';
import { type SecurityConfig } from '../types/config.js';
const emailSchema = z
	.string()
	.email('Invalid email address')
	.max(255, 'Email too long')
	.regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format');

// Strong password validation
const passwordSchema = z
	.string()
	.min(12, 'Password must be at least 12 characters')
	.max(64, 'Password too long')
	.regex(/[A-Z]/, 'Must contain uppercase letter')
	.regex(/[a-z]/, 'Must contain lowercase letter')
	.regex(/[0-9]/, 'Must contain number')
	.regex(/[!@#$%^&*(),.?":{}|<>]/, 'Must contain special character');

// Validate email
export function validateEmail(email: string): boolean {
	try {
		emailSchema.parse(email);
		return true;
	} catch {
		return false;
	}
}

export const DEFAULT_SPECIAL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

// Validate password
export function validatePassword(
	password: string,
	passwordPolicy?: SecurityConfig['passwordPolicy']
): { success: boolean; message?: any } {
	try {
		if (!password || !password.trim())
			return { success: false, message: ['Password must not be empty'] };

		if (passwordPolicy === undefined) passwordPolicy = {};
		const {
			minLength = 8,
			maxLength = 64,
			requireUppercase = true,
			requireLowercase = true,
			requireNumbers = true,
			requireSpecialChars = true,
			specialChars = DEFAULT_SPECIAL_CHARS
		} = passwordPolicy;

		let passwordSchema = z
			.string()
			.min(minLength, { message: `Password must be at least ${minLength} characters long` })
			.max(maxLength, { message: `Password must be no more than ${maxLength} characters long` });

		// Uppercase check
		if (requireUppercase !== false) {
			const minUppercase = typeof requireUppercase === 'number' ? requireUppercase : 1;
			passwordSchema = passwordSchema.refine(
				(val) => {
					const uppercaseCount = (val.match(/[A-Z]/g) || []).length;
					return uppercaseCount >= minUppercase;
				},
				{
					message:
						minUppercase === 1
							? 'Password must contain at least one uppercase letter'
							: `Password must contain at least ${minUppercase} uppercase letters`
				}
			);
		}

		// Lowercase check
		if (requireLowercase !== false) {
			const minLowercase = typeof requireLowercase === 'number' ? requireLowercase : 1;
			passwordSchema = passwordSchema.refine(
				(val) => {
					const lowercaseCount = (val.match(/[a-z]/g) || []).length;
					return lowercaseCount >= minLowercase;
				},
				{
					message:
						minLowercase === 1
							? 'Password must contain at least one lowercase letter'
							: `Password must contain at least ${minLowercase} lowercase letters`
				}
			);
		}

		// Numbers check
		if (requireNumbers !== false) {
			const minNumbers = typeof requireNumbers === 'number' ? requireNumbers : 1;
			passwordSchema = passwordSchema.refine(
				(val) => {
					const numberCount = (val.match(/[0-9]/g) || []).length;
					return numberCount >= minNumbers;
				},
				{
					message:
						minNumbers === 1
							? 'Password must contain at least one number'
							: `Password must contain at least ${minNumbers} numbers`
				}
			);
		}

		// Special characters check
		if (requireSpecialChars !== false) {
			const minSpecialChars = typeof requireSpecialChars === 'number' ? requireSpecialChars : 1;
			const escapedSpecialChars = specialChars.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

			passwordSchema = passwordSchema.refine(
				(val) => {
					const specialCharCount = (val.match(new RegExp(`[${escapedSpecialChars}]`, 'g')) || [])
						.length;
					return specialCharCount >= minSpecialChars;
				},
				{
					message:
						minSpecialChars === 1
							? `Password must contain at least one special character from: ${specialChars}`
							: `Password must contain at least ${minSpecialChars} special characters from: ${specialChars}`
				}
			);
		}

		passwordSchema.parse(password);
		return { success: true, message: ['Password is okay'] };
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorMessages = error.errors.map((e) => e.message);

			return {
				success: false,
				message: errorMessages // Plain text error message
				// You can add more properties for styling or other frontend-specific needs
			};
		}
		throw Error(error);
	}
}

export function validateCredentials(email: string, password: string): boolean {
	try {
		emailSchema.parse(email);
		passwordSchema.parse(password);
		return true;
	} catch (error) {
		return error;
	}
}

// Comprehensive user registration validation
const registrationSchema = z.object({
	email: emailSchema,
	password: passwordSchema,
	name: z
		.string()
		.min(2, 'Name too short')
		.max(50, 'Name too long')
		.regex(/^[a-zA-Z\s'-]+$/, 'Invalid name format')
});

// Validate full registration
export function validateRegistration(data: unknown) {
	return registrationSchema.parse(data);
}

// Type guard to validate email provider requirement
export function isValidSecurityConfig(config: SecurityConfig): boolean {
	// Check if email provider is required based on specific features
	const requiresEmailProvider =
		config.emailVerification !== undefined ||
		config.passwordReset !== undefined ||
		config.twoFactorAuth !== undefined;

	// If any of those features are set, email provider must be present
	if (requiresEmailProvider && !config.emailProvider) {
		return false;
	}

	return true;
}
