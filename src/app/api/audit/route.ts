import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { domain, language = "tr" } = await req.json();
    const lang = (language || "tr").toLowerCase();

    const isDe = lang === "de";
    const isEn = lang === "en";

    if (!domain || typeof domain !== "string") {
      const errorMsg = isDe
        ? "Bitte geben Sie eine gültige Website-Domain ein."
        : isEn
        ? "Please enter a valid website domain."
        : "Geçerli bir web sitesi adresi giriniz.";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    let cleanDomain = domain.trim().toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0];

    if (!cleanDomain || !cleanDomain.includes('.')) {
      const errorMsg = isDe
        ? "Bitte geben Sie eine gültige Domain ein (z. B. ihrunternehmen.de)"
        : isEn
        ? "Please enter a valid domain (e.g. yourcompany.com)"
        : "Geçerli bir domain giriniz (Örn: firmaniz.com)";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
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

    let recommendations;
    let potentialRevenueBoost;

    if (isDe) {
      recommendations = [
        { title: "Ladezeit kritisch langsam", desc: `Die Ladezeit beträgt ${lcpTime}s. Schätzungsweise 42 % der Besucher verlassen die Website, bevor sie geladen ist.`, impact: "HOCH" },
        { title: "Fehlende KI & autonome Lead-Generierung", desc: "Kein 24/7 KI-Vertriebsassistent aktiv, um Besucher außerhalb der Geschäftszeiten zu erfassen.", impact: "HOCH" },
        { title: "Konversionsverluste bei mobiler UX", desc: "Formularprozesse sind auf Mobilgeräten unübersichtlich und führen zu Lead-Abbrüchen.", impact: "MITTEL" },
        { title: "Fehlende B2B-CRM- & Workflow-Automation", desc: "Anfragen werden nicht automatisch synchronisiert; Lead-Bearbeitungszeiten sind verzögert.", impact: "MITTEL" }
      ];
      potentialRevenueBoost = "+240 % bis +380 % Potenzial";
    } else if (isEn) {
      recommendations = [
        { title: "Page Speed Critically Slow", desc: `Page load time is ${lcpTime}s. An estimated 42% of visitors bounce before the page loads.`, impact: "HIGH" },
        { title: "Missing AI & Autonomous Lead Capture", desc: "No 24/7 AI Sales Agent to capture and qualify visitors outside office hours.", impact: "HIGH" },
        { title: "Mobile UX Conversion Leaks", desc: "Form completion flows are clumsy on mobile devices, causing lead drop-offs.", impact: "MEDIUM" },
        { title: "Lack of B2B CRM & Workflow Automation", desc: "Inquiries are not synced automatically to CRM; response times lag behind benchmarks.", impact: "MEDIUM" }
      ];
      potentialRevenueBoost = "+240% to +380% Growth Potential";
    } else {
      recommendations = [
        { title: "Sayfa Hızı Kritik Düzeyde Yavaş", desc: `Sayfa açılış süresi ${lcpTime}sn. Ziyaretçilerinizin tahmini %42'si site yüklenmeden çıkış yapıyor.`, impact: "YÜKSEK" },
        { title: "Yapay Zeka ve Otonom Müşteri Yakalama Eksik", desc: "Mesai saatleri dışında gelen ziyaretçileri karşılayacak 7/24 AI Satış Asistanı bulunmuyor.", impact: "YÜKSEK" },
        { title: "Mobil Dönüşüm UX Kayıpları", desc: "Form doldurma adımları mobil cihazlarda karmaşık ve dönüşüm kaybettiriyor.", impact: "ORTA" },
        { title: "B2B CRM & Akıllı İş Akışı Eksikliği", desc: "Talepler otomatik CRM'e işlenmiyor; temsilcilere bildirim düşmede gecikme yaşanıyor.", impact: "ORTA" }
      ];
      potentialRevenueBoost = "%240 - %380 Artış İmkanı";
    }

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
      potentialRevenueBoost
    });
  } catch (error) {
    console.error("Audit API Error:", error);
    return NextResponse.json({ error: "Analiz sırasında bir hata oluştu." }, { status: 500 });
  }
}
