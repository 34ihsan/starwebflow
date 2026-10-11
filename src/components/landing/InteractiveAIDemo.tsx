'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, Bot, User, CheckCircle2 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

const demoChats = {
  tr: {
    ecommerce: [
      { role: 'user', text: 'Sepette ürün bırakan müşterilere ne yapabiliriz?' },
      { role: 'ai', text: 'Terk edilen sepetleri tarıyorum... 14 potansiyel müşteri bulundu. Hepsine isimleriyle hitap eden ve %10 kişiye özel indirim sunan WhatsApp mesajlarını hazırladım. Gönderilsin mi?' },
      { role: 'user', text: 'Evet, hemen gönder.' },
      { role: 'ai', text: 'Mesajlar saniyeler içinde iletildi. 3 müşteri siparişi tamamladı. Kazanılan ekstra ciro: 12.450 € / TL. (Harcanan zaman: 0 saniye)' }
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
  },
  de: {
    ecommerce: [
      { role: 'user', text: 'Was können wir für Kunden tun, die Produkte im Warenkorb lassen?' },
      { role: 'ai', text: 'Scanne verlassene Warenkörbe... 14 potenzielle Kunden gefunden. WhatsApp-Nachrichten mit persönlicher Anrede und 10% Rabatt vorbereitet. Senden?' },
      { role: 'user', text: 'Ja, sofort senden.' },
      { role: 'ai', text: 'Nachrichten in Sekunden zugestellt. 3 Kunden haben die Bestellung abgeschlossen. Generierter Mehrumsatz: 2.450 €. (Zeitaufwand: 0 Sekunden)' }
    ],
    b2b: [
      { role: 'user', text: 'Gibt es neue B2B-Anfragen von der Website?' },
      { role: 'ai', text: 'Ja, neue Lead von TechCorp. Softwareprojekt mit 100k+ Budget. Anfrage gelesen, zusammengefasst und im HubSpot CRM gespeichert.' },
      { role: 'user', text: 'Großartig, kannst du einen Meeting-Link senden?' },
      { role: 'ai', text: 'Meeting-Einladung gesendet und im Kalender eingetragen. Wettbewerbsanalyse an den Slack-Kanal des Vertriebsteams weitergeleitet.' }
    ],
    clinic: [
      { role: 'user', text: 'Gab es heute Nacht Terminfragen?' },
      { role: 'ai', text: 'Um 02:15 Uhr hat ein Patient bezüglich einer Implantatbehandlung via WhatsApp angefragt. Fragen beantwortet und Termin für Donnerstag 14:00 Uhr gebucht.' },
      { role: 'user', text: 'Super. Erhält der Patient eine Erinnerung?' },
      { role: 'ai', text: 'Automatische Bestätigungsnachricht 24 Stunden vor dem Termin ist geplant. Ihr Assistent muss nichts weiter tun.' }
    ]
  },
  en: {
    ecommerce: [
      { role: 'user', text: 'What can we do for customers who leave items in their cart?' },
      { role: 'ai', text: 'Scanning abandoned carts... 14 potential customers found. Prepared personalized WhatsApp messages offering a 10% discount. Send now?' },
      { role: 'user', text: 'Yes, send immediately.' },
      { role: 'ai', text: 'Messages delivered in seconds. 3 customers completed their order. Extra revenue generated: €2,450. (Time spent: 0 seconds)' }
    ],
    b2b: [
      { role: 'user', text: 'Are there any new B2B inquiries from the website?' },
      { role: 'ai', text: 'Yes, a new lead from TechCorp. A software project with a €100k+ budget. Read the request, summarized it, and saved to HubSpot CRM.' },
      { role: 'user', text: 'Great, can you send them a meeting link?' },
      { role: 'ai', text: 'Meeting invitation sent and scheduled in your calendar. Competitor analysis document forwarded to the sales team Slack channel.' }
    ],
    clinic: [
      { role: 'user', text: 'Were there any appointment requests overnight?' },
      { role: 'ai', text: 'At 2:15 AM a patient reached out via WhatsApp regarding implant treatment. Answered their questions and booked a slot for Thursday at 2 PM.' },
      { role: 'user', text: 'Awesome. Will the patient get a reminder?' },
      { role: 'ai', text: 'Automated WhatsApp confirmation scheduled 24 hours prior to the appointment. Zero manual work left for your team.' }
    ]
  }
}

export default function InteractiveAIDemo() {
  const { language } = useLanguage()
  const [activeSector, setActiveSector] = useState<'ecommerce' | 'b2b' | 'clinic'>('ecommerce')
  const [messages, setMessages] = useState<{role: string, text: string}[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [step, setStep] = useState(0)
  const chatRef = useRef<HTMLDivElement>(null)

  const activeLangChats = demoChats[language] || demoChats.tr

  useEffect(() => {
    setMessages([])
    setStep(0)
    setIsTyping(true)
    
    const timer = setTimeout(() => {
      setIsTyping(false)
      setMessages([activeLangChats[activeSector][0]])
      setStep(1)
    }, 800)

    return () => clearTimeout(timer)
  }, [activeSector, language])

  useEffect(() => {
    if (step > 0 && step < activeLangChats[activeSector].length) {
      setIsTyping(true)
      const currentMsg = activeLangChats[activeSector][step]
      const delay = currentMsg.role === 'ai' ? 1800 : 1200
      
      const timer = setTimeout(() => {
        setIsTyping(false)
        setMessages(prev => [...prev, currentMsg])
        setStep(prev => prev + 1)
      }, delay)

      return () => clearTimeout(timer)
    }
  }, [step, activeSector, language])

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
            <span className="text-sm font-medium">
              {language === 'tr' ? 'Anlatmıyoruz, Gösteriyoruz' : language === 'de' ? 'Wir zeigen es Ihnen live' : 'Show, Don\'t Tell'}
            </span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-white font-['Outfit']"
          >
            {language === 'tr' ? (
              <>Bir Yapay Zeka Ajanı <br/><span className="gradient-text">Nasıl Çalışır?</span></>
            ) : language === 'de' ? (
              <>Wie funktioniert ein <br/><span className="gradient-text">KI-Agent?</span></>
            ) : (
              <>How Does an <br/><span className="gradient-text">AI Agent Work?</span></>
            )}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-400"
          >
            {language === 'tr' 
              ? 'Sektörünüzü seçin ve sistemimizin operasyonel yükünüzü saniyeler içinde nasıl devraldığını canlı izleyin.' 
              : language === 'de' 
              ? 'Wählen Sie Ihre Branche und beobachten Sie live, wie unser System Ihre operative Last übernimmt.' 
              : 'Select your industry and watch live how our system takes over your operational burden.'}
          </motion.p>
        </div>

        <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[750px] sm:h-[650px] md:h-[550px]">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-80 bg-black/40 border-b md:border-b-0 md:border-r border-white/5 p-4 space-y-2 shrink-0">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
              {language === 'tr' ? 'Sektör Seçin' : language === 'de' ? 'Branche wählen' : 'Select Industry'}
            </div>
            {[
              { id: 'ecommerce', label: language === 'tr' ? 'E-Ticaret & Perakende' : language === 'de' ? 'E-Commerce & Einzelhandel' : 'E-Commerce & Retail' },
              { id: 'b2b',       label: language === 'tr' ? 'Kurumsal (B2B)' : language === 'de' ? 'Unternehmen (B2B)' : 'Corporate (B2B)' },
              { id: 'clinic',    label: language === 'tr' ? 'Sağlık & Klinik' : language === 'de' ? 'Gesundheit & Kliniken' : 'Healthcare & Clinics' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSector(tab.id as any)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-300 relative ${
                  activeSector === tab.id
                    ? 'bg-white/10 border-[#8B5CF6] text-white'
                    : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/[0.07] hover:text-gray-300'
                }`}
              >
                <div className="font-semibold text-sm">{tab.label}</div>
                {activeSector === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="flex items-center gap-1 text-xs text-[#10B981] mt-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                    <span>{language === 'tr' ? 'Simülasyon Aktif' : language === 'de' ? 'Simulation Aktiv' : 'Simulation Active'}</span>
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
                  <div className="text-white font-medium">
                    {language === 'tr' ? 'StarWebflow Operasyon Ajanı' : language === 'de' ? 'StarWebFlow Operations-Agent' : 'StarWebFlow Operations Agent'}
                  </div>
                  <div className="text-xs text-[#10B981] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {language === 'tr' ? 'Çevrimiçi & Hazır' : language === 'de' ? 'Online & Bereit' : 'Online & Ready'}
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
                        <span className="text-xs uppercase tracking-wider">
                          {msg.role === 'user' 
                            ? (language === 'tr' ? 'Siz (Patron)' : language === 'de' ? 'Sie (Geschäftsführer)' : 'You (Boss)') 
                            : (language === 'tr' ? 'AI Ajan' : language === 'de' ? 'KI-Agent' : 'AI Agent')}
                        </span>
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
                  placeholder={
                    step >= activeLangChats[activeSector].length && !isTyping 
                      ? (language === 'tr' ? 'Senaryo tamamlandı...' : language === 'de' ? 'Szenario abgeschlossen...' : 'Scenario completed...') 
                      : (language === 'tr' ? 'Ajan işlem yapıyor...' : language === 'de' ? 'Agent verarbeitet...' : 'Agent processing...')
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-gray-400 placeholder:text-gray-600 focus:outline-none text-xs sm:text-sm"
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
