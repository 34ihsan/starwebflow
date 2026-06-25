'use client'

import { motion } from 'framer-motion'
import { XCircle, CheckCircle2, ArrowRight, TrendingDown, TrendingUp } from 'lucide-react'

const comparisonData = [
  {
    traditional: 'Ziyaretçi iletişim formu doldurur ve beklemeye başlar.',
    starwebflow: 'Ziyaretçi sitedeyken AI anında WhatsApp veya Chat üzerinden iletişime geçer.'
  },
  {
    traditional: 'Satış/Destek ekibi ertesi gün veya saatler sonra manuel e-posta atar.',
    starwebflow: 'AI saniyeler içinde doğal dilde konuşur, müşterinin itirazlarını anında giderir.'
  },
  {
    traditional: 'Geç kalındığı için müşteri soğumuştur, rakiplerden teklif almaya gitmiştir.',
    starwebflow: 'Müşteri daha sıcakken anında takvime toplantı kaydeder veya siparişi tamamlar.'
  },
  {
    traditional: 'Müşteri verileri, talepler ve notlar manuel olarak Excel veya CRM\'e girilir.',
    starwebflow: 'Tüm görüşme özeti, bütçe analizleri ve talepler saniyeler içinde CRM\'e (HubSpot vs) yansır.'
  },
  {
    traditional: 'Mesai biter. Gece ve hafta sonları hiçbir işlem yapılmaz.',
    starwebflow: 'Sistem 7/24, tatilsiz ve molasız olarak aynı performansta satış kapatmaya devam eder.'
  }
]

export default function ComparisonSection() {
  return (
    <section className="py-24 bg-[#0A0A0F] relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <TrendingUp className="w-4 h-4 text-[#8B5CF6]" />
            <span className="text-sm text-gray-400">Karşılaştırma Analizi</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-white"
          >
            Klasik Model vs <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#059669]">StarWebflow Modeli</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-400"
          >
            Hızın ve verimliliğin ciroyu nasıl belirlediğini kendi gözlerinizle görün.
          </motion.p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Header Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
              <h3 className="text-xl font-bold text-red-400 flex items-center justify-center gap-2">
                <TrendingDown className="w-5 h-5" /> Geleneksel Ajans / Manuel Süreç
              </h3>
            </div>
            <div className="bg-[#10B981]/10 border border-[#10B981]/20 rounded-2xl p-6 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#10B981]/10 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]" />
              <h3 className="text-xl font-bold text-[#10B981] flex items-center justify-center gap-2 relative z-10">
                <TrendingUp className="w-5 h-5" /> StarWebflow AI Ekosistemi
              </h3>
            </div>
          </div>

          {/* Comparison Rows */}
          <div className="space-y-4">
            {comparisonData.map((row, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 relative"
              >
                {/* Arrow indicator for desktop */}
                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#1A1A2E] border border-white/10 items-center justify-center z-10">
                  <ArrowRight className="w-4 h-4 text-gray-500" />
                </div>

                <div className="bg-white/5 border border-white/5 rounded-xl p-6 flex gap-4 opacity-70 hover:opacity-100 transition-opacity">
                  <XCircle className="w-6 h-6 text-red-400 shrink-0 mt-1" />
                  <p className="text-gray-300">{row.traditional}</p>
                </div>
                
                <div className="bg-gradient-to-br from-[#10B981]/5 to-transparent border border-[#10B981]/20 rounded-xl p-6 flex gap-4 hover:bg-[#10B981]/10 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                  <CheckCircle2 className="w-6 h-6 text-[#10B981] shrink-0 mt-1" />
                  <p className="text-white font-medium">{row.starwebflow}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-gray-400">Sonuç:</span>
              <span className="text-xl font-bold text-white">10x Daha Hızlı Büyüme & %80 Daha Az İş Yükü</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
