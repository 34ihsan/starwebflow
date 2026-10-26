'use client';

import { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, X, Send, ChevronDown, BrainCircuit, Zap, Calendar, CheckCircle2, Globe, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@ai-sdk/react';
import { useSectionTracker } from '@/hooks/useSectionTracker';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { LanguageType } from '@/lib/i18n/dictionaries';

const TRACKED_SECTIONS = ['hero', 'services', 'pricing', 'process', 'roi'];

interface VisitorContextState {
  auditedDomain?: string;
  auditScore?: number;
  detectedIndustry?: string;
  specTitle?: string;
  specIdea?: string;
}

interface ChatTranslation {
  welcome: string;
  headerSubtitle: string;
  closeLabel: string;
  placeholder: string;
  footerBadge: string;
  quickActions: { label: string; prompt: string }[];
}

const chatTranslations: Record<LanguageType, ChatTranslation> = {
  de: {
    welcome: "Hallo! Ich bin der autonome Architektur- & Effizienz-KI-Agent von StarWebFlow. ⚡\n\nWir bauen nicht nur Websites, sondern Effizienz-Maschinen:\n• Modell-Agnostische Hybrid-KI & Voice-Agenten (Cloud & On-Premise)\n• Kognitive Workflows & ERP-Integration (n8n & API)\n• Sub-Second Edge Web (0,38s) & B2B SaaS-Portale\n• Data-Driven Growth & GEO\n\nWie können wir Ihre Prozesse automatisieren? 👇",
    headerSubtitle: "Model-Agnostik & RAG v4.2 • 24/7 Aktiv",
    closeLabel: "Schließen",
    placeholder: "Frage zu KI-Agenten, ERP-Workflows, Edge Web oder SaaS...",
    footerBadge: "StarWebFlow KI-Agent • DSGVO & KVKK Verschlüsselt 🔒",
    quickActions: [
      {
        label: "🤖 Modell-Agnostische KI & Voice-Agenten (On-Premise / Cloud)",
        prompt: "Wie funktionieren eure Modell-Agnostischen Hybrid-KI- & Sprachagenten (Claude, Llama, DeepSeek, GPT) und die On-Premise-Option?"
      },
      {
        label: "⚙️ n8n Kognitive Workflows & ERP/CRM-Integration",
        prompt: "Wie verbindet ihr ERP-, CRM- und Buchhaltungssysteme über n8n & API, um wöchentlich 15+ Stunden einzusparen?"
      },
      {
        label: "⚡ Sub-Second Edge Web (0,38s) & B2B SaaS-Portale",
        prompt: "Ich möchte mehr über Sub-Second Edge Web (0,38s) und maßgeschneiderte B2B-Kundenportale (PostgreSQL & Docker) erfahren."
      }
    ]
  },
  en: {
    welcome: "Hello! I am StarWebFlow's Autonomous Engineering & Efficiency AI Agent. ⚡\n\nWe don't just build websites—we build efficiency machines:\n• Model-Agnostic Hybrid AI & Voice Agents (Cloud & On-Premise)\n• Cognitive Workflows & ERP Mesh (n8n & API)\n• Sub-Second Edge Web (0.38s) & Custom B2B SaaS Portals\n• Data-Driven Growth & GEO\n\nWhich architecture would you like to explore? 👇",
    headerSubtitle: "Model-Agnostic & RAG v4.2 • 24/7 Active",
    closeLabel: "Close",
    placeholder: "Ask about AI Agents, n8n ERP Mesh, Edge Web, or B2B SaaS...",
    footerBadge: "StarWebFlow AI Agent • GDPR & KVKK Encrypted 🔒",
    quickActions: [
      {
        label: "🤖 Model-Agnostic Hybrid AI & Voice Agents",
        prompt: "How do your Model-Agnostic Hybrid AI & Voice Agents (Claude, Llama, DeepSeek, GPT) and On-Premise deployment work?"
      },
      {
        label: "⚙️ n8n Cognitive Workflows & ERP/CRM Sync",
        prompt: "How do you integrate ERP, CRM, and accounting systems via n8n & Webhooks to save 15+ hours per week?"
      },
      {
        label: "⚡ Sub-Second Edge Web (0.38s) & B2B SaaS Portals",
        prompt: "Tell me about Sub-Second Edge Web (0.38s) and custom B2B self-service portals (PostgreSQL & Docker)."
      }
    ]
  },
  tr: {
    welcome: "Merhaba! Ben StarWebFlow Mühendislik & Verimlilik Mimarisi Otonom AI Temsilcisiyim. ⚡\n\nSadece web sitesi değil, operasyonel güç ve ROI üreten verimlilik makineleri kuruyoruz:\n• Model-Agnostik Hibrit AI & Sesli Ajanlar (Bulut & On-Premise)\n• Kognitif İş Akışı & ERP Entegrasyonu (n8n & API)\n• Sub-Second Edge Web (0.38s) & Özel B2B SaaS Portalları\n• Veri Odaklı Büyüme (Meta CAPI) & GEO\n\nSiteniz veya operasyonunuz için hangi mimariyi inceleyelim? 👇",
    headerSubtitle: "Model-Agnostik & RAG v4.2 • 7/24 Kesintisiz",
    closeLabel: "Kapat",
    placeholder: "AI Ajanlar, n8n ERP, Sub-Second Web veya B2B SaaS sorun...",
    footerBadge: "StarWebFlow AI Ajanı • KVKK & DSGVO Tam Veri Egemenliği 🔒",
    quickActions: [
      {
        label: "🤖 Model-Agnostik Hibrit AI & Sesli Ajanlar (On-Premise / Bulut)",
        prompt: "Model-Agnostik Hibrit AI (Claude, Llama, DeepSeek, GPT), Sesli AI Santral ve Kurum İçi (On-Premise) kurulumunuz nasıl çalışıyor?"
      },
      {
        label: "⚙️ n8n Kognitif İş Akışı & ERP/CRM Senkronizasyonu",
        prompt: "n8n ve API ile ERP, CRM ve fatura/muhasebe süreçlerini otomatikleştirip haftalık 15+ saat tasarrufu nasıl sağlıyorsunuz?"
      },
      {
        label: "⚡ Sub-Second Edge Web (0.38s) & Özel B2B Müşteri Portalı",
        prompt: "0.38 saniyede açılan Sub-Second Edge Web ve Excel karmaşasını bitiren Özel B2B Portal / SaaS mimariniz hakkında bilgi alabilir miyim?"
      }
    ]
  }
};

function formatMessageWithLeadCard(rawContent: string, lang: LanguageType): { cleanText: string; leadCaptured: any | null } {
  if (!rawContent) return { cleanText: '', leadCaptured: null };

  // Strip <think>...</think> and <tool_call>...</tool_call> blocks emitted by local reasoning/agent models
  let cleaned = rawContent
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<think>[\s\S]*$/gi, '')
    .replace(/<tool_call>[\s\S]*?<\/tool_call>/gi, '')
    .trim();

  // Check if message contains inline save_lead JSON block
  const jsonBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (jsonBlockMatch && jsonBlockMatch[1] && /save_lead/i.test(jsonBlockMatch[1])) {
    try {
      const parsed = JSON.parse(jsonBlockMatch[1].trim());
      const args = parsed.arguments || parsed.parameters || parsed;
      const stripped = cleaned.replace(jsonBlockMatch[0], '').trim();
      const defaultConfirm =
        lang === 'de'
          ? 'Vielen Dank! Ich habe Ihre Kontaktdaten an unser Expertenteam übermittelt. Wir melden uns in Kürze mit Ihrem maßgeschneiderten Angebot.'
          : lang === 'en'
          ? 'Thank you! I have forwarded your contact details to our senior engineering team. We will reach out shortly with your tailored proposal.'
          : 'Teşekkürler! İletişim bilgilerinizi uzman ekibimize ve CRM sistemimize öncelikli olarak ilettim. En kısa sürede size özel teklifimizle dönüş yapacağız.';
      return {
        cleanText: stripped || defaultConfirm,
        leadCaptured: args,
      };
    } catch {
      // ignore
    }
  }
  return { cleanText: cleaned, leadCaptured: null };
}

export default function ChatWidget() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpenedAutomatically, setHasOpenedAutomatically] = useState(false);
  const [visitorContext, setVisitorContext] = useState<VisitorContextState>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const tChat = chatTranslations[language] || chatTranslations.tr;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cross-Widget Memory Listeners (InstantAuditWidget & SpecBuilderSimulation)
  useEffect(() => {
    const onAuditCompleted = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      if (detail.domain) {
        setVisitorContext(prev => ({
          ...prev,
          auditedDomain: detail.domain,
          auditScore: detail.overallScore,
          detectedIndustry: detail.detectedIndustry,
        }));
      }
    };

    const onSpecGenerated = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      if (detail.projectTitle) {
        setVisitorContext(prev => ({
          ...prev,
          specTitle: detail.projectTitle,
          specIdea: detail.idea,
        }));
      }
    };

    window.addEventListener('starwebflow:audit-completed', onAuditCompleted);
    window.addEventListener('starwebflow:spec-generated', onSpecGenerated);
    return () => {
      window.removeEventListener('starwebflow:audit-completed', onAuditCompleted);
      window.removeEventListener('starwebflow:spec-generated', onSpecGenerated);
    };
  }, []);

  // Track sections
  const { activeSection, timeOnPage } = useSectionTracker(TRACKED_SECTIONS);

  const { messages, setMessages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: tChat.welcome
      }
    ],
    body: {
      tenantId: 'default-tenant',
      activeSection,
      timeOnPage,
      language,
      visitorContext,
    }
  });

  // Keep initial welcome message synced when language switches and user hasn't messaged yet
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === 'welcome') {
      const activeWelcome = (chatTranslations[language] || chatTranslations.tr).welcome;
      if (messages[0].content !== activeWelcome) {
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: activeWelcome
          }
        ]);
      }
    }
  }, [language, messages, setMessages]);

  // Proactive Engagement Trigger
  useEffect(() => {
    if (!hasOpenedAutomatically && !isOpen) {
      if (timeOnPage > 20 || (activeSection === 'pricing' && timeOnPage > 10)) {
        setIsOpen(true);
        setHasOpenedAutomatically(true);
      }
    }
  }, [timeOnPage, activeSection, isOpen, hasOpenedAutomatically]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (!mounted) {
    return <div data-ai-widget="starwebflow-autonomous-agent" data-crm-sync="active" aria-hidden="true" className="sr-only" />;
  }

  const hasLiveContext = Boolean(visitorContext.auditedDomain || visitorContext.specTitle);

  return (
    <div data-ai-widget="starwebflow-autonomous-agent" data-crm-sync="active" className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 z-[9999] flex flex-col items-end font-sans pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full sm:w-[395px] h-[620px] max-h-[calc(100dvh-120px)] mb-4 bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl shadow-[0_20px_60px_rgba(15,23,42,0.15)] flex flex-col overflow-hidden relative pointer-events-auto"
          >
            {/* Glowing Accent Top border */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600" />

            {/* Subtle light backdrop glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-100/60 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-indigo-100/60 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="bg-slate-50/90 backdrop-blur-md px-5 py-4 flex justify-between items-center border-b border-slate-200/80 relative z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-500/20 border border-white">
                    <BrainCircuit className="w-5.5 h-5.5 text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm animate-pulse" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-1.5 font-['Outfit']">
                    StarWebflow VIP Concierge
                    <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
                  </h4>
                  <p className="text-[10px] text-slate-500 font-mono">{tChat.headerSubtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <a 
                  href="/randevu" 
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-100/80 hover:bg-purple-600 hover:text-white text-purple-700 text-xs font-bold transition-all border border-purple-200/80 shadow-xs"
                  title="Canlı Randevu Al"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Randevu</span>
                </a>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-1.5 hover:bg-slate-200/60 text-slate-500 hover:text-slate-800 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer"
                  aria-label={tChat.closeLabel}
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cross-Widget Live Memory Banner */}
            {hasLiveContext && (
              <div className="bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 px-4 py-2.5 text-white border-b border-purple-500/30 relative z-10 shrink-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    {language === 'tr' ? 'Canlı Ziyaretçi Hafızası Aktif' : language === 'de' ? 'Live-Besucher-Kontext Aktiv' : 'Live Visitor Memory Active'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {visitorContext.auditedDomain && (
                    <button
                      type="button"
                      onClick={() =>
                        append({
                          role: 'user',
                          content:
                            language === 'tr'
                              ? `Az önce ${visitorContext.auditedDomain} sitemi tarattım (Skor: ${visitorContext.auditScore}/100). Bu açıkları kapatmak için nasıl bir paket önerirsiniz?`
                              : language === 'de'
                              ? `Ich habe gerade ${visitorContext.auditedDomain} gescannt (Score: ${visitorContext.auditScore}/100). Welche Lösung empfehlen Sie?`
                              : `I just scanned ${visitorContext.auditedDomain} (Score: ${visitorContext.auditScore}/100). What solution do you recommend?`
                        })
                      }
                      className="inline-flex items-center gap-1 text-[11px] bg-white/10 hover:bg-white/20 text-purple-100 px-2.5 py-1 rounded-lg border border-white/15 transition-all cursor-pointer"
                    >
                      <Globe className="w-3 h-3 text-cyan-400" />
                      <span>{visitorContext.auditedDomain} ({visitorContext.auditScore}/100) Analizi</span>
                    </button>
                  )}
                  {visitorContext.specTitle && (
                    <button
                      type="button"
                      onClick={() =>
                        append({
                          role: 'user',
                          content:
                            language === 'tr'
                              ? `Az önce "${visitorContext.specTitle}" için CTO mimari taslağı oluşturdum. Bu projenin geliştirme süreci ve teklifi için görüşebilir miyiz?`
                              : language === 'de'
                              ? `Ich habe gerade den CTO-Entwurf "${visitorContext.specTitle}" erstellt. Können wir über das Angebot sprechen?`
                              : `I just created the CTO blueprint "${visitorContext.specTitle}". Can we discuss the proposal and timeline?`
                        })
                      }
                      className="inline-flex items-center gap-1 text-[11px] bg-white/10 hover:bg-white/20 text-purple-100 px-2.5 py-1 rounded-lg border border-white/15 transition-all cursor-pointer"
                    >
                      <Cpu className="w-3 h-3 text-purple-400" />
                      <span className="truncate max-w-[210px]">{visitorContext.specTitle}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Chat Body */}
            <div className="flex-1 overflow-hidden flex flex-col bg-slate-50/50 relative z-10">
              <div className="flex-1 p-4 overflow-y-auto overflow-x-hidden flex flex-col gap-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                {messages.map((msg: any) => {
                  const formatted = msg.role !== 'user'
                    ? formatMessageWithLeadCard(msg.content, language)
                    : { cleanText: msg.content, leadCaptured: null };

                  return (
                    <div 
                      key={msg.id} 
                      className={`flex gap-2.5 max-w-[88%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
                    >
                      {msg.role !== 'user' && (
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                          <BrainCircuit className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <div 
                          className={`rounded-2xl px-4 py-3 text-[14px] leading-relaxed shadow-2xs whitespace-pre-wrap break-words ${
                            msg.role === 'user' 
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none font-medium' 
                              : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none font-normal'
                          }`}
                        >
                          {formatted.cleanText}
                        </div>

                        {formatted.leadCaptured && (
                          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900 shadow-2xs">
                            <div className="flex items-center gap-1.5 font-bold text-emerald-700 mb-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>
                                {language === 'de'
                                  ? 'VIP-Anfrage im CRM registriert'
                                  : language === 'en'
                                  ? 'VIP Inquiry Registered in CRM'
                                  : 'VIP Talebiniz CRM Sistemine Kaydedildi'}
                              </span>
                            </div>
                            <div className="text-[11px] text-emerald-800 space-y-0.5">
                              {formatted.leadCaptured.name && <div>• <strong>Ad/Name:</strong> {formatted.leadCaptured.name}</div>}
                              {formatted.leadCaptured.email && <div>• <strong>E-Mail:</strong> {formatted.leadCaptured.email}</div>}
                              {formatted.leadCaptured.phone && <div>• <strong>Tel:</strong> {formatted.leadCaptured.phone}</div>}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {/* Quick Actions (only show when there's 1 message) */}
                {messages.length === 1 && !isLoading && (
                  <div className="flex flex-col gap-2 mt-1 ml-8 max-w-[85%] self-start animate-fade-in-up">
                    {tChat.quickActions.map((qa, idx) => (
                      <button 
                        key={idx}
                        onClick={() => append({ role: 'user', content: qa.prompt })}
                        className="text-left text-xs bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 hover:border-purple-300 rounded-xl px-3.5 py-2.5 transition-all duration-200 flex items-center gap-2 shadow-2xs cursor-pointer font-medium"
                      >
                        {idx === 0 ? (
                          <Zap className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        ) : idx === 1 ? (
                          <BrainCircuit className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                        )}
                        <span>{qa.label}</span>
                      </button>
                    ))}
                  </div>
                )}
                
                {isLoading && (
                  <div className="flex gap-2.5 max-w-[85%] self-start">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                      <BrainCircuit className="w-3.5 h-3.5 text-white animate-pulse" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 text-sm flex gap-1.5 items-center shadow-2xs">
                      <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Input Area */}
              <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                  <div className="flex-1 relative">
                    <input 
                      type="text"
                      placeholder={tChat.placeholder}
                      value={input || ''}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-4 pr-10 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-200 shadow-2xs"
                    />
                    <Sparkles className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" />
                  </div>
                  <button 
                    type="submit"
                    disabled={isLoading || !(input || '').trim()}
                    className="w-11 h-11 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white flex-shrink-0 disabled:opacity-40 hover:shadow-md hover:shadow-purple-500/20 transition-all duration-200 cursor-pointer"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </form>
                <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
                  <BrainCircuit className="w-3.5 h-3.5 text-purple-600" />
                  <span>{tChat.footerBadge}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button with Agent Icon */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-[3.5rem] h-[3.5rem] sm:w-16 sm:h-16 rounded-full sm:rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center text-white shadow-[0_8px_30px_rgba(139,92,246,0.35)] hover:shadow-[0_8px_40px_rgba(139,92,246,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 relative group overflow-hidden border border-white/10 pointer-events-auto"
        aria-label="Chat toggle"
      >
        {!isOpen && (
          <span className="absolute inset-0 rounded-2xl border border-purple-400/30 animate-ping pointer-events-none scale-105" />
        )}
        {hasLiveContext && !isOpen && (
          <span className="absolute top-1.5 right-1.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-purple-900 z-20" />
        )}
        
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-7 h-7" />
            </motion.div>
          ) : (
            <motion.div
              key="bot"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center"
            >
              <BrainCircuit className="w-7 h-7 animate-pulse-slow" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
