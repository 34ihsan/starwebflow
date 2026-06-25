'use client'

import { useState, useEffect } from 'react'
import { Cookie, Shield, Settings, Check, X, Info, ExternalLink } from 'lucide-react'
import Button from './Button'

type ConsentSettings = {
  essential: boolean
  analytics: boolean
  marketing: boolean
  functional: boolean
}

type Language = 'DE' | 'EN' | 'TR'

const translations = {
  DE: {
    title: 'Cookie-Einstellungen & Datenschutz',
    description: 'Wir nutzen Cookies und ähnliche Technologien, um das Nutzererlebnis auf unserer Website zu verbessern, Zugriffe zu analysieren und personalisierte Werbung anzuzeigen. Gemäß DSGVO (GDPR) und TDDDG entscheiden Sie, welche Cookies Sie zulassen möchten.',
    essentialTitle: 'Essentiell (Notwendig)',
    essentialDesc: 'Diese Cookies sind für den technischen Betrieb der Website zwingend erforderlich (z.B. Speicherung dieser Einstellungen, Sitzungs-ID, CSRF-Schutz) und können nicht deaktiviert werden.',
    analyticsTitle: 'Analyse & Statistik',
    analyticsDesc: 'Ermöglicht uns die anonyme Messung von Besuchen, Verweildauer und Interaktionen (z.B. ROI-Rechner-Nutzung), um unsere Website kontinuierlich zu optimieren.',
    marketingTitle: 'Marketing & Werbung',
    marketingDesc: 'Wird verwendet, um relevante Anzeigen auf Drittseiten (z.B. Google Ads, Meta) zu schalten und den Erfolg unserer Werbekampagnen zu messen.',
    functionalTitle: 'Funktionalität & Personalisierung',
    functionalDesc: 'Ermöglicht komfortable Zusatzfunktionen (z.B. Speicherung der gewählten Währung im ROI-Rechner oder Chatbot-Verlauf).',
    acceptAll: 'Alle akzeptieren',
    rejectAll: 'Alle ablehnen',
    saveSelection: 'Auswahl speichern',
    customize: 'Einstellungen anpassen',
    privacyPolicy: 'Datenschutzerklärung',
    imprint: 'Impressum',
    legalNote: 'Diese Website richtet sich nach den strengen Vorgaben der DSGVO. Sie können Ihre Einwilligung jederzeit widerrufen.',
    consentUpdated: 'Cookie-Einstellungen aktualisiert.',
  },
  EN: {
    title: 'Cookie Consent & Privacy',
    description: 'We use cookies and similar technologies to enhance your experience, analyze traffic, and personalize ads. In accordance with GDPR, you choose which cookies to allow.',
    essentialTitle: 'Essential (Required)',
    essentialDesc: 'Necessary for the technical operation of the website (e.g. saving consent settings, session security) and cannot be deactivated.',
    analyticsTitle: 'Analytics & Performance',
    analyticsDesc: 'Allows us to anonymously measure visits, session times, and simulator usage to improve our platform.',
    marketingTitle: 'Marketing & Target Ads',
    marketingDesc: 'Used to display relevant advertisements on third-party channels (Google, Meta) and measure campaign conversions.',
    functionalTitle: 'Functional & Preferences',
    functionalDesc: 'Enables extended features like saving your preferred currency inside calculators or maintaining your chatbot context.',
    acceptAll: 'Accept All',
    rejectAll: 'Reject All',
    saveSelection: 'Save Selection',
    customize: 'Customize Settings',
    privacyPolicy: 'Privacy Policy',
    imprint: 'Imprint',
    legalNote: 'This website complies with GDPR regulations. You can modify or withdraw your consent at any time.',
    consentUpdated: 'Cookie preferences updated.',
  },
  TR: {
    title: 'Çerez Ayarları ve Gizlilik',
    description: 'Deneyiminizi geliştirmek, site trafiğini analiz etmek ve kişiselleştirilmiş reklamlar göstermek için çerezler kullanıyoruz. KVKK ve GDPR kapsamında hangi çerezlere izin vereceğinizi seçebilirsiniz.',
    essentialTitle: 'Zorunlu Çerezler',
    essentialDesc: 'Web sitesinin teknik olarak çalışması için gereklidir (örneğin bu çerez tercihlerinizin kaydedilmesi, oturum güvenliği vb.) ve kapatılamaz.',
    analyticsTitle: 'Analiz ve İstatistik',
    analyticsDesc: 'Ziyaretçi sayılarını, sitede kalma sürelerini ve simülatör etkileşimlerini anonim olarak ölçerek siteyi optimize etmemizi sağlar.',
    marketingTitle: 'Pazarlama ve Reklam',
    marketingDesc: 'Google ve Meta gibi mecralarda ilgi alanlarınıza uygun reklamlar göstermek ve kampanya dönüşümlerini ölçmek için kullanılır.',
    functionalTitle: 'Fonksiyonel Çerezler',
    functionalDesc: 'Hesaplayıcıdaki para birimi tercihiniz veya sohbet botu geçmişiniz gibi gelişmiş özellikleri aktif tutmamızı sağlar.',
    acceptAll: 'Hepsini Kabul Et',
    rejectAll: 'Hepsini Reddet',
    saveSelection: 'Seçimi Kaydet',
    customize: 'Ayarları Özelleştir',
    privacyPolicy: 'Gizlilik Politikası',
    imprint: 'Künye (Impressum)',
    legalNote: 'Bu web sitesi GDPR ve TDDDG yönetmeliklerine uygundur. Tercihlerinizi istediğiniz zaman değiştirebilirsiniz.',
    consentUpdated: 'Çerez tercihleri güncellendi.',
  }
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showCustomize, setShowCustomize] = useState(false)
  const [lang, setLang] = useState<Language>('DE')
  const [settings, setSettings] = useState<ConsentSettings>({
    essential: true,
    analytics: false,
    marketing: false,
    functional: false,
  })
  const [toastVisible, setToastVisible] = useState(false)

  useEffect(() => {
    // Check if consent is already saved in localStorage
    const savedConsent = localStorage.getItem('starwebflow-cookie-consent')
    if (savedConsent) {
      try {
        const parsed = JSON.parse(savedConsent)
        setSettings(parsed)
        // Apply consent settings to third-party scripts (Google Consent Mode, etc.)
        applyConsentToScripts(parsed)
      } catch (e) {
        setShowBanner(true)
      }
    } else {
      // Delay display slightly for a more premium look
      const timer = setTimeout(() => {
        setShowBanner(true)
      }, 1000)
      return () => clearTimeout(timer)
    }

    // Detect browser language
    const browserLang = navigator.language.split('-')[0].toUpperCase()
    if (browserLang === 'TR') setLang('TR')
    else if (browserLang === 'DE') setLang('DE')
    else setLang('EN')
  }, [])

  const applyConsentToScripts = (consent: ConsentSettings) => {
    if (typeof window === 'undefined') return
    
    // Configure Google Consent Mode v2 if window.gtag exists
    const win = window as any
    if (win.gtag) {
      win.gtag('consent', 'update', {
        analytics_storage: consent.analytics ? 'granted' : 'denied',
        ad_storage: consent.marketing ? 'granted' : 'denied',
        ad_user_data: consent.marketing ? 'granted' : 'denied',
        ad_personalization: consent.marketing ? 'granted' : 'denied',
        personalization_storage: consent.functional ? 'granted' : 'denied',
      })
    }

    // Store custom cookie consent event for other dynamic parts of the app
    const event = new CustomEvent('cookieConsentChange', { detail: consent })
    window.dispatchEvent(event)
  }

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
    }
    setSettings(allAccepted)
    saveConsent(allAccepted)
  }

  const handleRejectAll = () => {
    const allRejected = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
    }
    setSettings(allRejected)
    saveConsent(allRejected)
  }

  const handleSaveSelection = () => {
    saveConsent(settings)
  }

  const saveConsent = (consent: ConsentSettings) => {
    localStorage.setItem('starwebflow-cookie-consent', JSON.stringify(consent))
    applyConsentToScripts(consent)
    setShowBanner(false)
    setShowCustomize(false)
    
    // Show quick confirmation toast
    setToastVisible(true)
    setTimeout(() => {
      setToastVisible(false)
    }, 3000)
  }

  const toggleSetting = (key: keyof ConsentSettings) => {
    if (key === 'essential') return // Cannot be toggled
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const t = translations[lang]

  if (!showBanner && !toastVisible) {
    // Return floating trigger button in bottom-left corner so users can revoke/change consent at any time (DSGVO Requirement)
    return (
      <button
        onClick={() => setShowBanner(true)}
        className="fixed bottom-6 left-6 z-40 p-3 rounded-full bg-[#12121F]/90 border border-white/[0.08] hover:border-[#4F8EF7]/40 text-[#4F8EF7] shadow-xl hover:shadow-[#4F8EF7]/10 backdrop-blur-md transition-all group"
        aria-label="Cookie-Einstellungen"
        title="Cookie-Einstellungen"
      >
        <Cookie className="w-5 h-5 group-hover:rotate-12 transition-transform" />
      </button>
    )
  }

  return (
    <>
      {/* Toast Notification */}
      {toastVisible && (
        <div 
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-semibold shadow-lg backdrop-blur-md"
          style={{ animation: 'slideInUp 0.3s ease both' }}
        >
          <Check className="w-4 h-4" />
          <span>{t.consentUpdated}</span>
        </div>
      )}

      {/* Cookie Banner Overlay */}
      {showBanner && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-[#000]/60 backdrop-blur-sm">
          {/* Modal Container */}
          <div
            className="w-full max-w-2xl bg-[#0F0F1A]/95 border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl max-h-[90vh] overflow-y-auto relative"
            style={{ animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both' }}
          >
            {/* Glow spots */}
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#4F8EF7]/5 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-[#8B5CF6]/5 blur-3xl pointer-events-none" />

            {/* Language Selection */}
            <div className="flex justify-between items-center mb-6 border-b border-white/[0.06] pb-4">
              <div className="flex items-center gap-2 text-[#4F8EF7]">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-bold font-['Outfit'] tracking-wide uppercase">DSGVO Compliant Consent</span>
              </div>
              <div className="flex gap-1.5 bg-[#000]/30 p-0.5 rounded-lg border border-white/[0.04]">
                {(['DE', 'EN', 'TR'] as Language[]).map(l => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-all ${
                      lang === l
                        ? 'bg-[#4F8EF7]/20 text-[#4F8EF7] border border-[#4F8EF7]/30'
                        : 'text-[#64748B] hover:text-[#94A3B8]'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Banner Header */}
            <div className="space-y-3 mb-6">
              <h3 className="text-lg sm:text-xl font-black text-white font-['Outfit'] tracking-tight flex items-center gap-2">
                <Cookie className="w-5 h-5 text-[#8B5CF6]" />
                {t.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                {t.description}
              </p>
            </div>

            {/* Customize Expandable Settings */}
            {showCustomize && (
              <div className="space-y-4 my-6 bg-[#000]/20 p-4 rounded-xl border border-white/[0.04] transition-all">
                {/* 1. Essential */}
                <div className="flex gap-4 items-start pb-4 border-b border-white/[0.04]">
                  <div className="pt-1">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-white/50">
                      <Check className="w-4 h-4 text-[#10B981]" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t.essentialTitle}</h4>
                      <span className="text-[9px] bg-[#10B981]/15 text-[#10B981] px-2 py-0.5 rounded font-bold uppercase">Aktiv</span>
                    </div>
                    <p className="text-[11px] text-[#64748B] leading-relaxed">{t.essentialDesc}</p>
                  </div>
                </div>

                {/* 2. Analytics */}
                <div className="flex gap-4 items-start pb-4 border-b border-white/[0.04]">
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => toggleSetting('analytics')}
                      className={`w-9 h-5 rounded-full p-0.5 transition-all duration-300 focus:outline-none ${
                        settings.analytics ? 'bg-[#4F8EF7]' : 'bg-[#1E1E2F]'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-all duration-300 ${
                        settings.analytics ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  <div className="flex-1 space-y-1" onClick={() => toggleSetting('analytics')}>
                    <div className="flex items-center justify-between cursor-pointer">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t.analyticsTitle}</h4>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                        settings.analytics ? 'bg-[#4F8EF7]/15 text-[#4F8EF7]' : 'bg-white/5 text-[#64748B]'
                      }`}>
                        {settings.analytics ? 'Aktiv' : 'Deaktiviert'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748B] leading-relaxed cursor-pointer">{t.analyticsDesc}</p>
                  </div>
                </div>

                {/* 3. Marketing */}
                <div className="flex gap-4 items-start pb-4 border-b border-white/[0.04]">
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => toggleSetting('marketing')}
                      className={`w-9 h-5 rounded-full p-0.5 transition-all duration-300 focus:outline-none ${
                        settings.marketing ? 'bg-[#8B5CF6]' : 'bg-[#1E1E2F]'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-all duration-300 ${
                        settings.marketing ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  <div className="flex-1 space-y-1" onClick={() => toggleSetting('marketing')}>
                    <div className="flex items-center justify-between cursor-pointer">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t.marketingTitle}</h4>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                        settings.marketing ? 'bg-[#8B5CF6]/15 text-[#8B5CF6]' : 'bg-white/5 text-[#64748B]'
                      }`}>
                        {settings.marketing ? 'Aktiv' : 'Deaktiviert'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748B] leading-relaxed cursor-pointer">{t.marketingDesc}</p>
                  </div>
                </div>

                {/* 4. Functional */}
                <div className="flex gap-4 items-start">
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => toggleSetting('functional')}
                      className={`w-9 h-5 rounded-full p-0.5 transition-all duration-300 focus:outline-none ${
                        settings.functional ? 'bg-indigo-500' : 'bg-[#1E1E2F]'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-all duration-300 ${
                        settings.functional ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  <div className="flex-1 space-y-1" onClick={() => toggleSetting('functional')}>
                    <div className="flex items-center justify-between cursor-pointer">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t.functionalTitle}</h4>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                        settings.functional ? 'bg-indigo-500/15 text-indigo-400' : 'bg-white/5 text-[#64748B]'
                      }`}>
                        {settings.functional ? 'Aktiv' : 'Deaktiviert'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748B] leading-relaxed cursor-pointer">{t.functionalDesc}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Buttons Group (compliant: Equal Weight & Clear Reject Button) */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button
                variant="primary"
                onClick={handleAcceptAll}
                className="w-full sm:order-3 shadow-[0_0_20px_rgba(79,142,247,0.15)] text-xs py-3"
              >
                {t.acceptAll}
              </Button>
              <Button
                variant="outline"
                onClick={handleRejectAll}
                className="w-full sm:order-2 border-white/[0.08] hover:bg-white/5 text-xs py-3 text-white"
              >
                {t.rejectAll}
              </Button>
              
              {showCustomize ? (
                <Button
                  variant="outline"
                  onClick={handleSaveSelection}
                  className="w-full sm:order-1 border-[#4F8EF7]/30 text-[#4F8EF7] hover:bg-[#4F8EF7]/10 text-xs py-3"
                >
                  <Check className="w-3.5 h-3.5" />
                  {t.saveSelection}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowCustomize(true)}
                  className="w-full sm:order-1 border-white/[0.08] hover:bg-white/5 text-xs py-3 text-[#94A3B8]"
                >
                  <Settings className="w-3.5 h-3.5" />
                  {t.customize}
                </Button>
              )}
            </div>

            {/* Footer / Legal Links */}
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] text-[#64748B]">
              <span className="text-center sm:text-left">{t.legalNote}</span>
              <div className="flex items-center gap-4">
                <a 
                  href="/impressum" 
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  {t.imprint}
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
                <a 
                  href="/datenschutz" 
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  {t.privacyPolicy}
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
