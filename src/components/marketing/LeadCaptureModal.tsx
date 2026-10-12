'use client';

import { useState, useEffect } from 'react';
import { createLeadWithProposal } from '@/app/actions/lead';
import { X, ArrowRight, CheckCircle2, Sparkles, Shield, Bot, Globe2, ChevronRight, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecaptcha } from '@/hooks/useRecaptcha';
import { useRegion } from '@/lib/i18n/RegionContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { LanguageType } from '@/lib/i18n/dictionaries';

const DEFAULT_TENANT_ID = 'default-tenant';

const modalTranslations = {
  de: {
    badge: 'KI-Projektarchitektur-Berater',
    step: 'Schritt',
    title: 'Individuelle KI- & Web-Analyse in 30 Sekunden',
    subtitle: 'Erstellen Sie sofort einen maßgeschneiderten digitalen Transformations- und Angebotsleitfaden für Ihre Branche.',
    serviceLabel: '1. Benötigter Servicebereich',
    regionLabel: '2. Ihr Zielmarkt / Rechtsraum',
    industryLabel: '3. Ihre Branche',
    nextButton: 'Weiter: Analyse anfordern',
    nameLabel: 'Ihr Name / Firmenname *',
    namePlaceholder: 'Name oder Firmenname',
    emailLabel: 'Ihre E-Mail-Adresse *',
    emailPlaceholder: 'beispiel@unternehmen.de',
    phoneLabel: 'Telefon / WhatsApp (Optional)',
    phonePlaceholder: '+49 170 ...',
    backButton: '← Zurück',
    submitButton: 'Kostenlose Analyse anfordern',
    submitting: 'KI-Analyse wird erstellt...',
    legalNote: 'Ihre Daten werden nach deutschen DSGVO-, EU-GDPR- und KVKK-Standards geschützt. Kein Spam.',
    successBadge: 'Ihre Analysedatei ist bereit',
    successTitle: 'Anfrage erfolgreich eingegangen!',
    legalSuccess: 'Ihre Daten sind nach deutschen DSGVO-Standards geschützt.',
    closeAria: 'Schließen',
    services: [
      { id: 'Sub-Second Web Ekosistemi', label: 'Web & SaaS', icon: '🌐' },
      { id: 'Otonom AI Ajanları', label: 'KI-Agent & Bot', icon: '🤖' },
      { id: 'Kognitif İş Akışı Otomasyonu', label: 'n8n Automatisierung', icon: '⚙️' },
      { id: 'Veri Odaklı Büyüme', label: 'Growth Marketing', icon: '📈' },
    ],
    regions: [
      { id: 'Almanya & AB', label: '🇩🇪 Deutschland / EU', legal: 'DSGVO & GDPR' },
      { id: 'Türkiye', label: '🇹🇷 Türkei', legal: 'KVKK & ETK' },
      { id: 'Global', label: '🇪🇺 Global / Andere', legal: 'GDPR Global' },
    ],
    industries: [
      'Gesundheit & Medizin', 'E-Commerce & Handel', 'Bau & Architektur',
      'Recht & Beratung', 'Technologie & IT', 'Tourismus & Hotel',
      'Logistik & Transport', 'Industrie & Produktion', 'Andere'
    ]
  },
  en: {
    badge: 'AI Project Architecture Consultant',
    step: 'Step',
    title: 'Custom AI & Web Audit in 30 Seconds',
    subtitle: 'Instantly generate an enterprise digital transformation and pricing roadmap tailored to your industry.',
    serviceLabel: '1. Required Service Domain',
    regionLabel: '2. Target Market / Legal Region',
    industryLabel: '3. Your Industry',
    nextButton: 'Continue: Request Analysis',
    nameLabel: 'Your Name / Company Name *',
    namePlaceholder: 'Full name or company name',
    emailLabel: 'Business Email *',
    emailPlaceholder: 'name@company.com',
    phoneLabel: 'Phone / WhatsApp (Optional)',
    phonePlaceholder: '+49 170 ... or +1 ...',
    backButton: '← Back',
    submitButton: 'Get Free Audit & Proposal',
    submitting: 'Generating AI Audit...',
    legalNote: 'Your data is secured according to GDPR, DSGVO, and KVKK regulations. Zero spam.',
    successBadge: 'Your Audit File is Ready',
    successTitle: 'Request Received Successfully!',
    legalSuccess: 'Your data is encrypted under German DSGVO & EU GDPR standards.',
    closeAria: 'Close',
    services: [
      { id: 'Sub-Second Web Ekosistemi', label: 'Web & SaaS', icon: '🌐' },
      { id: 'Otonom AI Ajanları', label: 'AI Agent & Bot', icon: '🤖' },
      { id: 'Kognitif İş Akışı Otomasyonu', label: 'n8n Automation', icon: '⚙️' },
      { id: 'Veri Odaklı Büyüme', label: 'Growth Marketing', icon: '📈' },
    ],
    regions: [
      { id: 'Almanya & AB', label: '🇩🇪 Germany / EU', legal: 'DSGVO & GDPR' },
      { id: 'Türkiye', label: '🇹🇷 Turkey', legal: 'KVKK & ETK' },
      { id: 'Global', label: '🇪🇺 Global / Other', legal: 'GDPR Global' },
    ],
    industries: [
      'Health & Medical', 'E-Commerce & Retail', 'Construction & Architecture',
      'Legal & Consulting', 'Technology & IT', 'Tourism & Hospitality',
      'Logistics & Transport', 'Manufacturing & Industry', 'Other'
    ]
  },
  tr: {
    badge: 'AI Proje Mimarı Danışmanı',
    step: 'Adım',
    title: '30 Saniyede Özel AI & Web Analiz Raporu',
    subtitle: 'Sektörünüzün dinamiklerine özel hazırlanmış dijital dönüşüm ve fiyat teklifi şablonunu anında oluşturun.',
    serviceLabel: '1. İhtiyacınız Olan Hizmet Alanı',
    regionLabel: '2. Hedef Pazarınız / Yasal Bölgeniz',
    industryLabel: '3. Faaliyet Gösterdiğiniz Sektör',
    nextButton: 'Devam Et: Analiz Raporunu İste',
    nameLabel: 'Adınız Soyadınız / Şirket Adı *',
    namePlaceholder: 'Adınız veya Şirket Ünvanı',
    emailLabel: 'E-Posta Adresiniz *',
    emailPlaceholder: 'ornek@sirket.de veya .com',
    phoneLabel: 'Telefon / WhatsApp (Opsiyonel)',
    phonePlaceholder: '+49 170 ... veya +90 532 ...',
    backButton: '← Geri',
    submitButton: 'Ücretsiz Analizi Gönder',
    submitting: 'AI Raporu Hazırlanıyor...',
    legalNote: 'Verileriniz Almanya DSGVO, AB GDPR ve Türkiye KVKK standartlarında şifrelenir. Asla spam gönderilmez.',
    successBadge: 'Analiz Dosyanız Hazırlandı',
    successTitle: 'Talebiniz Başarıyla Alındı!',
    legalSuccess: 'Verileriniz Almanya DSGVO & KVKK standartlarında güvendedir.',
    closeAria: 'Kapat',
    services: [
      { id: 'Sub-Second Web Ekosistemi', label: 'Web & SaaS', icon: '🌐' },
      { id: 'Otonom AI Ajanları', label: 'AI Agent & Bot', icon: '🤖' },
      { id: 'Kognitif İş Akışı Otomasyonu', label: 'n8n Otomasyon', icon: '⚙️' },
      { id: 'Veri Odaklı Büyüme', label: 'Growth Advertising', icon: '📈' },
    ],
    regions: [
      { id: 'Almanya & AB', label: '🇩🇪 Almanya / AB', legal: 'DSGVO & GDPR' },
      { id: 'Türkiye', label: '🇹🇷 Türkiye', legal: 'KVKK & ETK' },
      { id: 'Global', label: '🇪🇺 Global / Diğer', legal: 'GDPR Global' },
    ],
    industries: [
      'Sağlık & Tıp', 'E-Ticaret & Perakende', 'İnşaat & Mimarlık',
      'Hukuk & Danışmanlık', 'Teknoloji & Bilişim', 'Turizm & Otelcilik',
      'Lojistik & Taşıma', 'Üretim & Sanayi', 'Diğer'
    ]
  }
};

export default function LeadCaptureModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { getToken } = useRecaptcha();
  const { config } = useRegion();
  const { language } = useLanguage();
  const tModal = modalTranslations[language] || modalTranslations.tr;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    industry: tModal.industries[0],
    serviceType: tModal.services[0].id,
    targetRegion: tModal.regions[0].id,
  });

  const servicesList = tModal.services;
  const regionsList = tModal.regions;
  const industriesList = tModal.industries;

  useEffect(() => {
    // Keep defaults synced if language changes before submission
    setFormData((prev) => ({
      ...prev,
      industry: industriesList.includes(prev.industry) ? prev.industry : industriesList[0]
    }));
  }, [language, industriesList]);

  useEffect(() => {
    // 1. Time delay (45 seconds)
    const timer = setTimeout(() => {
      const dismissed = localStorage.getItem('starwebflow-lead-modal-dismissed');
      if (!hasTriggered && !dismissed) {
        setIsOpen(true);
        setHasTriggered(true);
      }
    }, 45000);

    // 2. Exit intent trigger
    const handleMouseLeave = (e: MouseEvent) => {
      const dismissed = localStorage.getItem('starwebflow-lead-modal-dismissed');
      if (e.clientY <= 0 && !hasTriggered && !dismissed) {
        setIsOpen(true);
        setHasTriggered(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasTriggered]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('starwebflow-lead-modal-dismissed', 'true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let recaptchaToken: string | undefined;
    try {
      recaptchaToken = await getToken('lead_capture_modal');
    } catch (err) {
      console.error('reCAPTCHA error:', err);
    }

    const res = await createLeadWithProposal({
      tenantId: DEFAULT_TENANT_ID,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      industry: `${formData.industry} (${formData.targetRegion})`,
      serviceType: formData.serviceType,
      source: 'AI Exit Intent Modal',
      recaptchaToken,
    });

    setIsSubmitting(false);

    if (res.success) {
      setIsSuccess(true);
      setTimeout(() => handleClose(), 6000);
    } else {
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            onClick={handleClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-xl bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-[0_25px_70px_rgba(15,23,42,0.2)] flex flex-col font-sans"
          >
            {/* Top Accent */}
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600" />

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-full transition-all duration-200 z-20 cursor-pointer"
              aria-label={tModal.closeAria}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Body */}
            <div className="p-6 sm:p-8">
              {isSuccess ? (
                /* Success View */
                <div className="text-center py-8 flex flex-col items-center">
                  <div className="w-20 h-20 bg-emerald-100 border border-emerald-200 rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase tracking-widest mb-3">
                    {tModal.successBadge}
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2 font-['Outfit']">{tModal.successTitle}</h3>
                  <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed mb-6">
                    <strong className="text-slate-900">{formData.industry}</strong> • <strong className="text-purple-600">{formData.serviceType}</strong>
                    <br />
                    <span>{formData.email}</span>
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{tModal.legalSuccess}</span>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Header Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 uppercase tracking-widest flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-purple-600" />
                      {tModal.badge}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-auto font-mono font-medium">{tModal.step} {step}/2</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1.5 font-['Outfit']">
                    {tModal.title}
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm mb-6 leading-relaxed">
                    {tModal.subtitle}
                  </p>

                  <form onSubmit={handleSubmit}>
                    {step === 1 ? (
                      /* STEP 1: Quick Selection */
                      <div className="space-y-5">
                        {/* Service Selection */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                            {tModal.serviceLabel}
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {servicesList.map((srv) => (
                              <button
                                key={srv.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, serviceType: srv.id })}
                                className={`flex items-center gap-2 p-3 rounded-xl border text-left text-xs transition-all cursor-pointer font-medium ${
                                  formData.serviceType === srv.id
                                    ? 'bg-purple-600 border-purple-600 text-white font-bold shadow-md'
                                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100/70'
                                }`}
                              >
                                <span className="text-base">{srv.icon}</span>
                                <span>{srv.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Target Region */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                            {tModal.regionLabel}
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {regionsList.map((reg) => (
                              <button
                                key={reg.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, targetRegion: reg.id })}
                                className={`p-2.5 rounded-xl border text-center text-xs transition-all flex flex-col items-center gap-0.5 cursor-pointer font-medium ${
                                  formData.targetRegion === reg.id
                                    ? 'bg-purple-50 border-purple-400 text-purple-900 font-bold shadow-2xs'
                                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/70'
                                }`}
                              >
                                <span className="font-semibold">{reg.label}</span>
                                <span className="text-[9px] text-slate-500 font-mono">{reg.legal}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Industry */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                            {tModal.industryLabel}
                          </label>
                          <select
                            value={formData.industry}
                            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:border-purple-600 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all shadow-2xs cursor-pointer"
                          >
                            {industriesList.map((ind) => (
                              <option key={ind} value={ind} className="bg-white text-slate-900">{ind}</option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="w-full mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group text-sm cursor-pointer"
                        >
                          <span>{tModal.nextButton}</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    ) : (
                      /* STEP 2: Contact Info */
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">{tModal.nameLabel}</label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all shadow-2xs"
                            placeholder={tModal.namePlaceholder}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">{tModal.emailLabel}</label>
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all shadow-2xs"
                            placeholder={tModal.emailPlaceholder}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">{tModal.phoneLabel}</label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all shadow-2xs"
                            placeholder={tModal.phonePlaceholder}
                          />
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3.5 px-4 rounded-xl text-xs transition-colors border border-slate-200 cursor-pointer"
                          >
                            {tModal.backButton}
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-2/3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-70 text-sm cursor-pointer"
                          >
                            {isSubmitting ? (
                              <span className="flex items-center gap-2">
                                <Zap className="w-4 h-4 animate-spin text-purple-200" />
                                {tModal.submitting}
                              </span>
                            ) : (
                              <>
                                <span>{tModal.submitButton}</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                              </>
                            )}
                          </button>
                        </div>

                        {/* Legal Trust Footer */}
                        <div className="pt-2 border-t border-slate-200 flex items-center gap-2 text-[10px] text-slate-500 leading-normal">
                          <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span>{tModal.legalNote}</span>
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
