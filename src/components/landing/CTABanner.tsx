'use client'

import { useRef, useEffect, useState, FormEvent } from 'react'
import Button from '@/components/ui/Button'
import GlowCard from '@/components/ui/GlowCard'
import { createPublicLead } from '@/app/actions/lead'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import {
  Sparkles, ArrowRight, CalendarDays, ShieldCheck,
  Mail, User, Phone, Building2, HelpCircle,
  TrendingUp, Check, Loader2
} from 'lucide-react'

import { CURRENCIES as currencies } from '@/lib/utils'

const budgetRangesByCurrency: Record<string, { id: string; label: string; approxVal: number }[]> = {
  TRY: [
    { id: 'low', label: '₺20.000 - ₺50.000', approxVal: 35000 },
    { id: 'mid', label: '₺50.000 - ₺100.000', approxVal: 75000 },
    { id: 'high', label: '₺100.000 - ₺250.000', approxVal: 175000 },
    { id: 'enterprise', label: '₺250.000+', approxVal: 350000 },
  ],
  USD: [
    { id: 'low', label: '$1.000 - $3.000', approxVal: 2000 * 32 },
    { id: 'mid', label: '$3.000 - $8.000', approxVal: 5500 * 32 },
    { id: 'high', label: '$8.000 - $20.000', approxVal: 14000 * 32 },
    { id: 'enterprise', label: '$20.000+', approxVal: 35000 * 32 },
  ],
  EUR: [
    { id: 'low', label: '€1.000 - €3.000', approxVal: 2000 * 35 },
    { id: 'mid', label: '€3.000 - €8.000', approxVal: 5500 * 35 },
    { id: 'high', label: '€8.000 - €20.000', approxVal: 14000 * 35 },
    { id: 'enterprise', label: '€20.000+', approxVal: 35000 * 35 },
  ],
  GBP: [
    { id: 'low', label: '£1.000 - £3.000', approxVal: 2000 * 41 },
    { id: 'mid', label: '£3.000 - £8.000', approxVal: 5500 * 41 },
    { id: 'high', label: '£8.000 - £20.000', approxVal: 14000 * 41 },
    { id: 'enterprise', label: '£20.000+', approxVal: 35000 * 41 },
  ]
}

const localDict = {
  tr: {
    badge: 'Ücretsiz Strateji Görüşmesi',
    title1: 'Dijital Dönüşümünüzü',
    title2: 'Bugün Başlatın',
    desc: 'İş süreçlerinizi hızlandırmak, maliyetleri kısmak ve otomasyon ekosistemine geçiş yapmak için ilk adımı atın. Uzman mühendislerimiz ve analistlerimiz eşliğinde 60 dakikalık ücretsiz teknik analiz planlayalım.',
    point1: '24 saat içinde geri dönüş garantisi',
    point2: 'Tamamen gizlilik (NDA) ve KVKK güvencesi',
    point3: 'Hazır teknik Lastenheft şablonu teslimi',
    trust1: '✓ Kredi kartı gerekmez',
    trust2: '✓ Bağlayıcılık yok',
    trust3: '✓ %100 Ücretsiz Danışmanlık',
    trust4: '✓ Kişiselleştirilmiş Yol Haritası',
    successTitle: 'Başvurunuz Alındı!',
    successDesc1: 'Sayın',
    successDesc2: 'talebiniz ekibimize başarıyla ulaştı. En geç 24 saat içerisinde teknik ekibimiz sizinle iletişime geçerek strateji görüşmesi takvimini planlayacaktır.',
    priorityTitle: '⚡ Takvimimizde Size Öncelik Tanıdık!',
    priorityDesc: 'Projeniz öncelikli grup olarak sınıflandırıldı. Teknik ekibimizle 15 dakikalık ücretsiz ilk analiz görüşmenizi aşağıdaki takvimden anında rezerve edebilirsiniz:',
    fallbackDesc: 'Yol haritanız ve Lastenheft taslağınız e-postanıza gönderilmek üzere hazırlanıyor.',
    formTitle: 'Proje Başvuru Formu',
    formSubtitle: 'Lütfen alanları eksiksiz doldurun',
    valName: 'Lütfen adınızı ve soyadınızı girin.',
    valEmail: 'Geçerli bir e-posta adresi girin.',
    valPhone: 'Geçerli bir telefon numarası girin.',
    valError: 'Bir hata oluştu. Lütfen bilgilerinizi kontrol edip tekrar deneyin.',
    valConnError: 'Bağlantı hatası oluştu.',
    labelName: 'Ad Soyad',
    placeholderName: 'Örn: Sinan Günay',
    labelEmail: 'E-posta Adresi',
    placeholderEmail: 'Örn: sinan@sirket.com veya gmail.com',
    labelPhone: 'Telefon Numarası',
    placeholderPhone: 'Örn: 0555 123 4567',
    labelCompany: 'Şirket Adı',
    placeholderCompany: 'Örn: Akın Teknoloji',
    optional: '(Opsiyonel)',
    labelType: 'Proje Türü',
    labelBudget: 'Tahmini Proje Bütçesi',
    labelMessage: 'Proje Detayları & Mesajınız',
    placeholderMessage: 'Yapay zeka asistanı, web uygulaması veya hız hedefleriniz nelerdir?',
    btnSubmitting: 'Başvurunuz Kaydediliyor...',
    btnSubmit: 'Strateji Görüşmesini Planla',
    footerSecurity: 'Verileriniz şifrelenir ve KVKK / GDPR kapsamında korunur.',
    types: {
      'web-sitesi': 'Web Sitesi',
      'web-uygulamasi': 'Web Uygulaması (SaaS)',
      'ai-agent': 'AI Agent',
      'ai-otomasyon': 'AI Otomasyonu',
      'reklam-sosyal': 'Reklam & Sosyal Medya',
      'diger': 'Diğer / Karma'
    }
  },
  en: {
    badge: 'Free Strategy Call',
    title1: 'Start Your Digital',
    title2: 'Transformation Today',
    desc: 'Take the first step to accelerate your business processes, cut costs, and transition to the automation ecosystem. Let\'s plan a free 60-minute technical analysis with our expert engineers and analysts.',
    point1: 'Response guaranteed within 24 hours',
    point2: 'Complete confidentiality (NDA) and GDPR compliance',
    point3: 'Ready-to-use technical Lastenheft template delivery',
    trust1: '✓ No credit card required',
    trust2: '✓ No obligation',
    trust3: '✓ 100% Free Consultation',
    trust4: '✓ Personalized Roadmap',
    successTitle: 'Application Received!',
    successDesc1: 'Dear',
    successDesc2: 'your request has successfully reached our team. Our technical team will contact you within 24 hours to schedule the strategy meeting calendar.',
    priorityTitle: '⚡ We Prioritized You in Our Calendar!',
    priorityDesc: 'Your project has been classified as a priority group. You can instantly reserve your free 15-minute initial analysis meeting with our technical team from the calendar below:',
    fallbackDesc: 'Your roadmap and Lastenheft brief are being prepared to be sent to your email.',
    formTitle: 'Project Application Form',
    formSubtitle: 'Please fill out all fields completely',
    valName: 'Please enter your name and surname.',
    valEmail: 'Please enter a valid email address.',
    valPhone: 'Please enter a valid phone number.',
    valError: 'An error occurred. Please check your information and try again.',
    valConnError: 'Connection error occurred.',
    labelName: 'Full Name',
    placeholderName: 'e.g. John Doe',
    labelEmail: 'Email Address',
    placeholderEmail: 'e.g. john@company.com or gmail.com',
    labelPhone: 'Phone Number',
    placeholderPhone: 'e.g. +1 555 123 4567',
    labelCompany: 'Company Name',
    placeholderCompany: 'e.g. Acme Corporation',
    optional: '(Optional)',
    labelType: 'Project Type',
    labelBudget: 'Estimated Project Budget',
    labelMessage: 'Project Details & Your Message',
    placeholderMessage: 'What are your AI assistant, web application, or speed goals?',
    btnSubmitting: 'Saving Your Application...',
    btnSubmit: 'Schedule Strategy Call',
    footerSecurity: 'Your data is encrypted and protected under GDPR.',
    types: {
      'web-sitesi': 'Website Development',
      'web-uygulamasi': 'Web Application (SaaS)',
      'ai-agent': 'AI Agent',
      'ai-otomasyon': 'AI Automation',
      'reklam-sosyal': 'Ads & Social Media',
      'diger': 'Other / Hybrid'
    }
  },
  de: {
    badge: 'Kostenloses Strategiegespräch',
    title1: 'Starten Sie Ihre digitale',
    title2: 'Transformation heute',
    desc: 'Machen Sie den ersten Schritt, um Ihre Geschäftsprozesse zu beschleunigen, Kosten zu senken und in das Automatisierungs-Ökosystem einzusteigen. Lassen Sie uns eine kostenlose 60-minütige technische Analyse mit unseren Experten planen.',
    point1: 'Rückmeldung garantiert innerhalb von 24 Stunden',
    point2: 'Absolute Vertraulichkeit (NDA) und DSGVO-Konformität',
    point3: 'Bereitstellung einer fertigen technischen Lastenheft-Vorlage',
    trust1: '✓ Keine Kreditkarte erforderlich',
    trust2: '✓ Unverbindlich',
    trust3: '✓ 100 % kostenlose Beratung',
    trust4: '✓ Personalisierte Roadmap',
    successTitle: 'Bewerbung eingegangen!',
    successDesc1: 'Sehr geehrte(r)',
    successDesc2: 'Ihre Anfrage ist erfolgreich bei unserem Team eingegangen. Unser technisches Team wird sich innerhalb von 24 Stunden mit Ihnen in Verbindung setzen, um das Strategiegespräch zu planen.',
    priorityTitle: '⚡ Wir haben Sie in unserem Kalender priorisiert!',
    priorityDesc: 'Ihr Projekt wurde als prioritär eingestuft. Sie können Ihr kostenloses 15-minütiges Erstgespräch mit unserem technischen Team direkt im folgenden Kalender buchen:',
    fallbackDesc: 'Ihre Roadmap und Ihr Lastenheft-Entwurf werden für den Versand per E-Mail vorbereitet.',
    formTitle: 'Projekt-Bewerbungsformular',
    formSubtitle: 'Bitte füllen Sie alle Felder vollständig aus',
    valName: 'Bitte geben Sie Ihren Namen und Nachnamen ein.',
    valEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
    valPhone: 'Bitte geben Sie eine gültige Telefonnummer ein.',
    valError: 'Ein Fehler ist aufgetreten. Bitte überprüfen Sie Ihre Angaben und versuchen Sie es erneut.',
    valConnError: 'Verbindungsfehler aufgetreten.',
    labelName: 'Vollständiger Name',
    placeholderName: 'z.B. Max Mustermann',
    labelEmail: 'E-Mail-Adresse',
    placeholderEmail: 'z.B. max@firma.de oder gmail.com',
    labelPhone: 'Telefonnummer',
    placeholderPhone: 'z.B. +49 151 12345678',
    labelCompany: 'Unternehmensname',
    placeholderCompany: 'z.B. Muster GmbH',
    optional: '(Optional)',
    labelType: 'Projektart',
    labelBudget: 'Geschätztes Projektbudget',
    labelMessage: 'Projektdetails & Ihre Nachricht',
    placeholderMessage: 'Was sind Ihre Ziele für KI-Assistenten, Webanwendungen oder Ladezeiten?',
    btnSubmitting: 'Bewerbung wird gespeichert...',
    btnSubmit: 'Strategiegespräch planen',
    footerSecurity: 'Ihre Daten werden verschlüsselt und gemäß DSGVO geschützt.',
    types: {
      'web-sitesi': 'Webseite',
      'web-uygulamasi': 'Webanwendung (SaaS)',
      'ai-agent': 'KI-Agent',
      'ai-otomasyon': 'KI-Prozessautomatisierung',
      'reklam-sosyal': 'Werbung & Social Media',
      'diger': 'Sonstiges / Hybrid'
    }
  }
}

export default function CTABanner() {
  const { language } = useLanguage()
  const c = localDict[language] || localDict.tr

  const projectTypes = [
    { id: 'web-sitesi', label: c.types['web-sitesi'] },
    { id: 'web-uygulamasi', label: c.types['web-uygulamasi'] },
    { id: 'ai-agent', label: c.types['ai-agent'] },
    { id: 'ai-otomasyon', label: c.types['ai-otomasyon'] },
    { id: 'reklam-sosyal', label: c.types['reklam-sosyal'] },
    { id: 'diger', label: c.types['diger'] },
  ]

  const sectionRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  // Form States
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [projectType, setProjectType] = useState('web-sitesi')
  const [currencyCode, setCurrencyCode] = useState('TRY')
  const [budget, setBudget] = useState('mid')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el) } },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    // Basic validation
    if (!name.trim()) {
      setError(c.valName)
      return
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError(c.valEmail)
      return
    }
    if (phone.trim() && phone.trim().length < 9) {
      setError(c.valPhone)
      return
    }

    setLoading(true)
    try {
      const activeBudgetRanges = budgetRangesByCurrency[currencyCode] || budgetRangesByCurrency.TRY
      const selectedBudgetObj = activeBudgetRanges.find(b => b.id === budget)
      const selectedTypeLabel = projectTypes.find(p => p.id === projectType)?.label || 'Bilinmiyor'
      
      const res = await createPublicLead({
        name,
        email,
        phone: phone.trim() || undefined,
        company: company || undefined,
        source: `Iletisim Formu (${selectedTypeLabel})`,
        value: selectedBudgetObj?.approxVal || 0,
      })

      if (res.success) {
        setSubmitted(true)
      } else {
        setError(c.valError)
      }
    } catch (err) {
      console.error(err)
      setError(c.valConnError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" className="py-24 relative overflow-hidden border-t border-white/[0.04] bg-[#0A0A0F]">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(79,142,247,0.1) 0%, rgba(139,92,246,0.05) 50%, transparent 80%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-[#4F8EF7]/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] rounded-full bg-[#8B5CF6]/5 blur-3xl pointer-events-none" />

      <div
        ref={sectionRef}
        className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
          visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'
        }`}
      >
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          <div className="lg:col-span-5 space-y-6">
            <span className="tag-badge">
              <Sparkles className="w-3 h-3" />
              {c.badge}
            </span>
            <h2 className="heading-lg text-white mt-4 tracking-tight">
              {c.title1} <br />
              <span className="gradient-text">{c.title2}</span>
            </h2>
            <p className="text-[#94A3B8] text-base leading-relaxed">
              {c.desc}
            </p>

            <div className="pt-6 border-t border-white/[0.06] space-y-4">
              <div className="flex items-center gap-3 text-sm text-[#E2E8F0]">
                <div className="w-8 h-8 rounded-lg bg-[#4F8EF7]/15 flex items-center justify-center text-[#4F8EF7]">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <span>{c.point1}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#E2E8F0]">
                <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 flex items-center justify-center text-[#10B981]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>{c.point2}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#E2E8F0]">
                <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/15 flex items-center justify-center text-[#8B5CF6]">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span>{c.point3}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-6 text-xs text-[#64748B] font-medium">
              <div>{c.trust1}</div>
              <div>{c.trust2}</div>
              <div>{c.trust3}</div>
              <div>{c.trust4}</div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <GlowCard glowColor="purple" className="p-6 sm:p-8">
              {submitted ? (
                <div className="text-center py-12 space-y-6" style={{ animation: 'scaleIn 0.4s ease both' }}>
                  <div className="inline-flex w-16 h-16 rounded-full bg-[#10B981]/25 items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                    <Check className="w-8 h-8 text-[#10B981]" />
                  </div>
                  <h3 className="text-2xl font-black text-white font-['Outfit']">{c.successTitle}</h3>
                  <p className="text-[#94A3B8] max-w-md mx-auto text-sm leading-relaxed">
                    {c.successDesc1} <strong className="text-white">{name}</strong>, {c.successDesc2}
                  </p>
                  
                  {budget !== 'low' ? (
                    <div className="space-y-4 pt-6 border-t border-white/[0.06] text-center" style={{ animation: 'fadeIn 0.5s ease both' }}>
                      <p className="text-xs font-bold text-[#4F8EF7] uppercase tracking-wider flex items-center justify-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#FBBF24]" />
                        {c.priorityTitle}
                      </p>
                      <p className="text-[11px] text-[#94A3B8] leading-relaxed max-w-md mx-auto">
                        {c.priorityDesc}
                      </p>
                      <div className="w-full h-[360px] rounded-xl overflow-hidden border border-white/[0.08] bg-[#05050A]">
                        <iframe
                          src={`https://calendly.com/starwebflow/30min?embed_domain=localhost&embed_type=Inline&locale=${language}`}
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          title="StarWebFlow Toplantı Planlama"
                          className="w-full h-full opacity-90 hover:opacity-100 transition-opacity"
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[#64748B]">
                      {c.fallbackDesc}
                    </p>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="border-b border-white/[0.06] pb-4 mb-4">
                    <h3 className="text-lg font-bold text-white font-['Outfit']">{c.formTitle}</h3>
                    <p className="text-xs text-[#64748B] mt-1">{c.formSubtitle}</p>
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
                      {error}
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                        {c.labelName}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-3.5 text-[#475569]">
                          <User className="w-4 h-4" />
                        </span>
                        <input
                          suppressHydrationWarning
                          type="text"
                          required
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder={c.placeholderName}
                          className="w-full bg-[#0A0A0F]/60 border border-white/[0.06] rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-[#475569] focus:outline-none focus:border-[#4F8EF7]/50 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                        {c.labelEmail}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-3.5 text-[#475569]">
                          <Mail className="w-4 h-4" />
                        </span>
                        <input
                          suppressHydrationWarning
                          type="email"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder={c.placeholderEmail}
                          className="w-full bg-[#0A0A0F]/60 border border-white/[0.06] rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-[#475569] focus:outline-none focus:border-[#4F8EF7]/50 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                        {c.labelPhone} <span className="text-[#475569] normal-case">{c.optional}</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-3.5 text-[#475569]">
                          <Phone className="w-4 h-4" />
                        </span>
                        <input
                          suppressHydrationWarning
                          type="tel"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder={c.placeholderPhone}
                          className="w-full bg-[#0A0A0F]/60 border border-white/[0.06] rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-[#475569] focus:outline-none focus:border-[#4F8EF7]/50 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                        {c.labelCompany} <span className="text-[#475569] normal-case">{c.optional}</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-3.5 text-[#475569]">
                          <Building2 className="w-4 h-4" />
                        </span>
                        <input
                          suppressHydrationWarning
                          type="text"
                          value={company}
                          onChange={e => setCompany(e.target.value)}
                          placeholder={c.placeholderCompany}
                          className="w-full bg-[#0A0A0F]/60 border border-white/[0.06] rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-[#475569] focus:outline-none focus:border-[#4F8EF7]/50 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-3">
                      {c.labelType}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {projectTypes.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setProjectType(p.id)}
                          className={`px-3 py-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                            projectType === p.id
                              ? 'bg-[#8B5CF6]/15 border-[#8B5CF6]/40 text-[#8B5CF6]'
                              : 'border-white/[0.04] text-[#64748B] hover:border-white/20 hover:text-[#94A3B8]'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
                        {c.labelBudget}
                      </label>
                      <div className="flex gap-1 bg-[#0A0A0F]/80 p-0.5 rounded-lg border border-white/[0.04]">
                        {currencies.map(curr => (
                          <button
                            key={curr.code}
                            type="button"
                            onClick={() => {
                              setCurrencyCode(curr.code)
                            }}
                            className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all ${
                              currencyCode === curr.code
                                ? 'bg-[#4F8EF7]/20 text-[#4F8EF7] border border-[#4F8EF7]/30'
                                : 'text-[#64748B] hover:text-[#94A3B8] border border-transparent'
                            }`}
                          >
                            {curr.code}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {(budgetRangesByCurrency[currencyCode] || budgetRangesByCurrency.TRY).map(b => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setBudget(b.id)}
                          className={`px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                            budget === b.id
                              ? 'bg-[#4F8EF7]/15 border-[#4F8EF7]/40 text-[#4F8EF7]'
                              : 'border-white/[0.04] text-[#64748B] hover:border-white/20 hover:text-[#94A3B8]'
                          }`}
                        >
                          <span className="w-4 h-4 rounded bg-white/[0.04] flex items-center justify-center text-[10px] font-bold text-[#94A3B8]">
                            {currencies.find(curr => curr.code === currencyCode)?.symbol || '₺'}
                          </span>
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                      {c.labelMessage}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-[#475569]">
                        <HelpCircle className="w-4 h-4" />
                      </span>
                      <textarea
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder={c.placeholderMessage}
                        rows={3}
                        className="w-full bg-[#0A0A0F]/60 border border-white/[0.06] rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-[#475569] focus:outline-none focus:border-[#4F8EF7]/50 transition-all resize-none"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={loading}
                    className="w-full shadow-[0_0_20px_rgba(79,142,247,0.2)]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {c.btnSubmitting}
                      </>
                    ) : (
                      <>
                        {c.btnSubmit}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>

                  <div className="flex items-center gap-2 justify-center text-[10px] text-[#64748B]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                    {c.footerSecurity}
                  </div>
                </form>
              )}
            </GlowCard>
          </div>

        </div>
      </div>
    </section>
  )
}
