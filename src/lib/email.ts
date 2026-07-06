/**
 * ─── StarWebflow — Merkezi Email Servisi (Nodemailer + Hostinger SMTP) ─────────
 *
 * Resend'den Hostinger SMTP'ye geçildi.
 * Tamamen ücretsiz, sınırsız (VPS kapasitesiyle).
 *
 * .env gereksinimleri:
 *   SMTP_HOST=smtp.hostinger.com
 *   SMTP_PORT=465
 *   SMTP_USER=info@starwebflow.com
 *   SMTP_PASS=<hostinger_mail_şifreniz>
 *   SMTP_FROM_NAME=StarWebflow
 *   RESEND_ADMIN_EMAIL=info@starwebflow.com
 *   NEXT_PUBLIC_APP_URL=https://www.starwebflow.com
 */

import nodemailer from 'nodemailer';

// ─── SMTP Transporter ──────────────────────────────────────────────────────────
function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.ionos.de';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || 'info@starwebflow.com';
  const pass = process.env.SMTP_PASS || '';

  if (!pass) {
    console.warn('[Email] SMTP_PASS ayarlanmamış — mail gönderimi simüle edilecek');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,   // 465 → SSL/TLS, 587 → STARTTLS (IONOS için false)
    auth: { user, pass },
    pool: true,             // Bağlantı havuzu — performans
    maxConnections: 5,
    socketTimeout: 30000,
    connectionTimeout: 30000,
    // IONOS 2024'ten itibaren gönderen adresi auth.user ile aynı olmalı
    tls: {
      rejectUnauthorized: true, // IONOS güvenilir CA kullanıyor
    },
  });
}

const transporter = createTransporter();

/** Standart "from" adresi */
const FROM_NAME = process.env.SMTP_FROM_NAME || 'StarWebflow';
const FROM_USER = process.env.SMTP_USER || 'info@starwebflow.com';
const FROM = `${FROM_NAME} <${FROM_USER}>`;

/** Admin bildirimleri bu adrese gider */
const ADMIN_EMAIL = process.env.RESEND_ADMIN_EMAIL || FROM_USER;

/** APP URL (mail içindeki linkler için) */
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.starwebflow.com';

// ─── Temel gönderim fonksiyonu ──────────────────────────────────────────────────
async function sendMail({
  to,
  subject,
  html,
  from,
  replyTo,
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}): Promise<{ success: boolean; data?: any; error?: string; simulated?: boolean }> {
  const smtpPass = process.env.SMTP_PASS;

  // SMTP şifresi yoksa simüle et (geliştirme ortamı)
  if (!smtpPass) {
    console.warn(`[Email] SMTP_PASS yok — simüle edildi → ${to} | Konu: ${subject}`);
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: from || FROM,
      to,
      subject,
      html,
      replyTo: replyTo || ADMIN_EMAIL,
    });
    console.log(`[Email] ✅ Gönderildi → ${to} | MessageId: ${info.messageId}`);
    return { success: true, data: { messageId: info.messageId } };
  } catch (error: any) {
    console.error(`[Email] ❌ Gönderilemedi → ${to}`, error.message);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Ziyaretçiye Teklif / Teşekkür Maili
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
  return sendMail({ to, subject, html, replyTo: replyTo || ADMIN_EMAIL });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Admin Bildirimi — Her yeni lead geldiğinde info@starwebflow.com'a
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
          Lead detayları için → <a href="${APP_URL}/admin/leads" style="color:#8b5cf6;">Admin Paneli</a>
        </p>
      </div>
    </div>
  `;

  return sendMail({
    to: ADMIN_EMAIL,
    subject: `🔔 Yeni Lead: ${name} — ${source || 'Website'}`,
    html,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Outreach Maili — Toplu kampanya (outreachEngine.ts kullanır)
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
  return sendMail({
    from: `StarWebflow <${from}>`,
    to,
    subject,
    html,
    replyTo: replyTo || from,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. İletişim Formu Bildirimi (CTABanner + LeadFormModal)
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
        <img src="${APP_URL}/starwebflow_banner_1.png" alt="StarWebflow" style="height:48px;object-fit:contain;" />
      </div>
      <div style="background:#131b2a;border-radius:12px;padding:24px;line-height:1.7;font-size:15px;">
        ${bodyContent}
      </div>
      <div style="margin-top:24px;text-align:center;">
        <a href="${APP_URL}" style="display:inline-block;background:linear-gradient(135deg,#8b5cf6,#6d28d9);color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;">
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

// ─────────────────────────────────────────────────────────────────────────────
// 5. Magic Link Giriş Maili
// ─────────────────────────────────────────────────────────────────────────────
export async function sendMagicLinkEmail({
  to,
  name,
  magicLink,
}: {
  to: string;
  name: string;
  magicLink: string;
}) {
  const html = `
    <div style="font-family:system-ui,sans-serif;background:#0a0a0f;color:#e2e8f0;padding:32px;border-radius:12px;max-width:600px;margin:0 auto;">
      <div style="text-align:center;margin-bottom:32px;">
        <img src="${APP_URL}/starwebflow_banner_1.png" alt="StarWebflow" style="height:48px;object-fit:contain;" />
      </div>
      <div style="background:#131b2a;border-radius:12px;padding:24px;line-height:1.7;font-size:15px;">
        <p>Merhaba <strong>${name}</strong>,</p>
        <p>Aşağıdaki butona tıklayarak şifresiz giriş yapabilirsiniz. Bu bağlantı <strong>24 saat</strong> geçerlidir.</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${magicLink}" style="display:inline-block;background:linear-gradient(135deg,#8b5cf6,#6d28d9);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;">
            ✨ Giriş Yap
          </a>
        </div>
        <p style="font-size:13px;color:#94a3b8;">Butona tıklayamıyorsanız bu bağlantıyı tarayıcınıza kopyalayın:<br/><a href="${magicLink}" style="color:#8b5cf6;word-break:break-all;">${magicLink}</a></p>
        <p style="font-size:12px;color:#64748b;margin-top:24px;">Bu bağlantıyı siz talep etmediyseniz bu e-postayı görmezden gelebilirsiniz.</p>
      </div>
    </div>
  `;

  return sendMail({
    to,
    subject: '✨ StarWebflow — Sihirli Giriş Bağlantınız',
    html,
    replyTo: ADMIN_EMAIL,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Şifre Sıfırlama Maili
// ─────────────────────────────────────────────────────────────────────────────
export async function sendPasswordResetEmail({
  to,
  name,
  resetLink,
}: {
  to: string;
  name: string;
  resetLink: string;
}) {
  const html = `
    <div style="font-family:system-ui,sans-serif;background:#0a0a0f;color:#e2e8f0;padding:32px;border-radius:12px;max-width:600px;margin:0 auto;">
      <div style="text-align:center;margin-bottom:32px;">
        <img src="${APP_URL}/starwebflow_banner_1.png" alt="StarWebflow" style="height:48px;object-fit:contain;" />
      </div>
      <div style="background:#131b2a;border-radius:12px;padding:24px;line-height:1.7;font-size:15px;">
        <p>Merhaba <strong>${name}</strong>,</p>
        <p>Hesabınız için şifre sıfırlama talebinde bulundunuz. Şifrenizi yenilemek için aşağıdaki butona tıklayın. Bu bağlantı <strong>1 saat</strong> geçerlidir.</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${resetLink}" style="display:inline-block;background:linear-gradient(135deg,#8b5cf6,#6d28d9);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;">
            🔐 Şifremi Sıfırla
          </a>
        </div>
        <p style="font-size:13px;color:#94a3b8;">Butona tıklayamıyorsanız:<br/><a href="${resetLink}" style="color:#8b5cf6;word-break:break-all;">${resetLink}</a></p>
        <p style="font-size:12px;color:#64748b;margin-top:24px;">Bu talebi siz yapmadıysanız bu e-postayı görmezden gelebilirsiniz.</p>
      </div>
    </div>
  `;

  return sendMail({
    to,
    subject: '🔐 StarWebflow — Şifre Sıfırlama Talebi',
    html,
    replyTo: ADMIN_EMAIL,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. E-posta Doğrulama Maili
// ─────────────────────────────────────────────────────────────────────────────
export async function sendVerificationEmail({
  to,
  name,
  verifyLink,
}: {
  to: string;
  name: string;
  verifyLink: string;
}) {
  const html = `
    <div style="font-family:system-ui,sans-serif;background:#0a0a0f;color:#e2e8f0;padding:32px;border-radius:12px;max-width:600px;margin:0 auto;">
      <div style="text-align:center;margin-bottom:32px;">
        <img src="${APP_URL}/starwebflow_banner_1.png" alt="StarWebflow" style="height:48px;object-fit:contain;" />
      </div>
      <div style="background:#131b2a;border-radius:12px;padding:24px;line-height:1.7;font-size:15px;">
        <p>Merhaba <strong>${name}</strong>,</p>
        <p>StarWebflow platformuna başarıyla kayıt oldunuz! Hesabınızı etkinleştirmek için lütfen aşağıdaki butona tıklayarak e-posta adresinizi doğrulayın.</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${verifyLink}" style="display:inline-block;background:linear-gradient(135deg,#8b5cf6,#6d28d9);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;">
            ✅ E-postamı Doğrula
          </a>
        </div>
        <p style="font-size:13px;color:#94a3b8;">Butona tıklayamıyorsanız:<br/><a href="${verifyLink}" style="color:#8b5cf6;word-break:break-all;">${verifyLink}</a></p>
      </div>
      <p style="margin-top:24px;font-size:11px;color:#475569;text-align:center;">
        © ${new Date().getFullYear()} StarWebflow. Bu e-posta otomatik olarak gönderilmiştir.
      </p>
    </div>
  `;

  return sendMail({
    to,
    subject: '✅ StarWebflow — E-posta Adresinizi Doğrulayın',
    html,
    replyTo: ADMIN_EMAIL,
  });
}
