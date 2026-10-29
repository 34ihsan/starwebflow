import { NextResponse } from 'next/server';
import {
  generateTextResilient,
  extractJsonFromText,
  OLLAMA_MODELS,
} from '@/lib/ai/gemini-client';

export interface LeadBattlecard {
  leadName: string;
  company: string;
  industry: string;
  psychologySummary: string;
  painPoint: string;
  coldEmailSubject: string;
  coldEmailBody: string;
  inboxScore: number;
  whatsappIcebreaker: string;
  recommendedPackage: string;
  automationNodes: string[];
  modelsUsed: string[];
}

function buildFallbackBattlecard(lead: any): LeadBattlecard {
  const leadName =
    lead?.name ||
    `${lead?.firstName || ''} ${lead?.lastName || ''}`.trim() ||
    'Karar Verici';
  const company = lead?.company || leadName;
  const industry = lead?.industry || 'B2B Kurumsal';
  const serviceType = lead?.serviceType || 'Web & AI Otomasyon';

  return {
    leadName,
    company,
    industry,
    psychologySummary: `${company} (${industry}) hızlı yatırım getirisi (ROI), operasyonel zaman tasarrufu ve güvenilir teknik mimari arayan sonuç odaklı bir karar verici profiline sahip.`,
    painPoint: `${industry} sektöründe manuel müşteri takibi, geç yanıtlanan talepler ve yavaş web altyapısı nedeniyle aylık ortalama %25-35 potansiyel ciro kaybı.`,
    coldEmailSubject: `${company} için ${serviceType} & operasyonel hız analizi`,
    coldEmailBody: `Merhaba ${leadName},\n\n${company} olarak ${industry} alanındaki dijital süreçlerinizi inceledik. Benzer ölçekteki firmalarda kurduğumuz Next.js 15 ve 7/24 Star AI otomasyon mimarisiyle manuel iş yükünü %80 azaltıp dönüşümleri ikiye katlıyoruz.\n\nBu hafta Salı veya Perşembe günü size özel 5 dakikalık bir canlı demo göstermem için uygun musunuz?`,
    inboxScore: 98,
    whatsappIcebreaker: `Merhaba ${leadName} 👋 ${company} için hazırladığımız ${serviceType} büyüme ve otomasyon özetini az önce e-postanıza ilettim. Uygun olduğunuzda 2 dakikalık sesli/görüntülü özet geçebilir miyiz?`,
    recommendedPackage: `Sub-Second Next.js 15 Kurumsal Platform + 7/24 WhatsApp/CRM Otonom AI Ajanı (${serviceType})`,
    automationNodes: [
      'n1: Web/WhatsApp 7/24 Talep Yakalayıcı',
      'n2: Star AI Niyet & Bütçe Skorlama',
      'n3: Otomatik Teklif PDF & Takvim Onayı',
      'n4: CRM Pipeline & Yönetici Bildirimi',
    ],
    modelsUsed: [
      OLLAMA_MODELS.ADMIN,
      OLLAMA_MODELS.GROWTH,
      OLLAMA_MODELS.AUTOMATION,
    ],
  };
}

export async function POST(req: Request) {
  try {
    const { lead = {} } = await req.json();
    const fallback = buildFallbackBattlecard(lead);

    const prompt = `Sen Starwebflow'un Kıdemli Satış Stratejistisin.
Aşağıdaki potansiyel müşteri (lead) için Cold-to-Warm (Soğuktan Sıcağa) ikna ve satış planını hazırla:

Müşteri Bilgileri:
- Ad/Şirket: ${fallback.leadName} / ${fallback.company}
- Sektör: ${fallback.industry}
- İlgilendiği Hizmet: ${lead?.serviceType || 'Web & AI Otomasyon'}
- Notlar: ${lead?.notes || lead?.description || 'Kurumsal büyüme ve otomasyon'}

ÖNEMLİ: SADECE geçerli bir JSON objesi döndür, markdown veya ek açıklama yazma:
{
  "psychologySummary": "Müşterinin satın alma psikolojisi (1 kısa net cümle)",
  "painPoint": "Sektöründeki en büyük operasyonel zaman/para kaybı (1 cümle)",
  "coldEmailSubject": "Spam filtresine takılmayan, merak uyandırıcı 4-6 kelimelik konu başlığı",
  "coldEmailBody": "Link içermeyen, müşterinin acısını nokta atışı hedefleyen 3 cümlelik ikna edici B2B e-posta",
  "inboxScore": 98,
  "whatsappIcebreaker": "WhatsApp'tan atılacak samimi ve profesyonel ilk temas mesajı",
  "recommendedPackage": "Bu sektöre en yüksek verim sağlayacak Starwebflow mimari paketi"
}`;

    const aiRes = await generateTextResilient({
      prompt,
      temperature: 0.3,
      maxTokens: 400,
      preferredModel: 'admin',
    });

    if (aiRes.providerUsed !== 'fallback' && aiRes.text) {
      try {
        const parsed = JSON.parse(extractJsonFromText(aiRes.text));
        const cleanBody = String(parsed.coldEmailBody || fallback.coldEmailBody).replace(
          /https?:\/\/\S+|www\.\S+/gi,
          ''
        );
        const card: LeadBattlecard = {
          ...fallback,
          psychologySummary: parsed.psychologySummary || fallback.psychologySummary,
          painPoint: parsed.painPoint || fallback.painPoint,
          coldEmailSubject: parsed.coldEmailSubject || fallback.coldEmailSubject,
          coldEmailBody: cleanBody,
          inboxScore:
            typeof parsed.inboxScore === 'number' ? parsed.inboxScore : 98,
          whatsappIcebreaker:
            parsed.whatsappIcebreaker || fallback.whatsappIcebreaker,
          recommendedPackage:
            parsed.recommendedPackage || fallback.recommendedPackage,
        };
        return NextResponse.json({
          success: true,
          battlecard: card,
        });
      } catch {
        // Fall through to fallback
      }
    }

    return NextResponse.json({
      success: true,
      battlecard: fallback,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Battlecard error' },
      { status: 500 }
    );
  }
}
