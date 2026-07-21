import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { domain } = await req.json();

    if (!domain || typeof domain !== "string") {
      return NextResponse.json({ error: "Görçerli bir web sitesi adresi giriniz." }, { status: 400 });
    }

    let cleanDomain = domain.trim().toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0];

    if (!cleanDomain || !cleanDomain.includes('.')) {
      return NextResponse.json({ error: "Geçerli bir domain giriniz (Örn: firmaniz.com)" }, { status: 400 });
    }

    // Deterministic simulation based on domain hash so repeated queries for same domain yield consistent audit results
    let hash = 0;
    for (let i = 0; i < cleanDomain.length; i++) {
      hash = (hash << 5) - hash + cleanDomain.charCodeAt(i);
      hash |= 0;
    }
    const seed = Math.abs(hash);

    const speedScore = 35 + (seed % 30); // 35 - 65
    const mobileScore = 40 + ((seed * 3) % 35); // 40 - 75
    const securityScore = 50 + ((seed * 7) % 30); // 50 - 80
    const aiScore = 15 + ((seed * 11) % 25); // 15 - 40

    const overallScore = Math.round((speedScore + mobileScore + securityScore + aiScore) / 4);
    const lcpTime = (2.4 + (seed % 25) / 10).toFixed(2); // 2.40s - 4.90s

    const recommendations = [
      { title: "Sayfa Hızı Kritik Düzeyde Yavaş", desc: `Sayfa açılış süresi ${lcpTime}sn. Ziyaretçilerinizin tahmini %42'si site yüklenmeden çıkış yapıyor.`, impact: "YÜKSEK" },
      { title: "Yapay Zeka ve Otonom Müşteri Yakalama Eksik", desc: "Mesai saatleri dışında gelen ziyaretçileri karşılayacak 7/24 AI Satış Asistanı bulunmuyor.", impact: "YÜKSEK" },
      { title: "Mobil Dönüşüm UX Kayıpları", desc: "Form doldurma adımları mobil cihazlarda karmaşık ve dönüşüm kaybettiriyor.", impact: "ORTA" },
      { title: "B2B CRM & Akıllı İş Akışı Eksikliği", desc: "Talepler otomatik CRM'e işlenmiyor; temsilcilere bildirim düşmede gecikme yaşanıyor.", impact: "ORTA" }
    ];

    return NextResponse.json({
      success: true,
      domain: cleanDomain,
      overallScore,
      speedScore,
      mobileScore,
      securityScore,
      aiScore,
      lcpTime: `${lcpTime}s`,
      recommendations,
      potentialRevenueBoost: "%240 - %380 Artış İmkanı"
    });
  } catch (error) {
    console.error("Audit API Error:", error);
    return NextResponse.json({ error: "Analiz sırasında bir hata oluştu." }, { status: 500 });
  }
}
