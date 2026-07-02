'use server';

import { prisma } from '@/lib/prisma';
import { generateText } from 'ai';
import { getFlashModel } from '@/lib/ai/gemini-client';
import { verifyRecaptcha } from '@/lib/recaptcha';
import { sendProposalEmail, sendLeadNotification } from '@/lib/email';

// Helper to generate dynamic template based on industry and service
function generateProposalTemplate(name: string, industry: string, serviceType: string) {
  let subject = `StarWebflow - ${industry} Sektörüne Özel ${serviceType} Teklifiniz`;
  let intro = `Merhaba ${name},`;
  let body = '';

  if (serviceType === 'Web Tasarım') {
    if (industry === 'Sağlık') {
      body = `Sağlık sektöründeki dijital varlığınız hastalarınız için güven vermelidir. Hastane veya kliniğiniz için randevu sistemli, mobil uyumlu ve SEO dostu bir web sitesi tasarım paketi hazırladık. Ekteki veya aşağıdaki taslağı inceleyebilirsiniz.`;
    } else if (industry === 'E-Ticaret') {
      body = `E-Ticaret dünyasında dönüşüm oranları (conversion rate) her şeydir. Satışlarınızı artıracak, hızlı ödeme adımlarına sahip modern e-ticaret altyapımızla işinizi büyütmeye hazırız.`;
    } else {
      body = `${industry} sektöründeki rakiplerinizin önüne geçmek için size özel bir web sitesi hazırlayabiliriz. İhtiyaçlarınızı analiz ettik ve size uygun bir yol haritası çıkardık.`;
    }
  } else if (serviceType === 'SEO') {
    body = `${industry} sektörü için anahtar kelime analizi ve arama motoru optimizasyonu raporunuzun ilk adımlarını hazırladık. Rakiplerinizin trafik kaynaklarını incelemek için bizimle iletişime geçin.`;
  } else {
    body = `Projeniz için ücretsiz analiz talebinizi aldık. ${industry} sektöründeki tecrübemizle size en uygun çözümü sunmak için en kısa sürede sizinle iletişime geçeceğiz.`;
  }

  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #eaeaea; border-radius: 8px;">
      <h2 style="color: #8B5CF6;">StarWebflow Proje Analizi</h2>
      <p style="font-size: 16px;">${intro}</p>
      <p style="font-size: 16px; line-height: 1.5;">${body}</p>
      
      <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Teklif Detayları</h3>
        <ul style="line-height: 1.6;">
          <li><strong>Sektör:</strong> ${industry}</li>
          <li><strong>Hizmet:</strong> ${serviceType}</li>
          <li><strong>Durum:</strong> Ön Analiz Tamamlandı</li>
        </ul>
      </div>

      <p style="font-size: 16px;">Detayları görüşmek veya projeye hemen başlamak için bu e-postayı yanıtlayabilirsiniz.</p>
      
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
      <p style="font-size: 12px; color: #888;">Bu e-posta otomatik olarak ${industry} sektörü için hazırlanmıştır.</p>
    </div>
  `;

  return { subject, html };
}

export async function createLeadWithProposal(data: {
  tenantId: string;
  name: string;
  email: string;
  industry: string;
  serviceType: string;
  source?: string;
  recaptchaToken?: string;
}) {
  try {
    // 0. reCAPTCHA doğrulaması
    if (data.recaptchaToken) {
      const captcha = await verifyRecaptcha(data.recaptchaToken);
      if (!captcha.success) {
        return { success: false, error: captcha.error || 'Bot doğrulaması başarısız.' };
      }
    }
    // 1. Create Lead
    const lead = await prisma.lead.create({
      data: {
        tenantId: data.tenantId,
        name: data.name,
        email: data.email,
        industry: data.industry,
        serviceType: data.serviceType,
        source: data.source || 'Website Popup',
        status: 'new'
      }
    });

    // 2. Create Chat Thread
    const thread = await prisma.chatThread.create({
      data: {
        tenantId: data.tenantId,
        leadId: lead.id,
      }
    });

    // 3. Generate Template
    const { subject, html } = generateProposalTemplate(data.name, data.industry, data.serviceType);

    // 4. Send Email via Resend (merkezi email servisi)
    let emailSent = false;
    const sendResult = await sendProposalEmail({
      to: lead.email!,
      name: data.name,
      subject,
      html,
    });
    emailSent = sendResult.success;

    // 4.5 Admin'e lead bildirimi gönder
    await sendLeadNotification({
      name: data.name,
      email: data.email,
      industry: data.industry,
      serviceType: data.serviceType,
      source: data.source,
    }).catch(console.error);

    // 5. Save the sent email to Chat messages
    // Strip HTML for the chat view, or keep it simple
    const plainTextContent = html.replace(/<[^>]*>?/gm, '');
    
    await prisma.chatMessage.create({
      data: {
        threadId: thread.id,
        content: `[Otomatik Teklif Gönderildi]\nKonu: ${subject}\n\n${plainTextContent.substring(0, 200)}...`,
        isEmail: true,
        isFromLead: false, // Sent BY the system TO the lead
      }
    });

    return { success: true, data: lead };

  } catch (error) {
    console.error('Error creating lead:', error);
    return { success: false, error: 'Talebiniz alınırken bir hata oluştu.' };
  }
}

export async function createLead(data: any) {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = cookies();
    const visitorId = cookieStore.get('swf_visitor_id')?.value;

    const lead = await prisma.lead.create({
      data: {
        ...data,
        tenantId: data.tenantId || 'default-tenant',
        visitorId: visitorId || undefined,
      }
    });

    if (visitorId) {
      // Bonus: Add social score based on previous link clicks
      const clicks = await prisma.linkClick.count({ where: { visitorId } });
      if (clicks > 0) {
        await prisma.lead.update({
          where: { id: lead.id },
          data: { socialScore: clicks * 10 }
        });
      }
    }

    return { success: true, data: lead };
  } catch (error: any) {
    console.error('Error in createLead:', error);
    return { success: false, error: error.message };
  }
}

export async function createPublicLead(data: {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source?: string;
  value?: number;
  recaptchaToken?: string;
}) {
  // reCAPTCHA doğrulaması
  if (data.recaptchaToken) {
    const captcha = await verifyRecaptcha(data.recaptchaToken);
    if (!captcha.success) {
      return { success: false, error: captcha.error || 'Bot doğrulaması başarısız.' };
    }
  }
  const { recaptchaToken: _token, ...leadData } = data;
  return createLead({ ...leadData, tenantId: 'default-tenant' });
}

export async function createLeadWithAIEmail(data: {
  tenantId: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  industry: string;
  serviceType: string;
  taskTitle: string;
  taskDescription?: string;
  priority: string;
  sendEmail: boolean;
  language?: string;
}) {
  try {
    let subject = `StarWebflow - ${data.industry || 'Sektörüne'} Özel İletişim`;
    // Basit dilde konu
    if (data.language && data.language.toLowerCase() !== 'türkçe') {
      subject = `StarWebflow - Contact`;
    }
    
    let emailHtml = '';

    // 1. Generate Email Content using AI if requested
    if (data.sendEmail && data.email) {
      try {
        const { text } = await generateText({
          model: getFlashModel(),
          system: `Sen StarWebflow (dijital web ve yazılım ajansı) adına konuşan profesyonel bir asistansın.
Kurallar (RAG Strict Boundaries):
1. ASLA fiyat, ücret, maliyet veya kesin teslim süresi (örn: "2 haftada biter") taahhüdü VERME.
2. Müşteriyle resmi ama sıcak bir dille (Siz/Sizin) konuş. Senli benli konuşma.
3. Maksimum 3 kısa paragraftan oluşan, sıkıcı olmayan, okunması kolay bir metin üret.
4. E-posta HTML formatında olmalı. Sadece <div>, <p>, <strong>, <br/> etiketlerini kullan. CSS veya class kullanma.
5. Konu metnin içinde yer almasın, sadece gövdeyi (body) döndür.
6. Müşterinin sektörü, şirketi veya talebi hakkında güven verici kısa bir giriş yap.
7. İletişimi başlatmak için bir "Call to Action" (örneğin: toplantı planlamak) ekle.
8. MÜŞTERİ İLETİŞİM DİLİ: "${data.language || 'Türkçe'}". E-postayı kesinlikle bu dilde yaz.
9. E-postanın sonuna bu dile uygun bir veda/saygı ifadesi (örn. Saygılarımızla, Best regards) ve "StarWebflow" ismini ekle.`,
          prompt: `Müşteri Bilgileri:
- Ad/Soyad: ${data.name}
- Şirket: ${data.company || 'Belirtilmedi'}
- Sektör: ${data.industry || 'Genel'}
- Talep / Görev: ${data.taskTitle}
- Detay: ${data.taskDescription || 'Yok'}

Lütfen yukarıdaki bilgilere göre müşteriye gidecek olan tanışma / ilk adım e-postasının HTML gövdesini oluştur.`
        });

        emailHtml = text;
        emailHtml = `
          <div style="font-family: sans-serif; color: #333; max-width: 600px; line-height: 1.6;">
            ${emailHtml}
            <br/><br/>
            <p style="font-size: 14px; color: #666;">
              <a href="https://starwebflow.com" style="color: #8B5CF6;">starwebflow.com</a>
            </p>
          </div>
        `;
      } catch (e) {
        console.error('AI Email generation failed:', e);
        emailHtml = `<div style="font-family: sans-serif; color: #333;"><p>Merhaba ${data.name}, talebinizi aldık. Sizinle en kısa sürede iletişime geçeceğiz.</p></div>`;
      }
    }

    // 2. Create Lead
    const lead = await prisma.lead.create({
      data: {
        tenantId: data.tenantId,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        company: data.company || null,
        industry: data.industry || null,
        serviceType: data.serviceType || 'Genel',
        source: 'Admin CRM',
        status: 'new'
      }
    });

    // 3. Create Task
    const task = await prisma.task.create({
      data: {
        tenantId: data.tenantId,
        title: data.taskTitle,
        description: data.taskDescription || null,
        priority: data.priority,
        status: 'TODO',
        leadId: lead.id
      }
    });

    // 4. Handle Email Sending & Chat Thread
    if (data.sendEmail && data.email && emailHtml) {
      const thread = await prisma.chatThread.create({
        data: {
          tenantId: data.tenantId,
          leadId: lead.id,
        }
      });

      // Merkezi email servisi kullan
      await sendProposalEmail({
        to: data.email,
        name: data.name,
        subject,
        html: emailHtml,
      }).catch(console.error);

      // Admin'e bildirim
      await sendLeadNotification({
        name: data.name,
        email: data.email,
        company: data.company || undefined,
        industry: data.industry || undefined,
        serviceType: data.serviceType || undefined,
        source: 'Admin CRM',
      }).catch(console.error);

      const plainTextContent = emailHtml.replace(/<[^>]*>?/gm, '');
      
      await prisma.chatMessage.create({
        data: {
          threadId: thread.id,
          content: `[AI Destekli E-posta Gönderildi]\nKonu: ${subject}\n\n${plainTextContent.substring(0, 300)}...`,
          isEmail: true,
          isFromLead: false,
        }
      });
    }

    return { success: true, lead, task };
  } catch (error: any) {
    console.error('Error in createLeadWithAIEmail:', error);
    return { success: false, error: error.message };
  }
}

export async function getLeads(tenantId: string) {
  try {
    const leads = await prisma.lead.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        chatThreads: {
          include: {
            messages: true
          }
        }
      }
    });
    return { success: true, data: leads };
  } catch (error: any) {
    console.error('Error fetching leads:', error);
    return { success: false, error: error.message };
  }
}

export async function getLeadActivities(leadId: string) {
  try {
    const activities = await prisma.activityLog.findMany({
      where: { entityType: 'LEAD', entityId: leadId },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: activities };
  } catch (error) {
    return { success: false, error: 'Failed to fetch activities' };
  }
}
