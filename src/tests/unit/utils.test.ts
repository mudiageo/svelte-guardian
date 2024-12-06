import { describe, it, expect } from 'vitest';
import { optionalImport } from '../../lib/utils';

describe('Test Utils', () => {
	it('should import Prisma adapter', async () => {
		const adapter = await optionalImport('@auth/prisma-adapter');
		expect(adapter).toBeDefined();
	});
});
