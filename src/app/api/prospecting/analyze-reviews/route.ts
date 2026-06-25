import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { leadId, companyName, reviews } = await req.json();

    if (!reviews || !reviews.length) {
      return NextResponse.json({ success: false, error: 'Yorum verisi bulunamadı.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY bulunamadı!");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Sen elit bir dijital ajansın baş stratejisti ve metin yazarısın. 
    Şirket Adı: ${companyName || 'Bu Şirket'}
    Müşteri Yorumları:
    ${reviews.map((r: string) => `- ${r}`).join('\n')}

    Görevlerin:
    1. Bu yorumları analiz ederek şirketin en büyük zayıf yönünü (Pain Point) 1-2 kelime ile özetle. Örn: "Kötü Web Sitesi", "Yavaş Müşteri Hizmetleri", "Randevu Sorunu".
    2. Bu şirketin kurucusuna hitaben, bu ağrı noktasını nazikçe vurgulayan ve bunun psikolojik/ticari yüküne (Örn: "Bu konu muhtemelen sizin de en çok vaktinizi alan veya müşteri/gelir kaybına sebep olan bir problem") değinerek empati kuran bir "Giriş Cümlesi/Paragrafı (Custom Pitch)" yaz. Sonrasında kısa ve profesyonel bir şekilde bizim dijital ajans hizmetlerimizi (web sitesi, otomasyon, CRM vb.) çözüm olarak öner. Örnek tonlama: "Merhaba Hans Bey, son yorumlarınızda müşterilerin randevu alamamaktan şikayet ettiğini gördüm. Tahmin ediyorum ki bu durum hem sizin vaktinizi çalıyor hem de potansiyel hasta kaybına yol açıyordur. Kuracağımız X sistemiyle..."
    
    Lütfen yanıtını SADECE aşağıdaki JSON formatında ver, fazladan açıklama yazma:
    {
      "painPoint": "...",
      "customPitch": "..."
    }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch(e) {
      console.log("Failed to parse JSON", text);
      parsedData = {
        painPoint: "Dijital Varlık Eksikliği",
        customPitch: "Müşterilerinizin dijital platformlarda yaşadığı problemleri fark ettik, altyapınızı güçlendirmek isteriz."
      }
    }

    if (leadId) {
       await prisma.lead.update({
         where: { id: leadId },
         data: {
           painPoints: [parsedData.painPoint],
           customPitch: parsedData.customPitch
         }
       });
    }

    return NextResponse.json({ success: true, ...parsedData });
  } catch (error: any) {
    console.error("[Analyze Reviews API] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
