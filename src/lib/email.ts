/**
 * ─── StarWebflow — Merkezi Email Servisi ──────────────────────────────────────
 * Tüm Resend gönderim işlemleri bu dosyadan yönetilir.
 *
 * Kullanım:
 *   import { sendLeadNotification, sendProposalEmail } from '@/lib/email'
 *
 * "From" adresi .env'den okunur:
 *   - Test (domain doğrulanmadan): RESEND_FROM_EMAIL=StarWebflow <onboarding@resend.dev>
 *   - Prod (domain doğrulandıktan): RESEND_FROM_EMAIL=StarWebflow <info@starwebflow.com>
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/** Standart "from" adresi — tüm outbound mailler bu adresten çıkar */
const FROM = process.env.RESEND_FROM_EMAIL || 'StarWebflow <onboarding@resend.dev>';

/** Admin bildirimleri bu adrese gider (info@starwebflow.com) */
const ADMIN_EMAIL = process.env.RESEND_ADMIN_EMAIL || 'info@starwebflow.com';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Lead / İletişim Formu — Ziyaretçiye giden hoş geldin maili
// ─────────────────────────────────────────────────────────────────────────────
export async function sendProposalEmail({
  to,
  name,
  subject,
  html,
  replyTo,
}: {
  to: string;
  name: string;
  subject: string;
  html: string;
  replyTo?: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn(`[Email] RESEND_API_KEY yok — simüle edildi → ${to}`);
    return { success: true, simulated: true };
  }
  try {
    const result = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
      replyTo: replyTo || ADMIN_EMAIL,
    });
    console.log(`[Email] Proposal gönderildi → ${to}`, result);
    return { success: true, data: result };
  } catch (error: any) {
    console.error(`[Email] Proposal gönderilemedi → ${to}`, error);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Admin Bildirimi — Her yeni lead geldiğinde info@starwebflow.com'a gönderilir
// ─────────────────────────────────────────────────────────────────────────────
export async function sendLeadNotification({
  name,
  email,
  phone,
  company,
  industry,
  serviceType,
  message,
  source,
  budget,
}: {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  industry?: string;
  serviceType?: string;
  message?: string;
  source?: string;
  budget?: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn(`[Email] RESEND_API_KEY yok — admin bildirim simüle edildi`);
    return { success: true, simulated: true };
  }

  const rowData: [string, string][] = [
    ['Ad Soyad', name],
    ['E-posta', email],
    ...(phone ? [['Telefon', phone] as [string, string]] : []),
    ...(company ? [['Şirket', company] as [string, string]] : []),
    ...(industry ? [['Sektör', industry] as [string, string]] : []),
    ...(serviceType ? [['Hizmet', serviceType] as [string, string]] : []),
    ...(budget ? [['Bütçe', budget] as [string, string]] : []),
    ...(source ? [['Kaynak', source] as [string, string]] : []),
    ...(message ? [['Mesaj', message] as [string, string]] : []),
  ];

  const rows = rowData
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px;font-weight:600;color:#94a3b8;white-space:nowrap;">${label}</td><td style="padding:8px 12px;color:#e2e8f0;">${value}</td></tr>`
    )
    .join('');


  const html = `
    <div style="font-family:system-ui,sans-serif;background:#0a0a0f;color:#e2e8f0;padding:32px;border-radius:12px;max-width:600px;margin:0 auto;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
        <div style="background:#8b5cf6;border-radius:8px;padding:8px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
        </div>
        <h2 style="margin:0;font-size:18px;color:#fff;">🔔 Yeni Lead Geldi!</h2>
      </div>
      <table style="width:100%;border-collapse:collapse;background:#131b2a;border-radius:8px;overflow:hidden;">
        ${rows}
      </table>
      <div style="margin-top:24px;padding:16px;background:#1e1b4b;border-radius:8px;border-left:3px solid #8b5cf6;">
        <p style="margin:0;font-size:13px;color:#a78bfa;">
          Bu bildirim otomatik olarak StarWebflow sisteminden gönderilmiştir.<br/>
          Lead detayları için → <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/leads" style="color:#8b5cf6;">Admin Paneli</a>
        </p>
      </div>
    </div>
  `;

  try {
    const result = await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `🔔 Yeni Lead: ${name} — ${source || 'Website'}`,
      html,
    });
    console.log(`[Email] Admin bildirimi gönderildi`, result);
    return { success: true, data: result };
  } catch (error: any) {
    console.error(`[Email] Admin bildirimi gönderilemedi`, error);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Outreach Maili — Toplu kampanya için (outreachEngine.ts kullanır)
// ─────────────────────────────────────────────────────────────────────────────
export async function sendOutreachEmail({
  from,
  to,
  subject,
  html,
  replyTo,
}: {
  from: string;
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn(`[Email] RESEND_API_KEY yok — outreach simüle edildi → ${to}`);
    return { success: true, simulated: true };
  }
  try {
    const result = await resend.emails.send({
      from: `StarWebflow <${from}>`,
      to,
      subject,
      html,
      replyTo: replyTo || from,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
      },
    });
    return { success: true, data: result };
  } catch (error: any) {
    console.error(`[Email] Outreach gönderilemedi → ${to}`, error);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Genel İletişim Formu Bildirim Maili (CTABanner'daki proje başvuru formu)
// ─────────────────────────────────────────────────────────────────────────────
export async function sendContactFormNotification({
  name,
  email,
  phone,
  company,
  projectType,
  budget,
  message,
  language,
}: {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  projectType?: string;
  budget?: string;
  message?: string;
  language?: string;
}) {
  // Admin'e bildirim gönder
  await sendLeadNotification({
    name,
    email,
    phone,
    company,
    serviceType: projectType,
    budget,
    message,
    source: 'CTA İletişim Formu',
  });

  // Ziyaretçiye otomatik teşekkür maili gönder
  const isEN = language === 'en';
  const isDE = language === 'de';

  const subjectMap: Record<string, string> = {
    tr: `Başvurunuzu aldık, ${name}! — StarWebflow`,
    en: `We received your request, ${name}! — StarWebflow`,
    de: `Wir haben Ihre Anfrage erhalten, ${name}! — StarWebflow`,
  };

  const bodyMap: Record<string, string> = {
    tr: `
      <p>Merhaba <strong>${name}</strong>,</p>
      <p>Proje başvurunuzu başarıyla aldık. Teknik ekibimiz en geç <strong>24 saat</strong> içinde sizinle iletişime geçecek ve ücretsiz strateji görüşmenizi planlayacak.</p>
      <p>Bu süreçte herhangi bir sorunuz olursa bu e-postayı yanıtlayabilirsiniz.</p>
      <p>İyi çalışmalar,<br/><strong>StarWebflow Ekibi</strong></p>
    `,
    en: `
      <p>Hello <strong>${name}</strong>,</p>
      <p>We successfully received your project inquiry. Our technical team will contact you within <strong>24 hours</strong> to schedule your free strategy consultation.</p>
      <p>If you have any questions in the meantime, feel free to reply to this email.</p>
      <p>Best regards,<br/><strong>StarWebflow Team</strong></p>
    `,
    de: `
      <p>Hallo <strong>${name}</strong>,</p>
      <p>Wir haben Ihre Projektanfrage erfolgreich erhalten. Unser technisches Team wird sich innerhalb von <strong>24 Stunden</strong> bei Ihnen melden, um Ihr kostenloses Strategiegespräch zu planen.</p>
      <p>Bei Fragen können Sie gerne auf diese E-Mail antworten.</p>
      <p>Mit freundlichen Grüßen,<br/><strong>Das StarWebflow Team</strong></p>
    `,
  };

  const lang = (language || 'tr') as keyof typeof subjectMap;
  const subject = subjectMap[lang] || subjectMap.tr;
  const bodyContent = bodyMap[lang] || bodyMap.tr;

  const html = `
    <div style="font-family:system-ui,sans-serif;background:#0a0a0f;color:#e2e8f0;padding:32px;border-radius:12px;max-width:600px;margin:0 auto;">
      <div style="text-align:center;margin-bottom:32px;">
        <img src="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/starwebflow_banner_1.png" alt="StarWebflow" style="height:48px;object-fit:contain;" />
      </div>
      <div style="background:#131b2a;border-radius:12px;padding:24px;line-height:1.7;font-size:15px;">
        ${bodyContent}
      </div>
      <div style="margin-top:24px;text-align:center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" style="display:inline-block;background:linear-gradient(135deg,#8b5cf6,#6d28d9);color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;">
          starwebflow.com
        </a>
      </div>
      <p style="margin-top:24px;font-size:11px;color:#475569;text-align:center;">
        © ${new Date().getFullYear()} StarWebflow. Bu e-posta otomatik olarak gönderilmiştir.
      </p>
    </div>
  `;

  return sendProposalEmail({ to: email, name, subject, html });
}
