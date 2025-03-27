import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, generateSecureToken, timingSafeCompare } from '../../../lib/utils/security';

describe('Security Utils', () => {
	it('should hash password and hashed paswword should match', async () => {
		const password = '@auth/prisma-adapter';
		const hashed = await hashPassword(password);

		const verify = await verifyPassword(hashed, password);
		expect(verify).not.toBeUndefined();
	});
	
describe('Secure Token and Timing-Safe Comparison', () => {
  it('should generate a secure token of the specified length', async () => {
    const token16 = await generateSecureToken(16);
    const token64 = await generateSecureToken(64);

    expect(token16).toHaveLength(32); // 16 bytes * 2 hex chars
    expect(token64).toHaveLength(128); // 64 bytes * 2 hex chars
    expect(typeof token16).toBe('string');
    expect(typeof token64).toBe('string');
  });

  it('should generate different tokens each time', async () => {
    const token1 = await generateSecureToken();
    const token2 = await generateSecureToken();

    expect(token1).not.toBe(token2);
  });

  it('should correctly compare identical strings using timingSafeCompare', () => {
    const str1 = 'secret';
    const str2 = 'secret';

    expect(timingSafeCompare(str1, str2)).toBe(true);
  });

  it('should correctly compare different strings using timingSafeCompare', () => {
    const str1 = 'secret';
    const str2 = 'SECREt';
    const str3 = 'secrets';

    expect(timingSafeCompare(str1, str2)).toBe(false);
    expect(timingSafeCompare(str1, str3)).toBe(false);
  });

  it('should return false for strings of different lengths using timingSafeCompare', () => {
    const str1 = 'short';
    const str2 = 'longerString';

    expect(timingSafeCompare(str1, str2)).toBe(false);
  });

   it('should handle empty strings in timingSafeCompare', () => {
    expect(timingSafeCompare('', '')).toBe(true);
    expect(timingSafeCompare('a', '')).toBe(false);
    expect(timingSafeCompare('', 'b')).toBe(false);
  });

    it('should handle unicode characters in timingSafeCompare', () => {
    const str1 = 'café';
    const str2 = 'café';
    const str3 = 'cafe';

    expect(timingSafeCompare(str1, str2)).toBe(true);
    expect(timingSafeCompare(str1, str3)).toBe(false);
  });
});
});

