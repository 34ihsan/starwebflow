'use client'

import { useState, useRef, useEffect } from 'react'
import GlowCard from '@/components/ui/GlowCard'
import Button from '@/components/ui/Button'
import { 
  Calculator, ArrowRight, TrendingUp, Clock, DollarSign, 
  ShieldCheck, Zap, Bot, CheckCircle2, Moon, Lock, Server
} from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { CURRENCIES as currencies } from '@/lib/utils'

export default function ROICalculatorSection() {
  const { t, language } = useLanguage()
  const [hours, setHours] = useState(20)
  const [hourlyRate, setHourlyRate] = useState(300)
  const [currencyCode, setCurrencyCode] = useState('TRY')

  const currency = currencies.find(c => c.code === currencyCode) || currencies[0]
  const symbol = currency.symbol
  const sectionRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  // Calculations
  const monthlyHours = hours * 4
  const monthlyCost = monthlyHours * hourlyRate
  const aiSavings = monthlyCost * 0.8 // %80 savings

  useEffect(() => {
    if (language === 'de') {
      setCurrencyCode('EUR')
      setHourlyRate(50)
    } else if (language === 'en') {
      setCurrencyCode('USD')
      setHourlyRate(45)
    } else {
      setCurrencyCode('TRY')
      setHourlyRate(300)
    }
  }, [language])

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el) } },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleScroll = (href: string) => {
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const clientGains = [
    {
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-200',
      title: language === 'tr' ? '%60+ Operasyonel Maliyet Tasarrufu' : language === 'de' ? '60%+ Operative Ersparnis' : '60%+ Cost Reduction',
      desc: language === 'tr'
        ? 'Rutin veri girişleri, manuel faturalandırma ve evrak kontrolü otonom hale gelir; insan hatası sıfırlanır.'
        : language === 'de'
        ? 'Manuelle Dateneingaben, Rechnungsstellung und Dokumentenprüfung laufen vollautomatisch ohne Fehler.'
        : 'Repetitive data entry, invoicing, and back-office chores run autonomously with zero manual errors.'
    },
    {
      icon: Moon,
      color: 'text-purple-600',
      bg: 'bg-purple-50 border-purple-200',
      title: language === 'tr' ? '0 Kaçan Gece Talebi (7/24 Satış)' : language === 'de' ? 'Null verpasste Nacht-Leads' : 'Zero Missed Night Inquiries',
      desc: language === 'tr'
        ? 'Gece 03:00\'te veya hafta sonu gelen potansiyel müşteriler anında sesli ve yazılı karşılanır, randevu alınır.'
        : language === 'de'
        ? 'Anfragen um 03:00 Uhr oder am Wochenende werden sofort per Chat & Sprache qualifiziert und gebucht.'
        : 'Inquiries arriving at 3:00 AM or weekends receive instant voice & text quotes, securing high-intent deals.'
    },
    {
      icon: Zap,
      color: 'text-blue-600',
      bg: 'bg-blue-50 border-blue-200',
      title: language === 'tr' ? '3.6x Satış Dönüşüm Çarpanı' : language === 'de' ? '3,6x Conversion-Multiplikator' : '3.6x Sales Conversion Boost',
      desc: language === 'tr'
        ? '0.38s sub-second açılış hızı ve kişiselleştirilmiş teklif funnelları ile siteniz pasif vitrinden aktif ciro makinesine dönüşür.'
        : language === 'de'
        ? '0,38s Ladezeit und personalisierte Angebots-Funnels verwandeln Besucher in zahlende Vertragskunden.'
        : 'Sub-second 0.38s speed and dynamic offer funnels transform passive visitors into paying contract clients.'
    },
    {
      icon: Server,
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-200',
      title: language === 'tr' ? 'Sıfır Vendor Lock-in & Veri Egemenliği' : language === 'de' ? 'Kein Vendor Lock-in & DSGVO' : 'Zero Vendor Lock-in & Sovereignty',
      desc: language === 'tr'
        ? 'Tek bir modele bağlı değilsiniz (Claude, Llama, GPT); kurum içi On-Premise veya bağımsız bulutta verileriniz tamamen güvende.'
        : language === 'de'
        ? 'Keine Bindung an einen Anbieter (Claude, Llama, GPT). Vollständige Datensouveränität on-premise oder cloud.'
        : 'No single-vendor dependency (Claude, Llama, GPT). Full enterprise data sovereignty on-premise or cloud.'
    }
  ]

  return (
    <section id="roi-calculator" className="py-24 relative overflow-hidden bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" ref={sectionRef}>
        
        {/* Top Split: Narrative + Calculator */}
        <div className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          
          {/* Content Left */}
          <div>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-widest mb-4 shadow-2xs">
              {language === 'tr' ? 'Somut ROI & Değer Mimarisi' : language === 'de' ? 'Messbarer ROI & Mehrwert' : 'Measurable ROI & Value'}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mt-2 mb-6 tracking-tight font-['Outfit']">
              {language === 'tr' ? (
                <>Hareketsizliğin Bedelini <br /><span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">Hesaplayın</span></>
              ) : language === 'de' ? (
                <>Berechnen Sie die Kosten der <br /><span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">Untätigkeit</span></>
              ) : (
                <>Calculate the Cost of <br /><span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">Inaction</span></>
              )}
            </h2>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-8 font-normal">
              {language === 'tr'
                ? "Müşterileriniz yavaş web sitenizi terk mi ediyor? Excel tablolarında kaybolan talepler yüzünden satış kaçırıyor musunuz? Model-agnostik yapay zeka ve otonom iş akışlarıyla operasyonunuzu maliyet merkezinden ciro jeneratörüne dönüştürün."
                : language === 'de'
                ? "Verlassen Kunden Ihre langsame Website? Gehen wertvolle Leads in Excel-Tabellen verloren? Verwandeln Sie Ihren Betrieb mit modell-agnostischer KI und Automatisierung vom Kostenfaktor in einen Umsatztreiber."
                : "Are prospects leaving your slow site? Are valuable leads lost in spreadsheet silos? Turn your operations from a cost sink into a revenue engine with model-agnostic AI and autonomous workflows."}
            </p>
            
            <ul className="space-y-4 mb-10">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-rose-600" />
                </div>
                <p className="text-slate-700 font-medium text-sm sm:text-base">
                  <strong className="text-slate-900 font-bold">
                    {language === 'tr' ? 'Eski Yöntemlerin Bedeli:' : language === 'de' ? 'Das Problem:' : 'The Cost of Inaction:'}
                  </strong>{' '}
                  {language === 'tr'
                    ? 'Mesaiye harcanan yüzlerce saat, gece kaçan cevapsız müşteriler ve hantal Excel tabloları.'
                    : language === 'de'
                    ? 'Hunderte manuelle Überstunden, verpasste Nachtanfragen und schwerfällige Tabellen.'
                    : 'Hundreds of wasted manual hours, uncaptured night leads, and chaotic spreadsheet silos.'}
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-600" />
                </div>
                <p className="text-slate-700 font-medium text-sm sm:text-base">
                  <strong className="text-slate-900 font-bold">
                    {language === 'tr' ? 'StarWebFlow Çözümü:' : language === 'de' ? 'Die StarWebFlow Lösung:' : 'The StarWebFlow Solution:'}
                  </strong>{' '}
                  {language === 'tr'
                    ? 'Verimlilik makinesiyle %80 operasyonel tasarruf, 7/24 sesli/yazılı AI karşılama ve 3.6x ciro artışı.'
                    : language === 'de'
                    ? '80% operative Ersparnis, 24/7 KI-Betreuung per Chat/Sprache und 3,6x mehr Umsatz.'
                    : '80% operational savings, 24/7 omnichannel voice/chat reception, and a 3.6x revenue multiplier.'}
                </p>
              </li>
            </ul>

            <Button variant="primary" size="lg" className="group shadow-md shadow-blue-600/20" onClick={() => handleScroll('#contact')}>
              {language === 'tr' ? 'Ücretsiz ROI Analizi Başlat' : language === 'de' ? 'Kostenlose ROI-Analyse' : 'Start Free ROI Audit'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Calculator Card Right */}
          <GlowCard glowColor="purple" className="p-8 bg-white border border-slate-200 shadow-xl rounded-2xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center shadow-2xs">
                <Calculator className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 font-['Outfit']">
                  {language === 'tr' ? 'Operasyonel Tasarruf Simülatörü' : language === 'de' ? 'Ersparnis-Simulator' : 'Savings Simulator'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {language === 'tr'
                    ? 'Ekibinizin haftalık angarya yükünü girin'
                    : language === 'de'
                    ? 'Wöchentlichen Routineaufwand eingeben'
                    : 'Input weekly manual hours'}
                </p>
              </div>
            </div>

            <div className="space-y-8">
              {/* Manual Input + Slider 1: Hours */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="roi-hours-input" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-600" />{' '}
                    {language === 'tr' ? 'Haftalık Manuel İş Gücü' : language === 'de' ? 'Wöchentliche manuelle Stunden' : 'Weekly Manual Hours'}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      id="roi-hours-input"
                      type="number"
                      min="1"
                      max="500"
                      value={hours === 0 ? '' : hours}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value, 10))
                        setHours(isNaN(val) ? 0 : val)
                      }}
                      className="w-20 px-2.5 py-1 text-right font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs"
                      placeholder="20"
                    />
                    <span className="text-xs font-bold text-slate-600 font-mono">
                      {language === 'tr' ? 'Saat' : language === 'de' ? 'Std.' : 'Hours'}
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min="5"
                  max="160"
                  step="5"
                  value={Math.min(hours, 160)}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              {/* Currency Selector */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  {t('roi.currency')}
                </span>
                <div className="flex gap-1 bg-slate-200/70 p-1 rounded-lg">
                  {currencies.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setCurrencyCode(c.code)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                        currencyCode === c.code
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      {c.symbol} {c.code}
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Input + Slider 2: Hourly Rate */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="roi-rate-input" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-blue-600" />{' '}
                    {t('roi.hourlyWage')} ({symbol})
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-slate-600 font-mono">{symbol}</span>
                    <input
                      id="roi-rate-input"
                      type="number"
                      min="1"
                      max="50000"
                      value={hourlyRate === 0 ? '' : hourlyRate}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value, 10))
                        setHourlyRate(isNaN(val) ? 0 : val)
                      }}
                      className="w-24 px-2.5 py-1 text-right font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                      placeholder="300"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min={currencyCode === 'TRY' ? 50 : 10}
                  max={currencyCode === 'TRY' ? 2000 : 250}
                  step={currencyCode === 'TRY' ? 25 : 5}
                  value={Math.min(hourlyRate, currencyCode === 'TRY' ? 2000 : 250)}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="pt-6 border-t border-slate-200 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium text-sm">
                    {language === 'tr' ? 'Mevcut Boşa Giden Aylık Maliyet:' : language === 'de' ? 'Aktuelle monatliche Kosten:' : 'Current Monthly Burn:'}
                  </span>
                  <span className="text-lg text-slate-900 font-bold font-mono">{symbol}{monthlyCost.toLocaleString('tr-TR')}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-emerald-800 text-sm">
                      {language === 'tr' ? 'Tahmini Aylık Net Tasarruf:' : language === 'de' ? 'Geschätzte Ersparnis/Monat:' : 'Estimated Monthly Savings:'}
                    </span>
                  </div>
                  <span className="text-2xl font-black text-emerald-700 font-mono">
                    {symbol}{aiSavings.toLocaleString('tr-TR')}
                  </span>
                </div>
                <p className="text-xs text-center text-slate-500 font-medium mt-2">
                  {language === 'tr'
                    ? 'Bu maliyet kaybını durdurup 3 ay içinde kendi kendini amorti eden otonom sisteme geçin.'
                    : language === 'de'
                    ? 'Stoppen Sie diese Verluste und investieren Sie in ein System, das sich in 3 Monaten amortisiert.'
                    : 'Stop burning capital and invest in an autonomous system that pays for itself in under 3 months.'}
                </p>
              </div>
            </div>
          </GlowCard>
        </div>

        {/* Bottom Concrete Client Gains 4-Column Grid */}
        <div className="mt-16 pt-12 border-t border-slate-200">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">
              {language === 'tr'
                ? 'İşletmenizin Elde Edeceği 4 Kesin Kazanım'
                : language === 'de'
                ? '4 garantierte Vorteile für Ihr Unternehmen'
                : '4 Guaranteed Advantages for Your Business'}
            </h3>
            <p className="text-sm text-slate-600 mt-2 font-medium">
              {language === 'tr'
                ? 'Sadece yazılım değil; doğrudan bilançonuzu ve müşteri memnuniyetinizi büyüten mühendislik.'
                : language === 'de'
                ? 'Nicht nur Software, sondern Ingenieurskunst, die Ihre Bilanz und Kundenzufriedenheit steigert.'
                : 'Engineered directly to transform your balance sheet and customer satisfaction.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {clientGains.map((gain, i) => {
              const Icon = gain.icon
              return (
                <div
                  key={i}
                  className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 hover:bg-white hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className={`w-10 h-10 rounded-xl ${gain.bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                      <Icon className={`w-5 h-5 ${gain.color}`} />
                    </div>
                    <h4 className="font-bold text-slate-900 text-base mb-2 font-['Outfit'] leading-snug">
                      {gain.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {gain.desc}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {language === 'tr'
                        ? 'Ölçülebilir & Garanti'
                        : language === 'de'
                        ? 'Messbar & Garantiert'
                        : 'Measurable SLA'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </section>
  )
}
