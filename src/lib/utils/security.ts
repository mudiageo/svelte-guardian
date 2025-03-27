import crypto  from 'crypto';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const argon2 = process.env.NODE_ENV === 'development' ? await import('argon2') : require('argon2');

export const hashPassword = async (password: string): Promise<string> => {
	const hashedPassword = await argon2.hash(password);
	return hashedPassword;
};

// Secure password verification
export const verifyPassword = async (
	storedPassword: string,
	providedPassword: string
): Promise<boolean> => {
	const isValid = await argon2.verify(storedPassword, providedPassword);
	return isValid;
};

// Generate cryptographically secure tokens
export const generateSecureToken = async (length = 32): Promise<string> => {
	return crypto.randomBytes(length).toString('hex');
};

// Timing-safe string comparison
export const timingSafeCompare = (a: string, b: string): boolean => {
	if (a.length !== b.length) return false;

	let result = 0;
	for (let i = 0; i < a.length; i++) {
		result |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}
	return result === 0;
};
