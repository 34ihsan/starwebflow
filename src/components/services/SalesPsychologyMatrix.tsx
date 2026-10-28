'use client'

import React, { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { Check, X, HelpCircle, ArrowRight, Sparkles, Calendar, ShieldCheck, Zap } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export interface MatrixRow {
  traditional: string
  doubt: string
  solution: string
}

interface SalesPsychologyMatrixProps {
  serviceKey: 'ai-agents' | 'web-gelistirme' | 'reklam-sosyal-medya' | 'ai-otomasyon' | 'web-uygulamasi'
  accentColor: string
}

const MATRIX_DATA: Record<
  'ai-agents' | 'web-gelistirme' | 'reklam-sosyal-medya' | 'ai-otomasyon' | 'web-uygulamasi',
  Record<'tr' | 'de' | 'en', { badge: string; title: string; subtitle: string; rows: MatrixRow[] }>
> = {
  'ai-agents': {
    tr: {
      badge: 'B2B Karar Matrisi & Satış Psikolojisi',
      title: 'Klasik Chatbotlar vs. StarWebFlow Otonom AI Çalışanları',
      subtitle: 'Neden basit şablonlar işe yaramaz? Karar vericilerin bilinçaltı şüpheleri ve kanıtlanmış mühendislik çözümü.',
      rows: [
        {
          traditional: 'Statik ve robotik yanıt veren hazır chatbot eklentileri.',
          doubt: '“Müşterim robotla konuştuğunu anlar ve markamın prestiji zedelenir mi?”',
          solution: 'Şirketinizin hafızasıyla eğitilmiş, marka dilinize sadık, insan akıcılığında konuşan çok dilli sesli ve yazılı AI temsilcileri.',
        },
        {
          traditional: 'Müşteri konuşmalarını OpenAI/Anthropic bulutuna gönderip dolara endeksli token faturası ödetmek.',
          doubt: '“Müşteri listem ve tekliflerim yabancı bulutlara sızarsa KVKK/DSGVO cezası yer miyiz?”',
          solution: 'Tier-3/Tier-4 dedike sunucunuzda (Frankfurt veya TR) çalışan yerel modeller. %100 veri izolasyonu ve sıfır token faturası.',
        },
        {
          traditional: 'Mesajı alıp ertesi gün satış ekibine e-posta atan pasif formlar.',
          doubt: '“Gece 02:00’de gelen sıcak müşteri sabaha kadar rakibe kaçar mı?”',
          solution: '0.8 saniyede canlı müşteri nitelendirme, otomatik PDF teklif gönderme ve doğrudan Google Takvime onaylı randevu işleme.',
        },
      ],
    },
    de: {
      badge: 'B2B Entscheidungsmatrix & Verkaufspsychologie',
      title: 'Klassische Chatbots vs. StarWebFlow Autonome KI-Mitarbeiter',
      subtitle: 'Warum starre Standard-Bots scheitern: Echte Bedenken von Entscheidern und unsere souveräne On-Premise-Lösung.',
      rows: [
        {
          traditional: 'Roboterhafte Standard-Chatbots mit starren Klick-Menüs.',
          doubt: '„Erkennen unsere B2B-Kunden sofort den Bot und leidet darunter unser Ruf?“',
          solution: 'Auf Ihre Firmendaten trainierte KI-Mitarbeiter mit menschlicher Sprachgewandtheit für Telefon, WhatsApp und Web.',
        },
        {
          traditional: 'Weitergabe sensibler Kundendaten an US-Cloud-Provider mit variablen Token-Gebühren.',
          doubt: '„Drohen uns DSGVO-Strafen, wenn Kundenchats auf US-Servern landen?“',
          solution: '100% DSGVO-konforme Architektur auf dedizierten Tier-4 Servern in Frankfurt. Vollständige Datenhoheit, feste Serverkosten.',
        },
        {
          traditional: 'E-Mail-Benachrichtigung an den Vertrieb erst am nächsten Werktag.',
          doubt: '„Verlieren wir Anfragen, die nachts oder am Wochenende eintreffen, an die Konkurrenz?“',
          solution: 'Reaktionszeit unter 0,8 Sekunden: Automatische Qualifizierung, Angebotserstellung und Terminbuchung im Kalender – 24/7.',
        },
      ],
    },
    en: {
      badge: 'B2B Decision Matrix & Sales Psychology',
      title: 'Traditional Chatbots vs. StarWebFlow Autonomous AI Agents',
      subtitle: 'Why rigid templates fail: Subconscious buyer doubts and our proven on-premise engineering solution.',
      rows: [
        {
          traditional: 'Rigid, robotic template chatbots with frustrating click trees.',
          doubt: '“Will high-ticket enterprise buyers feel alienated by an obvious bot?”',
          solution: 'Trained on your proprietary knowledge base with natural human fluency across phone, WhatsApp, and web.',
        },
        {
          traditional: 'Transmitting proprietary data to US AI clouds with unpredictable monthly token fees.',
          doubt: '“Are we risking GDPR compliance violations and IP leakage with third-party clouds?”',
          solution: '100% isolated deployment on dedicated Tier-4 VPS (Frankfurt/TR). Full data sovereignty with zero variable API token bills.',
        },
        {
          traditional: 'Passive contact forms forwarding leads to sales reps 24 hours later.',
          doubt: '“Are midnight high-value inbound leads bouncing straight to competitors?”',
          solution: '0.8s instant qualification, automated PDF quote dispatch, and two-way Google Calendar booking non-stop.',
        },
      ],
    },
  },

  'web-gelistirme': {
    tr: {
      badge: 'Hız & Dönüşüm Karar Matrisi',
      title: 'Geleneksel Web Siteleri vs. Sub-Second Next.js 14 Altyapısı',
      subtitle: 'Tasarım tek başına satış yapmaz: Sayfa açılış gecikmelerinin ciroya etkisi ve modern mühendislik yaklaşımı.',
      rows: [
        {
          traditional: 'WordPress ve ağır eklentili temalar (3–5 saniye açılış süresi).',
          doubt: '“Reklamlara on binlerce lira harcıyoruz, neden sitemizden beklediğimiz satış gelmiyor?”',
          solution: 'Next.js 14 App Router ile 0.8 saniyenin altında açılış (LCP). Google Core Web Vitals 100/100 tam puan.',
        },
        {
          traditional: 'Statik ve her tıklamada sayfayı yeniden yükleyen hantal mimari.',
          doubt: '“Müşteriler mobilde gezinirken donma yaşıyor, sepeti terk edip kaçıyor mu?”',
          solution: 'Edge CDN üzerinde anında sunulan sub-second mimari. Ziyaretçiyi sitede tutan ve dönüşümü 3.6 kat artıran hız.',
        },
        {
          traditional: 'Sadece görsel tasarıma odaklanan, dönüşüm hunisi ve teknik SEO barındırmayan siteler.',
          doubt: '“Sitemiz şık görünüyor ama Google’da ve ChatGPT aramalarında neden rakiplerin gerisindeyiz?”',
          solution: 'A+ Güvenlik başlıkları, JSON-LD Schema mimarisi ve Yapay Zeka Arama Motorları (GEO) optimizasyonuyla lider görünürlük.',
        },
      ],
    },
    de: {
      badge: 'Performance & Conversion-Matrix',
      title: 'Herkömmliche Agentur-Websites vs. Subsekunden Next.js 14 Plattformen',
      subtitle: 'Gutes Design reicht nicht aus: Warum Ladezeitverzögerungen Umsatz kosten und wie moderne Architektur skaliert.',
      rows: [
        {
          traditional: 'WordPress-Themes mit Dutzenden Plugins und 3 bis 5 Sekunden Ladezeit.',
          doubt: '„Wir investieren viel in Ads – warum springen Besucher ab, bevor die Seite lädt?“',
          solution: 'Next.js 14 mit LCP unter 0,8s. Perfekte Google Core Web Vitals (100/100) für maximale Werbe-Effizienz.',
        },
        {
          traditional: 'Langsame Seitenaufbauten, die bei jedem Klick den Server belasten.',
          doubt: '„Verlieren wir mobile Nutzer durch hakelige Bedienung und langsame Formulare?“',
          solution: 'Verteilte Edge-Infrastruktur ohne Verzögerung. 3,6-facher Conversion-Multiplikator durch blitzschnelle Interaktion.',
        },
        {
          traditional: 'Reines Oberflächendesign ohne technisches SEO und ohne AI-Search-Optimierung.',
          doubt: '„Warum ranken Wettbewerber bei Google und modernen KI-Suchen besser als wir?“',
          solution: 'A+ Sicherheits-Header, strukturierte Schema.org-Daten und GEO-Optimierung für Perplexity & ChatGPT.',
        },
      ],
    },
    en: {
      badge: 'Speed & Conversion Decision Matrix',
      title: 'Traditional Agency Websites vs. Sub-Second Next.js 14 Platforms',
      subtitle: 'Design alone does not sell: The financial impact of page latency and how our engineering drives revenue.',
      rows: [
        {
          traditional: 'Bloated WordPress templates with 3 to 5 second mobile loading times.',
          doubt: '“We pour budget into ad campaigns — why are bounce rates draining our ROI?”',
          solution: 'Next.js 14 App Router with sub-0.8s LCP and 100/100 Google Core Web Vitals to eliminate bounce friction.',
        },
        {
          traditional: 'Full page reloads causing mobile lag and high shopping cart drop-offs.',
          doubt: '“Are buyers abandoning checkout because our forms feel sluggish?”',
          solution: 'Pre-rendered Edge CDN architecture delivering instant 3.6x conversion lifts without mobile bottlenecks.',
        },
        {
          traditional: 'Pure visual decoration lacking semantic Schema architecture and AI Search readiness.',
          doubt: '“Why are competitors being cited by Google and ChatGPT over our brand?”',
          solution: 'Grade A+ security headers, full JSON-LD Schema markup, and Generative Engine Optimization (GEO) dominance.',
        },
      ],
    },
  },

  'ai-otomasyon': {
    tr: {
      badge: 'Operasyonel Verimlilik & ROI Matrisi',
      title: 'Manuel İş Yükü vs. StarWebFlow n8n & Kognitif İş Akışları',
      subtitle: 'Personelinizin vaktini alan angaryaları sonlandırın: İnsan hatası riskine karşı otopilot mimarisi.',
      rows: [
        {
          traditional: 'Formları, e-postaları ve siparişleri personele elle CRM ve Excel’e girdirmek.',
          doubt: '“Ekibimiz gün boyu kopyala-yapıştır yapmaktan asıl satış ve stratejiye vakit ayıramıyor mu?”',
          solution: 'n8n ve webhook boru hatlarıyla 0.14 saniyede hatasız CRM kaydı, otomatik fatura taslağı ve departman senkronizasyonu.',
        },
        {
          traditional: 'Farklı yazılımların (Muhasebe, CRM, WhatsApp) birbirinden kopuk çalışması.',
          doubt: '“Bir programdaki veri diğerine geçmediği için siparişler veya teklifler aksıyor mu?”',
          solution: 'Tüm sistemlerinizi çift yönlü REST API ve webhook ile bağlayan merkezi veri orkestrasyonu.',
        },
        {
          traditional: 'Teklif ve sözleşme hazırlamak için müşteriyi saatlerce veya günlerce bekletmek.',
          doubt: '“Müşteri teklifi beklerken heyecanını kaybedip başka bir firmaya mı yöneliyor?”',
          solution: 'Müşteri talebi geldiği an dinamik PDF teklif üreten ve WhatsApp/e-posta ile anında ileten otopilot mekanizması.',
        },
      ],
    },
    de: {
      badge: 'Effizienz- & Prozessmatrix',
      title: 'Manuelle Büroarbeit vs. StarWebFlow n8n Workflow-Automatisierung',
      subtitle: 'Beenden Sie zeitfressende Routinearbeiten: Wie n8n Pipelines menschliche Übertragungsfehler eliminieren.',
      rows: [
        {
          traditional: 'Manuelles Abtippen von Leads und Rechnungsdaten in CRM- und Excel-Listen.',
          doubt: '„Verbringt unser Team zu viele Stunden mit Routineaufgaben statt im echten Vertrieb?“',
          solution: 'n8n und Webhook-Pipelines: Automatisierte CRM-Anlage, Rechnungserstellung und Synchronisation in 0,14s.',
        },
        {
          traditional: 'Isolierte Insellösungen (ERP, Buchhaltung, WhatsApp) ohne direkte Schnittstellen.',
          doubt: '„Gehen Aufträge oder Kundenanfragen zwischen unverbundenen Tools verloren?“',
          solution: 'Zwei-Wege-REST-API-Integration: Alle Systeme kommunizieren fehlerfrei in Echtzeit miteinander.',
        },
        {
          traditional: 'Tage langes Warten auf maßgeschneiderte Angebote und Verträge.',
          doubt: '„Verlieren wir kaufbereite Leads, weil unsere Angebotserstellung zu lange dauert?“',
          solution: 'Vollautomatische PDF-Generierung und Versand in wenigen Sekunden direkt nach Kundenkontakt.',
        },
      ],
    },
    en: {
      badge: 'Efficiency & ROI Decision Matrix',
      title: 'Manual Repetitive Workloads vs. StarWebFlow Cognitive n8n Pipelines',
      subtitle: 'Eliminate administrative drag: Replace human copy-paste errors with automated event-driven workflows.',
      rows: [
        {
          traditional: 'Manually re-typing inbound forms, leads, and orders into CRM and spreadsheets.',
          doubt: '“Is our staff wasting 15+ hours weekly on data entry instead of revenue-generating work?”',
          solution: 'n8n and webhook pipelines qualifying leads, triggering invoice drafts, and syncing CRM in 0.14 seconds.',
        },
        {
          traditional: 'Siloed tools (ERP, accounting, WhatsApp, email) that don’t communicate with each other.',
          doubt: '“Are critical orders falling through the cracks due to disconnected software tools?”',
          solution: 'Bi-directional REST API integration unifying all tools into a single coherent business machine.',
        },
        {
          traditional: 'Delayed quote and contract preparation taking 24 to 48 hours.',
          doubt: '“Are prospective buyers going cold while waiting for our manual PDF quote?”',
          solution: 'Instant dynamic proposal engine dispatching customized PDFs via WhatsApp/Email in seconds.',
        },
      ],
    },
  },

  'web-uygulamasi': {
    tr: {
      badge: 'Yazılım Kalitesi & SaaS Matrisi',
      title: 'Kırılgan Hazır Çözümler vs. Özel B2B Portalları & SaaS Altyapısı',
      subtitle: 'Büyüyen operasyonlar hazır şablonlara sığmaz: DIN ISO 25010 standardında güvenli ve ölçeklenebilir yazılım.',
      rows: [
        {
          traditional: 'Aylık yüzlerce dolar ödenen, verilerinizi kısıtlayan yabancı SaaS yazılımları.',
          doubt: '“Kendi müşteri verilerimiz ve sistemlerimiz başka bir şirketin kontrolünde mi kalacak?”',
          solution: 'Mülkiyeti %100 şirketinize ait, kendi sunucunuzda çalışan, sınırsız kullanıcı ve işlem kapasiteli özel yazılım.',
        },
        {
          traditional: 'Excel ve WhatsApp üzerinden yürütülen karmaşık sipariş ve bayi süreçleri.',
          doubt: '“Hatalı siparişler ve karışan cari hesaplar yüzünden para kaybediyor muyuz?”',
          solution: 'Bayilerinizin ve kurumsal müşterilerinizin 7/24 şifreyle girdiği, canlı stok ve fatura takip edebildiği B2B portalı.',
        },
        {
          traditional: 'Hantal, güvenlik açıkları barındıran ve büyüdükçe kilitlenen altyapılar.',
          doubt: '“Kullanıcı sayımız 10 katına çıktığında sistemimiz çöker mi?”',
          solution: 'PostgreSQL, Prisma ve Next.js mikro-mimarisiyle DIN ISO 25010 kalite standartlarında, banka düzeyinde güvenli yapı.',
        },
      ],
    },
    de: {
      badge: 'Softwarequalität & Portal-Matrix',
      title: 'Starre Standard-SaaS vs. Maßgeschneiderte B2B-Kundenportale',
      subtitle: 'Wachsende Unternehmen brauchen maßgeschneiderte Lösungen nach DIN ISO 25010 Qualitätsstandards.',
      rows: [
        {
          traditional: 'Teure monatliche Lizenzgebühren für US-Tools, die sich nicht an Ihre Prozesse anpassen.',
          doubt: '„Bleiben unsere unternehmenskritischen Daten in der Hand fremder Plattformen?“',
          solution: '100% eigener Quellcode und Betrieb auf Ihren eigenen Servern ohne laufende Benutzer-Abonnements.',
        },
        {
          traditional: 'Unübersichtliche Bestellabläufe per Telefon, E-Mail und Excel-Tabellen.',
          doubt: '„Führen Übertragungsfehler und manuelle Abstimmungen zu Umsatzverlusten?“',
          solution: 'Geschütztes B2B-Portal mit rollenbasierter Rechteverwaltung (RBAC) für Bestellungen, Dokumente und Tracking.',
        },
        {
          traditional: 'Systeme, die bei steigendem Datenvolumen abstürzen oder Sicherheitsrisiken aufweisen.',
          doubt: '„Kann unsere Plattform skalieren, wenn unser Kundenstamm sich verdoppelt?“',
          solution: 'Hochgradig skalierbare Next.js- & PostgreSQL-Architektur mit A+ Sicherheitsrating und 99,98% Uptime-Garantie.',
        },
      ],
    },
    en: {
      badge: 'Software Architecture & Portal Matrix',
      title: 'Rigid Off-The-Shelf SaaS vs. Custom B2B Portals & Software',
      subtitle: 'Scaling operations outgrow generic tools: ISO 25010 grade engineering built for security and longevity.',
      rows: [
        {
          traditional: 'Expensive per-seat SaaS subscriptions locking your company data into proprietary silos.',
          doubt: '“Are we trapped in escalating licensing costs without owning our own core software?”',
          solution: '100% intellectual property ownership deployed on your dedicated infrastructure with zero per-user fees.',
        },
        {
          traditional: 'Messy dealer and client ordering handled over phone, email, and Excel sheets.',
          doubt: '“Are fulfillment mistakes and billing discrepancies eroding our profit margins?”',
          solution: 'Secure self-service client and dealer portals featuring real-time tracking, automated invoicing, and RBAC.',
        },
        {
          traditional: 'Fragile monolithic setups that buckle under concurrent traffic spikes.',
          doubt: '“Will our platform crash when our transaction volume multiplies 10x?”',
          solution: 'PostgreSQL, Prisma, and Next.js micro-architecture certified for DIN ISO 25010 performance and 99.98% uptime.',
        },
      ],
    },
  },

  'reklam-sosyal-medya': {
    tr: {
      badge: 'Büyüme Mühendisliği & ROAS Matrisi',
      title: 'Geleneksel Reklam Ajansları vs. StarWebFlow Algoritmik Büyüme',
      subtitle: 'Boşa harcanan tıklamalara son: Satışa dönüşmeyen trafik ciro kazandırmaz.',
      rows: [
        {
          traditional: 'Sadece "beğeni, gösterim ve tıklama" raporlayıp gerçek satış getirmeyen reklamlar.',
          doubt: '“Reklama bütçe döküyoruz ama kasaya giren ciro neden artmıyor?”',
          solution: 'Meta Conversions API (CAPI) ve sunucu taraflı takiple doğrudan CRM’e düşen nitelikli alıcı odaklı reklam mimarisi.',
        },
        {
          traditional: 'Ziyaretçiyi genel ve yavaş ana sayfaya yönlendirip parayı çöpe atmak.',
          doubt: '“Reklama tıklayanlar sayfayı okumadan neden 3 saniye içinde çıkıp gidiyor?”',
          solution: 'Doğrudan satın alma psikolojisine göre kurgulanmış, milisaniyelik açılan A/B testli özel landing page hunileri.',
        },
        {
          traditional: 'Eski nesil anahtar kelime SEO’sunda takılıp kalmak.',
          doubt: '“Müşterilerimiz artık ChatGPT ve Perplexity’ye soruyor; markamızı orada nasıl ilk sıraya çıkaracağız?”',
          solution: 'Yapay Zeka Arama Motorları Optimizasyonu (GEO) ile yapay zekaların sektörünüzde ilk tavsiye ettiği otorite marka konumu.',
        },
      ],
    },
    de: {
      badge: 'Wachstums-Engineering & ROAS-Matrix',
      title: 'Traditionelle Werbeagenturen vs. StarWebFlow Performance-Engineering',
      subtitle: 'Schluss mit verbranntem Budget: Klicks und Likes zahlen keine Rechnungen – qualifizierte Deals zählen.',
      rows: [
        {
          traditional: 'Agenturen, die nur Impressionen und Klicks melden, aber keine echten Kunden generieren.',
          doubt: '„Warum steigen unsere Werbekosten, während der tatsächliche Umsatz stagniert?“',
          solution: 'Server-Side Tracking (Meta CAPI) und intent-basierte Zielgruppenansprache mit Fokus auf verifizierte Deals.',
        },
        {
          traditional: 'Leiten von teurem Traffic auf langsame Standard-Startseiten ohne Verkaufspsychologie.',
          doubt: '„Warum springen mehr als 80% der gekauften Besucher sofort wieder ab?“',
          solution: 'Dedizierte High-Speed Landingpages mit psychologisch optimierter Struktur für bis zu 3,6x höhere Abschlussquoten.',
        },
        {
          traditional: 'Veraltetes Keyword-SEO ohne Berücksichtigung generativer KI-Suchmaschinen.',
          doubt: '„Wie stellen wir sicher, dass ChatGPT und Perplexity unser Unternehmen empfehlen?“',
          solution: 'Generative Engine Optimization (GEO): Ihre Marke als #1 Referenzquelle in modernen KI-Assistenten verankern.',
        },
      ],
    },
    en: {
      badge: 'Growth Engineering & ROAS Decision Matrix',
      title: 'Traditional Ad Agencies vs. StarWebFlow Algorithmic Growth',
      subtitle: 'Stop burning ad spend on vanity metrics: Clicks and impressions don’t pay bills — qualified buyers do.',
      rows: [
        {
          traditional: 'Reporting vanity metrics (likes, impressions) with zero accountability for pipeline revenue.',
          doubt: '“We are spending thousands on ads, but why aren’t qualified inquiries hitting our CRM?”',
          solution: 'Meta Conversions API (CAPI) and server-side tracking optimized strictly for qualified B2B buyers.',
        },
        {
          traditional: 'Dumping expensive traffic onto slow generic homepages without conversion funnels.',
          doubt: '“Why are 85% of paid visitors bouncing within 3 seconds of landing on our site?”',
          solution: 'Ultra-fast sub-second dedicated landing funnels engineered for psychological persuasion and up to 3.6x conversions.',
        },
        {
          traditional: 'Relying exclusively on legacy 2018 keyword SEO techniques.',
          doubt: '“How do we ensure our business is the #1 cited answer when prospects search Perplexity & ChatGPT?”',
          solution: 'Generative Engine Optimization (GEO) positioning your brand as the primary authority across AI search engines.',
        },
      ],
    },
  },
}

export default function SalesPsychologyMatrix({ serviceKey, accentColor }: SalesPsychologyMatrixProps) {
  const { language } = useLanguage()
  const lang = (language === 'de' ? 'de' : language === 'en' ? 'en' : 'tr') as 'tr' | 'de' | 'en'
  const data = MATRIX_DATA[serviceKey][lang] || MATRIX_DATA[serviceKey].tr

  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="py-16 sm:py-24 bg-white relative overflow-hidden border-t border-slate-200/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div
          className={`text-center max-w-3xl mx-auto mb-14 transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold mb-4 border shadow-2xs"
            style={{
              background: `${accentColor}10`,
              color: accentColor,
              borderColor: `${accentColor}30`,
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{data.badge}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-4 font-['Outfit']">
            {data.title}
          </h2>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {data.subtitle}
          </p>
        </div>

        {/* 3-Column Decision Matrix */}
        <div
          className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-all duration-700 delay-150 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Col 1: Traditional Agency */}
          <div className="rounded-3xl bg-slate-50 border border-slate-200/90 p-6 sm:p-8 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-slate-200">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <X className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-rose-600">
                    {lang === 'de' ? 'Klassischer Ansatz' : lang === 'en' ? 'Traditional Model' : 'Geleneksel Ajans Modeli'}
                  </h3>
                  <p className="text-sm font-bold text-slate-900">
                    {lang === 'de' ? 'Veraltete Methoden' : lang === 'en' ? 'Legacy Workflows' : 'Yüzeysel & Statik'}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {data.rows.map((row, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <span className="text-[11px] font-mono font-bold text-slate-400">0{idx + 1}.</span>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {row.traditional}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-200 text-center">
              <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                {lang === 'de' ? '⚠ Hohe Streuverluste' : lang === 'en' ? '⚠ High Waste & Risk' : '⚠ Ciro & Zaman Kaybı'}
              </span>
            </div>
          </div>

          {/* Col 2: The Decision Maker's Doubt */}
          <div className="rounded-3xl bg-amber-50/50 border border-amber-200/90 p-6 sm:p-8 flex flex-col justify-between shadow-xs relative">
            <div>
              <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-amber-200">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800">
                    {lang === 'de' ? 'Bedenken des Entscheiders' : lang === 'en' ? 'Executive Doubts' : 'Karar Vericinin İç Sesi'}
                  </h3>
                  <p className="text-sm font-bold text-slate-900">
                    {lang === 'de' ? 'Reale B2B-Hinterfragung' : lang === 'en' ? 'Subconscious Barriers' : 'Bilinçaltı Şüpheler'}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {data.rows.map((row, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <span className="text-[11px] font-mono font-bold text-amber-600">0{idx + 1}.</span>
                    <p className="text-xs sm:text-sm text-amber-950 font-medium italic leading-relaxed bg-white/70 p-3 rounded-xl border border-amber-200/70">
                      {row.doubt}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-amber-200 text-center">
              <span className="text-xs font-semibold text-amber-800 bg-amber-100/70 px-3 py-1 rounded-full border border-amber-300">
                {lang === 'de' ? '💡 Berechtigte Skepsis' : lang === 'en' ? '💡 Valid Business Doubts' : '💡 Çözülmesi Gereken Kilit Nokta'}
              </span>
            </div>
          </div>

          {/* Col 3: StarWebFlow Engineering Solution */}
          <div
            className="rounded-3xl bg-white p-6 sm:p-8 flex flex-col justify-between shadow-xl relative border-2"
            style={{ borderColor: accentColor }}
          >
            {/* Crown badge */}
            <div
              className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-[11px] font-bold tracking-wider uppercase shadow-md flex items-center gap-1.5"
              style={{ background: accentColor }}
            >
              <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
              <span>{lang === 'de' ? 'Souveräne Lösung' : lang === 'en' ? 'Engineering Proof' : 'StarWebFlow Standardı'}</span>
            </div>

            <div>
              <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-slate-100 mt-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold"
                  style={{ background: accentColor }}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                    StarWebFlow
                  </h3>
                  <p className="text-sm font-extrabold text-slate-900">
                    {lang === 'de' ? 'Verifizierte Ergebnisse' : lang === 'en' ? 'Engineered Certainty' : 'Kanıtlanmış Mühendislik'}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {data.rows.map((row, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <span className="text-[11px] font-mono font-bold" style={{ color: accentColor }}>
                      0{idx + 1}.
                    </span>
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-semibold">
                      {row.solution}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 text-center">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {lang === 'de' ? '✓ Messbarer ROI & Sicherheit' : lang === 'en' ? '✓ Guaranteed ROI & Privacy' : '✓ Ölçülebilir Ciro & Tam Güvenlik'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Callout Bar */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>%100 Gizlilik & DSGVO / KVKK Standardı</span>
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-white font-['Outfit']">
              {lang === 'de'
                ? 'Möchten Sie diese Architektur für Ihr Unternehmen prüfen?'
                : lang === 'en'
                ? 'Ready to evaluate this architecture for your business?'
                : 'Bu mimariyi firmanızın süreçlerine uyarlamak ister misiniz?'}
            </h4>
            <p className="text-xs sm:text-sm text-slate-300">
              {lang === 'de'
                ? '15-minütige kostenlose Architekturanalyse mit unserem leitenden Software-Architekten.'
                : lang === 'en'
                ? 'Complimentary 15-minute feasibility review directly with our senior software architect.'
                : 'Kıdemli yazılım mimarımızla 15 dakikalık ücretsiz fizibilite ve yol haritası görüşmesi.'}
            </p>
          </div>

          <Link
            href="/randevu"
            className="px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-lg transition-all flex items-center gap-2 hover:scale-105 shrink-0 cursor-pointer"
            style={{ background: accentColor }}
          >
            <Calendar className="w-4 h-4" />
            <span>
              {lang === 'de'
                ? 'Termin Vereinbaren'
                : lang === 'en'
                ? 'Schedule 15-Min Call'
                : '15 Dk Mimari Randevusu Al'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  )
}

