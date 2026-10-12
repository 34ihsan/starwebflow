import { prisma } from '@/lib/prisma';

export interface PlacementStat {
  email: string;
  inbox: number;
  spam: number;
  total: number;
  /** 0-100, null = yeterli veri yok */
  inboxRate: number | null;
  spamRate: number | null;
}

const MIN_SAMPLE = 5;
// prisma client'ı `prisma generate` öncesi tip hatası vermesin diye gevşek erişim
const db = prisma as any;

/** IMAP taramasında görülen yerleşim olaylarını kaydeder. Tablo yoksa sessizce atlar (warmup bozulmaz). */
export async function recordPlacements(
  recipientEmail: string,
  events: { sender: string; folder: 'INBOX' | 'SPAM' }[] | undefined,
  mailboxIdByEmail: Map<string, string>,
  source: 'WARMUP' | 'SEED_TEST' = 'WARMUP'
) {
  if (!events || events.length === 0) return;
  const rows = events
    .filter((e) => e.sender && e.sender !== recipientEmail.toLowerCase())
    .map((e) => ({
      senderMailboxId: mailboxIdByEmail.get(e.sender) || null,
      senderEmail: e.sender,
      recipientEmail: recipientEmail.toLowerCase(),
      placement: e.folder,
      source,
    }));
  if (rows.length === 0) return;
  try {
    await db.emailPlacementLog.createMany({ data: rows });
  } catch (err: any) {
    console.warn('[PLACEMENT] Kayıt yazılamadı (email_placement_logs tablosu var mı?):', err?.message);
  }
}

/** Son N gün için gönderici bazlı yerleşim istatistikleri */
export async function getPlacementStats(senderEmails: string[], days = 7): Promise<Map<string, PlacementStat>> {
  const out = new Map<string, PlacementStat>();
  const emails = senderEmails.map((e) => e.toLowerCase());
  emails.forEach((email) => out.set(email, { email, inbox: 0, spam: 0, total: 0, inboxRate: null, spamRate: null }));
  if (emails.length === 0) return out;

  try {
    const since = new Date(Date.now() - days * 86400000);
    const grouped = await db.emailPlacementLog.groupBy({
      by: ['senderEmail', 'placement'],
      where: { senderEmail: { in: emails }, createdAt: { gte: since } },
      _count: { _all: true },
    });
    for (const g of grouped) {
      const s = out.get(g.senderEmail);
      if (!s) continue;
      if (g.placement === 'SPAM') s.spam += g._count._all;
      else s.inbox += g._count._all;
    }
  } catch (err: any) {
    console.warn('[PLACEMENT] İstatistik okunamadı:', err?.message);
  }

  out.forEach((s) => {
    s.total = s.inbox + s.spam;
    if (s.total >= MIN_SAMPLE) {
      s.inboxRate = Math.round((s.inbox / s.total) * 100);
      s.spamRate = 100 - s.inboxRate;
    }
  });
  return out;
}

/** Spam oranına göre karantina kararı: yeterli örnek varsa ve spam >= %40 ise ısıtmayı duraklat */
export function shouldQuarantine(stat: PlacementStat | undefined): boolean {
  return !!stat && stat.total >= 10 && (stat.spamRate ?? 0) >= 40;
}
