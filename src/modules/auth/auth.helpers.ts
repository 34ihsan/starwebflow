import { verifyJWT } from './auth.jwt';
import { getJwtSecret } from '../../lib/config';

/**
 * Reusable helper to extract and verify JWT session payload from request headers/cookies.
 * Handles URL-encoded cookie values (e.g. %3D padding characters from Set-Cookie).
 */
export async function getSession(req: Request) {
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(/next-auth\.session-token=([^;]+)/);
  const rawToken = match ? match[1] : null;

  if (!rawToken) return null;

  // Decode URI-encoded characters that browsers may encode in cookie values
  const token = decodeURIComponent(rawToken);

  return await verifyJWT(token, getJwtSecret());
}
