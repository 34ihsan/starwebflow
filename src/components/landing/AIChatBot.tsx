'use client'

import { useState, useRef, useEffect } from 'react'
import { Bot, X, Send, Sparkles, ChevronDown } from 'lucide-react'

interface Message {
  role: 'bot' | 'user'
  text: string
  options?: string[]
}

const FLOW: Record<string, { text: string; options?: string[] }> = {
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

export default function AIChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [step, setStep] = useState<string>('start')
  const [pulseCount, setPulseCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initial greeting after delay
  useEffect(() => {
    if (open && messages.length === 0) {
      setIsTyping(true)
      const timer = setTimeout(() => {
        const flow = FLOW.start
        setMessages([{ role: 'bot', text: flow.text, options: flow.options }])
        setIsTyping(false)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [open])

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
    const flow = FLOW[key] || FLOW.default
    setIsTyping(true)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: flow.text, options: flow.options },
      ])
      setIsTyping(false)
      setStep(key in FLOW ? key : 'done')
    }, 900)
  }

  const handleOption = (option: string) => {
    setMessages((prev) => [...prev, { role: 'user', text: option }])
    if (option === 'Strateji Görüşmesi Planla') {
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
            className="bg-[#0F0F1A] border border-[#4F8EF7]/30 rounded-2xl px-4 py-2.5 shadow-lg max-w-48 text-right"
            style={{ animation: 'fadeInUp 0.4s ease both' }}
          >
            <p className="text-xs text-white font-medium">Hangi hizmete ihtiyacınız var?</p>
            <p className="text-xs text-[#94A3B8] mt-0.5">AI asistanımız yardımcı olsun 👋</p>
          </div>
        )}

        <button
          onClick={() => setOpen((o) => !o)}
          className="relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #4F8EF7 0%, #8B5CF6 100%)',
            boxShadow: '0 0 30px rgba(79,142,247,0.5), 0 8px 25px rgba(0,0,0,0.4)',
          }}
          aria-label="AI Asistan"
          id="ai-chat-bot-toggle"
        >
          {open ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <>
              <Bot className="w-6 h-6 text-white" />
              {/* Pulse ring */}
              <span className="absolute inset-0 rounded-2xl bg-[#4F8EF7]/30 animate-ping" />
            </>
          )}
        </button>
      </div>

      {/* Chat Window */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl"
          style={{
            background: '#0F0F1A',
            boxShadow: '0 0 60px rgba(79,142,247,0.15), 0 25px 50px rgba(0,0,0,0.6)',
            animation: 'scaleIn 0.25s ease both',
            transformOrigin: 'bottom right',
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-3.5 flex items-center gap-3 border-b border-white/[0.06]"
            style={{ background: 'linear-gradient(135deg, rgba(79,142,247,0.12) 0%, rgba(139,92,246,0.08) 100%)' }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #4F8EF7, #8B5CF6)' }}
            >
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">StarFlow AI</span>
                <Sparkles className="w-3 h-3 text-[#4F8EF7]" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-xs text-[#64748B]">Çevrimiçi • Hemen yanıt veriyor</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="h-72 overflow-y-auto p-4 space-y-3 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-[#4F8EF7] text-white rounded-tr-sm'
                      : 'bg-[#1A1A2E] text-[#E2E8F0] rounded-tl-sm border border-white/[0.06]'
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
                          className="text-left text-xs px-3 py-2 rounded-xl bg-[#4F8EF7]/10 border border-[#4F8EF7]/25 text-[#93BBFD] hover:bg-[#4F8EF7]/20 hover:text-white transition-all duration-200 font-medium"
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
                <div className="bg-[#1A1A2E] border border-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-[#4F8EF7]"
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
          <div className="p-3 border-t border-white/[0.06]">
            <div className="flex gap-2 bg-[#1A1A2E] rounded-xl border border-white/[0.06] p-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Mesajınızı yazın..."
                className="flex-1 bg-transparent text-sm text-white placeholder-[#475569] outline-none px-1"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-all duration-200"
                style={{ background: 'linear-gradient(135deg, #4F8EF7, #8B5CF6)' }}
              >
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
            <p className="text-center text-[10px] text-[#475569] mt-2">StarWebFlow AI • Anlık yanıt</p>
          </div>
        </div>
      )}
    </>
  )
}
