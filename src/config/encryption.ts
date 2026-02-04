import crypto from 'crypto';
import os from 'os';

// encryption constants
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const ENCRYPTION_PREFIX = 'enc:v1:';

/**
 * derives machine-specific encryption key from system properties
 * uses hostname, homedir, and platform to create a unique key per machine
 */
function deriveKey(): Buffer {
  const machineInfo = [os.hostname(), os.homedir(), os.platform()].join(':');
  return crypto.createHash('sha256').update(machineInfo).digest();
}

/**
 * checks if a value is already encrypted using our format
 */
export function isEncrypted(value: string): boolean {
  return value.startsWith(ENCRYPTION_PREFIX);
}

/**
 * encrypts plaintext using AES-256-GCM with machine-derived key
 * returns format: enc:v1:<iv>:<authTag>:<ciphertext> (all base64)
 */
export function encrypt(plainText: string): string {
  const key = deriveKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const parts = [iv.toString('base64'), authTag.toString('base64'), encrypted.toString('base64')];

  return ENCRYPTION_PREFIX + parts.join(':');
}

/**
 * decrypts value encrypted with our format
 * throws if decryption fails (wrong key, tampered data, etc.)
 */
export function decrypt(encryptedValue: string): string {
  if (!isEncrypted(encryptedValue)) {
    throw new Error('Value is not encrypted with the expected format');
  }

  const payload = encryptedValue.slice(ENCRYPTION_PREFIX.length);
  const parts = payload.split(':');

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted format');
  }

  const [ivB64, authTagB64, ciphertextB64] = parts;
  const key = deriveKey();
  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(authTagB64, 'base64');
  const ciphertext = Buffer.from(ciphertextB64, 'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

  return decrypted.toString('utf8');
}
