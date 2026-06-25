'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, User, Loader2 } from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function ClientAiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Merhaba! StarWebFlow asistanıyım. Projelerinizle ilgili bir sorunuz var mı?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: 'Üzgünüm, şu anda yanıt veremiyorum.' }]);
      }
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: 'Bir bağlantı hatası oluştu.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-r from-[#4F8EF7] to-[#8B5CF6] text-white shadow-2xl hover:scale-105 transition-all z-50 flex items-center justify-center"
        title="AI Destek Asistanı"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[350px] h-[500px] bg-[#0A0A0F] border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden font-sans">
          {/* Header */}
          <div className="bg-[#12121F] border-b border-white/5 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center">
              <Bot className="w-6 h-6 text-[#8B5CF6]" />
            </div>
            <div>
              <h3 className="text-white font-medium">AI Destek Asistanı</h3>
              <p className="text-xs text-[#94A3B8]">Projeleriniz hakkında bilgi alın</p>
            </div>
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
                  <div className="px-4 py-3 rounded-2xl bg-[#12121F] border border-white/5 rounded-bl-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-[#8B5CF6]" />
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
                placeholder="Mesajınızı yazın..."
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
