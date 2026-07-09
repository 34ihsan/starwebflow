import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { getFlashModel, getProModel } from '@/lib/ai/gemini-client';

export const maxDuration = 60;

const CONTENT_PROMPTS = {
  blog: (topic: string, lang: string) => `
Sen StarWebflow'un içerik uzmanısın. Aşağıdaki konuda profesyonel bir blog yazısı yaz.
Konu: ${topic}
Dil: ${lang === 'tr' ? 'Türkçe' : lang === 'de' ? 'Almanca' : 'İngilizce'}
Format: Markdown (başlık, alt başlıklar, madde işaretleri)
Uzunluk: 800-1200 kelime
SEO optimize, bilgilendirici ve okuyucuyu etkileyen bir ton kullan.`,

  email: (context: string, lang: string) => `
Sen StarWebflow'un satış e-posta uzmanısın. 
Bağlam: ${context}
Dil: ${lang === 'tr' ? 'Türkçe' : lang === 'de' ? 'Almanca' : 'İngilizce'}
Kısa, etkili, samimi bir outreach e-postası yaz.
Format: Konu satırı + e-posta gövdesi
Uzunluk: 100-200 kelime`,

  proposal: (details: string, lang: string) => `
Sen StarWebflow'un teklif uzmanısın. Profesyonel bir proje teklifi taslağı yaz.
Proje detayları: ${details}
Dil: ${lang === 'tr' ? 'Türkçe' : lang === 'de' ? 'Almanca' : 'İngilizce'}
Format: Markdown (Proje Özeti, Kapsam, Süreç, Neden StarWebflow)
Kurumsal, güven verici ve değer odaklı bir ton kullan.`,

  social: (topic: string, platform: string) => `
Sen StarWebflow'un sosyal medya uzmanısın.
Konu: ${topic}
Platform: ${platform}
${platform === 'linkedin' ? 'Uzun form, profesyonel, düşünce liderliği tonu. 3-5 paragraf.' : ''}
${platform === 'instagram' ? 'Kısa, enerjik, emoji kullan. 3-5 cümle + hashtag\'ler.' : ''}
${platform === 'twitter' ? 'Maksimum 280 karakter. Dikkat çekici, aksiyon odaklı.' : ''}
Türkçe yaz.`,
};

export async function POST(req: Request) {
  try {
    const {
      type,         // "blog" | "email" | "proposal" | "social"
      topic,        // Ana konu veya bağlam
      platform,     // Social için: "linkedin" | "instagram" | "twitter"
      lang = 'tr',  // Dil: "tr" | "de" | "en"
      usePro = false, // Gemini Pro kullan (daha uzun içerikler için)
    } = await req.json();

    if (!type || !topic) {
      return NextResponse.json({ error: 'type ve topic zorunludur' }, { status: 400 });
    }

    let systemPrompt = '';
    switch (type) {
      case 'blog':
        systemPrompt = CONTENT_PROMPTS.blog(topic, lang);
        break;
      case 'email':
        systemPrompt = CONTENT_PROMPTS.email(topic, lang);
        break;
      case 'proposal':
        systemPrompt = CONTENT_PROMPTS.proposal(topic, lang);
        break;
      case 'social':
        systemPrompt = CONTENT_PROMPTS.social(topic, platform || 'linkedin');
        break;
      default:
        return NextResponse.json({ error: 'Geçersiz içerik tipi' }, { status: 400 });
    }

    const model = usePro ? getProModel() : getFlashModel();

    const { text } = await generateText({
      model,
      prompt: systemPrompt,
    });

    return NextResponse.json({
      content: text,
      type,
      model: usePro ? 'gemini-2.0-pro-exp' : 'gemini-2.0-flash',
      wordCount: text.split(' ').length,
    });
  } catch (error: any) {
    console.error('[Content Gen] Hata:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
