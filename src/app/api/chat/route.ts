import { getAgentModel, getGoogleProvider, getGoogleApiKey, getOllamaBaseUrl, isOllamaPrimary, resolveBestAvailableModel } from '@/lib/ai/gemini-client';
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

// ─── Canlı Dayanıklı Yanıt Motoru (Sadece Model Çevrimdışı İse Devreye Girer) ──
function streamFallbackResponse(lastUserMsg: string, langKey: 'tr' | 'de' | 'en'): Response {
  const fallbackText =
    langKey === 'de'
      ? 'Unser lokales KI-Modell analysiert Ihre Anfrage. Um eine maßgeschneiderte Lösung für Ihre spezifische Branche und Ihre Geschäftsprozesse zu planen, vereinbaren Sie gerne eine 15-minütige kostenlose Architekturberatung unter /randevu.'
      : langKey === 'en'
      ? 'Our local AI model is processing your request. To architect a tailored autonomous system for your specific industry requirements, please schedule a complimentary 15-minute review at /randevu.'
      : 'Yapay zeka modelimiz sorunuzu analiz ediyor. Belirttiğiniz sektöre özel süreç otomasyonları, yerel AI ajanları ve sub-second web sistemlerini planlamak üzere /randevu sayfamızdan 15 dakikalık ücretsiz mimari değerlendirme görüşmesi alabilirsiniz.';

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

    // ─── CANLI AI MODELİ DEVREDE ───────────────────────────────────────────────
    // Kullanıcının sorusunu doğrudan gerçek Ollama modeline yönlendiriyoruz.
    // Model, Starwebflow kurumsal bilgi tabanını ve soruya özel sektörel bağlamı
    // kullanarak canlı, özgün ve yüksek ikna kabiliyetli yanıt üretir.
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
      systemPrompt = `Du bist Starwebflow Senior AI & System Architect.
UNTERNEHMENSPROFIL & DIENSTLEISTUNGEN:
1. Souveräne KI-Agenten (Ollama auf Frankfurt Tier-4 VPS, 0 Token-Gebühren, 100% DSGVO-konform, WhatsApp- & Telefon-Bots).
2. n8n & API-Workflows (Lead-Qualifizierung in 3 Sek., automatische PDF-Angebote/Rechnungen, Kalender-Synchronisation).
3. Next.js 14 Web- & B2B-Portale (LCP <0,8 Sek., 100/100 Core Web Vitals, 3,6-fache Conversion).
4. Performance & Growth Marketing (Google/Meta CAPI Server-Side Tracking, Conversion-optimierte Landingpages).
5. Branchen-Expertise: Bau (Baustellen-Sprachberichte, Aufmaß-Angebote), Gesundheit (Termin-Triad, DSGVO Art. 9), Logistik (OCR CMR-Belege), Immobilien (WhatsApp-Exposé), B2B-Großhandel.

REGELN:
- Antworte direkt, überzeugend, professionell und branchenspezifisch auf Deutsch.
- Begründe den ROI (21x höhere Conversion in den ersten 5 Min., 24/7 Nacht-Umsatz, 15+ Stunden Zeitersparnis).
- Halte die Antwort prägnant (3-5 Sätze).
- Lade am Ende immer zu einem kostenlosen 15-Minuten-Architekturgespräch unter /randevu ein.${auditMemoryBlock}${ragResult.formattedContext ? `\n[WISSENSBASIS]:\n${ragResult.formattedContext}` : ''}`;
    } else if (langKey === 'en') {
      systemPrompt = `You are Starwebflow Senior Enterprise & AI Architect.
COMPANY PROFILE & CORE CAPABILITIES:
1. Sovereign AI Agents (Ollama on dedicated Tier-4 private VPS in Frankfurt/TR, zero token fees, 100% GDPR/KVKK compliant).
2. n8n & API Automations (Instant lead qualification, automated PDF quotes/invoices, two-way calendar autopilot).
3. Next.js 14 Sub-Second Web (LCP <0.8s, 100/100 Core Web Vitals, 3.6x conversion rate).
4. Full-Funnel Growth & Ads (Meta/Google Server-Side CAPI, high-converting sub-second landing pages).
5. Verticals: Construction (jobsite voice logs, automated quotes), Healthcare (triage, GDPR Art. 9), Logistics (CMR OCR), Real Estate (WhatsApp floorplans), B2B Wholesale.

RULES:
- Answer authoritatively, convincingly and tailored specifically to the user's domain in English.
- Highlight concrete ROI (21x conversion boost within 5 mins, zero night leaks, 15+ hrs saved weekly).
- Keep length to 3-5 crisp, impactful sentences.
- Always close with an invitation to book a complimentary 15-minute architecture call at /randevu.${auditMemoryBlock}${ragResult.formattedContext ? `\n[KNOWLEDGE BASE]:\n${ragResult.formattedContext}` : ''}`;
    } else {
      systemPrompt = `Sen Starwebflow'un Kıdemli Sistem & Kurumsal AI Danışmanısın.
ŞİRKETİMİZ & HİZMETLERİMİZ:
1. Sovereign AI Ajanları: Müşteri verilerini bulutlara sızdırmayan, kendi dedike sunucunda (Frankfurt/TR Tier-4 VPS) çalışan açık kaynaklı yerel modeller (Ollama altyapısı, sıfır token faturası, %100 KVKK & DSGVO uyumlu). Web chat, sesli WhatsApp ve telefon santrali.
2. n8n Süreç Otomasyonları: Gelen talepleri 3 saniyede CRM'e işleme, 10 saniyede otomatik PDF şartname/teklif üretimi, çift yönlü Google/Outlook randevu otopilotu.
3. Sub-Second Next.js 14 Web & Portallar: 0.8s altı anında açılış (LCP), sıfır bekleme, Google Core Web Vitals 100/100, şifreli B2B bayi/müşteri portalları.
4. Reklam & Dijital Büyüme (Growth): 0.8s açılan reklam sayfaları, reklamdan gelen tıklamayı 15 saniyede randevuya çeviren AI ajanları, sunucu taraflı (CAPI) dönüşüm izleme.
5. Sektörel Çözümler:
   • İnşaat & Mimarlık: Şantiyeden WhatsApp ile sesli raporlama, 10 saniyede keşif/hakediş PDF teklifi, konut/arsa alıcılarına anında kat planı sunumu.
   • Sağlık & Klinik: 7/24 çok dilli randevu triyajı, no-show önleyici hatırlatma, %100 sağlık verisi izolasyonu.
   • Lojistik: Yapay zeka ile CMR & navlun faturası okuma (OCR), canlı WhatsApp kargo takibi.
   • Gayrimenkul: Gece gelen alıcıları 30 saniyede nitelendirme, WhatsApp'tan portföy/katalog iletimi.
   • B2B & Toptan: Şifreli bayi sipariş portalları, SAP/Logo/Mikro ERP entegrasyonu.

YANIT KURALLARI:
- Kullanıcının sorusuna doğrudan, samimi, son derece ikna edici ve sorulan sektöre/ihtiyaca özel derinlikle Türkçe yanıt ver.
- Asla "Starwebflow olarak..." diye başlayan tekdüze robotik cümleler kurma.
- Müşteriye somut yatırım getirisini (ROI) göster: İlk 5 dakikada ulaşılan lead'in satışa dönme oranı 21 kat yüksektir; gece gelen müşterileri kaçırmaz; ekibinizin haftalık 15-20 saatini kurtarır.
- Yanıtını 3 ila 5 zengin, vurucu cümlede tamamla.
- Yanıtının en sonunda mutlaka /randevu sayfamızdan 15 dakikalık ücretsiz mimari değerlendirme görüşmesi planlamaya davet et.${auditMemoryBlock}${ragResult.formattedContext ? `\n[ŞİRKET BİLGİ HAVUZU]:\n${ragResult.formattedContext}` : ''}`;
    }

    // 1. Step: Try Primary Ollama Model with fast token race (first token must arrive in 3.5s or switch seamlessly to curated fallback)
    if (isOllamaPrimary()) {
      const ollamaBaseUrl = getOllamaBaseUrl();
      const isOnline = await isOllamaReachable(ollamaBaseUrl);

      if (isOnline) {
        try {
          const selectedModelName = await resolveBestAvailableModel();
          const primaryModel = getAgentModel(selectedModelName);
          const trimmedMessages = Array.isArray(messages) ? messages.slice(-4) : messages;

          const result = streamText({
            model: primaryModel,
            system: systemPrompt,
            messages: trimmedMessages,
            maxTokens: 350,
            temperature: 0.6,
            frequencyPenalty: 0.4,
            presencePenalty: 0.2,
          });

          const encoder = new TextEncoder();
          const fallbackText =
            langKey === 'de'
              ? 'Unser lokales KI-Modell analysiert Ihre Anfrage. Für eine maßgeschneiderte Lösung vereinbaren Sie gerne eine 15-minütige kostenlose Architekturberatung unter /randevu.'
              : langKey === 'en'
              ? 'Our local AI model is processing your request. To architect a tailored solution, please schedule a complimentary 15-minute review at /randevu.'
              : 'Yapay zeka modelimiz sorunuzu değerlendiriyor. Belirttiğiniz sektöre özel süreç otomasyonları ve yerel AI ajanlarını planlamak üzere /randevu sayfamızdan 15 dakikalık ücretsiz mimari görüşme planlayabilirsiniz.';

          const stream = new ReadableStream({
            async start(controller) {
              try {
                const iterator = result.textStream[Symbol.asyncIterator]();
                const firstChunkPromise = iterator.next();
                const timeoutPromise = new Promise<{ done: boolean; value?: string }>((resolve) =>
                  setTimeout(() => resolve({ done: true, value: undefined }), 15000)
                );

                const winner = await Promise.race([firstChunkPromise, timeoutPromise]);

                if (winner.done || !winner.value) {
                  // Ollama took longer than 15s to evaluate prompt on CPU; stream the instant executive answer immediately
                  const words = fallbackText.split(' ');
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
                  return;
                }

                // Ollama produced first token in time! Stream the full response
                controller.enqueue(encoder.encode(formatDataStreamPart('text', winner.value)));
                for await (const chunk of result.textStream) {
                  controller.enqueue(encoder.encode(formatDataStreamPart('text', chunk)));
                }
                controller.enqueue(
                  encoder.encode(
                    formatDataStreamPart('finish_message', {
                      finishReason: 'stop',
                      usage: { promptTokens: 60, completionTokens: 60 },
                    })
                  )
                );
                controller.close();
              } catch {
                // If stream iteration ever throws or drops, stream fallback gracefully
                const words = fallbackText.split(' ');
                for (let i = 0; i < words.length; i += 3) {
                  const chunk = words.slice(i, i + 3).join(' ') + (i + 3 < words.length ? ' ' : '');
                  controller.enqueue(encoder.encode(formatDataStreamPart('text', chunk)));
                }
                controller.close();
              }
            },
          });

          return new Response(stream, {
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'X-Vercel-AI-Data-Stream': 'v1',
            },
          });
        } catch (ollamaErr: any) {
          console.warn(`[Chat API] Ollama akış hatası (${ollamaErr?.message}). Dayanıklı anlık akışa geçiliyor...`);
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
