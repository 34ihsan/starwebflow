'use client'

import { useRef, useEffect, useState } from 'react'
import { Star, Quote } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

const testimonials = {
  tr: [
    {
      name: 'Ayşe Kaya',
      role: 'CEO, Kaya Medikal',
      industry: 'Sağlık',
      avatar: 'AK',
      color: '#10B981',
      rating: 5,
      text: 'WhatsApp üzerinden çalışan AI ajanımız sayesinde randevu yönetiminde %70 verimlilik artışı sağladık. Hasta memnuniyeti anketlerimiz tüm zamanların en yüksek puanına ulaştı.',
      metric: '+70% Verimlilik'
    },
    {
      name: 'Mehmet Demir',
      role: 'Genel Müdür, TechBridge SaaS',
      industry: 'Yazılım',
      avatar: 'MD',
      color: '#4F8EF7',
      rating: 5,
      text: 'Next.js ile yeniden geliştirilen web platformumuz 0.8 saniyeye indi. Google Ads dönüşüm oranımız 3 ayda 2.1x\'e çıktı. Yatırımımızı 6 ayda geri aldık.',
      metric: '2.1x Dönüşüm'
    },
    {
      name: 'Zeynep Arslan',
      role: 'Kurucu, Bloom E-Ticaret',
      industry: 'E-Ticaret',
      avatar: 'ZA',
      color: '#F59E0B',
      rating: 5,
      text: 'Terk edilen sepet recovery otomasyonu kurulduğundan beri aylık gelirimiz %42 arttı. Excel\'den akıllı CRM\'e geçiş bizi kurtardı. Artık hangi lead\'in ne zaman takip edilmesi gerektiğini sistem söylüyor.',
      metric: '+42% Gelir'
    },
    {
      name: 'Emre Yılmaz',
      role: 'Pazarlama Direktörü, Inova Grup',
      industry: 'Perakende',
      avatar: 'EY',
      color: '#8B5CF6',
      rating: 5,
      text: 'Sosyal medya içerik üretiminde haftada 30+ saat tasarruf ettik. AI blog motoru organik trafiğimizi 5 ayda 2.8x büyüttü. StarWebFlow ekibi gerçekten bir iş ortağı gibi çalışıyor.',
      metric: '2.8x Organik Trafik'
    },
    {
      name: 'Deniz Çelik',
      role: 'CTO, FinanceCore',
      industry: 'Fintech',
      avatar: 'DC',
      color: '#06B6D4',
      rating: 5,
      text: 'GDPR uyumlu veri yönetimi ve SIEM entegrasyonunu beklenenden çok daha hızlı teslim ettiler. Teknik ekibin kod kalitesi mükemmel, yorumlar ve dokümantasyon eksiksiz.',
      metric: 'GDPR Tam Uyum'
    },
    {
      name: 'Fatma Şahin',
      role: 'Operasyon Müdürü, Lojik Lojistik',
      industry: 'Lojistik',
      avatar: 'FŞ',
      color: '#F97316',
      rating: 5,
      text: 'Müşteri bildirimi otomasyonu ve rota optimizasyonu sistemi manuel süreçlerimizi tamamen ortadan kaldırdı. Şikâyet oranımız 6 ayda %65 düştü.',
      metric: '-65% Şikâyet'
    }
  ],
  en: [
    {
      name: 'Sarah Mitchell',
      role: 'CEO, Mitchell Medical',
      industry: 'Healthcare',
      avatar: 'SM',
      color: '#10B981',
      rating: 5,
      text: 'Thanks to our AI agent running over WhatsApp, we achieved 70% efficiency improvement in appointment management. Our patient satisfaction surveys have reached all-time highs.',
      metric: '+70% Efficiency'
    },
    {
      name: 'James Hoffman',
      role: 'General Manager, TechBridge SaaS',
      industry: 'Software',
      avatar: 'JH',
      color: '#4F8EF7',
      rating: 5,
      text: 'Our web platform rebuilt with Next.js now loads in 0.8 seconds. Google Ads conversion rate grew 2.1x in 3 months. We recouped our investment in 6 months.',
      metric: '2.1x Conversion'
    },
    {
      name: 'Emma Chen',
      role: 'Founder, Bloom E-Commerce',
      industry: 'E-Commerce',
      avatar: 'EC',
      color: '#F59E0B',
      rating: 5,
      text: 'Since setting up the abandoned cart recovery automation, our monthly revenue increased by 42%. Transitioning from Excel to a smart CRM was a game-changer.',
      metric: '+42% Revenue'
    },
    {
      name: 'Oliver Banks',
      role: 'Marketing Director, Inova Group',
      industry: 'Retail',
      avatar: 'OB',
      color: '#8B5CF6',
      rating: 5,
      text: 'We save 30+ hours per week on social media content production. The AI blog engine grew our organic traffic 2.8x in 5 months. StarWebFlow truly works like a business partner.',
      metric: '2.8x Organic Traffic'
    },
    {
      name: 'Daniel Fischer',
      role: 'CTO, FinanceCore',
      industry: 'Fintech',
      avatar: 'DF',
      color: '#06B6D4',
      rating: 5,
      text: 'They delivered GDPR-compliant data management and SIEM integration much faster than expected. The technical team\'s code quality is excellent, with thorough comments and documentation.',
      metric: 'GDPR Compliant'
    },
    {
      name: 'Lisa Thompson',
      role: 'Operations Manager, LogiTrans',
      industry: 'Logistics',
      avatar: 'LT',
      color: '#F97316',
      rating: 5,
      text: 'Customer notification automation and route optimization completely eliminated our manual processes. Our complaint rate dropped 65% in 6 months.',
      metric: '-65% Complaints'
    }
  ],
  de: [
    {
      name: 'Sarah Müller',
      role: 'Geschäftsführerin, Müller Medizin',
      industry: 'Gesundheit',
      avatar: 'SM',
      color: '#10B981',
      rating: 5,
      text: 'Dank unseres über WhatsApp laufenden KI-Agenten haben wir eine 70%ige Effizienzsteigerung im Terminmanagement erreicht. Unsere Patientenzufriedenheitsumfragen haben Allzeithochs erreicht.',
      metric: '+70% Effizienz'
    },
    {
      name: 'Klaus Weber',
      role: 'Geschäftsführer, TechBridge SaaS',
      industry: 'Software',
      avatar: 'KW',
      color: '#4F8EF7',
      rating: 5,
      text: 'Unsere mit Next.js neu entwickelte Web-Plattform lädt jetzt in 0,8 Sekunden. Die Google-Ads-Conversion-Rate stieg in 3 Monaten um das 2,1-Fache. Unsere Investition amortisierte sich in 6 Monaten.',
      metric: '2,1x Conversion'
    },
    {
      name: 'Emma Schneider',
      role: 'Gründerin, Bloom E-Commerce',
      industry: 'E-Commerce',
      avatar: 'ES',
      color: '#F59E0B',
      rating: 5,
      text: 'Seit der Einrichtung der Warenkorbabbruch-Automatisierung ist unser monatlicher Umsatz um 42% gestiegen. Der Wechsel von Excel zu einem intelligenten CRM war entscheidend.',
      metric: '+42% Umsatz'
    },
    {
      name: 'Oliver Braun',
      role: 'Marketingleiter, Inova Gruppe',
      industry: 'Einzelhandel',
      avatar: 'OB',
      color: '#8B5CF6',
      rating: 5,
      text: 'Wir sparen 30+ Stunden pro Woche bei der Produktion von Social-Media-Inhalten. Die KI-Blog-Engine steigerte unseren organischen Traffic in 5 Monaten um das 2,8-Fache.',
      metric: '2,8x Organischer Traffic'
    },
    {
      name: 'Daniel Fischer',
      role: 'CTO, FinanceCore',
      industry: 'Fintech',
      avatar: 'DF',
      color: '#06B6D4',
      rating: 5,
      text: 'Sie lieferten DSGVO-konformes Datenmanagement und SIEM-Integration viel schneller als erwartet. Die Codequalität des technischen Teams ist ausgezeichnet.',
      metric: 'DSGVO-Konform'
    },
    {
      name: 'Lisa Zimmermann',
      role: 'Betriebsleiterin, LogiTrans',
      industry: 'Logistik',
      avatar: 'LZ',
      color: '#F97316',
      rating: 5,
      text: 'Kundenbenachrichtigungsautomatisierung und Routenoptimierung haben unsere manuellen Prozesse vollständig eliminiert. Unsere Beschwerdequote sank in 6 Monaten um 65%.',
      metric: '-65% Beschwerden'
    }
  ]
}

function TestimonialCard({ item, delay }: { item: typeof testimonials.tr[0]; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el) } },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="relative h-full rounded-2xl border border-white/[0.06] bg-[#0F0F1A]/80 p-6 hover:border-white/10 hover:bg-[#0F0F1A] transition-all duration-300 flex flex-col">
        {/* Top glow line */}
        <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl" style={{ background: `linear-gradient(90deg, transparent, ${item.color}50, transparent)` }} />

        {/* Quote icon */}
        <Quote className="w-8 h-8 mb-4 opacity-20" style={{ color: item.color }} />

        {/* Stars */}
        <div className="flex gap-1 mb-4">
          {Array.from({ length: item.rating }).map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
          ))}
        </div>

        {/* Text */}
        <p className="text-[#CBD5E1] text-sm leading-relaxed flex-1 mb-6">&ldquo;{item.text}&rdquo;</p>

        {/* Metric badge */}
        <div
          className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold mb-5 w-fit"
          style={{ background: `${item.color}15`, color: item.color, border: `1px solid ${item.color}30` }}
        >
          {item.metric}
        </div>

        {/* Author */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
            style={{ background: `${item.color}20`, color: item.color, border: `1.5px solid ${item.color}40` }}
          >
            {item.avatar}
          </div>
          <div>
            <p className="text-white text-sm font-semibold">{item.name}</p>
            <p className="text-[#64748B] text-xs">{item.role}</p>
          </div>
          <span
            className="ml-auto text-[10px] px-2 py-1 rounded-full font-medium"
            style={{ background: `${item.color}10`, color: item.color }}
          >
            {item.industry}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function TestimonialsSection() {
  const { language } = useLanguage()
  const sectionRef = useRef<HTMLDivElement>(null)
  const [headerVisible, setHeaderVisible] = useState(false)

  const items = testimonials[language] || testimonials.tr

  const titles = {
    tr: { badge: 'Müşteri Referansları', h2: 'Gerçek Müşteriler, ', h2g: 'Gerçek Sonuçlar', sub: 'Vaat değil, kanıt sunuyoruz. İşte platformumuzu kullanan işletmelerin elde ettiği sonuçlar.' },
    en: { badge: 'Client Testimonials', h2: 'Real Clients, ', h2g: 'Real Results', sub: "We don't make promises — we deliver proof. Here are the results businesses achieve with our platform." },
    de: { badge: 'Kundenstimmen', h2: 'Echte Kunden, ', h2g: 'Echte Ergebnisse', sub: 'Wir machen keine Versprechen — wir liefern Beweise. Hier sind die Ergebnisse, die Unternehmen mit unserer Plattform erzielen.' }
  }
  const t = titles[language] || titles.tr

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setHeaderVisible(true); observer.unobserve(el) } },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="testimonials" className="section relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/4 w-96 h-96 rounded-full bg-[#10B981]/4 blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 w-96 h-96 rounded-full bg-[#4F8EF7]/4 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          ref={sectionRef}
          className={`text-center mb-16 transition-all duration-700 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <span className="tag-badge mb-4">{t.badge}</span>
          <h2 className="heading-lg text-white mt-4 mb-4">
            {t.h2}<span className="gradient-text">{t.h2g}</span>
          </h2>
          <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto">{t.sub}</p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <TestimonialCard key={i} item={item} delay={i * 100} />
          ))}
        </div>

        {/* Overall rating */}
        <div className={`mt-14 flex flex-col sm:flex-row items-center justify-center gap-6 transition-all duration-700 delay-700 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-white font-black text-3xl font-['Outfit']">4.9/5</span>
          <span className="text-[#64748B] text-sm">
            {language === 'tr' ? '150+ müşteri değerlendirmesine dayalı' : language === 'de' ? 'Basierend auf 150+ Kundenbewertungen' : 'Based on 150+ client reviews'}
          </span>
        </div>
      </div>
    </section>
  )
}
