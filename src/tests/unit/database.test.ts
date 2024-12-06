import { describe, it, expect } from 'vitest';
import { getUserByEmail, createDatabaseAdapter } from '../../lib/database.js';
import { PrismaClient } from '@prisma/client';

describe('Prisma Database tests', () => {
	const client = new PrismaClient();
	const customConfig = {
		database: {
			type: 'prisma',
			client
		}
	};
	it('should create Prisma database adapter', () => {
		const adapter = createDatabaseAdapter(customConfig.database);
		expect(adapter).toBeDefined();
	});

	it('should get user by email', () => {
		const user = getUserByEmail(customConfig.database, 'test@loclahost');

		// Verify config is correctly merged
		expect(user).toBeDefined();
	});
});
