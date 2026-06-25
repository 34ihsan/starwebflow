'use client'

import { useState } from 'react'
import ServiceLayout from '@/components/services/ServiceLayout'
import ServiceHero from '@/components/services/ServiceHero'
import ValueMatrix from '@/components/services/ValueMatrix'
import ComparisonTable from '@/components/services/ComparisonTable'
import ServiceCTA from '@/components/services/ServiceCTA'
import ROITicker from '@/components/services/ROITicker'
import GlowCard from '@/components/ui/GlowCard'
import Button from '@/components/ui/Button'
import LeadFormModal from '@/components/services/LeadFormModal'
import { Monitor, TrendingUp, Users, Database, Zap, CheckCircle, BarChart3, Settings, Bell, ArrowRight, Loader2 } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

const ACCENT = '#06B6D4'

const terminalLogs = [
  { type: 'success' as const, text: 'API endpoint /dashboard: 200 OK — 14ms' },
  { type: 'info' as const,    text: 'Database query optimized: 340ms → 12ms' },
  { type: 'success' as const, text: 'Real-time WebSocket connection established' },
  { type: 'info' as const,    text: 'Multi-tenant auth: user@company.de — granted' },
  { type: 'success' as const, text: 'Chart data rendered: 50K datapoints — smooth' },
  { type: 'info' as const,    text: 'Stripe webhook: payment_success processed' },
  { type: 'success' as const, text: 'PDF report generated: 48 pages — 1.2s' },
  { type: 'warn' as const,    text: 'N+1 query detected → auto-optimized by ORM' },
  { type: 'success' as const, text: 'Role-based access: admin panel secured' },
  { type: 'info' as const,    text: 'CI/CD pipeline: deploy to Vercel — success' },
]

const localDict = {
  tr: {
    caseStudy: {
      company: 'FinTrack Analytics',
      industry: 'Fintech SaaS',
      metric: '+%340 trial signup',
      detail: 'Excel tabanlı iş süreçleri custom SaaS\'e taşındı. 6 ayda 280 kurumsal müşteri, €1.8M ARR.',
    },
    hero: {
      badge: 'Web Uygulamaları & SaaS Platformları',
      headline: 'Müşteriniz Görür,',
      headlineGradient: 'Siz İnşa Edersiniz',
      subheadline: 'Hâlâ Excel ile mi çalışıyorsunuz? Custom web uygulaması, SaaS dashboard ve B2B platformlarla operasyonunuzu dijitalleştirin.',
      painStatement: 'Ekibiniz her gün aynı veriyi 3 farklı dosyaya mı giriyor? Müşterileriniz size \'sisteminiz ne zaman çıkıyor?\' diye mi soruyor? Bu soruların cevabı artık \'hazır\'.',
      stat1: 'API Süresi',
      stat2: 'Uptime SLA',
      stat3: 'Ölçeklenme',
    },
    tickers: {
      t1: 'Custom App Projesi',
      t2: 'Uptime SLA Garantisi',
      t3: 'Ort. API Yanıt Süresi',
      t4: 'En Yüksek Müşteri ARR',
      t4Sub: 'Fintech SaaS',
    },
    generator: {
      title: 'Digital Twin Generator',
      subtitle: 'Projenizi kodlanmadan önce yaşayın',
      label: 'Uygulama Tipi Seçin',
      btnGenerating: 'Dijital İkiz Oluşturuluyor...',
      btnStart: 'Dijital İkizimi Göster',
      aiThinking: '[AI] Sektör verisi analiz ediliyor... arayüz bileşenleri seçiliyor...',
      previewNote: 'Bu, gerçek verilerinizle çalışan versiyonunuzun önizlemesidir.',
      sidebar: ['Dashboard', 'Analitik', 'Raporlar', 'Ayarlar'],
      modalTitle: 'Uygulama Prototipiniz Hazır!',
      modalSubtitle: (sector: string) => `${sector} için hazırladığımız dijital ikiz web uygulamasını açmak ve mimari / maliyet Lastenheft planını e-postanıza göndermek için bilgilerinizi doğrulayın.`,
      modalSource: 'Web Uygulaması Analizi',
      sectors: [
        { id: 'saas', label: 'SaaS Dashboard', icon: '📊' },
        { id: 'klinik', label: 'Klinik Yönetimi', icon: '🏥' },
        { id: 'lojistik', label: 'Lojistik Paneli', icon: '🚚' },
        { id: 'ecommerce', label: 'E-Commerce Admin', icon: '🛍' },
        { id: 'hr', label: 'İK & Bordro', icon: '👥' },
        { id: 'finans', label: 'Finans Platformu', icon: '💰' },
      ],
      dashboards: {
        saas: {
          title: 'SaaS Metrics Dashboard',
          metrics: [
            { label: 'MRR', value: '€42.800', change: '+18%' },
            { label: 'Churn Oranı', value: '%2.1', change: '-%0.4' },
            { label: 'Aktif Kullanıcı', value: '1.284', change: '+127' },
            { label: 'NPS Skoru', value: '68', change: '+4' },
          ],
        },
        klinik: {
          title: 'Klinik Yönetim Sistemi',
          metrics: [
            { label: 'Bugünkü Randevu', value: '47', change: '+8' },
            { label: 'Online Randevu', value: '%62', change: '+15%' },
            { label: 'Aylık Hasta', value: '892', change: '+134' },
            { label: 'Doluluk Oranı', value: '%88', change: '+12%' },
          ],
        },
        lojistik: {
          title: 'Lojistik Operasyon Paneli',
          metrics: [
            { label: 'Aktif Araç', value: '34', change: '+3' },
            { label: 'Zamanında Teslimat', value: '%96.4', change: '+2.1%' },
            { label: 'Aylık Sipariş', value: '3.248', change: '+21%' },
            { label: 'Müşteri Skoru', value: '4.8/5', change: '+0.3' },
          ],
        },
        ecommerce: {
          title: 'E-Commerce Admin Paneli',
          metrics: [
            { label: 'Günlük Sipariş', value: '284', change: '+42' },
            { label: 'Dönüşüm Oranı', value: '%4.2', change: '+1.1%' },
            { label: 'Aylık GMV', value: '€184.200', change: '+38%' },
            { label: 'Stok Uyarısı', value: '3 ürün', change: '' },
          ],
        },
        hr: {
          title: 'İK & Bordro Platformu',
          metrics: [
            { label: 'Toplam Çalışan', value: '127', change: '+8' },
            { label: 'İzin Talepleri', value: '14', change: '' },
            { label: 'Bordro Durumu', value: 'Tamamlandı', change: '' },
            { label: 'Performans Ortalaması', value: '%86', change: '+4%' },
          ],
        },
        finans: {
          title: 'Finans Yönetim Platformu',
          metrics: [
            { label: 'Toplam Varlık', value: '€2.4M', change: '+12%' },
            { label: 'Aylık Gider', value: '€48.200', change: '-%8%' },
            { label: 'Nakit Akışı', value: '+€124K', change: '' },
            { label: 'Bekleyen Fatura', value: '18 adet', change: '' },
          ],
        },
      }
    },
    whyUs: {
      title: 'Her Web Uygulamasında Standart',
      features: [
        { title: 'Multi-Tenant Mimari', desc: 'Her müşteri kendi izole ortamında çalışır. Veri sızıntısı imkânsız.' },
        { title: 'Gerçek Zamanlı Veriler', desc: 'WebSocket ile anlık güncelleme. Sayfa yenilemeden canlı dashboard.' },
        { title: 'Role-Based Access', desc: 'Admin, yönetici, kullanıcı — her role farklı yetki ve ekran.' },
        { title: 'Akıllı Bildirimler', desc: 'E-posta, SMS, push — kritik olaylar için anında uyarı sistemi.' },
        { title: 'Analitik Altyapısı', desc: 'Recharts/D3 ile interaktif grafikler. Verilerinizi gösteri haline getirin.' },
      ]
    },
    roi: {
      title: 'Yazılım ',
      titleHighlight: 'ROI Analizi',
      rows: [
        { metric: 'Veri Giriş Süresi', before: '3.5 saat/gün', after: '0 — Otomatik' },
        { metric: 'Raporlama Süresi', before: '2 gün/ay', after: '< 30 saniye' },
        { metric: 'Hata Oranı', before: '%14', after: '< %0.1' },
        { metric: 'Onboarding Süresi', before: '3 hafta', after: '1 gün' },
        { metric: 'Aylık Operasyonel Maliyet', before: '€12.000', after: '€3.200' },
      ]
    },
    comparison: {
      title: 'Off-the-Shelf vs ',
      titleHighlight: 'Custom App',
      rows: [
        { feature: 'Sektörünüze Uyum', traditional: 'Kısmi, eklenti gerekir', starwebflow: '%100 özel' },
        { feature: 'Aylık SaaS Maliyeti', traditional: '€200-800/kullanıcı', starwebflow: 'Sabit tek seferlik' },
        { feature: 'Veri Sahipliği', traditional: 'Satıcıda kalır', starwebflow: 'Tam size ait' },
        { feature: 'Entegrasyon', traditional: 'Sınırlı API', starwebflow: 'Her sisteme bağlanır' },
        { feature: 'Ölçeklenme', traditional: 'Paket yükseltmek gerekir', starwebflow: 'Altyapı ile büyür' },
        { feature: 'Marka & UX', traditional: 'Standart arayüz', starwebflow: 'Markanıza göre tasarım' },
      ]
    },
    cta: {
      headline: 'Dijital İkizinizi Gerçeğe Taşıyalım',
      subheadline: 'Fikrinizi dinleriz, Lastenheft hazırlarız, 2-8 haftada canlıya alırız.',
      urgencyText: 'Bu ay 2 web app geliştirme kapasitesi açık',
      primaryLabel: 'Ücretsiz Teknik Görüşme',
      secondaryLabel: 'Proje Taslağı Oluştur',
    }
  },
  en: {
    caseStudy: {
      company: 'FinTrack Analytics',
      industry: 'Fintech SaaS',
      metric: '+340% trial signup',
      detail: 'Excel-based business processes were moved to a custom SaaS. 280 corporate customers in 6 months, €1.8M ARR.',
    },
    hero: {
      badge: 'Web Applications & SaaS Platforms',
      headline: 'Your Customer Sees,',
      headlineGradient: 'You Build',
      subheadline: 'Still working with Excel? Digitalize your operations with custom web applications, SaaS dashboards, and B2B platforms.',
      painStatement: 'Does your team enter the same data into 3 different files every day? Do your customers ask you \'when is your system coming out?\' The answer to these questions is now \'ready\'.',
      stat1: 'API Time',
      stat2: 'Uptime SLA',
      stat3: 'Scaling',
    },
    tickers: {
      t1: 'Custom App Projects',
      t2: 'Uptime SLA Guarantee',
      t3: 'Avg. API Response Time',
      t4: 'Highest Client ARR',
      t4Sub: 'Fintech SaaS',
    },
    generator: {
      title: 'Digital Twin Generator',
      subtitle: 'Experience your project before it is coded',
      label: 'Select App Type',
      btnGenerating: 'Generating Digital Twin...',
      btnStart: 'Show My Digital Twin',
      aiThinking: '[AI] Analyzing sector data... selecting UI components...',
      previewNote: 'This is a preview of the version running with your actual data.',
      sidebar: ['Dashboard', 'Analytics', 'Reports', 'Settings'],
      modalTitle: 'Your App Prototype is Ready!',
      modalSubtitle: (sector: string) => `Verify your information to open the digital twin web application prepared for ${sector} and receive the architecture / cost Spec plan in your email.`,
      modalSource: 'Web Application Analysis',
      sectors: [
        { id: 'saas', label: 'SaaS Dashboard', icon: '📊' },
        { id: 'klinik', label: 'Clinic Management', icon: '🏥' },
        { id: 'lojistik', label: 'Logistics Panel', icon: '🚚' },
        { id: 'ecommerce', label: 'E-Commerce Admin', icon: '🛍' },
        { id: 'hr', label: 'HR & Payroll', icon: '👥' },
        { id: 'finans', label: 'Finance Platform', icon: '💰' },
      ],
      dashboards: {
        saas: {
          title: 'SaaS Metrics Dashboard',
          metrics: [
            { label: 'MRR', value: '€42,800', change: '+18%' },
            { label: 'Churn Rate', value: '2.1%', change: '-0.4%' },
            { label: 'Active Users', value: '1,284', change: '+127' },
            { label: 'NPS Score', value: '68', change: '+4' },
          ],
        },
        klinik: {
          title: 'Clinic Management System',
          metrics: [
            { label: 'Appointments Today', value: '47', change: '+8' },
            { label: 'Online Booking', value: '62%', change: '+15%' },
            { label: 'Monthly Patients', value: '892', change: '+134' },
            { label: 'Occupancy Rate', value: '88%', change: '+12%' },
          ],
        },
        lojistik: {
          title: 'Logistics Operations Panel',
          metrics: [
            { label: 'Active Vehicles', value: '34', change: '+3' },
            { label: 'On-Time Delivery', value: '96.4%', change: '+2.1%' },
            { label: 'Monthly Orders', value: '3,248', change: '+21%' },
            { label: 'Customer Score', value: '4.8/5', change: '+0.3' },
          ],
        },
        ecommerce: {
          title: 'E-Commerce Admin Panel',
          metrics: [
            { label: 'Daily Orders', value: '284', change: '+42' },
            { label: 'Conversion Rate', value: '4.2%', change: '+1.1%' },
            { label: 'Monthly GMV', value: '€184,200', change: '+38%' },
            { label: 'Stock Warning', value: '3 items', change: '' },
          ],
        },
        hr: {
          title: 'HR & Payroll Platform',
          metrics: [
            { label: 'Total Employees', value: '127', change: '+8' },
            { label: 'Leave Requests', value: '14', change: '' },
            { label: 'Payroll Status', value: 'Completed', change: '' },
            { label: 'Avg. Performance', value: '86%', change: '+4%' },
          ],
        },
        finans: {
          title: 'Finance Management Platform',
          metrics: [
            { label: 'Total Assets', value: '€2.4M', change: '+12%' },
            { label: 'Monthly Expense', value: '€48,200', change: '-8%' },
            { label: 'Net Cash Flow', value: '+€124K', change: '' },
            { label: 'Pending Invoices', value: '18 invoices', change: '' },
          ],
        },
      }
    },
    whyUs: {
      title: 'Standard in Every Web App',
      features: [
        { title: 'Multi-Tenant Architecture', desc: 'Each client operates in their own isolated environment. Data leakage is impossible.' },
        { title: 'Real-Time Data', desc: 'Instant updates with WebSockets. Live dashboard without page refresh.' },
        { title: 'Role-Based Access', desc: 'Admin, manager, user — different permissions and screens for each role.' },
        { title: 'Smart Notifications', desc: 'Email, SMS, push — instant alert system for critical events.' },
        { title: 'Analytics Infrastructure', desc: 'Interactive charts with Recharts/D3. Turn your data into a visual showcase.' },
      ]
    },
    roi: {
      title: 'Software ',
      titleHighlight: 'ROI Analysis',
      rows: [
        { metric: 'Data Entry Time', before: '3.5 hours/day', after: '0 — Automated' },
        { metric: 'Reporting Time', before: '2 days/month', after: '< 30 seconds' },
        { metric: 'Error Rate', before: '14%', after: '< 0.1%' },
        { metric: 'Onboarding Time', before: '3 weeks', after: '1 day' },
        { metric: 'Monthly Operational Cost', before: '€12,000', after: '€3,200' },
      ]
    },
    comparison: {
      title: 'Off-the-Shelf vs ',
      titleHighlight: 'Custom App',
      rows: [
        { feature: 'Alignment to Industry', traditional: 'Partial, plugins needed', starwebflow: '100% custom' },
        { feature: 'Monthly SaaS Cost', traditional: '€200-800/user', starwebflow: 'Fixed one-time' },
        { feature: 'Data Ownership', traditional: 'Stays with vendor', starwebflow: 'Fully yours' },
        { feature: 'Integration', traditional: 'Limited API', starwebflow: 'Connects to any system' },
        { feature: 'Scaling', traditional: 'Package upgrade required', starwebflow: 'Grows with infrastructure' },
        { feature: 'Brand & UX', traditional: 'Standard interface', starwebflow: 'Design custom to brand' },
      ]
    },
    cta: {
      headline: 'Let\'s Bring Your Digital Twin to Reality',
      subheadline: 'We listen to your idea, prepare a Spec document, and launch in 2-8 weeks.',
      urgencyText: '2 web app development slots open this month',
      primaryLabel: 'Free Technical Call',
      secondaryLabel: 'Generate Project Draft',
    }
  },
  de: {
    caseStudy: {
      company: 'FinTrack Analytics',
      industry: 'Fintech SaaS',
      metric: '+340% Trial-Anmeldungen',
      detail: 'Excel-basierte Geschäftsprozesse wurden in ein maßgeschneidertes SaaS überführt. 280 Firmenkunden in 6 Monaten, €1,8M ARR.',
    },
    hero: {
      badge: 'Webanwendungen & SaaS-Plattformen',
      headline: 'Ihr Kunde sieht es,',
      headlineGradient: 'Sie bauen es',
      subheadline: 'Arbeiten Sie immer noch mit Excel? Digitalisieren Sie Ihre Abläufe mit maßgeschneiderten Webanwendungen, SaaS-Dashboards und B2B-Plattformen.',
      painStatement: 'Gibt Ihr Team jeden Tag dieselben Daten in 3 verschiedene Dateien ein? Fragen Ihre Kunden Sie \'wann kommt Ihr System heraus?\' Die Antwort auf diese Fragen ist jetzt \'bereit\'.',
      stat1: 'API-Zeit',
      stat2: 'Uptime SLA',
      stat3: 'Skalierung',
    },
    tickers: {
      t1: 'Custom App-Projekte',
      t2: 'Uptime SLA Garantie',
      t3: 'Mttl. API-Antwortzeit',
      t4: 'Höchster ARR des Kunden',
      t4Sub: 'Fintech SaaS',
    },
    generator: {
      title: 'Digital-Twin-Generator',
      subtitle: 'Erleben Sie Ihr Projekt vor der Codierung',
      label: 'Anwendungstyp auswählen',
      btnGenerating: 'Digitaler Zwilling wird generiert...',
      btnStart: 'Meinen digitalen Zwilling anzeigen',
      aiThinking: '[KI] Branchendaten werden analysiert... UI-Komponenten werden ausgewählt...',
      previewNote: 'Dies ist eine Vorschau der Version, die mit Ihren tatsächlichen Daten läuft.',
      sidebar: ['Dashboard', 'Analytik', 'Berichte', 'Einstellungen'],
      modalTitle: 'Ihr Anwendungs-Prototyp ist bereit!',
      modalSubtitle: (sector: string) => `Bestätigen Sie Ihre Angaben, um die für ${sector} vorbereitete digitale Zwilling-Webanwendung zu öffnen und den Spec-Plan für Architektur / Kosten in Ihrer E-Mail zu erhalten.`,
      modalSource: 'Webanwendungsanalyse',
      sectors: [
        { id: 'saas', label: 'SaaS-Dashboard', icon: '📊' },
        { id: 'klinik', label: 'Klinikverwaltung', icon: '🏥' },
        { id: 'lojistik', label: 'Logistik-Panel', icon: '🚚' },
        { id: 'ecommerce', label: 'E-Commerce Admin', icon: '🛍' },
        { id: 'hr', label: 'HR & Gehaltsabrechnung', icon: '👥' },
        { id: 'finans', label: 'Finanzplattform', icon: '💰' },
      ],
      dashboards: {
        saas: {
          title: 'SaaS-Kennzahlen-Dashboard',
          metrics: [
            { label: 'MRR', value: '€42.800', change: '+18%' },
            { label: 'Churn-Rate', value: '2.1%', change: '-0.4%' },
            { label: 'Aktive Nutzer', value: '1.284', change: '+127' },
            { label: 'NPS-Score', value: '68', change: '+4' },
          ],
        },
        klinik: {
          title: 'Klinikverwaltungssystem',
          metrics: [
            { label: 'Heutige Termine', value: '47', change: '+8' },
            { label: 'Online-Buchung', value: '62%', change: '+15%' },
            { label: 'Monatliche Patienten', value: '892', change: '+134' },
            { label: 'Auslastungsquote', value: '88%', change: '+12%' },
          ],
        },
        lojistik: {
          title: 'Logistik-Betriebspanel',
          metrics: [
            { label: 'Aktive Fahrzeuge', value: '34', change: '+3' },
            { label: 'Pünktliche Lieferung', value: '96.4%', change: '+2.1%' },
            { label: 'Monatliche Aufträge', value: '3.248', change: '+21%' },
            { label: 'Kundenbewertung', value: '4.8/5', change: '+0.3' },
          ],
        },
        ecommerce: {
          title: 'E-Commerce Admin-Panel',
          metrics: [
            { label: 'Tägliche Bestellungen', value: '284', change: '+42' },
            { label: 'Conversion-Rate', value: '4.2%', change: '+1.1%' },
            { label: 'Monatliches GMV', value: '€184.200', change: '+38%' },
            { label: 'Bestandswarnung', value: '3 Produkte', change: '' },
          ],
        },
        hr: {
          title: 'HR & Gehaltsabrechnungsplattform',
          metrics: [
            { label: 'Mitarbeiter gesamt', value: '127', change: '+8' },
            { label: 'Urlaubsanträge', value: '14', change: '' },
            { label: 'Gehaltsabrechnung', value: 'Abgeschlossen', change: '' },
            { label: 'Mttl. Performance', value: '86%', change: '+4%' },
          ],
        },
        finans: {
          title: 'Finanzverwaltungsplattform',
          metrics: [
            { label: 'Gesamtvermögen', value: '€2.4M', change: '+12%' },
            { label: 'Monatliche Ausgaben', value: '€48.200', change: '-8%' },
            { label: 'Net Cashflow', value: '+€124K', change: '' },
            { label: 'Offene Rechnungen', value: '18 Rechnungen', change: '' },
          ],
        },
      }
    },
    whyUs: {
      title: 'Standard in jeder Web-App',
      features: [
        { title: 'Mandantenfähige Architektur', desc: 'Jeder Kunde arbeitet in seiner eigenen isolierten Umgebung. Datenlecks sind unmöglich.' },
        { title: 'Echtzeitdaten', desc: 'Sofortige Updates mit WebSockets. Live-Dashboard ohne Neuladen der Seite.' },
        { title: 'Rollenbasierter Zugriff', desc: 'Admin, Manager, Benutzer — unterschiedliche Berechtigungen und Bildschirme für jede Rolle.' },
        { title: 'Intelligente Benachrichtigungen', desc: 'E-Mail, SMS, Push — sofortiges Warnsystem für kritische Ereignisse.' },
        { title: 'Analyse-Infrastruktur', desc: 'Interaktive Diagramme mit Recharts/D3. Machen Sie Ihre Daten zu einer visuellen Show.' },
      ]
    },
    roi: {
      title: 'Software-',
      titleHighlight: 'ROI-Analyse',
      rows: [
        { metric: 'Dateneingabezeit', before: '3.5 Std./Tag', after: '0 — Automatisch' },
        { metric: 'Berichtszeit', before: '2 Tage/Monat', after: '< 30 Sekunden' },
        { metric: 'Fehlerrate', before: '14%', after: '< 0.1%' },
        { metric: 'Onboarding-Zeit', before: '3 Wochen', after: '1 Tag' },
        { metric: 'Monatliche Betriebskosten', before: '€12.000', after: '€3.200' },
      ]
    },
    comparison: {
      title: 'Off-the-Shelf vs. ',
      titleHighlight: 'Custom App',
      rows: [
        { feature: 'Anpassung an Ihre Branche', traditional: 'Teilweise, Plugins nötig', starwebflow: '100% maßgeschneidert' },
        { feature: 'Monatliche SaaS-Kosten', traditional: '€200-800/Nutzer', starwebflow: 'Einmaliger Festpreis' },
        { feature: 'Dateneigentum', traditional: 'Verbleibt beim Anbieter', starwebflow: 'Vollständig Ihres' },
        { feature: 'Integration', traditional: 'Eingeschränkte API', starwebflow: 'Verbindet mit jedem System' },
        { feature: 'Skalierung', traditional: 'Paket-Upgrade nötig', starwebflow: 'Wächst mit Infrastruktur' },
        { feature: 'Marke & UX', traditional: 'Standardoberfläche', starwebflow: 'Design nach Ihrer Marke' },
      ]
    },
    cta: {
      headline: 'Bringen wir Ihren digitalen Zwilling in die Realität',
      subheadline: 'Wir hören uns Ihre Idee an, bereiten ein Spec-Dokument vor und gehen in 2-8 Wochen live.',
      urgencyText: '2 Slots für Web-App-Entwicklung in diesem Monat offen',
      primaryLabel: 'Kostenlose technische Beratung',
      secondaryLabel: 'Projektentwurf erstellen',
    }
  }
}

function DigitalTwinGenerator() {
  const { language } = useLanguage()
  const dict = localDict[language] || localDict.tr
  
  const [selected, setSelected] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const [showLeadModal, setShowLeadModal] = useState(false)

  const generate = async () => {
    if (!selected) return
    setGenerating(true)
    setShowDashboard(false)
    await new Promise(r => setTimeout(r, 1800))
    setGenerating(false)
    setShowLeadModal(true)
  }

  const handleLeadSubmit = (leadData: { name: string; email: string }) => {
    setShowDashboard(true)
    setShowLeadModal(false)
  }

  const selectedIndex = selected ? localDict.tr.generator.sectors.findIndex(s => s.id === selected) : -1
  const localizedSector = selectedIndex !== -1 ? dict.generator.sectors[selectedIndex] : null
  const selectedSectorLabel = localizedSector ? localizedSector.label : ''

  // Localize dashboard metrics
  const getLocalizedDash = () => {
    if (!selected) return null
    const dashboards = dict.generator.dashboards
    const key = selected as keyof typeof dashboards
    return dashboards[key]
  }
  const dash = getLocalizedDash()

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#12121F]/80 backdrop-blur-sm overflow-hidden">
      <LeadFormModal
        isOpen={showLeadModal}
        title={dict.generator.modalTitle}
        subtitle={dict.generator.modalSubtitle(selectedSectorLabel)}
        source={dict.generator.modalSource}
        value={25000} // Custom estimated value
        onSubmitSuccess={handleLeadSubmit}
      />
      <div className="border-b border-white/[0.06] px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#06B6D4]/15 flex items-center justify-center">
          <Monitor className="w-4 h-4 text-[#06B6D4]" />
        </div>
        <div>
          <div className="text-sm font-semibold text-white">{dict.generator.title}</div>
          <div className="text-xs text-[#64748B]">{dict.generator.subtitle}</div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-5">
          <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3 block">
            {dict.generator.label}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {dict.generator.sectors.map((s, i) => {
              const trId = localDict.tr.generator.sectors[i].id
              return (
                <button
                  key={s.id}
                  onClick={() => { setSelected(trId); setShowDashboard(false) }}
                  className={`px-3 py-2.5 rounded-xl text-xs font-medium border transition-all text-left flex items-center gap-2 ${
                    selected === trId
                      ? 'bg-[#06B6D4]/15 border-[#06B6D4]/40 text-[#06B6D4]'
                      : 'border-white/[0.06] text-[#64748B] hover:border-white/20 hover:text-white'
                  }`}
                >
                  <span>{s.icon}</span> {s.label}
                </button>
              )
            })}
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={generate}
          disabled={!selected || generating}
          className="w-full mb-5"
          style={{ background: ACCENT, borderColor: ACCENT }}
        >
          {generating ? (
            <><Loader2 className="w-4 h-4 animate-spin" />{dict.generator.btnGenerating}</>
          ) : (
            <><Zap className="w-4 h-4" />{dict.generator.btnStart}</>
          )}
        </Button>

        {generating && (
          <div className="mb-4 text-center">
            <div className="text-xs text-[#475569] font-mono mb-2">
              {dict.generator.aiThinking}
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: '70%', background: ACCENT, animation: 'shimmer 1s linear infinite' }}
              />
            </div>
          </div>
        )}

        {showDashboard && dash && (
          <div style={{ animation: 'fadeInUp 0.5s ease both' }}>
            {/* Mock dashboard */}
            <div className="rounded-xl border border-white/[0.08] overflow-hidden">
              {/* Mock browser bar */}
              <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border-b border-white/[0.06]">
                <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]/60" />
                <div className="flex-1 mx-3 px-3 py-1 rounded-md bg-white/[0.04] text-[10px] text-[#334155] font-mono">
                  app.starwebflow.com/{selected}
                </div>
              </div>

              <div className="p-4" style={{ background: 'rgba(8,8,14,0.8)' }}>
                {/* Sidebar + content layout */}
                <div className="flex gap-3">
                  {/* Mock sidebar */}
                  <div className="w-24 shrink-0 space-y-1">
                    {dict.generator.sidebar.map((item, i) => {
                      const accentColor = ACCENT
                      return (
                        <div
                          key={i}
                          className="px-2 py-1.5 rounded-lg text-[10px] font-medium"
                          style={i === 0 ? { background: `${accentColor}20`, color: accentColor } : { color: '#475569' }}
                        >
                          {item}
                        </div>
                      )
                    })}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="text-xs font-bold text-white mb-3">{dash.title}</div>
                    <div className="grid grid-cols-2 gap-2">
                      {dash.metrics.map((m, i) => {
                        const isPositive = m.change ? !m.change.includes('-') : true
                        return (
                          <div
                            key={i}
                            className="p-2.5 rounded-lg border"
                            style={{
                              background: 'rgba(255,255,255,0.02)',
                              borderColor: 'rgba(255,255,255,0.06)',
                            }}
                          >
                            <div className="text-[10px] text-[#475569] mb-1">{m.label}</div>
                            <div className="text-sm font-bold text-white">{m.value}</div>
                            {m.change && (
                              <div
                                className="text-[10px] font-semibold mt-0.5"
                                style={{ color: isPositive ? '#10B981' : '#EF4444' }}
                              >
                                {m.change}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Mock chart bar */}
                    <div className="mt-3 p-2 rounded-lg border border-white/[0.04] bg-white/[0.01]">
                      <div className="text-[10px] text-[#475569] mb-2">{language === 'tr' ? 'Aylık Trend' : language === 'en' ? 'Monthly Trend' : 'Monatlicher Trend'}</div>
                      <div className="flex items-end gap-1 h-10">
                        {[40, 65, 45, 80, 60, 90, 75, 95, 70, 100, 85, 92].map((h, i) => {
                          const accentColor = ACCENT
                          return (
                            <div
                              key={i}
                              className="flex-1 rounded-sm"
                              style={{
                                height: `${h}%`,
                                background: `${accentColor}${i === 11 ? 'ff' : '50'}`,
                              }}
                            />
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-[#475569] mt-3 text-center">
              {dict.generator.previewNote}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function WebUygulamasiPage() {
  const { language } = useLanguage()
  const dict = localDict[language] || localDict.tr

  const caseStudyLocalized = {
    ...dict.caseStudy,
    accentColor: ACCENT
  }

  const featuresList = dict.whyUs.features.map((f, i) => {
    const icons = [Users, Database, Settings, Bell, BarChart3]
    const colors = [ACCENT, '#8B5CF6', '#10B981', '#F59E0B', '#EF4444']
    return {
      ...f,
      icon: icons[i] || Users,
      color: colors[i] || ACCENT
    }
  })

  return (
    <ServiceLayout terminalLogs={terminalLogs} caseStudy={caseStudyLocalized}>

      <ServiceHero
        badge={dict.hero.badge}
        headline={dict.hero.headline}
        headlineGradient={dict.hero.headlineGradient}
        subheadline={dict.hero.subheadline}
        painStatement={dict.hero.painStatement}
        accentColor={ACCENT}
        gradientFrom="#06B6D4"
        gradientTo="#8B5CF6"
        stats={[
          { value: '12ms', label: dict.hero.stat1, icon: Zap },
          { value: '99.9%', label: dict.hero.stat2, icon: CheckCircle },
          { value: '∞', label: dict.hero.stat3, icon: TrendingUp },
        ]}
        floatingBadges={[
          { label: 'Next.js App', icon: '▲', style: { top: '5%', right: '0%', animation: 'float 7s ease-in-out infinite' } },
          { label: 'PostgreSQL', icon: '🗄', style: { bottom: '8%', left: '2%', animation: 'float 5s ease-in-out infinite 1s' } },
          { label: 'SaaS Ready', icon: '🚀', style: { top: '40%', left: '-5%', animation: 'float 6s ease-in-out infinite 0.5s' } },
        ]}
        simulationId="simulation"
      />

      <section className="py-16 border-y border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <ROITicker value={60} suffix="+" label={dict.tickers.t1} accentColor={ACCENT} />
            <ROITicker value={99.9} suffix="%" label={dict.tickers.t2} accentColor={ACCENT} duration={1500} />
            <ROITicker value={12} suffix="ms" label={dict.tickers.t3} accentColor={ACCENT} duration={1200} />
            <ROITicker value={1800000} prefix="€" label={dict.tickers.t4} sublabel={dict.tickers.t4Sub} accentColor={ACCENT} />
          </div>
        </div>
      </section>

      <section id="simulation" className="section relative overflow-hidden">
        <div className="absolute inset-0 mesh-bg pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="tag-badge mb-4">🖥 Digital Twin</span>
            <h2 className="heading-lg text-white mt-4 mb-4">
              {language === 'tr' ? 'Projenizi ' : language === 'en' ? 'See Your Project ' : 'Sehen Sie Ihr Projekt '}
              <span className="gradient-text">{language === 'tr' ? 'Koddan Önce Görün' : language === 'en' ? 'Before Code' : 'vor der Codierung'}</span>
            </h2>
            <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto">
              {dict.generator.subtitle}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <DigitalTwinGenerator />
            <div className="space-y-4">
              <div className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider mb-4">
                {dict.whyUs.title}
              </div>
              {featuresList.map((f, i) => {
                const Icon = f.icon
                return (
                  <div key={i} className="flex gap-4 p-4 rounded-xl border border-white/[0.05] bg-white/[0.01] hover:border-white/10 transition-all">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${f.color}15` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: f.color }} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white mb-0.5">{f.title}</div>
                      <div className="text-xs text-[#64748B] leading-relaxed">{f.desc}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="heading-lg text-white mb-4">
              {dict.roi.title}<span className="gradient-text">{dict.roi.titleHighlight}</span>
            </h2>
          </div>
          <ValueMatrix
            accentColor={ACCENT}
            rows={dict.roi.rows.map((row, i) => ({
              ...row,
              delta: ['-%100', '-%99.9', '-%99', '-%90', '-%73'][i],
              deltaPositive: true
            }))}
          />
        </div>
      </section>

      <section className="section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="heading-lg text-white mb-4">
              {dict.comparison.title}<span className="gradient-text">{dict.comparison.titleHighlight}</span>
            </h2>
          </div>
          <ComparisonTable
            accentColor={ACCENT}
            rows={dict.comparison.rows.map((row, i) => {
              const featuresEN = [
                'Alignment to Industry', 'Monthly SaaS Cost', 'Data Ownership',
                'Integration', 'Scaling', 'Brand & UX'
              ];
              const featuresDE = [
                'Anpassung an Ihre Branche', 'Monatliche SaaS-Kosten', 'Dateneigentum',
                'Integration', 'Skalierung', 'Marke & UX'
              ];
              return {
                ...row,
                feature: language === 'tr' ? row.feature : language === 'en' ? featuresEN[i] : featuresDE[i]
              }
            })}
          />
        </div>
      </section>

      <ServiceCTA
        accentColor={ACCENT}
        headline={dict.cta.headline}
        subheadline={dict.cta.subheadline}
        urgencyText={dict.cta.urgencyText}
        primaryLabel={dict.cta.primaryLabel}
        secondaryLabel={dict.cta.secondaryLabel}
      />

    </ServiceLayout>
  )
}
