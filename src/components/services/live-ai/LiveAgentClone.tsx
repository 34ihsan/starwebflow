'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, Sparkles, Bot, User, Wand2, Target, Activity, RotateCcw, Stethoscope, Building2, Wrench } from 'lucide-react'
import { LabConsole, useServiceLab, tri, Typewriter } from './LabKit'
import type { AgentLabResult } from '@/app/api/v1/ai/service-lab/route'

const ACCENT = '#8B5CF6'

interface Msg {
  role: 'user' | 'assistant'
  content: string
  ms?: number
}

const PRESETS = [
  { company: 'Smile Dental', sector: { tr: 'Diş Kliniği', en: 'Dental Clinic', de: 'Zahnarztpraxis' }, offer: { tr: 'İmplant, beyazlatma, şeffaf plak', en: 'Implants, whitening, clear aligners', de: 'Implantate, Bleaching, Aligner' }, icon: Stethoscope, tag: 'HEALTHCARE' },
  { company: 'Atlas Emlak', sector: { tr: 'Emlak Ofisi', en: 'Real Estate Agency', de: 'Immobilienmakler' }, offer: { tr: 'Satılık/kiralık daire, değerleme', en: 'Apartments for sale/rent, valuation', de: 'Wohnungen Kauf/Miete, Bewertung' }, icon: Building2, tag: 'REAL ESTATE' },
  { company: 'Kaya Oto Servis', sector: { tr: 'Oto Servis', en: 'Car Service', de: 'Autowerkstatt' }, offer: { tr: 'Periyodik bakım, lastik, kaporta', en: 'Maintenance, tyres, bodywork', de: 'Inspektion, Reifen, Karosserie' }, icon: Wrench, tag: 'AUTOMOTIVE' },
  { company: 'Lumi Aesthetics', sector: { tr: 'Medikal Estetik', en: 'Medical Aesthetics', de: 'Medizinische Ästhetik' }, offer: { tr: 'Lazer epilasyon, medikal cilt bakımı', en: 'Laser treatment, clinical skincare', de: 'Laserbehandlung, klinische Kosmetik' }, icon: Sparkles, tag: 'AESTHETICS' },
]

const INTENT_LABEL: Record<AgentLabResult['intent'], [string, string, string, string]> = {
  price: ['Fiyat Sorgusu', 'Price Inquiry', 'Preisanfrage', '#F59E0B'],
  booking: ['Randevu Niyeti', 'Booking Intent', 'Terminwunsch', '#10B981'],
  complaint: ['🚨 Şikayet & Churn Riski', '🚨 Complaint / Churn Risk', '🚨 Reklamation / Churn-Gefahr', '#EF4444'],
  info: ['Bilgi Talebi', 'Info Request', 'Info-Anfrage', '#06B6D4'],
  other: ['Genel Sohbet', 'General', 'Allgemein', '#94A3B8'],
}

export default function LiveAgentClone() {
  const lab = useServiceLab<AgentLabResult>('agent')
  const l = lab.language
  const [stage, setStage] = useState<'setup' | 'chat'>('setup')
  const [company, setCompany] = useState('')
  const [sector, setSector] = useState('')
  const [offer, setOffer] = useState('')
  const [input, setInput] = useState('')
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [insight, setInsight] = useState<AgentLabResult | null>(null)
  const [count, setCount] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [msgs, lab.loading])

  const applyPreset = (p: (typeof PRESETS)[number]) => {
    setCompany(p.company)
    setSector(p.sector[l] || p.sector.tr)
    setOffer(p.offer[l] || p.offer.tr)
  }

  const start = () => {
    if (!company.trim()) return
    setStage('chat')
    setMsgs([
      {
        role: 'assistant',
        content: tri(
          l,
          `Merhaba! 👋 ${company} dijital asistanıyım. ${offer || sector} hakkında size nasıl yardımcı olabilirim?`,
          `Hi! 👋 I'm the digital assistant of ${company}. How can I help you with ${offer || sector}?`,
          `Hallo! 👋 Ich bin der digitale Assistent von ${company}. Wie kann ich Ihnen zu ${offer || sector} helfen?`
        ),
      },
    ])
  }

  const suggestions = [
    tri(l, 'Fiyatlarınız ne kadar?', 'How much does it cost?', 'Was kostet das?'),
    tri(l, 'Yarın için randevu alabilir miyim?', 'Can I book for tomorrow?', 'Kann ich für morgen buchen?'),
    tri(l, 'Gece 2’de yazıyorum, açık mısınız?', "It's 2am — are you open?", 'Es ist 2 Uhr nachts – sind Sie da?'),
    tri(l, 'Geçen hafta hizmetten memnun kalmadım', "I wasn't happy with last week's service", 'Ich war letzte Woche unzufrieden'),
  ]

  const send = async (text?: string) => {
    const message = (text ?? input).trim()
    if (!message || lab.loading) return
    setInput('')
    const history = msgs.map((m) => ({ role: m.role, content: m.content }))
    setMsgs((m) => [...m, { role: 'user', content: message }])
    const res = await lab.run({ company, sector, offer, message, history })
    if (res) {
      setMsgs((m) => [...m, { role: 'assistant', content: res.data.reply, ms: res.meta.latencyMs }])
      setInsight(res.data)
      setCount((c) => c + 1)
    }
  }

  const reset = () => {
    setStage('setup')
    setMsgs([])
    setInsight(null)
    setCount(0)
  }

  return (
    <LabConsole title={tri(l, 'Agent Klonlama Laboratuvarı', 'Agent Cloning Lab', 'Agent-Klon-Labor')} accent={ACCENT} meta={lab.meta} loading={lab.loading}>
      {stage === 'setup' ? (
        <div className="space-y-5" style={{ animation: 'fadeInUp .5s ease both' }}>
          <div>
            <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-widest mb-2">
              <Wand2 className="w-3.5 h-3.5" /> {tri(l, 'Adım 1 / 2 — İşletmenizi tanıtın', 'Step 1 / 2 — Describe your business', 'Schritt 1 / 2 — Ihr Unternehmen')}
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
              {tri(l, '30 saniyede kendi AI çalışanınızı yaratın.', 'Create your own AI employee in 30 seconds.', 'Erstellen Sie Ihren KI-Mitarbeiter in 30 Sekunden.')}
            </h3>
            <p className="text-sm text-slate-400 mt-1.5">
              {tri(l, 'Gerçek bir yerel dil modeli, markanız adına müşterilerinizle konuşacak. Hazır şablon değil — canlı.', 'A real local language model will talk to your customers on behalf of your brand. Not a script — live.', 'Ein echtes lokales Sprachmodell spricht im Namen Ihrer Marke mit Kunden. Kein Skript — live.')}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {PRESETS.map((p) => {
              const Icon = p.icon
              const isSelected = company === p.company
              return (
                <button
                  key={p.company}
                  onClick={() => applyPreset(p)}
                  className={`p-3 rounded-2xl border text-left transition-all hover:-translate-y-0.5 cursor-pointer ${
                    isSelected
                      ? 'border-purple-400 bg-purple-500/15 shadow-sm shadow-purple-500/10'
                      : 'border-white/[0.08] bg-white/[0.03] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                      {p.tag}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white truncate">{p.company}</div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">{p.sector[l] || p.sector.tr}</div>
                </button>
              )
            })}
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[11px] font-semibold text-slate-400">{tri(l, 'İşletme adı', 'Business name', 'Firmenname')}</span>
              <input id="agent-lab-company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Smile Dental" className="mt-1 w-full rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20" />
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold text-slate-400">{tri(l, 'Sektör', 'Industry', 'Branche')}</span>
              <input id="agent-lab-sector" value={sector} onChange={(e) => setSector(e.target.value)} placeholder={tri(l, 'Diş Kliniği', 'Dental Clinic', 'Zahnarztpraxis')} className="mt-1 w-full rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20" />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-[11px] font-semibold text-slate-400">{tri(l, 'Ne satıyorsunuz?', 'What do you sell?', 'Was bieten Sie an?')}</span>
              <input id="agent-lab-offer" value={offer} onChange={(e) => setOffer(e.target.value)} placeholder={tri(l, 'İmplant, beyazlatma, ortodonti…', 'Implants, whitening, orthodontics…', 'Implantate, Bleaching, Kieferorthopädie…')} className="mt-1 w-full rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20" />
            </label>
          </div>

          <button
            id="agent-lab-start"
            onClick={start}
            disabled={!company.trim()}
            className="w-full group relative overflow-hidden rounded-xl py-3.5 font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-transform active:scale-[0.99]"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, #06B6D4)` }}
          >
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            <span className="relative flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" /> {tri(l, 'AI Çalışanımı Canlandır', 'Bring My AI Employee to Life', 'Meinen KI-Mitarbeiter starten')}
            </span>
          </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_200px] gap-4" style={{ animation: 'fadeInUp .5s ease both' }}>
          {/* Chat */}
          <div className="flex flex-col rounded-2xl border border-white/[0.07] bg-black/20 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: `linear-gradient(135deg, ${ACCENT}, #06B6D4)` }}>
                  {company.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white leading-none">{company}</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">● {tri(l, 'çevrimiçi · genelde 2 sn içinde yanıtlar', 'online · usually replies in 2s', 'online · antwortet meist in 2 s')}</div>
                </div>
              </div>
              <button onClick={reset} className="text-slate-500 hover:text-white transition-colors" aria-label="reset">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div ref={scrollRef} className="h-[300px] overflow-y-auto px-4 py-4 space-y-3 scroll-smooth">
              {msgs.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : ''}`} style={{ animation: 'fadeInUp .35s ease both' }}>
                  {m.role === 'assistant' && <Bot className="w-5 h-5 mt-1 text-purple-300 shrink-0" />}
                  <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${m.role === 'user' ? 'bg-purple-600 text-white rounded-br-sm' : 'bg-white/[0.06] text-slate-100 rounded-bl-sm border border-white/[0.06]'}`}>
                    {m.role === 'assistant' && i === msgs.length - 1 && i > 0 ? <Typewriter text={m.content} /> : m.content}
                    {m.ms !== undefined && <div className="text-[9px] text-slate-500 mt-1 font-mono">⚡ {(m.ms / 1000).toFixed(1)}s</div>}
                  </div>
                  {m.role === 'user' && <User className="w-5 h-5 mt-1 text-slate-500 shrink-0" />}
                </div>
              ))}
              {lab.loading && (
                <div className="flex gap-2 items-center">
                  <Bot className="w-5 h-5 text-purple-300" />
                  <div className="flex gap-1 px-3.5 py-3 rounded-2xl bg-white/[0.06]">
                    {[0, 1, 2].map((d) => (
                      <span key={d} className="w-1.5 h-1.5 rounded-full bg-purple-300" style={{ animation: `typingDot 1.2s ${d * 0.15}s infinite` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {count < 1 && (
              <div className="flex gap-1.5 overflow-x-auto px-3 pb-2">
                {suggestions.map((sg) => (
                  <button key={sg} onClick={() => send(sg)} className="shrink-0 px-2.5 py-1.5 rounded-full border border-white/10 text-[11px] text-slate-300 hover:border-purple-400 hover:text-white transition-colors">
                    {sg}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault()
                send()
              }}
              className="flex gap-2 p-3 border-t border-white/[0.06]"
            >
              <input
                id="agent-lab-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={tri(l, 'Müşteriniz gibi bir şey yazın…', 'Type like your customer would…', 'Schreiben Sie wie ein Kunde…')}
                className="flex-1 rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-400"
              />
              <button id="agent-lab-send" disabled={lab.loading || !input.trim()} className="px-4 rounded-xl text-white disabled:opacity-40 transition-transform active:scale-95" style={{ background: ACCENT }}>
                <Send className="w-4 h-4" />
              </button>
            </form>
            {lab.error && <div className="px-4 pb-3 text-xs text-rose-400">{lab.error}</div>}
          </div>

          {/* Live CRM brain */}
          <div className="space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
              <Activity className="w-3 h-3" /> {tri(l, 'Canlı CRM Beyni', 'Live CRM Brain', 'Live-CRM-Gehirn')}
            </div>
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
              <div className="text-[10px] text-slate-500 mb-1">{tri(l, 'Tespit edilen niyet', 'Detected intent', 'Erkannte Absicht')}</div>
              {insight ? (
                <span className="inline-block px-2 py-1 rounded-md text-[11px] font-bold" style={{ background: `${INTENT_LABEL[insight.intent][3]}22`, color: INTENT_LABEL[insight.intent][3] }}>
                  {tri(l, ...(INTENT_LABEL[insight.intent].slice(0, 3) as [string, string, string]))}
                </span>
              ) : (
                <span className="text-xs text-slate-600">—</span>
              )}
            </div>
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1.5">
                <span className="flex items-center gap-1">
                  <Target className="w-3 h-3" /> {insight?.intent === 'complaint' ? 'Urgency / Churn Risk' : 'Lead Score'}
                </span>
                <span className="font-mono text-white text-xs">{insight?.leadScore ?? 0}</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${insight?.leadScore ?? 0}%`,
                    background:
                      insight?.intent === 'complaint'
                        ? '#EF4444'
                        : (insight?.leadScore ?? 0) > 70
                        ? '#10B981'
                        : (insight?.leadScore ?? 0) > 45
                        ? '#F59E0B'
                        : '#64748B',
                  }}
                />
              </div>
              {insight?.intent === 'complaint' ? (
                <div className="text-[10px] text-rose-400 mt-1.5 font-semibold flex items-center gap-1">
                  🚨 {tri(l, 'Acil Müdahale & Telafi Protokolü!', 'Critical Retention Protocol!', 'Kritisches Deeskalations-Protokoll!')}
                </div>
              ) : (
                (insight?.leadScore ?? 0) > 70 && (
                  <div className="text-[10px] text-emerald-400 mt-1.5 font-semibold">
                    🔥 {tri(l, 'Yüksek Satın Alma Niyeti!', 'High Purchase Intent!', 'Hohe Kaufabsicht!')}
                  </div>
                )
              )}
            </div>
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
              <div className="text-[10px] text-slate-500 mb-1">{tri(l, 'Otomatik aksiyon', 'Auto action', 'Auto-Aktion')}</div>
              <div className="text-[11px] text-slate-200 leading-snug">{insight?.nextAction || tri(l, 'Mesaj bekleniyor…', 'Waiting for a message…', 'Warte auf Nachricht…')}</div>
            </div>
            {count >= 2 && (
              <div className="rounded-xl p-3 text-[11px] leading-snug text-white" style={{ background: `linear-gradient(135deg, ${ACCENT}33, #06B6D422)`, border: `1px solid ${ACCENT}55`, animation: 'fadeInUp .5s ease both' }}>
                💡 {tri(l, `Bu çalışan bugün gece 03:00’te de aynı kalitede satış yapacak. Maaş: 0 €. Mola: hiç.`, `This employee will sell just as well at 3am tonight. Salary: €0. Breaks: never.`, `Dieser Mitarbeiter verkauft heute um 3 Uhr nachts genauso gut. Gehalt: 0 €. Pausen: nie.`)}
              </div>
            )}
          </div>
        </div>
      )}
    </LabConsole>
  )
}
