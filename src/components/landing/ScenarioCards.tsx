'use client'

import { motion } from 'framer-motion'
import { ShoppingCart, Building2, Stethoscope, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function ScenarioCards() {
  const { language } = useLanguage()

  const scenarios = [
    {
      id: 'ecommerce',
      title: language === 'tr' ? 'E-Ticaret & Perakende' : language === 'de' ? 'E-Commerce & Einzelhandel' : 'E-Commerce & Retail',
      icon: ShoppingCart,
      problem: language === 'tr' ? 'Sepeti terk eden müşterileriniz kayboluyor ve manuel indirim kodları göndermek imkansızlaşıyor.' : language === 'de' ? 'Kunden, die ihren Warenkorb verlassen, gehen verloren. Manuelle Rabattcodes sind unmöglich.' : 'Customers abandoning carts are lost, and sending manual discount codes is impossible.',
      solution: language === 'tr' ? 'AI ajanımız sepeti terk eden müşteriyi 15 dakika içinde WhatsApp\'tan ismiyle ve kişiye özel indirimle geri çağırır. Dönüşüm oranını %35 artırır.' : language === 'de' ? 'Unser KI-Agent erinnert abgebrochene Warenkörbe via WhatsApp mit individuellem Rabatt. Erhöht Conversions um 35%.' : 'Our AI agent re-engages abandoned carts via WhatsApp with custom discounts. Increases conversions by 35%.',
      stats: language === 'tr' ? '+%35 Dönüşüm Oranı' : language === 'de' ? '+35% Konversionsrate' : '+35% Conversion Rate'
    },
    {
      id: 'b2b',
      title: language === 'tr' ? 'B2B & Hizmet Sektörü' : language === 'de' ? 'B2B & Dienstleistungen' : 'B2B & Services',
      icon: Building2,
      problem: language === 'tr' ? 'Gelen uzun e-postaları veya formları okuyup satış ekibine aktarmak saatler alıyor. Lead\'ler soğuyor.' : language === 'de' ? 'Lange E-Mails zu lesen und ans Vertriebsteam weiterzuleiten dauert Stunden. Leads kühlen ab.' : 'Reading long emails and forwarding them to sales takes hours. Leads go cold.',
      solution: language === 'tr' ? 'AI sekreterimiz e-postayı saniyeler içinde okur, bütçeyi ve talebi özetler, HubSpot/CRM\'e kaydeder ve satış ekibini anında uyarır.' : language === 'de' ? 'Unsere KI liest E-Mails in Sekunden, fasst Anfrage zusammen, speichert im CRM und benachrichtigt das Vertriebsteam.' : 'Our AI reads emails in seconds, summarizes budget and demand, saves to CRM, and alerts sales team.',
      stats: language === 'tr' ? '10x Hızlı Lead Yanıtı' : language === 'de' ? '10x schnellere Lead-Antwort' : '10x Faster Lead Response'
    },
    {
      id: 'clinic',
      title: language === 'tr' ? 'Klinik & Sağlık' : language === 'de' ? 'Kliniken & Gesundheit' : 'Clinics & Healthcare',
      icon: Stethoscope,
      problem: language === 'tr' ? 'Gece veya hafta sonu randevu almak isteyen hastalar asistan bulamadığı için başka kliniğe gidiyor.' : language === 'de' ? 'Patienten, die nachts oder am Wochenende Termine buchen möchten, gehen zu anderen Kliniken.' : 'Patients trying to book appointments on weekends or nights go to other clinics.',
      solution: language === 'tr' ? '7/24 Aktif AI Randevu Asistanı, gece 03:00\'te bile doğal dilde hastayla yazışır, uygun saati bulur ve takviminize işler.' : language === 'de' ? 'Der 24/7 KI-Terminassistent antwortet nachts um 03:00 Uhr in natürlicher Sprache und bucht Termine.' : '24/7 AI Appointment Assistant responds at 3 AM in natural language and books slots into your calendar.',
      stats: language === 'tr' ? '7/24 Kesintisiz Asistan' : language === 'de' ? '24/7 Autonomer Assistent' : '24/7 Autonomous Assistant'
    }
  ]

  const [activeTab, setActiveTab] = useState(scenarios[0].id)

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/30 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 mb-6 shadow-2xs"
          >
            <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse" />
            <span className="text-xs font-bold text-purple-700">
              {language === 'tr' ? 'Somut Çözümler' : language === 'de' ? 'Konkrete Lösungen' : 'Concrete Solutions'}
            </span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-slate-900 font-['Outfit']"
          >
            {language === 'tr' ? (
              <>Sizin Sektörünüzde, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#D946EF]">Sizin Probleminiz</span></>
            ) : language === 'de' ? (
              <>In Ihrer Branche, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#D946EF]">Ihr Problem</span></>
            ) : (
              <>In Your Industry, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#D946EF]">Your Problem</span></>
            )}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 font-normal"
          >
            {language === 'tr' 
              ? 'Soyut teknolojileri değil, günlük hayatınızdaki problemleri nasıl tarihe gömdüğümüzü inceleyin.' 
              : language === 'de' 
              ? 'Sehen Sie, wie wir alltägliche Probleme Ihrer Branche lösen – keine abstrakten Technologien.' 
              : 'See how we solve daily operational problems in your industry, not abstract technologies.'}
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
                    ? 'bg-purple-50/40 border-purple-300 shadow-xl shadow-purple-500/5 -translate-y-1' 
                    : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-2xs ${
                  isActive ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'bg-slate-100 text-slate-700'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{scenario.title}</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-rose-600 font-bold mb-1.5">
                      {language === 'tr' ? 'Klasik Durum' : language === 'de' ? 'Klassische Situation' : 'Traditional Problem'}
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed font-normal">{scenario.problem}</p>
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-emerald-600 font-bold mb-1.5">
                      {language === 'tr' ? 'StarWebflow Çözümü' : language === 'de' ? 'StarWebFlow Lösung' : 'StarWebFlow Solution'}
                    </h4>
                    <p className="text-sm text-slate-800 leading-relaxed font-medium">{scenario.solution}</p>
                  </div>
                </div>

                <div className={`mt-6 pt-4 border-t border-slate-100 flex justify-end transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                  <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 shadow-2xs">
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
