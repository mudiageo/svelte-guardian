import argon2 from 'argon2';

export const hashPassword = async (password: string): Promise<string> => {
	const hash = await argon2.hash(password);
	return hash;
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
	return crypto.randomUUID();
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

// IP-based rate limiting helper
export const createRateLimiter = (maxAttempts: number, windowMs: number) => {
	const attempts = new Map<string, { count: number; resetTime: number }>();

	return {
		attempt(ip: string): boolean {
			const now = Date.now();
			const record = attempts.get(ip);

			// Clear old attempts
			if (record && now > record.resetTime) {
				attempts.delete(ip);
			}

			const currentRecord = record || {
				count: 0,
				resetTime: now + windowMs
			};

			currentRecord.count++;
			attempts.set(ip, currentRecord);

			return currentRecord.count <= maxAttempts;
		},

		reset(ip: string) {
			attempts.delete(ip);
		}
	};
};
