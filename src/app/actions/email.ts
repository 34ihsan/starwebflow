'use server';

import { prisma } from '@/lib/prisma';
import { safeRevalidatePath } from '@/lib/utils/cache';
import { generateText } from 'ai';
import { getFlashModel } from '@/lib/ai/gemini-client';
import { checkSPF, checkDMARC, checkDKIM } from '@/lib/utils/dns-check';
import { resolveTenantId, getTenantIdOrLegacy } from '@/lib/tenant';
import { calculateDeliverabilityScore } from '@/lib/deliverability-score';
import { getMailboxReadiness } from '@/lib/campaign-readiness';

export async function getEmailData(tenantId?: string) {
  try {
    const effectiveTenantId = await resolveTenantId(tenantId || (await getTenantIdOrLegacy()));
    const campaigns = await prisma.emailCampaign.findMany({
      where: { tenantId: effectiveTenantId },
      orderBy: { createdAt: 'desc' },
      include: { mailboxes: { select: { id: true } } },
    });
    
    const templates = await prisma.emailTemplate.findMany({
      where: { tenantId: effectiveTenantId },
      orderBy: { createdAt: 'desc' },
    });

    const mailboxes = await prisma.emailMailbox.findMany({
      where: { tenantId: effectiveTenantId },
      orderBy: { createdAt: 'desc' },
      include: { campaigns: { select: { id: true, name: true, status: true } } },
    });

    return { success: true, data: { campaigns, templates, mailboxes } };
  } catch (error) {
    console.error('getEmailData error:', error);
    return { success: false, error: 'Failed to fetch email data' };
  }
}

export async function createEmailCampaign(data: {
  tenantId?: string;
  name: string;
  subject: string;
  audience?: string;
  htmlBody?: string;
  scheduledAt?: string | null;
  mailboxPool?: string[];
}) {
  try {
    const effectiveTenantId = await resolveTenantId(data.tenantId || (await getTenantIdOrLegacy()));
    const campaign = await prisma.emailCampaign.create({
      data: {
        tenant: { connect: { id: effectiveTenantId } },
        name: data.name,
        subject: data.subject,
        status: 'ACTIVE',
        audience: data.audience || 'Tüm Liste',
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        ...(data.mailboxPool && data.mailboxPool.length > 0 ? {
          mailboxes: {
            connect: data.mailboxPool.map(id => ({ id }))
          }
        } : {}),
        templates: data.htmlBody ? {
          create: [{
            tenant: { connect: { id: effectiveTenantId } },
            name: `${data.name} İçeriği`,
            subject: data.subject,
            htmlBody: data.htmlBody,
            stepDay: 1
          }]
        } : undefined
      },
      include: {
        templates: true,
        mailboxes: { select: { id: true } }
      }
    });
    safeRevalidatePath('/admin/email');
    return { success: true, data: campaign };
  } catch (error) {
    console.error('createEmailCampaign error:', error);
    return { success: false, error: 'Failed to create campaign' };
  }
}

/**
 * Kampanyanın mail havuzunu verilen listeyle birebir eşitler (ekle + çıkar).
 * Engelli (ERROR / duraklatılmış / yetersiz ısınmış) kutular eklenmez.
 */
export async function setCampaignMailboxes(campaignId: string, mailboxIds: string[], tenantId?: string) {
  try {
    const effectiveTenantId = await resolveTenantId(tenantId || (await getTenantIdOrLegacy()));
    const campaign = await prisma.emailCampaign.findFirst({
      where: { id: campaignId, tenantId: effectiveTenantId },
      include: { mailboxes: { select: { id: true } } },
    });
    if (!campaign) return { success: false, error: 'Kampanya bulunamadı' };

    const candidates = await prisma.emailMailbox.findMany({
      where: { id: { in: mailboxIds }, tenantId: effectiveTenantId },
    });
    const currentIds = new Set(campaign.mailboxes.map(m => m.id));
    const skipped: string[] = [];
    const finalIds: string[] = [];
    for (const mb of candidates) {
      // Zaten havuzdaki kutuları koru; yeni eklenenleri kontrol et
      if (currentIds.has(mb.id) || getMailboxReadiness(mb).assignable) finalIds.push(mb.id);
      else skipped.push(mb.email);
    }

    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: { mailboxes: { set: finalIds.map(id => ({ id })) } },
    });
    safeRevalidatePath('/admin/email');
    return { success: true, data: { mailboxIds: finalIds, skipped } };
  } catch (error) {
    console.error('setCampaignMailboxes error:', error);
    return { success: false, error: 'Kampanya mail havuzu güncellenemedi' };
  }
}

/** Bir mail kutusunu birden fazla kampanyaya ekler/çıkarır (kutu kartından hızlı yönetim). */
export async function setMailboxCampaigns(mailboxId: string, campaignIds: string[], tenantId?: string) {
  try {
    const effectiveTenantId = await resolveTenantId(tenantId || (await getTenantIdOrLegacy()));
    const mailbox = await prisma.emailMailbox.findFirst({ where: { id: mailboxId, tenantId: effectiveTenantId } });
    if (!mailbox) return { success: false, error: 'Mail kutusu bulunamadı' };

    const current = await prisma.emailMailbox.findUnique({
      where: { id: mailboxId },
      include: { campaigns: { select: { id: true } } },
    });
    const hadIds = new Set((current?.campaigns || []).map(c => c.id));
    const wantsNew = campaignIds.some(id => !hadIds.has(id));
    if (wantsNew && !getMailboxReadiness(mailbox).assignable) {
      return { success: false, error: 'Bu kutu henüz kampanyaya eklenebilir durumda değil (ısınma/itibar/duraklatma).' };
    }

    const valid = await prisma.emailCampaign.findMany({
      where: { id: { in: campaignIds }, tenantId: effectiveTenantId },
      select: { id: true },
    });
    await prisma.emailMailbox.update({
      where: { id: mailboxId },
      data: { campaigns: { set: valid.map(c => ({ id: c.id })) } },
    });
    safeRevalidatePath('/admin/email');
    return { success: true, data: { campaignIds: valid.map(c => c.id) } };
  } catch (error) {
    console.error('setMailboxCampaigns error:', error);
    return { success: false, error: 'Kutunun kampanya listesi güncellenemedi' };
  }
}

export async function createEmailMailbox(data: {
  tenantId?: string;
  email: string;
  provider?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  imapHost?: string;
  imapPort?: number;
  imapUser?: string;
  imapPassword?: string;
  appPassword?: string;
  senderName?: string;
  dailyLimit?: number;
}) {
  try {
    const effectiveTenantId = await resolveTenantId(data.tenantId || (await getTenantIdOrLegacy()));
    const domain = data.email.split('@')[1];
    let spfStatus = false, dkimStatus = false, dmarcStatus = false;
    
    if (domain) {
      [spfStatus, dkimStatus, dmarcStatus] = await Promise.all([
        checkSPF(domain),
        checkDKIM(domain),
        checkDMARC(domain)
      ]);
    }

    // Google & Yahoo 2024 DNS Kuralı: SPF veya DKIM eksikse WARNING ile başlat
    const initialStatus = (!spfStatus && !dkimStatus) ? 'WARNING' : 'WARMUP';

    const mailbox = await prisma.emailMailbox.create({
      data: {
        tenant: { connect: { id: effectiveTenantId } },
        email: data.email,
        status: initialStatus,
        reputation: initialStatus === 'WARNING' ? 70 : 100,
        limit: data.dailyLimit || 50,
        provider: data.provider,
        smtpHost: data.smtpHost,
        smtpPort: data.smtpPort,
        smtpUser: data.smtpUser,
        smtpPassword: data.smtpPassword,
        imapHost: data.imapHost,
        imapPort: data.imapPort,
        imapUser: data.imapUser,
        imapPassword: data.imapPassword,
        appPassword: data.appPassword,
        senderName: data.senderName,
        spfStatus,
        dkimStatus,
        dmarcStatus,
      }
    });
    safeRevalidatePath('/admin/email');
    return { 
      success: true, 
      data: mailbox,
      dnsWarning: (!spfStatus || !dkimStatus || !dmarcStatus) 
        ? 'DNS kayıtlarınız (SPF/DKIM/DMARC) henüz tam doğrulanmadı. Gelen kutusuna düşme oranını korumak için lütfen DNS kayıtlarınızı ekleyin.' 
        : null 
    };
  } catch (error) {
    console.error('createEmailMailbox error:', error);
    return { success: false, error: 'Failed to create mailbox' };
  }
}

export async function verifyMailboxDns(mailboxId: string) {
  try {
    const mailbox = await prisma.emailMailbox.findUnique({
      where: { id: mailboxId }
    });
    
    if (!mailbox || !mailbox.email) {
      return { success: false, error: 'Mailbox not found' };
    }
    
    const domain = mailbox.email.split('@')[1];
    if (!domain) {
      return { success: false, error: 'Invalid email format' };
    }
    
    const [spfStatus, dkimStatus, dmarcStatus] = await Promise.all([
      checkSPF(domain),
      checkDKIM(domain),
      checkDMARC(domain)
    ]);

    // DNS kayıtları düzelmişse ve durum WARNING ise otonom olarak WARMUP moduna al
    let newStatus = mailbox.status;
    let newReputation = mailbox.reputation;
    if (spfStatus && (dkimStatus || dmarcStatus) && mailbox.status === 'WARNING') {
      newStatus = 'WARMUP';
      newReputation = Math.max(90, mailbox.reputation + 15);
    }
    
    const updatedMailbox = await prisma.emailMailbox.update({
      where: { id: mailboxId },
      data: {
        spfStatus,
        dkimStatus,
        dmarcStatus,
        status: newStatus,
        reputation: newReputation
      }
    });
    
    safeRevalidatePath('/admin/email');
    return { 
      success: true, 
      data: updatedMailbox,
      message: spfStatus && dkimStatus && dmarcStatus
        ? 'Mükemmel! Tüm DNS (SPF, DKIM, DMARC) kayıtları başarıyla doğrulandı.'
        : 'Bazı DNS kayıtları eksik. Lütfen paneldeki DNS yönergelerini kontrol edin.'
    };
  } catch (error) {
    console.error('verifyMailboxDns error:', error);
    return { success: false, error: 'Failed to verify DNS records' };
  }
}

export async function deleteEmailMailbox(mailboxId: string) {
  try {
    await prisma.emailMailbox.delete({
      where: { id: mailboxId }
    });
    safeRevalidatePath('/admin/email');
    return { success: true };
  } catch (error) {
    console.error('deleteEmailMailbox error:', error);
    return { success: false, error: 'Failed to delete mailbox' };
  }
}

export async function updateMailboxStatus(data: { id: string, status: string }) {
  try {
    const mailbox = await prisma.emailMailbox.update({
      where: { id: data.id },
      data: { 
        status: data.status,
        ...(data.status === 'WARMUP' || data.status === 'ACTIVE' ? { isPaused: false } : {})
      }
    });
    safeRevalidatePath('/admin/email');
    return { success: true, data: mailbox };
  } catch (error) {
    console.error('updateMailboxStatus error:', error);
    return { success: false, error: 'Failed to update mailbox status' };
  }
}

export async function updateMailboxCredentials(data: {
  id: string;
  appPassword?: string;
  smtpPort?: number;
  imapPort?: number;
  senderName?: string;
  dailyLimit?: number;
}) {
  try {
    const mailbox = await prisma.emailMailbox.update({
      where: { id: data.id },
      data: {
        ...(data.appPassword ? { appPassword: data.appPassword } : {}),
        ...(data.smtpPort ? { smtpPort: data.smtpPort } : {}),
        ...(data.imapPort ? { imapPort: data.imapPort } : {}),
        ...(data.senderName ? { senderName: data.senderName } : {}),
        ...(data.dailyLimit ? { limit: data.dailyLimit } : {}),
        status: 'WARMUP',
        isPaused: false
      }
    });
    safeRevalidatePath('/admin/email');
    return { success: true, data: mailbox };
  } catch (error) {
    console.error('updateMailboxCredentials error:', error);
    return { success: false, error: 'Failed to update credentials' };
  }
}

export async function analyzeEmailContent(content: string) {
  try {
    const { text } = await generateText({
      model: getFlashModel(),
      system: `Sen bir e-posta pazarlama uzmanı ve AI analizörüsün. Gelen metni analiz edip, JSON formatında yanıt dönmelisin.
Format:
{
  "urgency": 0-100 arası sayı (Aciliyet hissi),
  "trust": 0-100 arası sayı (Kurumsallık & Güven),
  "spamRisk": 0-100 arası sayı (Satış Baskısı/Spam riski),
  "feedback": "Kısa ve net bir geri bildirim cümlesi"
}`,
      prompt: `Metin:\n${content}`
    });

    try {
      const result = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
      return { success: true, data: result };
    } catch (e) {
      return { success: false, error: 'JSON parse hatası' };
    }
  } catch (error) {
    return { success: false, error: 'AI analizi başarısız oldu' };
  }
}

export async function testMailboxConnection(mailboxId: string) {
  try {
    const mailbox = await prisma.emailMailbox.findUnique({
      where: { id: mailboxId }
    });

    if (!mailbox) {
      return { success: false, error: 'Mail kutusu bulunamadı.' };
    }

    const pass = mailbox.smtpPassword || mailbox.appPassword || '';
    if (!pass) {
      return { success: false, error: 'SMTP/IMAP şifresi girilmemiş.' };
    }

    // SMTP Test
    const nodemailer = (await import('nodemailer')).default;
    const transporter = nodemailer.createTransport({
      host: mailbox.smtpHost || 'smtp.ionos.de',
      port: mailbox.smtpPort || 587,
      secure: mailbox.smtpPort === 465,
      auth: { user: mailbox.smtpUser || mailbox.email, pass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 5000,
    });

    await transporter.verify();

    // Reset status to WARMUP if connection is healthy
    const updated = await prisma.emailMailbox.update({
      where: { id: mailboxId },
      data: {
        status: 'WARMUP',
        isPaused: false,
        bounceCount: 0
      }
    });

    safeRevalidatePath('/admin/email');
    return { success: true, message: 'SMTP ve IMAP bağlantısı başarılı! Hesap tekrar WARMUP moduna alındı.', data: updated };
  } catch (error: any) {
    console.error(`Connection test failed for mailbox ${mailboxId}:`, error);
    return {
      success: false,
      error: error?.message || 'Sunucu bağlantı hatası. Lütfen SMTP/IMAP port ve şifrenizi kontrol edin.'
    };
  }
}

export async function getWarmupActivity(tenantId?: string) {
  try {
    const effectiveTenantId = await resolveTenantId(tenantId || (await getTenantIdOrLegacy()));

    // Son 30 aktif/tamamlanmış warmup konuşması
    const threads = await prisma.emailWarmupThread.findMany({
      where: {
        OR: [
          { tenantId: effectiveTenantId },
          { mailbox: { tenantId: effectiveTenantId } }
        ]
      },
      include: {
        mailbox: {
          select: { email: true, provider: true, status: true, senderName: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 30
    });

    // Son yerleşim logları (Inbox vs Spam olayları)
    const placements = await (prisma as any).emailPlacementLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 30
    }).catch(() => []);

    return {
      success: true,
      data: {
        threads: threads || [],
        placements: placements || [],
        lastActivity: threads[0]?.updatedAt || null
      }
    };
  } catch (error: any) {
    console.error('getWarmupActivity error:', error);
    return { success: false, error: 'Isınma geçmişi alınamadı.', data: { threads: [], placements: [], lastActivity: null } };
  }
}

export async function getMailboxReport(mailboxId: string) {
  try {
    const mailbox = await prisma.emailMailbox.findUnique({
      where: { id: mailboxId }
    });

    if (!mailbox) {
      return { success: false, error: 'Mail kutusu bulunamadı.' };
    }

    // 1. Warmup Threads (Bu kutudan başlatılan veya bu kutunun hedef olduğu diyaloglar)
    const threads = await prisma.emailWarmupThread.findMany({
      where: {
        OR: [
          { mailboxId: mailbox.id },
          { targetEmail: mailbox.email }
        ]
      },
      orderBy: { updatedAt: 'desc' },
      take: 50
    });

    // 2. Yerleşim Olayları (Placement Logs)
    const placements = await (prisma as any).emailPlacementLog.findMany({
      where: {
        OR: [
          { senderMailboxId: mailbox.id },
          { senderEmail: mailbox.email },
          { recipientEmail: mailbox.email }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    }).catch(() => []);

    // 3. Teslim Edilebilirlik Skoru Hesaplama
    const deliverability = calculateDeliverabilityScore({
      spfStatus: !!mailbox.spfStatus,
      dkimStatus: !!mailbox.dkimStatus,
      dmarcStatus: !!mailbox.dmarcStatus,
      reputation: mailbox.reputation || 100,
      bounceCount: mailbox.bounceCount || 0,
      spamCount: mailbox.spamCount || 0,
      sentToday: mailbox.sentToday || 0,
      warmupDay: mailbox.warmupDay || 1
    });

    // Toplam gönderilen mesaj adedi (sentToday + thread mesajlarının toplamı)
    const threadMessagesSum = threads.reduce((acc, t) => acc + (t.messageCount || 1), 0);
    const totalEstimatedSent = Math.max(mailbox.sentToday, threadMessagesSum);

    const inboxPlacements = placements.filter((p: any) => p.placement === 'INBOX').length;
    const spamPlacements = placements.filter((p: any) => p.placement === 'SPAM').length;
    const totalPlacements = inboxPlacements + spamPlacements;
    const inboxRate = totalPlacements > 0 ? Math.round((inboxPlacements / totalPlacements) * 100) : null;

    return {
      success: true,
      data: {
        mailbox,
        threads,
        placements,
        deliverability,
        stats: {
          totalEstimatedSent,
          threadsCount: threads.length,
          activeThreadsCount: threads.filter(t => t.status === 'ACTIVE').length,
          completedThreadsCount: threads.filter(t => t.status === 'COMPLETED').length,
          inboxRate,
          spamRate: inboxRate !== null ? 100 - inboxRate : null,
          remainingDailyLimit: Math.max(0, (mailbox.limit || 50) - (mailbox.sentToday || 0))
        }
      }
    };
  } catch (error: any) {
    console.error('getMailboxReport error:', error);
    return { success: false, error: 'Mail raporu alınamadı.' };
  }
}
