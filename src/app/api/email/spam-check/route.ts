import { NextRequest, NextResponse } from 'next/server';
import { analyzeSpamWords } from '@/lib/deliverability-score';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subject, body: emailBody } = body;

    if (!subject && !emailBody) {
      return NextResponse.json({ error: 'subject veya body gerekli' }, { status: 400 });
    }

    const fullText = `${subject || ''} ${emailBody || ''}`;
    const { found, riskScore } = analyzeSpamWords(fullText);

    // Categorize risk
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    let riskColor: string;
    let message: string;

    if (riskScore === 0) {
      riskLevel = 'LOW';
      riskColor = 'emerald';
      message = 'Harika! Spam riski tespit edilmedi. Bu içerik inbox\'a ulaşma olasılığı yüksek.';
    } else if (riskScore <= 24) {
      riskLevel = 'MEDIUM';
      riskColor = 'yellow';
      message = 'Bazı riskli kelimeler tespit edildi. Göndermeden önce gözden geçirmeniz önerilir.';
    } else if (riskScore <= 48) {
      riskLevel = 'HIGH';
      riskColor = 'orange';
      message = 'Yüksek spam riski! Bu içerik büyük olasılıkla spam klasörüne düşecek.';
    } else {
      riskLevel = 'CRITICAL';
      riskColor = 'red';
      message = 'Kritik spam riski! Bu içerik gönderilemez düzeyde risklidir.';
    }

    // Word count & other stats
    const wordCount = fullText.split(/\s+/).filter(Boolean).length;
    const linkCount = (fullText.match(/https?:\/\//g) || []).length;
    const imageCount = (fullText.match(/<img/gi) || []).length;
    const capsRatio = fullText.split(/\s+/).filter(w => w.length > 2 && w === w.toUpperCase()).length / Math.max(1, wordCount);

    return NextResponse.json({
      success: true,
      riskScore,
      riskLevel,
      riskColor,
      message,
      spamKeywordsFound: found,
      stats: {
        wordCount,
        linkCount,
        imageCount,
        capsRatio: Math.round(capsRatio * 100),
        subjectLength: (subject || '').length,
        hasPersonalization: fullText.includes('{{'),
      },
      suggestions: generateSuggestions(found, capsRatio, linkCount, (subject || '').length)
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
