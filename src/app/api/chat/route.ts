import { getAgentModel, parseHybridToolCalls } from '@/lib/ai/gemini-client';
import { retrieveStarWebFlowRagContext } from '@/lib/ai/rag-engine';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const maxDuration = 60;

export async function POST(req: Request) {
  const {
    messages,
    tenantId = 'default-tenant',
    activeSection = 'hero',
    timeOnPage = 0,
    language = 'de',
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

  const langKey = language === 'de' || language === 'en' || language === 'tr' ? language : 'de';

  const lastUserMsg =
    Array.isArray(messages) && messages.length > 0
      ? String(messages[messages.length - 1]?.content || '')
      : '';

  const ragResult = await retrieveStarWebFlowRagContext(lastUserMsg, 3);

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
    systemPrompt = `Sie sind der offizielle KI-Architektur- & Effizienz-Agent dieser Website (StarWebFlow).
Wir bauen nicht nur Websites, sondern Effizienz-Maschinen: Traditionelle Agenturen verkaufen Dienstleistungen – wir liefern operative Leistung und ROI.

[UNSERE 5 KERNBEREICHE (Aus unserer Website-Architektur)]
1. Modell-Agnostische Hybrid-KI & Voice-Agenten (/hizmetler/ai-agents): Ohne Vendor Lock-in (Claude, Llama, DeepSeek, GPT), Cloud oder On-Premise (volle Datensouveränität & DSGVO/KVKK). Voice-KI-Telefonzentrale, Live-Chat, WhatsApp & E-Mail/Webhook. 24/7 aktiv, 60%+ operative Einsparung.
2. Kognitive Workflows & ERP-Mesh (/hizmetler/ai-otomasyon): n8n, Webhooks & REST-API verbinden ERP-, CRM- und Buchhaltungssysteme (0 menschliche Fehler, 15+ Stunden Zeitersparnis pro Woche).
3. Sub-Second Modern Edge Web & Headless Architektur (/hizmetler/web-gelistirme): Next.js 14/15 & SSR Edge Cache, 0,38s TTFB Ladezeit, Google Lighthouse 99-100/100, 3,6x Conversion-Multiplikator.
4. Maßgeschneiderte B2B-Kundenportale & Cloud-Native SaaS (/hizmetler/web-uygulamasi): PostgreSQL & isolierte Docker-VPS, 99,9% Uptime, Self-Service-Portale für Kunden & Händler (kein Excel-Chaos).
5. Data-Driven Growth & GEO (/hizmetler/reklam-sosyal-medya): Meta CAPI (Server-Side), Google Ads Enhanced Conversions und GEO (Platz 1 Sichtbarkeit in ChatGPT, Perplexity & Claude), -45% CAC, 5,4x ROAS.

[RELEVANTE ARCHITEKTUR-DETAILS (RAG)]
${ragResult.formattedContext}
${auditMemoryBlock}

[STRIKTE REGELN & GUARDRAILS]
1. DATENSCHUTZ & VERTRAULICHKEIT: Nennen Sie NIEMALS Namen, Daten oder Details anderer Kunden oder Fremdfirmen.
2. KEINE PAUSCHALPREISE ODER ERFUNDENEN KONTAKTDATEN: Nennen Sie niemals feste Preise, Telefonnummern oder Adressen. Erklären Sie bei Preisfragen, dass jedes System individuell nach Architektur-Umfang kalkuliert wird (kostenlose technische Architekturanalyse, unverbindlich, Antwort innerhalb von 24 Stunden).
3. PRÄGNANZ: Antworten Sie immer auf Deutsch (Sie-Form) in 2 bis 4 klaren, überzeugenden Sätzen.
4. LEAD-ERFASSUNG: Wenn der Besucher eine kostenlose technische Architekturanalyse, ein Angebot oder einen Termin wünscht, fragen Sie nach Name und E-Mail/Telefonnummer und führen Sie sofort 'save_lead' (oder 'schedule_meeting') aus.`;
  } else if (langKey === 'en') {
    systemPrompt = `You are the official Engineering & Efficiency Architecture AI Agent of this website (StarWebFlow).
We don't just build websites; we build efficiency machines: traditional agencies sell services—we deliver operational power and ROI.

[OUR 5 CORE ENGINEERING PILLARS]
1. Model-Agnostic Hybrid AI & Voice Agents (/hizmetler/ai-agents): Zero vendor lock-in (Claude, Llama, DeepSeek, GPT), Cloud or On-Premise deployment (full data sovereignty & GDPR/KVKK). Voice AI reception, Live Chat, WhatsApp & Email/Webhook. 24/7 always-on, 60%+ operational savings.
2. Cognitive Workflows & ERP Mesh (/hizmetler/ai-otomasyon): n8n, Webhooks & REST APIs syncing ERP, CRM, and accounting systems (zero human error, saving 15+ hours/week).
3. Sub-Second Modern Edge Web & Headless Architecture (/hizmetler/web-gelistirme): Next.js 14/15 & SSR Edge Cache, 0.38s TTFB load speed, Google Lighthouse 99-100/100, 3.6x sales conversion multiplier.
4. Custom B2B Portals & Cloud-Native SaaS (/hizmetler/web-uygulamasi): PostgreSQL & isolated Docker VPS, 99.9% uptime, self-service client & dealer portals eliminating Excel chaos.
5. Data-Driven Growth & GEO (/hizmetler/reklam-sosyal-medya): Meta CAPI (Server-Side), Google Ads Enhanced Conversions, and GEO (ranking #1 in ChatGPT, Perplexity & Claude), -45% CAC, 5.4x ROAS.

[RELEVANT ARCHITECTURE DETAILS (RAG)]
${ragResult.formattedContext}
${auditMemoryBlock}

[STRICT GUARDRAILS]
1. CLIENT CONFIDENTIALITY: NEVER mention names, data, or details of any other companies or clients.
2. NO FIXED PRICES OR UNVERIFIED CONTACT DETAILS: Never invent or quote fixed prices, phone numbers, or street addresses. Explain that every architecture is scoped individually via a free technical architecture analysis (no obligation, response within 24 hours).
3. CONCISE: Always reply in English in 2 to 4 sharp, authoritative sentences.
4. LEAD CAPTURE: When a visitor requests a free technical analysis, quote, or meeting, ask for their Name and Email/Phone and immediately invoke 'save_lead' (or 'schedule_meeting').`;
  } else {
    systemPrompt = `Sen bu web sitesinin (StarWebFlow) resmi "Mühendislik & Verimlilik Mimarisi" Otonom AI Temsilcisisin.
Biz sadece web sitesi değil, verimlilik makinesi kuruyoruz: Geleneksel ajanslar hizmet satar; biz operasyonel güç ve ROI inşa ediyoruz.

[SİTEMİZDEKİ 5 ANA MÜHENDİSLİK MİMARİSİ]
1. Model-Agnostik Hibrit AI & Sesli Ajanlar (/hizmetler/ai-agents): Tek bir modele mahkum olmadan (Claude, Llama, DeepSeek, GPT — Sıfır Vendor Lock-in); bulutta veya kurum içi yerel sunucuda (On-Premise / KVKK & Tam Veri Egemenliği) çalışan sesli (Telefon Santrali) ve yazılı (Live Chat, WhatsApp, E-posta & Webhook) temsilciler. 7/24 kesintisiz, %60+ operasyonel tasarruf.
2. n8n & ERP Mesh — Kognitif İş Akışı (/hizmetler/ai-otomasyon): n8n, Webhook ve REST API ile ERP, CRM ve muhasebe sistemlerini konuşturan otonom iş akışları. Fatura kesme, lead kaydetme ve veri senkronizasyonu angaryalarını sıfırlayarak haftalık 15+ saat işgücü kazandırır.
3. Sub-Second Edge Web & Headless Mimari (/hizmetler/web-gelistirme): Next.js 14/15 & SSR Edge Cache ve Global Edge CDN ile 0.38 saniyede açılan dijital vitrin (Google Lighthouse 99-100/100). Reklam trafiğini 3.6 kat (3.6x) daha fazla satışa dönüştürür.
4. Özel B2B Müşteri Portalları & Cloud-Native SaaS (/hizmetler/web-uygulamasi): PostgreSQL ve izole Docker VPS tabanlı, %99.9 Uptime sunan özel yazılım altyapısı. Müşteri ve bayilere self-servis sipariş/takip portalı sunarak Excel ve telefon karmaşasını sıfırlar.
5. Veri Odaklı Büyüme (Growth Marketing) & GEO (/hizmetler/reklam-sosyal-medya): Meta CAPI (Server-Side 1st-Party Veri), Google Ads Enhanced Conversions ve ChatGPT/Perplexity/Claude yapay zeka arama motorlarında 1. sıraya taşıyan GEO optimizasyonu (-%45 CAC tasarrufu, 5.4x ROAS).

[İLGİLİ MİMARİ DETAYLAR (RAG BİLGİ TABANI)]
${ragResult.formattedContext}
${auditMemoryBlock}

[KESİN KURALLAR - GUARDRAILS]
1. MÜŞTERİ GİZLİLİĞİ (ÇOK ÖNEMLİ): Asla başka bir şirketin, markanın veya müşterinin adını/bilgilerini örnek olarak bile verme.
2. SABİT FİYAT VE DIŞ İLETİŞİM BİLGİSİ YASAĞI: Asla sabit bir rakam/fiyat, telefon numarası veya açık adres uydurma/verme. Fiyat sorulduğunda "Her projenin mimari kapsamı ve entegrasyon ihtiyacı farklı olduğu için ücretsiz teknik mimari analiziyle (taahhüt gerektirmez, 24 saat içinde yanıt) projeye özel teklif hazırlıyoruz" de.
3. KISA VE NET OL: Daima TÜRKÇE, 2-4 kısa ve güçlü cümleyle yanıt ver. Asla <think> etiketi veya ham JSON gösterme.
4. ÜCRETSİZ TEKNİK MİMARİ ANALİZİ & LEAD YAKALAMA: Ziyaretçi kendi projesi için teklif, ücretsiz teknik mimari analizi veya görüşme istediğinde adını ve e-posta/telefon bilgisini iste; paylaştığı anda 'save_lead' (veya randevu için 'schedule_meeting') aracını çalıştır.`;
  }

  const result = await streamText({
    model: getAgentModel(),
    system: systemPrompt,
    messages,
    tools: {
      save_lead: tool({
        description: 'Ziyaretçi ücretsiz teknik mimari analizi veya teklif için iletişim bilgilerini (Ad, E-Posta veya Telefon) verdiğinde veritabanına kaydet.',
        parameters: z.object({
          name: z.string().describe('Ziyaretçinin Adı ve Soyadı'),
          email: z.string().optional().describe('Ziyaretçinin e-posta adresi (varsa)'),
          phone: z.string().optional().describe('Ziyaretçinin telefon numarası (varsa)'),
          industry: z.string().optional().describe('Konuşmadan anlaşılan sektör (varsa)'),
          serviceType: z.string().optional().describe('İlgilenilen mimari alan (Model-Agnostik AI Agents, n8n & ERP Otomasyon, Sub-Second Edge Web, B2B Portal & SaaS, Growth & GEO)'),
          score: z.number().min(0).max(100).optional().describe('Satın alma niyet puanı (0-100)'),
          notes: z.string().optional().describe('Sohbetin ve mimari ihtiyacın kısa özeti'),
        }),
        execute: async ({ name, email, phone, industry, serviceType, score, notes }: any): Promise<any> => {
          if (!email && !phone) {
            const noContactMsg =
              langKey === 'de'
                ? 'Bitte mindestens eine E-Mail-Adresse oder Telefonnummer angeben.'
                : langKey === 'en'
                ? 'Please provide at least an email address or phone number.'
                : 'Lütfen e-posta veya telefon numarasından en az birini sağlayın.';
            return { success: false, message: noContactMsg };
          }

          try {
            let lead = await prisma.lead.findFirst({
              where: {
                tenantId,
                OR: [{ email: email || 'NO_MATCH_EMAIL' }, { phone: phone || 'NO_MATCH_PHONE' }],
              },
            });

            if (!lead) {
              lead = await prisma.lead.create({
                data: {
                  tenantId,
                  name,
                  email,
                  phone,
                  industry: industry || effectiveAudit?.detectedIndustry,
                  serviceType: serviceType || effectiveAudit?.recommendedService,
                  score: score || 85,
                  notes: effectiveAudit?.domain
                    ? `[Audit: ${effectiveAudit.domain} (${effectiveAudit.overallScore}/100)] ${notes || ''}`
                    : notes,
                  source: 'AI Chat Assistant',
                  status: 'new',
                },
              });
            } else {
              await prisma.lead.update({
                where: { id: lead.id },
                data: {
                  name,
                  industry: industry || lead.industry,
                  serviceType: serviceType || lead.serviceType,
                  score: score || lead.score,
                  notes: notes ? (lead.notes ? `${lead.notes}\n\n[Yeni AI Özeti]: ${notes}` : notes) : lead.notes,
                },
              });
            }

            let thread = await prisma.chatThread.findUnique({
              where: {
                tenantId_leadId: {
                  tenantId,
                  leadId: lead.id,
                },
              },
            });

            if (!thread) {
              thread = await prisma.chatThread.create({
                data: {
                  tenantId,
                  leadId: lead.id,
                },
              });
            }

            try {
              const { EventBus } = await import('@/lib/automation/eventBus');
              await EventBus.emit('lead.created', {
                leadId: lead.id,
                tenantId,
                name,
                email,
                phone,
                score: score || 85,
                source: 'AI Chat Assistant',
              });
            } catch (e) {
              console.warn('[Chat API] EventBus warning:', e);
            }

            const successMsg =
              langKey === 'de'
                ? 'Lead erfolgreich gespeichert. Bitte bestätigen Sie dem Besucher, dass wir uns innerhalb von 24 Stunden mit der kostenlosen technischen Architekturanalyse melden.'
                : langKey === 'en'
                ? 'Lead successfully saved. Confirm with the visitor that our engineering team will respond within 24 hours with their custom architecture analysis.'
                : 'Talebiniz kaydedildi. Ziyaretçiye teşekkür et ve 24 saat içinde ücretsiz teknik mimari analiziyle dönüş yapılacağını belirt.';

            return {
              success: true,
              leadId: lead.id,
              message: successMsg,
            };
          } catch (error) {
            console.error('Lead save error:', error);
            return { success: false, message: 'Kayıt sırasında bir hata oluştu.' };
          }
        },
      }),
      schedule_meeting: tool({
        description: 'Ziyaretçi doğrudan canlı teknik mimari görüşmesi veya randevu planlamak istediğinde bu aracı çalıştır.',
        parameters: z.object({
          name: z.string().describe('Ziyaretçinin Adı'),
          email: z.string().describe('Ziyaretçinin E-posta adresi'),
          phone: z.string().optional().describe('Ziyaretçinin telefon numarası'),
          preferredDate: z.string().optional().describe('Tercih ettiği gün veya saat aralığı'),
          topic: z.string().optional().describe('Görüşmek istediği mimari konu (AI Agents, n8n ERP, Edge Web, B2B SaaS, GEO)'),
        }),
        execute: async ({ name, email, phone, preferredDate, topic }: any): Promise<any> => {
          try {
            let lead = await prisma.lead.findFirst({
              where: {
                tenantId,
                OR: [{ email }, ...(phone ? [{ phone }] : [])],
              },
            });

            if (!lead) {
              lead = await prisma.lead.create({
                data: {
                  tenantId,
                  name,
                  email,
                  phone,
                  notes: `Toplantı Talebi: ${topic || 'Teknik Mimari Analizi'} | Tercih Edilen Zaman: ${preferredDate || 'En Kısa Sürede'}`,
                  source: 'AI Chat Scheduler',
                  status: 'new',
                  score: 90,
                },
              });
            }

            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() + 1);
            targetDate.setHours(11, 0, 0, 0);
            const endDate = new Date(targetDate.getTime() + 30 * 60 * 1000);

            await prisma.appointment.create({
              data: {
                tenantId,
                title: `StarWebFlow Teknik Mimari Görüşmesi - ${name} (${topic || 'Mimari Keşif'})`,
                clientName: name,
                clientEmail: email,
                startTime: targetDate,
                endTime: endDate,
                status: 'pending',
                meetLink: null,
              },
            });

            const replyMsg =
              langKey === 'de'
                ? 'Termin erfolgreich erstellt. Bestätigen Sie dem Besucher den Termin.'
                : langKey === 'en'
                ? 'Meeting request created. Confirm the appointment with the visitor.'
                : 'Teknik mimari görüşme talebiniz oluşturuldu! Uzman ekibimiz sizinle iletişime geçecektir.';

            return {
              success: true,
              meetingConfirmed: true,
              bookingUrl: '/randevu',
              message: replyMsg,
            };
          } catch (e: any) {
            console.error('[Scheduler Tool] Error:', e);
            return { success: false, message: 'Toplantı kaydı alınırken bir hata oluştu.' };
          }
        },
      }),
    },
    maxSteps: 3,
    onFinish: async ({ text, toolCalls }) => {
      if ((!toolCalls || toolCalls.length === 0) && text) {
        const parsed = parseHybridToolCalls(text, ['save_lead', 'schedule_meeting']);
        for (const tc of parsed.toolCalls) {
          try {
            if (tc.name === 'save_lead') {
              const { name, email, phone, industry, serviceType, score, notes } = tc.arguments || {};
              if (name && (email || phone)) {
                const existing = await prisma.lead.findFirst({
                  where: {
                    tenantId,
                    OR: [{ email: email || 'NO_MATCH_EMAIL' }, { phone: phone || 'NO_MATCH_PHONE' }],
                  },
                });
                if (!existing) {
                  await prisma.lead.create({
                    data: {
                      tenantId,
                      name,
                      email,
                      phone,
                      industry: industry || effectiveAudit?.detectedIndustry,
                      serviceType: serviceType || effectiveAudit?.recommendedService,
                      score: Number(score) || 85,
                      notes: notes || 'Otonom AI Temsilcisi tarafından kaydedildi.',
                      source: 'AI Chat Assistant',
                      status: 'new',
                    },
                  });
                }
              }
            }
          } catch (err) {
            console.warn('[Chat Hybrid Tool Parser] Kayıt uyarısı:', err);
          }
        }
      }
    },
  });

  return result.toDataStreamResponse();
}
