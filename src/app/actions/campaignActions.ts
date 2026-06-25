'use server';

import { prisma } from '@/lib/prisma';
import { EMAIL_POOL, MASTER_BLUEPRINT } from '@/lib/email-pool';
import { generateObject } from 'ai';
import { getFlashModel } from '@/lib/ai/gemini-client';
import { z } from 'zod';


const DEFAULT_TENANT_ID = 'default-tenant';

async function ensureTenant() {
  const tenant = await prisma.tenant.findUnique({ where: { slug: DEFAULT_TENANT_ID } });
  if (!tenant) {
    await prisma.tenant.create({
      data: { id: DEFAULT_TENANT_ID, slug: DEFAULT_TENANT_ID, name: 'Default Tenant' }
    });
  }
  return DEFAULT_TENANT_ID;
}

export async function getCampaigns() {
  const tenantId = await ensureTenant();
  return prisma.emailCampaign.findMany({
    where: { tenantId },
    include: { templates: { orderBy: { stepDay: 'asc' } } },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createCampaignFromPool(poolId: string) {
  const tenantId = await ensureTenant();
  const poolItem = EMAIL_POOL.find(p => p.id === poolId);
  
  if (!poolItem) throw new Error("Pool item not found");

  // Create Campaign
  const campaign = await prisma.emailCampaign.create({
    data: {
      tenantId,
      name: `${poolItem.name} Outreach Campaign`,
      sector: poolItem.name,
      serviceType: "Otomasyon",
      type: "PRE_DEFINED",
      status: "draft",
    }
  });

  // Create Templates
  for (const tpl of poolItem.templates) {
    await prisma.emailTemplate.create({
      data: {
        tenantId,
        campaignId: campaign.id,
        name: `${campaign.id}_DAY_${tpl.day}`,
        subject: tpl.subject,
        htmlBody: tpl.body,
        stepDay: tpl.day
      }
    });
  }

  return campaign;
}

export async function generateCustomCampaign(customSector: string, serviceType: string) {
  const tenantId = await ensureTenant();

  // Fully Generate the Elite 5-Step Drip Campaign Using Gemini 2.5 Pro
  const result = await generateObject({
    model: getFlashModel(),
    schema: z.object({
      templates: z.array(
        z.object({
          day: z.number().describe("Gönderim günü: 1, 3, 7, 12, veya 18"),
          subject: z.string().describe("E-posta konu başlığı. Çok ilgi çekici, spam kelimelerden uzak, samimi."),
          body: z.string().describe("E-postanın HTML formatında (sadece <p>, <br> gibi basit tagler) gövde metni.")
        })
      ).length(5).describe("Tam olarak 5 adet email şablonu üretilmelidir (1, 3, 7, 12 ve 18. günler).")
    }),
    prompt: `Sen uzman bir B2B Cold Email Metin Yazarı (Copywriter) ve Satış Mühendisisin.
Hedef Sektör: "${customSector}"
Satılan Hizmet/Ürün: "${serviceType}"

Lütfen bu sektöre ve hizmete özel olarak, dönüşüm odaklı 5 adımlı (Elite Drip) bir e-posta serisi oluştur. Günler: 1, 3, 7, 12 ve 18 olmalı.

Kritik Kurallar ve Drip Psikolojisi:
1. Gün (Buz Kırıcı & Acı Noktası): ÇOK KISA OLMALI (max 2-3 cümle). ASLA LİNK BULUNMAMALI (spam koruması). Sadece net olarak ne yapıldığını söyleyip kısa bir telefon görüşmesi talep etmeli. Örn: "Salı günü 5 vaktiniz var mı?"
3. Gün (Otorite & Vaka Analizi): Sektörle ilgili küçük bir başarı hikayesi veya değer sunumu.
7. Gün (FOMO & Pazar Kayması): Sektördeki dijitalleşme / eksiklik üzerinden ufak bir aciliyet (urgency) yaratma.
12. Gün (Değer Sunumu): Satış yapmaya çalışmadan sektöre özel faydalı bir kaynak/pdf tavsiyesi gibi (Karşılıklılık ilkesi).
18. Gün (Ayrılış / Breakup): Net ve profesyonel bir veda e-postası. "Sanırım şu an önceliğiniz değil" diyerek net bir evet/hayır tetikleme.

Her mailin 'subject' kısmı tıklanma oranını artıracak kadar doğal olmalı. Kurumsal kasıntı bir dilden kaçın, samimi ve profesyonel bir tonda B2B satışı yap.

SADECE E-POSTA GÖVDESİNİ (İÇERİĞİ) YAZIN. Altına veya üstüne isim, imza, iyi çalışmalar gibi şeyler EKLMEYİN, biz sistemsel olarak enjekte edeceğiz.`
  });

  const templates = result.object.templates;

  // Add Company Signature, Legal Info, and Unsubscribe link to every email body
  const signAndLegalHtml = `
    <br><br>
    <div style="font-family: sans-serif; font-size: 12px; color: #666; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
      <p style="margin: 0 0 5px 0;"><strong>Büyüme Ekibi | Star Webflow</strong></p>
      <p style="margin: 0 0 15px 0;">Yapay Zeka Destekli Otomasyon Çözümleri</p>
      
      <p style="font-size: 10px; color: #999; line-height: 1.4; margin: 0 0 10px 0;">
        <strong>Yasal Uyarı (Legal Disclaimer):</strong> Bu e-posta sadece bilgilendirme amaçlı gönderilmiştir. 
        Mesajın içeriği şirketimize ait gizli bilgiler içerebilir. İlgili yasalara (KVKK/GDPR/CAN-SPAM) uygun olarak, 
        bu e-postayı yanlışlıkla aldıysanız lütfen göndericiyi bilgilendirerek mesajı siliniz.
      </p>
      
      <p style="font-size: 10px; color: #999; margin: 0;">
        Bu listeden çıkmak ve bir daha e-posta almamak için 
        <a href="{{unsubscribe_link}}" style="color: #666; text-decoration: underline;">abonelikten çık (unsubscribe)</a> 
        tıklayabilirsiniz.
      </p>
    </div>
  `;

  const processedTemplates = templates.map(tpl => ({
    ...tpl,
    body: tpl.body + signAndLegalHtml
  }));

  // Save to DB
  const campaign = await prisma.emailCampaign.create({
    data: {
      tenantId,
      name: `${customSector} - ${serviceType} (AI Elite Drip)`,
      sector: customSector,
      serviceType: serviceType,
      type: "CUSTOM_AI",
      status: "draft",
    }
  });

  for (const tpl of processedTemplates) {
    await prisma.emailTemplate.create({
      data: {
        tenantId,
        campaignId: campaign.id,
        name: `${campaign.id}_DAY_${tpl.day}`,
        subject: tpl.subject,
        htmlBody: tpl.body,
        stepDay: tpl.day,
        importance: "HIGH", // Pro feature: All templates marked as high importance
        hasAttachments: false // Default to false, can be toggled in UI
      }
    });
  }

  return campaign;
}

export async function updateTemplate(
  templateId: string, 
  subject: string, 
  htmlBody: string, 
  importance: string = "NORMAL",
  hasAttachments: boolean = false
) {
  const tenantId = await ensureTenant();
  return prisma.emailTemplate.update({
    where: { id: templateId, tenantId },
    data: { 
      subject, 
      htmlBody,
      importance,
      hasAttachments
    }
  });
}
