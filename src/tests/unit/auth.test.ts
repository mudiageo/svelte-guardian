import { describe, it, expect } from 'vitest';
import { GuardianAuth } from '../../lib/core/auth';

describe('GuardianAuth', () => {
	it('should initialize with default config', () => {
		const auth = new GuardianAuth();
		expect(auth).toBeDefined();
	});

	it('should merge user config with default config', () => {
		const customConfig = {
			security: {
				maxLoginAttempts: 4
			}
		};
		const auth = new GuardianAuth(customConfig);

		// Verify config is correctly merged
		expect(auth['config'].security.maxLoginAttempts).toBe(4);
	});
});
