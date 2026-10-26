'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, Bot, User, CheckCircle2, Workflow, Clock, ArrowRight, Cpu } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import type { SandboxNode } from '@/app/api/v1/ai/automation-sandbox/route'

interface DemoMessage {
  role: 'user' | 'ai'
  text: string
  nodes?: SandboxNode[]
  savedHours?: number
  modelUsed?: string
}

const demoChats: Record<string, Record<'ecommerce' | 'b2b' | 'clinic', DemoMessage[]>> = {
  tr: {
    ecommerce: [
      { role: 'user', text: 'Sepette ürün bırakan müşterilere ne yapabiliriz?' },
      { role: 'ai', text: 'Terk edilen sepetleri tarıyorum... 14 potansiyel müşteri bulundu. Hepsine isimleriyle hitap eden ve %10 kişiye özel indirim sunan WhatsApp mesajlarını hazırladım. Gönderilsin mi?' },
      { role: 'user', text: 'Evet, hemen gönder.' },
      {
        role: 'ai',
        text: 'Mesajlar saniyeler içinde iletildi. 3 müşteri siparişi tamamladı. Kazanılan ekstra ciro: 12.450 € / TL. (Harcanan zaman: 0 saniye)',
        savedHours: 95,
        modelUsed: 'starwebflow-automation:latest',
        nodes: [
          { id: 'n1', type: 'trigger', app: 'Shopify / Woo', label: 'Terk Edilen Sepet' },
          { id: 'n2', type: 'action', app: 'Star AI', label: 'Kişisel İndirim & Metin' },
          { id: 'n3', type: 'action', app: 'WhatsApp API', label: 'Otomatik Mesaj İletimi' },
          { id: 'n4', type: 'action', app: 'Stripe / CRM', label: 'Sipariş & Ciro Kaydı' }
        ]
      }
    ],
    b2b: [
      { role: 'user', text: 'Web sitesinden gelen yeni kurumsal talep var mı?' },
      { role: 'ai', text: 'Evet, TechCorp firmasından yeni bir lead geldi. 100k+ bütçeli bir yazılım projesi. Talebini okudum, özetledim ve HubSpot CRM\'e kaydettim.' },
      { role: 'user', text: 'Harika, ona bir toplantı bağlantısı yollar mısın?' },
      {
        role: 'ai',
        text: 'Toplantı daveti gönderildi ve takviminize işlendi. Ayrıca rakip analizi dosyasını satış ekibinizin Slack kanalına ilettim.',
        savedHours: 140,
        modelUsed: 'starwebflow-automation:latest',
        nodes: [
          { id: 'n1', type: 'trigger', app: 'Web Form', label: 'Yeni Kurumsal Lead' },
          { id: 'n2', type: 'action', app: 'Star AI', label: 'Bütçe & Niyet Skorlama' },
          { id: 'n3', type: 'action', app: 'HubSpot CRM', label: 'Fırsat & Takvim Kaydı' },
          { id: 'n4', type: 'action', app: 'Slack', label: 'Satış Ekibi Bildirimi' }
        ]
      }
    ],
    clinic: [
      { role: 'user', text: 'Gece randevu talebi gelmiş mi?' },
      { role: 'ai', text: 'Gece 02:15\'te bir hasta İmplant tedavisi için WhatsApp\'tan ulaştı. Klasik sorularını yanıtladım ve Perşembe 14:00 için randevusunu oluşturup sisteme girdim.' },
      { role: 'user', text: 'Süper. Hastaya hatırlatma gidecek mi?' },
      {
        role: 'ai',
        text: 'Randevudan 24 saat önce otomatik onay WhatsApp mesajı planlandı. Asistanınızın yapması gereken hiçbir şey kalmadı.',
        savedHours: 120,
        modelUsed: 'starwebflow-automation:latest',
        nodes: [
          { id: 'n1', type: 'trigger', app: 'WhatsApp 7/24', label: 'Gece 02:15 Hasta Mesajı' },
          { id: 'n2', type: 'action', app: 'Star AI', label: 'Tedavi Triyaj & Yanıt' },
          { id: 'n3', type: 'action', app: 'Klinik Takvim', label: 'Perşembe 14:00 Kaydı' },
          { id: 'n4', type: 'action', app: 'WhatsApp', label: '24s Önce Hatırlatma' }
        ]
      }
    ]
  },
  de: {
    ecommerce: [
      { role: 'user', text: 'Was können wir für Kunden tun, die Produkte im Warenkorb lassen?' },
      { role: 'ai', text: 'Scanne verlassene Warenkörbe... 14 potenzielle Kunden gefunden. WhatsApp-Nachrichten mit persönlicher Anrede und 10% Rabatt vorbereitet. Senden?' },
      { role: 'user', text: 'Ja, sofort senden.' },
      {
        role: 'ai',
        text: 'Nachrichten in Sekunden zugestellt. 3 Kunden haben die Bestellung abgeschlossen. Generierter Mehrumsatz: 2.450 €. (Zeitaufwand: 0 Sekunden)',
        savedHours: 95,
        modelUsed: 'starwebflow-automation:latest',
        nodes: [
          { id: 'n1', type: 'trigger', app: 'Shop-System', label: 'Warenkorb-Abbruch' },
          { id: 'n2', type: 'action', app: 'Star AI', label: '10% Gutschein & Text' },
          { id: 'n3', type: 'action', app: 'WhatsApp API', label: 'Sofort-Nachricht' },
          { id: 'n4', type: 'action', app: 'Stripe / CRM', label: 'Bestellung & Umsatz' }
        ]
      }
    ],
    b2b: [
      { role: 'user', text: 'Gibt es neue B2B-Anfragen von der Website?' },
      { role: 'ai', text: 'Ja, neuer Lead von TechCorp. Softwareprojekt mit 100k+ Budget. Anfrage gelesen, zusammengefasst und im HubSpot CRM gespeichert.' },
      { role: 'user', text: 'Großartig, kannst du einen Meeting-Link senden?' },
      {
        role: 'ai',
        text: 'Meeting-Einladung gesendet und im Kalender eingetragen. Wettbewerbsanalyse an den Slack-Kanal des Vertriebsteams weitergeleitet.',
        savedHours: 140,
        modelUsed: 'starwebflow-automation:latest',
        nodes: [
          { id: 'n1', type: 'trigger', app: 'Web-Formular', label: 'Neuer B2B-Lead' },
          { id: 'n2', type: 'action', app: 'Star AI', label: 'Lead-Scoring & Analyse' },
          { id: 'n3', type: 'action', app: 'HubSpot CRM', label: 'Deal & Kalender-Sync' },
          { id: 'n4', type: 'action', app: 'Slack', label: 'Vertriebs-Briefing' }
        ]
      }
    ],
    clinic: [
      { role: 'user', text: 'Gab es heute Nacht Terminfragen?' },
      { role: 'ai', text: 'Um 02:15 Uhr hat ein Patient bezüglich einer Implantatbehandlung via WhatsApp angefragt. Fragen beantwortet und Termin für Donnerstag 14:00 Uhr gebucht.' },
      { role: 'user', text: 'Super. Erhält der Patient eine Erinnerung?' },
      {
        role: 'ai',
        text: 'Automatische Bestätigungsnachricht 24 Stunden vor dem Termin ist geplant. Ihr Assistent muss nichts weiter tun.',
        savedHours: 120,
        modelUsed: 'starwebflow-automation:latest',
        nodes: [
          { id: 'n1', type: 'trigger', app: 'WhatsApp 24/7', label: 'Patienten-Anfrage 02:15' },
          { id: 'n2', type: 'action', app: 'Star AI', label: 'KI-Triage & Beratung' },
          { id: 'n3', type: 'action', app: 'Praxis-Kalender', label: 'Termin Do. 14:00 Uhr' },
          { id: 'n4', type: 'action', app: 'WhatsApp', label: '24h Termin-Erinnerung' }
        ]
      }
    ]
  },
  en: {
    ecommerce: [
      { role: 'user', text: 'What can we do for customers who leave items in their cart?' },
      { role: 'ai', text: 'Scanning abandoned carts... 14 potential customers found. Prepared personalized WhatsApp messages offering a 10% discount. Send now?' },
      { role: 'user', text: 'Yes, send immediately.' },
      {
        role: 'ai',
        text: 'Messages delivered in seconds. 3 customers completed their order. Extra revenue generated: €2,450. (Time spent: 0 seconds)',
        savedHours: 95,
        modelUsed: 'starwebflow-automation:latest',
        nodes: [
          { id: 'n1', type: 'trigger', app: 'Storefront', label: 'Abandoned Cart' },
          { id: 'n2', type: 'action', app: 'Star AI', label: '10% Offer Personalizer' },
          { id: 'n3', type: 'action', app: 'WhatsApp API', label: 'Instant Recovery Msg' },
          { id: 'n4', type: 'action', app: 'Stripe / CRM', label: 'Order & Revenue Sync' }
        ]
      }
    ],
    b2b: [
      { role: 'user', text: 'Are there any new B2B inquiries from the website?' },
      { role: 'ai', text: 'Yes, a new lead from TechCorp. A software project with a €100k+ budget. Read the request, summarized it, and saved to HubSpot CRM.' },
      { role: 'user', text: 'Great, can you send them a meeting link?' },
      {
        role: 'ai',
        text: 'Meeting invitation sent and scheduled in your calendar. Competitor analysis document forwarded to the sales team Slack channel.',
        savedHours: 140,
        modelUsed: 'starwebflow-automation:latest',
        nodes: [
          { id: 'n1', type: 'trigger', app: 'Web Form', label: 'New Enterprise Lead' },
          { id: 'n2', type: 'action', app: 'Star AI', label: 'Lead Scoring & Brief' },
          { id: 'n3', type: 'action', app: 'HubSpot CRM', label: 'Deal & Calendar Sync' },
          { id: 'n4', type: 'action', app: 'Slack', label: 'Sales Team Alert' }
        ]
      }
    ],
    clinic: [
      { role: 'user', text: 'Were there any appointment requests overnight?' },
      { role: 'ai', text: 'At 2:15 AM a patient reached out via WhatsApp regarding implant treatment. Answered their questions and booked a slot for Thursday at 2 PM.' },
      { role: 'user', text: 'Awesome. Will the patient get a reminder?' },
      {
        role: 'ai',
        text: 'Automated WhatsApp confirmation scheduled 24 hours prior to the appointment. Zero manual work left for your team.',
        savedHours: 120,
        modelUsed: 'starwebflow-automation:latest',
        nodes: [
          { id: 'n1', type: 'trigger', app: 'WhatsApp 24/7', label: '2:15 AM Patient Msg' },
          { id: 'n2', type: 'action', app: 'Star AI', label: 'AI Triage & Q&A' },
          { id: 'n3', type: 'action', app: 'Clinic Calendar', label: 'Book Thu 2:00 PM' },
          { id: 'n4', type: 'action', app: 'WhatsApp', label: '24h Auto-Reminder' }
        ]
      }
    ]
  }
}

const quickPrompts: Record<string, string[]> = {
  tr: [
    '⚡ E-postayla gelen PDF faturaları okuyup muhasebeye işle',
    '💬 Instagram & WhatsApp fiyat sorularını 7/24 yanıtla ve CRM\'e kaydet',
    '🎯 Google Maps\'ten potansiyel müşterileri bulup kişiye özel teklif hazırla'
  ],
  de: [
    '⚡ Eingehende PDF-Rechnungen per KI auslesen & ins ERP buchen',
    '💬 Instagram & WhatsApp Preisanfragen 24/7 beantworten & im CRM speichern',
    '🎯 B2B-Leads auf Google Maps finden & individuelles Angebot erstellen'
  ],
  en: [
    '⚡ Extract incoming PDF invoices via AI & sync to ERP',
    '💬 Reply to Instagram & WhatsApp price inquiries 24/7 & save to CRM',
    '🎯 Find B2B leads on Google Maps & generate custom proposals'
  ]
}

export default function InteractiveAIDemo() {
  const { language } = useLanguage()
  const [activeSector, setActiveSector] = useState<'ecommerce' | 'b2b' | 'clinic'>('ecommerce')
  const [messages, setMessages] = useState<DemoMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [step, setStep] = useState(0)
  const [customInput, setCustomInput] = useState('')
  const [customLoading, setCustomLoading] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)

  const activeLangChats = demoChats[language] || demoChats.tr
  const activePrompts = quickPrompts[language] || quickPrompts.tr

  useEffect(() => {
    setMessages([])
    setStep(0)
    setIsTyping(true)

    const timer = setTimeout(() => {
      setIsTyping(false)
      setMessages([activeLangChats[activeSector][0]])
      setStep(1)
    }, 650)

    return () => clearTimeout(timer)
  }, [activeSector, language])

  useEffect(() => {
    if (step > 0 && step < activeLangChats[activeSector].length) {
      setIsTyping(true)
      const currentMsg = activeLangChats[activeSector][step]
      const delay = currentMsg.role === 'ai' ? 1400 : 1000

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
  }, [messages, isTyping, customLoading])

  const handleSendCustomScenario = async (overrideQuery?: string) => {
    const queryText = (overrideQuery ?? customInput).trim()
    if (!queryText || customLoading) return
    if (!overrideQuery) setCustomInput('')

    // Stop preset replay if still running
    setStep(99)
    setIsTyping(false)

    setMessages(prev => [...prev, { role: 'user', text: queryText }])
    setCustomLoading(true)

    try {
      const res = await fetch('/api/v1/ai/automation-sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          sector: activeSector,
          language
        })
      })
      const json = await res.json()
      if (json.success && json.data) {
        setMessages(prev => [
          ...prev,
          {
            role: 'ai',
            text: json.data.reply,
            nodes: json.data.nodes,
            savedHours: json.data.estimatedSavedHoursPerMonth,
            modelUsed: json.data.modelUsed
          }
        ])
      }
    } catch (e) {
      console.error('Sandbox error:', e)
    } finally {
      setCustomLoading(false)
    }
  }

  return (
    <section className="py-24 bg-slate-50/40 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-100/40 via-transparent to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 mb-6 text-emerald-700 shadow-2xs"
          >
            <Cpu className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold">
              {language === 'tr'
                ? 'Canlı AI & n8n Otomasyon Sandbox • starwebflow-automation:latest'
                : language === 'de'
                ? 'Live KI & n8n Automation Sandbox • starwebflow-automation:latest'
                : 'Live AI & n8n Automation Sandbox • starwebflow-automation:latest'}
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-slate-900 font-['Outfit']"
          >
            {language === 'tr' ? (
              <>Kendi İş Senaryonuzu Yazın, <br/><span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Otonom İş Akışınızı Canlı Görün</span></>
            ) : language === 'de' ? (
              <>Schreiben Sie Ihr Szenario, <br/><span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Erleben Sie den KI-Workflow Live</span></>
            ) : (
              <>Type Your Business Scenario, <br/><span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Watch the Autonomous Workflow Live</span></>
            )}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 font-normal"
          >
            {language === 'tr'
              ? 'Sektörünüzü seçin veya alttaki kutuya kendi operasyonel sorununuzu yazın; Star AI anında 4 adımlı otomasyon mimarinizi oluştursun.'
              : language === 'de'
              ? 'Wählen Sie Ihre Branche oder geben Sie unten Ihre eigene Aufgabe ein – Star AI entwirft sofort Ihre 4-stufige Automatisierungs-Pipeline.'
              : 'Select your industry or type your own operational challenge below — Star AI will instantly build your 4-step automation pipeline.'}
          </motion.p>
        </div>

        <div className="max-w-5xl mx-auto bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl flex flex-col md:flex-row h-[780px] sm:h-[700px] md:h-[620px]">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-80 bg-slate-50/80 border-b md:border-b-0 md:border-r border-slate-200 p-4 flex flex-col justify-between shrink-0">
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">
                {language === 'tr' ? 'Hazır Sektör Simülasyonları' : language === 'de' ? 'Branchen-Simulationen' : 'Industry Simulations'}
              </div>
              {[
                { id: 'ecommerce', label: language === 'tr' ? '🛒 E-Ticaret & Perakende' : language === 'de' ? '🛒 E-Commerce & Handel' : '🛒 E-Commerce & Retail' },
                { id: 'b2b',       label: language === 'tr' ? '🏢 Kurumsal (B2B Satış)' : language === 'de' ? '🏢 Unternehmen (B2B)' : '🏢 Corporate (B2B Sales)' },
                { id: 'clinic',    label: language === 'tr' ? '🦷 Sağlık & Diş Kliniği' : language === 'de' ? '🦷 Gesundheit & Kliniken' : '🦷 Healthcare & Clinics' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSector(tab.id as any)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all duration-300 relative cursor-pointer ${
                    activeSector === tab.id
                      ? 'bg-white border-purple-500 text-slate-900 shadow-xs font-semibold'
                      : 'bg-transparent border-transparent text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                  }`}
                >
                  <div className="text-sm font-bold">{tab.label}</div>
                  {activeSector === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium mt-1"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      <span>{language === 'tr' ? 'Canlı Senaryo Aktif' : language === 'de' ? 'Live-Szenario Aktiv' : 'Live Scenario Active'}</span>
                    </motion.div>
                  )}
                </button>
              ))}
            </div>

            {/* Quick Live Sandbox Prompts */}
            <div className="mt-4 pt-4 border-t border-slate-200 hidden md:block">
              <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === 'tr' ? 'Tek Tıkla Canlı AI Testi' : language === 'de' ? '1-Klick Live-KI-Test' : '1-Click Live AI Test'}</span>
              </div>
              <div className="space-y-1.5">
                {activePrompts.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    disabled={customLoading}
                    onClick={() => handleSendCustomScenario(p)}
                    className="w-full text-left text-xs bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 hover:border-purple-300 rounded-lg p-2.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chat & Live Workflow Area */}
          <div className="flex-1 min-h-0 flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-xs">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-slate-900 font-bold text-sm flex items-center gap-2">
                    <span>{language === 'tr' ? 'StarWebflow Titan Otomasyon Mimarı' : language === 'de' ? 'StarWebFlow Titan Automation-Architekt' : 'StarWebFlow Titan Automation Architect'}</span>
                    <span className="hidden sm:inline-flex text-[10px] font-mono bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                      starwebflow-automation:latest
                    </span>
                  </div>
                  <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {language === 'tr' ? 'Canlı Sandbox Aktif — Kendi Senaryonuzu Yazabilirsiniz' : language === 'de' ? 'Live-Sandbox Aktiv — Eigenes Szenario eingeben' : 'Live Sandbox Active — Type Your Own Scenario'}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div ref={chatRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 scroll-smooth scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-4 shadow-2xs ${
                      msg.role === 'user'
                        ? 'bg-slate-900 text-white border border-slate-800 rounded-tr-sm'
                        : 'bg-purple-50/80 text-slate-900 border border-purple-200/90 rounded-tl-sm'
                    }`}>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          {msg.role === 'user' ? <User className="w-3.5 h-3.5 text-purple-300" /> : <Bot className="w-3.5 h-3.5 text-purple-600" />}
                          <span className={`text-[11px] font-bold uppercase tracking-wider ${msg.role === 'user' ? 'text-slate-300' : 'text-purple-700'}`}>
                            {msg.role === 'user'
                              ? (language === 'tr' ? 'Siz (Yönetici)' : language === 'de' ? 'Sie (Geschäftsführer)' : 'You (Executive)')
                              : (language === 'tr' ? 'Star AI Otomasyon Motoru' : language === 'de' ? 'Star KI-Automations-Engine' : 'Star AI Automation Engine')}
                          </span>
                        </div>
                        {msg.savedHours && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" />
                            {language === 'tr'
                              ? `Ayda ~${msg.savedHours} Saat Tasarruf`
                              : language === 'de'
                              ? `~${msg.savedHours} Std./Monat gespart`
                              : `~${msg.savedHours} hrs/mo saved`}
                          </span>
                        )}
                      </div>

                      <p className={`text-sm leading-relaxed font-normal ${msg.role === 'user' ? 'text-slate-100' : 'text-slate-800'}`}>
                        {msg.text}
                      </p>

                      {/* Live 4-Node Titan Mode Workflow Pipeline */}
                      {msg.nodes && msg.nodes.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-purple-200/80">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800 flex items-center gap-1">
                              <Workflow className="w-3.5 h-3.5 text-purple-600" />
                              {language === 'tr' ? 'Canlı Titan Mode Otomasyon Düğümleri' : language === 'de' ? 'Live Titan-Mode Workflow-Knoten' : 'Live Titan Mode Workflow Nodes'}
                            </span>
                            {msg.modelUsed && (
                              <span className="text-[10px] font-mono text-slate-500">{msg.modelUsed}</span>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                            {msg.nodes.map((node, nIdx) => (
                              <div
                                key={node.id || nIdx}
                                className="relative bg-white border border-purple-200 rounded-xl p-2.5 shadow-2xs flex flex-col justify-between"
                              >
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                                    node.type === 'trigger'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-indigo-100 text-indigo-800'
                                  }`}>
                                    {node.id} • {node.type}
                                  </span>
                                  {nIdx < msg.nodes!.length - 1 && (
                                    <ArrowRight className="w-3 h-3 text-purple-400 hidden sm:block" />
                                  )}
                                </div>
                                <div className="text-[11px] font-bold text-slate-900 truncate">{node.app}</div>
                                <div className="text-[11px] text-slate-600 leading-tight mt-0.5">{node.label}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {(isTyping || customLoading) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-purple-50 border border-purple-200 rounded-2xl px-4 py-3 rounded-tl-sm flex gap-2 items-center">
                      <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                      {customLoading && (
                        <span className="text-xs font-medium text-purple-700 ml-1">
                          {language === 'tr'
                            ? 'starwebflow-automation iş akışı düğümlerini kurguluyor...'
                            : language === 'de'
                            ? 'starwebflow-automation erstellt Workflow-Knoten...'
                            : 'starwebflow-automation is designing workflow nodes...'}
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Live Interactive Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendCustomScenario()
              }}
              className="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50/80 shrink-0"
            >
              <div className="relative flex items-center gap-2">
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  disabled={customLoading}
                  placeholder={
                    language === 'tr'
                      ? '✨ Otomatikleştirmek istediğiniz işi yazın (Örn: WhatsApp\'tan gelen siparişleri ERP\'ye kaydet)...'
                      : language === 'de'
                      ? '✨ Beschreiben Sie Ihren Prozess (z. B. WhatsApp-Anfragen automatisch ins CRM buchen)...'
                      : '✨ Type a process to automate (e.g. Sync WhatsApp inquiries to CRM & send instant quote)...'
                  }
                  className="w-full bg-white border border-purple-300 focus:border-purple-600 rounded-xl py-3 pl-4 pr-12 text-slate-900 placeholder:text-slate-400 focus:outline-none text-xs sm:text-sm shadow-2xs transition-all"
                />
                <button
                  type="submit"
                  disabled={customLoading || !customInput.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 rounded-lg text-white transition-all cursor-pointer shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
