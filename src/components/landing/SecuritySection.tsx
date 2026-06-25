'use client'

import { useRef, useEffect, useState } from 'react'
import { ShieldCheck, Lock, Server, Eye, FileKey, Fingerprint, Globe, Clock } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

const certifications = [
  { label: 'KVKK', desc: 'Türkiye' },
  { label: 'GDPR', desc: 'Avrupa Birliği' },
  { label: 'SSL/TLS', desc: 'Bank-Grade' },
  { label: 'NDA', desc: 'Gizlilik Anlaşması' },
  { label: '99.9%', desc: 'Uptime SLA' },
  { label: 'ISO 27001', desc: 'Altyapı' },
]

const features = {
  tr: [
    { icon: Lock, color: '#10B981', title: 'Uçtan Uca Şifreleme', desc: 'Tüm verileriniz AES-256 şifrelemesi ile hem aktarım hem de depolama sırasında korunur.' },
    { icon: Server, color: '#4F8EF7', title: 'İzole Altyapı', desc: 'Her müşteri veritabanı fiziksel olarak izole edilmiştir. Çapraz veri erişimi mimarinin dışındadır.' },
    { icon: Eye, color: '#8B5CF6', title: 'Gerçek Zamanlı Tehdit İzleme', desc: 'SIEM entegrasyonu ile şüpheli aktiviteler anında tespit edilir, 7/24 log analizi yapılır.' },
    { icon: FileKey, color: '#F59E0B', title: 'KVKK & GDPR Uyumu', desc: 'Veri işleme sözleşmeleri, imha protokolleri ve Çerez Yönetim Sistemi tam uyumlu şekilde kurulur.' },
    { icon: Fingerprint, color: '#EF4444', title: 'Çok Faktörlü Kimlik Doğrulama', desc: 'Admin paneli ve hassas işlemler için MFA zorunludur. Brute-force koruması aktiftir.' },
    { icon: Globe, color: '#06B6D4', title: 'CDN & DDoS Koruması', desc: 'Cloudflare Enterprise altyapısı ile global CDN, Web Application Firewall ve DDoS koruması.' },
    { icon: Clock, color: '#F97316', title: 'Otomatik Yedekleme', desc: 'Günlük şifreli yedeklemeler, 30 günlük Point-in-Time Recovery ve felaket kurtarma planı.' },
    { icon: ShieldCheck, color: '#10B981', title: 'Sızma Testi', desc: 'Yılda iki kez üçüncü taraf güvenlik firması tarafından penetrasyon testi ve açık taraması.' },
  ],
  en: [
    { icon: Lock, color: '#10B981', title: 'End-to-End Encryption', desc: 'All your data is protected with AES-256 encryption both in transit and at rest.' },
    { icon: Server, color: '#4F8EF7', title: 'Isolated Infrastructure', desc: 'Each client database is physically isolated. Cross-data access is architecturally impossible.' },
    { icon: Eye, color: '#8B5CF6', title: 'Real-Time Threat Monitoring', desc: 'SIEM integration detects suspicious activity instantly, with 24/7 log analysis.' },
    { icon: FileKey, color: '#F59E0B', title: 'GDPR & KVKK Compliance', desc: 'Data processing agreements, deletion protocols, and Cookie Management System fully configured.' },
    { icon: Fingerprint, color: '#EF4444', title: 'Multi-Factor Authentication', desc: 'MFA is mandatory for admin panels and sensitive operations. Brute-force protection is active.' },
    { icon: Globe, color: '#06B6D4', title: 'CDN & DDoS Protection', desc: 'Cloudflare Enterprise infrastructure with global CDN, Web Application Firewall, and DDoS protection.' },
    { icon: Clock, color: '#F97316', title: 'Automated Backups', desc: 'Daily encrypted backups, 30-day Point-in-Time Recovery, and disaster recovery plan.' },
    { icon: ShieldCheck, color: '#10B981', title: 'Penetration Testing', desc: 'Semi-annual penetration testing and vulnerability scanning by third-party security firms.' },
  ],
  de: [
    { icon: Lock, color: '#10B981', title: 'Ende-zu-Ende-Verschlüsselung', desc: 'Alle Ihre Daten werden mit AES-256-Verschlüsselung sowohl bei der Übertragung als auch im Ruhezustand geschützt.' },
    { icon: Server, color: '#4F8EF7', title: 'Isolierte Infrastruktur', desc: 'Jede Kundendatenbank ist physisch isoliert. Datenübergreifender Zugriff ist architektonisch ausgeschlossen.' },
    { icon: Eye, color: '#8B5CF6', title: 'Echtzeit-Bedrohungsüberwachung', desc: 'SIEM-Integration erkennt verdächtige Aktivitäten sofort, mit 24/7-Protokollanalyse.' },
    { icon: FileKey, color: '#F59E0B', title: 'DSGVO & KVKK-Konformität', desc: 'Datenverarbeitungsverträge, Löschprotokolle und Cookie-Management-System vollständig eingerichtet.' },
    { icon: Fingerprint, color: '#EF4444', title: 'Multi-Faktor-Authentifizierung', desc: 'MFA ist für Admin-Panels und sensible Operationen obligatorisch. Brute-Force-Schutz ist aktiv.' },
    { icon: Globe, color: '#06B6D4', title: 'CDN & DDoS-Schutz', desc: 'Cloudflare Enterprise-Infrastruktur mit globalem CDN, Web Application Firewall und DDoS-Schutz.' },
    { icon: Clock, color: '#F97316', title: 'Automatisierte Backups', desc: 'Tägliche verschlüsselte Backups, 30-Tage Point-in-Time-Recovery und Notfallwiederherstellungsplan.' },
    { icon: ShieldCheck, color: '#10B981', title: 'Penetrationstests', desc: 'Halbjährliche Penetrationstests und Schwachstellenscans durch Drittanbieter-Sicherheitsfirmen.' },
  ]
}

export default function SecuritySection() {
  const { language } = useLanguage()
  const sectionRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  const items = features[language] || features.tr
  const titles = {
    tr: { badge: 'Güvenlik & Uyumluluk', h2: 'Bank-Grade', h2g: ' Güvenlik Altyapısı', sub: 'Verileriniz, müşteri bilgileriniz ve iş akışlarınız en yüksek güvenlik standartlarıyla korunur. Güvenliği size bırakın.' },
    en: { badge: 'Security & Compliance', h2: 'Bank-Grade', h2g: ' Security Infrastructure', sub: 'Your data, customer information, and workflows are protected with the highest security standards. Leave security to us.' },
    de: { badge: 'Sicherheit & Compliance', h2: 'Bank-Grade', h2g: ' Sicherheitsinfrastruktur', sub: 'Ihre Daten, Kundeninformationen und Workflows werden mit den höchsten Sicherheitsstandards geschützt.' }
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
    <section className="section relative overflow-hidden border-t border-white/[0.04]">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-[#10B981]/4 blur-[120px] rounded-full" />
      </div>

      <div ref={sectionRef} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/20 mb-6 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
            <ShieldCheck className="w-8 h-8 text-[#10B981]" />
          </div>
          <span className="tag-badge mb-4">{t.badge}</span>
          <h2 className="heading-lg text-white mt-4 mb-4">
            <span className="text-[#10B981]">{t.h2}</span>{t.h2g}
          </h2>
          <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto leading-relaxed">{t.sub}</p>
        </div>

        {/* Certifications bar */}
        <div className={`flex flex-wrap items-center justify-center gap-4 mb-16 transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {certifications.map((cert, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-[#10B981]/20 bg-[#10B981]/5"
            >
              <ShieldCheck className="w-4 h-4 text-[#10B981] flex-shrink-0" />
              <div>
                <p className="text-white font-black text-sm font-['Outfit']">{cert.label}</p>
                <p className="text-[#64748B] text-[10px]">{cert.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item, i) => {
            const Icon = item.icon
            return (
              <div
                key={i}
                className={`rounded-2xl border border-white/[0.06] bg-[#0F0F1A]/80 p-5 hover:border-white/10 hover:bg-[#0F0F1A] transition-all duration-300 group relative overflow-hidden ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${(i + 2) * 80}ms` }}
              >
                {/* Top color line */}
                <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${item.color}50, transparent)` }} />

                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                  style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}
                >
                  <Icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <h4 className="text-white font-bold text-sm mb-2 font-['Outfit']">{item.title}</h4>
                <p className="text-[#64748B] text-xs leading-relaxed">{item.desc}</p>
              </div>
            )
          })}
        </div>

        {/* Bottom trust statement */}
        <div className={`mt-14 text-center transition-all duration-700 delay-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-[#10B981]/20 bg-[#10B981]/5">
            <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[#10B981] font-semibold text-sm">
              {language === 'tr' ? 'Tüm sistemler aktif ve güvende — Son kontrol: şimdi' : language === 'de' ? 'Alle Systeme aktiv und sicher — Letzter Check: jetzt' : 'All systems active and secure — Last check: now'}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
