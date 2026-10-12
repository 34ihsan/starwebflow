'use client'

import { useState, FormEvent } from 'react'
import { createPublicLead } from '@/app/actions/lead'
import Button from '@/components/ui/Button'
import { Sparkles, ShieldCheck, Mail, User, Phone, Building2, Loader2, ArrowRight, X } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { useRecaptcha } from '@/hooks/useRecaptcha'

interface LeadFormModalProps {
  isOpen: boolean
  title?: string
  subtitle?: string
  source?: string
  value?: number
  onClose?: () => void
  onSubmitSuccess: (leadData: { name: string; email: string; phone?: string; company?: string }) => void
}

export default function LeadFormModal({
  isOpen,
  title = 'Raporunuz & Yol Haritanız Hazır!',
  subtitle = 'Canlı analiz sonuçlarını açmak ve hazırlanan PDF kopyasını e-postanıza göndermek için bilgilerinizi doğrulayın.',
  source = 'Simulation',
  value = 0,
  onClose,
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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop with Click to Close */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div
        className="relative w-full max-w-xl rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xl backdrop-blur-xl my-auto z-10 overflow-hidden transition-all"
        style={{ animation: 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both' }}
      >
        {/* Glow Effects */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-purple-100/50 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-indigo-100/50 blur-3xl pointer-events-none" />

        {/* Top Glow Highlight Line */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-3xl bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600"
        />

        {/* Close Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-200/80 transition-colors z-20 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Compact Header */}
        <div className="text-center mb-5 relative">
          <div className="inline-flex w-10 h-10 rounded-xl bg-purple-100 items-center justify-center shadow-xs mb-3">
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 font-['Outfit'] tracking-tight mb-1.5">
            {displayTitle}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            {displaySubtitle}
          </p>
        </div>

        {/* Form with 2-column grid layout for ergonomic screen fit */}
        <form onSubmit={handleSubmit} className="space-y-3.5 relative">
          {error && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {c.labelName}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={c.placeholderName}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-9 pr-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {c.labelEmail}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={c.placeholderEmail}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-9 pr-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all shadow-2xs"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Phone */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {c.labelPhone} <span className="text-slate-400 text-[9px] normal-case">{c.optional}</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={c.placeholderPhone}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-9 pr-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {c.labelCompany} <span className="text-slate-400 text-[9px] normal-case">{c.optional}</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400">
                  <Building2 className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder={c.placeholderCompany}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-9 pr-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Action button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            className="w-full mt-4 h-12 shadow-md text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white cursor-pointer"
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
          <div className="flex items-center gap-1.5 justify-center text-[10px] text-slate-500 pt-2 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            {c.securityNote}
          </div>
        </form>
      </div>
    </div>
  )
}
