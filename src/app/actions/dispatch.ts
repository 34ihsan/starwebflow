'use server';

import { prisma } from '@/lib/prisma';
import { logActivity } from './activity';
import { sendMail } from '@/lib/email';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function sendInvoiceToClient(invoiceId: string, tenantId: string) {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, tenantId },
      include: {
        project: {
          include: { client: true }
        },
        clientCompany: true,
        items: true
      }
    });

    if (!invoice) {
      return { success: false, error: 'Fatura bulunamadı.' };
    }

    const clientEmail = invoice.project?.client?.email || invoice.clientCompany?.email;
    const clientName = invoice.project?.client?.name || invoice.clientCompany?.contactPerson || invoice.clientCompany?.name || 'Değerli Müşterimiz';

    if (!clientEmail) {
      return { success: false, error: 'Müşteri e-posta adresi bulunamadı.' };
    }

    // Check if the client has a portal user account
    const portalUser = await prisma.user.findFirst({
      where: { email: clientEmail, role: { in: ['CLIENT_MEMBER', 'CLIENT_OWNER'] } }
    });

    const currencySymbol = invoice.currency === 'TRY' ? '₺' : invoice.currency === 'EUR' ? '€' : '$';
    const amountFormatted = `${Number(invoice.grossAmount).toFixed(2)} ${currencySymbol}`;
    
    let emailHtml = '';

    if (portalUser) {
      // Client has a portal account, send notification with direct link
      emailHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #0f172a; margin-bottom: 20px; font-weight: 700;">Yeni Fatura Bildirimi</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">Sayın <strong>${clientName}</strong>,</p>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;"><strong>${invoice.invoiceNo}</strong> numaralı yeni faturanız oluşturulmuştur ve müşteri panelinize yüklenmiştir.</p>
          
          <div style="background: #f8fafc; border-left: 4px solid #4F8EF7; padding: 20px; margin: 25px 0; border-radius: 8px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="color: #64748b; font-size: 14px; padding-bottom: 8px;">Fatura No:</td>
                <td style="color: #0f172a; font-weight: 600; font-size: 14px; padding-bottom: 8px; text-align: right;">${invoice.invoiceNo}</td>
              </tr>
              <tr>
                <td style="color: #64748b; font-size: 14px; padding-bottom: 8px;">Fatura Tarihi:</td>
                <td style="color: #0f172a; font-weight: 600; font-size: 14px; padding-bottom: 8px; text-align: right;">${new Date(invoice.invoiceDate).toLocaleDateString('tr-TR')}</td>
              </tr>
              <tr>
                <td style="color: #64748b; font-size: 14px; padding-bottom: 8px;">Son Ödeme Tarihi:</td>
                <td style="color: #ef4444; font-weight: 700; font-size: 14px; padding-bottom: 8px; text-align: right;">${new Date(invoice.dueDate).toLocaleDateString('tr-TR')}</td>
              </tr>
              <tr style="border-top: 1px solid #e2e8f0;">
                <td style="color: #0f172a; font-weight: 700; font-size: 16px; padding-top: 12px;">Toplam Tutar:</td>
                <td style="color: #4F8EF7; font-weight: 800; font-size: 18px; padding-top: 12px; text-align: right;">${amountFormatted}</td>
              </tr>
            </table>
          </div>

          <p style="text-align: center; margin: 35px 0 25px 0;">
            <a href="${APP_URL}/client/invoices" style="background: linear-gradient(135deg, #4F8EF7 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 142, 247, 0.2);">Müşteri Paneline Git</a>
          </p>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">Bu e-posta otomatik olarak gönderilmiştir. Sorularınız için lütfen bizimle iletişime geçin.</p>
        </div>
      `;
    } else {
      // Client has NO portal account, send complete invoice details and registration invite
      const itemsHtml = invoice.items.map(item => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px 0; color: #334155; font-size: 14px;">${item.description}</td>
          <td style="padding: 12px 0; text-align: center; color: #334155; font-size: 14px;">${Number(item.quantity)}</td>
          <td style="padding: 12px 0; text-align: right; color: #334155; font-size: 14px;">${Number(item.unitPrice).toFixed(2)}</td>
          <td style="padding: 12px 0; text-align: right; color: #0f172a; font-weight: 600; font-size: 14px;">${Number(item.total).toFixed(2)}</td>
        </tr>
      `).join('');

      emailHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #0f172a; margin-bottom: 20px; font-weight: 700;">Fatura Detayı</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">Sayın <strong>${clientName}</strong>,</p>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">Sizin için düzenlenmiş <strong>${invoice.invoiceNo}</strong> numaralı faturanın detayları aşağıdadır:</p>

          <table style="width: 100%; border-collapse: collapse; margin: 25px 0;">
            <thead>
              <tr style="border-bottom: 2px solid #0f172a; text-align: left;">
                <th style="padding-bottom: 8px; color: #0f172a; font-weight: 700;">Açıklama</th>
                <th style="padding-bottom: 8px; text-align: center; color: #0f172a; font-weight: 700;">Miktar</th>
                <th style="padding-bottom: 8px; text-align: right; color: #0f172a; font-weight: 700;">Birim Fiyat</th>
                <th style="padding-bottom: 8px; text-align: right; color: #0f172a; font-weight: 700;">Toplam</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="text-align: right; margin-bottom: 30px; font-size: 14px;">
            <p style="margin: 5px 0; color: #64748b;">Net Tutar: <span style="color: #334155; font-weight: 600;">${Number(invoice.netAmount).toFixed(2)}</span></p>
            <p style="margin: 5px 0; color: #64748b;">KDV (%${Number(invoice.taxRate)}): <span style="color: #334155; font-weight: 600;">${Number(invoice.taxAmount).toFixed(2)}</span></p>
            <h3 style="margin: 10px 0 0 0; color: #0f172a; font-weight: 700;">Genel Toplam: <span style="color: #4F8EF7; font-size: 20px;">${amountFormatted}</span></h3>
          </div>

          <div style="background: #eff6ff; border: 1px dashed #bfdbfe; padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
            <h4 style="margin: 0 0 10px 0; color: #1e3a8a; font-weight: 600;">Müşteri Portalınızı Aktifleştirin</h4>
            <p style="margin: 0 0 15px 0; color: #1e40af; font-size: 13px; line-height: 1.5;">Faturalarınızı takip etmek, projelerinizin durumunu izlemek ve sözleşmelerinizi dijital olarak imzalamak için hemen kaydolun.</p>
            <a href="${APP_URL}/register" style="background: #3b82f6; color: #ffffff; text-decoration: none; padding: 8px 20px; border-radius: 6px; font-weight: 600; font-size: 13px; display: inline-block;">Portal Hesabı Oluştur</a>
          </div>

          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">Bu e-posta otomatik olarak gönderilmiştir. Sorularınız için lütfen bizimle iletişime geçin.</p>
        </div>
      `;
    }

    await sendMail({
      to: clientEmail,
      subject: portalUser ? `Yeni Fatura Bildirimi - ${invoice.invoiceNo}` : `Fatura Detayı - ${invoice.invoiceNo}`,
      html: emailHtml,
    });

    await logActivity({
      tenantId,
      action: 'DISPATCHED_INVOICE',
      entityType: 'Invoice',
      entityId: invoiceId,
      details: `${invoice.invoiceNo} numaralı fatura müşteriye (${clientEmail}) iletildi. Portal Durumu: ${portalUser ? 'Kayıtlı' : 'Kayıtsız (Doğrudan Mail)'}`,
    });

    return { success: true, method: portalUser ? 'portal' : 'email' };
  } catch (error) {
    console.error('sendInvoiceToClient error:', error);
    return { success: false, error: 'Fatura gönderilirken bir hata oluştu.' };
  }
}

export async function sendContractToClient(contractId: string, tenantId: string) {
  try {
    const contract = await prisma.contract.findFirst({
      where: { id: contractId, tenantId }
    });

    if (!contract) {
      return { success: false, error: 'Sözleşme bulunamadı.' };
    }

    const clientEmail = contract.clientEmail;
    const clientName = contract.clientName || 'Değerli Müşterimiz';

    if (!clientEmail) {
      return { success: false, error: 'Müşteri e-posta adresi bulunamadı.' };
    }

    // Check if client has a portal user account
    const portalUser = await prisma.user.findFirst({
      where: { email: clientEmail, role: { in: ['CLIENT_MEMBER', 'CLIENT_OWNER'] } }
    });

    let emailHtml = '';

    if (portalUser) {
      emailHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #0f172a; margin-bottom: 20px; font-weight: 700;">Yeni Sözleşme Bildirimi</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">Sayın <strong>${clientName}</strong>,</p>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;"><strong>${contract.title}</strong> başlıklı sözleşmeniz hazırlanmış ve onayınız için müşteri panelinize yüklenmiştir.</p>
          
          <div style="background: #f8fafc; border-left: 4px solid #8b5cf6; padding: 20px; margin: 25px 0; border-radius: 8px;">
            <h4 style="margin: 0 0 10px 0; color: #0f172a; font-weight: 700; font-size: 15px;">Sözleşme Bilgileri</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="color: #64748b; font-size: 14px; padding-bottom: 8px;">Sözleşme Başlığı:</td>
                <td style="color: #0f172a; font-weight: 600; font-size: 14px; padding-bottom: 8px; text-align: right;">${contract.title}</td>
              </tr>
              <tr>
                <td style="color: #64748b; font-size: 14px; padding-bottom: 8px;">Tür:</td>
                <td style="color: #0f172a; font-weight: 600; font-size: 14px; padding-bottom: 8px; text-align: right; text-transform: uppercase;">${contract.type}</td>
              </tr>
              <tr>
                <td style="color: #64748b; font-size: 14px;">Durum:</td>
                <td style="color: #f59e0b; font-weight: 700; font-size: 14px; text-align: right;">ONAY BEKLİYOR</td>
              </tr>
            </table>
          </div>

          <p style="text-align: center; margin: 35px 0 25px 0;">
            <a href="${APP_URL}/client/contracts" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(139, 92, 246, 0.2);">Sözleşmeyi İncele ve İmzala</a>
          </p>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">Bu e-posta otomatik olarak gönderilmiştir. Sorularınız için lütfen bizimle iletişime geçin.</p>
        </div>
      `;
    } else {
      emailHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #0f172a; margin-bottom: 20px; font-weight: 700;">Yeni Sözleşme Detayı</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">Sayın <strong>${clientName}</strong>,</p>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">Sizin için hazırlanan <strong>${contract.title}</strong> başlıklı sözleşmenin detayları aşağıdadır:</p>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; max-height: 300px; overflow-y: auto; margin: 25px 0; color: #334155; font-size: 14px; line-height: 1.5; white-space: pre-wrap;">
            ${contract.content}
          </div>

          <div style="background: #f5f3ff; border: 1px dashed #ddd6fe; padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
            <h4 style="margin: 0 0 10px 0; color: #5b21b6; font-weight: 600;">Sözleşmeyi Dijital Olarak Onaylayın</h4>
            <p style="margin: 0 0 15px 0; color: #6d28d9; font-size: 13px; line-height: 1.5;">Bu ve diğer tüm sözleşmeleri güvenle imzalamak ve proje takibinizi yapmak için hemen portal hesabı oluşturun.</p>
            <a href="${APP_URL}/register" style="background: #7c3aed; color: #ffffff; text-decoration: none; padding: 8px 20px; border-radius: 6px; font-weight: 600; font-size: 13px; display: inline-block;">Portal Hesabı Oluştur</a>
          </div>

          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">Bu e-posta otomatik olarak gönderilmiştir. Sorularınız için lütfen bizimle iletişime geçin.</p>
        </div>
      `;
    }

    await sendMail({
      to: clientEmail,
      subject: portalUser ? `Yeni Sözleşme Onay Bildirimi - ${contract.title}` : `Sözleşme Detayı - ${contract.title}`,
      html: emailHtml,
    });

    await logActivity({
      tenantId,
      action: 'DISPATCHED_CONTRACT',
      entityType: 'Contract',
      entityId: contractId,
      details: `"${contract.title}" başlıklı sözleşme müşteriye (${clientEmail}) iletildi. Portal Durumu: ${portalUser ? 'Kayıtlı' : 'Kayıtsız (Doğrudan Mail)'}`,
    });

    return { success: true, method: portalUser ? 'portal' : 'email' };
  } catch (error) {
    console.error('sendContractToClient error:', error);
    return { success: false, error: 'Sözleşme gönderilirken bir hata oluştu.' };
  }
}
