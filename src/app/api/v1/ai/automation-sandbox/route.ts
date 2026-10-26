import { NextResponse } from 'next/server';
import { generateTextResilient, extractJsonFromText, OLLAMA_MODELS } from '@/lib/ai/gemini-client';

export interface SandboxNode {
  id: string;
  type: 'trigger' | 'action';
  app: string;
  label: string;
}

export interface SandboxResponse {
  reply: string;
  estimatedSavedHoursPerMonth: number;
  nodes: SandboxNode[];
  modelUsed: string;
}

function buildSmartSandboxFallback(query: string, sector: string, lang: string): SandboxResponse {
  const isDe = lang === 'de';
  const isEn = lang === 'en';
  const qLower = query.toLowerCase();

  if (/whatsapp|randevu|termin|klinik|hasta|appointment/.test(qLower) || sector === 'clinic') {
    return {
      reply: isDe
        ? 'Ich habe Ihren WhatsApp- & Termin-Workflow sofort entworfen! Anfragen werden rund um die Uhr per KI qualifiziert, freie Kalender-Slots geprüft und automatisch mit 24h-Erinnerung gebucht.'
        : isEn
        ? 'I have designed your WhatsApp & appointment workflow! Inquiries are qualified 24/7 by AI, calendar slots are verified, and appointments are booked with automated 24h reminders.'
        : 'WhatsApp ve randevu otomasyon akışınızı hemen kurguladım! Gelen talepler 7/24 Star AI tarafından karşılanır, doktor/uzman takvimindeki boş saatler kontrol edilerek randevu oluşturulur ve 24 saat kala otomatik hatırlatma mesajı gönderilir.',
      estimatedSavedHoursPerMonth: 120,
      nodes: [
        { id: 'n1', type: 'trigger', app: 'WhatsApp Cloud', label: isDe ? 'Neue Nachricht (24/7)' : isEn ? 'Incoming Message (24/7)' : '7/24 Gelen Mesaj' },
        { id: 'n2', type: 'action', app: 'Star AI', label: isDe ? 'Absicht & Triage-Analyse' : isEn ? 'Intent & Triage Analysis' : 'Niyet & Triyaj Analizi' },
        { id: 'n3', type: 'action', app: 'Google Calendar', label: isDe ? 'Termin-Slot buchen' : isEn ? 'Book Calendar Slot' : 'Otomatik Randevu Kaydı' },
        { id: 'n4', type: 'action', app: 'HubSpot CRM', label: isDe ? 'Patientenakte & Erinnerung' : isEn ? 'CRM Sync & Reminder' : 'CRM Kaydı & 24s Hatırlatma' },
      ],
      modelUsed: OLLAMA_MODELS.AUTOMATION,
    };
  }

  if (/fatura|evrak|ocr|lojistik|rechn|invoice|erp/.test(qLower)) {
    return {
      reply: isDe
        ? 'Ihr Dokumenten- & Rechnungs-Workflow steht bereit! Eingehende PDFs/E-Mails werden per Star AI OCR ausgelesen, mit dem ERP abgeglichen und fehlerfrei verbucht.'
        : isEn
        ? 'Your document & invoice workflow is ready! Incoming PDFs/emails are parsed via Star AI OCR, matched against ERP records, and booked with zero manual entry.'
        : 'Fatura ve evrak otomasyon akışınız hazır! E-posta veya WhatsApp ile gelen PDF faturalar Star AI tarafından okunur, kalemler ayrıştırılır, ERP/Muhasebe sistemine işlenir ve onay mesajı iletilir.',
      estimatedSavedHoursPerMonth: 160,
      nodes: [
        { id: 'n1', type: 'trigger', app: 'E-Mail / Webhook', label: isDe ? 'PDF-Rechnung empfangen' : isEn ? 'PDF Invoice Received' : 'Gelen Fatura / Evrak' },
        { id: 'n2', type: 'action', app: 'Star AI', label: isDe ? 'KI-OCR & Datenextraktion' : isEn ? 'AI OCR & Data Extraction' : 'AI Veri & Kalem Okuma' },
        { id: 'n3', type: 'action', app: 'ERP / DATEV', label: isDe ? 'Automatische Verbuchung' : isEn ? 'Automated ERP Entry' : 'ERP / Muhasebe Kaydı' },
        { id: 'n4', type: 'action', app: 'Slack / WhatsApp', label: isDe ? 'Freigabe-Benachrichtigung' : isEn ? 'Approval Notification' : 'Yönetici Onay Bildirimi' },
      ],
      modelUsed: OLLAMA_MODELS.AUTOMATION,
    };
  }

  return {
    reply: isDe
      ? 'Ihr autonomer B2B-Vertriebs- & Lead-Workflow wurde erstellt! Eingehende Anfragen werden in Echtzeit durch Star AI bewertet, ein individuelles Angebot generiert und sofort via WhatsApp & CRM nachverfolgt.'
      : isEn
      ? 'Your autonomous B2B sales & lead workflow is live! Incoming leads are scored in real time by Star AI, a custom proposal is generated, and instant follow-up is triggered via WhatsApp & CRM.'
      : 'Otonom satış ve operasyon iş akışınız oluşturuldu! Gelen müşteri talepleri Star AI tarafından saniyeler içinde puanlanır, kişiye özel teklif hazırlanır ve WhatsApp + CRM üzerinden sıfır gecikmeyle takip başlatılır.',
    estimatedSavedHoursPerMonth: 140,
    nodes: [
      { id: 'n1', type: 'trigger', app: 'Website / Form', label: isDe ? 'Neuer Lead / Anfrage' : isEn ? 'New Lead / Inquiry' : 'Yeni Müşteri Talebi' },
      { id: 'n2', type: 'action', app: 'Star AI', label: isDe ? 'KI-Lead-Scoring & Pitch' : isEn ? 'AI Lead Scoring & Pitch' : 'AI Puanlama & Teklif Üretimi' },
      { id: 'n3', type: 'action', app: 'WhatsApp', label: isDe ? 'Sofort-Nachricht senden' : isEn ? 'Send Instant Follow-Up' : 'Anında WhatsApp İletimi' },
      { id: 'n4', type: 'action', app: 'HubSpot CRM', label: isDe ? 'Deal & Aufgabe anlegen' : isEn ? 'Create Deal & Task' : 'CRM Fırsat & Görev Kaydı' },
    ],
    modelUsed: OLLAMA_MODELS.AUTOMATION,
  };
}

export async function POST(req: Request) {
  try {
    const { query = '', sector = 'b2b', language = 'tr' } = await req.json();
    const cleanQuery = String(query).trim();
    if (!cleanQuery) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const lang = String(language || 'tr').toLowerCase();
    const fallback = buildSmartSandboxFallback(cleanQuery, sector, lang);

    const langRule =
      lang === 'de'
        ? 'Antworte auf Deutsch.'
        : lang === 'en'
        ? 'Respond in English.'
        : 'Türkçe yanıt ver.';

    const prompt = `Kullanıcı İş Senaryosu: "${cleanQuery}" (Sektör: ${sector})
${langRule}
Bu senaryoyu otomatikleştiren 2 cümlelik ikna edici açıklama ("reply"), aylık kazanılan tahmini saat ("estimatedSavedHoursPerMonth") ve 4 düğümlü ("n1".."n4") iş akışını SADECE aşağıdaki JSON formatında döndür:
{
  "reply": "2 cümlelik net otomasyon çözümü ve iş etkisi...",
  "estimatedSavedHoursPerMonth": 140,
  "nodes": [
    {"id": "n1", "type": "trigger", "app": "WhatsApp", "label": "Gelen Mesaj"},
    {"id": "n2", "type": "action", "app": "Star AI", "label": "AI Niyet & Veri Analizi"},
    {"id": "n3", "type": "action", "app": "CRM", "label": "Otomatik Kayıt"},
    {"id": "n4", "type": "action", "app": "E-Mail", "label": "Anında Teklif Gönderimi"}
  ]
}`;

    const aiRes = await generateTextResilient({
      prompt,
      temperature: 0.2,
      maxTokens: 320,
      preferredModel: 'automation',
    });

    if (aiRes.providerUsed !== 'fallback' && aiRes.text) {
      try {
        const parsed = JSON.parse(extractJsonFromText(aiRes.text));
        const rawNodes = Array.isArray(parsed.nodes) ? parsed.nodes : Array.isArray(parsed) ? parsed : [];
        const nodes: SandboxNode[] =
          rawNodes.length >= 3
            ? rawNodes.slice(0, 4).map((n: any, idx: number) => ({
                id: `n${idx + 1}`,
                type: idx === 0 ? 'trigger' : 'action',
                app: String(n.app || (idx === 1 ? 'Star AI' : 'CRM')),
                label: String(n.label || n.name || `Adım ${idx + 1}`),
              }))
            : fallback.nodes;

        return NextResponse.json({
          success: true,
          provider: aiRes.providerUsed,
          data: {
            reply: typeof parsed.reply === 'string' && parsed.reply.length > 15 ? parsed.reply : fallback.reply,
            estimatedSavedHoursPerMonth:
              typeof parsed.estimatedSavedHoursPerMonth === 'number'
                ? parsed.estimatedSavedHoursPerMonth
                : fallback.estimatedSavedHoursPerMonth,
            nodes,
            modelUsed: OLLAMA_MODELS.AUTOMATION,
          } satisfies SandboxResponse,
        });
      } catch {
        // Fall through to contextual fallback
      }
    }

    return NextResponse.json({
      success: true,
      provider: 'contextual-automation',
      data: fallback,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Sandbox error' }, { status: 500 });
  }
}
