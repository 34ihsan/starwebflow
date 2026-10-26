import { NextResponse } from "next/server";
import { generateTextResilient } from "@/lib/ai/gemini-client";

const KNOWN_CITIES = [
  "Berlin", "Hamburg", "München", "Munich", "Köln", "Cologne", "Frankfurt", "Stuttgart", "Düsseldorf",
  "Dortmund", "Essen", "Leipzig", "Bremen", "Dresden", "Hannover", "Nürnberg", "Mannheim", "Karlsruhe",
  "Heidelberg", "Mainz", "Ludwigshafen", "Kaiserslautern", "Speyer", "Landau", "Neustadt", "Wiesbaden",
  "Bonn", "Bielefeld", "Münster", "Augsburg", "Freiburg", "Kiel", "Rostock", "Saarbrücken",
];

function detectCity(msg: string): string | null {
  const lower = msg.toLowerCase();
  for (const c of KNOWN_CITIES) {
    if (lower.includes(c.toLowerCase())) return c;
  }
  return null;
}

type EcomIntent =
  | "delivery_speed" | "delivery_area" | "free_shipping" | "pickup" | "price" | "product"
  | "payment" | "returns" | "hours" | "stock" | "greeting" | "other";

function detectEcomIntent(m: string): EcomIntent {
  if (/\b(merhaba|selam|hallo|hi|hello|guten tag)\b/i.test(m) && m.length < 25) return "greeting";
  const t = m
    .toLowerCase()
    .replace(/ı/g, "i").replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ü/g, "u")
    .replace(/ö/g, "o").replace(/ç/g, "c").replace(/ä/g, "a").replace(/ß/g, "ss");
  if (/(ucretsiz|bedava|kargo (ucret|bedel|ne kadar|kac)|versandkosten|kostenlos|free shipping|shipping (cost|fee)|porto|60 ?(euro|€))/.test(t)) return "free_shipping";
  if (/(ertesi|ayni gun|sonraki gun|yarin|hemen|ne kadar surer|kac gun|kac saat|ne zaman (gelir|ulasir|teslim)|wann|morgen|naechsten tag|next day|same day|how long|how fast|schnell|dauer|express|lieferzeit)/.test(t)) return "delivery_speed";
  if (/(magazadan|magaza(ya)? gel|gel al|abholung|abholen|pickup|pick up|click ?&? ?collect)/.test(t)) return "pickup";
  if (/(iade|degisim|geri (al|ver|gonder)|retour|ruckgabe|umtausch|return|refund|reklamation)/.test(t)) return "returns";
  if (/(odeme|kredi kart|paypal|havale|kapida|zahlung|bezahl|payment|rechnung|klarna)/.test(t)) return "payment";
  if (/(acik mi|kacta|calisma saat|mesai|offnungs|geoffnet|opening|open now|hours)/.test(t)) return "hours";
  if (/(stok|var mi|mevcut|verfugbar|vorratig|in stock|available|lieferbar)/.test(t)) return "stock";
  if (/(fiyat|kac (tl|euro|€)|kac para|preis|kosten|wieviel|price|cost|how much)/.test(t)) return "price";
  if (/(teslim|kargo|gonder|liefer|versand|ship|deliver|nereye|bolge|region|ulas)/.test(t)) return "delivery_area";
  if (/(urun|helva|bal\b|zeytin|kahvalti|peynir|cay|produkt|honig|halva|oliven|kase|tee|product|honey|olive|cheese|oner|recommend|empfehl|var mi)/.test(t)) return "product";
  return "other";
}

function ecomFallbackReply(opts: {
  msg: string; lang: "tr" | "de" | "en"; brand: string; domain: string; locationText: string;
  serviceRegionText: string; offerings: string; policies: string; history: string;
}): string {
  const { msg, lang, brand, domain, locationText, serviceRegionText, offerings, policies, history } = opts;
  const intent = detectEcomIntent(msg);
  const city = detectCity(msg);
  const freeShip = (policies.match(/\d+\s*€[^•]*(kargo|versand|shipping)[^•]*|(kargo|versand|shipping)[^•]*\d+\s*€/i) || [""])[0].trim();
  const sample = offerings.split(",").slice(0, 2).join(",").trim();
  const local = /neustadt|weinstra/i.test(locationText);
  const cityFar = Boolean(city) && !locationText.toLowerCase().includes(String(city).toLowerCase());

  if (lang === "de") {
    switch (intent) {
      case "delivery_speed":
        return city && cityFar
          ? `Für **${city}** versenden wir bei **${brand}** per Paketdienst. 📦 Die genaue Lieferzeit für Ihre Postleitzahl sehen Sie im Warenkorb. Die Lieferung „am nächsten Tag“ gilt in erster Linie für unser lokales Liefergebiet rund um ${locationText}. Soll ich Ihnen die Versandkosten erklären?`
          : `Bei **${brand}** gilt: Bestellen Sie heute, erhalten Sie Ihre Ware in der Regel am nächsten Tag – im lokalen Liefergebiet (${locationText}) per Adresslieferung oder Abholung im Markt. 🚚 Für andere Regionen sehen Sie die Lieferzeit im Warenkorb.`;
      case "free_shipping":
        return `${freeShip ? `**${freeShip}**. ` : ""}Die Versandkosten für Ihre Adresse werden im Warenkorb transparent angezeigt. 🚚 Möchten Sie Ihren Warenkorb gleich auffüllen? Ich helfe bei der Produktauswahl.`;
      case "pickup":
        return `Ja, bei **${brand}** können Sie Ihre Bestellung auch im Markt abholen (${locationText}). 🏪 Wählen Sie im Warenkorb einfach „Abholung“ – wir halten alles bereit.`;
      case "returns":
        return `Bei Fragen zu Rückgabe oder Reklamation unterstützen wir Sie bei **${brand}** gern persönlich. Frische Lebensmittel können aus Hygienegründen nur eingeschränkt zurückgenommen werden; bei beschädigter Ware melden Sie sich bitte direkt mit Foto. Soll ich Ihre Anfrage an das Team weiterleiten?`;
      case "payment":
        return `Die verfügbaren Zahlungsarten bei **${brand}** sehen Sie im Checkout. 💳 Gern leite ich Ihre Frage zu einer bestimmten Zahlungsart ans Team weiter, falls Sie eine bestimmte Methode benötigen.`;
      case "hours":
        return `Der Online-Shop von **${brand}** ist 24/7 geöffnet. 🌙 Bestellungen außerhalb der Geschäftszeiten werden sofort erfasst und im nächsten Zustellfenster bearbeitet. Die Öffnungszeiten des Marktes in ${locationText} finden Sie auf der Website.`;
      case "stock":
        return `Die Verfügbarkeit sehen Sie live auf der Produktseite. Nennen Sie mir gern das gewünschte Produkt${sample ? ` (z. B. ${sample})` : ""} – ich prüfe die Auswahl für Sie und nenne Alternativen.`;
      case "price":
        return `Die tagesaktuellen Preise stehen auf der jeweiligen Produktseite bei **${brand}**. Für welches Produkt${sample ? ` (z. B. ${sample})` : ""} interessieren Sie sich? Ich nenne Ihnen Varianten und Größen.`;
      case "product":
        return `Im Sortiment von **${brand}** finden Sie${offerings ? `, z. B.: ${offerings}` : " frische Lebensmittel und Spezialitäten"}. 🛒 Was suchen Sie genau – ich schlage passende Produkte vor.`;
      case "delivery_area":
        return `**${brand}** liefert in ${serviceRegionText}${city ? ` – auch nach **${city}** per Paketversand` : ""}. 🚚 ${policies ? `${policies}. ` : ""}Details zeigt der Warenkorb nach Eingabe Ihrer Postleitzahl.`;
      case "greeting":
        return `Hallo! 👋 Willkommen bei **${brand}** (${domain}). Ich helfe bei Produkten, Lieferung und Bestellung. Was möchten Sie wissen?`;
      default:
        return history ? `Verstanden. Dazu leite ich Ihre Frage gern an das **${brand}**-Team weiter – oder sagen Sie mir, ob es um Produkte, Lieferung oder Zahlung geht.` : `Willkommen bei **${brand}** in **${locationText}**! 🛒 Fragen Sie mich zu Produkten, Lieferung, Abholung oder Zahlung.`;
    }
  }

  if (lang === "en") {
    switch (intent) {
      case "delivery_speed":
        return city && cityFar
          ? `To **${city}**, **${brand}** ships by parcel carrier. 📦 You'll see the exact delivery time for your postcode in the cart. Next-day delivery mainly applies to our local area around ${locationText}. Want me to explain shipping costs?`
          : `At **${brand}**: order today, receive tomorrow within our local delivery area (${locationText}) via home delivery or store pickup. 🚚 For other regions the delivery time is shown in the cart.`;
      case "free_shipping":
        return `${freeShip ? `**${freeShip}**. ` : ""}Shipping costs for your address are shown transparently in the cart. 🚚 Want help filling your basket?`;
      case "pickup":
        return `Yes, **${brand}** offers in-store pickup (${locationText}). 🏪 Just choose “Pickup” at checkout.`;
      case "returns":
        return `For returns or complaints, our team at **${brand}** will help personally. Fresh food has limited return options for hygiene reasons; for damaged goods please contact us with a photo. Shall I forward your request?`;
      case "payment":
        return `Available payment methods at **${brand}** are shown at checkout. 💳 I can forward a question about a specific method to the team.`;
      case "hours":
        return `**${brand}**'s online shop is open 24/7. 🌙 Orders outside business hours are queued instantly and processed in the next delivery window.`;
      case "stock":
        return `Live availability is shown on each product page. Tell me which product${sample ? ` (e.g. ${sample})` : ""} you need and I'll check options and alternatives.`;
      case "price":
        return `Current prices are listed on each product page at **${brand}**. Which product${sample ? ` (e.g. ${sample})` : ""} are you interested in?`;
      case "product":
        return `**${brand}** offers${offerings ? `, for example: ${offerings}` : " fresh groceries and specialties"}. 🛒 What are you looking for?`;
      case "delivery_area":
        return `**${brand}** delivers across ${serviceRegionText}${city ? `, including **${city}** by parcel` : ""}. 🚚 ${policies ? `${policies}. ` : ""}The cart shows details once you enter your postcode.`;
      case "greeting":
        return `Hello! 👋 Welcome to **${brand}** (${domain}). I can help with products, delivery and orders. What would you like to know?`;
      default:
        return history ? `Got it. I'll pass this to the **${brand}** team – or tell me if it's about products, delivery or payment.` : `Welcome to **${brand}** in **${locationText}**! 🛒 Ask me about products, delivery, pickup or payment.`;
    }
  }

  switch (intent) {
    case "delivery_speed":
      return city && cityFar
        ? `**${city}** için **${brand}** paket kargo ile gönderim yapar. 📦 Posta kodunuza göre kesin teslimat süresini sepet adımında görürsünüz. “Ertesi gün teslim” esas olarak ${locationText} çevresindeki yerel teslimat bölgemiz için geçerlidir; ${city} için süre kargo firmasına bağlıdır. Kargo ücretini de açıklayayım mı?`
        : `**${brand}** için: bugün sipariş verin, yarın teslim alın – ${locationText} çevresindeki yerel bölgede adrese teslimat veya mağazadan teslim alma ile. 🚚 Diğer bölgelerde süre sepette gösterilir.`;
    case "free_shipping":
      return `${freeShip ? `**${freeShip}**. ` : ""}Adresinize özel kargo ücreti sepet adımında şeffaf biçimde gösterilir. 🚚 Sepetinizi birlikte oluşturalım mı?`;
    case "pickup":
      return `Evet, **${brand}** mağazadan teslim alma seçeneği sunar (${locationText}). 🏪 Ödeme adımında “Mağazadan teslim al” seçmeniz yeterli.`;
    case "returns":
      return `İade ve şikayetlerde **${brand}** ekibi size birebir yardımcı olur. Taze gıdalarda hijyen nedeniyle iade sınırlıdır; hasarlı üründe lütfen fotoğrafla bize ulaşın. Talebinizi ekibe ileteyim mi?`;
    case "payment":
      return `**${brand}** için geçerli ödeme yöntemleri ödeme adımında listelenir. 💳 Belirli bir yöntem soracaksanız talebinizi ekibe iletebilirim.`;
    case "hours":
      return `**${brand}** online mağazası 7/24 açıktır. 🌙 Mesai dışı siparişler anında kaydedilir ve bir sonraki teslimat penceresinde hazırlanır.`;
    case "stock":
      return `Stok durumu ürün sayfasında canlı gösterilir. Hangi ürünü arıyorsunuz${sample ? ` (örn. ${sample})` : ""}? Seçenekleri ve alternatifleri kontrol edeyim.`;
    case "price":
      return `Güncel fiyatlar **${brand}** ürün sayfalarında yer alır. Hangi ürünle ilgileniyorsunuz${sample ? ` (örn. ${sample})` : ""}? Boy ve çeşitlerini söyleyeyim.`;
    case "product":
      return `**${brand}** mağazasında${offerings ? ` örneğin: ${offerings}` : " taze gıda ve özel ürünler"} bulunur. 🛒 Tam olarak ne arıyorsunuz?`;
    case "delivery_area":
      return `**${brand}** ${serviceRegionText} için teslimat yapar${city ? `; **${city}** için paket kargo ile` : ""}. 🚚 ${policies ? `${policies}. ` : ""}Posta kodunuzu girince sepet detayları gösterir.`;
    case "greeting":
      return `Merhaba! 👋 **${brand}** (${domain}) mağazasına hoş geldiniz. Ürünler, teslimat ve sipariş konusunda yardımcı olabilirim. Ne öğrenmek istersiniz?`;
    default:
      return history ? `Anladım. Bunu **${brand}** ekibine iletebilirim; ürün, teslimat veya ödeme konusunda mı bilgi istiyorsunuz?` : `**${brand}** (${locationText}) mağazasına hoş geldiniz! 🛒 Ürün, teslimat, mağazadan teslim alma veya ödeme hakkında sorabilirsiniz.`;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      domain = "",
      brandName = "Şirketiniz",
      detectedIndustry = "B2B",
      pageTitle = "",
      metaDescription = "",
      headings = [],
      sampleOfferings = [],
      categories = [],
      keyPolicies = [],
      locationInfo = null,
      businessType = "service",
      isEcommerce = false,
      message = "",
      language = "tr",
      history = [],
    } = body;

    const historyText = Array.isArray(history)
      ? history
          .slice(-6)
          .map((h: { role?: string; content?: string }) => `${h.role === "user" ? "Kunde" : "Agent"}: ${String(h.content || "").slice(0, 400)}`)
          .join("\n")
      : "";

    const lang = (language || "tr").toLowerCase();
    const isDe = lang === "de";
    const isEn = lang === "en";

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const autoIsEcommerce =
      Boolean(isEcommerce) ||
      businessType === "ecommerce" ||
      /e-commerce|e-ticaret|supermarkt|supermarket|lebensmittel|grocery|perakende|retail|store|shop/i.test(
        detectedIndustry
      );

    const headingsText = Array.isArray(headings) && headings.length > 0 ? headings.join(" | ") : pageTitle;
    const offeringsText =
      Array.isArray(sampleOfferings) && sampleOfferings.length > 0 ? sampleOfferings.join(", ") : "";
    const categoriesText =
      Array.isArray(categories) && categories.length > 0 ? categories.join(", ") : "";
    const policiesText =
      Array.isArray(keyPolicies) && keyPolicies.length > 0 ? keyPolicies.join(" • ") : "";

    // Determine verified location details
    let locCountry = locationInfo?.countryName;
    let locCity = locationInfo?.cityName;
    let locCurrency = locationInfo?.currency || "EUR (€)";
    let locRegion = locationInfo?.serviceRegion;

    if (!locCountry) {
      const tld = domain.split(".").pop() || "";
      if (tld === "de") {
        locCountry = isDe ? "Deutschland" : isEn ? "Germany" : "Almanya";
        locCurrency = "EUR (€)";
      } else if (tld === "tr" || domain.endsWith(".tr")) {
        locCountry = isDe ? "Türkei" : isEn ? "Turkey" : "Türkiye";
        locCurrency = "TRY (₺)";
      } else {
        locCountry = isDe ? "Deutschland" : isEn ? "Germany" : "Almanya";
      }
    }

    const locationText = `${locCountry}${locCity ? ` (${locCity})` : ""}`;
    const serviceRegionText = locRegion || (isDe ? `${locCountry}weit & regional` : isEn ? `${locCountry}-wide & regional` : `${locCountry} geneli ve bölgesel teslimat`);

    let systemPrompt: string;

    if (autoIsEcommerce) {
      systemPrompt = isDe
        ? `Du bist der offizielle 24/7 KI-Einkaufsberater für "${brandName}" (${domain}).
VERIFIZIERTE UNTERNEHMENSDATEN:
- Branche / Modell: ${detectedIndustry} (Online-Supermarkt & Lieferservice)
- Standort: ${locationText}
- Währung: ${locCurrency}
- Liefergebiet: ${serviceRegionText}
${categoriesText ? `- Sortimente / Kategorien: ${categoriesText}` : ""}
${offeringsText ? `- Erkannte Produkte / Highlights: ${offeringsText}` : ""}
${policiesText ? `- Wichtige Konditionen: ${policiesText}` : ""}

STRIKTE QUALITÄTS- & WAHRHEITSRICHTLINIEN (A-QUALITÄT):
1. STANDORT-TREUE: Das Unternehmen hat seinen Sitz in ${locationText}. Behaupte NIEMALS, dass es sich in einem anderen Land befindet.
2. KEINE TECHNISCHEN HALLUZINATIONEN: Dies ist ein Online-Supermarkt / E-Commerce-Shop für Lebensmittel und Waren. Erfinde KEINE „technische Software“, „IT-Entwicklung“ oder „technischen Support“.
3. VERTRAUENSWÜRDIGE ANTWORTEN: Beantworte Kundenfragen zu echten Produkten (${offeringsText || "Lebensmitteln & Spezialitäten"}), Lieferzeiten (${policiesText || "schnelle Auslieferung & Paketversand"}) und 24/7 Online-Bestellungen freundlich und präzise.
4. Halte die Antwort prägnant (2 bis 4 Sätze), warmherzig und auf Deutsch.`
        : isEn
        ? `You are the official 24/7 AI Shopping Assistant for "${brandName}" (${domain}).
VERIFIED BUSINESS PROFILE:
- Industry / Model: ${detectedIndustry} (Online Supermarket & Delivery)
- Location: ${locationText}
- Currency: ${locCurrency}
- Service Area: ${serviceRegionText}
${categoriesText ? `- Categories: ${categoriesText}` : ""}
${offeringsText ? `- Products / Highlights: ${offeringsText}` : ""}
${policiesText ? `- Key Policies: ${policiesText}` : ""}

STRICT QUALITY & FACTUAL TRUTH RULES:
1. ACCURATE LOCATION: The business is based in ${locationText}. Never claim it is based elsewhere.
2. NO TECH HALLUCINATIONS: This is an online supermarket/retailer. Never claim to provide "expert technical software" or IT support.
3. CREDIBLE & HELPFUL: Ground answers in real store items (${offeringsText || "groceries and specialties"}) and shipping terms (${policiesText || "fast delivery windows"}).
4. Keep the response concise (2 to 4 sentences), trustworthy, and in English.`
        : `Sen "${brandName}" (${domain}) web sitesinin resmi 7/24 Yapay Zeka Alışveriş ve Satış Danışmanısın.

FİRMA HAKKINDA DOĞRULANMIŞ GERÇEK BİLGİLER:
- Sektör / İş Modeli: ${detectedIndustry} (Online Süpermarket / E-Ticaret ve Teslimat Servisi)
- Firmanın Gerçek Lokasyonu: ${locationText} (Merkez)
- Para Birimi: ${locCurrency}
- Hizmet / Teslimat Bölgesi: ${serviceRegionText}
${categoriesText ? `- Mağaza Kategorileri: ${categoriesText}` : ""}
${offeringsText ? `- Sitede Tespit Edilen Gerçek Ürünler: ${offeringsText}` : ""}
${policiesText ? `- Teslimat ve Sipariş Koşulları: ${policiesText}` : ""}

A-KALİTE GÜVENİLİRLİK VE DOĞRULUK İLKELERİ (ÇOK ÖNEMLİ):
1. GERÇEK LOKASYON: Müşteri seninle Türkçe konuşsa bile, firmanın nerede olduğunu KESİNLİKLE doğru söyle! Firma ${locCountry}'dadır (${locationText}). ASLA "Türkiye'nin e-ticaret mağazasıyız" DEME! Firmanın ${locationText} merkezli olduğunu ve ${serviceRegionText} için hizmet/ürün sunduğunu belirt.
2. ASLA HAYALİ BİLGİ UYDURMA: Süpermarket için "teknik yazılım", "yazılım geliştirme", "teknik destek" veya B2B randevu gibi asılsız iddialarda KESİNLİKLE bulunma.
3. SOMUT VE NET BİLGİ: Cevaplarında sitedeki gerçek ürünlere (${offeringsText || "taze gıda, helva, bal, zeytin, kahvaltılık ve temel ihtiyaç ürünleri"}), teslimat koşullarına (${policiesText || "hızlı teslimat ve paket kargo"}) yer vererek müşteriye tam güven aşıla.
4. CEVAP UZUNLUĞU: 2 ila 4 net, ikna edici ve güven veren cümle ile Türkçe yanıt ver.`;
    } else if (businessType === "education") {
      systemPrompt = isDe
        ? `Du bist der offizielle 24/7 KI-Bildungs- und Anmeldeberater für "${brandName}" (${domain}, ${locationText}).
VERIFIZIERTES INSTITUTSPROFIL:
- Bereich: Bildung, Weiterbildung & Sprachförderung (${detectedIndustry})
- Standort: ${locationText}
- Hauptangebote / Kurse: ${headingsText || "Integrationskurse, Sprachkurse, Nachhilfe & Prüfungsvorbereitung"}
${offeringsText ? `- Erkannte Lehrgänge / Fächer: ${offeringsText}` : ""}
${categoriesText ? `- Fachbereiche: ${categoriesText}` : ""}
${policiesText ? `- Fördermöglichkeiten / Infos: ${policiesText}` : ""}

STRIKTE QUALITÄTS- & WAHRHEITSRICHTLINIEN (A-QUALITÄT):
1. BILDUNGSFOKUS: Dies ist ein Bildungsinstitut / eine Akademie (z. B. Integrationskurse, Sprachkurse, Nachhilfe). Es handelt sich NICHT um einen Online-Shop oder B2B-Software. Sprich über Kurse, Anmeldungen, Fördermöglichkeiten (BAMF, Bildungsgutschein), Einstufungstests und Unterrichtszeiten.
2. STANDORT: Das Institut hat seinen Sitz in ${locationText}.
3. VERLÄSSLICHE ANTWORTEN: Beantworte Anfragen freundlich, kompetent und zeige, wie Anmelde- und Einstufungsanfragen auch nachts um 02:00 Uhr verlässlich erfasst werden.
4. Halte die Antwort prägnant (2 bis 4 Sätze), professionell und auf Deutsch.`
        : isEn
        ? `You are the official 24/7 AI Education & Admissions Advisor for "${brandName}" (${domain}, ${locationText}).
VERIFIED INSTITUTION PROFILE:
- Domain: Education, Tutoring & Language Training (${detectedIndustry})
- Location: ${locationText}
- Programs & Focus: ${headingsText || "Language courses, integration courses, exam prep"}
${offeringsText ? `- Courses / Subjects: ${offeringsText}` : ""}
${categoriesText ? `- Departments: ${categoriesText}` : ""}

STRICT RULES:
1. EDUCATION FOCUS: This is an educational academy/school, NOT an e-commerce shop or software company. Talk about courses, admissions, enrollment steps, vouchers/subsidies (BAMF), and placement test bookings.
2. Keep the answer concise (2-4 sentences), encouraging, and in English.`
        : `Sen "${brandName}" (${domain}, ${locationText}) eğitim kurumunun resmi 7/24 Yapay Zeka Eğitim & Kurs Kayıt Danışmanısın.
KURUM HAKKINDA DOĞRULANMIŞ BİLGİLER:
- Alan: Eğitim, Kurs & Akademi (${detectedIndustry})
- Lokasyon: ${locationText}
- Ana Programlar / Odak: ${headingsText || "Uyum kursları, dil eğitimi, sınav hazırlığı ve etüt"}
${offeringsText ? `- Tespit Edilen Kurslar / Alanlar: ${offeringsText}` : ""}
${categoriesText ? `- Branşlar: ${categoriesText}` : ""}

A-KALİTE KURALLAR:
1. EĞİTİM ODAĞI: Bu bir eğitim kurumudur; asla e-ticaret sepeti veya yazılım satışı yapmaz! Kurs kayıtları, seviye tespit sınavları, devlet teşvikleri (BAMF / destekler) ve ders programları hakkında konuş.
2. LOKASYON: Kurum ${locationText} merkezlidir.
3. 2-4 net, ikna edici ve sıcak cümle ile Türkçe yanıt ver.`;
    } else if (businessType === "health") {
      systemPrompt = isDe
        ? `Du bist der offizielle 24/7 KI-Praxisassistent für "${brandName}" (${domain}, ${locationText}).
VERIFIZIERTE PRAXISDATEN:
- Fachbereich: ${detectedIndustry}
- Standort: ${locationText}
- Schwerpunkte: ${headingsText || "Moderne Behandlungen & Patientenfürsorge"}
${offeringsText ? `- Behandlungen: ${offeringsText}` : ""}

STRIKTE RICHTLINIEN:
1. KEINE TIEFEN MEDIZINISCHEN DIAGNOSEN: Stelle keine Ferndiagnosen. Biete Patienten Orientierung über Behandlungsabläufe und organisiere Terminanfragen.
2. Antworte empathisch, seriös und prägnant (2 bis 4 Sätze) auf Deutsch.`
        : isEn
        ? `You are the official 24/7 AI Clinic Assistant for "${brandName}" (${domain}, ${locationText}).
VERIFIED CLINIC PROFILE:
- Specialty: ${detectedIndustry}
- Location: ${locationText}
- Treatments: ${headingsText || "Modern treatments & patient consultations"}
${offeringsText ? `- Services: ${offeringsText}` : ""}

STRICT RULES:
1. NO CLINICAL DIAGNOSES: Do not diagnose medical conditions. Guide patients on treatments and schedule consultation bookings.
2. Respond with empathy, professionalism, and conciseness (2 to 4 sentences).`
        : `Sen "${brandName}" (${domain}, ${locationText}) kliniğinin resmi 7/24 Hasta & Randevu Koordinatörüsün.
- Branş / Uzmanlık: ${detectedIndustry}
- Lokasyon: ${locationText}
- Tedavi ve Hizmetler: ${headingsText || "Klinik muayene ve danışmanlık"}
${offeringsText ? `- Tedavi Alanları: ${offeringsText}` : ""}

KURALLAR:
1. Tıbbi teşhis koyma; hastayı doğru branşa yönlendir, tedavi süreci hakkında genel bilgi ver ve ön muayene randevusu planla.
2. 2-4 nazik ve güven veren cümle ile Türkçe yanıt ver.`;
    } else if (businessType === "law") {
      systemPrompt = isDe
        ? `Du bist der diskrete 24/7 KI-Kanzleiassistent von "${brandName}" (${domain}, ${locationText}).
- Rechtsgebiete: ${headingsText || detectedIndustry}
- Standort: ${locationText}
Aufgabe: Nimm Mandantenanfragen vertraulich auf, erläutere den Ablauf der Erstberatung und buche Termine 24/7. Halte dich an 2 bis 4 prägnante, seriöse Sätze.`
        : isEn
        ? `You are the confidential 24/7 AI Legal Intake Assistant for "${brandName}" (${domain}, ${locationText}).
- Practice Areas: ${headingsText || detectedIndustry}
- Location: ${locationText}
Task: Receive client inquiries with strict confidentiality, explain initial consultation procedures, and schedule appointments 24/7. Keep it concise (2 to 4 sentences).`
        : `Sen "${brandName}" (${domain}, ${locationText}) hukuk bürosunun resmi 7/24 Ön İnceleme Asistanısın.
- Faaliyet Alanları: ${headingsText || detectedIndustry}
- Lokasyon: ${locationText}
Görevin: Müvekkil taleplerini gizlilik esasıyla karşıla, ön danışmanlık sürecini açıkla ve randevuyu 7/24 sisteme kaydet. 2-4 net ve hukuki ciddiyete uygun cümle ile yanıt ver.`;
    } else {
      systemPrompt = isDe
        ? `Du bist der autonome 24/7 KI-Vertriebsassistent von "${brandName}" (${domain}, ${locationText}), powered by StarWebFlow.
Branche: ${detectedIndustry}
Standort: ${locationText}
Leistungsbereich: ${serviceRegionText}
Website-Titel: ${pageTitle}
Hauptthemen: ${headingsText}
${offeringsText ? `Leistungen: ${offeringsText}` : ""}

Aufgabe:
Antworte dem Besucher als offizieller, hochkompetenter 24/7 KI-Berater auf ${domain}.
- Beziehe dich konkret auf "${brandName}", den echten Standort (${locationText}) und die echten Leistungen (${headingsText || detectedIndustry}).
- Zeige, wie Anfragen auch nachts um 02:00 Uhr sofort qualifiziert und verlässlich betreut werden.
- Antworte prägnant (2 bis 4 Sätze), seriös und auf Deutsch.`
        : isEn
        ? `You are the autonomous 24/7 AI Sales Agent for "${brandName}" (${domain}, ${locationText}), powered by StarWebFlow.
Industry: ${detectedIndustry}
Location: ${locationText}
Service Region: ${serviceRegionText}
Website Title: ${pageTitle}
Topics: ${headingsText}
${offeringsText ? `Offerings: ${offeringsText}` : ""}

Task:
Reply to the visitor as the official 24/7 AI Sales Representative on ${domain}.
- Specifically reference "${brandName}", its real location (${locationText}), and its actual services (${headingsText || detectedIndustry}).
- Demonstrate how inquiries at 2:00 AM are qualified with high reliability.
- Keep your response concise (2 to 4 sentences), professional, and in English.`
        : `Sen "${brandName}" (${domain}, ${locationText}) firmasının resmi 7/24 Yapay Zeka Temsilcisisin.
Sektör: ${detectedIndustry}
Lokasyon: ${locationText}
Hizmet Bölgesi: ${serviceRegionText}
Site Başlığı: ${pageTitle}
Ana Odak Alanları: ${headingsText}
${offeringsText ? `Hizmetler: ${offeringsText}` : ""}

Görevin:
Ziyaretçiye doğrudan ${brandName} firmasının resmi temsilcisi olarak yanıt ver.
- Firmanın gerçek lokasyonunu (${locationText}) ve gerçek uzmanlık alanlarını (${headingsText || detectedIndustry}) doğru kullan.
- Müşteriye tam güven ver; gece 02:00'de dahi talebini hızla karşıladığını hissettir.
- 2-4 net ve ikna edici cümle ile Türkçe yanıt ver.`;
    }

    const aiRes = await Promise.race([
      generateTextResilient({
      prompt: historyText ? "Bisheriger Verlauf:\n" + historyText + "\n\nNeue Kundenfrage: " + message + "\n(Beantworte genau diese Frage, wiederhole keine früheren Antworten.)" : message,
      system: systemPrompt,
      temperature: 0.35,
      maxTokens: 260,
      preferredModel: "agent",
      }),
      new Promise<{ text: string; providerUsed: string }>((resolve) =>
        setTimeout(() => resolve({ text: "", providerUsed: "fallback" }), 6000)
      ),
    ]);

    if (aiRes.providerUsed !== "fallback" && aiRes.text) {
      return NextResponse.json({
        success: true,
        reply: aiRes.text,
        provider: aiRes.providerUsed,
      });
    }

    // Contextual Smart Fallback if LLM is unreachable
    const msgLower = message.toLowerCase();
    let smartReply = "";

    if (autoIsEcommerce) {
      smartReply = ecomFallbackReply({
        msg: message,
        lang: isDe ? "de" : isEn ? "en" : "tr",
        brand: brandName,
        domain,
        locationText,
        serviceRegionText,
        offerings: offeringsText,
        policies: policiesText,
        history: historyText,
      });
    } else if (false as boolean) {
      if (isDe) {
        if (/hizmet|leistung|sortiment|was bietet|produkte|über uns|ne sat/i.test(msgLower)) {
          smartReply = `Willkommen bei **${brandName}** (${domain})! Wir sind Ihr Online-Supermarkt mit Sitz in **${locationText}** für frische Lebensmittel, Spezialitäten${offeringsText ? ` (u.a. ${offeringsText})` : ""} und bequeme Haushaltslieferung. 🛒 ${policiesText ? `${policiesText}. ` : ""}Sie können jederzeit rund um die Uhr bei uns bestellen. Was darf es für Sie sein?`;
        } else if (/liefer|versand|region|wohin|dauer|paket|postleitzahl/i.test(msgLower)) {
          smartReply = `Bei **${brandName}** liefern wir Ihre Bestellung schnell und zuverlässig direkt nach Hause! 🚚 Für ${serviceRegionText} bieten wir direkte Zustellung und deutschlandweiten Paketversand. ${policiesText ? `${policiesText}. ` : ""}Die Lieferoptionen für Ihre Postleitzahl werden direkt im Bestellprozess berechnet.`;
        } else if (/02:00|nacht|uhr|wann|offen/i.test(msgLower)) {
          smartReply = `Auch um 02:00 Uhr nachts können Sie bei **${brandName}** ganz bequem online einkaufen! 🌙 Unser Online-Shop ist 24/7 geöffnet. Ihre Bestellung wird automatisch erfasst und am nächsten Werktag frisch für Sie gepackt und ausgeliefert. Viel Spaß beim Stöbern!`;
        } else {
          smartReply = `Willkommen im Online-Shop von **${brandName}** in **${locationText}**! 🛒 Wir bieten Ihnen eine hochwertige Auswahl an Frische-Sortimenten${offeringsText ? ` (${offeringsText})` : ""}. ${policiesText ? `${policiesText}. ` : ""}Wie kann ich Ihnen bei Ihrem Einkauf behilflich sein?`;
        }
      } else if (isEn) {
        if (/service|products|what do you offer|about/i.test(msgLower)) {
          smartReply = `Welcome to **${brandName}** (${domain})! Based in **${locationText}**, we are an online supermarket and delivery service offering fresh groceries and specialties${offeringsText ? ` (including ${offeringsText})` : ""}. 🛒 ${policiesText ? `${policiesText}. ` : ""}You can shop online 24/7. What can I help you find today?`;
        } else if (/deliver|ship|region|area|window|carrier|postcode/i.test(msgLower)) {
          smartReply = `At **${brandName}**, we deliver your orders quickly and reliably! 🚚 We serve ${serviceRegionText}. ${policiesText ? `${policiesText}. ` : ""}Shipping details and rates are calculated seamlessly during checkout. Looking for a specific product?`;
        } else if (/2:00|night|urgent|hours|open/i.test(msgLower)) {
          smartReply = `You can place your order anytime at **${brandName}**, even at 2:00 AM! 🌙 Our online store is open 24/7. Your order is queued immediately and freshly packed for dispatch during the next delivery window. Happy shopping!`;
        } else {
          smartReply = `Welcome to **${brandName}** in **${locationText}**! 🛒 We offer a curated selection in **${detectedIndustry}**${offeringsText ? ` (${offeringsText})` : ""}. ${policiesText ? `${policiesText}. ` : ""}How can I assist you today?`;
        }
      } else {
        if (/hizmet|süreç|neler var|ne sat|ürün|nasıl/i.test(msgLower)) {
          smartReply = `**${brandName}**, **${locationText}** merkezli olarak ${serviceRegionText} için taze gıda, helva, bal, zeytin ve zengin market çeşitlerini kapınıza ulaştıran güvenilir bir online süpermarkettir! 🛒 Sitemiz üzerinden dilediğiniz ürünleri 7/24 sepetinize ekleyip sipariş verebilirsiniz. ${policiesText ? `${policiesText}. ` : ""}Hangi ürün veya kategoriyi aramıştınız?`;
        } else if (/02:00|gece|saat|şimdi|randevu|teklif/i.test(msgLower)) {
          smartReply = `Gece saat 02:00'de bile **${brandName}** online mağazamızdan 7/24 dilediğiniz gibi sipariş verebilirsiniz! 🌙 Online süpermarketimiz günün her saati aktiftir; siparişiniz sabah ilk iş saatlerinde özenle hazırlanıp en hızlı teslimat penceresinde adresinize sevk edilir. Keyifli alışverişler dileriz!`;
        } else if (/teslim|kargo|bölge|nere|nasıl gelir|adres|paket/i.test(msgLower)) {
          smartReply = `**${brandName}** olarak siparişlerinizi adresinize güvenle ulaştırıyoruz! 🚚 ${serviceRegionText} için düzenli dağıtım yapıyoruz. ${policiesText ? `${policiesText}. ` : ""}Sepet adımında adresinize en uygun teslimat seçeneğini anında görüntüleyebilirsiniz.`;
        } else {
          smartReply = `**${brandName}** (${domain}) online mağazasına hoş geldiniz! 🛒 **${locationText}** merkezli süpermarketimizden ${offeringsText ? `${offeringsText} başta olmak üzere ` : ""}taze ve kaliteli ürünleri 7/24 sipariş verebilirsiniz. ${policiesText ? `${policiesText}. ` : ""}Size nasıl yardımcı olabilirim?`;
        }
      }
    } else if (businessType === "education") {
      if (isDe) {
        if (/bamf|förder|gutschein|kost|kosten|gebühr|preis/i.test(msgLower)) {
          smartReply = `Für viele Bildungsangebote bei **${brandName}** (insbesondere Integrationskurse und zertifizierte Sprachkurse) bestehen staatliche Fördermöglichkeiten (z. B. Kostenbefreiung über das BAMF oder Bildungsgutschein). 📋 Ich erfasse gerne Ihre Angaben, damit unsere Berater die Fördervoraussetzungen direkt prüfen können. Welche Kurse interessieren Sie?`;
        } else if (/02:00|nacht|termin|einstufung|anmeld/i.test(msgLower)) {
          smartReply = `Auch um 02:00 Uhr nachts können Sie bei **${brandName}** (${locationText}) ganz unverbindlich einen Einstufungstest oder einen Beratungstermin anfragen! 🌙 Ihre Anfrage wird sofort in unser System übernommen und am nächsten Werktag priorisiert von unserem Bildungsteam bearbeitet.`;
        } else {
          smartReply = `Willkommen bei **${brandName}** (${domain}, ${locationText})! 🎓 Wir bieten qualifizierte Weiterbildungen und Kurse${headingsText ? ` im Bereich ${headingsText}` : ""}. Ich beantworte Fragen zu Kursinhalten, Zeiten und Einstufungstests rund um die Uhr. Wie kann ich Ihnen weiterhelfen?`;
        }
      } else if (isEn) {
        if (/funding|subsidy|bamf|voucher|fee|cost|price/i.test(msgLower)) {
          smartReply = `Many programs at **${brandName}** (such as Integration and Language courses) are eligible for official funding and subsidies (e.g. BAMF grants). 📋 I can record your interest right now so our admissions team can check your eligibility first thing in the morning!`;
        } else if (/2:00|night|placement|test|enroll|appointment/i.test(msgLower)) {
          smartReply = `You can submit your enrollment inquiry or placement test request anytime at **${brandName}**, even at 2:00 AM! 🌙 Your request is logged immediately and our advisors will confirm your slot during the next business hours.`;
        } else {
          smartReply = `Welcome to **${brandName}** (${domain}, ${locationText})! 🎓 We specialize in ${headingsText || detectedIndustry}. Feel free to ask about our course schedule, enrollment deadlines, or placement assessments!`;
        }
      } else {
        if (/bamf|teşvik|destek|devlet|ücret|burs|fiyat|maliyet/i.test(msgLower)) {
          smartReply = `**${brandName}** bünyesindeki programlarda (özellikle Uyum Kursları / Integrationskurse) BAMF ve resmi destek imkanları bulunmaktadır! 📋 Uygunluk durumunuzu değerlendirmek ve kayıt evraklarınızı hazırlamak için bilgilerinizi hemen sisteme kaydedebilirim. Hangi kurs ile ilgileniyorsunuz?`;
        } else if (/02:00|gece|saat|randevu|seviye|test|kayıt/i.test(msgLower)) {
          smartReply = `Gece saat 02:00'de dahi **${brandName}** (${locationText}) için seviye tespit testi veya ön kayıt başvurusu yapabilirsiniz! 🌙 Talebiniz anında kayıt koordinatörlerimize iletilir ve sabah mesaisinde öncelikli olarak aranıp randevunuz kesinleştirilir.`;
        } else {
          smartReply = `**${brandName}** (${locationText}) eğitim ve kurs merkezine hoş geldiniz! 🎓 ${headingsText ? `${headingsText} odağımız başta olmak üzere ` : ""}nitelikli eğitim çözümleri sunuyoruz. Kurs başlangıç tarihleri ve kayıt şartları hakkında dilediğinizi sorabilirsiniz!`;
        }
      }
    } else if (businessType === "health") {
      if (isDe) {
        if (/termin|behandlung|arzt|kosten|02:00/i.test(msgLower)) {
          smartReply = `Willkommen bei **${brandName}** in **${locationText}**! 🏥 Als 24/7 Praxisassistent nehme ich Ihre Terminanfrage für ${headingsText || "unsere Behandlungen"} rund um die Uhr entgegen und leite sie direkt an das Praxisteam weiter. Dürfen wir Ihre Rufnummer für die Terminbestätigung notieren?`;
        } else {
          smartReply = `Guten Tag bei **${brandName}**! Wir begleiten Patienten mit moderner Medizin und persönlicher Fürsorge (${headingsText || detectedIndustry}). Wie können wir Ihnen bei Ihrem Anliegen weiterhelfen?`;
        }
      } else {
        if (/randevu|tedavi|muayene|02:00|doktor/i.test(msgLower)) {
          smartReply = `**${brandName}** (${locationText}) sağlık merkezimize hoş geldiniz! 🏥 ${headingsText || "Tedavi ve branşlarımız"} için 7/24 muayene ön randevusu oluşturabilirim. Ön değerlendirme için iletişim bilgilerinizi iletir misiniz?`;
        } else {
          smartReply = `**${brandName}** (${domain}, ${locationText}) kliniğine hoş geldiniz! Sağlık ve tedavi süreçlerinizde 7/24 rehberlik sunuyoruz. Hangi branş veya tedavi hakkında bilgi almak istemiştiniz?`;
        }
      }
    } else if (businessType === "law") {
      if (isDe) {
        smartReply = `Willkommen bei der Kanzlei **${brandName}** (${locationText})! ⚖️ Ich erfasse Ihr rechtliches Anliegen im Bereich ${headingsText || "Rechtsberatung"} vertraulich und reserviere Ihnen einen Termin für eine Erstberatung. Worum geht es bei Ihrem Anliegen?`;
      } else {
        smartReply = `**${brandName}** (${locationText}) hukuk bürosuna hoş geldiniz! ⚖️ ${headingsText || "Hukuki danışmanlık"} alanındaki talebinizi tam gizlilik esaslarına uygun şekilde kayıt altına alabilir ve avukatlarımızla ilk görüşme randevunuzu planlayabilirim.`;
      }
    } else {
      // B2B / Services fallback
      if (isDe) {
        if (/preis|angebot|kosten|02:00|termin/.test(msgLower)) {
          smartReply = `Als 24/7 KI-Assistent von **${brandName}** (${locationText}) bin ich auch um 02:00 Uhr nachts sofort für Sie da! Für Ihren Bedarf im Bereich **${detectedIndustry}** erstelle ich Ihnen sofort eine Ersteinschätzung und buche Ihren Wunschtermin direkt in unser CRM. Darf ich kurz Ihre E-Mail-Adresse für das Angebot notieren?`;
        } else {
          smartReply = `Willkommen bei **${brandName}** (${domain}) in **${locationText}**! Wir sind spezialisiert auf **${detectedIndustry}**. Ich beantworte Ihre Fragen rund um die Uhr in Echtzeit und verbinde Sie gerne direkt mit unserem Fachteam. Wonach suchen Sie genau?`;
        }
      } else if (isEn) {
        if (/price|quote|cost|2:00|book|appointment|urgent/.test(msgLower)) {
          smartReply = `As **${brandName}**'s 24/7 AI Sales Agent (${locationText}), I'm active even at 2:00 AM! Based on your interest in our **${detectedIndustry}** solutions, I can qualify your requirements right now and lock in a priority consultation slot. What is the best email to send your custom quote?`;
        } else {
          smartReply = `Welcome to **${brandName}** (${domain}) in **${locationText}**! We specialize in **${detectedIndustry}**. Tell me a bit about your goals, and I'll instantly match you with the right solutions!`;
        }
      } else {
        if (/fiyat|teklif|ücret|02:00|randevu|acil/.test(msgLower)) {
          smartReply = `**${brandName}** (${locationText}) 7/24 Otonom AI Temsilcisi olarak gece saat 02:00'de bile hattayım! ⚡ **${detectedIndustry}** çözümlerimiz için talebinizi hemen CRM sistemimize öncelikli olarak işliyorum. Size özel teklifimizi iletmem için e-posta adresinizi veya telefon numaranızı paylaşır mısınız?`;
        } else {
          smartReply = `**${brandName}** (${domain}, ${locationText}) dijital asistanına hoş geldiniz! 👋 **${detectedIndustry}** alanında müşterilerimize uçtan uca kurumsal hizmet sunuyoruz. İhtiyacınızı kısaca paylaşırsanız size en uygun çözümü hemen belirleyebilirim!`;
        }
      }
    }

    return NextResponse.json({
      success: true,
      reply: smartReply,
      provider: "contextual-engine",
    });
  } catch (error) {
    console.error("Simulate Agent Error:", error);
    return NextResponse.json(
      { error: "AI simülasyonu sırasında hata oluştu." },
      { status: 500 }
    );
  }
}
