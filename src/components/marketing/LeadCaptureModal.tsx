'use client';

import { useState, useEffect } from 'react';
import { createLeadWithProposal } from '@/app/actions/lead';
import { X, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSectionTracker } from '@/hooks/useSectionTracker';
import { useRecaptcha } from '@/hooks/useRecaptcha';

// Replace with your actual tenant ID
const DEFAULT_TENANT_ID = 'default-tenant'; // This should ideally be passed as a prop or fetched from context

export default function LeadCaptureModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { getToken } = useRecaptcha();

  const { activeSection } = useSectionTracker(['hero', 'services', 'pricing', 'process', 'roi']);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    industry: 'Sağlık & Tıp',
    customIndustry: '',
    serviceType: 'Web Tasarım',
  });

  const getSectionTitle = () => {
    if (activeSection === 'pricing') return 'Özel Fiyatlandırma İçin...';
    if (activeSection === 'roi') return 'Yatırım Getirisi (ROI) İçin...';
    if (activeSection === 'services') return 'Size Özel Çözümler İçin...';
    return 'Ayrılmadan Önce...';
  };

  const getSectionSubtitle = () => {
    if (activeSection === 'pricing') return 'Bütçenize uygun, size özel hazırladığımız fiyat teklifi dosyasını e-postanıza gönderelim.';
    if (activeSection === 'roi') return 'İşletmenizin dijitalde ne kadar büyüyeceğini gösteren detaylı ROI analiz raporunu e-postanıza gönderelim.';
    return 'Sektörünüze özel hazırladığımız Ücretsiz Proje Analizi ve Fiyat Teklifi şablonunu e-postanıza gönderelim.';
  };

  const servicesList = [
    'Web Tasarım', 'SEO', 'Sosyal Medya', 'Mobil Uygulama', 'E-Ticaret', 'Özel Yazılım', 'AI Otomasyon', 'AI Agents'
  ];

  const industriesList = [
    'Sağlık & Tıp', 'E-Ticaret & Perakende', 'İnşaat & Mimarlık', 
    'Eğitim', 'Teknoloji & Bilişim', 'Hukuk & Danışmanlık', 
    'Turizm & Otelcilik', 'Üretim & Sanayi', 'Diğer'
  ];

  useEffect(() => {
    // 1. Time delay trigger (e.g. 30 seconds)
    const timer = setTimeout(() => {
      if (!hasTriggered) {
        setIsOpen(true);
        setHasTriggered(true);
      }
    }, 30000);

    // 2. Exit intent trigger
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasTriggered) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const finalIndustry = formData.industry === 'Diğer' ? (formData.customIndustry || 'Belirtilmedi') : formData.industry;

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
      industry: finalIndustry,
      serviceType: formData.serviceType,
      source: 'Exit Intent Popup',
      recaptchaToken,
    });

    setIsSubmitting(false);

    if (res.success) {
      setIsSuccess(true);
      setTimeout(() => setIsOpen(false), 5000);
    } else {
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-[#0A0A0F] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-black/20 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {isSuccess ? (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Harika! Talebiniz Alındı</h3>
                <p className="text-slate-400">
                  {formData.industry} sektörüne özel hazırladığımız <b>{formData.serviceType}</b> teklif ve analiz raporunu az önce e-posta adresinize gönderdik. Lütfen gelen kutunuzu kontrol edin.
                </p>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="mt-8 px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors font-medium"
                >
                  Pencereyi Kapat
                </button>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row">
                <div className="p-8 w-full">
                  <h3 className="text-2xl font-bold text-white mb-2 font-['Outfit']">{getSectionTitle()}</h3>
                  <p className="text-slate-400 mb-6 text-sm">
                    {getSectionSubtitle()}
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-slate-400 mb-1">Adınız Soyadınız</label>
                        <input 
                          type="text" 
                          required
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          className="w-full bg-[#131B2A] border border-white/5 rounded-xl px-4 py-3 text-white focus:border-[#8B5CF6] focus:outline-none transition-colors"
                          placeholder="Ad Soyad"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-slate-400 mb-1">E-Posta Adresiniz</label>
                        <input 
                          type="email" 
                          required
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                          className="w-full bg-[#131B2A] border border-white/5 rounded-xl px-4 py-3 text-white focus:border-[#8B5CF6] focus:outline-none transition-colors"
                          placeholder="ornek@sirket.com"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-slate-400 mb-2">Hizmet Türü</label>
                        <div className="flex flex-wrap gap-2">
                          {servicesList.map(service => (
                            <button
                              key={service}
                              type="button"
                              onClick={() => setFormData({...formData, serviceType: service})}
                              className={`px-3 py-1.5 text-xs rounded-lg transition-all border ${
                                formData.serviceType === service 
                                  ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-[#8B5CF6]' 
                                  : 'bg-[#131B2A] border-white/5 text-slate-400 hover:border-white/10'
                              }`}
                            >
                              {service}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-slate-400 mb-1">Sektörünüz</label>
                        <select 
                          value={formData.industry}
                          onChange={e => setFormData({...formData, industry: e.target.value})}
                          className="w-full bg-[#131B2A] border border-white/5 rounded-xl px-4 py-3 text-white focus:border-[#8B5CF6] focus:outline-none transition-colors appearance-none"
                        >
                          {industriesList.map(ind => (
                            <option key={ind} value={ind}>{ind}</option>
                          ))}
                        </select>
                        {formData.industry === 'Diğer' && (
                          <motion.input 
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                            type="text" 
                            required
                            value={formData.customIndustry}
                            onChange={e => setFormData({...formData, customIndustry: e.target.value})}
                            className="w-full bg-[#131B2A] border border-[#8B5CF6]/30 rounded-xl px-4 py-3 text-white focus:border-[#8B5CF6] focus:outline-none transition-colors"
                            placeholder="Lütfen sektörünüzü yazın"
                          />
                        )}
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full mt-4 bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white font-medium py-4 px-6 rounded-xl hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                    >
                      {isSubmitting ? 'Hazırlanıyor...' : 'Ücretsiz Analizi Gönder'}
                      {!isSubmitting && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </button>
                    <p className="text-[10px] text-center text-slate-500 mt-2 leading-relaxed">
                      Kişisel verileriniz KVKK kapsamında işlenmekte ve site içi deneyiminiz size özel teklifler sunabilmek adına AI ile analiz edilmektedir. Spam göndermeyiz.
                    </p>
                  </form>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
