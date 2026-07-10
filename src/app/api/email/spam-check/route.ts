import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { getFlashModel } from '@/lib/ai/gemini-client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subject, body: emailBody } = body;

    if (!subject && !emailBody) {
      return NextResponse.json({ error: 'subject veya body gerekli' }, { status: 400 });
    }

    const fullText = `${subject || ''} ${emailBody || ''}`;

    // YZ Tabanlı Semantik Spam Analizi
    const { text } = await generateText({
      model: getFlashModel(),
      system: `Sen elit düzey bir E-Posta Deliverability ve Spam Analiz uzmanısın. Gönderilen metni analiz edip, JSON formatında yanıt dönmelisin.
Format:
{
  "riskScore": 0-100 arası spam riski puanı (100 = kesin spam, 0 = güvenli),
  "spamKeywordsFound": ["bulunan", "riskli", "kelimeler"],
  "message": "Kısa ve net 1-2 cümlelik genel değerlendirme",
  "suggestions": ["Spam riskini düşürmek için 1. öneri", "Spam riskini düşürmek için 2. öneri"]
}
Kurallar: Satış baskısı (aciliyet, "hemen al", "ücretsiz"), aşırı büyük harf, spammy kelimeler veya çok fazla link risk skorunu artırır. Eğer gayet doğal, kurumsal veya günlük bir yazışmaysa riskScore düşük (0-20) olsun.`,
      prompt: `Konu: ${subject}\n\nİçerik: ${emailBody}`
    });

    let aiResult;
    try {
      aiResult = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
    } catch (e) {
      console.error("AI Parse error:", text);
      return NextResponse.json({ error: 'YZ analizi parse edilemedi' }, { status: 500 });
    }

    const riskScore = aiResult.riskScore || 0;

    // Risk Kategorizasyonu
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    let riskColor: string;

    if (riskScore <= 15) {
      riskLevel = 'LOW';
      riskColor = 'emerald';
    } else if (riskScore <= 40) {
      riskLevel = 'MEDIUM';
      riskColor = 'yellow';
    } else if (riskScore <= 75) {
      riskLevel = 'HIGH';
      riskColor = 'orange';
    } else {
      riskLevel = 'CRITICAL';
      riskColor = 'red';
    }

    // Ek İstatistikler (Kelime, link vs)
    const wordCount = fullText.split(/\s+/).filter(Boolean).length;
    const linkCount = (fullText.match(/https?:\/\//g) || []).length;
    const imageCount = (fullText.match(/<img/gi) || []).length;
    const capsRatio = fullText.split(/\s+/).filter(w => w.length > 2 && w === w.toUpperCase()).length / Math.max(1, wordCount);

    return NextResponse.json({
      success: true,
      riskScore,
      riskLevel,
      riskColor,
      message: aiResult.message || 'Analiz tamamlandı.',
      spamKeywordsFound: aiResult.spamKeywordsFound || [],
      stats: {
        wordCount,
        linkCount,
        imageCount,
        capsRatio: Math.round(capsRatio * 100),
        subjectLength: (subject || '').length,
        hasPersonalization: fullText.includes('{{'),
      },
      suggestions: aiResult.suggestions || []
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function generateSuggestions(foundKeywords: string[], capsRatio: number, linkCount: number, subjectLength: number): string[] {
  const suggestions: string[] = [];

  if (foundKeywords.length > 0) {
    suggestions.push(`"${foundKeywords.slice(0, 3).join('", "')}" gibi riskli kelimeleri kaldırın veya değiştirin`);
  }
  if (capsRatio > 0.2) {
    suggestions.push('Büyük harfli kelimeleri azaltın — spam filtrelerini tetikler');
  }
  if (linkCount > 3) {
    suggestions.push(`${linkCount} link var — 1-2 ile sınırlı tutun`);
  }
  if (subjectLength > 60) {
    suggestions.push('Konu başlığı 60 karakterden kısa tutun — mobilde kesilir');
  }
  if (subjectLength < 5) {
    suggestions.push('Konu başlığı çok kısa — en az 10 karakter önerilir');
  }
  if (!suggestions.length) {
    suggestions.push('İçerik sağlıklı görünüyor. Kişiselleştirme eklemek açılma oranını artırır.');
  }

  return suggestions;
}
