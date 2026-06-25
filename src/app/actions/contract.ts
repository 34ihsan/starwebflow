'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { logActivity } from './activity';
import { generateText } from 'ai';
import { getProModel } from '@/lib/ai/gemini-client';

function getFallbackTemplate(clientName: string, title: string, type: string, serviceType: string, value?: number, currency?: string) {
  const serviceName = {
    WEB: 'Web Sitesi Geliştirme (Next.js & Modern UI)',
    SAAS: 'Web Uygulamaları (B2B SaaS / Panel Mimarisi)',
    AGENTS: 'Yapay Zeka Ajanları (AI Agents & LLM Entegrasyonu)',
    AUTOMATION: 'AI İş Akış Otomasyonları (n8n, Webhook & API)',
    MARKETING: 'Reklam & Sosyal Medya (Google/Meta Reklam Yönetimi)'
  }[serviceType as 'WEB'|'SAAS'|'AGENTS'|'AUTOMATION'|'MARKETING'] || 'Dijital Dönüşüm Hizmeti';

  const budgetText = value ? `${value} ${currency || 'TRY'}` : 'Hakediş usulü / Proje aşamalarına göre belirlenecektir';

  return `STARWEBFLOW DIJITAL MIMARI STÜDYOSU
HİZMET SÖZLEŞMESİ & TEKNİK ŞARTNAME (TASLAK)

1. TARAFLAR
İşbu sözleşme, bir tarafta StarWebFlow Mimari Stüdyosu (Yüklenici) ile diğer tarafta ${clientName} (Müşteri) arasında imzalanmıştır.

2. SÖZLEŞMENİN KONUSU
Müşteri tarafından talep edilen "${title}" projesi kapsamında, Yüklenici tarafından ${serviceName} hizmetinin sağlanması, entegre edilmesi ve teslim edilmesidir.

3. HİZMET KAPSAMI VE TEKNİK DETAYLAR
Seçilen Şartname/Sözleşme Türü: ${type}
Seçilen Hizmet Türü: ${serviceName}
Bu kapsamda gerçekleştirilecek çalışmalar:
- Proje gereksinimlerinin analiz edilmesi ve Lastenheft/Pflichtenheft dokümanlarının hazırlanması.
- ${serviceName} altyapısının modern B2B standartlarına göre tasarlanması.
- Yapay zeka ve otomasyon katmanlarının entegrasyonu.
- Sub-second performans ve zırhlandırılmış güvenlik testlerinin tamamlanması.

4. MADDİ HÜKÜMLER VE ÖDEME PLANI
Toplam Proje Bedeli: ${budgetText}
Ödeme Şartları: Sözleşme imzasına müteakip %40 avans, ara teslimatta %30 ve nihai teslimatta kalan %30 ödenecektir.

5. VERİ GÜVENLİĞİ VE GİZLİLİK (GDPR/KVKK)
Taraflar, süreç boyunca edindikleri tüm ticari ve teknik bilgileri gizli tutmayı kabul eder. Verilerin işlenmesi GDPR, DSGVO ve KVKK uyumlu sunucularda gerçekleştirilecektir.

6. YETKİLİ MAHKEMELER
İşbu sözleşmeden doğacak uyuşmazlıklarda İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.`;
}

export async function getContracts(tenantId: string) {
  try {
    const contracts = await prisma.contract.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: contracts };
  } catch (error) {
    console.error('getContracts error:', error);
    return { success: false, error: 'Failed to fetch contracts' };
  }
}

export async function createContract(data: {
  tenantId: string;
  title: string;
  clientName: string;
  clientEmail: string;
  type: string;
  serviceType?: string;
  value?: number;
  currency?: string;
  status?: string;
  validUntil?: Date;
}) {
  try {
    let content = "";
    if (data.serviceType) {
      try {
        const { text } = await generateText({
          model: getProModel(),
          prompt: `Sen uzman bir B2B hukuk ve teknoloji danışmanısın.
Aşağıdaki bilgilere dayanarak profesyonel, hukuki geçerliliği olan, premium bir sözleşme/şartname taslağı (şablonu) oluştur. Şartları kesinlikle StarWebFlow şirketimiz lehine, korumacı bir şekilde, ancak profesyonel bir üslupla hazırla. Sözleşmede StarWebFlow'un haklarını güvence altına alacak yasal sınırlar ve maddeler mutlaka bulunsun.

Müşteri/Firma Adı: ${data.clientName}
Müşteri E-Postası: ${data.clientEmail || 'Bilinmiyor'}
Proje/İş Başlığı: ${data.title}
Sözleşme/Şartname Türü: ${data.type} (Örn: LASTENHEFT, PFLICHTENHEFT, SLA, NDA)
Hizmet Türü: ${data.serviceType} (Örn: WEB, SAAS, AGENTS, AUTOMATION, MARKETING)
Bütçe/Tutar: ${data.value ? `${data.value} ${data.currency || 'TRY'}` : 'Belirtilmedi'}

Hizmet Türü Açıklamaları ve Şartları:
- WEB: Web Sitesi Geliştirme (Sub-second hız hedefleri, Outfit modern tipografisi, Next.js web sitesi yapımı ve SEO optimizasyonu)
- SAAS: Web Uygulamaları (Ölçeklenebilir bulut yazılımları, yönetim panelleri ve B2B SaaS mimarisi)
- AGENTS: Yapay Zeka Ajanları (CRM ve veri tabanı entegrasyonu, 7/24 otonom dijital asistanlar, LLM/GPT API kullanımı)
- AUTOMATION: AI İş Akış Otomasyonları (n8n, API ve webhook entegrasyonlarıyla manuel işleri 10x hızlandırma)
- MARKETING: Reklam & Sosyal Medya (Yapay zeka destekli kreatif tasarımlar ve ROAS odaklı Meta/Google reklam yönetimi)

Lütfen sözleşmeyi çok detaylı, resmi bir dil kullanarak Türkçe olarak oluştur. Metin Markdown formatında veya düzgün paragraflar ve başlıklar şeklinde olsun.
Sözleşme içerisinde tarafların hakları, hizmet kapsamı (seçilen hizmet türünün teknik detaylarını ve gereksinimlerini içerecek şekilde), bütçe ve ödeme planı, veri güvenliği (GDPR/KVKK uyumluluğu), süre ve fesih koşulları gibi standart maddeleri profesyonelce yerleştir.`,
        });
        content = text;
      } catch (e) {
        console.warn('AI contract template generation failed, using fallback template:', e);
        content = getFallbackTemplate(data.clientName, data.title, data.type, data.serviceType, data.value, data.currency);
      }
    }

    const contract = await prisma.contract.create({
      data: {
        tenant: { connect: { id: data.tenantId } },
        title: data.title,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        type: data.type,
        value: data.value,
        currency: data.currency || "TRY",
        status: data.status || 'PENDING',
        validUntil: data.validUntil,
        content: content || undefined,
      }
    });

    await logActivity({
      tenantId: data.tenantId,
      action: 'CREATED_CONTRACT',
      entityType: 'Contract',
      entityId: contract.id,
      details: `${data.clientName} için yeni bir ${data.type} sözleşmesi oluşturuldu.`,
    });

    revalidatePath('/admin/contracts');
    revalidatePath('/client/contracts');
    return { success: true, data: contract };
  } catch (error) {
    console.error('createContract error:', error);
    return { success: false, error: 'Failed to create contract' };
  }
}

export async function updateContractStatus(id: string, status: string) {
  try {
    const contract = await prisma.contract.update({
      where: { id },
      data: { 
        status,
        ...(status === 'SIGNED' ? { signedAt: new Date() } : {})
      }
    });

    if (status === 'SIGNED') {
      await logActivity({
        tenantId: contract.tenantId,
        action: 'SIGNED_CONTRACT',
        entityType: 'Contract',
        entityId: contract.id,
        details: `${contract.title} başlıklı sözleşme imzalandı.`,
      });
    }

    revalidatePath('/admin/contracts');
    revalidatePath('/client/contracts');
    revalidatePath('/client');
    return { success: true, data: contract };
  } catch (error) {
    console.error('updateContractStatus error:', error);
    return { success: false, error: 'Failed to update contract status' };
  }
}

export async function updateContract(
  id: string,
  data: {
    title?: string;
    clientName?: string;
    clientEmail?: string;
    type?: string;
    value?: number;
    currency?: string;
    validUntil?: Date;
    content?: string;
    status?: string;
    signedPdfUrl?: string;
  }
) {
  try {
    const contract = await prisma.contract.update({
      where: { id },
      data: {
        title: data.title,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        type: data.type,
        value: data.value,
        currency: data.currency,
        validUntil: data.validUntil,
        content: data.content,
        status: data.status,
        signedPdfUrl: data.signedPdfUrl,
      },
    });

    await logActivity({
      tenantId: contract.tenantId,
      action: 'UPDATED_CONTRACT',
      entityType: 'Contract',
      entityId: contract.id,
      details: `${contract.title} başlıklı sözleşme güncellendi.`,
    });

    revalidatePath('/admin/contracts');
    revalidatePath('/client/contracts');
    revalidatePath('/client');
    return { success: true, data: contract };
  } catch (error) {
    console.error('updateContract error:', error);
    return { success: false, error: 'Failed to update contract' };
  }
}

export async function deleteContract(id: string) {
  try {
    const contract = await prisma.contract.delete({
      where: { id }
    });

    await logActivity({
      tenantId: contract.tenantId,
      action: 'DELETED_CONTRACT',
      entityType: 'Contract',
      entityId: contract.id,
      details: `${contract.title} başlıklı sözleşme silindi.`,
    });

    revalidatePath('/admin/contracts');
    revalidatePath('/client/contracts');
    revalidatePath('/client');
    return { success: true };
  } catch (error) {
    console.error('deleteContract error:', error);
    return { success: false, error: 'Failed to delete contract' };
  }
}

export async function generatePflichtenheftFromLastenheft(lastenheftContent: string) {
  try {
    const { text } = await generateText({
      model: getProModel(),
      prompt: `Sen uzman bir B2B teknik mimar ve yazılım mühendisisin.
Aşağıda verilen "Lastenheft" (Müşteri İş Gereksinimleri) dökümanını incele.
Bu dökümandaki her bir iş ihtiyacını, teknik hedefleri ve müşteri taleplerini analiz ederek; bunların "Hangi teknolojilerle, nasıl, ne şekilde ve hangi mimari araçlarla" çözüleceğini açıklayan detaylı, profesyonel ve premium bir "PFLICHTENHEFT" (Teknik Uygulama Şartnamesi) dökümanına dönüştür.

Gereksinimleri "Wie & Womit" (Nasıl & Ne ile?) prensibine göre teknik detaylarıyla (Next.js, Tailwind, PostgreSQL, API mimarisi, Güvenlik filtreleri vb.) eşleştir ve planla.

Lastenheft Dökümanı:
${lastenheftContent}

Dönüştürülecek Pflichtenheft dökümanını Türkçe ve Markdown formatında oluştur. Başlık olarak doğrudan teknik şartname adı ile başla.`,
    });
    return { success: true, data: text };
  } catch (error) {
    console.error('generatePflichtenheftFromLastenheft error:', error);
    return { success: false, error: 'Pflichtenheft üretilirken AI hatası oluştu.' };
  }
}

