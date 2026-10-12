import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/modules/auth/auth.server';
import { resolveTenantId } from '@/lib/tenant';
import { getPlacementStats } from '@/lib/warmup/placement';
import { computeMailboxHealth } from '@/lib/warmup/health';
import { generateWarmupContent, WarmupMailboxMeta } from '@/lib/warmup/engine';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const STAFF_ROLES = ['SUPER_ADMIN', 'AGENCY_OWNER', 'AGENCY_MEMBER'];

async function requireStaff() {
  const session: any = await getServerSession();
  if (!session?.tenantId || !STAFF_ROLES.includes(session.role)) return null;
  return { tenantId: resolveTenantId(session.tenantId), role: session.role as string };
}

/** GET: kendi kutularının 7 günlük gerçek inbox/spam yerleşimi + sağlık skoru */
export async function GET() {
  const session = await requireStaff();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const mailboxes = await prisma.emailMailbox.findMany({ where: { tenantId: session.tenantId } });
  const stats = await getPlacementStats(mailboxes.map((m) => m.email), 7);

  const items = mailboxes.map((m) => {
    const st = stats.get(m.email.toLowerCase())!;
    return {
      id: m.id,
      email: m.email,
      inbox: st.inbox,
      spam: st.spam,
      total: st.total,
      inboxRate: st.inboxRate,
      spamRate: st.spamRate,
      health: computeMailboxHealth({
        reputation: m.reputation,
        bounceCount: m.bounceCount,
        spamCount: m.spamCount,
        spammed: st.spam,
        spfStatus: m.spfStatus,
        dkimStatus: m.dkimStatus,
        dmarcStatus: m.dmarcStatus,
        createdAt: m.createdAt,
      }),
    };
  });

  const measured = items.filter((i) => i.inboxRate !== null);
  const overall = measured.length
    ? Math.round(measured.reduce((a, i) => a + (i.inboxRate as number), 0) / measured.length)
    : null;

  return NextResponse.json({ success: true, overallInboxRate: overall, mailboxes: items });
}

/**
 * POST { mailboxId }: Seed testi. Seçilen kutudan havuzdaki farklı domain'deki kutulara probe mail yollar.
 * Sonuç (inbox/spam) bir sonraki IMAP taramasında (warmup çalıştırıldığında) ölçülür ve GET'te görünür.
 */
export async function POST(req: Request) {
  const session = await requireStaff();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { mailboxId } = await req.json().catch(() => ({}));
  if (!mailboxId) return NextResponse.json({ error: 'mailboxId gerekli' }, { status: 400 });

  const sender = await prisma.emailMailbox.findFirst({ where: { id: mailboxId, tenantId: session.tenantId } });
  if (!sender) return NextResponse.json({ error: 'Kutu bulunamadı' }, { status: 404 });

  const pass = sender.smtpPassword || sender.appPassword || '';
  if (!sender.smtpHost || !pass) {
    return NextResponse.json({ error: 'SMTP bilgileri eksik' }, { status: 400 });
  }

  const senderDomain = sender.email.split('@')[1]?.toLowerCase();
  const pool = await prisma.emailMailbox.findMany({
    where: { OR: [{ status: 'WARMUP' }, { status: 'ACTIVE' }], isPaused: false, id: { not: sender.id } },
  });
  const targets = pool
    .filter((p) => (p.email.split('@')[1] || '').toLowerCase() !== senderDomain)
    .sort(() => 0.5 - Math.random())
    .slice(0, 6);

  if (targets.length === 0) {
    return NextResponse.json({ error: 'Test için farklı domain\'de havuz kutusu yok' }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    host: sender.smtpHost,
    port: sender.smtpPort || 587,
    secure: sender.smtpPort === 465,
    auth: { user: sender.smtpUser || sender.email, pass },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 5000,
  } as any);

  let sent = 0;
  const errors: string[] = [];
  for (const t of targets) {
    try {
      const content = await generateWarmupContent({
        sender: sender as unknown as WarmupMailboxMeta,
        recipient: t as unknown as WarmupMailboxMeta,
        existingThread: null,
      });
      await transporter.sendMail({
        from: `${sender.senderName || 'StarWebFlow'} <${sender.email}>`,
        to: t.email,
        subject: content.subject,
        html: `${content.body}\n<!-- swf-warmup-token: seedtest-${Date.now()} -->`,
      });
      sent++;
    } catch (e: any) {
      errors.push(`${t.email}: ${e?.message || 'gönderilemedi'}`);
    }
  }

  return NextResponse.json({
    success: sent > 0,
    sent,
    attempted: targets.length,
    errors,
    message: sent > 0
      ? `${sent} probe gönderildi. Sonuçlar bir sonraki IMAP taramasında (Isıtmayı Çalıştır) ölçülüp yerleşim oranına eklenecek.`
      : 'Probe gönderilemedi.',
  });
}
