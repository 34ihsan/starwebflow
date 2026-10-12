'use client'

import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import { motion } from 'framer-motion'
import { ShoppingCart, TrendingUp, Users, ArrowRight, CheckCircle2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import InteractiveAIDemo from '@/components/landing/InteractiveAIDemo'

export default function EcommerceSectorClientPage() {
  return (
    <main className="min-h-screen bg-[#FAFBFD] text-slate-900">
      <Navbar />
      
      {/* Sector Specific Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-50/70 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 mb-8"
            >
              <ShoppingCart className="w-4 h-4 text-purple-700" />
              <span className="text-sm font-semibold text-purple-700">E-Ticaret & Perakende İçin Özel Çözüm</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-slate-900"
            >
              Sepeti Terk Eden <span className="text-purple-600">Müşterileri</span> Geri Kazanın.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto"
            >
              Mağazanız uyusa bile satış yapan otonom AI ajanlarıyla tanışın. Terk edilen sepetleri tarar, müşteriye saniyeler içinde WhatsApp'tan özel teklif sunar ve satışı kapatır.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button variant="primary" size="lg" className="w-full sm:w-auto text-lg px-8">
                Hemen Demo Talep Et
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-slate-200/90 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-200">
            <div className="p-4">
              <div className="text-4xl font-extrabold text-slate-900 mb-2">+35%</div>
              <div className="text-slate-600 font-medium">Sepet Dönüşüm Oranı</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-extrabold text-emerald-600 mb-2">0sn</div>
              <div className="text-slate-600 font-medium">Müşteriye Yanıt Süresi</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-extrabold text-slate-900 mb-2">7/24</div>
              <div className="text-slate-600 font-medium">Kesintisiz Satış Desteği</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlight */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">İndirim Kuponu Dağıtmak Yerine Psikolojik Satış Yapın</h2>
              <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                Sıradan botlar sadece kod yollar. StarWebflow AI, müşterinin neden sepeti terk ettiğini (kargo ücreti mi, fiyat mı, güven mi?) analiz eder ve tam olarak bu itirazı giderecek empatik bir WhatsApp mesajı kurgular.
              </p>
              
              <ul className="space-y-4">
                {[
                  'Sepet terk edildikten 15dk sonra otomatik tetiklenme',
                  'Müşterinin geçmiş siparişlerine göre kişiselleştirilmiş dil',
                  'Stok bitiyor (FOMO) veya özel indirim (Ödül) tetikleyicileri',
                  'CRM (Shopify, WooCommerce, Ticimax) ile tam entegrasyon'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-700">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white border border-slate-200/90 rounded-2xl p-8 relative shadow-lg">
              <div className="relative bg-slate-50 rounded-xl p-6 border border-slate-200">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-200">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-slate-900 font-bold">Merve Hanım (Müşteri)</div>
                    <div className="text-xs font-semibold text-emerald-600">Çevrimiçi</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white border border-slate-200 p-3.5 rounded-xl rounded-tl-sm text-slate-800 text-sm leading-relaxed shadow-sm max-w-[85%]">
                    Merhaba Merve! 👋 Sepetinde unutmuş olduğun 'Premium İpek Şal' için ufak bir sürprizim var. Kargo ücreti yüksek gelmiş olabilir diye sadece sana özel kargoyu bedava yaptım. Fikrini değiştirdiysen siparişi tamamlamak için link burada: [Link]
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-emerald-600 text-white font-medium p-3.5 rounded-xl rounded-tr-sm text-sm leading-relaxed shadow-sm max-w-[85%]">
                      Harika! Çok teşekkürler, hemen siparişi veriyorum. 🌸
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reuse Interactive Demo */}
      <InteractiveAIDemo />
      
      <Footer />
    </main>
  )
}
