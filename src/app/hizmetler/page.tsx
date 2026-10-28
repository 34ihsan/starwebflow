import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import ChatWidget from '@/components/marketing/ChatWidget'
import Link from 'next/link'
import {
  Bot,
  Workflow,
  Globe,
  LayoutGrid,
  Megaphone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Server,
  Zap,
  Activity,
  Layers,
} from 'lucide-react'

export const metadata = {
  title: 'Kurumsal Çözüm & Mimari Kataloğu | Starwebflow',
  description:
    'Özel sunuculu yapay zeka ajanları, süreç otomasyonları, yüksek hızlı Next.js web platformları ve 7/24 telemetri izleme çözümlerimiz.',
}

const SERVICES = [
  {
    id: 'ai-agents',
    title: 'Sovereign AI Agents & Dijital Çalışanlar',
    badge: 'Özel Sunucu (Ollama)',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    desc: 'Müşteri konuşmalarınızı OpenAI, Anthropic veya Gemini gibi bulutlara göndermeden; kendi dedike sunucunuzda (Almanya/TR) tüm veriler sizde kalacak şekilde çalışan yerel Ollama ajanları.',
    highlights: [
      '%100 DSGVO ve KVKK uyumlu yerel LLM mimarisi',
      'Pipedrive, HubSpot ve özel CRM tam entegrasyonu',
      'Aylık sıfır token faturası ve 18ms yanıt gecikmesi',
      'Çok dilli (Türkçe, Almanca, İngilizce) doğal konuşma',
    ],
    href: '/hizmetler/ai-agents',
    icon: Bot,
    color: 'from-purple-500/20 to-indigo-500/10',
    border: 'border-purple-500/30',
  },
  {
    id: 'ai-otomasyon',
    title: 'Uçtan Uca Süreç & CRM Otomasyonları',
    badge: 'Operasyonel Verimlilik',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    desc: 'Manuel veri girişlerini, geciken faturaları ve kaçan müşteri taleplerini ortadan kaldıran akıllı n8n ve webhook boru hatları.',
    highlights: [
      'Gelen lead’lerin otomatik filtrelenmesi ve skorlanması',
      'Otomatik PDF teklif, sözleşme ve fatura üretimi',
      'Takvim, WhatsApp ve e-posta koordinasyon zincirleri',
      'Haftalık 20+ saatlik operasyonel iş yükü tasarrufu',
    ],
    href: '/hizmetler/ai-otomasyon',
    icon: Workflow,
    color: 'from-amber-500/20 to-orange-500/10',
    border: 'border-amber-500/30',
  },
  {
    id: 'web-gelistirme',
    title: 'Sub-Second Kurumsal Web Geliştirme',
    badge: '0.8s LCP Garantisi',
    badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    desc: 'Yavaş şablonlar ve hantal eklentiler yerine; Next.js 14 App Router, TypeScript ve Tailwind ile inşa edilmiş ışık hızında kurumsal web sistemleri.',
    highlights: [
      'Milisaniyelik yükleme hızı (Google Core Web Vitals 100/100)',
      'A+ SSL, HSTS ve kurumsal güvenlik başlıkları',
      'SEO ve GEO (Yapay Zeka Arama Motorları) optimizasyonu',
      'Headless mimari ve modüler içerik yönetimi',
    ],
    href: '/hizmetler/web-gelistirme',
    icon: Globe,
    color: 'from-blue-500/20 to-cyan-500/10',
    border: 'border-blue-500/30',
  },
  {
    id: 'web-uygulamasi',
    title: 'Özel Web Uygulamaları & Müşteri Portalları',
    badge: 'Kurumsal Yazılım',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    desc: 'Müşterilerinizin sözleşmelerini, faturalarını ve proje aşamalarını canlı takip edebildiği, banka standardında güvenli web portalları ve SaaS altyapıları.',
    highlights: [
      'Rol tabanlı yetkilendirme (RBAC) ve güvenli kimlik doğrulama',
      'Canlı proje kilometre taşları ve ticket destek sistemi',
      'Dinamik faturalama ve Stripe/SEPA ödeme entegrasyonu',
      'DIN ISO 25010 yazılım kalite standardında mimari',
    ],
    href: '/hizmetler/web-uygulamasi',
    icon: LayoutGrid,
    color: 'from-emerald-500/20 to-teal-500/10',
    border: 'border-emerald-500/30',
  },
  {
    id: 'reklam-sosyal-medya',
    title: 'Veriye Dayalı Büyüme & Reklam Mühendisliği',
    badge: 'Algoritmik Dönüşüm',
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    desc: 'Sadece bütçe harcayan reklamlar yerine; landing page dönüşüm optimizasyonu, otomatik kreatif üretimi ve B2B müşteri kazanım hunileri.',
    highlights: [
      'Google Ads & Meta dinamik kitle ve intent hedeflemesi',
      'Landing page A/B testleri ile düşürülen edinim maliyeti (CAC)',
      'Canlı ciro takibi ve çok kanallı attribution modelleme',
      'Otomatikleştirilmiş B2B soğuk e-posta ve LinkedIn akışları',
    ],
    href: '/hizmetler/reklam-sosyal-medya',
    icon: Megaphone,
    color: 'from-rose-500/20 to-pink-500/10',
    border: 'border-rose-500/30',
  },
]

export default function HizmetlerPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="max-w-3xl mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 mb-4">
              <Layers className="w-3.5 h-3.5" />
              <span>Çözüm & Mimari Kataloğu</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-6">
              İşletmenizi{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">
                Geleceğin Dijital Standartlarına
              </span>{' '}
              Taşıyan Mühendislik.
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed">
              Tek bir sağlayıcıya bağımlı olmadan, mülkiyeti tamamen sizde olan, Avrupa veri gizliliği (DSGVO) standartlarında çalışan kurumsal altyapı çözümlerimizi keşfedin.
            </p>
          </div>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {SERVICES.map((srv) => {
              const Icon = srv.icon
              return (
                <div
                  key={srv.id}
                  className={`rounded-3xl bg-slate-900/80 border ${srv.border} p-8 flex flex-col justify-between hover:border-slate-600 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-white">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-mono font-semibold border ${srv.badgeColor}`}>
                        {srv.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                      {srv.title}
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed mb-6">
                      {srv.desc}
                    </p>

                    <div className="space-y-2.5 mb-8">
                      {srv.highlights.map((h, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80">
                    <Link
                      href={srv.href}
                      className="inline-flex items-center justify-between w-full text-sm font-bold text-white group hover:text-blue-400 transition-colors"
                    >
                      <span>Detaylı Mimariyi İncele</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Bottom Enterprise Architecture Consultation Banner */}
          <div className="mt-20 p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-900/40 via-purple-900/30 to-slate-900 border border-slate-800 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <h3 className="text-2xl font-bold text-white mb-2">
                Hangi Çözümün İşletmenize Uygun Olduğundan Emin Değil misiniz?
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Mevcut sistemlerinizi ücretsiz tarayarak dijital açıklarınızı, hız kayıplarınızı ve otomasyon potansiyelinizi 3 saniyede tespit edelim.
              </p>
            </div>
            <Link
              href="/#audit"
              className="px-6 py-3.5 rounded-xl bg-white text-slate-950 font-bold text-sm hover:bg-slate-100 transition-colors shrink-0 shadow-lg"
            >
              Canlı Sistem Analizi Başlat →
            </Link>
          </div>

        </div>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  )
}
