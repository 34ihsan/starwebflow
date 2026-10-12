'use client'

import { motion } from 'framer-motion'
import { XCircle, CheckCircle2, ArrowRight, TrendingDown, TrendingUp } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function ComparisonSection() {
  const { language } = useLanguage()

  const comparisonData = [
    {
      traditional: language === 'tr' ? 'Ziyaretçi iletişim formu doldurur ve beklemeye başlar.' : language === 'de' ? 'Besucher füllt Kontaktformular aus und wartet.' : 'Visitor fills out contact form and starts waiting.',
      starwebflow: language === 'tr' ? 'Ziyaretçi sitedeyken AI anında WhatsApp veya Chat üzerinden iletişime geçer.' : language === 'de' ? 'KI kontaktiert den Besucher sofort via WhatsApp oder Live-Chat.' : 'AI connects instantly via WhatsApp or Chat while visitor is on site.'
    },
    {
      traditional: language === 'tr' ? 'Satış/Destek ekibi ertesi gün veya saatler sonra manuel e-posta atar.' : language === 'de' ? 'Vertrieb/Support sendet erst am nächsten Tag eine manuelle E-Mail.' : 'Sales/Support sends a manual email hours or a day later.',
      starwebflow: language === 'tr' ? 'AI saniyeler içinde doğal dilde konuşur, müşterinin itirazlarını anında giderir.' : language === 'de' ? 'KI antwortet in Sekunden in natürlicher Sprache und löst Einwände.' : 'AI responds in seconds in natural language and handles objections.'
    },
    {
      traditional: language === 'tr' ? 'Geç kalındığı için müşteri soğumuştur, rakiplerden teklif almaya gitmiştir.' : language === 'de' ? 'Da es zu spät ist, kühlt der Kunde ab und holt Konkurrenzangebote ein.' : 'Customer goes cold due to delay and requests quotes from competitors.',
      starwebflow: language === 'tr' ? 'Müşteri daha sıcakken anında takvime toplantı kaydeder veya siparişi tamamlar.' : language === 'de' ? 'Bucht sofort ein Meeting im Kalender oder schließt die Bestellung ab.' : 'Schedules meeting immediately or completes order while lead is hot.'
    },
    {
      traditional: language === 'tr' ? 'Müşteri verileri, talepler ve notlar manuel olarak Excel veya CRM\'e girilir.' : language === 'de' ? 'Kundendaten und Notizen werden manuell in Excel oder CRM eingegeben.' : 'Customer data and notes are manually typed into Excel or CRM.',
      starwebflow: language === 'tr' ? 'Tüm görüşme özeti, bütçe analizleri ve talepler saniyeler içinde CRM\'e (HubSpot vs) yansır.' : language === 'de' ? 'Zusammenfassung, Budgetanalyse und Anfragen fließen sofort ins CRM.' : 'Full call summary, budget analysis, and requests sync to CRM in seconds.'
    },
    {
      traditional: language === 'tr' ? 'Mesai biter. Gece ve hafta sonları hiçbir işlem yapılmaz.' : language === 'de' ? 'Feierabend. Nachts und am Wochenende passiert nichts.' : 'Workday ends. Zero activity during nights and weekends.',
      starwebflow: language === 'tr' ? 'Sistem 7/24, tatilsiz ve molasız olarak aynı performansta satış kapatmaya devam eder.' : language === 'de' ? 'System schließt 24/7 ohne Pause Verkäufe auf gleichem Niveau ab.' : 'System continues closing sales 24/7 without breaks at full performance.'
    }
  ]
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 mb-6 shadow-2xs"
          >
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700">
              {language === 'tr' ? 'Karşılaştırma Analizi' : language === 'de' ? 'Vergleichsanalyse' : 'Comparison Analysis'}
            </span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-slate-900 font-['Outfit']"
          >
            {language === 'tr' ? (
              <>Klasik Model vs <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">StarWebflow Modeli</span></>
            ) : language === 'de' ? (
              <>Klassisches Modell vs <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">StarWebFlow Modell</span></>
            ) : (
              <>Traditional Model vs <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">StarWebFlow Model</span></>
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
              ? 'Hızın ve verimliliğin ciroyu nasıl belirlediğini kendi gözlerinizle görün.' 
              : language === 'de' 
              ? 'Sehen Sie selbst, wie Geschwindigkeit und Effizienz Ihren Umsatz bestimmen.' 
              : 'See for yourself how speed and efficiency dictate your revenue.'}
          </motion.p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Header Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-4">
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center shadow-2xs">
              <h3 className="text-lg font-bold text-rose-700 flex items-center justify-center gap-2">
                <TrendingDown className="w-5 h-5 text-rose-600" />
                {language === 'tr' ? 'Geleneksel Ajans / Manuel Süreç' : language === 'de' ? 'Klassische Agentur / Manueller Prozess' : 'Traditional Agency / Manual Process'}
              </h3>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center relative overflow-hidden shadow-2xs">
              <h3 className="text-lg font-bold text-emerald-800 flex items-center justify-center gap-2 relative z-10">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                {language === 'tr' ? 'StarWebflow AI Ekosistemi' : language === 'de' ? 'StarWebFlow KI-Ökosystem' : 'StarWebFlow AI Ecosystem'}
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
                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-slate-200 items-center justify-center z-10 shadow-sm">
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>

                <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-5 flex gap-4 transition-colors">
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-600 leading-relaxed font-normal">{row.traditional}</p>
                </div>
                
                <div className="bg-emerald-50/40 border border-emerald-200/90 rounded-xl p-5 flex gap-4 transition-colors shadow-2xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-900 font-semibold leading-relaxed">{row.starwebflow}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{language === 'tr' ? 'Sonuç:' : language === 'de' ? 'Ergebnis:' : 'Result:'}</span>
              <span className="text-lg font-bold text-slate-900">
                {language === 'tr' ? '10x Daha Hızlı Büyüme & %80 Daha Az İş Yükü' : language === 'de' ? '10x schnelleres Wachstum & 80% weniger Workload' : '10x Faster Growth & 80% Less Workload'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
