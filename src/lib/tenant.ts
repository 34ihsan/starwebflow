import { getServerSession } from '@/modules/auth/auth.server';

export const LEGACY_TENANT_ID = 'default-tenant';

/**
 * TENANT_ALIASES="sessionTenantId=dataTenantId,other=target"
 * Eski kurulumlarda veri 'default-tenant' altında dururken kullanıcı oturumları farklı bir tenant id'sine
 * bağlı olabilir. Alias eşlemesi, veriyi taşımadan oturum tenant'ını verinin durduğu tenant'a çözer.
 * TENANT_ALIASES tanımlı değilse (eski kurulum): tüm personel mevcut davranış gibi 'default-tenant' çalışma alanına çözülür.
 * TENANT_ALIASES tanımlıysa: eşleşmesi olan tenant'lar hedefe, olmayanlar kendi id'sine çözülür (gerçek multi-tenant).
 */
function parseAliases(): Record<string, string> {
  const raw = process.env.TENANT_ALIASES || '';
  const map: Record<string, string> = {};
  raw.split(',').forEach((pair) => {
    const [from, to] = pair.split('=').map((s) => s?.trim());
    if (from && to) map[from] = to;
  });
  return map;
}

export function resolveTenantId(sessionTenantId: string): string {
  if (process.env.TENANT_ALIASES === undefined) return LEGACY_TENANT_ID;
  return parseAliases()[sessionTenantId] || sessionTenantId;
}

const STAFF_ROLES = ['SUPER_ADMIN', 'AGENCY_OWNER', 'AGENCY_MEMBER'];

/** Giriş yapmış ajans personelinin çalışma alanı tenant'ı (alias çözülmüş). Yetkisizse null. */
export async function getStaffTenantId(): Promise<string | null> {
  const session: any = await getServerSession();
  if (!session?.tenantId || !STAFF_ROLES.includes(session.role)) return null;
  return resolveTenantId(session.tenantId);
}

/** Sayfalar için: oturum varsa çözülmüş tenant, yoksa eski varsayılan (mevcut davranış korunur) */
export async function getTenantIdOrLegacy(): Promise<string> {
  return (await getStaffTenantId()) || LEGACY_TENANT_ID;
}
