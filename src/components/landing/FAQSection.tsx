'use client'

import { useRef, useEffect, useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

const faqs = {
  tr: [
    {
      q: 'Bir proje teklifi almak ne kadar sürer?',
      a: 'Formu doldurduktan sonra 24 saat içinde size özel hazırlanmış detaylı bir teklifle dönüyoruz. Acil durumlar için WhatsApp üzerinden anında iletişime geçebilirsiniz.'
    },
    {
      q: 'Web sitenizi geliştirmek için minimum bütçem ne olmalı?',
      a: 'Başlangıç paketlerimiz 4.990 €\'dan başlamaktadır. Proje kapsamına ve özelliklere göre fiyatlandırma kişiselleştirilmektedir. Yatırım geri dönüşünüzü (ROI) ilk görüşmede analiz ediyoruz.'
    },
    {
      q: 'AI Agents ve otomasyon ne kadar sürede devreye girer?',
      a: 'Temel AI otomasyon akışları 3-7 iş günü içinde aktive edilir. CRM entegrasyonlu karmaşık çok kanallı sistemler 2-4 haftada tamamlanır. Tek seferlik kurulum ücreti sonrası aylık yönetim ücretiyle çalışırız.'
    },
    {
      q: 'Hangi platformlarla entegrasyon yapıyorsunuz?',
      a: 'Zapier, Make (Integromat), n8n, HubSpot, Notion, Slack, WhatsApp Business API, Google Workspace, Stripe, WooCommerce, Shopify ve 200+ diğer platformla native entegrasyon sağlıyoruz.'
    },
    {
      q: 'KVKK ve GDPR uyumluluğu nasıl sağlanıyor?',
      a: 'Tüm sistemlerimiz KVKK (Türkiye) ve GDPR (AB) gerekliliklerine tam uyumludur. Veri işleme sözleşmeleri, veri imha protokolleri ve Çerez Yönetim Sistemi dahil kapsamlı hukuki altyapıyı birlikte kuruyoruz.'
    },
    {
      q: 'Projem teslim edildikten sonra destek alabilir miyim?',
      a: 'Tüm projelerimizde 30 günlük ücretsiz garanti desteği bulunmaktadır. Sonrasında aylık bakım & büyüme paketlerimizle 7/24 teknik destek, güvenlik güncellemeleri ve performans optimizasyonu sağlıyoruz.'
    },
    {
      q: 'Mevcut web sitemin çok mu yavaş, ne yapabiliriz?',
      a: 'Site hızınızı ücretsiz analiz ederek Lighthouse skorunuzu, Core Web Vitals değerlerinizi ve gelir kaybınızı raporluyoruz. Ortalama %40 dönüşüm artışı sağlayan hız optimizasyon paketimiz mevcuttur.'
    },
    {
      q: 'Reklam bütçemi yönetmenizi isteyebilir miyim?',
      a: 'Evet. Meta Ads, Google Ads ve TikTok Ads yönetimi için minimum ₺50.000/ay reklam bütçesi ile çalışıyoruz. Performans bazlı ücretlendirme seçeneği de mevcuttur.'
    }
  ],
  en: [
    {
      q: 'How long does it take to receive a project quote?',
      a: 'After submitting the form, we get back to you within 24 hours with a detailed, personalized proposal. For urgent matters, you can reach us instantly via WhatsApp.'
    },
    {
      q: 'What is the minimum budget for a website project?',
      a: 'Our starter packages begin at €4,990. Pricing is personalized based on project scope and features. We analyze your ROI potential during the first consultation.'
    },
    {
      q: 'How fast can AI Agents and automations go live?',
      a: 'Basic AI automation flows are activated within 3-7 business days. Complex multi-channel systems with CRM integration are completed in 2-4 weeks. After a one-time setup fee, we work on a monthly management fee basis.'
    },
    {
      q: 'Which platforms do you integrate with?',
      a: 'We offer native integrations with Zapier, Make (Integromat), n8n, HubSpot, Notion, Slack, WhatsApp Business API, Google Workspace, Stripe, WooCommerce, Shopify, and 200+ other platforms.'
    },
    {
      q: 'How do you ensure GDPR compliance?',
      a: 'All our systems are fully compliant with GDPR (EU) requirements. We help you set up data processing agreements, data deletion protocols, and a comprehensive Cookie Management System.'
    },
    {
      q: 'Can I get support after the project is delivered?',
      a: 'All projects include 30 days of free warranty support. After that, our monthly maintenance & growth packages provide 24/7 technical support, security updates, and performance optimization.'
    },
    {
      q: 'My current website is very slow, what can we do?',
      a: 'We provide a free analysis of your site speed, reporting your Lighthouse score, Core Web Vitals, and estimated revenue loss. Our speed optimization package delivers an average 40% conversion rate increase.'
    },
    {
      q: 'Can you manage my advertising budget?',
      a: 'Yes. We manage Meta Ads, Google Ads, and TikTok Ads with a minimum monthly ad spend of €5,000. A performance-based fee option is also available.'
    }
  ],
  de: [
    {
      q: 'Wie lange dauert es, ein Projektangebot zu erhalten?',
      a: 'Nach dem Ausfüllen des Formulars erhalten Sie innerhalb von 24 Stunden ein detailliertes, personalisiertes Angebot. Für dringende Anfragen können Sie uns sofort über WhatsApp erreichen.'
    },
    {
      q: 'Welches Mindestbudget benötige ich für eine Website?',
      a: 'Unsere Einstiegspakete beginnen ab 4.990 €. Die Preisgestaltung wird basierend auf Projektumfang und Funktionen individuell angepasst. Wir analysieren Ihr ROI-Potenzial beim ersten Gespräch.'
    },
    {
      q: 'Wie schnell können KI-Agenten und Automatisierungen live gehen?',
      a: 'Grundlegende KI-Automatisierungsabläufe werden innerhalb von 3-7 Werktagen aktiviert. Komplexe Multi-Channel-Systeme mit CRM-Integration werden in 2-4 Wochen abgeschlossen.'
    },
    {
      q: 'Mit welchen Plattformen integrieren Sie?',
      a: 'Wir bieten native Integrationen mit Zapier, Make, n8n, HubSpot, Notion, Slack, WhatsApp Business API, Google Workspace, Stripe, WooCommerce, Shopify und 200+ weiteren Plattformen.'
    },
    {
      q: 'Wie stellen Sie die DSGVO-Konformität sicher?',
      a: 'Alle unsere Systeme sind vollständig DSGVO-konform. Wir helfen Ihnen beim Aufbau von Datenverarbeitungsverträgen, Datenlöschprotokollen und einem umfassenden Cookie-Management-System.'
    },
    {
      q: 'Kann ich nach der Projektlieferung Support erhalten?',
      a: 'Alle Projekte beinhalten 30 Tage kostenlosen Garantiesupport. Danach bieten unsere monatlichen Wartungs- und Wachstumspakete 24/7-technischen Support, Sicherheitsupdates und Leistungsoptimierung.'
    },
    {
      q: 'Meine aktuelle Website ist sehr langsam, was können wir tun?',
      a: 'Wir analysieren kostenlos Ihre Website-Geschwindigkeit und berichten über Ihren Lighthouse-Score, Core Web Vitals und geschätzte Umsatzverluste. Unser Optimierungspaket liefert durchschnittlich 40% mehr Conversions.'
    },
    {
      q: 'Können Sie mein Werbebudget verwalten?',
      a: 'Ja. Wir verwalten Meta Ads, Google Ads und TikTok Ads mit einem monatlichen Mindestwerbebudget von 5.000 €. Eine leistungsbasierte Gebührenoption ist ebenfalls verfügbar.'
    }
  ]
}

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className={`border border-white/[0.06] rounded-2xl overflow-hidden transition-all duration-300 ${open ? 'bg-white/[0.04]' : 'bg-transparent hover:bg-white/[0.02]'}`}
    >
      <button
        className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="flex items-center gap-3">
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
            style={{ background: 'rgba(139,92,246,0.15)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.3)' }}
          >
            {index + 1}
          </span>
          <span className="font-semibold text-white text-sm sm:text-base">{q}</span>
        </span>
        <ChevronDown
          className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180 text-[#8B5CF6]' : 'text-[#64748B]'}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <p className="px-6 pb-5 text-[#94A3B8] text-sm leading-relaxed pl-[4.25rem]">{a}</p>
      </div>
    </div>
  )
}

export default function FAQSection() {
  const { language } = useLanguage()
  const sectionRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  const items = faqs[language] || faqs.tr

  const titles = {
    tr: { badge: 'Sıkça Sorulan Sorular', h2: 'Aklınızdaki ', h2g: 'Her Soruya Cevap', sub: 'Projeye başlamadan önce merak ettiğiniz her şeyi burada yanıtlıyoruz.' },
    en: { badge: 'FAQ', h2: 'Answers to ', h2g: 'Every Question', sub: 'Everything you\'re curious about before starting your project, answered here.' },
    de: { badge: 'Häufig gestellte Fragen', h2: 'Antworten auf ', h2g: 'Jede Frage', sub: 'Alles, was Sie vor Projektbeginn wissen möchten, hier beantwortet.' }
  }
  const t = titles[language] || titles.tr

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

  return (
    <section id="faq" className="section relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#8B5CF6]/3 blur-3xl" />
      </div>

      <div ref={sectionRef} className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-14 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 mb-4">
            <HelpCircle className="w-4 h-4 text-[#8B5CF6]" />
            <span className="tag-badge">{t.badge}</span>
          </div>
          <h2 className="heading-lg text-white mt-2 mb-4">
            {t.h2}<span className="gradient-text">{t.h2g}</span>
          </h2>
          <p className="text-[#94A3B8] text-lg max-w-xl mx-auto">{t.sub}</p>
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {items.map((item, i) => (
            <div
              key={i}
              className={`transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <FAQItem q={item.q} a={item.a} index={i} />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className={`text-center mt-12 transition-all duration-700 delay-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <p className="text-[#64748B] text-sm">
            {language === 'tr' ? 'Başka sorularınız mı var?' : language === 'de' ? 'Haben Sie weitere Fragen?' : 'Have more questions?'}{' '}
            <a href="#contact" className="text-[#8B5CF6] hover:text-[#7C3AED] font-medium transition-colors underline underline-offset-4">
              {language === 'tr' ? 'Bizimle konuşun →' : language === 'de' ? 'Sprechen Sie mit uns →' : 'Talk to us →'}
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
