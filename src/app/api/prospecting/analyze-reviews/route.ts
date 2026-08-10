import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { getFlashModel } from '@/lib/ai/gemini-client';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { leadId, companyName, reviews } = await req.json();

    if (!reviews || !reviews.length) {
      return NextResponse.json({ success: false, error: 'Yorum verisi bulunamadı.' }, { status: 400 });
    }

    const { text } = await generateText({
      model: getFlashModel(),
      system: `Sen elit bir dijital ajansın baş stratejisti ve metin yazarısın. Şirket yorumlarını inceleyip en büyük acı noktasını (Pain Point) tespit et ve ikna edici bir teklif cümlesi (Custom Pitch) yaz. Çıktıyı SADECE JSON formatında ver: {"painPoint": "...", "customPitch": "..."}`,
      prompt: `Şirket Adı: ${companyName || 'Bu Şirket'}\nMüşteri Yorumları:\n${reviews.map((r: string) => `- ${r}`).join('\n')}`
    });

    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    let parsedData;
    try {
      parsedData = JSON.parse(cleanedText);
    } catch(e) {
      console.log("Failed to parse JSON", text);
      parsedData = {
        painPoint: "Dijital Varlık Eksikliği",
        customPitch: "Müşterilerinizin dijital platformlarda yaşadığı problemleri fark ettik, altyapınızı güçlendirmek isteriz."
      };
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
