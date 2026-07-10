'use client';

import { useState } from 'react';
import { createLeadWithProposal } from '@/app/actions/lead';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useRecaptcha } from '@/hooks/useRecaptcha';

const DEFAULT_TENANT_ID = 'default-tenant'; // To be replaced dynamically if needed

const tDict = {
  tr: {
    title: 'Sektörünüze Özel',
    titleGradient: 'Ücretsiz Analiz Raporu',
    desc: 'Formu doldurun, sizin sektörünüz için hazırladığımız özel teklifi ve başarı yol haritasını anında e-postanıza gönderelim. Hiçbir yükümlülük içermez.',
    features: ['Rakiplerinizin dijital ayak izi', 'Satışları artıracak teknik tavsiyeler', 'Şeffaf fiyatlandırma'],
    nameLabel: 'Adınız Soyadınız',
    namePlaceholder: 'Örn: Ahmet Yılmaz',
    emailLabel: 'İş E-Posta Adresiniz',
    emailPlaceholder: 'ornek@sirketiniz.com',
    serviceLabel: 'Hizmet Türü',
    industryLabel: 'Sektörünüz',
    otherIndustryPlaceholder: 'Lütfen sektörünüzü yazın',
    submitBtn: 'Raporu E-Postama Gönder',
    submittingBtn: 'Hazırlanıyor...',
    successTitle: 'Talebiniz Başarıyla Alındı!',
    successDesc: (industry: string, service: string) => `${industry} sektörüne özel hazırladığımız detaylı analiz ve ${service} fiyat teklifinizi e-posta adresinize gönderdik. Lütfen gelen kutunuzu (veya gereksiz klasörünü) kontrol edin.`,
    errorAlert: 'Talebiniz alınırken bir hata oluştu.',
    other: 'Diğer'
  },
  en: {
    title: 'Free Analysis Report',
    titleGradient: 'Customized for Your Industry',
    desc: 'Fill out the form, and we will instantly send your custom quote and success roadmap tailored to your industry to your email. No obligation.',
    features: ['Your competitors\' digital footprint', 'Technical tips to boost sales', 'Transparent pricing'],
    nameLabel: 'Full Name',
    namePlaceholder: 'e.g. John Doe',
    emailLabel: 'Business Email Address',
    emailPlaceholder: 'example@yourcompany.com',
    serviceLabel: 'Service Type',
    industryLabel: 'Your Industry',
    otherIndustryPlaceholder: 'Please type your industry',
    submitBtn: 'Send Report to My Email',
    submittingBtn: 'Preparing...',
    successTitle: 'Request Received Successfully!',
    successDesc: (industry: string, service: string) => `We have sent your detailed analysis report and ${service} price quote customized for the ${industry} industry to your email address. Please check your inbox (or spam folder).`,
    errorAlert: 'An error occurred while receiving your request.',
    other: 'Other'
  },
  de: {
    title: 'Kostenloser Analysebericht',
    titleGradient: 'Speziell für Ihre Branche',
    desc: 'Füllen Sie das Formular aus und wir senden Ihnen umgehend Ihr individuelles Angebot und Ihre Erfolgs-Roadmap direkt per E-Mail. Unverbindlich.',
    features: ['Der digitale Fußabdruck Ihrer Konkurrenten', 'Technische Tipps zur Umsatzsteigerung', 'Transparente Preise'],
    nameLabel: 'Vollständiger Name',
    namePlaceholder: 'z.B. Max Mustermann',
    emailLabel: 'Geschäftliche E-Mail-Adresse',
    emailPlaceholder: 'beispiel@ihrefirma.de',
    serviceLabel: 'Dienstleistungsart',
    industryLabel: 'Ihre Branche',
    otherIndustryPlaceholder: 'Bitte geben Sie Ihre Branche ein',
    submitBtn: 'Bericht per E-Mail senden',
    submittingBtn: 'Wird vorbereitet...',
    successTitle: 'Anfrage erfolgreich empfangen!',
    successDesc: (industry: string, service: string) => `Wir haben Ihren detaillierten Analysebericht und Ihr ${service}-Preisingebot, angepasst an die Branche ${industry}, an Ihre E-Mail-Adresse gesendet. Bitte überprüfen Sie Ihren Posteingang (oder Spam-Ordner).`,
    errorAlert: 'Beim Empfang Ihrer Anfrage ist ein Fehler aufgetreten.',
    other: 'Andere'
  }
};

export default function QuickQuoteForm() {
  const { language } = useLanguage();
  const tLocal = tDict[language] || tDict.tr;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { getToken } = useRecaptcha();

  const servicesList = language === 'tr' 
    ? ['Web Tasarım', 'SEO', 'Sosyal Medya', 'Mobil Uygulama', 'E-Ticaret', 'Özel Yazılım', 'AI Otomasyon', 'AI Agents']
    : language === 'de'
    ? ['Webdesign', 'SEO', 'Social Media', 'Mobile App', 'E-Commerce', 'Spezialsoftware', 'KI-Automatisierung', 'KI-Agenten']
    : ['Web Design', 'SEO', 'Social Media', 'Mobile App', 'E-Commerce', 'Custom Software', 'AI Automation', 'AI Agents'];

  const industriesList = language === 'tr'
    ? ['Sağlık & Tıp', 'E-Ticaret & Perakende', 'İnşaat & Mimarlık', 'Eğitim', 'Teknoloji & Bilişim', 'Hukuk & Danışmanlık', 'Turizm & Otelcilik', 'Üretim & Sanayi', 'Diğer']
    : language === 'de'
    ? ['Gesundheit & Medizin', 'E-Commerce & Einzelhandel', 'Bau & Architektur', 'Bildung', 'Technologie & IT', 'Recht & Beratung', 'Tourismus & Hotellerie', 'Produktion & Industrie', 'Andere']
    : ['Health & Medicine', 'E-Commerce & Retail', 'Construction & Architecture', 'Education', 'Technology & IT', 'Law & Consulting', 'Tourism & Hospitality', 'Manufacturing & Industry', 'Other'];

  const defaultService = servicesList[0];
  const defaultIndustry = industriesList[0];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    industry: '',
    customIndustry: '',
    serviceType: '',
  });

  const activeService = formData.serviceType || defaultService;
  const activeIndustry = formData.industry || defaultIndustry;
  const otherValue = language === 'tr' ? 'Diğer' : language === 'de' ? 'Andere' : 'Other';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const finalIndustry = activeIndustry === otherValue ? (formData.customIndustry || 'Belirtilmedi') : activeIndustry;

    let recaptchaToken: string | undefined;
    try {
      recaptchaToken = await getToken('quick_quote_form');
    } catch (err) {
      console.error('reCAPTCHA error:', err);
    }

    const res = await createLeadWithProposal({
      tenantId: DEFAULT_TENANT_ID,
      name: formData.name,
      email: formData.email,
      industry: finalIndustry,
      serviceType: activeService,
      source: 'Quick Quote Form',
      recaptchaToken,
    });

    setIsSubmitting(false);

    if (res.success) {
      setIsSuccess(true);
    } else {
      alert(tLocal.errorAlert);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-[#131B2A] border border-[#8B5CF6]/30 rounded-3xl p-8 md:p-12 text-center max-w-4xl mx-auto">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 mx-auto">
          <CheckCircle2 className="w-10 h-10 text-green-400" />
        </div>
        <h3 className="text-3xl font-bold text-white mb-4">{tLocal.successTitle}</h3>
        <p className="text-slate-400 text-lg">
          {tLocal.successDesc(activeIndustry, activeService)}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#0A0A0F] border border-white/5 rounded-3xl p-6 md:p-12 max-w-5xl mx-auto relative overflow-hidden shadow-2xl">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B5CF6]/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-['Outfit']">
            {tLocal.title} <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9]">{tLocal.titleGradient}</span>
          </h2>
          <p className="text-slate-400 mb-8 text-lg">
            {tLocal.desc}
          </p>

          <ul className="space-y-4">
            {tLocal.features.map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-300">
                <div className="w-6 h-6 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8B5CF6]" />
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#131B2A] rounded-2xl p-6 md:p-8 border border-white/5 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">{tLocal.nameLabel}</label>
              <input 
                suppressHydrationWarning
                type="text" 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-[#8B5CF6] focus:outline-none transition-colors"
                placeholder={tLocal.namePlaceholder}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">{tLocal.emailLabel}</label>
              <input 
                suppressHydrationWarning
                type="email" 
                required
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-[#8B5CF6] focus:outline-none transition-colors"
                placeholder={tLocal.emailPlaceholder}
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">{tLocal.serviceLabel}</label>
                <div className="flex flex-wrap gap-2">
                  {servicesList.map(service => (
                    <button
                      key={service}
                      type="button"
                      onClick={() => setFormData({...formData, serviceType: service})}
                      className={`px-3.5 py-2 text-sm rounded-xl transition-all border ${
                        activeService === service 
                          ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-[#8B5CF6]' 
                          : 'bg-[#0A0A0F] border-white/5 text-slate-400 hover:border-white/10'
                      }`}
                    >
                      {service}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">{tLocal.industryLabel}</label>
                <select 
                  value={activeIndustry}
                  onChange={e => setFormData({...formData, industry: e.target.value})}
                  className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-[#8B5CF6] focus:outline-none transition-colors appearance-none"
                >
                  {industriesList.map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
                {activeIndustry === otherValue && (
                  <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <input 
                      suppressHydrationWarning
                      type="text" 
                      required
                      value={formData.customIndustry}
                      onChange={e => setFormData({...formData, customIndustry: e.target.value})}
                      className="w-full bg-[#0A0A0F] border border-[#8B5CF6]/50 rounded-xl px-4 py-3.5 text-white focus:border-[#8B5CF6] focus:outline-none transition-colors"
                      placeholder={tLocal.otherIndustryPlaceholder}
                    />
                  </div>
                )}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full mt-2 bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white font-medium py-4 px-6 rounded-xl hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {isSubmitting ? tLocal.submittingBtn : tLocal.submitBtn}
              {!isSubmitting && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
