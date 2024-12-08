import { describe, it, expect } from 'vitest';
import { optionalImport } from '../../lib/utils';
import { validatePassword } from '../../lib/utils/validation.js';

describe('Test Utils', () => {
	it('should import Prisma adapter', async () => {
		const adapter = await optionalImport('@auth/prisma-adapter');
		expect(adapter).toBeDefined();
	});
});
describe('Validation Utils', () => {
	it('should validate password according to schema Prisma adapter', async () => {
		const passwordPolicy = {
			requireUppercase:2

		}

		const isValidPassword = validatePassword(passwordPolicy, 'rdd');
		console.log(isValidPassword)
		expect(isValidPassword).toBeDefined();
	});
});