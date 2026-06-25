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
import { Megaphone, TrendingUp, Zap, Target, BarChart3, Sparkles, Loader2, CheckCircle } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

const ACCENT = '#F59E0B'

const terminalLogs = [
  { type: 'success' as const, text: 'META campaign optimized: ROAS 4.2x → 6.1x' },
  { type: 'info' as const,    text: 'A/B test running: creative-v3 vs creative-v4' },
  { type: 'success' as const, text: 'AI copy generated: 12 variations — deployed' },
  { type: 'info' as const,    text: 'Audience lookalike: 2.1M reach — active' },
  { type: 'success' as const, text: 'Google Smart Bidding: CPA reduced by 34%' },
  { type: 'info' as const,    text: 'Instagram reel: 284K views — organic' },
  { type: 'success' as const, text: 'Retargeting: 127 cart abandonments recovered' },
  { type: 'warn' as const,    text: 'Ad frequency > 4 — rotating creatives now' },
  { type: 'success' as const, text: 'Monthly report generated: €48K ROAS delivered' },
  { type: 'info' as const,    text: 'LinkedIn: 3.2K impressions — decision-makers' },
]

const localDict = {
  tr: {
    caseStudy: {
      company: 'SportMax E-Store',
      industry: 'Spor & Outdoor',
      metric: '6.4x ROAS — 90 günde',
      detail: 'Dağınık bütçeyi AI optimize kampanyaya çevirdik. €12K bütçeden €76.8K gelir. CPA -%58.',
    },
    hero: {
      badge: 'Reklam & Sosyal Medya',
      headline: 'Bütçeniz Gidiyor,',
      headlineGradient: 'Dönüşüm Gelmiyor mu?',
      subheadline: 'AI optimize Meta/Google Ads ve otonom içerik üretim hattı ile reklam harcamanızın her Euro\'sunu 4.8x\'e çeviriyoruz.',
      painStatement: 'Reklama para harcıyorsunuz ama kimin tıkladığını, neden satın almadığını bilmiyorsunuz. Tahmin üzerine kurulu kampanyalar bütçenizi yakar. Veriye dayalı büyüme başka türlü çalışır.',
      stat1: 'Ort. ROAS',
      stat2: 'CPA Azalma',
      stat3: 'Şeffaf',
    },
    tickers: {
      t1: 'Ortalama ROAS',
      t1Sub: 'Tüm müşteriler',
      t2: 'CPA Azalması',
      t2Sub: 'İlk 90 günde',
      t3: 'En Yüksek Aylık Gelir',
      t3Sub: '€12K bütçeyle',
      t4: 'Organik TikTok View',
      t4Sub: 'Tek içerik',
    },
    generator: {
      title: 'Creative Generator',
      subtitle: 'Anında platforma özel reklam üretimi',
      brandLabel: '1. Marka / Ürün Adı',
      brandPlaceholder: 'Örn: SportMax, KlinikPro, ModaHaus...',
      platformLabel: '2. Platform Seçin',
      btnGenerating: 'AI Reklam Üretiyor...',
      btnGenerate: 'Reklam Üret',
      aiThinking: '[AI] Marka analizi... hedef kitle belirleniyor... copy optimize ediliyor...',
      previewTitle: 'Reklam Önizlemesi',
      sponsored: 'Sponsorlu',
      ctrLabel: 'Tahmini CTR',
      roasLabel: 'Hedef ROAS',
      cpaLabel: 'Hedef CPA',
      modalTitle: 'Reklam Stratejiniz Hazır!',
      modalSubtitle: (brand: string, platform: string) => `${brand} markası için ${platform} platformuna özel hazırladığımız AI reklam kopya ve stratejilerini açmak, 30 günlük bütçe planını e-postanıza göndermek için bilgilerinizi doğrulayın.`,
      modalSource: 'Reklam Sosyal Analizi',
    },
    whyUs: {
      title: 'Neden AI-Destekli Reklam?',
      platformsTitle: 'Aktif Olduğumuz Platformlar',
      services: [
        { title: 'AI Hedefleme', desc: 'Lookalike audience, retargeting, intent signals. Bütçeniz doğru kişiye ulaşır.' },
        { title: 'Otomatik İçerik Üretimi', desc: 'AI ile haftalık içerik takvimi, görseller, copywriting. İnsan kontrolünde.' },
        { title: 'A/B Test & Optimizasyon', desc: 'Sürekli test, sürekli iyileşme. Kazanan varyant otomatik ölçeklenir.' },
        { title: 'ROAS Odaklı Kampanya', desc: 'Her kuruşun geri dönüşünü ölçeriz. Raporlama şeffaf ve gerçek zamanlı.' },
      ]
    },
    roi: {
      title: 'Reklam ROI Analizi',
      rows: [
        { metric: 'ROAS (Reklam Getirisi)', before: '1.8x', after: '6.1x' },
        { metric: 'CPA (Lead Maliyeti)', before: '€28', after: '€11.70' },
        { metric: 'Tıklama Oranı (CTR)', before: '%0.8', after: '%3.4' },
        { metric: 'Aylık Organik Erişim', before: '2.400', after: '48.000' },
        { metric: 'İçerik Üretim Süresi', before: '3 gün/içerik', after: '< 1 saat' },
      ]
    },
    comparison: {
      title: 'Geleneksel Ajans vs AI-First',
      rows: [
        { feature: 'Kampanya Kurulum', traditional: '2-3 hafta', starwebflow: '14 gün' },
        { feature: 'A/B Test Hızı', traditional: 'Manuel, yavaş', starwebflow: 'AI otomatik' },
        { feature: 'İçerik Üretimi', traditional: 'Freelancer gerekir', starwebflow: 'AI + insan hibrit' },
        { feature: 'Optimizasyon', traditional: 'Haftalık manuel', starwebflow: '7/24 otomatik' },
        { feature: 'Raporlama', traditional: 'Aylık PDF', starwebflow: 'Gerçek zamanlı dashboard' },
        { feature: 'Şeffaflık', traditional: 'Siyah kutu', starwebflow: 'Her kuruş izlenebilir' },
        { feature: 'Platform Entegrasyonu', traditional: '1-2 platform', starwebflow: '7+ platform' },
      ]
    },
    cta: {
      headline: 'Reklam Bütçenizi 4.8x\'e Çevirelim',
      subheadline: 'Mevcut kampanyalarınızı analiz edip neden çalışmadığını gösterelim. Ücretsiz.',
      urgencyText: 'Bu ay 3 reklam yönetimi kapasitesi açık',
      primaryLabel: 'Ücretsiz Kampanya Analizi',
      secondaryLabel: 'Reklam Stratejisi Oluştur',
    },
    templates: {
      instagram: {
        headline: 'Rakipleriniz Sizi Geçemez',
        body: '✨ [brand] AI ile reklam bütçenizin her Euro\'su %6.1x geri döner.\n\n📊 3 ayda ortalama 4.8x ROAS\n⚡ 14 günde aktif kampanya\n🎯 Hedef kitlenizin tam kalbine',
        cta: '→ Ücretsiz Analiz Al',
        visual: '🎨 Gradient arkaplan üzerinde dinamik ürün görseli',
      },
      linkedin: {
        headline: 'B2B Şirketler İçin AI-First Pazarlama',
        body: 'Karar vericilere ulaşmak artık tahmin oyunu değil.\n\n• Lookalike audience: 2.1M erişim\n• LinkedIn Decision Maker targeting\n• Lead başına maliyet -%62\n• B2B pipeline büyümesi +%290',
        cta: '→ Demo Talep Et',
        visual: '📊 Profesyonel data dashboard görsel + marka logosu',
      },
      google: {
        headline: '[brand] | AI Destekli Dijital Ajans',
        body: 'Ücretsiz strateji görüşmesi — Bugün rezervasyon yapın\n\n✓ 50+ başarılı proje\n✓ 5.0 Google puanı\n✓ 30 gün garanti',
        cta: '→ Şimdi Ara',
        visual: '🔍 Search ad format — Responsive Display Network banner',
      },
      tiktok: {
        headline: 'Bu ajans farklı... 👀',
        body: '❌ Eski yöntem: Reklam ver, bekle, hayal kır\n✅ [brand]: AI analiz → doğru hedef → 4.8x geri dönüş\n\n🚀 Gerçek sonuçlar, gerçek müşteriler.\nYorum bırak: "Nasıl?" 👇',
        cta: '→ Link bio\'da',
        visual: '🎬 Hook video (ilk 3 saniye): şaşırma rektionu + data overlay',
      }
    }
  },
  en: {
    caseStudy: {
      company: 'SportMax E-Store',
      industry: 'Sports & Outdoor',
      metric: '6.4x ROAS — in 90 days',
      detail: 'We turned fragmented budgets into an AI-optimized campaign. €76.8K revenue from €12K budget. CPA -58%.',
    },
    hero: {
      badge: 'Advertising & Social Media',
      headline: 'Budget Going Out,',
      headlineGradient: 'No Conversions Coming In?',
      subheadline: 'We turn every Euro of your ad spend into 4.8x return with an AI-optimized Meta/Google Ads and autonomous content production line.',
      painStatement: 'You spend money on advertising but don\'t know who clicked or why they didn\'t buy. Campaigns based on guessing burn your budget. Data-driven growth works differently.',
      stat1: 'Avg. ROAS',
      stat2: 'CPA Reduction',
      stat3: 'Transparent',
    },
    tickers: {
      t1: 'Average ROAS',
      t1Sub: 'All clients',
      t2: 'CPA Reduction',
      t2Sub: 'First 90 days',
      t3: 'Highest Monthly Revenue',
      t3Sub: 'With a €12K budget',
      t4: 'Organic TikTok Views',
      t4Sub: 'Single piece of content',
    },
    generator: {
      title: 'Creative Generator',
      subtitle: 'Instant platform-specific ad generation',
      brandLabel: '1. Brand / Product Name',
      brandPlaceholder: 'E.g., SportMax, ClinicPro, FashionHaus...',
      platformLabel: '2. Select Platform',
      btnGenerating: 'AI Generating Ad...',
      btnGenerate: 'Generate Ad',
      aiThinking: '[AI] Brand analysis... target audience being determined... copy being optimized...',
      previewTitle: 'Ad Preview',
      sponsored: 'Sponsored',
      ctrLabel: 'Estimated CTR',
      roasLabel: 'Target ROAS',
      cpaLabel: 'Target CPA',
      modalTitle: 'Your Ad Strategy is Ready!',
      modalSubtitle: (brand: string, platform: string) => `Verify your information to unlock the custom AI ad copies and strategies prepared for the ${brand} brand on the ${platform} platform, and receive the 30-day budget plan in your email.`,
      modalSource: 'Ad Social Analysis',
    },
    whyUs: {
      title: 'Why AI-Powered Advertising?',
      platformsTitle: 'Active Platforms',
      services: [
        { title: 'AI Targeting', desc: 'Lookalike audience, retargeting, intent signals. Your budget reaches the right people.' },
        { title: 'Automated Content Creation', desc: 'Weekly content calendar, visuals, copywriting with AI. Human-supervised.' },
        { title: 'A/B Testing & Optimization', desc: 'Continuous testing, continuous improvement. The winning variant scales automatically.' },
        { title: 'ROAS-Driven Campaigns', desc: 'We measure the return on every penny. Reporting is transparent and real-time.' },
      ]
    },
    roi: {
      title: 'Advertising ROI Analysis',
      rows: [
        { metric: 'ROAS (Return on Ad Spend)', before: '1.8x', after: '6.1x' },
        { metric: 'CPA (Cost Per Acquisition)', before: '€28', after: '€11.70' },
        { metric: 'Click-Through Rate (CTR)', before: '0.8%', after: '3.4%' },
        { metric: 'Monthly Organic Reach', before: '2,400', after: '48,000' },
        { metric: 'Content Production Time', before: '3 days/content', after: '< 1 hour' },
      ]
    },
    comparison: {
      title: 'Traditional Agency vs AI-First',
      rows: [
        { feature: 'Campaign Setup', traditional: '2-3 weeks', starwebflow: '14 days' },
        { feature: 'A/B Testing Speed', traditional: 'Manual, slow', starwebflow: 'AI automated' },
        { feature: 'Content Production', traditional: 'Freelancers required', starwebflow: 'AI + human hybrid' },
        { feature: 'Optimization', traditional: 'Weekly manual', starwebflow: '24/7 automated' },
        { feature: 'Reporting', traditional: 'Monthly PDF', starwebflow: 'Real-time dashboard' },
        { feature: 'Transparency', traditional: 'Black box', starwebflow: 'Every penny traceable' },
        { feature: 'Platform Integration', traditional: '1-2 platforms', starwebflow: '7+ platforms' },
      ]
    },
    cta: {
      headline: "Let's Turn Your Ad Budget Into 4.8x",
      subheadline: 'Let us analyze your current campaigns and show you why they aren\'t working. Free.',
      urgencyText: '3 ad management slots open this month',
      primaryLabel: 'Free Campaign Analysis',
      secondaryLabel: 'Generate Ad Strategy',
    },
    templates: {
      instagram: {
        headline: 'Your Competitors Can\'t Beat You',
        body: '✨ With [brand] AI, every Euro of your ad budget returns 6.1x.\n\n📊 4.8x average ROAS in 3 months\n⚡ Active campaign in 14 days\n🎯 Straight to the heart of your target audience',
        cta: '→ Get Free Analysis',
        visual: '🎨 Dynamic product image on gradient background',
      },
      linkedin: {
        headline: 'AI-First Marketing for B2B Companies',
        body: 'Reaching decision-makers is no longer a guessing game.\n\n• Lookalike audience: 2.1M reach\n• LinkedIn Decision Maker targeting\n• Cost per lead -62%\n• B2B pipeline growth +290%',
        cta: '→ Request Demo',
        visual: '📊 Professional data dashboard visual + brand logo',
      },
      google: {
        headline: '[brand] | AI-Powered Digital Agency',
        body: 'Free strategy session — Reserve today\n\n✓ 50+ successful projects\n✓ 5.0 Google rating\n✓ 30-day guarantee',
        cta: '→ Call Now',
        visual: '🔍 Search ad format — Responsive Display Network banner',
      },
      tiktok: {
        headline: 'This agency is different... 👀',
        body: '❌ Old way: Run ads, wait, disappoint\n✅ [brand]: AI analysis → right target → 4.8x return\n\n🚀 Real results, real clients.\nLeave a comment: "How?" 👇',
        cta: '→ Link in bio',
        visual: '🎬 Hook video (first 3 seconds): surprise reaction + data overlay',
      }
    }
  },
  de: {
    caseStudy: {
      company: 'SportMax E-Store',
      industry: 'Sport & Outdoor',
      metric: '6.4x ROAS — in 90 Tagen',
      detail: 'Wir haben unstrukturierte Budgets in eine KI-optimierte Kampagne verwandelt. €76.8K Umsatz bei €12K Budget. CPA -58%.',
    },
    hero: {
      badge: 'Werbung & Social Media',
      headline: 'Budget geht weg,',
      headlineGradient: 'aber keine Conversions?',
      subheadline: 'Wir verwandeln jeden Euro Ihrer Werbeausgaben in das 4,8-Fache durch eine KI-optimierte Meta/Google-Ads- und autonome Content-Produktionslinie.',
      painStatement: 'Sie geben Geld für Werbung aus, wissen aber nicht, wer geklickt hat oder warum sie nicht gekauft haben. Kampagnen, die auf Vermutungen basieren, verbrennen Ihr Budget. Datengetriebenes Wachstum funktioniert anders.',
      stat1: 'Durchschn. ROAS',
      stat2: 'CPA-Senkung',
      stat3: 'Transparent',
    },
    tickers: {
      t1: 'Durchschnittlicher ROAS',
      t1Sub: 'Alle Kunden',
      t2: 'CPA-Senkung',
      t2Sub: 'Erste 90 Tage',
      t3: 'Höchster Monatsumsatz',
      t3Sub: 'Mit einem €12K-Budget',
      t4: 'Organische TikTok-Aufrufe',
      t4Sub: 'Einzelner Inhalt',
    },
    generator: {
      title: 'Kreativ-Generator',
      subtitle: 'Sofortige plattformspezifische Werbeerstellung',
      brandLabel: '1. Marke / Produktname',
      brandPlaceholder: 'Z.B. SportMax, ClinicPro, FashionHaus...',
      platformLabel: '2. Plattform auswählen',
      btnGenerating: 'KI generiert Anzeige...',
      btnGenerate: 'Anzeige generieren',
      aiThinking: '[KI] Markenanalyse... Zielgruppe wird ermittelt... Text wird optimiert...',
      previewTitle: 'Anzeigenvorschau',
      sponsored: 'Gesponsert',
      ctrLabel: 'Geschätzte CTR',
      roasLabel: 'Ziel-ROAS',
      cpaLabel: 'Ziel-CPA',
      modalTitle: 'Ihre Werbestrategie ist bereit!',
      modalSubtitle: (brand: string, platform: string) => `Bestätigen Sie Ihre Angaben, um die für die Marke ${brand} auf der Plattform ${platform} vorbereiteten KI-Werbetexte und -Strategien freizuschalten und den 30-Tage-Budgetplan per E-Mail zu erhalten.`,
      modalSource: 'Werbe-Social-Analyse',
    },
    whyUs: {
      title: 'Warum KI-gestützte Werbung?',
      platformsTitle: 'Aktive Plattformen',
      services: [
        { title: 'KI-Targeting', desc: 'Lookalike-Audience, Retargeting, Intent-Signale. Ihr Budget erreicht die richtigen Personen.' },
        { title: 'Automatisierte Inhaltserstellung', desc: 'Wöchentlicher Inhaltskalender, Visuals, Copywriting mit KI. Unter menschlicher Aufsicht.' },
        { title: 'A/B-Tests & Optimierung', desc: 'Kontinuierliche Tests, ständige Verbesserung. Die Gewinner-Variante skaliert automatisch.' },
        { title: 'ROAS-gesteuerte Kampagnen', desc: 'Wir messen die Rendite jedes Cent. Das Berichtswesen ist transparent und in Echtzeit.' },
      ]
    },
    roi: {
      title: 'Werbe-ROI-Analyse',
      rows: [
        { metric: 'ROAS (Return on Ad Spend)', before: '1.8x', after: '6.1x' },
        { metric: 'CPA (Kosten pro Lead)', before: '€28', after: '€11.70' },
        { metric: 'Klickrate (CTR)', before: '0.8%', after: '3.4%' },
        { metric: 'Monatliche organische Reichweite', before: '2.400', after: '48.000' },
        { metric: 'Inhaltserstellungszeit', before: '3 Tage/Inhalt', after: '< 1 Stunde' },
      ]
    },
    comparison: {
      title: 'Traditionelle Agentur vs. KI-First',
      rows: [
        { feature: 'Kampagnen-Setup', traditional: '2-3 Wochen', starwebflow: '14 Tage' },
        { feature: 'A/B-Testgeschwindigkeit', traditional: 'Manuell, langsam', starwebflow: 'KI-automatisiert' },
        { feature: 'Inhaltserstellung', traditional: 'Freelancer erforderlich', starwebflow: 'KI + Mensch Hybrid' },
        { feature: 'Optimierung', traditional: 'Wöchentlich manuell', starwebflow: '24/7 automatisiert' },
        { feature: 'Berichterstattung', traditional: 'Monatliches PDF', starwebflow: 'Echtzeit-Dashboard' },
        { feature: 'Transparenz', traditional: 'Blackbox', starwebflow: 'Jeder Cent nachverfolgbar' },
        { feature: 'Plattform-Integration', traditional: '1-2 Plattformen', starwebflow: '7+ Plattformen' },
      ]
    },
    cta: {
      headline: 'Lassen Sie uns Ihr Werbebudget in das 4,8-Fache verwandeln',
      subheadline: 'Lassen Sie uns Ihre aktuellen Kampagnen analysieren und Ihnen zeigen, warum sie nicht funktionieren. Kostenlos.',
      urgencyText: '3 Slots für Werbemanagement in diesem Monat offen',
      primaryLabel: 'Kostenlose Kampagnenanalyse',
      secondaryLabel: 'Werbestrategie erstellen',
    },
    templates: {
      instagram: {
        headline: 'Ihre Konkurrenten können Sie nicht einholen',
        body: '✨ Mit [brand] KI fließt jeder Euro Ihres Werbebudgets mit 6,1x zurück.\n\n📊 4,8x durchschnittlicher ROAS in 3 Monaten\n⚡ Aktive Kampagne in 14 Tagen\n🎯 Mitten ins Herz Ihrer Zielgruppe',
        cta: '→ Kostenlose Analyse',
        visual: '🎨 Dynamisches Produktbild auf Verlaufshintergrund',
      },
      linkedin: {
        headline: 'KI-First-Marketing für B2B-Unternehmen',
        body: 'Die Ansprache von Entscheidungsträgern ist kein Ratespiel mehr.\n\n• Lookalike-Audience: 2,1 Mio. Reichweite\n• LinkedIn Decision Maker Targeting\n• Kosten pro Lead -62%\n• B2B-Pipeline-Wachstum +290%',
        cta: '→ Demo anfordern',
        visual: '📊 Professionelle Daten-Dashboard-Visualisierung + Markenlogo',
      },
      google: {
        headline: '[brand] | KI-gestützte digitale Agentur',
        body: 'Kostenlose Strategiesitzung — Reservieren Sie noch heute\n\n✓ 50+ erfolgreiche Projekte\n✓ 5.0 Google-Bewertung\n✓ 30 Tage Garantie',
        cta: '→ Jetzt anrufen',
        visual: '🔍 Suchanzeigenformat — Responsive Display Network Banner',
      },
      tiktok: {
        headline: 'Diese Agentur ist anders... 👀',
        body: '❌ Alte Methode: Anzeige schalten, warten, enttäuscht sein\n✅ [brand]: KI-Analyse → richtiges Ziel → 4,8x Rendite\n\n🚀 Echte Ergebnisse, echte Kunden.\nSchreiben Sie einen Kommentar: "Wie?" 👇',
        cta: '→ Link in der Bio',
        visual: '🎬 Hook-Video (erste 3 Sekunden): Überraschungsreaktion + Daten-Overlay',
      }
    }
  }
}

function CreativeGenerator() {
  const { language } = useLanguage()
  const dict = localDict[language] || localDict.tr
  
  const [brand, setBrand] = useState('')
  const [platform, setPlatform] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<{ headline: string; body: string; cta: string; visual: string } | null>(null)
  const [showLeadModal, setShowLeadModal] = useState(false)

  const generate = async () => {
    if (!brand.trim() || !platform) return
    setGenerating(true)
    setResult(null)
    await new Promise(r => setTimeout(r, 2000))
    setGenerating(false)
    setShowLeadModal(true)
  }

  const handleLeadSubmit = (leadData: { name: string; email: string }) => {
    const templates = dict.templates
    const selectedTemplate = templates[platform as 'instagram' | 'linkedin' | 'google' | 'tiktok'] || templates['instagram']
    const template = { ...selectedTemplate }
    
    // Personalize with brand name
    template.headline = template.headline.replace('[brand]', brand)
    template.body = template.body.replace('[brand]', brand)
    setResult(template)
    setShowLeadModal(false)
  }

  const platformColors: Record<string, string> = {
    instagram: '#E1306C', linkedin: '#0A66C2', google: '#4285F4', tiktok: '#69C9D0'
  }
  const selectedPlatformLabel = platform ? platforms.find(p => p.id === platform)?.label : ''

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#12121F]/80 backdrop-blur-sm overflow-hidden">
      <LeadFormModal
        isOpen={showLeadModal}
        title={dict.generator.modalTitle}
        subtitle={dict.generator.modalSubtitle(brand, selectedPlatformLabel || '')}
        source={dict.generator.modalSource}
        value={18000} // Custom estimated value
        onSubmitSuccess={handleLeadSubmit}
      />
      <div className="border-b border-white/[0.06] px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/15 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-[#F59E0B]" />
        </div>
        <div>
          <div className="text-sm font-semibold text-white">{dict.generator.title}</div>
          <div className="text-xs text-[#64748B]">{dict.generator.subtitle}</div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Brand input */}
        <div>
          <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2 block">
            {dict.generator.brandLabel}
          </label>
          <input
            value={brand}
            onChange={e => setBrand(e.target.value)}
            placeholder={dict.generator.brandPlaceholder}
            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-[#475569] outline-none focus:border-[#F59E0B]/40 transition-colors"
          />
        </div>

        {/* Platform selection */}
        <div>
          <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3 block">
            {dict.generator.platformLabel}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {platforms.map(p => (
              <button
                key={p.id}
                onClick={() => { setPlatform(p.id); setResult(null) }}
                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all flex items-center gap-2 ${
                  platform === p.id
                    ? 'text-white'
                    : 'border-white/[0.06] text-[#64748B] hover:border-white/20 hover:text-white'
                }`}
                style={platform === p.id ? {
                  background: `${p.color}20`,
                  borderColor: `${p.color}40`,
                  color: p.color,
                } : {}}
              >
                <span>{p.icon}</span> {p.label}
              </button>
            ))}
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={generate}
          disabled={!brand.trim() || !platform || generating}
          className="w-full"
          style={{ background: ACCENT, borderColor: ACCENT }}
        >
          {generating ? (
            <><Loader2 className="w-4 h-4 animate-spin" />{dict.generator.btnGenerating}</>
          ) : (
            <><Sparkles className="w-4 h-4" />{dict.generator.btnGenerate}</>
          )}
        </Button>

        {generating && (
          <div className="text-xs text-[#475569] font-mono text-center animate-pulse">
            {dict.generator.aiThinking}
          </div>
        )}

        {result && platform && (
          <div style={{ animation: 'fadeInUp 0.4s ease both' }}>
            {/* Ad preview */}
            <div
              className="rounded-xl border overflow-hidden"
              style={{ borderColor: `${platformColors[platform]}30` }}
            >
              {/* Platform header */}
              <div
                className="px-4 py-2 flex items-center gap-2"
                style={{ background: `${platformColors[platform]}15` }}
              >
                <span>{platforms.find(p => p.id === platform)?.icon}</span>
                <span className="text-xs font-bold" style={{ color: platformColors[platform] }}>
                  {platforms.find(p => p.id === platform)?.label} {dict.generator.previewTitle}
                </span>
                <span className="ml-auto text-[10px] text-[#64748B] bg-white/5 px-2 py-0.5 rounded">{dict.generator.sponsored}</span>
              </div>

              {/* Visual placeholder */}
              <div
                className="h-24 flex items-center justify-center text-sm text-[#475569] border-b border-white/[0.06]"
                style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(239,68,68,0.05))' }}
              >
                <span className="text-2xl mr-2">🎨</span>
                <span className="text-xs">{result.visual}</span>
              </div>

              {/* Copy */}
              <div className="p-4 bg-white/[0.01]">
                <div className="text-sm font-bold text-white mb-2">{result.headline}</div>
                <div className="text-xs text-[#94A3B8] leading-relaxed whitespace-pre-line mb-3">{result.body}</div>
                <div
                  className="text-xs font-bold px-3 py-1.5 rounded-lg inline-block"
                  style={{ background: `${platformColors[platform]}20`, color: platformColors[platform] }}
                >
                  {result.cta}
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[
                { label: dict.generator.ctrLabel, value: '%3.8' },
                { label: dict.generator.roasLabel, value: '4.8x' },
                { label: dict.generator.cpaLabel, value: '€12' },
              ].map((m, i) => (
                <div key={i} className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <div className="text-xs text-[#64748B]">{m.label}</div>
                  <div className="text-sm font-bold text-[#F59E0B]">{m.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const platforms = [
  { id: 'instagram', label: 'Instagram', icon: '📸', color: '#E1306C' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼', color: '#0A66C2' },
  { id: 'google', label: 'Google Ads', icon: '🔍', color: '#4285F4' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵', color: '#010101' },
]

export default function ReklamSosyalPage() {
  const { language } = useLanguage()
  const dict = localDict[language] || localDict.tr

  const caseStudyLocalized = {
    ...dict.caseStudy,
    accentColor: ACCENT
  }

  const servicesList = dict.whyUs.services.map((s, i) => {
    const icons = [Target, Sparkles, BarChart3, TrendingUp]
    const colors = [ACCENT, '#EF4444', '#8B5CF6', '#10B981']
    return {
      ...s,
      icon: icons[i] || Target,
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
        gradientFrom="#F59E0B"
        gradientTo="#EF4444"
        stats={[
          { value: '4.8x', label: dict.hero.stat1, icon: TrendingUp },
          { value: '-%58', label: dict.hero.stat2, icon: Target },
          { value: '100%', label: dict.hero.stat3, icon: CheckCircle },
        ]}
        floatingBadges={[
          { label: 'ROAS 6.1x', icon: '📈', style: { top: '5%', right: '0%', animation: 'float 7s ease-in-out infinite' } },
          { label: 'Meta Ads', icon: '📘', style: { bottom: '8%', left: '2%', animation: 'float 5s ease-in-out infinite 1s' } },
          { label: 'AI Creative', icon: '✨', style: { top: '40%', left: '-5%', animation: 'float 6s ease-in-out infinite 0.5s' } },
        ]}
        simulationId="simulation"
      />

      <section className="py-16 border-y border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <ROITicker value={4.8} suffix="x" label={dict.tickers.t1} sublabel={dict.tickers.t1Sub} accentColor={ACCENT} duration={1500} />
            <ROITicker value={58} suffix="%" label={dict.tickers.t2} sublabel={dict.tickers.t2Sub} accentColor={ACCENT} />
            <ROITicker value={76800} prefix="€" label={dict.tickers.t3} sublabel={dict.tickers.t3Sub} accentColor={ACCENT} />
            <ROITicker value={284000} label={dict.tickers.t4} sublabel={dict.tickers.t4Sub} accentColor={ACCENT} />
          </div>
        </div>
      </section>

      <section id="simulation" className="section relative overflow-hidden">
        <div className="absolute inset-0 mesh-bg pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="tag-badge mb-4">✨ AI Creative</span>
            <h2 className="heading-lg text-white mt-4 mb-4">
              {language === 'tr' ? 'Markanız İçin ' : language === 'en' ? 'Generate Instant Ads ' : 'Erstellen Sie Anzeigen '}
              <span className="gradient-text">{language === 'tr' ? 'Anında Reklam Üret' : language === 'en' ? 'For Your Brand' : 'für Ihre Marke'}</span>
            </h2>
            <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto">
              {dict.generator.subtitle}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <CreativeGenerator />
            <div className="space-y-4">
              <div className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider mb-4">
                {dict.whyUs.title}
              </div>
              {servicesList.map((s, i) => {
                const Icon = s.icon
                return (
                  <div key={i} className="flex gap-4 p-4 rounded-xl border border-white/[0.05] bg-white/[0.01] hover:border-white/10 transition-all">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${s.color}15` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: s.color }} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white mb-0.5">{s.title}</div>
                      <div className="text-xs text-[#64748B] leading-relaxed">{s.desc}</div>
                    </div>
                  </div>
                )
              })}

              {/* Platform logos */}
              <div className="p-4 rounded-xl border border-white/[0.05] bg-white/[0.01]">
                <div className="text-xs text-[#64748B] mb-3">{dict.whyUs.platformsTitle}</div>
                <div className="flex flex-wrap gap-2">
                  {['Meta Ads', 'Google Ads', 'TikTok Ads', 'LinkedIn Ads', 'YouTube', 'Instagram', 'Pinterest'].map(p => (
                    <span key={p} className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-[#94A3B8] border border-white/[0.06]">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="heading-lg text-white mb-4">
              {language === 'tr' ? 'Reklam ' : language === 'en' ? 'Advertising ' : 'Werbe-'}
              <span className="gradient-text">{language === 'tr' ? 'ROI Analizi' : language === 'en' ? 'ROI Analysis' : 'ROI-Analyse'}</span>
            </h2>
          </div>
          <ValueMatrix
            accentColor={ACCENT}
            rows={dict.roi.rows.map((row, i) => ({
              ...row,
              delta: ['+%239', '-%58', '+%325', '+%1900', '-%96'][i],
              deltaPositive: i !== 1 && i !== 4 // CPA and Production time delta is negative but positive impact (already marked as deltaPositive in schema though)
            }))}
          />
        </div>
      </section>

      <section className="section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="heading-lg text-white mb-4">
              {dict.comparison.title}
            </h2>
          </div>
          <ComparisonTable
            accentColor={ACCENT}
            rows={dict.comparison.rows}
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
