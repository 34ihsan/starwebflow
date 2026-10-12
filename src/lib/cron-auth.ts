import { getServerSession } from '@/modules/auth/auth.server';

const STAFF_ROLES = ['SUPER_ADMIN', 'AGENCY_OWNER', 'AGENCY_MEMBER'];

export interface CronAuthResult {
  ok: boolean;
  via?: 'secret' | 'session';
  tenantId?: string;
  role?: string;
  reason?: string;
}

/**
 * Cron/admin endpoint authorization:
 *  1. Valid CRON_SECRET (Authorization: Bearer <secret> or ?key=<secret>) -> cron runner
 *  2. Otherwise a logged-in agency staff session (admin panel manual trigger)
 * If CRON_SECRET is not configured, only the session path works (fail closed).
 */
export async function authorizeCronOrStaff(req: Request): Promise<CronAuthResult> {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const bearer = req.headers.get('authorization');
    const key = new URL(req.url).searchParams.get('key');
    if (bearer === `Bearer ${secret}` || key === secret) return { ok: true, via: 'secret' };
  }

  const session: any = await getServerSession();
  if (session?.tenantId && STAFF_ROLES.includes(session.role)) {
    return { ok: true, via: 'session', tenantId: session.tenantId, role: session.role };
  }

  return {
    ok: false,
    reason: secret ? 'Unauthorized' : 'Unauthorized (CRON_SECRET is not configured; only staff sessions are accepted)'
  };
}
