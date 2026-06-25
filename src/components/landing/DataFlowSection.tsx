'use client'

import { motion } from 'framer-motion'
import { Mail, BrainCircuit, Database, Calendar, Smartphone, ArrowRight } from 'lucide-react'

export default function DataFlowSection() {
  const steps = [
    { icon: Mail, title: 'Veri Girişi', desc: 'Müşteri form doldurur, e-posta atar veya mesaj gönderir.', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
    { icon: BrainCircuit, title: 'AI İşleme', desc: 'Sistem saniyeler içinde niyeti anlar, bütçeyi süzer ve en iyi yanıtı hazırlar.', color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10', border: 'border-[#8B5CF6]/20' },
    { icon: Database, title: 'CRM Senkronu', desc: 'Lead otomatik olarak HubSpot/Pipedrive\'a eklenir ve puanlanır.', color: 'text-[#10B981]', bg: 'bg-[#10B981]/10', border: 'border-[#10B981]/20' },
    { icon: Calendar, title: 'Aksiyon & Dönüşüm', desc: 'Müşteriye takvim linki veya indirim kodu otomatik olarak iletilir.', color: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/20' }
  ]

  return (
    <section className="py-24 bg-[#0A0A0F] relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-white"
          >
            Arka Planda Neler Oluyor? <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-600 text-2xl md:text-3xl">(Kognitif İş Akışı)</span>
          </motion.h2>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Connection Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500/20 via-[#8B5CF6]/50 to-pink-500/20 -translate-y-1/2 z-0" />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {steps.map((step, idx) => {
                const Icon = step.icon
                return (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.2 }}
                    className="relative z-10 flex flex-col items-center text-center"
                  >
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 border backdrop-blur-xl ${step.bg} ${step.border} ${step.color}`}
                    >
                      <Icon className="w-10 h-10" />
                    </motion.div>
                    
                    <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                    <p className="text-sm text-gray-400">{step.desc}</p>
                    
                    {/* Animated Data Particles */}
                    {idx < steps.length - 1 && (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: [0, 1, 0], x: [0, 40, 80] }}
                        transition={{ repeat: Infinity, duration: 2, delay: idx * 0.5 }}
                        className="hidden md:block absolute top-10 -right-10 w-4 h-4 text-[#8B5CF6]"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
