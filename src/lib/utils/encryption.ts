import crypto from 'crypto';

// In a real app, use a strong env variable for encryption key
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'starwebflow_default_secret_key__';
// Ensure key is exactly 32 bytes
const keyBuffer = Buffer.alloc(32);
keyBuffer.write(ENCRYPTION_KEY.substring(0, 32));
const IV_LENGTH = 16; 

export function encrypt(text: string): string {
  if (!text) return text;
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (e) {
    console.error('Encryption failed:', e);
    return text; 
  }
}

export function decrypt(text: string): string {
  if (!text || !text.includes(':')) return text;
  try {
    const textParts = text.split(':');
    const ivHex = textParts.shift();
    if (!ivHex) return text;
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (e) {
    console.error('Decryption failed:', e);
    return text;
  }
}
