import nodemailer from 'nodemailer';
import { prisma } from "@/lib/prisma";

export async function createNotification(data: {
  tenantId: string;
  title: string;
  message: string;
  type?: "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "EMAIL";
  link?: string;
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        tenantId: data.tenantId,
        title: data.title,
        message: data.message,
        type: data.type || "INFO",
        link: data.link,
      },
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}

/**
 * Gönderilecek webhook ve admin bildirimlerini merkezileştiren servis.
 */
export async function notifyAdminForOrganicEmail(params: {
  toMailbox: string;
  fromEmail: string;
  subject: string;
  bodyPreview: string;
}) {
  const adminEmail = "sinan.guenay@starwebflow.com";
  
  // 1. Email Bildirimi (Nodemailer ile Ionos üzerinden)
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ionos.de',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: `"StarWebflow Inbox" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `[YENİ MAİL] ${params.toMailbox} adresine mesaj geldi`,
      priority: 'high',
      headers: {
        'X-Priority': '1 (Highest)',
        'X-MSMail-Priority': 'High',
        'Importance': 'High'
      },
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #2563eb;">Yeni Müşteri Mesajı 🟢</h2>
          <p><strong>Gelen Kutu:</strong> ${params.toMailbox}</p>
          <p><strong>Kimden:</strong> ${params.fromEmail}</p>
          <p><strong>Konu:</strong> ${params.subject}</p>
          <hr />
          <p><strong>Önizleme:</strong></p>
          <blockquote style="background: #f9fafb; padding: 15px; border-left: 4px solid #2563eb; color: #374151;">
            ${params.bodyPreview.substring(0, 500)}...
          </blockquote>
          <p style="margin-top: 20px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/inbox" style="background: #2563eb; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Inbox'a Git ve Yanıtla</a>
          </p>
        </div>
      `
    });
    console.log(`[Notification] Admin email sent for incoming mail to ${params.toMailbox}`);
  } catch (error) {
    console.error("[Notification] Failed to send admin email:", error);
  }

  // 2. Slack / Discord Webhook (Gelecekte Eklenebilir)
  // const slackWebhook = process.env.SLACK_WEBHOOK_URL;
  // if (slackWebhook) {
  //    await fetch(slackWebhook, { method: 'POST', body: JSON.stringify({ text: `🟢 Yeni Mail: ${params.toMailbox} adresine ${params.fromEmail} kişisinden mail geldi. Konu: ${params.subject}` }) });
  // }
}
