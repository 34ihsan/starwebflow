'use client'

import { motion } from 'framer-motion'
import { Mail, BrainCircuit, Database, Calendar, Smartphone, ArrowRight } from 'lucide-react'

import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function DataFlowSection() {
  const { language } = useLanguage()

  const steps = [
    {
      icon: Mail,
      title: language === 'tr' ? 'Veri Girişi' : language === 'de' ? 'Dateneingabe' : 'Data Input',
      desc: language === 'tr' ? 'Müşteri form doldurur, e-posta atar veya mesaj gönderir.' : language === 'de' ? 'Kunde füllt Formular aus, sendet E-Mail oder Nachricht.' : 'Customer fills out form, sends email or message.',
      color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20'
    },
    {
      icon: BrainCircuit,
      title: language === 'tr' ? 'AI İşleme' : language === 'de' ? 'KI-Verarbeitung' : 'AI Processing',
      desc: language === 'tr' ? 'Sistem saniyeler içinde niyeti anlar, bütçeyi süzer ve en iyi yanıtı hazırlar.' : language === 'de' ? 'System versteht Intent in Sekunden und bereitet beste Antwort vor.' : 'System understands intent in seconds and prepares best response.',
      color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10', border: 'border-[#8B5CF6]/20'
    },
    {
      icon: Database,
      title: language === 'tr' ? 'CRM Senkronu' : language === 'de' ? 'CRM-Synchronisation' : 'CRM Sync',
      desc: language === 'tr' ? 'Lead otomatik olarak HubSpot/Pipedrive\'a eklenir ve puanlanır.' : language === 'de' ? 'Lead wird automatisch in CRM hinzugefügt und bewertet.' : 'Lead is automatically added to CRM and scored.',
      color: 'text-[#10B981]', bg: 'bg-[#10B981]/10', border: 'border-[#10B981]/20'
    },
    {
      icon: Calendar,
      title: language === 'tr' ? 'Aksiyon & Dönüşüm' : language === 'de' ? 'Aktion & Konversion' : 'Action & Conversion',
      desc: language === 'tr' ? 'Müşteriye takvim linki veya indirim kodu otomatik olarak iletilir.' : language === 'de' ? 'Kalenderlink oder Rabattcode wird automatisch gesendet.' : 'Calendar link or promo code is automatically sent.',
      color: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/20'
    }
  ]

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-slate-900 font-['Outfit']"
          >
            {language === 'tr' ? 'Arka Planda Neler Oluyor?' : language === 'de' ? 'Was passiert im Hintergrund?' : 'What Happens Behind the Scenes?'}
          </motion.h2>
          <p className="text-xl font-semibold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
            {language === 'tr' ? 'Kognitif İş Akışı ve Otonom Veri Hattı' : language === 'de' ? 'Kognitiver Arbeitsablauf & Autonome Datenpipeline' : 'Cognitive Workflow & Autonomous Data Pipeline'}
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Connection Line (Desktop) */}
            <div className="hidden md:block absolute top-10 left-0 w-full h-0.5 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 -translate-y-1/2 z-0" />
            
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
                    className="relative z-10 flex flex-col items-center text-center p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <motion.div 
                      whileHover={{ scale: 1.08, rotate: 4 }}
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 border shadow-2xs ${step.bg} ${step.border} ${step.color}`}
                    >
                      <Icon className="w-8 h-8" />
                    </motion.div>
                    
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-normal">{step.desc}</p>
                    
                    {/* Animated Data Particles */}
                    {idx < steps.length - 1 && (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: [0, 1, 0], x: [0, 40, 80] }}
                        transition={{ repeat: Infinity, duration: 2, delay: idx * 0.5 }}
                        className="hidden md:block absolute top-8 -right-8 w-4 h-4 text-purple-600"
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
