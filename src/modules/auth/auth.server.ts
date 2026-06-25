import { cookies } from 'next/headers';
import { verifyJWT } from './auth.jwt';
import { getJwtSecret } from '@/lib/config';

export async function getServerSession() {
  try {
    const cookieStore = cookies();
    const rawToken = cookieStore.get('next-auth.session-token')?.value;
    if (!rawToken) return null;
    
    const token = decodeURIComponent(rawToken);
    return await verifyJWT(token, getJwtSecret());
  } catch (error) {
    return null;
  }
}
