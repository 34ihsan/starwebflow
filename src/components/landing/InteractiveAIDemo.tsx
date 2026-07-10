'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, Bot, User, CheckCircle2 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

const demoChats = {
  ecommerce: [
    { role: 'user', text: 'Sepette ürün bırakan müşterilere ne yapabiliriz?' },
    { role: 'ai', text: 'Terk edilen sepetleri tarıyorum... 14 potansiyel müşteri bulundu. Hepsine isimleriyle hitap eden ve %10 kişiye özel indirim sunan WhatsApp mesajlarını hazırladım. Gönderilsin mi?' },
    { role: 'user', text: 'Evet, hemen gönder.' },
    { role: 'ai', text: 'Mesajlar saniyeler içinde iletildi. 3 müşteri siparişi tamamladı. Kazanılan ekstra ciro: 12.450 TL. (Harcanan zaman: 0 saniye)' }
  ],
  b2b: [
    { role: 'user', text: 'Web sitesinden gelen yeni kurumsal talep var mı?' },
    { role: 'ai', text: 'Evet, TechCorp firmasından yeni bir lead geldi. 100k+ bütçeli bir yazılım projesi. Talebini okudum, özetledim ve HubSpot CRM\'e kaydettim.' },
    { role: 'user', text: 'Harika, ona bir toplantı bağlantısı yollar mısın?' },
    { role: 'ai', text: 'Toplantı daveti gönderildi ve takviminize işlendi. Ayrıca rakip analizi dosyasını satış ekibinizin Slack kanalına ilettim.' }
  ],
  clinic: [
    { role: 'user', text: 'Gece randevu talebi gelmiş mi?' },
    { role: 'ai', text: 'Gece 02:15\'te bir hasta İmplant tedavisi için WhatsApp\'tan ulaştı. Klasik sorularını yanıtladım ve Perşembe 14:00 için randevusunu oluşturup sisteme girdim.' },
    { role: 'user', text: 'Süper. Hastaya hatırlatma gidecek mi?' },
    { role: 'ai', text: 'Randevudan 24 saat önce otomatik onay WhatsApp mesajı planlandı. Asistanınızın yapması gereken hiçbir şey kalmadı.' }
  ]
}

export default function InteractiveAIDemo() {
  const [activeSector, setActiveSector] = useState<'ecommerce' | 'b2b' | 'clinic'>('ecommerce')
  const [messages, setMessages] = useState<{role: string, text: string}[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [step, setStep] = useState(0)
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages([])
    setStep(0)
    setIsTyping(true)
    
    const timer = setTimeout(() => {
      setIsTyping(false)
      setMessages([demoChats[activeSector][0]])
      setStep(1)
    }, 800)

    return () => clearTimeout(timer)
  }, [activeSector])

  useEffect(() => {
    if (step > 0 && step < demoChats[activeSector].length) {
      setIsTyping(true)
      const currentMsg = demoChats[activeSector][step]
      // AI messages take a bit longer to simulate thinking
      const delay = currentMsg.role === 'ai' ? 1800 : 1200
      
      const timer = setTimeout(() => {
        setIsTyping(false)
        setMessages(prev => [...prev, currentMsg])
        setStep(prev => prev + 1)
      }, delay)

      return () => clearTimeout(timer)
    }
  }, [step, activeSector])

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages, isTyping])

  return (
    <section className="py-24 bg-[#050508] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#8B5CF6]/10 via-transparent to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-[#10B981]/30 mb-6 text-[#10B981]"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Anlatmıyoruz, Gösteriyoruz</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-white"
          >
            Bir Yapay Zeka Ajanı <br/>Nasıl Çalışır?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-400"
          >
            Sektörünüzü seçin ve sistemimizin operasyonel yükünüzü saniyeler içinde nasıl devraldığını canlı izleyin.
          </motion.p>
        </div>

        <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[750px] sm:h-[650px] md:h-[550px]">
          {/* Sidebar */}
          <div className="md:w-1/3 bg-black/40 border-b md:border-b-0 md:border-r border-white/5 p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 shrink-0 z-10">
            <h3 className="text-white font-semibold mb-1 sm:mb-2">Sektör Seçin</h3>
            {[
              { id: 'ecommerce', label: 'E-Ticaret & Perakende' },
              { id: 'b2b', label: 'Kurumsal (B2B)' },
              { id: 'clinic', label: 'Sağlık & Klinik' }
            ].map(sector => (
              <button
                key={sector.id}
                onClick={() => setActiveSector(sector.id as any)}
                className={`p-3 sm:p-4 rounded-xl text-left transition-all ${
                  activeSector === sector.id 
                    ? 'bg-[#8B5CF6]/20 border border-[#8B5CF6]/50 text-white' 
                    : 'bg-white/5 border border-transparent text-gray-400 hover:bg-white/10'
                }`}
              >
                <div className="font-medium">{sector.label}</div>
                {activeSector === sector.id && (
                  <motion.div layoutId="active-indicator" className="mt-2 text-xs text-[#8B5CF6] flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8B5CF6] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8B5CF6]"></span>
                    </span>
                    Simülasyon Aktif
                  </motion.div>
                )}
              </button>
            ))}
          </div>

          {/* Chat Area */}
          <div className="flex-1 min-h-0 flex flex-col bg-[#0A0A0F]/80">
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#D946EF] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-medium">StarWebflow Operasyon Ajanı</div>
                  <div className="text-xs text-[#10B981] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Çevrimiçi & Hazır
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div ref={chatRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 scroll-smooth scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] rounded-2xl p-4 ${
                      msg.role === 'user' 
                        ? 'bg-white/10 text-white border border-white/10 rounded-tr-sm' 
                        : 'bg-gradient-to-r from-[#8B5CF6]/20 to-transparent text-gray-200 border border-[#8B5CF6]/30 rounded-tl-sm'
                    }`}>
                      <div className="flex items-center gap-2 mb-2 opacity-50">
                        {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                        <span className="text-xs uppercase tracking-wider">{msg.role === 'user' ? 'Siz (Patron)' : 'AI Ajan'}</span>
                      </div>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                  </motion.div>
                ))}
                
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 rounded-2xl p-4 rounded-tl-sm flex gap-1 items-center">
                      <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input (Decorative) */}
            <div className="p-4 border-t border-white/5 bg-black/20 shrink-0">
              <div className="relative">
                <input 
                  type="text" 
                  disabled
                  placeholder={step >= demoChats[activeSector].length && !isTyping ? "Senaryo tamamlandı..." : "Ajan işlem yapıyor..."}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-gray-400 placeholder:text-gray-600 focus:outline-none"
                />
                <button disabled className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/5 rounded-lg text-gray-500">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
