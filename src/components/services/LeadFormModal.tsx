'use client'

import { useState, FormEvent } from 'react'
import { createPublicLead } from '@/app/actions/lead'
import Button from '@/components/ui/Button'
import { Sparkles, ShieldCheck, Mail, User, Phone, Building2, Loader2, ArrowRight } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { useRecaptcha } from '@/hooks/useRecaptcha'

interface LeadFormModalProps {
  isOpen: boolean
  title?: string
  subtitle?: string
  source?: string
  value?: number
  onSubmitSuccess: (leadData: { name: string; email: string; phone?: string; company?: string }) => void
}

export default function LeadFormModal({
  isOpen,
  title = 'Raporunuz & Yol Haritanız Hazır!',
  subtitle = 'Canlı analiz sonuçlarını açmak ve hazırlanan PDF kopyasını e-postanıza göndermek için bilgilerinizi doğrulayın.',
  source = 'Simulation',
  value = 0,
  onSubmitSuccess,
}: LeadFormModalProps) {
  const { language } = useLanguage()
  const { getToken } = useRecaptcha()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const localDict = {
    tr: {
      title: 'Raporunuz & Yol Haritanız Hazır!',
      subtitle: 'Canlı analiz sonuçlarını açmak ve hazırlanan PDF kopyasını e-postanıza göndermek için bilgilerinizi doğrulayın.',
      valName: 'Lütfen adınızı ve soyadınızı girin.',
      valEmail: 'Geçerli bir e-posta adresi girin.',
      valPhone: 'Geçerli bir telefon numarası girin.',
      valError: 'Bir hata oluştu, lütfen tekrar deneyin.',
      valConnError: 'Bağlantı hatası oluştu.',
      labelName: 'Ad Soyad',
      placeholderName: 'Örn: Ahmet Yılmaz',
      labelEmail: 'E-posta Adresi',
      placeholderEmail: 'Örn: ahmet@sirketiniz.com',
      labelPhone: 'Telefon Numarası',
      placeholderPhone: 'Örn: 0555 123 4567',
      labelCompany: 'Şirket Adı',
      placeholderCompany: 'Örn: Yılmaz A.Ş.',
      optional: '(Opsiyonel)',
      btnLoading: 'Rapor Açılıyor...',
      btnSubmit: 'Analiz Sonuçlarını Göster',
      securityNote: 'Verileriniz KVKK uyumlu olarak şifrelenir, asla 3. şahıslarla paylaşılmaz.'
    },
    en: {
      title: 'Your Report & Roadmap is Ready!',
      subtitle: 'Verify your information to access live analysis results and receive the PDF copy in your email.',
      valName: 'Please enter your name and surname.',
      valEmail: 'Please enter a valid email address.',
      valPhone: 'Please enter a valid phone number.',
      valError: 'An error occurred, please try again.',
      valConnError: 'Connection error occurred.',
      labelName: 'Full Name',
      placeholderName: 'e.g. John Doe',
      labelEmail: 'Email Address',
      placeholderEmail: 'e.g. john@yourcompany.com',
      labelPhone: 'Phone Number',
      placeholderPhone: 'e.g. +1 555 123 4567',
      labelCompany: 'Company Name',
      placeholderCompany: 'e.g. Acme Inc.',
      optional: '(Optional)',
      btnLoading: 'Opening Report...',
      btnSubmit: 'Show Analysis Results',
      securityNote: 'Your data is encrypted in compliance with GDPR and never shared.'
    },
    de: {
      title: 'Ihr Bericht & Ihre Roadmap sind bereit!',
      subtitle: 'Bestätigen Sie Ihre Angaben, um auf die Live-Analyseergebnisse zuzugreifen und das PDF per E-Mail zu erhalten.',
      valName: 'Bitte geben Sie Ihren Vor- und Nachnamen ein.',
      valEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
      valPhone: 'Bitte geben Sie eine gültige Telefonnummer ein.',
      valError: 'Ein Fehler ist aufgetreten, bitte versuchen Sie es erneut.',
      valConnError: 'Verbindungsfehler aufgetreten.',
      labelName: 'Vollständiger Name',
      placeholderName: 'z.B. Max Mustermann',
      labelEmail: 'E-Mail-Adresse',
      placeholderEmail: 'z.B. max@ihrefirma.de',
      labelPhone: 'Telefonnummer',
      placeholderPhone: 'z.B. +49 151 12345678',
      labelCompany: 'Firmenname',
      placeholderCompany: 'z.B. Muster GmbH',
      optional: '(Optional)',
      btnLoading: 'Bericht wird geöffnet...',
      btnSubmit: 'Analyseergebnisse anzeigen',
      securityNote: 'Ihre Daten werden DSGVO-konform verschlüsselt und niemals an Dritte weitergegeben.'
    }
  }
  const c = localDict[language] || localDict.tr

  const displayTitle = title === 'Raporunuz & Yol Haritanız Hazır!' ? c.title : title
  const displaySubtitle = subtitle === 'Canlı analiz sonuçlarını açmak ve hazırlanan PDF kopyasını e-postanıza göndermek için bilgilerinizi doğrulayın.' ? c.subtitle : subtitle

  if (!isOpen) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    // Basic Validation
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
      const recaptchaToken = await getToken('lead_form_modal')
      const res = await createPublicLead({
        name,
        email,
        phone,
        company: company || undefined,
        source,
        value,
        recaptchaToken,
      })

      if (res.success) {
        // E-posta bildirimi gönder (admin + ziyaretçiye)
        fetch('/api/email/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            phone,
            company: company || undefined,
            projectType: source,
            budget: value ? value.toString() : undefined,
            message: 'Bu lead servis modal/popup üzerinden geldi.',
            language,
          }),
        }).catch(console.error)

        onSubmitSuccess({ name, email, phone, company })
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#0A0A0F]/90 backdrop-blur-md" />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#12121F]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl overflow-hidden"
        style={{ animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both' }}
      >
        {/* Glow Effects */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#4F8EF7]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-[#8B5CF6]/10 blur-3xl pointer-events-none" />

        {/* Top Glow Highlight */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
          }}
        />

        {/* Header */}
        <div className="text-center mb-6 relative">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4F8EF7] to-[#8B5CF6] items-center justify-center shadow-[0_0_20px_rgba(79,142,247,0.3)] mb-4">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white font-['Outfit'] tracking-tight mb-2">
            {displayTitle}
          </h3>
          <p className="text-sm text-[#94A3B8] leading-relaxed">
            {displaySubtitle}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
              {c.labelName}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3.5 text-[#475569]">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={c.placeholderName}
                className="w-full bg-[#0A0A0F]/60 border border-white/[0.06] rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-[#475569] focus:outline-none focus:border-[#4F8EF7]/50 focus:ring-1 focus:ring-[#4F8EF7]/50 transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
              {c.labelEmail}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3.5 text-[#475569]">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={c.placeholderEmail}
                className="w-full bg-[#0A0A0F]/60 border border-white/[0.06] rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-[#475569] focus:outline-none focus:border-[#4F8EF7]/50 focus:ring-1 focus:ring-[#4F8EF7]/50 transition-all"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
              {c.labelPhone} <span className="text-[#475569] text-[10px] normal-case">{c.optional}</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3.5 text-[#475569]">
                <Phone className="w-4 h-4" />
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={c.placeholderPhone}
                className="w-full bg-[#0A0A0F]/60 border border-white/[0.06] rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-[#475569] focus:outline-none focus:border-[#4F8EF7]/50 focus:ring-1 focus:ring-[#4F8EF7]/50 transition-all"
              />
            </div>
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
              {c.labelCompany} <span className="text-[#475569] text-[10px] normal-case">{c.optional}</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3.5 text-[#475569]">
                <Building2 className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder={c.placeholderCompany}
                className="w-full bg-[#0A0A0F]/60 border border-white/[0.06] rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-[#475569] focus:outline-none focus:border-[#4F8EF7]/50 focus:ring-1 focus:ring-[#4F8EF7]/50 transition-all"
              />
            </div>
          </div>

          {/* Action button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            className="w-full mt-6 shadow-[0_0_20px_rgba(79,142,247,0.2)]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {c.btnLoading}
              </>
            ) : (
              <>
                {c.btnSubmit}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>

          {/* Security note */}
          <div className="flex items-center gap-2 justify-center text-[10px] text-[#64748B] mt-4">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
            {c.securityNote}
          </div>
        </form>
      </div>
    </div>
  )
}
