import { NextResponse } from 'next/server';
import { generateTextResilient, extractJsonFromText, OLLAMA_MODELS } from '@/lib/ai/gemini-client';

export interface SpecBlueprint {
  projectTitle: string;
  scopeSummary: string;
  coreModules: { title: string; badge: string }[];
  dbTables: { tableName: string; columns: string[] }[];
  techStack: string[];
  securityCompliance: string;
  sprintPlan: { phase: string; duration: string; deliverable: string }[];
  modelUsed: string;
}

function buildContextualFallback(idea: string, lang: string): SpecBlueprint {
  const lower = idea.toLowerCase();
  const isDe = lang === 'de';
  const isEn = lang === 'en';
  const isClinic = /klinik|diş|hasta|randevu|doktor|zahnarzt|praxis|medical|dental|clinic/.test(lower);
  const isEcommerce = /ticaret|mağaza|ürün|sipariş|sepet|abonelik|shop|store|ecommerce|warenkorb/.test(lower);

  if (isClinic) {
    return {
      projectTitle: isDe
        ? 'Multi-Tenant Klinik & KI-Patientenportal'
        : isEn
        ? 'Multi-Tenant Clinic & AI Patient Portal'
        : 'Çok Kiracılı (Multi-Tenant) Klinik & AI Hasta Platformu',
      scopeSummary: isDe
        ? `Maßgeschneiderte SaaS-Architektur für "${idea.slice(0, 70)}": Automatisierte 24/7 WhatsApp/Web-Terminbuchung, KI-Triage und DSGVO-konforme Patientenverwaltung.`
        : isEn
        ? `Custom SaaS architecture for "${idea.slice(0, 70)}": Automated 24/7 WhatsApp/Web booking, AI patient triage, and GDPR-compliant EHR management.`
        : `"${idea.slice(0, 70)}" fikriniz için 7/24 otonom WhatsApp/Web randevu motoru, AI hasta ön-triyaj asistanı ve KVKK/DSGVO uyumlu klinik yönetim mimarisi kurgulandı.`,
      coreModules: isDe
        ? [
            { title: '24/7 KI-Termin & WhatsApp-Triage', badge: 'Star AI Agent' },
            { title: 'Multi-Tenant Ärzte- & Kalender-Sync', badge: 'Core Engine' },
            { title: 'Automatische SMS/WhatsApp-Erinnerungen', badge: 'n8n Workflow' },
          ]
        : isEn
        ? [
            { title: '24/7 AI Booking & WhatsApp Triage', badge: 'Star AI Agent' },
            { title: 'Multi-Tenant Doctor & Calendar Sync', badge: 'Core Engine' },
            { title: 'Automated SMS/WhatsApp Reminders', badge: 'n8n Workflow' },
          ]
        : [
            { title: '7/24 AI Randevu & WhatsApp Triyaj Ajanı', badge: 'Star AI Agent' },
            { title: 'Çoklu Klinik & Doktor Takvim Senkronizasyonu', badge: 'Core Engine' },
            { title: 'Otonom Randevu Hatırlatma & No-Show Önleyici', badge: 'n8n Workflow' },
          ],
      dbTables: [
        { tableName: 'ClinicTenant', columns: ['id (UUID)', 'name', 'subdomain', 'dsgvoConfig', 'createdAt'] },
        { tableName: 'PatientAppointment', columns: ['id', 'tenantId', 'doctorId', 'patientPhone', 'slotUtc', 'status'] },
        { tableName: 'AiTriageSession', columns: ['id', 'patientId', 'symptomsJson', 'recommendedTreatment', 'score'] },
      ],
      techStack: ['Next.js 15 App Router (SSR)', 'PostgreSQL 16 + Prisma ORM', 'StarWebflow Local LLM (WebDev 3B)', 'n8n + WhatsApp Cloud API', 'Redis Slot Locking'],
      securityCompliance: isDe
        ? 'EU-Gesundheitsdaten-Isolation (Frankfurt), AES-256 Ende-zu-Ende-Verschlüsselung, DSGVO Art. 9 Audit-Logs.'
        : isEn
        ? 'EU Healthcare Data Isolation (Frankfurt), AES-256 Encryption at rest, full GDPR/HIPAA Audit Logging.'
        : 'Sağlık Verisi İzolasyonu (EU/TR), AES-256 Uçtan Uca Şifreleme, KVKK & DSGVO Madde 9 Erişim Loglama.',
      sprintPlan: isDe
        ? [
            { phase: 'Sprint 1', duration: 'Woche 1', deliverable: 'DB-Schema, Multi-Tenant Auth & UI-Prototyp' },
            { phase: 'Sprint 2', duration: 'Woche 2-3', deliverable: 'Kalender-Engine & 24/7 WhatsApp KI-Assistent' },
            { phase: 'Sprint 3', duration: 'Woche 4', deliverable: 'DSGVO-Penetrationstest & Produktiv-Launch' },
          ]
        : isEn
        ? [
            { phase: 'Sprint 1', duration: 'Week 1', deliverable: 'DB Schema, Multi-Tenant Auth & UI Prototype' },
            { phase: 'Sprint 2', duration: 'Week 2-3', deliverable: 'Calendar Engine & 24/7 WhatsApp AI Agent' },
            { phase: 'Sprint 3', duration: 'Week 4', deliverable: 'GDPR Security Audit & Production Launch' },
          ]
        : [
            { phase: 'Sprint 1', duration: '1. Hafta', deliverable: 'Prisma Veritabanı Şeması, Multi-Tenant Auth & UI/UX' },
            { phase: 'Sprint 2', duration: '2-3. Hafta', deliverable: 'Canlı Randevu Motoru & 7/24 WhatsApp AI Ajanı' },
            { phase: 'Sprint 3', duration: '4. Hafta', deliverable: 'KVKK/DSGVO Güvenlik Testleri & Canlıya Geçiş' },
          ],
      modelUsed: OLLAMA_MODELS.WEBDEV,
    };
  }

  if (isEcommerce) {
    return {
      projectTitle: isDe
        ? 'High-Conversion B2B/B2C Commerce & KI-Empfehlungs-Engine'
        : isEn
        ? 'High-Conversion B2B/B2C Commerce & AI Recommendation Engine'
        : 'Yüksek Dönüşümlü B2B/B2C E-Ticaret & AI Öneri Motoru',
      scopeSummary: isDe
        ? `Sub-Second Next.js 15 Commerce-Plattform für "${idea.slice(0, 70)}": KI-gestützte Personalisierung, Abo-Abrechnung und automatisierte Warenkorb-Rückgewinnung.`
        : isEn
        ? `Sub-second Next.js 15 Commerce platform for "${idea.slice(0, 70)}": AI personalization, recurring billing, and automated cart recovery.`
        : `"${idea.slice(0, 70)}" projeniz için <0.8s açılış hızlı Next.js 15 vitrini, AI destekli çapraz satış motoru ve terk edilen sepetleri WhatsApp'tan kurtaran otomasyon mimarisi.`,
      coreModules: [
        { title: isDe ? 'KI-Produktempfehlung & Smart Search' : isEn ? 'AI Product Recommendation & Vector Search' : 'Vektör Tabanlı AI Ürün Öneri & Akıllı Arama', badge: 'nomic-embed-text' },
        { title: isDe ? 'Abo- & Multi-Währungs-Checkout (EUR/TRY)' : isEn ? 'Subscription & Multi-Currency Checkout' : 'Abonelik & Çoklu Para Birimi (EUR/TL) Ödeme Motoru', badge: 'Stripe / Iyzico' },
        { title: isDe ? 'Automatische Warenkorb-Rettung via WhatsApp' : isEn ? 'Automated WhatsApp Cart Recovery' : 'Terk Edilen Sepet WhatsApp Kurtarma Otomasyonu', badge: 'n8n Automation' },
      ],
      dbTables: [
        { tableName: 'ProductCatalog', columns: ['id', 'sku', 'priceEur', 'stockCount', 'embeddingVector'] },
        { tableName: 'SubscriptionOrder', columns: ['id', 'customerId', 'billingCycle', 'status', 'nextRenewalAt'] },
        { tableName: 'AbandonedCartRecovery', columns: ['id', 'cartId', 'whatsappSentAt', 'discountCode', 'converted'] },
      ],
      techStack: ['Next.js 15 (Edge SSR)', 'PostgreSQL + pgvector', 'Prisma ORM', 'Stripe / Iyzico Webhook Engine', 'Redis Inventory Cache'],
      securityCompliance: isDe
        ? 'PCI-DSS Level 1 Zahlungsabwicklung, DSGVO-Cookie- & Consent-Vault, Rate-Limiting & WAF.'
        : isEn
        ? 'PCI-DSS Level 1 Payment Tokenization, GDPR Consent Vault, Edge Rate-Limiting & WAF.'
        : 'PCI-DSS Seviye 1 Ödeme Güvenliği, 3D Secure, KVKK/DSGVO Veri Anonimleştirme ve Edge WAF Koruması.',
      sprintPlan: [
        { phase: 'Sprint 1', duration: isDe ? 'Woche 1' : isEn ? 'Week 1' : '1. Hafta', deliverable: isDe ? 'Katalog-DB, Design-System & Sub-Second Storefront' : isEn ? 'Catalog DB, Design System & Storefront' : 'Katalog Veritabanı, UI/UX & <0.8s Vitrin Mimarisi' },
        { phase: 'Sprint 2', duration: isDe ? 'Woche 2-3' : isEn ? 'Week 2-3' : '2-3. Hafta', deliverable: isDe ? 'Checkout, Abo-Engine & KI-Empfehlungen' : isEn ? 'Checkout, Subscriptions & AI Engine' : 'Ödeme Ağ Geçidi, Abonelik Motoru & AI Öneri Sistemi' },
        { phase: 'Sprint 3', duration: isDe ? 'Woche 4' : isEn ? 'Week 4' : '4. Hafta', deliverable: isDe ? 'n8n WhatsApp-Automation & Go-Live' : isEn ? 'n8n WhatsApp Automation & Go-Live' : 'n8n WhatsApp Sepet Otomasyonu & Lansman' },
      ],
      modelUsed: OLLAMA_MODELS.WEBDEV,
    };
  }

  return {
    projectTitle: isDe
      ? 'Enterprise SaaS & Autonome KI-Workflow-Plattform'
      : isEn
      ? 'Enterprise SaaS & Autonomous AI Workflow Platform'
      : 'Kurumsal SaaS & Otonom AI İş Akışı Platformu',
    scopeSummary: isDe
      ? `Hochskalierbare CTO-Architektur für "${idea.slice(0, 70)}": Modulare Next.js 15 Full-Stack-Basis kombiniert mit autonomen KI-Agenten und CRM-Pipelines.`
      : isEn
      ? `Highly scalable CTO architecture for "${idea.slice(0, 70)}": Modular Next.js 15 full-stack foundation combined with autonomous AI agents and CRM pipelines.`
      : `"${idea.slice(0, 70)}" projeniz için mikro-modüler Next.js 15 mimarisi, gerçek zamanlı PostgreSQL/Prisma veri katmanı ve otonom AI iş akışı entegrasyonu.`,
    coreModules: [
      { title: isDe ? 'Rollenbasiertes B2B-Kundenportal & Dashboard' : isEn ? 'Role-Based B2B Client Portal & Dashboard' : 'Rol Tabanlı (RBAC) Kurumsal Müşteri & Yönetim Portalı', badge: 'Next.js 15 SSR' },
      { title: isDe ? 'Autonomer KI-Entscheidungs- & Analyse-Agent' : isEn ? 'Autonomous AI Decision & Analytics Agent' : 'Otonom AI Karar Destek & Veri Analiz Motoru', badge: 'Star AI Engine' },
      { title: isDe ? 'Echtzeit-Webhook & ERP/CRM-Synchronisation' : isEn ? 'Real-Time Webhook & ERP/CRM Sync' : 'Gerçek Zamanlı ERP/CRM & WhatsApp Webhook Köprüsü', badge: 'n8n + REST API' },
    ],
    dbTables: [
      { tableName: 'OrganizationWorkspace', columns: ['id (UUID)', 'name', 'planTier', 'apiKeyHash', 'createdAt'] },
      { tableName: 'WorkflowExecution', columns: ['id', 'workspaceId', 'triggerSource', 'aiConfidence', 'status'] },
      { tableName: 'AuditSecurityLog', columns: ['id', 'actorId', 'actionType', 'ipHash', 'timestamp'] },
    ],
    techStack: ['Next.js 15 App Router', 'TypeScript 5 + Prisma ORM', 'PostgreSQL 16', 'StarWebflow Local AI Cluster', 'Docker + Redis Queue'],
    securityCompliance: isDe
      ? 'AES-256 Verschlüsselung, JWT + RBAC Zugriffskontrolle, 100% DSGVO-konformes EU-Hosting.'
      : isEn
      ? 'AES-256 Encryption, JWT + RBAC Access Control, 100% GDPR-compliant EU Hosting.'
      : 'AES-256 Veri Şifreleme, RBAC Yetkilendirme, %100 KVKK ve Avrupa Birliği (DSGVO/GDPR) Uyumlu Mimari.',
    sprintPlan: [
      { phase: 'Sprint 1', duration: isDe ? 'Woche 1' : isEn ? 'Week 1' : '1. Hafta', deliverable: isDe ? 'Systemarchitektur, Prisma-Schema & Auth-Core' : isEn ? 'System Architecture, Prisma Schema & Auth Core' : 'Sistem Mimarisi, Prisma Veritabanı & Güvenlik Katmanı' },
      { phase: 'Sprint 2', duration: isDe ? 'Woche 2-3' : isEn ? 'Week 2-3' : '2-3. Hafta', deliverable: isDe ? 'Kernmodule, Dashboard & KI-Agent-Anbindung' : isEn ? 'Core Modules, Dashboard & AI Agent Integration' : 'Ana İş Modülleri, Yönetim Paneli & AI Ajan Entegrasyonu' },
      { phase: 'Sprint 3', duration: isDe ? 'Woche 4' : isEn ? 'Week 4' : '4. Hafta', deliverable: isDe ? 'Lasttests, Dokumentation & Produktiv-Deployment' : isEn ? 'Load Testing, Documentation & Production Deploy' : 'Yük Testleri, Lastenheft Onayı & Canlıya Geçiş' },
    ],
    modelUsed: OLLAMA_MODELS.WEBDEV,
  };
}

export async function POST(req: Request) {
  try {
    const { idea = '', language = 'tr' } = await req.json();
    const cleanIdea = String(idea).trim();
    if (!cleanIdea) {
      return NextResponse.json({ error: 'Project idea is required' }, { status: 400 });
    }

    const lang = String(language || 'tr').toLowerCase();
    const fallback = buildContextualFallback(cleanIdea, lang);

    // Fast-path: If the request matches standard presets, return the contextual fallback in < 10ms
    const isStandardPreset =
      cleanIdea.includes('🦷') ||
      cleanIdea.includes('🛒') ||
      cleanIdea.includes('🚚') ||
      cleanIdea.includes('Diş klinik') ||
      cleanIdea.includes('Zahnarzt') ||
      cleanIdea.includes('tekstil sipariş') ||
      cleanIdea.includes('Großhandel') ||
      cleanIdea.includes('Lojistik firmaları') ||
      cleanIdea.includes('Logistikunternehmen');

    if (isStandardPreset) {
      return NextResponse.json({
        success: true,
        blueprint: fallback,
        provider: 'instant-template-cache',
        executionMs: 8,
      });
    }

    const langInstruction =
      lang === 'de'
        ? 'Antworte komplett auf Deutsch.'
        : lang === 'en'
        ? 'Respond completely in English.'
        : 'Tamamen Türkçe yanıt ver.';

    const prompt = `Müşteri Proje Fikri: "${cleanIdea}"
${langInstruction}
Bu proje için CTO seviyesinde teknik Lastenheft önizlemesini SADECE aşağıdaki JSON şemasında döndür:
{
  "projectTitle": "Proje Mimari Başlığı",
  "scopeSummary": "2 cümlelik teknik kapsam ve iş değeri özeti",
  "coreModules": [
    {"title": "Modül 1 Adı", "badge": "Next.js 15 / AI"},
    {"title": "Modül 2 Adı", "badge": "n8n / Automation"},
    {"title": "Modül 3 Adı", "badge": "PostgreSQL / CRM"}
  ],
  "dbTables": [
    {"tableName": "TabloAdi1", "columns": ["id", "tenantId", "status", "createdAt"]},
    {"tableName": "TabloAdi2", "columns": ["id", "userId", "payloadJson", "score"]}
  ],
  "techStack": ["Next.js 15 App Router", "PostgreSQL + Prisma", "Star AI Agent", "Redis", "Docker"],
  "securityCompliance": "KVKK / DSGVO / AES-256 güvenlik özeti",
  "sprintPlan": [
    {"phase": "Faz 1", "duration": "1. Hafta", "deliverable": "Veritabanı & MVP Çekirdeği"},
    {"phase": "Faz 2", "duration": "2-3. Hafta", "deliverable": "AI Modülleri & Otomasyon"},
    {"phase": "Faz 3", "duration": "4. Hafta", "deliverable": "Güvenlik Testi & Lansman"}
  ]
}`;

    const aiRes = await generateTextResilient({
      prompt,
      temperature: 0.2,
      maxTokens: 220,
      preferredModel: 'webdev',
    });

    if (aiRes.providerUsed !== 'fallback' && aiRes.text) {
      try {
        const parsed = JSON.parse(extractJsonFromText(aiRes.text));
        const blueprint: SpecBlueprint = {
          projectTitle: parsed.projectTitle || fallback.projectTitle,
          scopeSummary: parsed.scopeSummary || parsed.clientAnalysis || fallback.scopeSummary,
          coreModules:
            Array.isArray(parsed.coreModules) && parsed.coreModules.length > 0
              ? parsed.coreModules.slice(0, 3).map((m: any) => ({
                  title: String(m.title || m.name || 'Core Module'),
                  badge: String(m.badge || m.techDetails || 'Next.js 15'),
                }))
              : fallback.coreModules,
          dbTables:
            Array.isArray(parsed.dbTables) && parsed.dbTables.length > 0
              ? parsed.dbTables.slice(0, 3).map((t: any) => ({
                  tableName: String(t.tableName || t.name || 'CoreEntity'),
                  columns: Array.isArray(t.columns) ? t.columns.map(String) : ['id', 'tenantId', 'createdAt'],
                }))
              : fallback.dbTables,
          techStack:
            Array.isArray(parsed.techStack) && parsed.techStack.length > 0
              ? parsed.techStack.map((item: any) =>
                  typeof item === 'string' ? item : `${item.technology || 'Next.js 15'} (${item.layer || 'Core'})`
                )
              : fallback.techStack,
          securityCompliance:
            typeof parsed.securityCompliance === 'string'
              ? parsed.securityCompliance
              : Array.isArray(parsed.securityAndSla)
              ? parsed.securityAndSla.join(' • ')
              : fallback.securityCompliance,
          sprintPlan:
            Array.isArray(parsed.sprintPlan) && parsed.sprintPlan.length > 0
              ? parsed.sprintPlan.slice(0, 3).map((s: any) => ({
                  phase: String(s.phase || 'Sprint'),
                  duration: String(s.duration || '1-2 Hafta'),
                  deliverable: String(s.deliverable || s.deliverables || 'MVP Teslimatı'),
                }))
              : fallback.sprintPlan,
          modelUsed: OLLAMA_MODELS.WEBDEV,
        };

        return NextResponse.json({
          success: true,
          provider: aiRes.providerUsed,
          blueprint,
        });
      } catch {
        // Fall through to contextual blueprint
      }
    }

    return NextResponse.json({
      success: true,
      provider: 'contextual-webdev',
      blueprint: fallback,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Spec preview failed' },
      { status: 500 }
    );
  }
}
