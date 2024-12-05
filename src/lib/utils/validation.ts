import { z } from 'zod';

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

// Validate password
export function validatePassword(password: string): boolean {
	try {
		passwordSchema.parse(password);
		return true;
	} catch {
		return false;
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
