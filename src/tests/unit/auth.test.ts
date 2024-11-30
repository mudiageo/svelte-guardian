import { describe, it, expect } from 'vitest';
import { ForgeAuth } from '../../src/core/auth';

describe('ForgeAuth', () => {
  it('should initialize with default config', () => {
    const auth = new ForgeAuth();
    expect(auth).toBeDefined();
  });

  it('should merge user config with default config', () => {
    const customConfig = {
      security: {
        maxLoginAttempts: 3
      }
    };
    const auth = new ForgeAuth(customConfig);
    
    // Verify config is correctly merged
    expect(auth['config'].security.maxLoginAttempts).toBe(3);
  });
});
