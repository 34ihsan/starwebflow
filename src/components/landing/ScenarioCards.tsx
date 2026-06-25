'use client'

import { motion } from 'framer-motion'
import { ShoppingCart, Building2, Stethoscope, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

const scenarios = [
  {
    id: 'ecommerce',
    title: 'E-Ticaret & Perakende',
    icon: ShoppingCart,
    problem: 'Sepeti terk eden müşterileriniz kayboluyor ve manuel indirim kodları göndermek imkansızlaşıyor.',
    solution: 'AI ajanımız sepeti terk eden müşteriyi 15 dakika içinde WhatsApp\'tan ismiyle ve kişiye özel indirimle geri çağırır. Dönüşüm oranını %35 artırır.',
    stats: '+%35 Dönüşüm Oranı'
  },
  {
    id: 'b2b',
    title: 'B2B & Hizmet Sektörü',
    icon: Building2,
    problem: 'Gelen uzun e-postaları veya formları okuyup satış ekibine aktarmak saatler alıyor. Lead\'ler soğuyor.',
    solution: 'AI sekreterimiz e-postayı saniyeler içinde okur, bütçeyi ve talebi özetler, HubSpot/CRM\'e kaydeder ve satış ekibini anında uyarır.',
    stats: '10x Hızlı Lead Yanıtı'
  },
  {
    id: 'clinic',
    title: 'Klinik & Sağlık',
    icon: Stethoscope,
    problem: 'Gece veya hafta sonu randevu almak isteyen hastalar asistan bulamadığı için başka kliniğe gidiyor.',
    solution: '7/24 Aktif AI Randevu Asistanı, gece 03:00\'te bile doğal dilde hastayla yazışır, uygun saati bulur ve takviminize işler.',
    stats: '7/24 Kesintisiz Asistan'
  }
]

export default function ScenarioCards() {
  const [activeTab, setActiveTab] = useState(scenarios[0].id)

  return (
    <section className="py-24 bg-[#0A0A0F] relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/50 to-transparent" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse" />
            <span className="text-sm text-gray-400">Somut Çözümler</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-white"
          >
            Sizin Sektörünüzde, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#D946EF]">Sizin Probleminiz</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400"
          >
            Soyut teknolojileri değil, günlük hayatınızdaki problemleri nasıl tarihe gömdüğümüzü inceleyin.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {scenarios.map((scenario, index) => {
            const Icon = scenario.icon
            const isActive = activeTab === scenario.id

            return (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onMouseEnter={() => setActiveTab(scenario.id)}
                className={`relative p-8 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  isActive 
                    ? 'bg-white/10 border-[#8B5CF6]/50 shadow-[0_0_30px_rgba(139,92,246,0.15)]' 
                    : 'bg-white/5 border-white/10 hover:bg-white/[0.07]'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${
                  isActive ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' : 'bg-white/10 text-gray-400'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4">{scenario.title}</h3>
                
                <div className="space-y-6">
                  <div>
                    <div className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Klasik Durum</div>
                    <p className="text-gray-400 text-sm">{scenario.problem}</p>
                  </div>
                  
                  <div className={`transition-all duration-500 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-2'}`}>
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#10B981] uppercase tracking-wider mb-2">
                      <CheckCircle2 className="w-4 h-4" />
                      StarWebflow Çözümü
                    </div>
                    <p className="text-white text-sm leading-relaxed">{scenario.solution}</p>
                  </div>
                </div>

                <div className={`absolute bottom-8 right-8 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="px-3 py-1 rounded-full bg-[#10B981]/20 text-[#10B981] text-xs font-medium border border-[#10B981]/30">
                    {scenario.stats}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
