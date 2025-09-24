import crypto from 'crypto'

// AES-256-GCM encryption/decryption helpers
// Requires env: MOODLE_TOKEN_ENC_KEY (base64-encoded 32 bytes)

function getKey(): Buffer {
  const b64 = process.env.MOODLE_TOKEN_ENC_KEY
  if (!b64) throw new Error('Missing MOODLE_TOKEN_ENC_KEY')
  const key = Buffer.from(b64, 'base64')
  if (key.length !== 32) throw new Error('MOODLE_TOKEN_ENC_KEY must be base64 for 32-byte key (AES-256)')
  return key
}

export function encrypt(text: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(12) // GCM standard IV length
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  // Return as base64: iv.ciphertext.tag
  return [iv.toString('base64'), encrypted.toString('base64'), tag.toString('base64')].join('.')
}

export function decrypt(payload: string): string {
  const key = getKey()
  const [ivB64, dataB64, tagB64] = payload.split('.')
  if (!ivB64 || !dataB64 || !tagB64) throw new Error('Invalid encrypted payload format')
  const iv = Buffer.from(ivB64, 'base64')
  const data = Buffer.from(dataB64, 'base64')
  const tag = Buffer.from(tagB64, 'base64')
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()])
  return decrypted.toString('utf8')
}
