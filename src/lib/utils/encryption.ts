import crypto from 'crypto';

export class EncryptionUtilities {
  private static algorithm = 'aes-256-gcm';
  private static ivLength = 16;
  private static saltLength = 64;
  private static tagLength = 16;

  // Derive encryption key from password
  private static async deriveKey(
    password: string, 
    salt: Buffer
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(
        password, 
        salt, 
        100000, 
        32, 
        'sha512', 
        (err, derivedKey) => {
          if (err) reject(err);
          resolve(derivedKey);
        }
      );
    });
  }

  // Encrypt data with authenticated encryption
  static async encrypt(
    data: string, 
    password: string
  ): Promise<string> {
    // Generate salt and IV
    const salt = crypto.randomBytes(this.saltLength);
    const iv = crypto.randomBytes(this.ivLength);

    // Derive encryption key
    const key = await this.deriveKey(password, salt);

    // Create cipher
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    // Encrypt data
    const encrypted = Buffer.concat([
      cipher.update(data, 'utf8'),
      cipher.final()
    ]);

    // Get authentication tag
    const tag = cipher.getAuthTag();

    // Combine all parts
    return Buffer.concat([
      salt, 
      iv, 
      tag, 
      encrypted
    ]).toString('base64');
  }

  // Decrypt data
  static async decrypt(
    encryptedData: string, 
    password: string
  ): Promise<string> {
    // Decode base64
    const buffer = Buffer.from(encryptedData, 'base64');

    // Extract components
    const salt = buffer.slice(0, this.saltLength);
    const iv = buffer.slice(this.saltLength, this.saltLength + this.ivLength);
    const tag = buffer.slice(
      this.saltLength + this.ivLength, 
      this.saltLength + this.ivLength + this.tagLength
    );
    const encrypted = buffer.slice(this.saltLength + this.ivLength + this.tagLength);

    // Derive key
    const key = await this.deriveKey(password, salt);

    // Create decipher
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(tag);

    // Decrypt data
    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]).toString('utf8');
  }

  // Generate a secure random encryption key
  static generateKey(length = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
}