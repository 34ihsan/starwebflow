'use client';

import { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, X, Send, ChevronDown, BrainCircuit, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@ai-sdk/react';
import { useSectionTracker } from '@/hooks/useSectionTracker';

const TRACKED_SECTIONS = ['hero', 'services', 'pricing', 'process', 'roi'];

export default function ChatWidget() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpenedAutomatically, setHasOpenedAutomatically] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Track sections
  const { activeSection, timeOnPage } = useSectionTracker(TRACKED_SECTIONS);

  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: "Merhaba! Ben StarWebflow'un otonom büyüme temsilcisiyim. ⚡\n\nSıradan bir chat kutusu değilim; işletmenizin ihtiyaçlarını analiz eden ve size özel dijital büyüme stratejileri çıkaran bir yapay zeka ajanıyım.\n\nSayfamızı incelerken; web tasarım, SEO veya otonom iş akışları (AI Agents) paketlerimizin detaylarını ve fiyat tekliflerini sizin için anında hesaplayabilirim.\n\nHangi sektördesiniz, dijital hedeflerinizi konuşalım mı? 👇"
      }
    ],
    body: {
      tenantId: 'default-tenant',
      activeSection,
      timeOnPage
    }
  });

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
            className="w-full sm:w-[380px] h-[600px] max-h-[calc(100dvh-120px)] mb-4 bg-[#0B0B14]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden relative pointer-events-auto"
          >
            {/* Glowing Accent Top border */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#8B5CF6] via-[#D946EF] to-[#6366F1]" />

            {/* Subtle purple backdrop glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#8B5CF6]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-[#6366F1]/10 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="bg-[#121220]/75 backdrop-blur-md px-5 py-4 flex justify-between items-center border-b border-white/5 relative z-10 shrink-0">
              <div className="flex items-center gap-3">
                {/* Agent Avatar with Green status dot */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8B5CF6] to-[#D946EF] flex items-center justify-center shadow-lg shadow-[#8B5CF6]/25 border border-white/20">
                    <BrainCircuit className="w-5.5 h-5.5 text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#121220] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm tracking-tight flex items-center gap-1.5 font-['Outfit']">
                    StarWebflow AI
                    <Sparkles className="w-3.5 h-3.5 text-[#D946EF] animate-pulse" />
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium">Otonom Satış Temsilcisi</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl transition-all duration-200 active:scale-95"
                aria-label="Kapat"
              >
                <ChevronDown className="w-6 h-6" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-hidden flex flex-col bg-[#05050A]/70 relative z-10">
              {/* Chat View */}
              <div className="flex-1 p-4 overflow-y-auto overflow-x-hidden flex flex-col gap-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {messages.map((msg: any) => (
                  <div 
                    key={msg.id} 
                    className={`flex gap-2.5 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
                  >
                    {/* Bot avatar next to message */}
                    {msg.role !== 'user' && (
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#8B5CF6] to-[#D946EF] shadow-md flex items-center justify-center flex-shrink-0 mt-0.5">
                        <BrainCircuit className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    
                    <div 
                      className={`rounded-2xl px-4 py-3 text-[15px] sm:text-sm leading-relaxed shadow-sm whitespace-pre-wrap break-words ${
                        msg.role === 'user' 
                          ? 'bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white rounded-tr-none' 
                          : 'bg-[#181826]/90 border border-white/5 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                
                {/* Quick Actions (only show when there's 1 message) */}
                {messages.length === 1 && !isLoading && (
                  <div className="flex flex-col gap-2 mt-1 ml-9 max-w-[85%] self-start animate-fade-in-up">
                    <button 
                      onClick={() => append({ role: 'user', content: 'Web projem için fiyat teklifi almak istiyorum.' })}
                      className="text-left text-xs bg-white/5 hover:bg-[#8B5CF6]/20 text-slate-300 hover:text-white border border-white/10 hover:border-[#8B5CF6]/50 rounded-xl px-3.5 py-2.5 transition-all duration-300 flex items-center gap-2"
                    >
                      <Zap className="w-3.5 h-3.5 text-[#D946EF]" />
                      Bütçeme Özel Fiyat Teklifi Al
                    </button>
                    <button 
                      onClick={() => append({ role: 'user', content: 'Sektörüme özel ücretsiz analiz raporu ve danışmanlık talep ediyorum.' })}
                      className="text-left text-xs bg-white/5 hover:bg-[#8B5CF6]/20 text-slate-300 hover:text-white border border-white/10 hover:border-[#8B5CF6]/50 rounded-xl px-3.5 py-2.5 transition-all duration-300 flex items-center gap-2"
                    >
                      <BrainCircuit className="w-3.5 h-3.5 text-[#8B5CF6]" />
                      Ücretsiz Proje Analizi İste
                    </button>
                    <button 
                      onClick={() => append({ role: 'user', content: 'Yetkili biriyle görüşme ayarlamak istiyorum.' })}
                      className="text-left text-xs bg-white/5 hover:bg-[#8B5CF6]/20 text-slate-300 hover:text-white border border-white/10 hover:border-[#8B5CF6]/50 rounded-xl px-3.5 py-2.5 transition-all duration-300 flex items-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#6366F1]" />
                      Yetkili ile Görüşme Ayarla
                    </button>
                  </div>
                )}
                
                {isLoading && (
                  <div className="flex gap-2.5 max-w-[85%] self-start">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#8B5CF6] to-[#D946EF] shadow-md flex items-center justify-center flex-shrink-0 mt-0.5">
                      <BrainCircuit className="w-3.5 h-3.5 text-white animate-pulse" />
                    </div>
                    <div className="bg-[#181826]/90 border border-white/5 rounded-2xl rounded-tl-none px-4 py-3 text-sm flex gap-1.5 items-center">
                      <span className="w-2 h-2 bg-[#8B5CF6] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-[#8B5CF6] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-[#8B5CF6] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Input Area */}
              <div className="p-4 bg-[#0E0E18]/80 border-t border-white/5 shrink-0">
                <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                  <div className="flex-1 relative">
                    <input 
                      type="text"
                      placeholder="Mesajınızı yazın..."
                      value={input || ''}
                      onChange={handleInputChange}
                      className="w-full bg-[#121220]/80 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]/30 outline-none transition-all duration-300 shadow-inner"
                    />
                    <Sparkles className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B5CF6]/40 pointer-events-none" />
                  </div>
                  <button 
                    type="submit"
                    disabled={isLoading || !(input || '').trim()}
                    className="w-11 h-11 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center text-white flex-shrink-0 disabled:opacity-50 hover:shadow-lg hover:shadow-[#8B5CF6]/30 transition-all duration-300"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </form>
                <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium">
                  <BrainCircuit className="w-3 h-3 text-[#8B5CF6]" />
                  <span>Star AI Ajanı aktif • Yanıtlar anında üretilir</span>
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
