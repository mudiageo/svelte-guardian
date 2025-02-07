import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { EmailVerificationService } from '$lib/features/email-verification';
import { sendEmail } from '$lib/email';
import type { Adapter } from '@auth/core/adapters';
import type { EmailVerificationOptions } from '$lib/types/config';
import type {  EmailProviderConfig } from '$lib/email/types';

// Mock dependencies
vi.mock('$lib/email', () => ({
  sendEmail: vi.fn()
}));

describe('EmailVerificationService', () => {
  let emailVerificationService: EmailVerificationService;
  let mockAdapter: Adapter;
  let mockEmailProvider: EmailProviderConfig;
  let defaultOptions: EmailVerificationOptions;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
  
    vi.spyOn(crypto, 'randomUUID').mockImplementation(() => 'mock-uuid');


    mockAdapter = {
      createVerificationToken: vi.fn(),
      useVerificationToken: vi.fn(),
      getUserByEmail: vi.fn(),
      updateUser: vi.fn()
    } as any;

    // Setup mock email provider
    mockEmailProvider = {
      type: 'resend',
      apiKey: 'mock-api-key'
    };

    // Default options
    defaultOptions = {
      method: 'otp',
      otpLength: 6,
      otpExpiration: 15,
      enabled: true
    };

    emailVerificationService = new EmailVerificationService(
      defaultOptions,
      mockAdapter,
      mockEmailProvider
    );
  });

  afterEach(() => {
    vi.resetAllMocks();
    global.crypto 
  });

  describe('sendOTP', () => {
    it('should generate and send OTP of specified length', async () => {
      const email = 'test@example.com';
      const mockOtp = '123456';
      
      // Mock Math.random to return a predictable value
      const mockMath = Object.create(global.Math);
      mockMath.random = () => 0.123456;
      global.Math = mockMath;

      await emailVerificationService.sendOTP(email);

      expect(mockAdapter.createVerificationToken).toHaveBeenCalledWith({
        identifier: email,
        token: expect.any(String),
        type: 'otp',
        expires: expect.any(Date)
      });

      expect(sendEmail).toHaveBeenCalledWith(
        {
          to: email,
          subject: 'Your Verification Code',
          type: 'otp',
          otp: expect.any(String)
        },
        mockEmailProvider
      );
    });

    it('should use default OTP length when not specified', async () => {
      const email = 'test@example.com';
      const serviceWithoutLength = new EmailVerificationService(
        { ...defaultOptions, otpLength: undefined },
        mockAdapter,
        mockEmailProvider
      );

      const otp = await serviceWithoutLength.sendOTP(email);
      expect(otp).toHaveLength(6);
    });
    
  });

  describe('sendMagicLink', () => {
    it('should generate and send magic link', async () => {
      const email = 'test@example.com';
      const expectedToken = 'mock-uuid';
      
      const token = await emailVerificationService.sendMagicLink(email);

      expect(token).toBe(expectedToken);
      expect(mockAdapter.createVerificationToken).toHaveBeenCalledWith({
        identifier: email,
        token: expectedToken,
        expires: expect.any(Date)
      });

      expect(sendEmail).toHaveBeenCalledWith(
        {
          to: email,
          subject: 'Verify Your Email',
          type: 'magicLink',
          url: expect.stringContaining(expectedToken)
        },
        mockEmailProvider
      );
    });
  });

  describe('verifyOTP', () => {
    const email = 'test@example.com';
    const otp = '123456';
    const userId = 'user-123';

    it('should return error if user is not registered', async () => {
      mockAdapter.getUserByEmail.mockResolvedValue(null);

      const result = await emailVerificationService.verifyOTP(email, otp);

      expect(result).toEqual({
        success: false,
        error: 'User not registered!'
      });
    });

    it('should return error if OTP does not exist', async () => {
      mockAdapter.getUserByEmail.mockResolvedValue({ id: userId, email });
      mockAdapter.useVerificationToken.mockResolvedValue(null);

      const result = await emailVerificationService.verifyOTP(email, otp);

      expect(result).toEqual({
        success: false,
        error: 'OTP does not exist!'
      });
    });

    it('should return error if OTP has expired', async () => {
      mockAdapter.getUserByEmail.mockResolvedValue({ id: userId, email });
      mockAdapter.useVerificationToken.mockResolvedValue({
        expires: new Date(Date.now() - 1000) // expired date
      });

      const result = await emailVerificationService.verifyOTP(email, otp);

      expect(result).toEqual({
        success: false,
        error: 'Token has expired!'
      });
    });

    it('should verify OTP successfully and update user', async () => {
      mockAdapter.getUserByEmail.mockResolvedValue({ id: userId, email });
      mockAdapter.useVerificationToken.mockResolvedValue({
        expires: new Date(Date.now() + 1000) // future date
      });

      const result = await emailVerificationService.verifyOTP(email, otp);

      expect(result).toBe(true);
      expect(mockAdapter.updateUser).toHaveBeenCalledWith({
        id: userId,
        email,
        emailVerified: expect.any(Date)
      });
    });
  });
});
