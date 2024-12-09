import { describe, it, expect } from 'vitest';
import { validatePassword, DEFAULT_SPECIAL_CHARS } from '../../../lib/utils/validation.js';

describe('Validation Utils', () => {
	describe('Password Validation', () => {
		// Default Options Tests
		describe('Default Options', () => {
			it('should pass with a strong password', () => {
				expect(validatePassword('StrongPass123!')).toHaveProperty('success', true);
			});

			it('should fail if missing uppercase', () => {
				expect(validatePassword('weakpassword123!').message).toContain(
					'Password must contain at least one uppercase letter'
				);
			});

			it('should fail if missing lowercase', () => {
				expect(validatePassword('ALLUPPERCASE123!').message).toContain(
					'Password must contain at least one lowercase letter'
				);
			});

			it('should fail if missing number', () => {
				expect(validatePassword('CompletelyAlphabetic!').message).toContain(
					'Password must contain at least one number'
				);
			});

			it('should fail if missing special character', () => {
				expect(validatePassword('NoSpecialCharsPass123').message).toContain(
					`Password must contain at least one special character from: ${DEFAULT_SPECIAL_CHARS}`
				);
			});
		});

		// Length Validation Tests
		describe('Length Validation', () => {
			it('should pass with minimum length', () => {
				const options = { minLength: 8 };
				expect(validatePassword('Pass123!', options)).toHaveProperty('success', true);
			});

			it('should fail if too short', () => {
				const options = { minLength: 10 };
				expect(validatePassword('Short1!', options).message).toContain(
					`Password must be at least ${options.minLength} characters long`
				);
			});

			it('should pass with maximum length', () => {
				const options = { maxLength: 12 };
				const longPassword = 'LongPass123!';
				expect(validatePassword(longPassword, options)).toHaveProperty('success', true);
			});

			it('should fail if too long', () => {
				const options = { maxLength: 10 };
				const tooLongPassword = 'VeryLongPassword123!';
				expect(validatePassword(tooLongPassword, options).message).toContain(
					`Password must be no more than ${options.maxLength} characters long`
				);
			});
		});

		// Specific Character Requirement Tests
		describe('Specific Character Requirements', () => {
			it('uppercase requirement with number', () => {
				const options = { requireUppercase: 2 };

				// Should pass
				expect(validatePassword('TWouppercasepass123!', options)).toHaveProperty('success', true);

				// Should fail with only one uppercase
				expect(validatePassword('Oneuppercasepass123!', options).message).toContain(
					`Password must contain at least ${options.requireUppercase} uppercase letters`
				);
			});

			it('lowercase requirement with number', () => {
				const options = { requireLowercase: 2 };

				// Should pass
				expect(validatePassword('twOLOWERCASEPASS123!', options)).toHaveProperty('success', true);

				// Should fail with only one lowercase
				expect(validatePassword('aLLUPPERCASE123!', options).message).toContain(
					`Password must contain at least ${options.requireLowercase} lowercase letters`
				);
			});

			it('number requirement with number', () => {
				const options = { requireNumbers: 2 };

				// Should pass
				expect(validatePassword('TwoNumbersPass12!', options)).toHaveProperty('success', true);

				// Should fail with only one number
				expect(validatePassword('OneNumberPass1!', options).message).toContain(
					`Password must contain at least ${options.requireNumbers} numbers`
				);
			});

			it('special character requirement with number', () => {
				const options = {
					requireSpecialChars: 2,
					specialChars: '!@#'
				};

				// Should pass
				expect(validatePassword('TwoSpecialChars!!Pass123', options)).toHaveProperty(
					'success',
					true
				);
	
				// Should fail with only one special character
				expect(validatePassword('OneSpecialChar!Pass123', options).message).toContain(
					`Password must contain at least ${options.requireSpecialChars} special characters from: ${options.specialChars}`
				);
			});
		});

		// Disabling Requirements Tests
		describe('Disabling Requirements', () => {
			it('should pass without uppercase when explicitly disabled', () => {
				const options = { requireUppercase: false };
				expect(validatePassword('nouppercase123!', options)).toHaveProperty('success', true);
			});

			it('should pass without lowercase when explicitly disabled', () => {
				const options = { requireLowercase: false };
				expect(validatePassword('NOLOWERCASE123!', options)).toHaveProperty('success', true);
			});

			it('should pass without numbers when explicitly disabled', () => {
				const options = { requireNumbers: false };
				expect(validatePassword('NoNumbersPass!', options)).toHaveProperty('success', true);
			});

			it('should pass without special chars when explicitly disabled', () => {
				const options = { requireSpecialChars: false };
				expect(validatePassword('NoSpecialCharsPass123', options)).toHaveProperty('success', true);
			});
		});

		// Custom Special Characters Tests
		describe('Custom Special Characters', () => {
			it('should validate against custom special characters', () => {
				const options = {
					specialChars: '$%^',
					requireSpecialChars: true
				};

				// Should pass
				expect(validatePassword('ValidPass123$', options)).toHaveProperty('success', true);
				expect(validatePassword('ValidPass123%', options)).toHaveProperty('success', true);
				expect(validatePassword('ValidPass123^', options)).toHaveProperty('success', true);

				// Should fail
				expect(validatePassword('InvalidPass123!', options).message).toContain(
					`Password must contain at least one special character from: ${options.specialChars}`
				);
			});
		});

		// Complex Schema Tests
		describe('Complex password policy', () => {
			const options = {
				minLength: 12,
				maxLength: 20,
				requireUppercase: 2,
				requireLowercase: 2,
				requireNumbers: 2,
				requireSpecialChars: 1
			};

			it('should pass with all requirements met', () => {
				expect(validatePassword('TwoUP2low2Nums!Pass', options)).toHaveProperty('success', true);
			});

			it('should fail if any requirement is not met', () => {
				// Fails due to insufficient uppercase
				expect(validatePassword('oneupper2low2nums!Pass', options).message).toContain(
					`Password must contain at least ${options.requireUppercase} uppercase letters`
				);

				// Fails due to insufficient lowercase
				expect(validatePassword('TWOUPPER2LOW2NUMS!PASS', options).message).toContain(
					`Password must contain at least ${options.requireLowercase} lowercase letters`
				);

				// Fails due to insufficient numbers
				expect(validatePassword('TwoUPlow1Num!Pass', options).message).toContain(
					`Password must contain at least ${options.requireNumbers} numbers`
				);

				// Fails due to insufficient special characters
				expect(validatePassword('TwoUPlow2Nums1Pass', options).message).toContain(
					`Password must contain at least one special character from: ${DEFAULT_SPECIAL_CHARS}`
				);
			});
		});

		  // Edge Case Tests
		  describe('Edge Cases', () => {
		    it('should handle empty string', () => {
		      expect(validatePassword('').message).toContain(/at least/);
		    });

		    it('should handle string with only whitespace', () => {
		      expect(validatePassword('    ').message).toThrow(/at least/);
		    });

		    it('should correctly escape special characters in regex', () => {
		      const options = {
		        specialChars: '^$*.[]{}()+?\\',
		        requireSpecialChars: true
		      };

		      // Should pass with escaped special characters
		      expect(validatePassword('ValidPass123^', options)).toHaveProperty('success', true);
		      expect(validatePassword('ValidPass123$', options)).toHaveProperty('success', true);
		      expect(validatePassword('ValidPass123.', options)).toHaveProperty('success', true);
		    });
		  });

		// Performance and Boundary Tests
		describe('Performance and Boundary Conditions', () => {
			it('should handle very long passwords within max length', () => {
				const longPassword = 'A'.repeat(61) + 'a1!';
				console.log(longPassword.length)
				expect(validatePassword(longPassword)).toHaveProperty('success', true);
			});

			it('should enforce max length strictly', () => {
				const options = { maxLength: 10 };
				const tooLongPassword = 'A'.repeat(11) + '1!';
				expect(validatePassword(tooLongPassword, options).message).toContain(`Password must be no more than ${options.maxLength} characters long`);
			});
		});
	});

	// Optional: Error Message Consistency Tests
	describe('Error Message Consistency', () => {
		it('error messages are descriptive and consistent', () => {
			expect(validatePassword('short').message[0]).toMatch(/at least/i);
		});
	});
});
