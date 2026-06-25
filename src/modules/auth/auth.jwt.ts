const encoder = new TextEncoder();

/**
 * Signs a payload into a JWT using the HS256 algorithm and standard WebCrypto API.
 * This runs seamlessly in Node.js and Next.js Edge Runtime.
 */
export async function signJWT(payload: any, secret: string, expireInSeconds: number = 86400): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const exp = now + expireInSeconds;

  const fullPayload = { ...payload, iat: now, exp };

  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64Payload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(`${base64Header}.${base64Payload}`)
  );

  const base64Signature = Buffer.from(signature).toString('base64url');
  return `${base64Header}.${base64Payload}.${base64Signature}`;
}

/**
 * Verifies a JWT and returns its payload if valid, otherwise returns null.
 * Uses the WebCrypto API and is fully Edge Middleware compatible.
 */
export async function verifyJWT(token: string, secret: string): Promise<any | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureBuffer = Buffer.from(signature, 'base64url');
    const dataBuffer = encoder.encode(`${header}.${payload}`);

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBuffer,
      dataBuffer
    );

    if (!isValid) return null;

    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));

    // Expire check
    const now = Math.floor(Date.now() / 1000);
    if (decodedPayload.exp && decodedPayload.exp < now) {
      return null;
    }

    return decodedPayload;
  } catch {
    return null;
  }
}
