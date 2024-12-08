import { z } from 'zod';
import { type SecurityConfig } from '../types/config.js'
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
export function validatePassword(passwordPolicy: SecurityConfig["passwordPolicy"], password: string): {success: boolean, message?: any} {
	try {

const defaultOptions = {
	minLength: 12,
	maxLength: 64,
	requireUppercase: true,
	requireLowercase: true,
	requireNumbers: true,
	requireSpecialChars: true,
}
const mergedOptions = {
	...defaultOptions,
	...passwordPolicy
}
	const passwordSchema = z
		.string()
		.min(mergedOptions.minLength, 'Password must be at least 12 characters')

		if (mergedOptions.maxLength) {
			passwordSchema.max(mergedOptions.maxLength, `Password cannot exceed ${mergedOptions.maxLength} characters`);
		}
	
		if (mergedOptions.requireUppercase) {
			const minUppercase = mergedOptions.requireUppercase ?? 1;
			passwordSchema.regex(new RegExp(`(?=.*?[A-Z]){${minUppercase}}`), `Password must contain at least ${minUppercase} uppercase letters`);
		}
	
		if (mergedOptions.requireLowercase) {
			const minLowercase = mergedOptions.requireLowercase ?? 1;
			passwordSchema.regex(new RegExp(`(?=.*?[a-z]){${minLowercase}}`), `Password must contain at least ${minLowercase} lowercase letters`);
		}
	
		if (mergedOptions.requireNumbers) {
			const minNumber = mergedOptions.requireNumbers ?? 1;
			passwordSchema.regex(new RegExp(`(?=.*?[0-9]){${minNumber}}`), `Password must contain at least ${minNumber} numbers`);
		}
	
		if (mergedOptions.requireSpecialChars) {
			const minSpecialChar = mergedOptions.requireSpecialChars ?? 1;
			passwordSchema.regex(new RegExp(`(?=.*?[!@#$%^&*(),.?":{}|<>]){${minSpecialChar}}`), `Password must contain at least ${minSpecialChar} special characters`);
		}
		
		passwordSchema.parse(password);
		return {success: true};
	} catch (error){
		if (error instanceof z.ZodError) {
			 const formattedErrors = error.format()._error;
			console.log(formattedErrors)
			const errorMessages = error.errors.map(e => e.message)
			
			return {
			  success:true,
			  message: errorMessages, // Plain text error message
			  // You can add more properties for styling or other frontend-specific needs
			};
			
}
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
