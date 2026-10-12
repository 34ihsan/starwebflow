'use client';

import { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, X, Send, ChevronDown, BrainCircuit, Zap, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@ai-sdk/react';
import { useSectionTracker } from '@/hooks/useSectionTracker';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { LanguageType } from '@/lib/i18n/dictionaries';

const TRACKED_SECTIONS = ['hero', 'services', 'pricing', 'process', 'roi'];

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
    welcome: "Hallo! Ich bin der autonome KI-Assistent von StarWebFlow. ⚡\n\nIch entwerfe Architekturen für digitale Transformation und künstliche Intelligenz, die zu 100 % den gesetzlichen Standards in Deutschland (DSGVO), der Europäischen Union (GDPR) und der Türkei (KVKK) entsprechen.\n\nWebprojekte, KI-Agenten, n8n-Workflows oder Werbestrategien: Ich kann Ihre Fragen sofort beantworten und ein maßgeschneidertes Angebot für Sie erstellen.\n\nIn welchem Markt (DE / EU / TR) sind Sie tätig – wollen wir uns austauschen? 👇",
    headerSubtitle: "Autonomer KI-Berater",
    closeLabel: "Schließen",
    placeholder: "Ihre Nachricht eingeben...",
    footerBadge: "Star KI-Agent • DSGVO & KVKK Verschlüsselt 🔒",
    quickActions: [
      {
        label: "🇩🇪 DSGVO-konformes KI-Agent-Angebot anfordern",
        prompt: "Ich möchte ein KI-Agent-Angebot nach deutschen & EU-Rechtsstandards (DSGVO) erhalten."
      },
      {
        label: "🌐 Web & SaaS-Angebot berechnen",
        prompt: "Ich interessiere mich für ein Sub-Second Next.js Webprojekt und ein individuelles SaaS-Angebot."
      },
      {
        label: "📅 Live-Termin mit Experten vereinbaren",
        prompt: "Ich möchte ein persönliches Beratungsgespräch mit einem Ihrer Experten vereinbaren."
      }
    ]
  },
  en: {
    welcome: "Hello! I am StarWebFlow's autonomous AI assistant. ⚡\n\nI design digital transformation and AI architectures that are 100% compliant with legal standards in Germany (GDPR/DSGVO), the European Union, and Turkey (KVKK).\n\nWeb projects, AI Agents, n8n workflows, or advertising strategies: I can instantly answer your questions and prepare a customized proposal for you.\n\nWhich market (DE / EU / TR) do you operate in – shall we chat? 👇",
    headerSubtitle: "Autonomous AI Consultant",
    closeLabel: "Close",
    placeholder: "Type your message...",
    footerBadge: "Star AI Agent • GDPR & KVKK Encrypted 🔒",
    quickActions: [
      {
        label: "🇩🇪 Get GDPR-Compliant AI Agent Quote",
        prompt: "I would like to receive an AI Agent quote compliant with German & EU legal standards (GDPR)."
      },
      {
        label: "🌐 Calculate Web & SaaS Price Quote",
        prompt: "I would like a price quote for a Sub-Second Next.js web project and custom SaaS."
      },
      {
        label: "📅 Schedule a Live Call with an Expert",
        prompt: "I would like to schedule a live consultation call with one of your experts."
      }
    ]
  },
  tr: {
    welcome: "Merhaba! Ben StarWebFlow otonom AI temsilcisiyim. ⚡\n\nAlmanya (DSGVO), Avrupa Birliği (GDPR) ve Türkiye (KVKK) yasal standartlarına %100 uyumlu dijital dönüşüm ve yapay zeka mimarileri tasarlıyorum.\n\nWeb projesi, AI Agent, n8n iş akışları veya reklam stratejileri hakkında sorularınızı anında yanıtlayabilir, size özel fiyat teklifi hazırlayabilirim.\n\nHangi pazarda (DE / EU / TR) hizmet veriyorsunuz, konuşalım mı? 👇",
    headerSubtitle: "Otonom Satış Temsilcisi",
    closeLabel: "Kapat",
    placeholder: "Mesajınızı yazın...",
    footerBadge: "Star AI Ajanı • DSGVO & KVKK Encrypted 🔒",
    quickActions: [
      {
        label: "🇩🇪 DSGVO Uyumlu AI Agent Teklifi Al",
        prompt: "Almanya & AB yasal standartlarında (DSGVO) AI Agent teklifi almak istiyorum."
      },
      {
        label: "🌐 Web & SaaS Fiyat Teklifi Hesapla",
        prompt: "Sub-Second Next.js web projesi ve özel SaaS fiyat teklifi istiyorum."
      },
      {
        label: "📅 Uzman ile Canlı Randevu Ayarla",
        prompt: "Proje hakkında uzmanınızla canlı randevu görüşmesi ayarlamak istiyorum."
      }
    ]
  }
};

export default function ChatWidget() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpenedAutomatically, setHasOpenedAutomatically] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const tChat = chatTranslations[language] || chatTranslations.tr;

  useEffect(() => {
    setMounted(true);
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
      language
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

  if (!mounted) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 z-[9999] flex flex-col items-end font-sans pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full sm:w-[380px] h-[600px] max-h-[calc(100dvh-120px)] mb-4 bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl shadow-[0_20px_60px_rgba(15,23,42,0.15)] flex flex-col overflow-hidden relative pointer-events-auto"
          >
            {/* Glowing Accent Top border */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600" />

            {/* Subtle light backdrop glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-100/60 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-indigo-100/60 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="bg-slate-50/90 backdrop-blur-md px-5 py-4 flex justify-between items-center border-b border-slate-200/80 relative z-10 shrink-0">
              <div className="flex items-center gap-3">
                {/* Agent Avatar with Green status dot */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-500/20 border border-white">
                    <BrainCircuit className="w-5.5 h-5.5 text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm animate-pulse" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-1.5 font-['Outfit']">
                    StarWebflow AI
                    <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">{tChat.headerSubtitle}</p>
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

            {/* Chat Body */}
            <div className="flex-1 overflow-hidden flex flex-col bg-slate-50/50 relative z-10">
              {/* Chat View */}
              <div className="flex-1 p-4 overflow-y-auto overflow-x-hidden flex flex-col gap-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                {messages.map((msg: any) => (
                  <div 
                    key={msg.id} 
                    className={`flex gap-2.5 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
                  >
                    {/* Bot avatar next to message */}
                    {msg.role !== 'user' && (
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                        <BrainCircuit className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    
                    <div 
                      className={`rounded-2xl px-4 py-3 text-[14px] leading-relaxed shadow-2xs whitespace-pre-wrap break-words ${
                        msg.role === 'user' 
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none font-medium' 
                          : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none font-normal'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                
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
        {/* Pulsing glow ring around the button */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-2xl border border-purple-400/30 animate-ping pointer-events-none scale-105" />
        )}
        
        {/* Button icon transitions */}
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
