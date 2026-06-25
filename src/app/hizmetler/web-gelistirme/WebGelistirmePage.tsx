'use client'

import { useState } from 'react'
import ServiceLayout from '@/components/services/ServiceLayout'
import ServiceHero from '@/components/services/ServiceHero'
import ValueMatrix from '@/components/services/ValueMatrix'
import ComparisonTable from '@/components/services/ComparisonTable'
import ServiceCTA from '@/components/services/ServiceCTA'
import ROITicker from '@/components/services/ROITicker'
import GlowCard from '@/components/ui/GlowCard'
import LeadFormModal from '@/components/services/LeadFormModal'
import {
  Zap, Clock, TrendingUp, BarChart3, AlertCircle, ArrowRight, Loader2,
  ShieldCheck, Smartphone, Search
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { useLanguage } from '@/lib/i18n/LanguageContext'

const ACCENT = '#4F8EF7'

const terminalLogs = [
  { type: 'success' as const, text: 'Next.js 14 build compiled in 1.2s' },
  { type: 'info' as const,    text: 'Core Web Vitals: LCP 0.8s — Excellent' },
  { type: 'success' as const, text: 'Lighthouse score: Performance 98/100' },
  { type: 'info' as const,    text: 'CDN edge cache: HIT ratio 99.2%' },
  { type: 'success' as const, text: 'SSL/TLS A+ rating verified' },
  { type: 'info' as const,    text: 'SEO meta tags optimized — 47 keywords' },
  { type: 'success' as const, text: 'Mobile responsiveness: PASS (all breakpoints)' },
  { type: 'info' as const,    text: 'Bundle size optimized: 42kB → 18kB (-57%)' },
  { type: 'warn' as const,    text: 'Legacy site detected: FID 320ms — action needed' },
  { type: 'success' as const, text: 'Conversion tracking deployed via GTM' },
]

interface AnalysisResult {
  score: number
  problems: Array<{ label: string; value: string; severity: 'high' | 'medium' | 'low'; impact: string }>
  improvements: Array<{ label: string; value: string }>
}

const localDict = {
  tr: {
    caseStudy: {
      company: 'ModaHaus GmbH',
      industry: 'E-Commerce · Moda',
      metric: '3 ayda +%240 dönüşüm',
      detail: 'Yavaş WordPress sitesini Next.js ile yeniden inşa ettik. Sayfa yükleme 4.2s → 0.9s düştü, satışlar patladı.',
    },
    hero: {
      badge: 'Web Geliştirme & Web Sitesi',
      headline: 'Koddan Değil,',
      headlineGradient: 'Dönüşümden Başlıyoruz',
      subheadline: 'Next.js 14 ile milisaniyeler içinde yüklenen, Google\'da öne çıkan ve ziyaretçiyi müşteriye dönüştüren platformlar inşa ediyoruz.',
      painStatement: 'Siteniz her geçen saniyede müşteri kaybediyor. Araştırmalar gösteriyor: 3 saniyeden yavaş yüklenen sitelerin %53\'ü terk ediliyor. Siz şu an kaç müşteri kaybediyorsunuz?',
      stat1: 'Lighthouse',
      stat2: 'Yükleme',
      stat3: 'Dönüşüm',
    },
    tickers: {
      t1: 'Tamamlanan Proje',
      t1Sub: 'Son 3 yılda',
      t2: 'Ort. Dönüşüm Artışı',
      t2Sub: 'Yeni site sonrası',
      t3: 'Ort. Yükleme Süresi',
      t3Sub: 'Next.js ile',
      t4: 'Ort. Aylık Ek Gelir',
      t4Sub: 'Müşteri bazlı',
    },
    analyzer: {
      title: 'Conversion Analyzer',
      subtitle: 'Sitenizin gelir kaybını 30 saniyede analiz edin',
      activeText: 'Aktif',
      industriesLabel: '1. Sektörünüzü Seçin',
      btnAnalyzing: 'Analiz Ediliyor...',
      btnStart: 'Ücretsiz Analiz Başlat',
      progressScan: '[SCAN] Sayfa yapısı analiz ediliyor...',
      progressPerf: '[PERF] Core Web Vitals ölçülüyor...',
      progressConv: '[CONV] Dönüşüm yolları haritalanıyor...',
      progressAi: '[AI] Optimizasyon önerileri oluşturuluyor...',
      progressMsg: 'Analiz yapılıyor...',
      scoreLabel: 'Dönüşüm Skoru',
      scoreSubtitle: '⚠ Ciddi iyileştirme gerekiyor',
      scoreAvg: 'Sektör ortalaması: 71 puan',
      problemsLabel: 'Tespit Edilen Sorunlar',
      severityLabels: { high: 'Kritik', medium: 'Orta', low: 'Düşük' },
      improvementsLabel: '✦ StarWebFlow ile Beklenen Sonuçlar',
      btnAction: 'Bu Sorunu Çözmek İstiyorum',
      modalTitle: 'Dönüşüm Raporunuz Hazır!',
      modalSubtitle: (industry: string) => `${industry} sektörü için hazırladığımız gelir kaybı analizi ve 30 günlük Next.js optimizasyon planını açmak için bilgilerinizi doğrulayın.`,
      modalSource: 'Web Geliştirme Analizi',
      industries: ['E-Commerce', 'Klinik & Sağlık', 'SaaS & Yazılım', 'Lojistik', 'Hukuk & Danışmanlık', 'Eğitim'],
      database: {
        'E-Commerce': {
          score: 32,
          problems: [
            { label: 'Sayfa Yükleme Süresi', value: '4.8 saniye', severity: 'high' as const, impact: 'Her 1sn gecikme = %7 dönüşüm kaybı' },
            { label: 'Mobil Uyumluluk', value: 'Yetersiz', severity: 'high' as const, impact: 'Ziyaretçilerin %65\'i mobil kullanıcı' },
            { label: 'Checkout Adımları', value: '7 adım', severity: 'medium' as const, impact: 'Her ekstra adım %20 sepet terki artırır' },
          ],
          improvements: [
            { label: 'Yeni Yükleme Süresi', value: '0.9 saniye' },
            { label: 'Tahmini Dönüşüm Artışı', value: '+%180' },
            { label: 'Aylık Ek Gelir Potansiyeli', value: '€12.400' },
          ],
        },
        'Klinik & Sağlık': {
          score: 28,
          problems: [
            { label: 'Randevu Butonu Görünürlüğü', value: 'Zayıf CTA', severity: 'high' as const, impact: 'Potansiyel hastalar randevu alamıyor' },
            { label: 'Güven Sinyalleri', value: 'Eksik', severity: 'high' as const, impact: 'Sertifika ve diploma gösterimi yok' },
            { label: 'Sayfa Hızı', value: '5.2 saniye', severity: 'medium' as const, impact: 'Google sıralamada ceza' },
          ],
          improvements: [
            { label: 'Online Randevu Dönüşümü', value: '+%220' },
            { label: 'Yeni Hasta Başvurusu', value: '+35/ay' },
            { label: 'SEO Sıralama İyileşmesi', value: 'Top 5' },
          ],
        },
        'SaaS & Yazılım': {
          score: 41,
          problems: [
            { label: 'Free Trial CTA', value: 'Yetersiz', severity: 'high' as const, impact: 'Deneme başlatma oranı düşük' },
            { label: 'Pricing Sayfası', value: 'Karmaşık', severity: 'medium' as const, impact: 'Karar verme süresi uzuyor' },
            { label: 'Social Proof', value: 'Eksik', severity: 'medium' as const, impact: 'Güven oluşturulmuyor' },
          ],
          improvements: [
            { label: 'Trial Başlatma Oranı', value: '+%160' },
            { label: 'Churn Azalması', value: '-%30' },
            { label: 'MRR Artışı', value: '+€8.200' },
          ],
        },
        'Lojistik': {
          score: 25,
          problems: [
            { label: 'Teklif Formu', value: 'Yok / Karmaşık', severity: 'high' as const, impact: 'Lead kaybı oluyor' },
            { label: 'Rota Takip Sistemi', value: 'Entegre Değil', severity: 'high' as const, impact: 'Müşteri memnuniyeti düşük' },
            { label: 'Mobil Uygulama', value: 'Eksik', severity: 'medium' as const, impact: 'Sürücü-müşteri iletişimi zayıf' },
          ],
          improvements: [
            { label: 'Online Lead Artışı', value: '+%190' },
            { label: 'Operasyonel Verimlilik', value: '+%40' },
            { label: 'Müşteri Memnuniyeti', value: '4.8/5' },
          ],
        },
        'Hukuk & Danışmanlık': {
          score: 35,
          problems: [
            { label: 'Uzmanlık Alanı Görünürlüğü', value: 'Belirsiz', severity: 'high' as const, impact: 'Doğru müşteri gelemiyor' },
            { label: 'Online Danışmanlık', value: 'Yok', severity: 'high' as const, impact: 'Dijital gelir kaybı' },
            { label: 'Blog / SEO', value: 'Yetersiz', severity: 'medium' as const, impact: 'Organik trafik yok' },
          ],
          improvements: [
            { label: 'Nitelikli Lead Artışı', value: '+%210' },
            { label: 'Online Gelir', value: '+€6.800/ay' },
            { label: 'SEO Trafiği', value: '+%400' },
          ],
        },
        'Eğitim': {
          score: 29,
          problems: [
            { label: 'Kayıt/Kayıt Akışı', value: 'Çok Adımlı', severity: 'high' as const, impact: 'Öğrenci terki yüksek' },
            { label: 'Kurs İçerikleri', value: 'Erişilmez', severity: 'medium' as const, impact: 'Değer anlatılamıyor' },
            { label: 'Ödeme Entegrasyonu', value: 'Tek Seçenek', severity: 'medium' as const, impact: 'Satış engelleniyor' },
          ],
          improvements: [
            { label: 'Kayıt Oranı', value: '+%175' },
            { label: 'Tamamlanma Oranı', value: '+%60' },
            { label: 'Aylık Gelir Artışı', value: '+€9.500' },
          ],
        },
      }
    },
    whyUs: {
      title: 'Her Projede Teslim Edilenler',
      services: [
        { title: 'Lightning Performance', desc: 'Core Web Vitals optimizasyonu. Google sıralama avantajı.' },
        { title: 'Mobile-First Design', desc: 'Tüm cihazlarda mükemmel deneyim. %65 mobil trafik kayıplarını önler.' },
        { title: 'SEO Altyapısı', desc: 'Technical SEO, schema markup, sitemap. Organik trafik makinesi.' },
        { title: 'Güvenlik & KVKK', desc: 'SSL, HTTPS, güvenli form. Türkiye KVKK ve AB GDPR uyumlu.' },
        { title: 'Conversion Tracking', desc: 'Google Analytics 4, GTM, heatmap entegrasyonu.' },
      ]
    },
    portfolio: {
      badge: 'Portföy',
      title: 'Rakamlarla Konuşan ',
      titleHighlight: 'Projeler',
      items: [
        {
          name: 'TechVenture SaaS',
          category: 'SaaS Paneli',
          metric: '+%340 Trial',
          description: 'Karmaşık B2B SaaS paneli. Real-time analitik, multi-tenant mimari.',
        },
        {
          name: 'LuxModa E-Store',
          category: 'E-Ticaret',
          metric: '€2.1M GMV',
          description: 'Lüks moda e-ticaret sitesi. 50.000+ ürün, AI öneri motoru.',
        },
        {
          name: 'KlinikPro',
          category: 'Sağlık Platformu',
          metric: '12K randevu/ay',
          description: 'Çok branşlı klinik yönetim sistemi. KVKK uyumlu hasta portalı.',
        },
      ]
    },
    roi: {
      title: 'Yatırımınızın ',
      titleHighlight: 'Karşılığı',
      rows: [
        { metric: 'Sayfa Yükleme Süresi', before: '4.2 saniye', after: '0.9 saniye' },
        { metric: 'Mobil Dönüşüm Oranı', before: '%1.2', after: '%4.1' },
        { metric: 'Bounce Rate', before: '%72', after: '%31' },
        { metric: 'Aylık Organik Trafik', before: '1.200', after: '8.400' },
        { metric: 'Google Lighthouse Skoru', before: '41/100', after: '98/100' },
        { metric: 'Aylık Gelir', before: '€8.000', after: '€21.000' },
      ]
    },
    comparison: {
      title: 'Farkı ',
      titleHighlight: 'Kendiniz Görün',
      badge: 'Neden StarWebFlow?',
      rows: [
        { feature: 'Teslimat Süresi', traditional: '8-12 hafta', starwebflow: '2-4 hafta' },
        { feature: 'Performance Optimizasyon', traditional: false, starwebflow: true },
        { feature: 'SEO Altyapısı (Teknik)', traditional: false, starwebflow: true },
        { feature: 'Mobile-First Geliştirme', traditional: 'Opsiyonel', starwebflow: 'Standart' },
        { feature: 'Conversion Rate Tracking', traditional: false, starwebflow: true },
        { feature: 'AI İçerik Entegrasyonu', traditional: false, starwebflow: true },
        { feature: 'Canlı Lastenheft Belgesi', traditional: false, starwebflow: true },
        { feature: 'Aylık Performans Raporu', traditional: false, starwebflow: true },
      ]
    },
    cta: {
      headline: 'Dönüşüm Makinenizi Kuralım',
      subheadline: 'Ücretsiz 30 dakikalık teknik analiz ile sitenizin kaybettirdiği geliri hesaplayalım.',
      urgencyText: 'Bu ay son 2 web projesi kapasitesi',
      primaryLabel: 'Ücretsiz Analiz Randevusu',
      secondaryLabel: 'Proje Taslağı Oluştur',
    }
  },
  en: {
    caseStudy: {
      company: 'ModaHaus GmbH',
      industry: 'E-Commerce · Fashion',
      metric: '+240% conversion in 3 months',
      detail: 'We rebuilt their slow WordPress site with Next.js. Page load dropped from 4.2s to 0.9s, sales skyrocketed.',
    },
    hero: {
      badge: 'Web Development & Website',
      headline: 'We Start From',
      headlineGradient: 'Conversion, Not Code',
      subheadline: 'We build platforms with Next.js 14 that load in milliseconds, stand out on Google, and convert visitors into customers.',
      painStatement: 'Your website is losing customers every second. Research shows: 53% of websites loading slower than 3 seconds are abandoned. How many customers are you losing right now?',
      stat1: 'Lighthouse',
      stat2: 'Load Time',
      stat3: 'Conversion',
    },
    tickers: {
      t1: 'Completed Projects',
      t1Sub: 'Last 3 years',
      t2: 'Avg. Conversion Increase',
      t2Sub: 'After launching new site',
      t3: 'Avg. Load Time',
      t3Sub: 'With Next.js',
      t4: 'Avg. Monthly Extra Revenue',
      t4Sub: 'Client-based',
    },
    analyzer: {
      title: 'Conversion Analyzer',
      subtitle: 'Analyze your site\'s revenue loss in 30 seconds',
      activeText: 'Active',
      industriesLabel: '1. Select Your Industry',
      btnAnalyzing: 'Analyzing...',
      btnStart: 'Start Free Analysis',
      progressScan: '[SCAN] Analyzing page structure...',
      progressPerf: '[PERF] Measuring Core Web Vitals...',
      progressConv: '[CONV] Mapping conversion pathways...',
      progressAi: '[AI] Generating optimization recommendations...',
      progressMsg: 'Analyzing in progress...',
      scoreLabel: 'Conversion Score',
      scoreSubtitle: '⚠ Major improvements required',
      scoreAvg: 'Industry average: 71 points',
      problemsLabel: 'Identified Issues',
      severityLabels: { high: 'Critical', medium: 'Medium', low: 'Low' },
      improvementsLabel: '✦ Expected Results with StarWebFlow',
      btnAction: 'I Want to Solve This Issue',
      modalTitle: 'Your Conversion Report is Ready!',
      modalSubtitle: (industry: string) => `Verify your information to unlock the revenue loss analysis and 30-day Next.js optimization plan we prepared for the ${industry} sector.`,
      modalSource: 'Web Development Analysis',
      industries: ['E-Commerce', 'Clinic & Health', 'SaaS & Software', 'Logistics', 'Law & Consulting', 'Education'],
      database: {
        'E-Commerce': {
          score: 32,
          problems: [
            { label: 'Page Load Time', value: '4.8 seconds', severity: 'high' as const, impact: 'Every 1s delay = 7% conversion loss' },
            { label: 'Mobile Responsiveness', value: 'Poor', severity: 'high' as const, impact: '65% of visitors are mobile users' },
            { label: 'Checkout Steps', value: '7 steps', severity: 'medium' as const, impact: 'Each extra step increases cart abandonment by 20%' },
          ],
          improvements: [
            { label: 'New Load Time', value: '0.9 seconds' },
            { label: 'Estimated Conversion Increase', value: '+180%' },
            { label: 'Monthly Extra Revenue Potential', value: '€12,400' },
          ],
        },
        'Clinic & Health': {
          score: 28,
          problems: [
            { label: 'Appointment Button Visibility', value: 'Weak CTA', severity: 'high' as const, impact: 'Potential patients cannot book appointments' },
            { label: 'Trust Signals', value: 'Missing', severity: 'high' as const, impact: 'No certifications or qualifications shown' },
            { label: 'Page Speed', value: '5.2 seconds', severity: 'medium' as const, impact: 'Google ranking penalty' },
          ],
          improvements: [
            { label: 'Online Appointment Conversion', value: '+220%' },
            { label: 'New Patient Inquiries', value: '+35/month' },
            { label: 'SEO Ranking Improvement', value: 'Top 5' },
          ],
        },
        'SaaS & Software': {
          score: 41,
          problems: [
            { label: 'Free Trial CTA', value: 'Weak', severity: 'high' as const, impact: 'Low trial signup rate' },
            { label: 'Pricing Page', value: 'Complex', severity: 'medium' as const, impact: 'Prolonged decision-making process' },
            { label: 'Social Proof', value: 'Missing', severity: 'medium' as const, impact: 'Fails to build trust' },
          ],
          improvements: [
            { label: 'Trial Signup Rate', value: '+160%' },
            { label: 'Churn Reduction', value: '-30%' },
            { label: 'MRR Growth', value: '+€8,200' },
          ],
        },
        'Logistics': {
          score: 25,
          problems: [
            { label: 'Quote Form', value: 'None / Complex', severity: 'high' as const, impact: 'Lead leakages occurring' },
            { label: 'Route Tracking System', value: 'Not Integrated', severity: 'high' as const, impact: 'Low customer satisfaction' },
            { label: 'Mobile App', value: 'Missing', severity: 'medium' as const, impact: 'Weak driver-client communication' },
          ],
          improvements: [
            { label: 'Online Lead Increase', value: '+190%' },
            { label: 'Operational Efficiency', value: '+40%' },
            { label: 'Customer Satisfaction', value: '4.8/5' },
          ],
        },
        'Law & Consulting': {
          score: 35,
          problems: [
            { label: 'Visibility of Expertise Areas', value: 'Unclear', severity: 'high' as const, impact: 'Attracting wrong client profiles' },
            { label: 'Online Consultation', value: 'None', severity: 'high' as const, impact: 'Loss of digital revenue' },
            { label: 'Blog / SEO', value: 'Insufficient', severity: 'medium' as const, impact: 'No organic traffic' },
          ],
          improvements: [
            { label: 'Qualified Lead Increase', value: '+210%' },
            { label: 'Online Revenue', value: '+€6,800/month' },
            { label: 'SEO Traffic', value: '+400%' },
          ],
        },
        'Education': {
          score: 29,
          problems: [
            { label: 'Registration Flow', value: 'Multi-step', severity: 'high' as const, impact: 'High student drop-off rate' },
            { label: 'Course Contents', value: 'Inaccessible', severity: 'medium' as const, impact: 'Value proposition not conveyed' },
            { label: 'Payment Integration', value: 'Single Option', severity: 'medium' as const, impact: 'Hinders purchases' },
          ],
          improvements: [
            { label: 'Registration Rate', value: '+175%' },
            { label: 'Completion Rate', value: '+60%' },
            { label: 'Monthly Revenue Growth', value: '+€9,500' },
          ],
        },
      }
    },
    whyUs: {
      title: 'Delivered in Every Project',
      services: [
        { title: 'Lightning Performance', desc: 'Core Web Vitals optimization. Google ranking advantage.' },
        { title: 'Mobile-First Design', desc: 'Flawless experience across all devices. Prevents 65% mobile traffic losses.' },
        { title: 'SEO Infrastructure', desc: 'Technical SEO, schema markup, sitemap. Organic traffic machine.' },
        { title: 'Security & Legal Compliance', desc: 'SSL, HTTPS, secure forms. Turkey KVKK and EU GDPR compliant.' },
        { title: 'Conversion Tracking', desc: 'Google Analytics 4, GTM, heatmap integration.' },
      ]
    },
    portfolio: {
      badge: 'Portfolio',
      title: 'Projects that Speak in ',
      titleHighlight: 'Numbers',
      items: [
        {
          name: 'TechVenture SaaS',
          category: 'SaaS Dashboard',
          metric: '+340% Trials',
          description: 'Sophisticated B2B SaaS dashboard. Real-time analytics, multi-tenant architecture.',
        },
        {
          name: 'LuxModa E-Store',
          category: 'E-Commerce',
          metric: '€2.1M GMV',
          description: 'Luxury fashion e-commerce. 50,000+ products, AI recommendation engine.',
        },
        {
          name: 'KlinikPro',
          category: 'Health Platform',
          metric: '12K appointments/mo',
          description: 'Multi-specialty clinic management system. KVKK-compliant patient portal.',
        },
      ]
    },
    roi: {
      title: 'Return on ',
      titleHighlight: 'Investment',
      rows: [
        { metric: 'Page Load Time', before: '4.2 seconds', after: '0.9 seconds' },
        { metric: 'Mobile Conversion Rate', before: '1.2%', after: '4.1%' },
        { metric: 'Bounce Rate', before: '72%', after: '31%' },
        { metric: 'Monthly Organic Traffic', before: '1,200', after: '8,400' },
        { metric: 'Google Lighthouse Score', before: '41/100', after: '98/100' },
        { metric: 'Monthly Revenue', before: '€8,000', after: '€21,000' },
      ]
    },
    comparison: {
      title: 'See the Difference ',
      titleHighlight: 'Yourself',
      badge: 'Why StarWebFlow?',
      rows: [
        { feature: 'Delivery Time', traditional: '8-12 weeks', starwebflow: '2-4 weeks' },
        { feature: 'Performance Optimization', traditional: false, starwebflow: true },
        { feature: 'SEO Infrastructure (Technical)', traditional: false, starwebflow: true },
        { feature: 'Mobile-First Development', traditional: 'Optional', starwebflow: 'Standard' },
        { feature: 'Conversion Rate Tracking', traditional: false, starwebflow: true },
        { feature: 'AI Content Integration', traditional: false, starwebflow: true },
        { feature: 'Live Spec Document', traditional: false, starwebflow: true },
        { feature: 'Monthly Performance Report', traditional: false, starwebflow: true },
      ]
    },
    cta: {
      headline: 'Let\'s Build Your Conversion Machine',
      subheadline: 'Calculate the revenue lost by your website with a free 30-minute technical analysis.',
      urgencyText: 'Only 2 web project slots left this month',
      primaryLabel: 'Free Analysis Booking',
      secondaryLabel: 'Generate Project Draft',
    }
  },
  de: {
    caseStudy: {
      company: 'ModaHaus GmbH',
      industry: 'E-Commerce · Mode',
      metric: '+240% Conversion in 3 Monaten',
      detail: 'Wir haben ihre langsame WordPress-Website mit Next.js neu aufgebaut. Die Ladezeit sank von 4,2s auf 0,9s, die Verkäufe stiegen rasant.',
    },
    hero: {
      badge: 'Webentwicklung & Website',
      headline: 'Wir starten bei der',
      headlineGradient: 'Conversion, nicht beim Code',
      subheadline: 'Wir bauen Plattformen mit Next.js 14, die in Millisekunden laden, bei Google hervorstechen und Besucher in Kunden verwandeln.',
      painStatement: 'Ihre Website verliert jede Sekunde Kunden. Untersuchungen zeigen: 53% der Websites, die länger als 3 Sekunden laden, werden abgebrochen. Wie viele Kunden verlieren Sie gerade?',
      stat1: 'Lighthouse',
      stat2: 'Ladezeit',
      stat3: 'Conversion',
    },
    tickers: {
      t1: 'Abgeschlossene Projekte',
      t1Sub: 'Letzte 3 Jahre',
      t2: 'Mttl. Conversion-Steigerung',
      t2Sub: 'Nach Relaunch der Website',
      t3: 'Mttl. Ladezeit',
      t3Sub: 'Mit Next.js',
      t4: 'Mttl. monatliche Zusatzeinnahmen',
      t4Sub: 'Kundenbasiert',
    },
    analyzer: {
      title: 'Conversion-Analysator',
      subtitle: 'Analysieren Sie den Umsatzverlust Ihrer Website in 30 Sekunden',
      activeText: 'Aktiv',
      industriesLabel: '1. Wählen Sie Ihre Branche',
      btnAnalyzing: 'Wird analysiert...',
      btnStart: 'Kostenlose Analyse starten',
      progressScan: '[SCAN] Seitenstruktur wird analysiert...',
      progressPerf: '[PERF] Core Web Vitals werden gemessen...',
      progressConv: '[CONV] Konversionspfade werden abgebildet...',
      progressAi: '[AI] Optimierungsempfehlungen werden generiert...',
      progressMsg: 'Analyse läuft...',
      scoreLabel: 'Conversion-Score',
      scoreSubtitle: '⚠ Dringender Optimierungsbedarf',
      scoreAvg: 'Branchenvergleich: 71 Punkte',
      problemsLabel: 'Identifizierte Probleme',
      severityLabels: { high: 'Kritisch', medium: 'Mittel', low: 'Niedrig' },
      improvementsLabel: '✦ Erwartete Ergebnisse mit StarWebFlow',
      btnAction: 'Ich möchte dieses Problem lösen',
      modalTitle: 'Ihr Conversion-Bericht ist bereit!',
      modalSubtitle: (industry: string) => `Bestätigen Sie Ihre Angaben, um die Umsatzverlustanalyse und den 30-Tage-Next.js-Optimierungsplan freizuschalten, den wir für die Branche ${industry} vorbereitet haben.`,
      modalSource: 'Webentwicklungsanalyse',
      industries: ['E-Commerce', 'Klinik & Gesundheit', 'SaaS & Software', 'Logistik', 'Recht & Beratung', 'Bildung'],
      database: {
        'E-Commerce': {
          score: 32,
          problems: [
            { label: 'Seitenladezeit', value: '4,8 Sekunden', severity: 'high' as const, impact: 'Jede 1s Verzögerung = 7% Conversion-Verlust' },
            { label: 'Mobile Optimierung', value: 'Ungenügend', severity: 'high' as const, impact: '65% der Besucher sind mobile Nutzer' },
            { label: 'Bestellschritte', value: '7 Schritte', severity: 'medium' as const, impact: 'Jeder zusätzliche Schritt erhöht Warenkorb-Abbrüche um 20%' },
          ],
          improvements: [
            { label: 'Neue Ladezeit', value: '0,9 Sekunden' },
            { label: 'Geschätzte Conversion-Steigerung', value: '+180%' },
            { label: 'Monatliches Zusatzumsatzpotenzial', value: '€12.400' },
          ],
        },
        'Klinik & Gesundheit': {
          score: 28,
          problems: [
            { label: 'Sichtbarkeit des Termin-Buttons', value: 'Schwacher CTA', severity: 'high' as const, impact: 'Potenzielle Patienten können keine Termine buchen' },
            { label: 'Vertrauenssignale', value: 'Fehlen', severity: 'high' as const, impact: 'Keine Zertifikate oder Qualifikationen angezeigt' },
            { label: 'Seitengeschwindigkeit', value: '5,2 Sekunden', severity: 'medium' as const, impact: 'Google-Ranking-Abstrafung' },
          ],
          improvements: [
            { label: 'Online-Termin-Conversion', value: '+220%' },
            { label: 'Neue Patientenanfragen', value: '+35/Monat' },
            { label: 'SEO-Ranking-Verbesserung', value: 'Top 5' },
          ],
        },
        'SaaS & Software': {
          score: 41,
          problems: [
            { label: 'Kostenlose Testversion CTA', value: 'Schwach', severity: 'high' as const, impact: 'Niedrige Test-Anmelderate' },
            { label: 'Preisseite', value: 'Komplex', severity: 'medium' as const, impact: 'Verzögerter Entscheidungsprozess' },
            { label: 'Social Proof', value: 'Fehlt', severity: 'medium' as const, impact: 'Baut kein Vertrauen auf' },
          ],
          improvements: [
            { label: 'Test-Anmelderate', value: '+160%' },
            { label: 'Churn-Reduzierung', value: '-30%' },
            { label: 'MRR-Wachstum', value: '+€8.200' },
          ],
        },
        'Logistik': {
          score: 25,
          problems: [
            { label: 'Angebotsformular', value: 'Keines / Komplex', severity: 'high' as const, impact: 'Lead-Verluste treten auf' },
            { label: 'Routenverfolgungssystem', value: 'Nicht integriert', severity: 'high' as const, impact: 'Geringe Kundenzufriedenheit' },
            { label: 'Mobile App', value: 'Fehlt', severity: 'medium' as const, impact: 'Schwache Kommunikation Fahrer-Kunde' },
          ],
          improvements: [
            { label: 'Zunahme von Online-Leads', value: '+190%' },
            { label: 'Betriebliche Effizienz', value: '+40%' },
            { label: 'Kundenzufriedenheit', value: '4.8/5' },
          ],
        },
        'Recht & Beratung': {
          score: 35,
          problems: [
            { label: 'Sichtbarkeit der Fachgebiete', value: 'Unklar', severity: 'high' as const, impact: 'Zieht falsche Kundenprofile an' },
            { label: 'Online-Beratung', value: 'Keine', severity: 'high' as const, impact: 'Verlust von digitalen Einnahmen' },
            { label: 'Blog / SEO', value: 'Ungenügend', severity: 'medium' as const, impact: 'Kein organischer Traffic' },
          ],
          improvements: [
            { label: 'Zunahme qualifizierter Leads', value: '+210%' },
            { label: 'Online-Umsatz', value: '+€6.800/Monat' },
            { label: 'SEO-Traffic', value: '+400%' },
          ],
        },
        'Bildung': {
          score: 29,
          problems: [
            { label: 'Registrierungsablauf', value: 'Mehrstufig', severity: 'high' as const, impact: 'Hohe Abbruchquote der Studenten' },
            { label: 'Kursinhalte', value: 'Unzugänglich', severity: 'medium' as const, impact: 'Nutzenversprechen wird nicht vermittelt' },
            { label: 'Zahlungsintegration', value: 'Einzige Option', severity: 'medium' as const, impact: 'Verhindert Käufe' },
          ],
          improvements: [
            { label: 'Registrierungsrate', value: '+175%' },
            { label: 'Abschlussrate', value: '+60%' },
            { label: 'Monatliches Umsatzwachstum', value: '+€9.500' },
          ],
        },
      }
    },
    whyUs: {
      title: 'In jedem Projekt geliefert',
      services: [
        { title: 'Lightning Performance', desc: 'Core Web Vitals Optimierung. Google Ranking Vorteil.' },
        { title: 'Mobile-First Design', desc: 'Makellose Erfahrung auf allen Geräten. Verhindert 65% mobile Ladeverluste.' },
        { title: 'SEO-Infrastruktur', desc: 'Technisches SEO, Schema Markup, Sitemap. Organische Traffic-Maschine.' },
        { title: 'Sicherheit & Datenschutz', desc: 'SSL, HTTPS, sichere Formulare. Konform mit DSGVO und KVKK.' },
        { title: 'Conversion-Tracking', desc: 'Google Analytics 4, GTM, Heatmap-Integration.' },
      ]
    },
    portfolio: {
      badge: 'Portfolio',
      title: 'Projekte, die in ',
      titleHighlight: 'Zahlen sprechen',
      items: [
        {
          name: 'TechVenture SaaS',
          category: 'SaaS-Dashboard',
          metric: '+340% Testversionen',
          description: 'Anspruchsvolles B2B-SaaS-Dashboard. Echtzeit-Analysen, mandantenfähige Architektur.',
        },
        {
          name: 'LuxModa E-Store',
          category: 'E-Commerce',
          metric: '€2.1M GMV',
          description: 'Luxusmode-E-Commerce. 50.000+ Produkte, KI-Empfehlungs-Engine.',
        },
        {
          name: 'KlinikPro',
          category: 'Gesundheitsplattform',
          metric: '12K Termine/Monat',
          description: 'Klinikverwaltungssystem für mehrere Fachbereiche. DSGVO/KVKK-konformes Patientenportal.',
        },
      ]
    },
    roi: {
      title: 'Investitions-',
      titleHighlight: 'Rendite',
      rows: [
        { metric: 'Seitenladezeit', before: '4.2 Sekunden', after: '0.9 Sekunden' },
        { metric: 'Mobile Conversion-Rate', before: '1.2%', after: '4.1%' },
        { metric: 'Absprungrate', before: '72%', after: '31%' },
        { metric: 'Monatlicher organischer Traffic', before: '1.200', after: '8.400' },
        { metric: 'Google Lighthouse Score', before: '41/100', after: '98/100' },
        { metric: 'Monatsumsatz', before: '€8.000', after: '€21.000' },
      ]
    },
    comparison: {
      title: 'Sehen Sie selbst ',
      titleHighlight: 'den Unterschied',
      badge: 'Warum StarWebFlow?',
      rows: [
        { feature: 'Lieferzeit', traditional: '8-12 Wochen', starwebflow: '2-4 Wochen' },
        { feature: 'Performance-Optimierung', traditional: false, starwebflow: true },
        { feature: 'SEO-Infrastruktur (Technisch)', traditional: false, starwebflow: true },
        { feature: 'Mobile-First-Entwicklung', traditional: 'Optional', starwebflow: 'Standard' },
        { feature: 'Conversion-Rate-Tracking', traditional: false, starwebflow: true },
        { feature: 'KI-Inhaltsintegration', traditional: false, starwebflow: true },
        { feature: 'Live Spec-Dokument', traditional: false, starwebflow: true },
        { feature: 'Monatlicher Performance-Bericht', traditional: false, starwebflow: true },
      ]
    },
    cta: {
      headline: 'Lassen Sie uns Ihre Conversion-Maschine bauen',
      subheadline: 'Berechnen Sie den Umsatzverlust Ihrer Website mit einer kostenlosen 30-minütigen technischen Analyse.',
      urgencyText: 'Nur noch 2 Slots für Webprojekte in diesem Monat frei',
      primaryLabel: 'Kostenlose Analyse buchen',
      secondaryLabel: 'Projektentwurf erstellen',
    }
  }
}

function ConversionAnalyzer() {
  const { language } = useLanguage()
  const dict = localDict[language] || localDict.tr
  
  const [selected, setSelected] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [progress, setProgress] = useState(0)
  const [showLeadModal, setShowLeadModal] = useState(false)

  const analyze = async () => {
    if (!selected) return
    setAnalyzing(true)
    setResult(null)
    setProgress(0)

    const steps = [15, 35, 55, 72, 88, 100]
    for (const step of steps) {
      await new Promise(r => setTimeout(r, 380))
      setProgress(step)
    }
    await new Promise(r => setTimeout(r, 200))
    setShowLeadModal(true)
  }

  const handleLeadSubmit = (leadData: { name: string; email: string }) => {
    if (selected) {
      // Find matching key in dict database
      const db = dict.analyzer.database
      // We map selector index to prevent string mismatch issues
      const TurkishIndustries = localDict.tr.analyzer.industries;
      const index = TurkishIndustries.indexOf(selected);
      const industryKeys = ['E-Commerce', 'Klinik & Sağlık', 'SaaS & Yazılım', 'Lojistik', 'Hukuk & Danışmanlık', 'Eğitim'];
      const currentKey = industryKeys[index] || 'E-Commerce';
      
      const localizedDb = dict.analyzer.database;
      const keys = Object.keys(localizedDb) as Array<keyof typeof localizedDb>;
      const selectedDb = localizedDb[keys[index] || 'E-Commerce'];
      
      setResult(selectedDb)
    }
    setShowLeadModal(false)
    setAnalyzing(false)
  }

  const severityColors = {
    high:   { bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)',   text: '#EF4444' },
    medium: { bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)',  text: '#F59E0B' },
    low:    { bg: 'rgba(79,142,247,0.08)',  border: 'rgba(79,142,247,0.2)',  text: '#4F8EF7' },
  }

  return (
    <div className="relative rounded-2xl border border-white/[0.06] bg-[#12121F]/80 backdrop-blur-sm overflow-hidden">
      <LeadFormModal
        isOpen={showLeadModal}
        title={dict.analyzer.modalTitle}
        subtitle={dict.analyzer.modalSubtitle(selected || '')}
        source={dict.analyzer.modalSource}
        value={15000}
        onSubmitSuccess={handleLeadSubmit}
      />
      {/* Header */}
      <div className="border-b border-white/[0.06] px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#4F8EF7]/15 flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-[#4F8EF7]" />
        </div>
        <div>
          <div className="text-sm font-semibold text-white">{dict.analyzer.title}</div>
          <div className="text-xs text-[#64748B]">{dict.analyzer.subtitle}</div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-xs text-[#10B981]">{dict.analyzer.activeText}</span>
        </div>
      </div>

      <div className="p-6">
        {/* Step 1: Industry selection */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">
            {dict.analyzer.industriesLabel}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {dict.analyzer.industries.map((ind, i) => {
              // Bind using the TR index so we can map easily
              const trIndustry = localDict.tr.analyzer.industries[i];
              return (
                <button
                  key={ind}
                  onClick={() => { setSelected(trIndustry); setResult(null) }}
                  className={`px-3 py-2.5 rounded-xl text-xs font-medium border transition-all duration-200 text-left ${
                    selected === trIndustry
                      ? 'bg-[#4F8EF7]/15 border-[#4F8EF7]/40 text-[#4F8EF7]'
                      : 'border-white/[0.06] text-[#64748B] hover:border-white/20 hover:text-white'
                  }`}
                >
                  {ind}
                </button>
              )
            })}
          </div>
        </div>

        {/* Analyze button */}
        <Button
          variant="primary"
          size="md"
          onClick={analyze}
          disabled={!selected || analyzing}
          className="w-full mb-6"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {dict.analyzer.btnAnalyzing}
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              {dict.analyzer.btnStart}
            </>
          )}
        </Button>

        {/* Progress bar */}
        {analyzing && (
          <div className="mb-6">
            <div className="flex justify-between text-xs text-[#64748B] mb-2">
              <span>{dict.analyzer.progressMsg}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, background: '#4F8EF7' }}
              />
            </div>
            <div className="mt-2 text-xs text-[#475569] font-mono">
              {progress < 35 && dict.analyzer.progressScan}
              {progress >= 35 && progress < 65 && dict.analyzer.progressPerf}
              {progress >= 65 && progress < 90 && dict.analyzer.progressConv}
              {progress >= 90 && dict.analyzer.progressAi}
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={{ animation: 'fadeInUp 0.5s ease both' }}>
            {/* Score */}
            <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="relative w-16 h-16">
                <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15" fill="none"
                    stroke={result.score < 40 ? '#EF4444' : '#F59E0B'}
                    strokeWidth="3"
                    strokeDasharray={`${result.score * 0.942} 94.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{result.score}</span>
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-white mb-1">{dict.analyzer.scoreLabel}</div>
                <div className="text-xs text-[#EF4444] font-medium">{dict.analyzer.scoreSubtitle}</div>
                <div className="text-xs text-[#64748B] mt-0.5">{dict.analyzer.scoreAvg}</div>
              </div>
            </div>

            {/* Problems */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">
                {dict.analyzer.problemsLabel}
              </div>
              <div className="space-y-2">
                {result.problems.map((p, i) => {
                  const sev = severityColors[p.severity]
                  const sevLabel = dict.analyzer.severityLabels[p.severity]
                  return (
                    <div
                      key={i}
                      className="p-3 rounded-xl border flex items-start gap-3"
                      style={{ background: sev.bg, borderColor: p.severity === 'high' ? 'rgba(239,68,68,0.2)' : p.severity === 'medium' ? 'rgba(245,158,11,0.2)' : 'rgba(79,142,247,0.2)' }}
                    >
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: sev.text }} />
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-semibold text-white">{p.label}</span>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                            style={{ color: sev.text, background: `${sev.text}15` }}
                          >
                            {sevLabel}
                          </span>
                        </div>
                        <div className="text-xs text-[#94A3B8]">{p.value} · {p.impact}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Improvements */}
            <div
              className="p-4 rounded-xl border"
              style={{ background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.2)' }}
            >
              <div className="text-xs font-semibold text-[#10B981] uppercase tracking-wider mb-3">
                {dict.analyzer.improvementsLabel}
              </div>
              <div className="space-y-2">
                {result.improvements.map((imp, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs text-[#94A3B8]">{imp.label}</span>
                    <span className="text-xs font-bold text-[#10B981]">{imp.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              className="w-full mt-4"
              onClick={() => {
                const el = document.getElementById('contact')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
                else window.location.href = '/#contact'
              }}
            >
              {dict.analyzer.btnAction}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function WebGelistirmePage() {
  const { language } = useLanguage()
  const dict = localDict[language] || localDict.tr

  const caseStudyLocalized = {
    ...dict.caseStudy,
    accentColor: ACCENT
  }

  const portfolioItems = dict.portfolio.items.map((item, i) => {
    const original = localDict.tr.portfolio.items[i];
    // Map colors, icons, and tech stacks from the original index
    const colors = ['#4F8EF7', '#8B5CF6', '#10B981']
    const techStacks = [
      ['Next.js', 'Prisma', 'Stripe'],
      ['Next.js', 'Shopify API', 'Vercel'],
      ['React', 'Node.js', 'PostgreSQL']
    ]
    return {
      ...item,
      color: colors[i] || '#4F8EF7',
      tech: techStacks[i] || []
    }
  })

  const servicesList = dict.whyUs.services.map((item, i) => {
    const icons = [Zap, Smartphone, Search, ShieldCheck, BarChart3]
    const colors = ['#4F8EF7', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B']
    return {
      ...item,
      icon: icons[i] || Zap,
      color: colors[i] || '#4F8EF7'
    }
  })

  return (
    <ServiceLayout terminalLogs={terminalLogs} caseStudy={caseStudyLocalized}>

      {/* ─── HERO ─── */}
      <ServiceHero
        badge={dict.hero.badge}
        headline={dict.hero.headline}
        headlineGradient={dict.hero.headlineGradient}
        subheadline={dict.hero.subheadline}
        painStatement={dict.hero.painStatement}
        accentColor={ACCENT}
        gradientFrom="#4F8EF7"
        gradientTo="#06B6D4"
        stats={[
          { value: '%98', label: dict.hero.stat1, icon: Zap },
          { value: '0.9s', label: dict.hero.stat2, icon: Clock },
          { value: '3x', label: dict.hero.stat3, icon: TrendingUp },
        ]}
        floatingBadges={[
          { label: 'Next.js 14', icon: '▲', style: { top: '5%', right: '0%', animation: 'float 7s ease-in-out infinite' } },
          { label: 'LCP: 0.9s', icon: '⚡', style: { bottom: '8%', left: '2%', animation: 'float 5s ease-in-out infinite 1s' } },
          { label: 'SEO Score 98', icon: '🔍', style: { top: '40%', left: '-5%', animation: 'float 6s ease-in-out infinite 0.5s' } },
        ]}
        simulationId="simulation"
      />

      {/* ─── ROI TICKERS ─── */}
      <section className="py-16 border-y border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <ROITicker value={98} suffix="+" label={dict.tickers.t1} sublabel={dict.tickers.t1Sub} accentColor={ACCENT} />
            <ROITicker value={240} suffix="%" label={dict.tickers.t2} sublabel={dict.tickers.t2Sub} accentColor={ACCENT} />
            <ROITicker value={0.9} suffix="s" label={dict.tickers.t3} sublabel={dict.tickers.t3Sub} accentColor={ACCENT} duration={1500} />
            <ROITicker value={12400} prefix="€" label={dict.tickers.t4} sublabel={dict.tickers.t4Sub} accentColor={ACCENT} />
          </div>
        </div>
      </section>

      {/* ─── SIMULATION ─── */}
      <section id="simulation" className="section relative overflow-hidden">
        <div className="absolute inset-0 mesh-bg pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="tag-badge mb-4">🔬 {language === 'tr' ? 'Canlı Simülasyon' : language === 'en' ? 'Live Simulation' : 'Live-Simulation'}</span>
            <h2 className="heading-lg text-white mt-4 mb-4">
              {language === 'tr' ? 'Sitenizin ' : language === 'en' ? 'See the ' : 'Erkennen Sie die '}
              <span className="gradient-text">{language === 'tr' ? 'Gerçek Maliyetini' : language === 'en' ? 'Real Cost' : 'echten Kosten'}</span>
              {language === 'tr' ? ' Görün' : language === 'en' ? ' of Your Site' : ' Ihrer Website'}
            </h2>
            <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto">
              {dict.analyzer.subtitle}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <ConversionAnalyzer />

            {/* Right: What we deliver */}
            <div className="space-y-4">
              <div className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider mb-4">{dict.whyUs.title}</div>
              {servicesList.map((item, i) => {
                const Icon = item.icon
                return (
                  <div key={i} className="flex gap-4 p-4 rounded-xl border border-white/[0.05] bg-white/[0.01] hover:border-white/10 transition-all">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${item.color}15` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: item.color }} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white mb-0.5">{item.title}</div>
                      <div className="text-xs text-[#64748B] leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── PORTFOLIO ─── */}
      <section className="section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="tag-badge mb-4">{dict.portfolio.badge}</span>
            <h2 className="heading-lg text-white mt-4 mb-4">
              {dict.portfolio.title}<span className="gradient-text">{dict.portfolio.titleHighlight}</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {portfolioItems.map((item, i) => (
              <GlowCard key={i} glowColor="blue" className="p-6 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white"
                    style={{ background: `${item.color}20`, border: `1px solid ${item.color}30` }}
                  >
                    {item.name.charAt(0)}
                  </div>
                  <span
                    className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{ color: item.color, background: `${item.color}15` }}
                  >
                    {item.metric}
                  </span>
                </div>
                <div className="text-sm font-semibold text-white mb-1">{item.name}</div>
                <div className="text-xs text-[#64748B] mb-3">{item.category}</div>
                <p className="text-xs text-[#94A3B8] leading-relaxed mb-4 flex-1">{item.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {item.tech.map(t => (
                    <span key={t} className="text-[10px] px-2 py-1 rounded bg-white/5 text-[#64748B] font-mono">
                      {t}
                    </span>
                  ))}
                </div>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* ─── VALUE MATRIX ─── */}
      <section className="section">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="tag-badge mb-4">ROI {language === 'tr' ? 'Analizi' : language === 'en' ? 'Analysis' : 'Analyse'}</span>
            <h2 className="heading-lg text-white mt-4 mb-4">
              {dict.roi.title}<span className="gradient-text">{dict.roi.titleHighlight}</span>
            </h2>
          </div>
          <ValueMatrix
            accentColor={ACCENT}
            rows={dict.roi.rows.map((row, i) => ({
              ...row,
              delta: ['-%79', '+%242', '-%57', '+%600', '+%139', '+%162'][i],
              deltaPositive: true
            }))}
          />
        </div>
      </section>

      {/* ─── COMPARISON ─── */}
      <section className="section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="tag-badge mb-4">{dict.comparison.badge}</span>
            <h2 className="heading-lg text-white mt-4 mb-4">
              {dict.comparison.title}<span className="gradient-text">{dict.comparison.titleHighlight}</span>
            </h2>
          </div>
          <ComparisonTable
            accentColor={ACCENT}
            rows={dict.comparison.rows.map((row, i) => {
              const featuresEN = [
                'Delivery Time', 'Performance Optimization', 'SEO Infrastructure (Technical)',
                'Mobile-First Development', 'Conversion Rate Tracking', 'AI Content Integration',
                'Live Spec Document', 'Monthly Performance Report'
              ];
              const featuresDE = [
                'Lieferzeit', 'Performance-Optimierung', 'SEO-Infrastruktur (Technisch)',
                'Mobile-First-Entwicklung', 'Conversion-Rate-Tracking', 'KI-Inhaltsintegration',
                'Live Spec-Dokument', 'Monatlicher Performance-Bericht'
              ];
              return {
                ...row,
                feature: language === 'tr' ? row.feature : language === 'en' ? featuresEN[i] : featuresDE[i]
              }
            })}
          />
        </div>
      </section>

      {/* ─── CTA ─── */}
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
