'use server';

import { prisma } from '@/lib/prisma';
import { safeRevalidatePath } from '@/lib/utils/cache';
import { logActivity } from './activity';
import { generateText } from 'ai';
import { getProModel, getFlashModel } from '@/lib/ai/gemini-client';

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

    safeRevalidatePath('/admin/contracts');
    safeRevalidatePath('/client/contracts');
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

    safeRevalidatePath('/admin/contracts');
    safeRevalidatePath('/client/contracts');
    safeRevalidatePath('/client');
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

    safeRevalidatePath('/admin/contracts');
    safeRevalidatePath('/client/contracts');
    safeRevalidatePath('/client');
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

    safeRevalidatePath('/admin/contracts');
    safeRevalidatePath('/client/contracts');
    safeRevalidatePath('/client');
    return { success: true };
  } catch (error) {
    console.error('deleteContract error:', error);
    return { success: false, error: 'Failed to delete contract' };
  }
}

export async function generatePflichtenheftFromLastenheft(lastenheftContent: string, language?: string) {
  try {
    const langText = language === 'en' ? 'English' : language === 'de' ? 'German (Deutsch)' : 'Türkçe (Turkish)';
    const { text } = await generateText({
      model: getProModel(),
      prompt: `Sen uzman bir B2B teknik mimar ve yazılım mühendisisin. Kesinlikle bir hukukçu veya avukat DEĞİLSİN.
Aşağıda verilen "Lastenheft" (Müşteri İş Gereksinimleri) dökümanını incele.
Bu dökümandaki her bir iş ihtiyacını, teknik hedefleri ve müşteri taleplerini analiz ederek; bunların "Hangi teknolojilerle, nasıl, ne şekilde ve hangi mimari araçlarla" çözüleceğini açıklayan detaylı, profesyonel ve premium bir "PFLICHTENHEFT" (Teknik Uygulama Şartnamesi) dökümanına dönüştür.

ÇOK KRİTİK UYARI: BU DOKÜMAN BİR YASAL SÖZLEŞME DEĞİLDİR! 
- Kesinlikle hukuki sözleşme maddeleri (Madde 1: Taraflar, Fesih, Yetkili Mahkemeler vb.) İÇERMEMELİDİR. 
- "İşbu sözleşme..." gibi yasal girişler yapma.
- Sadece teknik uygulama planı, altyapı, kullanılacak kütüphaneler, veritabanı yapısı, sunucu mimarisi gibi teknik detayları (Wie & Womit) planla ve açıkla.
Gereksinimleri "Wie & Womit" (Nasıl & Ne ile?) prensibine göre teknik detaylarıyla (Next.js, Tailwind, PostgreSQL, API mimarisi, Güvenlik filtreleri, sunucu mimarisi vb.) eşleştir ve planla.

Lastenheft Dökümanı:
${lastenheftContent}

Dönüştürülecek Pflichtenheft dökümanını ${langText} dilinde ve Markdown formatında oluştur. Başlık olarak doğrudan teknik şartname adı ile başla.
Please write the document in ${langText}.`,
    });
    return { success: true, data: text };
  } catch (error) {
    console.error('generatePflichtenheftFromLastenheft error:', error);
    return { success: false, error: 'Pflichtenheft üretilirken AI hatası oluştu.' };
  }
}

export async function generateLastenheftFromChoices(data: {
  serviceType: string;
  clientName: string;
  clientEmail?: string;
  title: string;
  budget: string;
  currency: string;
  selectedNeeds: string[];
  customNotes?: string;
  sector?: string;
  projectDescription?: string;
  language?: string;
}) {
  try {
    const serviceLabels: Record<string, string> = {
      WEB: 'Web Sitesi Geliştirme (Next.js & Modern UI)',
      SAAS: 'Web Uygulamaları (B2B SaaS / Panel Mimarisi)',
      AGENTS: 'Yapay Zeka Ajanları (AI Agents & LLM Entegrasyonu)',
      AUTOMATION: 'AI İş Akış Otomasyonları (n8n, Webhook & API)',
      MARKETING: 'Reklam & Sosyal Medya (Google/Meta Reklam Yönetimi)'
    };

    const sectorLabels: Record<string, string> = {
      RETAIL: 'E-Ticaret & Perakende (Giyim, Mağaza vb.)',
      FOOD: 'Gıda & Restoran (Kafe, Sipariş vb.)',
      REAL_ESTATE: 'Gayrimenkul & Emlak',
      HEALTH: 'Sağlık & Klinik (Medikal, Doktor vb.)',
      EDUCATION: 'Eğitim & Kurs (Akademi, E-Öğrenme vb.)',
      LOGISTICS: 'Lojistik & Taşımacılık',
      FINANCE: 'Finans, Danışmanlık & B2B',
      OTHER: 'Diğer / Genel Sektör'
    };
    
    const serviceName = serviceLabels[data.serviceType] || data.serviceType;
    const sectorName = data.sector ? (sectorLabels[data.sector] || data.sector) : 'Diğer / Genel Sektör';
    const langText = data.language === 'en' ? 'English' : data.language === 'de' ? 'German (Deutsch)' : 'Türkçe (Turkish)';

    const { text } = await generateText({
      model: getFlashModel(),
      prompt: `Sen uzman bir B2B iş analisti ve proje yöneticisisin. Kesinlikle bir hukukçu veya avukat DEĞİLSİN.
Aşağıda müşterinin yazdığı serbest metin proje açıklaması, seçilen hizmet türü, sektör tercihleri ve seçilen işlevlere dayanarak profesyonel bir "LASTENHEFT" (Müşteri İş Gereksinimleri / Proje Talebi) dokümanı oluştur.

ÇOK KRİTİK UYARI: BU DOKÜMAN KESİNLİKLE BİR YASAL SÖZLEŞME DEĞİLDİR! 
- ASLA "Madde 1: Taraflar", "Fesih", "Hizmet Sözleşmesi" gibi başlıklar kullanma.
- ASLA "İşbu sözleşme...", "Taraflar arasında akdedilmiştir" gibi hukuki giriş cümleleri yazma.
Bu doküman sadece ve sadece "Ne ve Niçin" (Was & Wofür) mantığıyla hazırlanmalı, müşterinin ne istediğini ve bunu neden/niçin istediğini açıklayan düz bir iş gereksinimleri şartnamesi olmalıdır.

Müşteri/Firma Bilgileri:
- Müşteri Adı: ${data.clientName}
- İletişim E-Postası: ${data.clientEmail || 'Belirtilmedi'}
- Sektör / Odak Alanı: ${sectorName}

Proje Detayları:
- Proje Başlığı: ${data.title}
- Hizmet Türü: ${serviceName}
- Hedeflenen Bütçe: ${data.budget ? `${data.budget} ${data.currency}` : 'Belirtilmedi'}

Müşterinin Proje Fikri / Açıklaması (Serbest Metin):
${data.projectDescription || 'Belirtilmedi'}

Müşterinin Seçtiği İhtiyaçlar ve İşlevler (Ne?):
${data.selectedNeeds.map(need => `- ${need}`).join('\n')}

Müşterinin Hedefleri ve Notları (Niçin?):
${data.customNotes || 'Belirtilmedi'}

Lütfen bu girdilerden akıcı, profesyonel cümleler kurarak ${langText} dilinde ve Markdown formatında detaylı, sektöre özel hazırlanmış ve zengin içerikli bir Lastenheft dokümanı oluştur. Müşterinin girdiği serbest metin açıklaması içerisindeki detayları (Örn: özel menüler, posta kodu sınırlamaları, üyelik-abonelik kuralları vb.) mutlaka dokümana entegre et. Başlık olarak doğrudan iş gereksinimleri adı ile başla.
Please write the document in ${langText}.`,
    });
    return { success: true, data: text };
  } catch (error: any) {
    console.error('generateLastenheftFromChoices error:', error);
    return { success: false, error: `Lastenheft üretilirken AI hatası oluştu: ${error?.message || String(error)}` };
  }
}

export async function generateOfficialContract(data: {
  lastenheft: string;
  pflichtenheft: string;
  clientName: string;
  title: string;
  value?: number;
  currency?: string;
  language?: string;
}) {
  try {
    const budgetText = data.value ? `${data.value} ${data.currency || 'TRY'}` : 'Belirtilmedi';
    const langText = data.language === 'en' ? 'English' : data.language === 'de' ? 'German (Deutsch)' : 'Türkçe (Turkish)';
    
    const { text } = await generateText({
      model: getFlashModel(),
      prompt: `Sen B2B teknoloji hukuku ve sözleşme danışmanlığı konusunda uzmanlaşmış, şirket çıkarlarını korumada son derece agresif ve kıdemli bir hukukçusun.
Aşağıda verilen "Lastenheft" (Müşteri İş Gereksinimleri) ve "Pflichtenheft" (Teknik Uygulama Şartnamesi) dokümanlarını esas alarak, StarWebFlow şirketimizin haklarını, çıkarlarını ve yasal sınırlarını en üst düzeyde koruyan (Pro/Elit düzeyde tek taraflı korumacı), hukuki geçerliliği olan resmi bir "B2B ANA HİZMET SÖZLEŞMESİ" (Master Service Agreement) oluştur.

Tüm hizmetler için bu ana sözleşme son yasal ve bağlayıcı aşamadır. SADECE BU AŞAMADA sözleşme ve hukuk dili kullanılacaktır.
Aşağıdaki tüm koruyucu yasal bölümler StarWebFlow lehine olacak şekilde otomatik olarak sözleşmeye entegre edilmelidir:

STARWEBFLOW LEHİNE KRİTİK YASAL MADDELER VE YAPISI:
1. SÖZLEŞMENİN TARAFLARI VE KONUSU: StarWebFlow ile ${data.clientName} arasındaki yazılım/web geliştirme projesinin genel çerçevesi.
2. GİZLİLİK VE VERİ GÜVENLİĞİ (GİZLİLİK SÖZLEŞMESİ / NDA): Müşterinin gizlilik ihlallerinde çok ağır cezalar uygulanırken, StarWebFlow'un veri gizliliği ile ilgili yükümlülükleri ve olası veri sızıntılarındaki yasal sorumluluğu kanuni asgari sınırlarda tutulmalıdır.
3. FİKRİ VE SINAİ MÜLKİYET HAKLARI (IP RIGHTS - STARWEBFLOW LEHİNE): Geliştirilen yazılıma ait tüm kaynak kodları, mülkiyet ve telif hakları, Müşteri sözleşme bedelinin %100'ünü tamamen ödeyene kadar StarWebFlow mülkiyetindedir. Müşteri ödemeleri geciktirirse StarWebFlow lisansı tek taraflı iptal edebilir, hizmeti ve projeyi kapatabilir. Ödeme bitse dahi "Background IP" (StarWebFlow'un önceden geliştirdiği altyapılar, kütüphaneler, şablonlar ve hazır kod blokları) tamamen StarWebFlow mülkiyetinde kalır; müşteriye sadece devredilemez, kopyalanamaz ve satılamaz basit bir kullanım lisansı verilir.
4. KAPSAM YÖNETİMİ VE EK TALEPLER (SCOPE CREEP): Projenin teknik sınırları sadece Pflichtenheft ile çizilmiştir. Pflichtenheft dışındaki en ufak bir ek talep, yeni özellik veya revizyon ek bütçeye ve ek sözleşmeye tabi olacaktır. StarWebFlow ek talepleri yapıp yapmamakta veya ek süre istemekte tamamen serbesttir.
5. SORUMLULUK SINIRLANDIRILMASI (LIMITATION OF LIABILITY - KRİTİK): StarWebFlow'un herhangi bir hasar, gecikme, hata veya doğrudan/dolaylı zarar durumunda üstleneceği maksimum toplam yasal sorumluluk, müşterinin o ana kadar StarWebFlow'a fiilen ödediği toplam net tutarı hiçbir koşulda geçemez. Dolaylı zararlar, kâr kayıpları veya veri kayıpları için StarWebFlow'dan hiçbir tazminat talep edilemez.
6. HİZMET SEVİYESİ TAAHHÜDÜ (SLA): Destek ve bakım müdahale süreleri tahmini hedefler olup, gecikmelerde StarWebFlow'a cezai veya mali yaptırım uygulanamaz. Üçüncü taraf servis sağlayıcılardan (Örn: AWS, Vercel, OpenAI vb.) kaynaklanan kesintilerden StarWebFlow sorumlu tutulamaz.
7. GDPR & KVKK UYUMLULUĞU: Müşteri, son kullanıcıların verilerinin yasalara uygun olarak toplanmasından tek başına sorumludur ve bu verilerin işlenmesi konusunda StarWebFlow'u tüm yasal iddialardan muaf tutar.
8. ÖDEME KOŞULLARI, GECİKME CEZALARI VE FESİH: Toplam Bütçe (${budgetText}) doğrultusundaki ödeme koşulları. Ödemelerin gecikmesi durumunda aylık %5 gecikme faizi uygulanır ve StarWebFlow işi anında askıya alma hakkına sahiptir. Müşteri sözleşmeyi haklı bir neden olmaksızın feshederse, o ana kadar yapılan tüm ödemeler irat (gelir) kaydedilir ve kalan bedelin tamamı derhal muaccel (hemen ödenebilir) hale gelir.
9. MÜCBİR SEBEPLER VE YETKİLİ MAHKEMELER: Mücbir sebeplerin tanımı ve doğabilecek ihtilaflarda münhasıran Speyer (Almanya) Mahkemelerinin ve İcra Dairelerinin yetkisi.

Müşteri Firma: ${data.clientName}
Proje Adı: ${data.title}
Toplam Bütçe: ${budgetText}

MÜŞTERİ TALEPLERİ (Lastenheft):
${data.lastenheft}

TEKNİK ŞARTNAME (Pflichtenheft):
${data.pflichtenheft}

Lütfen bu iki belgedeki teknik şartları ve StarWebFlow şirketimizin çıkarlarını azami seviyede koruyan yasal maddeleri entegre ederek, çok detaylı, resmi bir ${langText} dil kullanarak Markdown formatında nihai B2B Hizmet Sözleşmesini oluştur. Başlık olarak doğrudan resmi sözleşme adı ile başla.
Please write the document in ${langText}.`,
    });
    return { success: true, data: text };
  } catch (error) {
    console.error('generateOfficialContract error:', error);
    return { success: false, error: 'Resmi sözleşme üretilirken AI hatası oluştu.' };
  }
}

export async function createPublicLastenheft(data: {
  name: string;
  email: string;
  idea: string;
}) {
  try {
    const { text } = await generateText({
      model: getFlashModel(),
      prompt: `Sen StarWebFlow Bilişim'in baş iş analistisin. 
Müşteri aşağıdaki fikir ile web sitemiz üzerinden bir proje talebinde bulundu.
Müşteri Adı: ${data.name}
Müşteri E-Postası: ${data.email}
Proje Fikri: "${data.idea}"

Lütfen bu fikri analiz ederek "Ne ve Niçin" (Was & Wofür) mantığında, Türkçe ve Markdown formatında profesyonel bir "LASTENHEFT" (Gereksinim Şartnamesi) dokümanı oluştur. 
Bu doküman yasal sözleşme maddeleri İÇERMEMELİDİR. Sadece iş gereksinimlerini listelemelidir.`,
    });

    const contract = await prisma.contract.create({
      data: {
        tenant: { connect: { id: 'default-tenant' } },
        title: `${data.name} - Proje Talebi (Lastenheft)`,
        clientName: data.name,
        clientEmail: data.email,
        type: 'LASTENHEFT',
        status: 'draft',
        content: text
      }
    });

    return { success: true, data: contract };
  } catch (error) {
    console.error('createPublicLastenheft error:', error);
    return { success: false, error: 'Talebiniz kaydedilirken bir hata oluştu.' };
  }
}



