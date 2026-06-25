'use client'

import { useState } from 'react'
import ServiceLayout from '@/components/services/ServiceLayout'
import ServiceHero from '@/components/services/ServiceHero'
import ValueMatrix from '@/components/services/ValueMatrix'
import ComparisonTable from '@/components/services/ComparisonTable'
import ServiceCTA from '@/components/services/ServiceCTA'
import ROITicker from '@/components/services/ROITicker'
import GlowCard from '@/components/ui/GlowCard'
import { Clock, TrendingUp, Zap, CheckCircle, GitBranch, Database, Mail, FileText, RefreshCw, Loader2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import LeadFormModal from '@/components/services/LeadFormModal'
import { useLanguage } from '@/lib/i18n/LanguageContext'

const ACCENT = '#10B981'

const terminalLogs = [
  { type: 'success' as const, text: 'Webhook received: new-lead-form' },
  { type: 'info' as const,    text: 'n8n workflow triggered: lead-nurture-v3' },
  { type: 'success' as const, text: 'CRM contact created — HubSpot #9281' },
  { type: 'info' as const,    text: 'Welcome email dispatched in 0.3s' },
  { type: 'success' as const, text: 'Invoice #4821 processed — PDF generated' },
  { type: 'info' as const,    text: 'Slack alert sent: "#sales-team"' },
  { type: 'success' as const, text: 'Spreadsheet updated: 847 rows → sync complete' },
  { type: 'info' as const,    text: 'Scheduler: next run in 3h 24m' },
  { type: 'warn' as const,    text: 'Manual process detected — automation suggested' },
  { type: 'success' as const, text: 'Monthly report auto-generated & emailed' },
]

const localDict = {
  tr: {
    caseStudy: {
      company: 'LogiTrans GmbH',
      industry: 'Lojistik',
      metric: 'Ayda 340 saat kurtarıldı',
      detail: 'Fatura girişi, rota planlaması, müşteri bildirimleri — tamamı otomatize. 2 FTE eşdeğeri tasarruf.',
    },
    calculator: {
      title: 'Maliyet Tasarruf Hesaplayıcı',
      subtitle: 'Manuel çalışma maliyetinizi hesaplayın',
      labelHours: 'Haftada Manuel Saat',
      hoursSuffix: 'saat',
      labelRate: 'Saatlik Personel Maliyeti',
      lossTitle: '⚠ Şu An Gerçekleşen Kayıp',
      lossAnnualHours: 'Yıllık Boşa Harcanan Saat',
      lossCapacity: 'Haftalık Kapasitenizin',
      savingsTitle: '✦ Otomasyon ile Tasarruf',
      savingsWeeklyHours: 'Haftalık Kurtarılan Saat',
      savingsMonthlyCost: 'Aylık Maliyet Tasarrufu',
      savingsAnnual: 'Yıllık Tasarruf',
      savingsCapacity: 'Boşa Çıkan Kapasite',
      modalTitle: 'Tasarruf Yol Haritanız Hazır!',
      modalSubtitle: (hours: number, cost: string) => `Haftalık ${hours} saat kurtarma ve yıllık €${cost} tasarruf sağlama planınızı içeren PDF yol haritasını indirmek için bilgilerinizi doğrulayın.`,
      modalSource: 'AI Otomasyon Analizi',
      submittedTitle: '🎉 Yol Haritanız Hazırlandı!',
      submittedDownload: 'PDF Raporunu Şimdi İndir',
      submittedAlert: 'PDF Tasarruf Raporu başarıyla indirildi (Simüle edildi).',
      downloadBtn: 'Otomasyon Yol Haritasını İndir',
      paybackNote: 'Otomasyon kurulum maliyeti ortalama 6-8 haftada geri döner.',
      hourLabel: 'sa',
      weekLabel: 'Hafta',
      minHours: '2 saat',
      maxHours: '80 saat',
    },
    automations: [
      {
        title: 'Lead Nurture Otomasyonu',
        desc: 'Form dolduran kişiye anında karşılama e-postası → 3. günde takip → 7. günde teklif.',
        tag: 'Satış',
      },
      {
        title: 'Fatura & Muhasebe',
        desc: 'Sipariş onaylanır → PDF fatura otomatik oluşur → Muhasebe sistemine düşer → Müşteriye gönderilir.',
        tag: 'Finans',
      },
      {
        title: 'CRM Senkronizasyonu',
        desc: 'E-posta, form, telefon — her yerden gelen lead tek merkeze aktarılır. Manuel giriş sıfır.',
        tag: 'CRM',
      },
      {
        title: 'Raporlama Otomasyonu',
        desc: 'Her ay sonu KPI raporu otomatik oluşur, ilgili kişilere gönderilir. Dashboard güncellenir.',
        tag: 'Analitik',
      },
      {
        title: 'Çoklu Platform Entegrasyon',
        desc: 'Shopify + WooCommerce + Etsy → tek stok paneli. Sipariş nerede gelirse gelsin otomatik işlenir.',
        tag: 'E-Commerce',
      },
      {
        title: 'Özel Workflow Tasarımı',
        desc: 'Sizin iş sürecinizi dinler, sıfırdan tasarlarız. n8n, Make, Zapier — hangi platform uygunsa.',
        tag: 'Özel',
      },
    ],
    hero: {
      badge: 'AI Otomasyonları',
      headline: 'İnsan Değil,',
      headlineGradient: 'Sistem Çalışsın',
      subheadline: 'Haftada 30+ saatinizi çalan tekrarlayan işleri n8n tabanlı AI otomasyonlara devredin. Operasyonel verimliliği uçurun.',
      painStatement: 'Aynı işi her gün tekrar yapıyorsanız, bir robot bunu sizden daha hızlı ve hatasız yapar. Siz stratejiye odaklanın — monoton işler bize kalsın.',
      stat1: 'Süreç Otomasyonu',
      stat2: 'Saat/Hafta',
      stat3: 'Hata Oranı',
    },
    tickers: {
      t1: 'Ort. Aylık Saat Tasarrufu',
      t2: 'Ort. Aylık Maliyet Azalması',
      t3: 'İşlem Doğruluk Oranı',
      t4: 'Haftalık ROI Geri Dönüş',
      t4Sub: 'Ortalama kurulum',
    },
    calculatorSection: {
      badge: '💰 Maliyet Hesaplayıcı',
      title: 'Şu An Kaç ',
      titleHighlight: 'Para Kaybediyorsunuz?',
      desc: 'Manuel çalışmanın gerçek maliyetini hesaplayın. Sonuçlar genellikle şok edici oluyor.',
      asideTitle: 'Hangi İşleri Otomatize Edebilirsiniz?',
      asideTotal: 'Ortalama toplam: 52 saat/hafta kurtarılabilir',
      asideTasks: [
        { emoji: '📧', text: 'E-posta yanıtlama ve yönlendirme', hours: '8 sa/hafta' },
        { emoji: '📊', text: 'Manuel veri girişi ve raporlama', hours: '12 sa/hafta' },
        { emoji: '🧾', text: 'Fatura hazırlama ve gönderme', hours: '6 sa/hafta' },
        { emoji: '📱', text: 'Sosyal medya planlama ve paylaşım', hours: '5 sa/hafta' },
        { emoji: '📦', text: 'Stok takibi ve sipariş işleme', hours: '10 sa/hafta' },
        { emoji: '📅', text: 'Randevu ve toplantı yönetimi', hours: '4 sa/hafta' },
        { emoji: '💬', text: 'Müşteri bildirim ve takip e-postaları', hours: '7 sa/hafta' },
      ]
    },
    packages: {
      badge: 'Otomasyon Kütüphanesi',
      title: 'Hazır ',
      titleHighlight: 'Otomasyon Paketleri',
    },
    roi: {
      title: 'Otomasyon ROI Analizi',
      rows: [
        { metric: 'Fatura İşleme Süresi', before: '45 dakika', after: '0.3 saniye' },
        { metric: 'Veri Giriş Hatası', before: '%12', after: '%0.1' },
        { metric: 'Aylık Personel Saati', before: '340 saat', after: '28 saat' },
        { metric: 'Lead Yanıt Süresi', before: '3.2 saat', after: '< 1 dakika' },
        { metric: 'Aylık Maliyet', before: '€8.500', after: '€1.200' },
      ]
    },
    comparison: {
      title: 'Manuel vs Otomatik',
      rows: [
        { feature: 'Çalışma Saatleri', traditional: '09:00-18:00', starwebflow: '7/24/365' },
        { feature: 'Hata Oranı', traditional: '%12-18', starwebflow: '< %0.1' },
        { feature: 'Ölçeklenebilirlik', traditional: 'İşe alım gerekir', starwebflow: 'Anlık ölçeklenir' },
        { feature: 'Maliyet Artışı', traditional: 'Her adımda artar', starwebflow: 'Sabit & öngörülebilir' },
        { feature: 'Raporlama', traditional: 'Manuel, gecikmeli', starwebflow: 'Otomatik, gerçek zamanlı' },
        { feature: 'Entegrasyon', traditional: 'Her sistem ayrı', starwebflow: 'Tek ekosistem' },
      ]
    },
    cta: {
      headline: 'Haftada 30+ Saatinizi Geri Alın',
      subheadline: 'Hangi süreçleri otomatize edebileceğimizi birlikte belirleyelim. Ücretsiz süreç analizi.',
      urgencyText: 'Bu ay 4 otomasyon projesi kapasitesi kaldı',
      primaryLabel: 'Ücretsiz Süreç Analizi',
      secondaryLabel: 'Otomasyon Haritası Çıkar',
    }
  },
  en: {
    caseStudy: {
      company: 'LogiTrans GmbH',
      industry: 'Logistics',
      metric: '340 hours saved per month',
      detail: 'Invoice entry, route planning, customer notifications — all automated. 2 FTE equivalent savings.',
    },
    calculator: {
      title: 'Cost-Saver Calculator',
      subtitle: 'Calculate your manual labor cost',
      labelHours: 'Manual Hours Per Week',
      hoursSuffix: 'hours',
      labelRate: 'Hourly Personnel Cost',
      lossTitle: '⚠ Current Loss Incurred',
      lossAnnualHours: 'Annual Wasted Hours',
      lossCapacity: 'Of Your Weekly Capacity',
      savingsTitle: '✦ Savings with Automation',
      savingsWeeklyHours: 'Weekly Saved Hours',
      savingsMonthlyCost: 'Monthly Cost Savings',
      savingsAnnual: 'Annual Savings',
      savingsCapacity: 'Freed Capacity',
      modalTitle: 'Your Savings Roadmap is Ready!',
      modalSubtitle: (hours: number, cost: string) => `Verify your information to download the PDF roadmap, including plans to recover ${hours} hours weekly and save €${cost} annually.`,
      modalSource: 'AI Automation Analysis',
      submittedTitle: '🎉 Your Roadmap is Ready!',
      submittedDownload: 'Download PDF Report Now',
      submittedAlert: 'PDF Savings Report downloaded successfully (Simulated).',
      downloadBtn: 'Download Automation Roadmap',
      paybackNote: 'Automation setup cost pays back in 6-8 weeks on average.',
      hourLabel: 'hrs',
      weekLabel: 'Weeks',
      minHours: '2 hours',
      maxHours: '80 hours',
    },
    automations: [
      {
        title: 'Lead Nurture Automation',
        desc: 'Instant welcome email to form submitter → follow-up on day 3 → offer on day 7.',
        tag: 'Sales',
      },
      {
        title: 'Invoicing & Accounting',
        desc: 'Order confirmed → PDF invoice automatically generated → goes to accounting system → sent to customer.',
        tag: 'Finance',
      },
      {
        title: 'CRM Synchronization',
        desc: 'Email, form, phone — leads from everywhere are transferred to a single center. Zero manual entry.',
        tag: 'CRM',
      },
      {
        title: 'Reporting Automation',
        desc: 'End-of-month KPI report automatically generated and sent to relevant people. Dashboard updated.',
        tag: 'Analytics',
      },
      {
        title: 'Multi-Platform Integration',
        desc: 'Shopify + WooCommerce + Etsy → single inventory panel. Orders are automatically processed wherever they come from.',
        tag: 'E-Commerce',
      },
      {
        title: 'Custom Workflow Design',
        desc: 'We listen to your business process and design it from scratch. n8n, Make, Zapier — whichever platform is suitable.',
        tag: 'Custom',
      },
    ],
    hero: {
      badge: 'AI Automations',
      headline: 'Let Systems Work,',
      headlineGradient: 'Not Humans',
      subheadline: 'Delegate repetitive tasks stealing 30+ hours of your week to n8n-based AI automations. Skyrocket operational efficiency.',
      painStatement: 'If you do the same job every day, a robot can do it faster and without errors. Focus on strategy — leave the monotonous tasks to us.',
      stat1: 'Process Automation',
      stat2: 'Hours/Week',
      stat3: 'Error Rate',
    },
    tickers: {
      t1: 'Avg. Monthly Hours Saved',
      t2: 'Avg. Monthly Cost Reduction',
      t3: 'Process Accuracy Rate',
      t4: 'Weekly ROI Payback',
      t4Sub: 'Average setup',
    },
    calculatorSection: {
      badge: '💰 Cost Calculator',
      title: 'How Much Money Are You ',
      titleHighlight: 'Losing Right Now?',
      desc: 'Calculate the real cost of manual labor. The results are usually shocking.',
      asideTitle: 'Which Tasks Can You Automate?',
      asideTotal: 'Average total: 52 hours/week can be saved',
      asideTasks: [
        { emoji: '📧', text: 'Email answering and routing', hours: '8 hrs/week' },
        { emoji: '📊', text: 'Manual data entry and reporting', hours: '12 hrs/week' },
        { emoji: '🧾', text: 'Invoicing and billing', hours: '6 hrs/week' },
        { emoji: '📱', text: 'Social media scheduling and posting', hours: '5 hrs/week' },
        { emoji: '📦', text: 'Inventory tracking and order processing', hours: '10 hrs/week' },
        { emoji: '📅', text: 'Appointment and meeting management', hours: '4 hrs/week' },
        { emoji: '💬', text: 'Customer notification and follow-up emails', hours: '7 hrs/week' },
      ]
    },
    packages: {
      badge: 'Automation Library',
      title: 'Ready-to-Use ',
      titleHighlight: 'Automation Packages',
    },
    roi: {
      title: 'Automation ROI Analysis',
      rows: [
        { metric: 'Invoice Processing Time', before: '45 minutes', after: '0.3 seconds' },
        { metric: 'Data Entry Error', before: '12%', after: '0.1%' },
        { metric: 'Monthly Personnel Hours', before: '340 hours', after: '28 hours' },
        { metric: 'Lead Response Time', before: '3.2 hours', after: '< 1 minute' },
        { metric: 'Monthly Cost', before: '€8,500', after: '€1,200' },
      ]
    },
    comparison: {
      title: 'Manual vs Automated',
      rows: [
        { feature: 'Working Hours', traditional: '09:00-18:00', starwebflow: '24/7/365' },
        { feature: 'Error Rate', traditional: '12-18%', starwebflow: '< 0.1%' },
        { feature: 'Scalability', traditional: 'Hiring required', starwebflow: 'Instantly scales' },
        { feature: 'Cost Increase', traditional: 'Increases at each step', starwebflow: 'Fixed & predictable' },
        { feature: 'Reporting', traditional: 'Manual, delayed', starwebflow: 'Automatic, real-time' },
        { feature: 'Integration', traditional: 'Separate systems', starwebflow: 'Single ecosystem' },
      ]
    },
    cta: {
      headline: 'Get 30+ Hours of Your Week Back',
      subheadline: "Let's identify which processes we can automate. Free process analysis.",
      urgencyText: 'Only 4 automation project slots left this month',
      primaryLabel: 'Free Process Analysis',
      secondaryLabel: 'Create Automation Map',
    }
  },
  de: {
    caseStudy: {
      company: 'LogiTrans GmbH',
      industry: 'Logistik',
      metric: '340 Stunden/Monat eingespart',
      detail: 'Rechnungserfassung, Routenplanung, Kundenbenachrichtigungen — alles automatisiert. Einsparung von 2 Vollzeitäquivalenten.',
    },
    calculator: {
      title: 'Kostenersparnis-Rechner',
      subtitle: 'Berechnen Sie Ihre manuellen Arbeitskosten',
      labelHours: 'Manuelle Stunden pro Woche',
      hoursSuffix: 'Stunden',
      labelRate: 'Stündliche Personalkosten',
      lossTitle: '⚠ Aktueller Verlust',
      lossAnnualHours: 'Jährlich verschwendete Stunden',
      lossCapacity: 'Ihrer wöchentlichen Kapazität',
      savingsTitle: '✦ Einsparungen durch Automatisierung',
      savingsWeeklyHours: 'Wöchentlich eingesparte Stunden',
      savingsMonthlyCost: 'Monatliche Kostenersparnis',
      savingsAnnual: 'Jährliche Ersparnis',
      savingsCapacity: 'Freigesetzte Kapazität',
      modalTitle: 'Ihr Spar-Fahrplan ist bereit!',
      modalSubtitle: (hours: number, cost: string) => `Bestätigen Sie Ihre Angaben, um den PDF-Fahrplan herunterzuladen, der Pläne zur wöchentlichen Einsparung von ${hours} Stunden und jährlichen Einsparungen von €${cost} enthält.`,
      modalSource: 'KI-Automatisierungsanalyse',
      submittedTitle: '🎉 Ihr Fahrplan wurde erstellt!',
      submittedDownload: 'PDF-Bericht jetzt herunterladen',
      submittedAlert: 'PDF-Sparbericht erfolgreich heruntergeladen (Simuliert).',
      downloadBtn: 'Automatisierungs-Fahrplan herunterladen',
      paybackNote: 'Die Einrichtungskosten für die Automatisierung amortisieren sich im Durchschnitt in 6-8 Wochen.',
      hourLabel: 'Std.',
      weekLabel: 'Wochen',
      minHours: '2 Stunden',
      maxHours: '80 Stunden',
    },
    automations: [
      {
        title: 'Lead-Nurturing-Automatisierung',
        desc: 'Sofortige Begrüßungs-E-Mail an Formulareinsender → Follow-up an Tag 3 → Angebot an Tag 7.',
        tag: 'Vertrieb',
      },
      {
        title: 'Rechnungsstellung & Buchhaltung',
        desc: 'Auftrag bestätigt → PDF-Rechnung automatisch generiert → geht an Buchhaltungssystem → an Kunden gesendet.',
        tag: 'Finanzen',
      },
      {
        title: 'CRM-Synchronisation',
        desc: 'E-Mail, Formular, Telefon — Leads von überall werden in ein einziges Center übertragen. Keine manuelle Eingabe.',
        tag: 'CRM',
      },
      {
        title: 'Berichtsautomatisierung',
        desc: 'Monatsende-KPI-Bericht wird automatisch generiert und an relevante Personen gesendet. Dashboard aktualisiert.',
        tag: 'Analytik',
      },
      {
        title: 'Multi-Plattform-Integration',
        desc: 'Shopify + WooCommerce + Etsy → einzelnes Bestandsfenster. Bestellungen werden automatisch verarbeitet, egal woher sie kommen.',
        tag: 'E-Commerce',
      },
      {
        title: 'Individuelles Workflow-Design',
        desc: 'Wir hören uns Ihren Geschäftsprozess an und entwerfen ihn von Grund auf. n8n, Make, Zapier — je nachdem, welche Plattform geeignet ist.',
        tag: 'Spezifisch',
      },
    ],
    hero: {
      badge: 'KI-Automatisierungen',
      headline: 'Lassen Sie Systeme arbeiten,',
      headlineGradient: 'nicht Menschen',
      subheadline: 'Delegieren Sie wiederkehrende Aufgaben, die Ihnen wöchentlich mehr als 30 Stunden rauben, an n8n-basierte KI-Automatisierungen. Steigern Sie die betriebliche Effizienz drastisch.',
      painStatement: 'Wenn Sie jeden Tag die gleiche Arbeit tun, kann ein Roboter dies schneller und fehlerfrei erledigen. Konzentrieren Sie sich auf die Strategie — überlassen Sie die eintönigen Aufgaben uns.',
      stat1: 'Prozessautomatisierung',
      stat2: 'Stunden/Woche',
      stat3: 'Fehlerrate',
    },
    tickers: {
      t1: 'Durchschn. monatlich eingesparte Stunden',
      t2: 'Durchschn. monatliche Kostenersparnis',
      t3: 'Prozessgenauigkeit',
      t4: 'Wöchentlicher ROI-Payback',
      t4Sub: 'Durchschnittliche Einrichtung',
    },
    calculatorSection: {
      badge: '💰 Kostenrechner',
      title: 'Wie viel Geld ',
      titleHighlight: 'verlieren Sie gerade?',
      desc: 'Berechnen Sie die tatsächlichen Kosten der manuellen Arbeit. Die Ergebnisse sind meist schockierend.',
      asideTitle: 'Welche Aufgaben können Sie automatisieren?',
      asideTotal: 'Durchschnittlich insgesamt: 52 Stunden/Woche können eingespart werden',
      asideTasks: [
        { emoji: '📧', text: 'E-Mail-Beantwortung und -Weiterleitung', hours: '8 Std./Woche' },
        { emoji: '📊', text: 'Manuelle Dateneingabe und Berichterstattung', hours: '12 Std./Woche' },
        { emoji: '🧾', text: 'Rechnungserstellung und -versendung', hours: '6 Std./Woche' },
        { emoji: '📱', text: 'Social-Media-Planung und -Veröffentlichung', hours: '5 Std./Woche' },
        { emoji: '📦', text: 'Bestandsverfolgung und Auftragsabwicklung', hours: '10 Std./Woche' },
        { emoji: '📅', text: 'Termin- und Besprechungsmanagement', hours: '4 Std./Woche' },
        { emoji: '💬', text: 'Kundenbenachrichtigung und Follow-up-E-Mails', hours: '7 Std./Woche' },
      ]
    },
    packages: {
      badge: 'Automatisierungsbibliothek',
      title: 'Fertige ',
      titleHighlight: 'Automatisierungspakete',
    },
    roi: {
      title: 'Automatisierungs-ROI-Analyse',
      rows: [
        { metric: 'Rechnungsverarbeitungszeit', before: '45 Minuten', after: '0.3 Sekunden' },
        { metric: 'Dateneingabefehler', before: '12%', after: '0.1%' },
        { metric: 'Monatliche Personalstunden', before: '340 Stunden', after: '28 Stunden' },
        { metric: 'Lead-Antwortzeit', before: '3.2 Stunden', after: '< 1 Minute' },
        { metric: 'Monatliche Kosten', before: '€8.500', after: '€1.200' },
      ]
    },
    comparison: {
      title: 'Manuell vs Automatisiert',
      rows: [
        { feature: 'Arbeitszeit', traditional: '09:00-18:00', starwebflow: '24/7/365' },
        { feature: 'Fehlerrate', traditional: '12-18%', starwebflow: '< 0.1%' },
        { feature: 'Skalierbarkeit', traditional: 'Einstellung erforderlich', starwebflow: 'Sofort skalierbar' },
        { feature: 'Kostensteigerung', traditional: 'Steigt bei jedem Schritt', starwebflow: 'Fest & prognostizierbar' },
        { feature: 'Berichterstattung', traditional: 'Manuell, verzögert', starwebflow: 'Automatisch, in Echtzeit' },
        { feature: 'Integration', traditional: 'Getrennte Systeme', starwebflow: 'Einzelnes Ökosystem' },
      ]
    },
    cta: {
      headline: 'Holen Sie sich 30+ Stunden Ihrer Woche zurück',
      subheadline: 'Lassen Sie uns gemeinsam herausfinden, welche Prozesse wir automatisieren können. Kostenlose Prozessanalyse.',
      urgencyText: 'Nur noch 4 Slots für Automatisierungsprojekte in diesem Monat frei',
      primaryLabel: 'Kostenlose Prozessanalyse',
      secondaryLabel: 'Automatisierungskarte erstellen',
    }
  }
}

function CostSaverCalculator() {
  const { language } = useLanguage()
  const dict = localDict[language] || localDict.tr
  
  const [hours, setHours] = useState(20)
  const [rate, setRate] = useState(25)
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const weeklyTimeSaved = Math.round(hours * 0.88)
  const monthlySaved = weeklyTimeSaved * 4 * rate
  const annualSaved = monthlySaved * 12
  const weeksFreed = Math.round((hours * 52) / 40)
  const percentOfYear = Math.round((hours / 40) * 100)

  const handleLeadSubmit = (leadData: { name: string; email: string }) => {
    setShowLeadModal(false)
    setSubmitted(true)
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#12121F]/80 backdrop-blur-sm overflow-hidden">
      <div className="border-b border-white/[0.06] px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-[#10B981]" />
        </div>
        <div>
          <div className="text-sm font-semibold text-white">{dict.calculator.title}</div>
          <div className="text-xs text-[#64748B]">{dict.calculator.subtitle}</div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Slider 1 */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
              {dict.calculator.labelHours}
            </label>
            <span
              className="text-lg font-black font-['Outfit']"
              style={{ color: ACCENT }}
            >
              {hours} {dict.calculator.hoursSuffix}
            </span>
          </div>
          <input
            type="range"
            min={2}
            max={80}
            value={hours}
            onChange={e => setHours(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${ACCENT} 0%, ${ACCENT} ${((hours - 2) / 78) * 100}%, rgba(255,255,255,0.1) ${((hours - 2) / 78) * 100}%, rgba(255,255,255,0.1) 100%)`,
            }}
          />
          <div className="flex justify-between text-[10px] text-[#334155] mt-1">
            <span>2 {dict.calculator.hoursSuffix}</span><span>80 {dict.calculator.hoursSuffix}</span>
          </div>
        </div>

        {/* Slider 2 */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
              {dict.calculator.labelRate}
            </label>
            <span className="text-lg font-black font-['Outfit']" style={{ color: ACCENT }}>
              €{rate}
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={80}
            value={rate}
            onChange={e => setRate(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${ACCENT} 0%, ${ACCENT} ${((rate - 10) / 70) * 100}%, rgba(255,255,255,0.1) ${((rate - 10) / 70) * 100}%, rgba(255,255,255,0.1) 100%)`,
            }}
          />
          <div className="flex justify-between text-[10px] text-[#334155] mt-1">
            <span>€10</span><span>€80</span>
          </div>
        </div>

        {/* Pain amplifier */}
        <div
          className="p-4 rounded-xl border"
          style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)' }}
        >
          <div className="text-xs font-semibold text-[#EF4444] mb-2">{dict.calculator.lossTitle}</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-[#64748B]">{dict.calculator.lossAnnualHours}</div>
              <div className="text-lg font-bold text-[#EF4444]">{(hours * 52).toLocaleString(language === 'tr' ? 'tr-TR' : 'de-DE')} {dict.calculator.hourLabel}</div>
            </div>
            <div>
              <div className="text-xs text-[#64748B]">{dict.calculator.lossCapacity}</div>
              <div className="text-lg font-bold text-[#EF4444]">%{percentOfYear}</div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div
          className="p-4 rounded-xl border"
          style={{ background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.2)' }}
        >
          <div className="text-xs font-semibold text-[#10B981] mb-3">{dict.calculator.savingsTitle}</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-[#64748B]">{dict.calculator.savingsWeeklyHours}</div>
              <div className="text-2xl font-black text-white font-['Outfit']">{weeklyTimeSaved}{dict.calculator.hourLabel}</div>
            </div>
            <div>
              <div className="text-xs text-[#64748B]">{dict.calculator.savingsMonthlyCost}</div>
              <div className="text-2xl font-black font-['Outfit']" style={{ color: ACCENT }}>
                €{monthlySaved.toLocaleString(language === 'tr' ? 'tr-TR' : 'de-DE')}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#64748B]">{dict.calculator.savingsAnnual}</div>
              <div className="text-xl font-bold text-white">€{annualSaved.toLocaleString(language === 'tr' ? 'tr-TR' : 'de-DE')}</div>
            </div>
            <div>
              <div className="text-xs text-[#64748B]">{dict.calculator.savingsCapacity}</div>
              <div className="text-xl font-bold text-white">{weeksFreed} {dict.calculator.weekLabel}</div>
            </div>
          </div>
        </div>

        <LeadFormModal
          isOpen={showLeadModal}
          title={dict.calculator.modalTitle}
          subtitle={dict.calculator.modalSubtitle(weeklyTimeSaved, annualSaved.toLocaleString(language === 'tr' ? 'tr-TR' : 'de-DE'))}
          source={dict.calculator.modalSource}
          value={annualSaved * 0.2} // estimated project size
          onSubmitSuccess={handleLeadSubmit}
        />

        {submitted ? (
          <div className="p-4 rounded-xl border border-[#10B981]/30 bg-[#10B981]/5 text-center transition-all">
            <div className="text-sm font-semibold text-[#10B981] mb-1">{dict.calculator.submittedTitle}</div>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); alert(dict.calculator.submittedAlert) }}
              className="text-xs text-[#4F8EF7] hover:underline font-bold flex items-center justify-center gap-1.5 mt-2"
            >
              <FileText className="w-4 h-4" /> {dict.calculator.submittedDownload}
            </a>
          </div>
        ) : (
          <Button
            variant="primary"
            size="md"
            className="w-full shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            style={{ background: ACCENT, borderColor: ACCENT }}
            onClick={() => setShowLeadModal(true)}
          >
            {dict.calculator.downloadBtn}
            <FileText className="w-4 h-4" />
          </Button>
        )}

        <div className="text-center text-xs text-[#475569] mt-3">
          {dict.calculator.paybackNote}
        </div>
      </div>
    </div>
  )
}

export default function AIOtomasyonPage() {
  const { language } = useLanguage()
  const dict = localDict[language] || localDict.tr

  const automationsList = dict.automations.map((a, i) => {
    const original = localDict.tr.automations[i];
    // map icons based on index
    const icons = [Mail, FileText, Database, RefreshCw, GitBranch, Zap];
    const colors = ['#10B981', '#4F8EF7', '#8B5CF6', '#F59E0B', '#06B6D4', '#EF4444'];
    return {
      ...a,
      icon: icons[i] || Zap,
      color: colors[i] || '#EF4444'
    }
  });

  const caseStudyLocalized = {
    ...dict.caseStudy,
    accentColor: ACCENT
  };

  return (
    <ServiceLayout terminalLogs={terminalLogs} caseStudy={caseStudyLocalized}>

      <ServiceHero
        badge={dict.hero.badge}
        headline={dict.hero.headline}
        headlineGradient={dict.hero.headlineGradient}
        subheadline={dict.hero.subheadline}
        painStatement={dict.hero.painStatement}
        accentColor={ACCENT}
        gradientFrom="#10B981"
        gradientTo="#4F8EF7"
        stats={[
          { value: '88%', label: dict.hero.stat1, icon: Zap },
          { value: '30+', label: dict.hero.stat2, icon: Clock },
          { value: '0', label: dict.hero.stat3, icon: CheckCircle },
        ]}
        floatingBadges={[
          { label: 'n8n Flow', icon: '⚙️', style: { top: '5%', right: '0%', animation: 'float 7s ease-in-out infinite' } },
          { label: language === 'tr' ? '340 saat/ay' : language === 'en' ? '340 hrs/month' : '340 Std./Monat', icon: '⏱', style: { bottom: '8%', left: '2%', animation: 'float 5s ease-in-out infinite 1s' } },
          { label: 'CRM Sync', icon: '🔗', style: { top: '40%', left: '-5%', animation: 'float 6s ease-in-out infinite 0.5s' } },
        ]}
        simulationId="simulation"
      />

      <section className="py-16 border-y border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <ROITicker value={340} suffix={language === 'de' ? ' Std.' : language === 'en' ? ' hrs' : 's'} label={dict.tickers.t1} accentColor={ACCENT} />
            <ROITicker value={8500} prefix="€" label={dict.tickers.t2} accentColor={ACCENT} />
            <ROITicker value={99.7} suffix="%" label={dict.tickers.t3} accentColor={ACCENT} duration={1500} />
            <ROITicker value={7} label={dict.tickers.t4} sublabel={dict.tickers.t4Sub} accentColor={ACCENT} />
          </div>
        </div>
      </section>

      <section id="simulation" className="section relative overflow-hidden">
        <div className="absolute inset-0 mesh-bg pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="tag-badge mb-4">{dict.calculatorSection.badge}</span>
            <h2 className="heading-lg text-white mt-4 mb-4">
              {dict.calculatorSection.title}<span className="gradient-text">{dict.calculatorSection.titleHighlight}</span>
            </h2>
            <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto">
              {dict.calculatorSection.desc}
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <CostSaverCalculator />
            <div className="space-y-4">
              <div className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider mb-4">
                {dict.calculatorSection.asideTitle}
              </div>
              {dict.calculatorSection.asideTasks.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.05] bg-white/[0.01]">
                  <span className="text-xl">{item.emoji}</span>
                  <span className="text-sm text-[#94A3B8] flex-1">{item.text}</span>
                  <span className="text-xs font-semibold text-[#EF4444]">{item.hours}</span>
                </div>
              ))}
              <div className="text-center text-xs text-[#475569] mt-2">
                {dict.calculatorSection.asideTotal}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="tag-badge mb-4">{dict.packages.badge}</span>
            <h2 className="heading-lg text-white mt-4 mb-4">
              {dict.packages.title}<span className="gradient-text">{dict.packages.titleHighlight}</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {automationsList.map((a, i) => {
              const Icon = a.icon
              return (
                <GlowCard key={i} glowColor="emerald" className="p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${a.color}15` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: a.color }} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{a.title}</div>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded font-semibold"
                        style={{ color: a.color, background: `${a.color}15` }}
                      >
                        {a.tag}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[#64748B] leading-relaxed">{a.desc}</p>
                </GlowCard>
              )
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="heading-lg text-white mb-4">
              {language === 'tr' ? 'Otomasyon ' : language === 'en' ? 'Automation ' : 'Automatisierungs-'}
              <span className="gradient-text">{language === 'tr' ? 'ROI Analizi' : language === 'en' ? 'ROI Analysis' : 'ROI-Analyse'}</span>
            </h2>
          </div>
          <ValueMatrix
            accentColor={ACCENT}
            rows={dict.roi.rows.map((row, i) => ({
              ...row,
              delta: ['-%99.9', '-%99', '-%92', '-%99.5', '-%86'][i],
              deltaPositive: true
            }))}
          />
        </div>
      </section>

      <section className="section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="heading-lg text-white mb-4">
              {language === 'tr' ? 'Manuel vs ' : language === 'en' ? 'Manual vs ' : 'Manuell vs '}
              <span className="gradient-text">{language === 'tr' ? 'Otomatik' : language === 'en' ? 'Automated' : 'Automatisiert'}</span>
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
