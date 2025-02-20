import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../../../lib/utils/security';

describe('Security Utils', () => {
	it('should hash password and hashed paswword should match', async () => {
		const password = '@auth/prisma-adapter';
		const hashed = await hashPassword(password);
		console.log(hashed);

		const verify = await verifyPassword(hashed, password);
		console.log(verify);
		expect(verify).not.toBeUndefined();
	});
});
