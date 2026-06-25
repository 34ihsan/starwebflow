'use client'

import { useState, useRef, useEffect } from 'react'
import GlowCard from '@/components/ui/GlowCard'
import Button from '@/components/ui/Button'
import { Terminal, Sparkles, CheckCircle2, FileText, Server, Lock, Calendar } from 'lucide-react'
import LeadFormModal from '@/components/services/LeadFormModal'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function SpecBuilderSimulation() {
  const { t, language } = useLanguage()
  const sectionRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  
  const [projectIdea, setProjectIdea] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [progress, setProgress] = useState(0)
  const [terminalLogs, setTerminalLogs] = useState<string[]>([])

  // Lead capture for PDF Download
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDownloaded, setIsDownloaded] = useState(false)
  const [leadData, setLeadData] = useState({ name: '', email: '' })

  const handleLeadSubmitSuccess = (data: { name: string; email: string }) => {
    setLeadData(data)
    setIsDownloaded(true)
    setIsModalOpen(false)

    // Trigger dynamic PDF stream download
    window.location.href = `/api/v1/pdf/lastenheft?name=${encodeURIComponent(data.name)}&email=${encodeURIComponent(data.email)}&idea=${encodeURIComponent(projectIdea)}`
  }

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

  const handleSimulate = () => {
    if (!projectIdea.trim()) return
    setIsAnalyzing(true)
    setShowResult(false)
    setProgress(0)

    const initLogs = language === 'tr'
      ? ['[SYSTEM] Analiz başlatılıyor...', '[AI] NLP modelleri yükleniyor...']
      : language === 'de'
      ? ['[SYSTEM] Analyse wird gestartet...', '[AI] NLP-Modelle werden geladen...']
      : ['[SYSTEM] Starting analysis...', '[AI] Loading NLP models...']

    setTerminalLogs(initLogs)

    const steps = language === 'tr' ? [
      { p: 25, log: '[AI] Sektör gereksinimleri çıkarılıyor...' },
      { p: 50, log: '[DB] Veri mimarisi kurgulanıyor...' },
      { p: 75, log: '[SEC] Güvenlik standartları belirleniyor...' },
      { p: 100, log: '[SYSTEM] Lastenheft taslağı hazırlandı.' }
    ] : language === 'de' ? [
      { p: 25, log: '[AI] Branchenanforderungen werden extrahiert...' },
      { p: 50, log: '[DB] Datenstruktur wird entworfen...' },
      { p: 75, log: '[SEC] Sicherheitsstandards werden definiert...' },
      { p: 100, log: '[SYSTEM] Lastenheft-Entwurf ist bereit.' }
    ] : [
      { p: 25, log: '[AI] Extracting industry requirements...' },
      { p: 50, log: '[DB] Designing data architecture...' },
      { p: 75, log: '[SEC] Defining security standards...' },
      { p: 100, log: '[SYSTEM] Lastenheft draft is ready.' }
    ]

    steps.forEach((step, index) => {
      setTimeout(() => {
        setProgress(step.p)
        setTerminalLogs(prev => [...prev, step.log])
        if (index === steps.length - 1) {
          setTimeout(() => {
            setIsAnalyzing(false)
            setShowResult(true)
          }, 500)
        }
      }, (index + 1) * 600)
    })
  }

  return (
    <section id="spec-builder" className="section relative overflow-hidden bg-[#05050A]">
      <div className="absolute inset-0 mesh-bg opacity-20 pointer-events-none" />
      
      <div ref={sectionRef} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 mb-6 shadow-[0_0_30px_rgba(139,92,246,0.15)]">
            <Terminal className="w-8 h-8 text-[#8B5CF6]" />
          </div>
          <h2 className="heading-lg text-white mb-6">
            {language === 'tr' ? (
              <>Projenizi 10 Saniyede <span className="text-[#8B5CF6]">Dokümante Edin</span></>
            ) : language === 'de' ? (
              <>Dokumentieren Sie Ihr Projekt in <span className="text-[#8B5CF6]">10 Sekunden</span></>
            ) : (
              <>Document Your Project in <span className="text-[#8B5CF6]">10 Seconds</span></>
            )}
          </h2>
          <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto leading-relaxed">
            {language === 'tr'
              ? 'Profesyonel bir yazılım süreci, profesyonel bir dokümanla başlar. Fikrinizi yazın, AI destekli Spec-Builder sizin için anında Lastenheft (Gereksinim Belgesi) taslağını oluştursun.'
              : language === 'de'
              ? 'Ein professioneller Softwareprozess beginnt mit einem professionellen Dokument. Schreiben Sie Ihre Idee auf und der KI-gestützte Spec-Builder erstellt sofort ein Lastenheft für Sie.'
              : 'A professional software process starts with a professional document. Write down your idea, and the AI-powered Spec-Builder will instantly generate a Lastenheft (Requirements Spec) draft for you.'}
          </p>
        </div>

        <div className={`max-w-4xl mx-auto transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <GlowCard glowColor="purple" className="p-1 lg:p-1 bg-white/[0.02]">
            <div className="bg-[#0A0A0F] rounded-[1.2rem] border border-white/[0.05] overflow-hidden">
              
              {/* Window Header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.02] border-b border-white/[0.05]">
                <div className="w-3 h-3 rounded-full bg-[#ef4444]/80" />
                <div className="w-3 h-3 rounded-full bg-[#f59e0b]/80" />
                <div className="w-3 h-3 rounded-full bg-[#10B981]/80" />
                <span className="ml-4 text-xs font-mono text-[#64748B]">starwebflow/spec-builder.exe</span>
              </div>

              <div className="p-6 md:p-8">
                {/* Input Area */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-[#E2E8F0] mb-2">
                    {language === 'tr' ? 'Proje Fikrinizi Kısaca Özetleyin' : language === 'de' ? 'Beschreiben Sie kurz Ihre Projektidee' : 'Briefly Summarize Your Project Idea'}
                  </label>
                  <div className="relative">
                    <textarea 
                      value={projectIdea}
                      onChange={(e) => setProjectIdea(e.target.value)}
                      placeholder={language === 'tr' 
                        ? "Örn: Yeni nesil bir e-ticaret platformu kurmak istiyorum. Abonelik modeliyle çalışacak ve AI destekli ürün önerileri sunacak..."
                        : language === 'de'
                        ? "z. B. Ich möchte eine E-Commerce-Plattform der nächsten Generation aufbauen. Sie soll auf einem Abonnementmodell basieren und KI-gestützte Produktempfehlungen bieten..."
                        : "e.g. I want to build a next-gen e-commerce platform. It will run on a subscription model and offer AI-powered product recommendations..."}
                      className="w-full bg-[#1A1A2E] border border-white/[0.1] rounded-xl p-4 text-white placeholder-[#475569] focus:outline-none focus:border-[#8B5CF6] transition-colors resize-none h-28"
                    />
                    <Button 
                      variant="primary" 
                      onClick={handleSimulate}
                      disabled={isAnalyzing || !projectIdea.trim()}
                      className="absolute bottom-4 right-4 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAnalyzing ? (
                        <span className="flex items-center gap-2">
                          {language === 'tr' ? 'Analiz Ediliyor...' : language === 'de' ? 'Analysiere...' : 'Analyzing...'}
                          <span className="animate-spin text-xl leading-none">⟳</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          {language === 'tr' ? 'Taslak Oluştur' : language === 'de' ? 'Entwurf erstellen' : 'Generate Draft'}
                          <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
                        </span>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Loading State & Terminal */}
                {isAnalyzing && (
                  <div className="rounded-xl bg-black border border-white/[0.1] p-4 font-mono text-sm">
                    <div className="flex justify-between items-center mb-4 text-[#64748B] text-xs">
                      <span>TERMINAL_OUTPUT</span>
                      <span>%{progress}</span>
                    </div>
                    <div className="w-full bg-white/[0.05] h-1 rounded-full mb-4 overflow-hidden">
                      <div className="h-full bg-[#8B5CF6] transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="space-y-1 text-[#10B981]">
                      {terminalLogs.map((log, i) => (
                        <div key={i} className="animate-fade-in">&gt; {log}</div>
                      ))}
                      <div className="animate-pulse">&gt; _</div>
                    </div>
                  </div>
                )}

                {/* Result State */}
                {showResult && (
                  <div className="animate-fade-in-up border-t border-white/[0.06] pt-8">
                    <div className="flex items-center gap-3 mb-6">
                      <FileText className="w-6 h-6 text-[#10B981]" />
                      <h3 className="text-xl font-bold text-white font-['Outfit']">
                        {language === 'tr' ? 'Lastenheft Ön İzlemesi' : language === 'de' ? 'Lastenheft-Vorschau' : 'Lastenheft Preview'}
                      </h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-[#1A1A2E]/50 rounded-xl p-5 border border-white/[0.05]">
                        <div className="flex items-center gap-2 mb-3 text-[#4F8EF7]">
                          <CheckCircle2 className="w-4 h-4" />
                          <h4 className="font-semibold text-sm">
                            {language === 'tr' ? 'Proje Kapsamı' : language === 'de' ? 'Projektumfang' : 'Project Scope'}
                          </h4>
                        </div>
                        <p className="text-xs text-[#94A3B8] leading-relaxed">
                          {language === 'tr'
                            ? 'Core özellikler belirlendi. Ölçeklenebilir MVP yapısı ve PWA uyumluluğu eklendi.'
                            : language === 'de'
                            ? 'Kernfunktionen definiert. Skalierbare MVP-Struktur und PWA-Kompatibilität hinzugefügt.'
                            : 'Core features defined. Scalable MVP structure and PWA compliance added.'}
                        </p>
                      </div>

                      <div className="bg-[#1A1A2E]/50 rounded-xl p-5 border border-white/[0.05]">
                        <div className="flex items-center gap-2 mb-3 text-[#8B5CF6]">
                          <Server className="w-4 h-4" />
                          <h4 className="font-semibold text-sm">
                            {language === 'tr' ? 'Teknik Gereksinimler' : language === 'de' ? 'Technische Anforderungen' : 'Technical Requirements'}
                          </h4>
                        </div>
                        <p className="text-xs text-[#94A3B8] leading-relaxed">
                          {language === 'tr'
                            ? 'Frontend: Next.js + React. Backend: Node.js/PostgreSQL. AI Integration via OpenAI API.'
                            : language === 'de'
                            ? 'Frontend: Next.js + React. Backend: Node.js/PostgreSQL. KI-Integration über OpenAI-API.'
                            : 'Frontend: Next.js + React. Backend: Node.js/PostgreSQL. AI Integration via OpenAI API.'}
                        </p>
                      </div>

                      <div className="bg-[#1A1A2E]/50 rounded-xl p-5 border border-white/[0.05]">
                        <div className="flex items-center gap-2 mb-3 text-[#10B981]">
                          <Lock className="w-4 h-4" />
                          <h4 className="font-semibold text-sm">
                            {language === 'tr' ? 'Güvenlik Standartları' : language === 'de' ? 'Sicherheitsstandards' : 'Security Standards'}
                          </h4>
                        </div>
                        <p className="text-xs text-[#94A3B8] leading-relaxed">
                          {language === 'tr'
                            ? 'Bank-Grade Security: AES-256 şifreleme, GDPR/DSGVO tam uyumluluk, EU sunucu lokasyonu.'
                            : language === 'de'
                            ? 'Bankfähige Sicherheit: AES-256-Verschlüsselung, DSGVO-Konformität, EU-Serverstandort.'
                            : 'Bank-Grade Security: AES-256 encryption, GDPR/DSGVO full compliance, EU server location.'}
                        </p>
                      </div>

                      <div className="bg-[#1A1A2E]/50 rounded-xl p-5 border border-white/[0.05]">
                        <div className="flex items-center gap-2 mb-3 text-[#FBBF24]">
                          <Calendar className="w-4 h-4" />
                          <h4 className="font-semibold text-sm">
                            {language === 'tr' ? 'Teslimat Takvimi' : language === 'de' ? 'Lieferplan' : 'Delivery Timeline'}
                          </h4>
                        </div>
                        <p className="text-xs text-[#94A3B8] leading-relaxed">
                          {language === 'tr'
                            ? '4 Haftalık Sprint: Strateji, UI/UX Onayı, Geliştirme, QA Testleri ve Lansman.'
                            : language === 'de'
                            ? '4-Wochen-Sprint: Strategie, UI/UX-Freigabe, Entwicklung, QA-Tests und Launch.'
                            : '4-Week Sprint: Strategy, UI/UX Approval, Development, QA Testing, and Launch.'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-[#8B5CF6]/10 to-transparent border border-[#8B5CF6]/20 flex flex-col sm:flex-row gap-4 items-center justify-between">
                      <span className="text-sm text-[#E2E8F0] text-center sm:text-left">
                        {isDownloaded 
                          ? (language === 'tr' ? 'Gereksinim belgeniz (Lastenheft) başarıyla oluşturuldu ve indirildi!' : language === 'de' ? 'Ihr Lastenheft wurde erfolgreich erstellt und heruntergeladen!' : 'Your requirements specification (Lastenheft) was successfully generated and downloaded!')
                          : (language === 'tr' ? 'Projeniz için hazırlanan detaylı Lastenheft PDF raporunu indirin.' : language === 'de' ? 'Laden Sie den detaillierten Lastenheft-PDF-Bericht für Ihr Projekt herunter.' : 'Download the detailed Lastenheft PDF report prepared for your project.')}
                      </span>
                      <div className="flex gap-2">
                        {isDownloaded ? (
                          <a 
                            href={`/api/v1/pdf/lastenheft?name=${encodeURIComponent(leadData.name)}&email=${encodeURIComponent(leadData.email)}&idea=${encodeURIComponent(projectIdea)}`}
                            download
                            className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 hover:bg-[#10B981]/25 transition-all"
                          >
                            {language === 'tr' ? 'Tekrar İndir' : language === 'de' ? 'Erneut herunterladen' : 'Download Again'}
                          </a>
                        ) : (
                          <Button 
                            variant="primary" 
                            size="sm" 
                            className="text-xs"
                            onClick={() => setIsModalOpen(true)}
                          >
                            {language === 'tr' ? 'Lastenheft PDF İndir' : language === 'de' ? 'Lastenheft PDF herunterladen' : 'Download Lastenheft PDF'}
                          </Button>
                        )}
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => {
                            const el = document.querySelector('#contact')
                            if (el) el.scrollIntoView({ behavior: 'smooth' })
                          }}
                        >
                          {language === 'tr' ? 'Görüşme Planla' : language === 'de' ? 'Gespräch planen' : 'Schedule Meeting'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </GlowCard>
        </div>
      </div>

      <LeadFormModal
        isOpen={isModalOpen}
        title={language === 'tr' ? 'Lastenheft PDF Raporunu İndir' : language === 'de' ? 'Lastenheft PDF herunterladen' : 'Download Lastenheft PDF'}
        subtitle={language === 'tr' 
          ? 'Oluşturulan gereksinim belgesi PDF kopyasını indirmek ve projenizi kaydetmek için bilgilerinizi doğrulayın.'
          : language === 'de'
          ? 'Bestätigen Sie Ihre Angaben, um die PDF-Kopie des erstellten Lastenhefts herunterzuladen und Ihr Projekt zu speichern.'
          : 'Verify your details to download the PDF copy of the generated Lastenheft and save your project.'}
        source="Spec Builder Simulation"
        onSubmitSuccess={handleLeadSubmitSuccess}
      />
    </section>
  )
}
