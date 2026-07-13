const encoder = new TextEncoder();
const decoder = new TextDecoder();

function encodeBase64Url(input: string | Uint8Array | ArrayBuffer): string {
  let bytes: Uint8Array;
  if (typeof input === 'string') {
    bytes = encoder.encode(input);
  } else if (input instanceof ArrayBuffer) {
    bytes = new Uint8Array(input);
  } else {
    bytes = input;
  }
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeBase64Url(base64url: string): string {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return decoder.decode(bytes);
}

function decodeBase64UrlToBytes(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Signs a payload into a JWT using the HS256 algorithm and standard WebCrypto API.
 * This runs seamlessly in Node.js and Next.js Edge Runtime.
 */
export async function signJWT(payload: any, secret: string, expireInSeconds: number = 86400): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const exp = now + expireInSeconds;

  const fullPayload = { ...payload, iat: now, exp };

  const base64Header = encodeBase64Url(JSON.stringify(header));
  const base64Payload = encodeBase64Url(JSON.stringify(fullPayload));

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

  const base64Signature = encodeBase64Url(signature);
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

    const signatureBytes = decodeBase64UrlToBytes(signature);
    const dataBuffer = encoder.encode(`${header}.${payload}`);

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      dataBuffer
    );

    if (!isValid) return null;

    const decodedPayload = JSON.parse(decodeBase64Url(payload));

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
