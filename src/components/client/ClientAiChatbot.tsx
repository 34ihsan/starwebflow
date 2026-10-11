'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, User, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { LanguageType } from '@/lib/i18n/dictionaries';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

interface ClientChatTranslation {
  welcome: string;
  title: string;
  online: string;
  placeholder: string;
  errorResponse: string;
  errorConnection: string;
  openAria: string;
  closeAria: string;
}

const clientChatTranslations: Record<LanguageType, ClientChatTranslation> = {
  de: {
    welcome: 'Hallo! Ich bin der KI-Assistent von StarWebFlow. Haben Sie Fragen zu Ihren Projekten oder Aufgaben?',
    title: 'KI-Support-Assistent',
    online: 'Online',
    placeholder: 'Ihre Nachricht eingeben...',
    errorResponse: 'Entschuldigung, ich kann derzeit nicht antworten.',
    errorConnection: 'Ein Verbindungsfehler ist aufgetreten.',
    openAria: 'KI-Support-Assistent öffnen',
    closeAria: 'Chat schließen',
  },
  en: {
    welcome: 'Hello! I am StarWebFlow\'s AI assistant. Do you have any questions about your ongoing projects?',
    title: 'AI Support Assistant',
    online: 'Online',
    placeholder: 'Type your message...',
    errorResponse: 'Sorry, I cannot respond at the moment.',
    errorConnection: 'A connection error occurred.',
    openAria: 'Open AI Support Assistant',
    closeAria: 'Close chat',
  },
  tr: {
    welcome: 'Merhaba! StarWebFlow asistanıyım. Projelerinizle ilgili bir sorunuz var mı?',
    title: 'AI Destek Asistanı',
    online: 'Çevrimiçi',
    placeholder: 'Mesajınızı yazın...',
    errorResponse: 'Üzgünüm, şu anda yanıt veremiyorum.',
    errorConnection: 'Bir bağlantı hatası oluştu.',
    openAria: 'AI Destek Asistanı\'nı aç',
    closeAria: 'Sohbeti kapat',
  },
};

export default function ClientAiChatbot() {
  const { language } = useLanguage();
  const t = clientChatTranslations[language] || clientChatTranslations.tr;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: t.welcome }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync welcome message on language switch when no user messages
  useEffect(() => {
    if (messages.length <= 1) {
      setMessages([{ role: 'assistant', content: t.welcome }]);
    }
  }, [language, t.welcome]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/client/ai-support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, language }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: t.errorResponse }]);
      }
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: t.errorConnection }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button with Animated Pulse Ring */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <>
            <div className="absolute inset-0 rounded-full animate-ping" style={{ background: 'rgba(139,92,246,0.25)', animationDuration: '2s' }} />
            <div className="absolute inset-0 rounded-full animate-ping" style={{ background: 'rgba(79,142,247,0.15)', animationDuration: '2.5s', animationDelay: '0.5s' }} />
          </>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-4 rounded-full text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center"
          style={{
            background: isOpen
              ? 'linear-gradient(135deg, #EF4444, #DC2626)'
              : 'linear-gradient(135deg, #4F8EF7, #8B5CF6)',
            boxShadow: isOpen
              ? '0 0 30px rgba(239,68,68,0.4), 0 8px 32px rgba(0,0,0,0.4)'
              : '0 0 30px rgba(79,142,247,0.5), 0 0 60px rgba(139,92,246,0.2), 0 8px 32px rgba(0,0,0,0.4)',
          }}
          title={t.title}
          aria-label={isOpen ? t.closeAria : t.openAria}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 w-[360px] h-[520px] flex flex-col z-50 overflow-hidden font-sans"
          style={{
            background: 'rgba(10, 10, 15, 0.92)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            boxShadow: '0 0 60px rgba(79,142,247,0.15), 0 32px 80px rgba(0,0,0,0.6)',
            animation: 'slideDown 0.25s ease both',
          }}
        >
          {/* Header */}
          <div className="border-b border-white/[0.06] p-4 flex items-center gap-3 flex-shrink-0" style={{ background: 'rgba(15, 15, 26, 0.6)' }}>
            {/* Top glow line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/50 to-transparent rounded-t-2xl" />
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #4F8EF7, #8B5CF6)', boxShadow: '0 0 20px rgba(139,92,246,0.4)' }}
            >
              <Bot className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-sm">{t.title}</h3>
              <p className="text-[10px] text-[#10B981] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full inline-block" style={{ boxShadow: '0 0 6px rgba(16,185,129,0.8)' }} />
                {t.online}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#64748B] hover:text-white hover:bg-white/[0.06] transition-all"
              aria-label={t.closeAria}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-[#4F8EF7]/20' : 'bg-[#8B5CF6]/20'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4 text-[#4F8EF7]" /> : <Bot className="w-4 h-4 text-[#8B5CF6]" />}
                  </div>
                  <div className={`px-4 py-2 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-[#4F8EF7] text-white rounded-br-sm' : 'bg-[#12121F] text-[#E2E8F0] border border-white/5 rounded-bl-sm'}`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex max-w-[85%] flex-row items-end gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-[#8B5CF6]/20">
                    <Bot className="w-4 h-4 text-[#8B5CF6]" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-[#0F0F1A] border border-white/[0.06] rounded-bl-sm">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] typing-dot" />
                      <div className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] typing-dot" />
                      <div className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] typing-dot" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/5 bg-[#0A0A0F]">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t.placeholder}
                className="w-full bg-[#12121F] border border-white/10 rounded-xl py-3 pl-4 pr-12 text-white text-sm focus:outline-none focus:border-[#8B5CF6] transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-[#8B5CF6] text-white rounded-lg hover:bg-[#7C3AED] disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
