import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import nodemailer from 'nodemailer';

export async function getInboxMessages() {
  try {
    const messages = await prisma.inboxMessage.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: messages };
  } catch (error) {
    console.error('getInboxMessages error:', error);
    return { success: false, error: 'Failed to fetch inbox messages' };
  }
}

export async function markAsRead(messageId: string) {
  try {
    const updated = await prisma.inboxMessage.update({
      where: { id: messageId },
      data: { isRead: true }
    });
    revalidatePath('/admin/inbox');
    return { success: true, data: updated };
  } catch (error) {
    console.error('markAsRead error:', error);
    return { success: false, error: 'Failed to update message' };
  }
}

export async function replyToMessage(messageId: string, replyBody: string) {
  try {
    const message = await prisma.inboxMessage.findUnique({
      where: { id: messageId }
    });

    if (!message) return { success: false, error: 'Message not found' };

    // Find the mailbox credentials to reply from the correct email
    const mailbox = await prisma.emailMailbox.findUnique({
      where: { id: message.mailboxId || '' }
    });

    // We fallback to general SMTP if mailbox is deleted or missing password
    const transporter = nodemailer.createTransport({
      host: mailbox?.smtpHost || process.env.SMTP_HOST || 'smtp.ionos.de',
      port: mailbox?.smtpPort || Number(process.env.SMTP_PORT) || 587,
      secure: mailbox?.smtpPort === 465,
      auth: {
        user: mailbox?.email || process.env.SMTP_USER,
        pass: mailbox?.smtpPassword || mailbox?.appPassword || process.env.SMTP_PASS
      }
    });

    const subject = message.subject?.startsWith('Re:') ? message.subject : `Re: ${message.subject || 'Sorunuz hakkında'}`;

    await transporter.sendMail({
      from: `"${mailbox?.senderName || 'StarWebflow'}" <${mailbox?.email || process.env.SMTP_USER}>`,
      to: message.fromEmail,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
          ${replyBody.replace(/\n/g, '<br/>')}
          <br/><br/>
          <hr style="border:none; border-top:1px solid #ccc;"/>
          <p style="color:#777; font-size:12px;">
            > <b>Kimden:</b> ${message.fromName ? message.fromName + ' ' : ''}&lt;${message.fromEmail}&gt;<br/>
            > <b>Tarih:</b> ${message.createdAt.toLocaleString('tr-TR')}<br/>
            > <b>Kime:</b> ${message.mailboxEmail}<br/><br/>
            ${message.bodyText?.replace(/\n/g, '<br/>> ') || ''}
          </p>
        </div>
      `
    });

    // Mark as replied
    const updated = await prisma.inboxMessage.update({
      where: { id: messageId },
      data: { isReplied: true, isRead: true }
    });

    revalidatePath('/admin/inbox');
    return { success: true, data: updated };
  } catch (error: any) {
    console.error('replyToMessage error:', error);
    return { success: false, error: error.message || 'Failed to send reply' };
  }
}
