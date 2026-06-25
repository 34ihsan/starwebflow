'use client'

import { useState, useRef, useEffect } from 'react'
import GlowCard from '@/components/ui/GlowCard'
import Button from '@/components/ui/Button'
import { Calculator, ArrowRight, TrendingUp, Clock, DollarSign } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

import { CURRENCIES as currencies } from '@/lib/utils'

export default function ROICalculatorSection() {
  const { t, language } = useLanguage()
  const [hours, setHours] = useState(40)
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

  return (
    <section id="roi-calculator" className="section relative overflow-hidden">
      <div className="absolute inset-0 mesh-bg opacity-30 pointer-events-none" />

      <div ref={sectionRef} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          
          {/* Content */}
          <div>
            <span className="tag-badge mb-4">
              {language === 'tr' ? 'ROI Hesaplayıcı' : language === 'de' ? 'ROI-Rechner' : 'ROI Calculator'}
            </span>
            <h2 className="heading-lg text-white mt-4 mb-6">
              {language === 'tr' ? (
                <>Hareketsizliğin Bedelini <br /><span className="gradient-text">Hesaplayın</span></>
              ) : language === 'de' ? (
                <>Berechnen Sie die Kosten der <br /><span className="gradient-text">Untätigkeit</span></>
              ) : (
                <>Calculate the Cost of <br /><span className="gradient-text">Inaction</span></>
              )}
            </h2>
            <p className="text-[#94A3B8] text-lg leading-relaxed mb-8">
              {language === 'tr'
                ? "Müşterileriniz web sitenizi terk mi ediyor? Excel dosyalarınızda kaybolan lead'leriniz için bir mezarlık mı kurdunuz? Her geçen gün manuel süreçler, rakiplerinizin AI kullanarak sizden 10 kat daha hızlı büyümesine neden oluyor."
                : language === 'de'
                ? "Verlassen Ihre Kunden Ihre Website? Haben Sie einen Friedhof für in Excel-Dateien verlorene Leads angelegt? Jeden Tag führen manuelle Prozesse dazu, dass Ihre Konkurrenten mithilfe von KI 10-mal schneller wachsen als Sie."
                : "Are your customers leaving your website? Have you built a graveyard for leads lost in Excel sheets? Every day, manual processes cause your competitors to grow 10x faster than you using AI."}
            </p>
            
            <ul className="space-y-4 mb-10">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#ef4444]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
                </div>
                <p className="text-[#E2E8F0]">
                  <strong className="text-white">
                    {language === 'tr' ? 'Problem:' : language === 'de' ? 'Problem:' : 'Problem:'}
                  </strong>{' '}
                  {language === 'tr'
                    ? 'Manuel işlere harcanan binlerce boşa giden saat.'
                    : language === 'de'
                    ? 'Tausende verschwendete Stunden für manuelle Arbeit.'
                    : 'Thousands of wasted hours spent on manual work.'}
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#10B981]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                </div>
                <p className="text-[#E2E8F0]">
                  <strong className="text-white">
                    {language === 'tr' ? 'Çözüm:' : language === 'de' ? 'Lösung:' : 'Solution:'}
                  </strong>{' '}
                  {language === 'tr'
                    ? 'Verimlilik makinesi kurarak %80 zaman tasarrufu ve %40 lead artışı.'
                    : language === 'de'
                    ? 'Aufbau einer Effizienzmaschine mit 80 % Zeitersparnis und 40 % Lead-Wachstum.'
                    : 'Building an efficiency machine with 80% time savings and 40% lead growth.'}
                </p>
              </li>
            </ul>

            <Button variant="primary" size="lg" className="group" onClick={() => handleScroll('#contact')}>
              {language === 'tr' ? 'Kaybetmeyi Durdurun' : language === 'de' ? 'Aufhören zu verlieren' : 'Stop Losing'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Calculator Card */}
          <GlowCard glowColor="purple" className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/20 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <h3 className="text-xl font-bold text-white font-['Outfit']">
                {language === 'tr' ? 'Kayıp Analizi' : language === 'de' ? 'Verlustanalyse' : 'Loss Analysis'}
              </h3>
            </div>

            <div className="space-y-8">
              {/* Slider 1 */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-[#E2E8F0] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#94A3B8]" />{' '}
                    {language === 'tr' ? 'Haftalık Manuel Saat' : language === 'de' ? 'Wöchentliche manuelle Stunden' : 'Weekly Manual Hours'}
                  </label>
                  <span className="text-white font-bold">
                    {hours} {language === 'tr' ? 'Saat' : language === 'de' ? 'Std.' : 'Hours'}
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="10"
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full h-2 bg-[#1A1A2E] rounded-lg appearance-none cursor-pointer accent-[#8B5CF6]"
                />
              </div>

              {/* Currency Selector */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#1A1A2E]/50 border border-white/[0.04]">
                <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                  {t('roi.currency')}
                </span>
                <div className="flex gap-1 bg-[#1A1A2E] p-1 rounded-lg">
                  {currencies.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setCurrencyCode(c.code)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                        currencyCode === c.code
                          ? 'bg-[#8B5CF6] text-white shadow-sm'
                          : 'text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      {c.symbol} {c.code}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider 2 */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-[#E2E8F0] flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#94A3B8]" />{' '}
                    {t('roi.hourlyWage')} ({symbol})
                  </label>
                  <span className="text-white font-bold">{symbol}{hourlyRate}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="1000"
                  step="1"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full h-2 bg-[#1A1A2E] rounded-lg appearance-none cursor-pointer accent-[#4F8EF7]"
                />
              </div>

              <div className="pt-6 border-t border-white/[0.06] space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#94A3B8]">
                    {language === 'tr' ? 'Mevcut Aylık Maliyetiniz' : language === 'de' ? 'Ihre aktuellen monatlichen Kosten' : 'Your Current Monthly Cost'}
                  </span>
                  <span className="text-xl text-white font-semibold">{symbol}{monthlyCost.toLocaleString('tr-TR')}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-[#10B981]/10 to-transparent border border-[#10B981]/20">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#10B981]" />
                    <span className="font-semibold text-[#10B981]">
                      {language === 'tr' ? 'Tahmini Aylık Tasarruf' : language === 'de' ? 'Geschätzte monatliche Ersparnisse' : 'Estimated Monthly Savings'}
                    </span>
                  </div>
                  <span className="text-2xl font-black text-[#10B981] font-['Outfit']">
                    {symbol}{aiSavings.toLocaleString('tr-TR')}
                  </span>
                </div>
                <p className="text-xs text-center text-[#64748B] mt-2">
                  {language === 'tr'
                    ? 'Bu parayı çöpe atmak yerine, sistemimize yatırıp 3 ayda geri almayı ister misiniz?'
                    : language === 'de'
                    ? 'Möchten Sie dieses Geld lieber in unser System investieren und in 3 Monaten zurückerhalten, anstatt es wegzuwerfen?'
                    : 'Would you like to invest this money into our system and get it back in 3 months instead of throwing it away?'}
                </p>
              </div>
            </div>
          </GlowCard>
        </div>
      </div>
    </section>
  )
}
