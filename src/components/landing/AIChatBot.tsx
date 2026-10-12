'use client'

import { useState, useRef, useEffect } from 'react'
import { Bot, X, Send, Sparkles, ChevronDown } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { LanguageType } from '@/lib/i18n/dictionaries'

interface Message {
  role: 'bot' | 'user'
  text: string
  options?: string[]
}

interface FlowData {
  flow: Record<string, { text: string; options?: string[] }>
  teaserTitle: string
  teaserSub: string
  ariaLabel: string
  onlineStatus: string
  placeholder: string
  footerNote: string
  scheduleKeywords: string[]
}

const FLOW_CONFIG: Record<LanguageType, FlowData> = {
  de: {
    teaserTitle: 'Welche Leistung benötigen Sie?',
    teaserSub: 'Unser KI-Assistent hilft Ihnen gerne 👋',
    ariaLabel: 'KI-Assistent',
    onlineStatus: 'Online • Antwortet sofort',
    placeholder: 'Ihre Nachricht eingeben...',
    footerNote: 'StarWebFlow KI • Sofortige Antwort',
    scheduleKeywords: ['Strategiegespräch vereinbaren', 'Kostenlose Beratung'],
    flow: {
      start: {
        text: 'Hallo! 👋 Ich bin der KI-Assistent von StarWebFlow.\n\nWie kann ich Ihnen helfen? In welchem Bereich suchen Sie Unterstützung?',
        options: ['Web- & App-Entwicklung', 'KI-Automatisierung', 'KI-Agenten-Setup', 'Performance Marketing'],
      },
      'Web- & App-Entwicklung': {
        text: 'Hervorragende Wahl! Im Bereich Web & App bieten wir:\n\n• Next.js / React Native Entwicklung (<0,8s LCP)\n• UI/UX Design\n• SEO & Core Web Vitals\n• B2B SaaS & Plattformen\n\nWelches Budget planen Sie ungefähr ein?',
        options: ['Unter 5.000 €', '5.000 € - 15.000 €', 'Über 15.000 €', 'Individuelles Angebot'],
      },
      'KI-Automatisierung': {
        text: 'Ausgezeichnet! Durch kognitive n8n-Workflows reduzieren Unternehmen ihre Betriebskosten um durchschnittlich 40 %.\n\nWelchen Bereich möchten Sie automatisieren?',
        options: ['CRM & Kundenbetreuung', 'Rechnungs- & Finanzwesen', 'E-Mail & Lead-Erfassung', 'Gesamtes Potenzial prüfen'],
      },
      'KI-Agenten-Setup': {
        text: '24/7 aktive digitale Mitarbeiter! 🤖\n\nUnsere KI-Agenten automatisieren Kundenservice, Vertrieb und Termine zu 100 % DSGVO-konform.\n\nWie viele Agenten benötigen Sie?',
        options: ['1 Agent (Starter)', '2-3 Agenten (Growth)', '5+ Agenten (Enterprise)', 'Gemeinsam planen'],
      },
      'Performance Marketing': {
        text: 'Mit KI-gestütztem Kampagnenmanagement steigern unsere Kunden ihr qualifiziertes Lead-Volumen um das Dreifache! 📈\n\nAuf welchen Kanälen werben Sie?',
        options: ['Google Ads', 'Meta (FB/IG)', 'Beide Kanäle', 'TikTok & LinkedIn'],
      },
      default: {
        text: '✅ Vielen Dank! Unser Expertenteam wird sich innerhalb von 24 Stunden bei Ihnen melden.\n\nKlicken Sie unten, um direkt ein kostenloses Strategiegespräch zu vereinbaren. 🚀',
        options: ['Strategiegespräch vereinbaren'],
      },
    }
  },
  en: {
    teaserTitle: 'Which service do you need?',
    teaserSub: 'Our AI assistant is here to help 👋',
    ariaLabel: 'AI Assistant',
    onlineStatus: 'Online • Responds instantly',
    placeholder: 'Type your message...',
    footerNote: 'StarWebFlow AI • Instant response',
    scheduleKeywords: ['Schedule Strategy Call', 'Book Consultation'],
    flow: {
      start: {
        text: 'Hello! 👋 I am StarWebFlow\'s AI assistant.\n\nHow can I help you? In which area are you looking for solutions?',
        options: ['Web & App Development', 'AI Automation', 'AI Agent Setup', 'Performance Marketing'],
      },
      'Web & App Development': {
        text: 'Great choice! In Web & App development we provide:\n\n• Next.js / React Native development (<0.8s LCP)\n• UI/UX Design\n• SEO & Core Web Vitals\n• B2B SaaS Platforms\n\nWhat is your estimated budget range?',
        options: ['Under €5K', '€5K - €15K', 'Over €15K', 'Request custom quote'],
      },
      'AI Automation': {
        text: 'Excellent! With cognitive n8n workflows, companies cut operational costs by an average of 40%.\n\nWhich workflow would you like to automate?',
        options: ['CRM & Customer Tracking', 'Invoicing & Accounting', 'Email & Lead Capture', 'Evaluate entire workflow'],
      },
      'AI Agent Setup': {
        text: '24/7 autonomous digital employees! 🤖\n\nOur AI Agents handle customer service, sales, and booking while staying 100% GDPR compliant.\n\nHow many agents do you need?',
        options: ['1 Agent (Starter)', '2-3 Agents (Growth)', '5+ Agents (Enterprise)', 'Plan together'],
      },
      'Performance Marketing': {
        text: 'With AI-driven ad management, our clients increase lead volume by 3x on average! 📈\n\nWhich platforms are you targeting?',
        options: ['Google Ads', 'Meta (FB/IG)', 'Both channels', 'TikTok & LinkedIn'],
      },
      default: {
        text: '✅ Excellent! Our expert team will get in touch with you within 24 hours.\n\nYou can click below to schedule a free strategy session. 🚀',
        options: ['Schedule Strategy Call'],
      },
    }
  },
  tr: {
    teaserTitle: 'Hangi hizmete ihtiyacınız var?',
    teaserSub: 'AI asistanımız yardımcı olsun 👋',
    ariaLabel: 'AI Asistan',
    onlineStatus: 'Çevrimiçi • Hemen yanıt veriyor',
    placeholder: 'Mesajınızı yazın...',
    footerNote: 'StarWebFlow AI • Anlık yanıt',
    scheduleKeywords: ['Strateji Görüşmesi Planla'],
    flow: {
      start: {
        text: 'Merhaba! 👋 Ben StarWebFlow\'un AI asistanıyım.\n\nSize nasıl yardımcı olabilirim? Hangi alanda destek arıyorsunuz?',
        options: ['Web & Uygulama Geliştirme', 'AI Otomasyon', 'AI Agent Kurulumu', 'Reklam & Sosyal Medya'],
      },
      'Web & Uygulama Geliştirme': {
        text: 'Harika seçim! Web & Uygulama alanında şunları sunuyoruz:\n\n• Next.js / React Native geliştirme\n• UI/UX Tasarım\n• SEO & Core Web Vitals\n• E-ticaret çözümleri\n\nBütçeniz hakkında bilgi verebilir misiniz?',
        options: ['₺10K altı', '₺10K - ₺30K', '₺30K üzeri', 'Teklif almak istiyorum'],
      },
      'AI Otomasyon': {
        text: 'Mükemmel! AI Otomasyon ile şirketler operasyonel maliyetini ortalama %40 azaltıyor.\n\nHangi süreci otomatize etmek istiyorsunuz?',
        options: ['CRM & Müşteri Takibi', 'Fatura & Muhasebe', 'E-posta & Lead', 'Tümünü değerlendirmek istiyorum'],
      },
      'AI Agent Kurulumu': {
        text: '7/24 aktif dijital çalışanlar! 🤖\n\nAI Agentlarımız; müşteri hizmetleri, satış ve destek süreçlerinizi otomatikleştiriyor.\n\nKaç agent\'a ihtiyacınız var?',
        options: ['1 Agent (Starter)', '2-3 Agent (Growth)', '5+ Agent (Enterprise)', 'Birlikte planlayalım'],
      },
      'Reklam & Sosyal Medya': {
        text: 'AI destekli reklam yönetimi ile müşterilerimizin lead hacmi ortalama 3x artıyor! 📈\n\nHangi platformda aktifsiniz?',
        options: ['Google Ads', 'Meta (FB/IG)', 'İkisi birden', 'TikTok & YouTube'],
      },
      default: {
        text: '✅ Mükemmel! Uzman ekibimiz en geç 24 saat içinde sizinle iletişime geçecek.\n\nÜcretsiz strateji görüşmesi için aşağıdaki butona tıklayabilirsiniz. 🚀',
        options: ['Strateji Görüşmesi Planla'],
      },
    }
  }
}

export default function AIChatBot() {
  const { language } = useLanguage()
  const config = FLOW_CONFIG[language] || FLOW_CONFIG.tr
  const currentFlow = config.flow

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [step, setStep] = useState<string>('start')
  const [pulseCount, setPulseCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Sync initial message if language changes and no interaction yet
  useEffect(() => {
    if (messages.length <= 1) {
      const flow = currentFlow.start
      setMessages([{ role: 'bot', text: flow.text, options: flow.options }])
      setStep('start')
    }
  }, [language])

  // Initial greeting after delay
  useEffect(() => {
    if (open && messages.length === 0) {
      setIsTyping(true)
      const timer = setTimeout(() => {
        const flow = currentFlow.start
        setMessages([{ role: 'bot', text: flow.text, options: flow.options }])
        setIsTyping(false)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [open, currentFlow])

  // Pulse notification
  useEffect(() => {
    if (!open && pulseCount < 3) {
      const timer = setTimeout(() => {
        setPulseCount((c) => c + 1)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [open, pulseCount])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const addBotMessage = (key: string) => {
    const flow = currentFlow[key] || currentFlow.default
    setIsTyping(true)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: flow.text, options: flow.options },
      ])
      setIsTyping(false)
      setStep(key in currentFlow ? key : 'done')
    }, 900)
  }

  const handleOption = (option: string) => {
    setMessages((prev) => [...prev, { role: 'user', text: option }])
    if (
      option === 'Strateji Görüşmesi Planla' ||
      option === 'Strategiegespräch vereinbaren' ||
      option === 'Schedule Strategy Call'
    ) {
      document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })
      setOpen(false)
      return
    }
    addBotMessage(option)
  }

  const handleSend = () => {
    if (!input.trim()) return
    const text = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text }])
    addBotMessage('default')
  }

  const lastMsg = messages[messages.length - 1]

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Teaser bubble */}
        {!open && pulseCount < 2 && (
          <div
            className="bg-white border border-purple-200 rounded-2xl px-4 py-2.5 shadow-xl max-w-48 text-right"
            style={{ animation: 'fadeInUp 0.4s ease both' }}
          >
            <p className="text-xs text-slate-900 font-bold">{config.teaserTitle}</p>
            <p className="text-xs text-slate-600 mt-0.5">{config.teaserSub}</p>
          </div>
        )}

        <button
          onClick={() => setOpen((o) => !o)}
          className="relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-xl cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #4F8EF7 100%)',
            boxShadow: '0 8px 30px rgba(124,58,237,0.35)',
          }}
          aria-label={config.ariaLabel}
          id="ai-chat-bot-toggle"
        >
          {open ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <>
              <Bot className="w-6 h-6 text-white" />
              {/* Pulse ring */}
              <span className="absolute inset-0 rounded-2xl bg-purple-400/30 animate-ping" />
            </>
          )}
        </button>
      </div>

      {/* Chat Window */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xl bg-white"
          style={{
            boxShadow: '0 20px 60px rgba(15,23,42,0.15)',
            animation: 'scaleIn 0.25s ease both',
            transformOrigin: 'bottom right',
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-3.5 flex items-center gap-3 border-b border-slate-200 bg-slate-50/90"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-sm"
            >
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">StarFlow AI</span>
                <Sparkles className="w-3 h-3 text-purple-600" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-slate-500 font-medium">{config.onlineStatus}</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="h-72 overflow-y-auto p-4 space-y-3 scrollbar-none bg-slate-50/50" style={{ scrollbarWidth: 'none' }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line shadow-2xs ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-sm font-medium'
                      : 'bg-white text-slate-800 rounded-tl-sm border border-slate-200'
                  }`}
                  style={{ animation: 'fadeInUp 0.3s ease both' }}
                >
                  {msg.text}
                  {/* Option buttons */}
                  {msg.role === 'bot' && msg.options && i === messages.length - 1 && (
                    <div className="mt-3 flex flex-col gap-1.5">
                      {msg.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleOption(opt)}
                          className="text-left text-xs px-3 py-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100/70 hover:text-purple-900 transition-all duration-200 font-semibold cursor-pointer shadow-2xs"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-2xs">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-purple-600"
                        style={{ animation: `orbPulse 1s ease-in-out ${i * 0.15}s infinite` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-200 bg-white">
            <div className="flex gap-2 bg-slate-50 rounded-xl border border-slate-300 p-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={config.placeholder}
                className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none px-1"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-all duration-200 bg-gradient-to-r from-purple-600 to-indigo-600 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
            <p className="text-center text-[10px] text-slate-500 mt-2 font-medium">{config.footerNote}</p>
          </div>
        </div>
      )}
    </>
  )
}
