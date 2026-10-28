import { getAgentModel, getGoogleProvider, getGoogleApiKey, getOllamaBaseUrl, isOllamaPrimary } from '@/lib/ai/gemini-client';
import { retrieveStarWebFlowRagContext } from '@/lib/ai/rag-engine';
import { streamText, formatDataStreamPart } from 'ai';

let isGeminiQuotaExhausted = false;

/**
 * Fast health probe to verify if Gemini has available credits before attempting streamText.
 * Catches HTTP 402 (prepayment credits depleted) or rate limits in ~300ms without 12s hang & 500 error.
 */
async function isGeminiUsable(apiKey: string): Promise<boolean> {
  if (!apiKey || isGeminiQuotaExhausted) return false;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'ping' }] }] }),
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);
    if (res.status === 402 || res.status === 429 || res.status === 403) {
      isGeminiQuotaExhausted = true;
      return false;
    }
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Fast health probe to verify if Ollama server is reachable before attempting streamText.
 * Prevents 10s hang and silent stream death when Ollama server is offline or unreachable.
 */
async function isOllamaReachable(baseUrl: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`${baseUrl}/api/tags`, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

function streamFallbackResponse(lastUserMsg: string, langKey: 'tr' | 'de' | 'en'): Response {
  let fallbackText = '';
  const lower = (lastUserMsg || '').toLowerCase();

  if (langKey === 'tr') {
    // 1. ChatGPT vs. Kendi Sunucunda Yerel Model (Ollama) Karşılaştırması
    if (
      (lower.includes('chatgpt') || lower.includes('chat gpt') || lower.includes('gpt')) &&
      (lower.includes('ollama') || lower.includes('yerel') || lower.includes('model') || lower.includes('hangisi') || lower.includes('fark') || lower.includes('mantık') || lower.includes('vs'))
    ) {
      fallbackText = `İşletmeniz için **ChatGPT mi yoksa Kendi Sunucunuzda Yerel Modeller (Ollama) mi** daha mantıklı? İşte 3 kritik karar kriteri:

1. 🔒 Veri Güvenliği & KVKK / DSGVO Cezaları:
• **ChatGPT:** Yazışmalar, müşteri isimleri, telefonlar ve teklifler üçüncü taraf açık bulut sunucularına iletilir. Kurumsal verilerin sızması veya yapay zeka eğitim havuzuna karışması ciddi yasal riskler (KVKK / DSGVO cezaları) doğurur.
• **Özel Sunuculu Yerel Model:** Sistem Tier-3/Tier-4 Frankfurt veya TR dedike sunucunuzda izole çalışır. Verileriniz sunucunuzdan 1 bayt bile dışarı çıkmaz; %100 gizli ve şirketinizin kontrolünde kalır.

2. 💵 Değişken Token Faturaları vs. Sabit Sunucu Gideri:
• **ChatGPT:** Sorgu ve kelime başına dolara endeksli "API token faturası" ödersiniz. Siteniz veya WhatsApp hattınız yoğunlaştıkça faturalar katlanır ve öngörülemez hale gelir.
• **Yerel Model:** Aylık token faturası **sıfırdır (0$)**. İster ayda 1.000 ister 100.000 müşteriyle konuşun, yalnızca sabit sunucu kiranızı ödersiniz.

3. ⚡ Kesintisiz Süreç & Şirket Hafızası:
• Yerel modeller doğrudan kendi veritabanınıza, CRM'inize ve fatura sisteminize bağlanarak şirketinizin marka diliyle ve ürün kataloğuyla kusursuz yanıt verir.

🎯 **Sonuç:** Bireysel denemeler için ChatGPT cazip görünse de; **müşteri verisi işleyen, 7/24 satış ve destek yürüten ciddi bir işletme için kendi sunucunuzda açık kaynaklı yerel model çalıştırmak hem güvenlik hem de uzun vadeli bütçe açısından kat kat daha mantıklıdır.**

👉 Şirketiniz için en uygun yerel model mimarisini ve donanım bütçesini /randevu sayfamızdan 15 dakikalık ücretsiz mimari görüşmeyle birlikte planlayabiliriz.`;
    }
    // 2. VPS'deki Ollama Modelini Canlıya ve Buraya Bağlama
    else if (
      (lower.includes('vps') || lower.includes('sunucu') || lower.includes('ionos') || lower.includes('hostinger')) &&
      (lower.includes('bağla') || lower.includes('entegre') || lower.includes('canlı') || lower.includes('buraya') || lower.includes('nasıl'))
    ) {
      fallbackText = `Evet, VPS üzerindeki Ollama servisini hem canlı web sitenize hem de yerel test ortamınıza bağlamak mümkündür ve en verimli çalışma yöntemidir!

İşte bunu sağlamanın 2 adımlı temiz yolu:
1. 🖥️ **VPS Üzerinde Dış Dinleme:** VPS'inizdeki Ollama servisinin dış dünyaya güvenli yanıt verebilmesi için \`OLLAMA_HOST=0.0.0.0:11434\` ortam değişkeniyle çalıştırılması ve güvenlik duvarında bu porta (veya tercihen arkasına kurulacak Nginx SSL ters vekili ile örneğin \`https://ai.siteniz.com\` adresine) izin verilmesi gerekir.
2. ⚙️ **Projeye Tanımlama:** Hem canlı sunucunuzdaki hem de yerel geliştirme ortamınızdaki \`.env\` dosyasında:
\`OLLAMA_BASE_URL="http://sunucu-ip-adresiniz:11434"\` (veya SSL arkasındaki alan adınız) olarak tanımlandığında, her iki ortam da tek bir güçlü merkezden yapay zeka yanıtlarını üretmeye başlar.

👉 Bu bağlantıyı sizin için anahtar teslim yapılandırmak ve test etmek üzere /randevu sayfamızdan teknik randevu planlayabilirsiniz.`;
    }
    // 3. Nasıl Çalışıyoruz & Süreç & Teslimat Süresi
    else if (
      lower.includes('nasıl çalış') ||
      lower.includes('süreç') ||
      lower.includes('teslimat') ||
      lower.includes('ne kadar sür') ||
      lower.includes('aşama') ||
      lower.includes('adımlar')
    ) {
      fallbackText = `Projelerimizi 4 aşamalı kurumsal mühendislik disipliniyle hayata geçiriyoruz:

1. 🎯 **1. Gün - Mimari Keşif & Şartname:** 15 dakikalık görüşmeyle iş süreçleriniz, mevcut CRM yapınız ve sunucu ihtiyaçlarınız netleştirilir.
2. 🔒 **2-4. Gün - İzole Sunucu & Model Eğitimi:** Tier-3/Tier-4 sunucunuz ayağa kaldırılır, şirketinizin ürün ve bilgi havuzu (RAG) yüklenerek yerel yapay zeka modelleri eğitilir.
3. ⚙️ **5-7. Gün - Süreç Otomasyonu (n8n):** Web siteniz, WhatsApp hattınız ve muhasebe sisteminiz otomatik veri akışlarıyla birbirine bağlanır.
4. 🚀 **Canlıya Alma & 7/24 Telemetri:** Sistem canlıya alınır ve her 60 saniyede bir otomatik telemetri denetimiyle %99.98 uptime güvencesiyle çalışır.

👉 Sürecinizi başlatmak için /randevu sayfamızdan ilk keşif görüşmesini planlayabilirsiniz.`;
    }
    // 4. Fiyatlar, Ücretlendirme ve Maliyet
    else if (
      lower.includes('fiyat') ||
      lower.includes('ücret') ||
      lower.includes('maliyet') ||
      lower.includes('kaç para') ||
      lower.includes('kaç tl') ||
      lower.includes('kaç euro') ||
      lower.includes('bütçe') ||
      lower.includes('fiyatlandırma') ||
      (lower.includes('ne kadar') && (lower.includes('tutar') || lower.includes('ödeme') || lower.includes('para')))
    ) {
      fallbackText = `Starwebflow'da sürpriz veya dolara endeksli değişken faturalar yoktur. Maliyet modelimiz 3 şeffaf esasa dayanır:

1. 🔒 **Yapay Zeka & Otomasyon:** Kendi kiraladığınız dedike sunucuda çalıştığı için OpenAI gibi şirketlere aylık token/kelime faturası ödemezsiniz. Tek seferlik anahtar teslim kurulum + isteğe bağlı 7/24 SLA bakım modeli uygulanır.
2. ⚡ **Sub-Second Web & Portallar:** Next.js 14 altyapısıyla geliştirilen sistemler; sayfa sayısı, müşteri portalı veya ERP entegrasyonu derinliğine göre şeffaf bir proje teklifiyle fiyatlandırılır.
3. 📋 **Ücretsiz Ön Şartname & Fizibilite:** Projenize başlamadan önce hiçbir ön ödeme yapmadan, /randevu sayfamızdan 15 dakikalık teknik değerlendirme alabilir; tam maliyet ve yol haritasını ücretsiz çıkarabilirsiniz.`;
    }
    // 5. Hangi Modeller Kullanılıyor
    else if (
      (lower.includes('hangi') || lower.includes('neler') || lower.includes('tür')) &&
      (lower.includes('model') || lower.includes('llm'))
    ) {
      fallbackText = `Tek bir kapalı sağlayıcıya bağımlı kalmak yerine; donanım bütçenize, dil ihtiyaçlarınıza ve kullanım senaryonuza göre en verimli açık kaynaklı kurumsal modelleri sunucunuza kurup optimize ediyoruz:

• ⚡ **Hızlı Satış & Müşteri Karşılama:** 1.5B - 3B parametreli, anlık 15-30ms tepki süresine sahip hafif ve çevik modeller.
• 🧠 **Karmaşık B2B Mantık & Şartname Analizi:** 7B - 14B parametreli, Türkçe, Almanca ve İngilizceyi akıcı anlayan güçlü modeller.
• ⚙️ **Veri Çıkarma & Otomasyon:** JSON ve SQL sorgusu üreten yapılandırılmış modeller.

Sunucunuz tamamen sizin kontrolünüzde olduğu için modeller dilediğiniz zaman güncellenebilir veya değiştirilebilir.`;
    }
    // 6. Next.js 14, Web Geliştirme, Hız & B2B Portalları
    else if (
      lower.includes('next') ||
      lower.includes('lcp') ||
      lower.includes('sub-second') ||
      lower.includes('portal') ||
      lower.includes('kurumsal web') ||
      lower.includes('web sistemi') ||
      lower.includes('hız')
    ) {
      fallbackText = `Next.js 14 ile geliştirdiğimiz 0.8 saniye altı kurumsal web sistemlerinin işletmenize kazandırdığı 3 somut avantaj:

1. ⚡ Göz Açıp Kapayıncaya Kadar Açılış (0.8s Altı LCP):
Klasik WordPress veya hantal temalı siteler tıkladığınızda 3 ila 5 saniye bekletir. Google araştırmalarına göre her 1 saniyelik gecikme ziyaretçilerin %20'sinin siteyi terk etmesine yol açar. Next.js 14 sayfaları dünya çapındaki sunucularda önceden derlediği için müşteri linke tıkladığı an sayfa gecikmesiz açılır; reklam bütçeniz çöpe gitmez, dönüşüm oranı ortalama 3.6 kat artar.

2. 🔐 Şifreli Müşteri & B2B Portalları:
Müşterileriniz sadece statik sayfaları gezmez; kendi şirket hesabıyla şifreli panele girip sözleşmelerini, tekliflerini, faturalarını ve proje aşamalarını 7/24 canlı takip edebilir.

3. 📅 Ücretsiz & Bağımsız Randevu/Takvim Mimarisi:
Aylık kullanıcı başı 15-30$ Calendly veya Cal.com aboneliği ödemek yerine; kendi Next.js sitenize gömülü çalışan, Google Takvim & Outlook ile çift yönlü eşitlenen ve WhatsApp hatırlatmalı sınırsız bir randevu altyapısı kuruyoruz.

👉 Projeniz için /randevu sayfamızdan 15 dakikalık ücretsiz mimari değerlendirme alabilirsiniz.`;
    }
    // 7. Randevu & Takvim & Kalender Mimarisi
    else if (
      lower.includes('randevu') ||
      lower.includes('takvim') ||
      lower.includes('kalender') ||
      lower.includes('toplantı') ||
      lower.includes('görüşme')
    ) {
      fallbackText = `İşletmeniz için harici aylık abonelikler (Calendly vb.) ödemeden tamamen ÜCRETSİZ ve yüksek kaliteli bir Randevu & Takvim sistemi geliştirmenin 4 adımlı yol haritası:

1. 🗄️ 1. Adım: Bağımsız Veritabanı (Prisma + PostgreSQL)
Müşteri verilerinizi üçüncü parti yabancı şirketlere kaptırmamak için randevu kayıtlarını kendi PostgreSQL sunucunuzda tutuyoruz. Böylece müşteri geçmişi, notlar ve iletişim bilgileri %100 sizin mülkiyetinizde kalır.

2. 🔄 2. Adım: Çift Yönlü Takvim Senkronizasyonu (Google Calendar API / ICS)
Google Calendar veya Outlook entegrasyonu ile yöneticilerinizin takvimindeki müsait saatler anında okunur. Dolu saatler web sitenizde otomatik kapanır; randevu seçildiği an otomatik Google Meet linkli toplantı daveti her iki tarafa da iletilir.

3. 🤖 3. Adım: n8n ile WhatsApp & E-Posta Hatırlatma Otopilotu
Randevudan 24 saat ve 1 saat önce müşteriye WhatsApp API veya ücretsiz SMTP üzerinden otomatik hatırlatma gönderilir. Bu sayede randevuya katılmama (no-show) oranı %80 oranında düşer.

4. ⚡ 4. Adım: Doğrudan Chatbot ve Web Sayfasından Randevu Alma
Müşteri uzun formlar doldurmadan, doğrudan web sitenizdeki /randevu sayfasından veya bu chat ekranından 15 saniyede randevusunu kilitler.

👉 Hemen /randevu sayfamızdan bu altyapıyı birlikte planlamak için 15 dakikalık ücretsiz görüşme ayarlayabilirsiniz!`;
    }
    // 8. n8n & Süreç & Fatura Otomasyonu
    else if (
      lower.includes('n8n') ||
      lower.includes('webhook') ||
      lower.includes('otomasyon') ||
      lower.includes('otopilot') ||
      (lower.includes('crm') && lower.includes('fatura'))
    ) {
      fallbackText = `n8n ve webhook entegrasyonu ile ekibinizin haftalık 15-20 saatini alan tekrarlayan manuel işleri otopilota alıyoruz:

1. 📥 Anında Müşteri Nitelendirme: Sitenizden veya WhatsApp'tan form dolduran müşteri adayı 3 saniyede CRM'inize (HubSpot, Pipedrive) işlenir.
2. 📄 Otomatik Fatura & Teklif Üretimi: Müşteri bilgileri girildiği an sistem otomatik PDF teklif taslağı hazırlar ve onayınıza sunar.
3. 📆 Takvim & Randevu Senkronizasyonu: Randevu alındığında takviminiz kilitlenir, Google Meet linki müşteriye otomatik iletilir ve görüşmeden 1 saat önce WhatsApp'tan hatırlatma gider.

👉 Firmanıza özel otomasyon kurgusu için /randevu sayfamızdan 15 dakikalık ücretsiz mimari görüşmesi başlatabilirsiniz.`;
    }
    // 9. Canlı Analiz & Site Denetimi
    else if (
      lower.includes('analiz') ||
      lower.includes('audit') ||
      lower.includes('kaçak') ||
      lower.includes('ciro') ||
      lower.includes('tarama') ||
      (lower.includes('site') && lower.includes('nasıl'))
    ) {
      fallbackText = `Web sitenizin gerçek sunucu yanıt süresini (TTFB), güvenlik başlıklarını (SSL/HSTS), ChatGPT görünürlüğünü ve hız kaybından doğan tahmini ciro açığınızı ana sayfamızdaki 'Canlı Analiz' bölümünden 3 saniyede ücretsiz test edebilirsiniz. Dilerseniz web sitenizin adresini buraya da yazabilirsiniz; sistemimiz sizin için hemen inceleyip rapor sunacaktır.`;
    }
    // 10. Genel Sovereign AI & Sunucu Güvenliği
    else if (
      lower.includes('ollama') ||
      lower.includes('ajan') ||
      lower.includes('sunucu') ||
      lower.includes('sovereign') ||
      lower.includes('model') ||
      lower.includes('yapay zeka') ||
      lower.includes('güvenlik') ||
      lower.includes('kvkk') ||
      lower.includes('dsgvo')
    ) {
      fallbackText = `Starwebflow Sovereign AI mimarisi, şirket içi ticari sırlarınızı ve müşteri yazışmalarınızı üçüncü taraf açık bulut şirketlerine GÖNDERMEZ.

🔒 1. Veri İzolasyonu & Donanım Özellikleri:
• Sisteminiz; Tier-3/Tier-4 sertifikalı, ISO 27001 güvenlik standartlarına sahip, yüksek hızlı NVMe SSD ve dedike işlemci (vCPU/RAM) kaynakları tahsis edilmiş izole sunucularda çalışır.
• Sunucu lokasyonunu isteğinize göre Almanya (Frankfurt) veya Türkiye merkezli olarak belirleyebilirsiniz. Tüm veriler %100 KVKK ve Avrupa Birliği DSGVO (GDPR) mevzuatına tam uyumlu kalır.

⚙️ 2. İsteğe Bağlı Açık Kaynaklı Yerel Modeller:
• Kapalı veya dışa bağımlı servisler yerine; şirketinizin sektörüne ve veri hacmine en uygun kurumsal açık kaynaklı modelleri (Ollama altyapısıyla) doğrudan kendi sunucunuza kurup optimize ediyoruz.
• Dolara endeksli aylık "token faturası" ödemezsiniz; sisteminiz 7/24 sınırsız sorgu kapasitesiyle sabit sunucu maliyetinde çalışır.

🌐 3. Çok Kanallı Merkezi Entegrasyon:
• Kurulan bu yerel model kümesi; web sitenize, WhatsApp destek hattınıza ve CRM sisteminize bağlanarak tüm müşteri temas noktalarını tek merkezden besler.

👉 Firmanıza özel sunucu altyapısı ve model yol haritasını planlamak için /randevu sayfamızdan 15 dakikalık ücretsiz mimari değerlendirme alabilirsiniz.`;
    } else {
      fallbackText = `Merhaba! Starwebflow olarak işletmenize özel dedike sunucularda çalışan yerel AI ajanları (Ollama), n8n süreç otomasyonları ve 0.8s altı ultra hızlı Next.js 14 kurumsal web sistemleri kuruyoruz.

Merak ettiğiniz mimariyi (örneğin: ChatGPT vs Yerel Model farkı, VPS kurulumu, süreç otomasyonu veya Next.js hız avantajları) doğrudan sorabilir ya da /randevu sayfamızdan 15 dakikalık ücretsiz mimari değerlendirme görüşmesi planlayabilirsiniz.`;
    }
  } else if (langKey === 'de') {
    if (
      (lower.includes('chatgpt') || lower.includes('chat gpt') || lower.includes('gpt')) &&
      (lower.includes('ollama') || lower.includes('lokal') || lower.includes('vergleich') || lower.includes('unterschied') || lower.includes('besser'))
    ) {
      fallbackText = `ChatGPT vs. Lokale On-Premise-Modelle (Ollama) auf eigenem Server:

1. 🔒 Datenschutz & 100% DSGVO-Konformität:
Bei ChatGPT fließen Kundendaten und interne Dokumente auf US-Cloud-Server. Bei unserer souveränen Architektur verlässt kein einziges Byte Ihr Frankfurter Tier-4-Rechenzentrum – vollständige Haftungssicherheit nach DSGVO.

2. 💵 Feste Serverkosten statt unberechenbarer Token-Gebühren:
Statt variabler monatlicher Token-Rechnungen in US-Dollar zahlen Sie ausschließlich Ihre feste Servermiete – bei unbegrenzten 24/7 Anfragen.

3. ⚡ Tiefenintegration in ERP & CRM:
Ihre lokalen Modelle greifen mit Millisekunden-Latenz direkt auf interne Datenbanken und Workflows zu.

Fazit: Für ein B2B-Unternehmen mit sensiblen Daten ist ein dediziertes lokales Modell um ein Vielfaches sicherer und kostengünstiger. Buchen Sie gerne eine kostenlose 15-Minuten-Analyse unter /randevu.`;
    } else if (
      lower.includes('termin') ||
      lower.includes('meeting') ||
      lower.includes('kontakt') ||
      lower.includes('kalender') ||
      lower.includes('buchen')
    ) {
      fallbackText =
        'Sehr gerne! Wir bieten Ihnen eine 15-minütige kostenlose Architektur- und Machbarkeitsberatung mit unserem Senior-Engineering-Team. Buchen Sie Ihren Wunschtermin direkt unter /randevu oder hinterlassen Sie uns Ihren Namen und Ihre E-Mail-Adresse hier im Chat.';
    } else if (
      lower.includes('preis') ||
      lower.includes('kosten') ||
      lower.includes('angebot') ||
      lower.includes('budget')
    ) {
      fallbackText =
        'Bei Starwebflow gibt es keine versteckten Kosten: Lokale KI-Systeme laufen ohne monatliche Token-Gebühren auf Ihrem dedizierten Server. Für Webentwicklung und Automatisierungen erstellen wir nach einer kurzen 15-minütigen Analyse unter /randevu ein transparentes Festpreisangebot.';
    } else if (
      lower.includes('ollama') ||
      lower.includes('ki') ||
      lower.includes('agent') ||
      lower.includes('server') ||
      lower.includes('dsgvo')
    ) {
      fallbackText =
        'Unsere souveränen KI-Agenten laufen auf dedizierten Tier-4 Servern im Frankfurter Rechenzentrum mit NVMe-Storage. Wir setzen auf bedarfsgerechte, quelloffene lokale Modelle (Ollama-Architektur), die zu 100% DSGVO-konform ohne Datenweitergabe an Drittanbieter arbeiten. Es fallen keine variablen API-Token-Gebühren an. Für ein individuelles Konzept buchen Sie gerne Ihren Termin unter /randevu.';
    } else if (
      lower.includes('n8n') ||
      lower.includes('workflow') ||
      lower.includes('crm') ||
      lower.includes('rechnung')
    ) {
      fallbackText =
        'Über n8n und REST-Webhooks verbinden wir Ihre Formulare, E-Mails und WhatsApp direkt mit Ihrem CRM (HubSpot, Pipedrive) und Ihrer Buchhaltung. Leads werden in Sekunden qualifiziert, Rechnungsentwürfe automatisch erstellt und Termine gebucht – das spart Ihrem Team über 15 Stunden manuelle Arbeit pro Woche.';
    } else if (
      lower.includes('web') ||
      lower.includes('portal') ||
      lower.includes('speed') ||
      lower.includes('next')
    ) {
      fallbackText =
        'Unsere Next.js 14 Plattformen erreichen LCP-Ladezeiten unter 0,8 Sekunden und perfekte Google Core Web Vitals (100/100). Dies minimiert Absprungraten und steigert die Conversion-Rate im Schnitt um das 3,6-Fache. Zudem entwickeln wir maßgeschneiderte B2B-Kundenportale mit rollenbasiertem Zugriff.';
    } else {
      fallbackText =
        'Wir entwickeln für Ihr Unternehmen souveräne KI-Agenten, n8n-Workflow-Automatisierungen und hochperformante Next.js Webanwendungen nach DIN ISO 25010 Qualitätsstandards. Wie können wir Ihre operativen Prozesse unterstützen? Vereinbaren Sie gerne einen Termin unter /randevu.';
    }
  } else {
    if (
      (lower.includes('chatgpt') || lower.includes('chat gpt') || lower.includes('gpt')) &&
      (lower.includes('ollama') || lower.includes('local') || lower.includes('compare') || lower.includes('difference') || lower.includes('better'))
    ) {
      fallbackText = `ChatGPT vs. On-Premise Private Models (Ollama) on Dedicated Infrastructure:

1. 🔒 Data Privacy & 100% GDPR Compliance:
With ChatGPT, client messages and proprietary IP are sent to third-party US clouds. With our sovereign setup, all data remains strictly inside your Tier-4 dedicated VPS (Frankfurt/TR) with zero external leakage.

2. 💵 Predictable Fixed Cost vs. Recurring Token Bills:
Zero variable per-token API fees. Whether your system handles 1,000 or 100,000 queries monthly, your hosting costs stay completely flat.

3. ⚡ Zero-Latency Workflow Integration:
Local models hook directly into your PostgreSQL, CRM, and accounting backends via private APIs.

Conclusion: For enterprise operations handling sensitive customer data, running local models on dedicated hardware is dramatically safer and more cost-effective. Book a 15-minute feasibility call at /randevu.`;
    } else if (
      lower.includes('booking') ||
      lower.includes('schedule') ||
      lower.includes('meeting') ||
      lower.includes('calendar') ||
      lower.includes('call')
    ) {
      fallbackText =
        'We would be delighted to schedule a complimentary 15-minute architecture review with our senior engineering team. You can book directly at /randevu or share your requirements right here in the chat.';
    } else if (
      lower.includes('price') ||
      lower.includes('cost') ||
      lower.includes('pricing') ||
      lower.includes('quote')
    ) {
      fallbackText =
        'Starwebflow operates on transparent pricing with zero surprise token invoices: Sovereign AI models run at flat infrastructure costs. We scope custom Next.js platforms and n8n automations via a complimentary 15-minute review at /randevu.';
    } else if (
      lower.includes('ollama') ||
      lower.includes('agent') ||
      lower.includes('server') ||
      lower.includes('sovereign')
    ) {
      fallbackText =
        'Our Sovereign AI agents operate directly on dedicated Tier-4 private VPS infrastructure (Frankfurt or TR datacenters) with NVMe storage and isolated compute. We deploy on-demand open-source models via Ollama with zero third-party cloud data transmission, ensuring 100% GDPR/KVKK compliance with fixed hosting costs and zero per-token fees. Schedule a 15-minute review at /randevu to plan your deployment.';
    } else if (
      lower.includes('n8n') ||
      lower.includes('automation') ||
      lower.includes('crm') ||
      lower.includes('workflow')
    ) {
      fallbackText =
        'Using n8n and secure webhooks, we seamlessly connect your website and messaging channels with your CRM (HubSpot, Pipedrive) and accounting. Inbound leads are qualified instantly, invoice drafts are generated, and meetings are booked automatically, saving 15+ hours weekly.';
    } else if (
      lower.includes('web') ||
      lower.includes('portal') ||
      lower.includes('speed') ||
      lower.includes('next')
    ) {
      fallbackText =
        'Our web architectures leverage Next.js 14 App Router to deliver sub-0.8s LCP load speeds and 100/100 Google Core Web Vitals. This eliminates mobile bounce and lifts conversion rates by up to 3.6x. We also build custom B2B portals with role-based access.';
    } else {
      fallbackText =
        'Starwebflow engineers sovereign AI agents, n8n process automations, and sub-second web platforms. All systems run on dedicated infrastructure with full data privacy. Let us know your requirements and we will scope a tailored solution.';
    }
  }

  // Stream in small natural word chunks
  const words = fallbackText.split(' ');
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < words.length; i += 3) {
        const chunk = words.slice(i, i + 3).join(' ') + (i + 3 < words.length ? ' ' : '');
        controller.enqueue(encoder.encode(formatDataStreamPart('text', chunk)));
      }
      controller.enqueue(
        encoder.encode(
          formatDataStreamPart('finish_message', {
            finishReason: 'stop',
            usage: { promptTokens: 10, completionTokens: words.length },
          })
        )
      );
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Vercel-AI-Data-Stream': 'v1',
    },
  });
}

export async function POST(req: Request) {
  try {
    const {
      messages,
      tenantId = 'default-tenant',
      activeSection = 'hero',
      timeOnPage = 0,
      language = 'tr',
      auditContext = null,
      visitorContext = null,
    } = await req.json();

    const effectiveAudit = auditContext?.domain
      ? auditContext
      : visitorContext?.auditedDomain
      ? {
          domain: visitorContext.auditedDomain,
          overallScore: visitorContext.auditScore,
          lcpTime: visitorContext.lcpTime || 'N/A',
          detectedIndustry: visitorContext.detectedIndustry,
          recommendedService: visitorContext.recommendedService,
          specTitle: visitorContext.specTitle,
        }
      : visitorContext?.specTitle
      ? {
          specTitle: visitorContext.specTitle,
          specIdea: visitorContext.specIdea,
        }
      : null;

    const langKey: 'tr' | 'de' | 'en' =
      language === 'de' || language === 'en' || language === 'tr' ? language : 'tr';

    const lastUserMsg =
      Array.isArray(messages) && messages.length > 0
        ? String(messages[messages.length - 1]?.content || '')
        : '';

    let ragResult = { formattedContext: '' };
    try {
      ragResult = await retrieveStarWebFlowRagContext(lastUserMsg, 3);
    } catch {
      // RAG failure is non-blocking
    }

    const auditMemoryBlock = effectiveAudit
      ? langKey === 'de'
        ? `\n[AKTIVER SITZUNGSKONTEXT DES BESUCHERS]
${effectiveAudit.domain ? `- Vom Besucher geprüfte eigene Domain: "${effectiveAudit.domain}" (Score: ${effectiveAudit.overallScore}/100, Branche: ${effectiveAudit.detectedIndustry || 'B2B'})` : ''}
${effectiveAudit.specTitle ? `- Vom Besucher erstellter Architektur-Entwurf: "${effectiveAudit.specTitle}"` : ''}`
        : langKey === 'en'
        ? `\n[ACTIVE VISITOR SESSION CONTEXT]
${effectiveAudit.domain ? `- Visitor's own audited domain: "${effectiveAudit.domain}" (Score: ${effectiveAudit.overallScore}/100, Industry: ${effectiveAudit.detectedIndustry || 'B2B'})` : ''}
${effectiveAudit.specTitle ? `- Visitor's generated architecture blueprint: "${effectiveAudit.specTitle}"` : ''}`
        : `\n[ZİYARETÇİNİN BU OTURUMDAKİ KENDİ İŞLEMİ]
${effectiveAudit.domain ? `- Ziyaretçinin az önce kendi tarattığı domain: "${effectiveAudit.domain}" (Skor: ${effectiveAudit.overallScore}/100, Sektör: ${effectiveAudit.detectedIndustry || 'B2B'})` : ''}
${effectiveAudit.specTitle ? `- Ziyaretçinin oluşturduğu şartname taslağı: "${effectiveAudit.specTitle}"` : ''}`
      : '';

    let systemPrompt = '';
    if (langKey === 'de') {
      systemPrompt = `Sie sind der offizielle KI-Architektur-Berater von Starwebflow.
Wir bauen souveräne, autarke Systeme: Dedizierte Server, lokale Ollama-Modelle, n8n-Workflows und Next.js 14 Plattformen nach DIN ISO 25010 Standards.

[UNSERE 4 KERNBEREICHE]
1. Souveräne KI-Agenten & Lokale LLMs (/hizmetler/ai-agents): 100% DSGVO-konform auf dedizierten Servern (Frankfurt/TR), 0 API-Token-Kosten, 24/7 aktiv.
2. End-to-End Workflow- & CRM-Automatisierung (/hizmetler/ai-otomasyon): n8n, Webhooks & REST-APIs für automatische Lead-Erfassung, Rechnungen und Termine.
3. Subsekunden Next.js 14 Web & B2B-Portale (/hizmetler/web-gelistirme): LCP unter 0,8s, A+ Sicherheit, 3,6x Conversion-Multiplikator.
4. 24/7 Monitoring & 99,98% Uptime-SLA (/hizmetler/web-uygulamasi): Proaktive Überwachung aller Server und Schnittstellen alle 60 Sekunden.

[KONTEXT]
${ragResult.formattedContext}
${auditMemoryBlock}

Antworten Sie prägnant auf Deutsch in 2 bis 3 klaren, überzeugenden Sätzen.`;
    } else if (langKey === 'en') {
      systemPrompt = `You are the official Enterprise Architecture & AI Advisor of Starwebflow.
We build sovereign, high-performance systems: Dedicated servers, local Ollama models, n8n automations, and sub-second Next.js 14 web apps.

[OUR 4 CORE PILLARS]
1. Sovereign AI Agents & Local LLMs (/hizmetler/ai-agents): 100% GDPR compliant on dedicated VPS, zero API token fees, 24/7 active.
2. End-to-End Process & CRM Automation (/hizmetler/ai-otomasyon): n8n and Webhooks for automated lead routing, invoice dispatch, and calendar sync.
3. Sub-Second Next.js 14 Web & B2B Portals (/hizmetler/web-gelistirme): Sub-0.8s LCP, A+ security headers, 3.6x conversion multiplier.
4. 24/7 Telemetry & 99.98% Uptime SLA: Proactive probing every 60 seconds with intervention guarantee.

[CONTEXT]
${ragResult.formattedContext}
${auditMemoryBlock}

Respond authoritatively in English in 2 to 3 sharp, helpful sentences.`;
    } else {
      systemPrompt = `Sen Starwebflow'un resmi Kurumsal Mimari & AI Danışmanısın.
Biz işletmelerin verilerini üçüncü taraf bulut tekellerine sızdırmadan; kendi sunucularında çalışan yerel yapay zeka ajanları (Ollama), n8n süreç otomasyonları ve 0.8s altı Next.js 14 web sistemleri kuruyoruz.

[4 TEMEL MİMARİ ALANIMIZ]
1. Sovereign AI Ajanları & Yerel LLM (/hizmetler/ai-agents): Tier-3/Tier-4 Frankfurt veya TR dedike sunucularda çalışan isteğe bağlı açık kaynaklı yerel modeller (Ollama altyapısı), %100 KVKK/DSGVO veri gizliliği, sıfır token faturası.
2. Uçtan Uca Süreç & CRM Otomasyonları (/hizmetler/ai-otomasyon): n8n ve webhook ile otomatik lead kaydı, teklif/fatura üretimi ve takvim senkronizasyonu.
3. Sub-Second Kurumsal Web & B2B Portalları (/hizmetler/web-gelistirme): Next.js 14 ile 0.8s LCP açılış hızı, Google 100/100 skor, Grade A+ güvenlik.
4. 7/24 Kesintisiz Telemetri & %99.98 Uptime SLA: Her 60 saniyede otomatik sağlık taraması ve 15 dk müdahale garantisi.

[GÜNCEL BİLGİ & HAFIZA]
${ragResult.formattedContext}
${auditMemoryBlock}

Daima TÜRKÇE, 2-3 net ve profesyonel cümleyle yanıt ver. Ziyaretçinin sorduğu mimariyi açıkla ve ilgilenirse ücretsiz teknik mimari analizi / randevu (/randevu) için yönlendir.`;
    }

    // 1. Step: Try Primary Ollama Model (e.g. on dedicated VPS) with fast 1.2s availability check
    if (isOllamaPrimary()) {
      const ollamaBaseUrl = getOllamaBaseUrl();
      const isOnline = await isOllamaReachable(ollamaBaseUrl);

      if (isOnline) {
        try {
          const primaryModel = getAgentModel();
          const result = await streamText({
            model: primaryModel,
            system: systemPrompt,
            messages,
            maxTokens: 500,
            temperature: 0.3,
          });

          return result.toDataStreamResponse();
        } catch (ollamaErr: any) {
          console.warn(`[Chat API] Ollama akış hatası: ${ollamaErr?.message}. Yedek sağlayıcıya geçiliyor...`);
        }
      } else {
        console.warn(`[Chat API] Ollama (${ollamaBaseUrl}) çevrimdışı veya portu henüz açık değil. Yedek sağlayıcıya geçiliyor...`);
      }
    }

    // 2. Step: Try Google Gemini Provider only if quota/prepayment is valid
    const googleKey = getGoogleApiKey();
    if (googleKey && googleKey !== 'BURAYA_API_ANAHTARINIZI_YAPISTIRIN') {
      const geminiOnline = await isGeminiUsable(googleKey);
      if (geminiOnline) {
        try {
          const googleProvider = getGoogleProvider();
          const fallbackResult = await streamText({
            model: googleProvider('gemini-2.5-flash'),
            system: systemPrompt,
            messages,
            maxTokens: 500,
            temperature: 0.3,
          });

          return fallbackResult.toDataStreamResponse();
        } catch (googleError: any) {
          console.warn(`[Chat API] Google Gemini yanıt veremedi (${googleError?.message}). Dayanıklı akıllı akışa geçiliyor...`);
        }
      } else {
        console.warn(`[Chat API] Google Gemini API kotası tükenmiş (402) veya geçersiz. Dayanıklı akıllı akışa geçiliyor...`);
      }
    }

    // 3. Step: Resilient Instant Structured Stream (Guaranteed never to fail, freeze, or hang)
    return streamFallbackResponse(lastUserMsg, langKey);
  } catch (globalError: any) {
    console.error('[Chat API Global Error]:', globalError);
    return streamFallbackResponse('genel', 'tr');
  }
}
