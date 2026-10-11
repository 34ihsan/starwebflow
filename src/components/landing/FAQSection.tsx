'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import { ChevronDown, HelpCircle, Search, Filter } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

const faqs = {
  tr: [
    {
      q: 'Bir proje teklifi almak ne kadar sürer?',
      a: 'Formu doldurduktan veya bizimle iletişime geçtikten sonra 24 saat içinde işletmenizin ihtiyaçlarına özel hazırlanmış detaylı teknik analiz ve fiyat teklifi sunuyoruz. Acil projeleriniz için WhatsApp üzerinden anında uzmanımızla görüşebilirsiniz.'
    },
    {
      q: 'Web sitesi veya yazılım projem için bütçe nasıl belirlenir?',
      a: 'Proje maliyetleri; yapılacak teknik işlemlere, sayfa sayısına, özel UI/UX tasarım taleplerine, istenen entegrasyonlara (CRM, ERP, AI Agent) ve dil seçeneklerine göre şeffaf bir şekilde hesaplanır. Her işletmenin ihtiyacına özel modüler fiyatlandırma sunulur. İlk görüşmede yatırımınızın geri dönüşünü (ROI) ve projenin operasyonel kârlılığını birlikte analiz ederiz.'
    },
    {
      q: 'AI Agents ve otomasyon ne kadar sürede devreye girer?',
      a: 'Temel AI otomasyon akışları 3-7 iş günü içinde aktive edilir. CRM entegrasyonlu karmaşık çok kanallı sistemler 2-4 haftada tamamlanır. Tek seferlik kurulum ücreti sonrası opsiyonel aylık bakım & geliştirme paketleriyle çalışırız.'
    },
    {
      q: 'Hangi platformlarla entegrasyon yapıyorsunuz?',
      a: 'Zapier, Make, n8n, HubSpot, Salesforce, SAP, Odoo, WhatsApp Business API, Stripe, PayPal, Klarna, WooCommerce, Shopify ve 200+ global platformla native ve güvenli API entegrasyonu sağlıyoruz.'
    },
    {
      q: 'DSGVO, GDPR ve KVKK yasal uyumluluğu nasıl sağlanıyor?',
      a: 'Almanya (DSGVO), Avrupa Birliği (GDPR) ve Türkiye (KVKK) veri koruma yasalarına %100 tam uyumlu altyapı kuruyoruz. Veri işleme sözleşmeleri (AVV / DPA), veri gizliliği politikaları, otomatik veri imha protokolleri ve AB standartlarında Çerez Yönetim Sistemi (Cookie Consent) dahil tüm hukuki altyapıyı projenize entegre ediyoruz.'
    },
    {
      q: 'Projem teslim edildikten sonra destek alabilir miyim?',
      a: 'Tüm projelerimizde 30 günlük ücretsiz garanti ve teknik destek sunulur. Sonrasında aylık bakım & büyüme paketlerimizle 7/24 teknik destek, güvenlik güncellemeleri, sunucu optimizasyonu ve yeni özellik geliştirmeleri sağlıyoruz.'
    },
    {
      q: 'Mevcut web sitem çok mu yavaş, ne yapabiliriz?',
      a: 'Sitenizi ücretsiz teknik analize tabi tutarak Lighthouse skorunuzu, Core Web Vitals değerlerinizi ve hız kaynaklı gelir kaybınızı raporluyoruz. Ortalama %40 dönüşüm artışı sağlayan Next.js / SSR performans optimizasyon paketimiz mevcuttur.'
    },
    {
      q: 'Reklam bütçemi yönetmenizi isteyebilir miyim?',
      a: 'Evet. Almanya, Avrupa ve Türkiye pazarlarında Meta Ads, Google Ads ve TikTok Ads yönetimi yapıyoruz. Minimum 1.500 € / ay (veya Türkiye odaklı projeler için ₺50.000 / ay) reklam bütçeleri ile çalışıyoruz. Performans odaklı (ROAS) stratejiler uyguluyoruz.'
    },
    {
      q: 'İşletmeme özel AI Agent nasıl eğitilir?',
      a: 'Şirketinizin mevcut verilerini (PDF belgeleri, web sitesi içeriği, önceki yazışmalar, ürün katalogları, Fiyat listeleri) kullanarak özel RAG mimarisiyle LLM modellerini eğitiyoruz. Böylece Agent, sadece sizin markanızın dilinde ve sizin bilgi tabanınıza göre müşterilerinizle 7/24 iletişim kurar.'
    },
    {
      q: 'AI otomasyonları işletmeme ne gibi faydalar sağlar?',
      a: 'Tekrarlayan manuel işleri otomatikleştirerek insan hatasını sıfıra indirir, 7/24 kesintisiz müşteri desteği sunar ve operasyonel maliyetlerinizi %60\'a varan oranda düşürür. Ekibiniz yüksek katma değerli stratejik işlere odaklanırken, AI rutin süreçleri yönetir.'
    },
    {
      q: 'AI Agent\'lar müşteri verilerini güvende tutuyor mu? (DSGVO / GDPR)',
      a: 'Evet, kesinlikle. Tüm sistemlerimiz Almanya ve AB sunucularında (Frankfurt/Europe) şifrelenmiş (AES-256) kapalı ortamlarda çalışır. Müşteri verileriniz hiçbir şekilde kamuya açık LLM modellerinin eğitiminde kullanılmaz. OpenAI Enterprise ve Anthropic API standartlarıyla DSGVO, GDPR ve KVKK uyumlu uçtan uca veri güvenliği sağlıyoruz.'
    },
    {
      q: 'Mevcut sistemlerim (ERP, CRM) AI ile konuşabilir mi?',
      a: 'Kesinlikle. Geliştirdiğimiz AI sistemleri API üzerinden HubSpot, Salesforce, SAP, Odoo gibi CRM ve ERP yazılımlarınızla çift yönlü veri alışverişi yapabilir. Agent, CRM\'den müşteri bilgisi çekebilir, stok kontrol edebilir ve yeni sipariş/randevu kayıtları oluşturabilir.'
    },
    {
      q: 'Müşteri destek ekibimin yerini tamamen AI mı alacak?',
      a: 'Hayır, AI Agent\'lar ekibinizi ikame etmek için değil, onların üzerindeki yükü almak için tasarlanmıştır. Sıkça sorulan soruları, rutin randevu veya sipariş durum sorgularını AI otomatik yanıtlar; insan dokunuşu ve uzmanlık gerektiren özel talepleri ise anında ilgili temsilcinize aktarır.'
    },
    {
      q: 'E-ticaret sitemde AI Agent satışlarımı artırabilir mi?',
      a: 'Evet. E-ticaret için eğittiğimiz AI asistanlar; kullanıcının sepetine veya ilgi alanına özel kişiselleştirilmiş ürün tavsiyeleri sunar, sepet terk etme oranlarını düşürür ve 7/24 aktif bir satış danışmanı gibi çalışarak dönüşüm oranlarınızı artırır.'
    },
    {
      q: 'Şirket içi operasyonlarda (İnsan Kaynakları, Finans) otomasyon kullanabilir miyim?',
      a: 'Evet. Sadece dış müşterileriniz için değil, iç ekibiniz için de AI sistemleri kuruyoruz. İzin talepleri, masraf onayları, yeni çalışan oryantasyonu (onboarding) veya şirket içi bilgi bankası sorgulamaları gibi süreçleri tamamen otomatik hale getirebiliriz.'
    },
    {
      q: 'Arama Motoru Optimizasyonu (SEO) hizmetiniz neler içeriyor ve ne zaman sonuç alınır?',
      a: 'SEO mimarimiz; Next.js SSR (Server-Side Rendering) altyapısı, 0.4 saniye altı sayfa açılış hızı, mobil öncelikli UX tasarımı, Core Web Vitals değerlerinin mükemmelleştirilmesi ve anahtar kelime odaklı içerik stratejisini kapsar. Sektöre göre değişmekle birlikte genellikle 4-8 hafta içinde Google arama sonuçlarında belirgin sıralama ve organik trafik artışı sağlanır.'
    },
    {
      q: 'GEO (Generative Engine Optimization / AI Arama Optimizasyonu) nedir ve bize ne kazandırır?',
      a: 'GEO (veya AEO - Answer Engine Optimization); ChatGPT, Claude, Perplexity ve Google Gemini gibi yapay zeka arama motorlarının kullanıcı sorularına yanıt verirken şirketinizin markasını, hizmetlerini ve ürünlerini öncelikli tavsiye edilen kaynak olarak önermesini sağlayan yeni nesil optimizasyon teknolojisidir. Geliştirdiğimiz 10 katmanlı JSON-LD şema mimarisi, SpeakableSpec ve AEO veri blokları sayesinde markanız yapay zekaların ilk sırada önerdiği lider konuma gelir.'
    },
    {
      q: 'Geliştirdiğiniz AI çözümleri sadece metin mi anlıyor?',
      a: 'Hayır. Entegre ettiğimiz çoklu model (multimodal) AI sistemleri ses kayıtlarını dinleyip anlayabilir, doküman ve görselleri analiz edebilir ve hatta telefon aramalarına doğal insan sesiyle anında yanıt verebilir.'
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
    },
    {
      q: 'How is a custom AI Agent trained for my business?',
      a: 'We train LLM models using your company\'s existing data (PDFs, website, past communications, product catalogs). This ensures the Agent communicates exclusively in your brand\'s voice and based on your knowledge base.'
    },
    {
      q: 'What benefits do AI automations bring to my business?',
      a: 'By automating repetitive tasks, it eliminates human error, provides 24/7 customer support, and reduces operational costs by up to 60%. While your team focuses on strategic tasks, AI handles routine processes.'
    },
    {
      q: 'Do AI Agents keep customer data safe?',
      a: 'Yes. All our models run in secure environments and customer data is not used for LLM training. We use Enterprise APIs from platforms like OpenAI and Anthropic to ensure encrypted, GDPR-compliant data transmission.'
    },
    {
      q: 'Can my existing systems (ERP, CRM) communicate with AI?',
      a: 'Absolutely. The AI systems we develop can exchange data bi-directionally with your CRM and ERP software like HubSpot, Salesforce, SAP, and Odoo via API. The Agent can pull information from the CRM and create new customer records.'
    },
    {
      q: 'Will AI completely replace my customer support team?',
      a: 'No, AI Agents are designed to support your team, not replace them. While AI handles frequently asked questions, routine appointments, or order processing, your human team can focus exclusively on complex customer requests that require empathy and a human touch.'
    },
    {
      q: 'Can an AI Agent increase sales on my e-commerce site?',
      a: 'Absolutely. The AI assistants we train for e-commerce provide personalized product recommendations based on a user\'s cart or search history, reduce cart abandonment rates, and act as a 24/7 active sales consultant to boost conversion rates.'
    },
    {
      q: 'Can I use automation for internal operations (HR, Finance)?',
      a: 'Yes. We build AI systems not just for external customers, but also for your internal team. We can fully automate processes like leave requests, expense approvals, new employee onboarding, or querying the internal company knowledge base.'
    },
    {
      q: 'Do your AI solutions only understand text?',
      a: 'No. The next-generation AI models we integrate have multimodal capabilities. They can listen to and understand voice messages from your customers, analyze images, and even respond to phone calls instantly with a natural human voice.'
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
    },
    {
      q: 'Wie wird ein individueller KI-Agent für mein Unternehmen trainiert?',
      a: 'Wir trainieren LLM-Modelle mit den vorhandenen Daten Ihres Unternehmens (PDFs, Website, vergangene Kommunikation, Produktkataloge). Dadurch kommuniziert der Agent ausschließlich in der Stimme Ihrer Marke und auf Basis Ihrer Wissensdatenbank.'
    },
    {
      q: 'Welche Vorteile bringen KI-Automatisierungen für mein Unternehmen?',
      a: 'Durch die Automatisierung wiederkehrender Aufgaben werden menschliche Fehler eliminiert, ein 24/7-Kundensupport geboten und die Betriebskosten um bis zu 60 % gesenkt. Während sich Ihr Team auf strategische Aufgaben konzentriert, übernimmt die KI Routineprozesse.'
    },
    {
      q: 'Halten KI-Agenten Kundendaten sicher?',
      a: 'Ja. Alle unsere Modelle laufen in sicheren Umgebungen und Kundendaten werden nicht für das LLM-Training verwendet. Wir nutzen Enterprise-APIs von Plattformen wie OpenAI und Anthropic, um eine verschlüsselte, DSGVO-konforme Datenübertragung zu gewährleisten.'
    },
    {
      q: 'Können meine bestehenden Systeme (ERP, CRM) mit der KI kommunizieren?',
      a: 'Absolut. Die von uns entwickelten KI-Systeme können über APIs bidirektional Daten mit Ihrer CRM- und ERP-Software wie HubSpot, Salesforce, SAP und Odoo austauschen. Der Agent kann Informationen aus dem CRM abrufen und neue Kundendatensätze erstellen.'
    },
    {
      q: 'Wird KI mein Kundensupport-Team vollständig ersetzen?',
      a: 'Nein, KI-Agenten sollen Ihr Team unterstützen und nicht ersetzen. Während die KI häufig gestellte Fragen, routinemäßige Terminvergaben oder Bestellabwicklungen übernimmt, kann sich Ihr Team ausschließlich auf komplexe Kundenanfragen konzentrieren, die eine menschliche Note erfordern.'
    },
    {
      q: 'Kann ein KI-Agent den Umsatz auf meiner E-Commerce-Website steigern?',
      a: 'Absolut. Die von uns für E-Commerce trainierten KI-Assistenten bieten personalisierte Produktempfehlungen basierend auf dem Warenkorb oder Suchverlauf des Benutzers, reduzieren Warenkorbabbrüche und fungieren als 24/7 aktiver Verkaufsberater, um die Konversionsraten zu erhöhen.'
    },
    {
      q: 'Kann ich Automatisierung für interne Abläufe (HR, Finanzen) nutzen?',
      a: 'Ja. Wir entwickeln KI-Systeme nicht nur für externe Kunden, sondern auch für Ihr internes Team. Wir können Prozesse wie Urlaubsanträge, Spesengenehmigungen, das Onboarding neuer Mitarbeiter oder Abfragen in der internen Unternehmenswissensdatenbank vollständig automatisieren.'
    },
    {
      q: 'Verstehen Ihre KI-Lösungen nur Text?',
      a: 'Nein. Die von uns integrierten KI-Modelle der nächsten Generation verfügen über multimodale Fähigkeiten. Sie können Sprachnachrichten Ihrer Kunden hören und verstehen, Bilder analysieren und sogar sofort mit einer natürlichen menschlichen Stimme auf Telefonanrufe antworten.'
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
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'ai' | 'web'>('all')

  const items = faqs[language] || faqs.tr

  const filteredItems = useMemo(() => {
    return items.filter((item, idx) => {
      const matchesSearch = item.q.toLowerCase().includes(searchQuery.toLowerCase()) || item.a.toLowerCase().includes(searchQuery.toLowerCase())
      if (!matchesSearch) return false

      if (selectedCategory === 'ai') return idx >= 2 && idx <= 15
      if (selectedCategory === 'web') return idx < 2 || idx === 6 || idx === 7
      return true
    })
  }, [items, searchQuery, selectedCategory])

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
        <div className={`text-center mb-10 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 mb-4">
            <HelpCircle className="w-4 h-4 text-[#8B5CF6]" />
            <span className="tag-badge">{t.badge}</span>
          </div>
          <h2 className="heading-lg text-white mt-2 mb-4">
            {t.h2}<span className="gradient-text">{t.h2g}</span>
          </h2>
          <p className="text-[#94A3B8] text-lg max-w-xl mx-auto mb-8">{t.sub}</p>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 max-w-lg mx-auto">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={language === 'tr' ? 'Soru veya anahtar kelime ara...' : language === 'de' ? 'Frage oder Stichwort suchen...' : 'Search question or keyword...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0F0F1A] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#475569] focus:outline-none focus:border-[#8B5CF6]/50 transition-colors"
              />
            </div>
            <div className="flex items-center gap-1.5 bg-[#0F0F1A] border border-white/[0.08] rounded-xl p-1 w-full sm:w-auto justify-center">
              {[
                { id: 'all', label: language === 'tr' ? 'Tümü' : language === 'de' ? 'Alle' : 'All' },
                { id: 'ai',  label: 'AI & Bot' },
                { id: 'web', label: 'Web' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${selectedCategory === cat.id ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30' : 'text-[#64748B] hover:text-white'}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-[#64748B] text-sm">
              {language === 'tr'
                ? 'Aramanızla eşleşen soru bulunamadı.'
                : language === 'de'
                ? 'Keine passenden Fragen gefunden.'
                : 'No matching questions found.'}
            </div>
          ) : (
            filteredItems.map((item, i) => (
              <div
                key={i}
                className={`transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{ transitionDelay: `${Math.min(i * 40, 400)}ms` }}
              >
                <FAQItem q={item.q} a={item.a} index={i} />
              </div>
            ))
          )}
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
