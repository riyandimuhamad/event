import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 12 bytes recommended for GCM
const TAG_LENGTH = 16;

function getKey(): Buffer {
  const envKey = process.env.DATA_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  return Buffer.from(envKey, 'hex');
}

/**
 * Encrypt sensitive plain text into Buffer storing [IV(12) + TAG(16) + CIPHERTEXT]
 */
export function encryptData(plainText: string): Buffer {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]);
}

/**
 * Decrypt Buffer into original plain text
 */
export function decryptData(encryptedBuffer: Buffer): string {
  if (encryptedBuffer.length < IV_LENGTH + TAG_LENGTH) {
    throw new Error('Invalid encrypted payload length');
  }
  const iv = encryptedBuffer.subarray(0, IV_LENGTH);
  const tag = encryptedBuffer.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const ciphertext = encryptedBuffer.subarray(IV_LENGTH + TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(tag);
  return decipher.update(ciphertext, undefined, 'utf8') + decipher.final('utf8');
}

/**
 * Mask national identity number e.g. ****1234
 */
export function maskIdentity(plainOrDecrypted: string): string {
  if (plainOrDecrypted.length <= 4) {
    return '****';
  }
  return '****' + plainOrDecrypted.slice(-4);
}
