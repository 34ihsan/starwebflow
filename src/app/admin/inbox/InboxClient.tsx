'use client';

import React, { useState } from 'react';
import { markAsRead, replyToMessage } from '@/app/actions/inbox';

export default function InboxClient({ initialMessages }: { initialMessages: any[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSelectMessage = async (msg: any) => {
    setSelectedMessage(msg);
    setReplyText('');
    setIsReplying(false);
    
    if (!msg.isRead) {
      // Mark as read immediately in UI
      setMessages(messages.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
      // Sync with server
      await markAsRead(msg.id);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMessage) return;
    setIsSending(true);
    const res = await replyToMessage(selectedMessage.id, replyText);
    setIsSending(false);

    if (res.success) {
      alert('Yanıt başarıyla gönderildi!');
      setIsReplying(false);
      // Update UI
      setMessages(messages.map(m => m.id === selectedMessage.id ? { ...m, isReplied: true } : m));
      setSelectedMessage({ ...selectedMessage, isReplied: true });
    } else {
      alert('Hata: ' + res.error);
    }
  };

  return (
    <div className="flex bg-[#1E293B] rounded-2xl border border-white/10 overflow-hidden h-[700px]">
      
      {/* Sidebar - Message List */}
      <div className="w-1/3 border-r border-white/10 overflow-y-auto bg-[#1E293B]">
        {messages.length === 0 ? (
          <div className="p-8 text-center text-[#94A3B8]">
            <p>Henüz gelen kutunuzda mesaj yok.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id}
              onClick={() => handleSelectMessage(msg)}
              className={`p-4 border-b border-white/5 cursor-pointer transition-colors ${
                selectedMessage?.id === msg.id 
                  ? 'bg-blue-600/20 border-l-4 border-l-blue-500' 
                  : 'hover:bg-white/5 border-l-4 border-l-transparent'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`font-semibold ${!msg.isRead ? 'text-white' : 'text-[#94A3B8]'}`}>
                  {msg.fromName || msg.fromEmail.split('@')[0]}
                </span>
                <span className="text-xs text-[#64748B]">
                  {new Date(msg.createdAt).toLocaleDateString('tr-TR')}
                </span>
              </div>
              <div className={`text-sm mb-1 truncate ${!msg.isRead ? 'text-blue-400 font-medium' : 'text-[#CBD5E1]'}`}>
                {msg.subject || 'Konu Yok'}
              </div>
              <div className="text-xs text-[#64748B] flex items-center justify-between">
                <span>Alıcı: {msg.mailboxEmail}</span>
                {msg.isReplied && <span className="text-green-500 font-semibold">✓ Yanıtlandı</span>}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Main Content - Message Detail */}
      <div className="w-2/3 flex flex-col bg-[#0F172A]">
        {selectedMessage ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-[#1E293B]">
              <h2 className="text-xl font-semibold text-white mb-4">
                {selectedMessage.subject || 'Konu Yok'}
              </h2>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">{selectedMessage.fromName} &lt;{selectedMessage.fromEmail}&gt;</div>
                  <div className="text-sm text-[#94A3B8]">Kime: {selectedMessage.mailboxEmail}</div>
                </div>
                <div className="text-sm text-[#64748B]">
                  {new Date(selectedMessage.createdAt).toLocaleString('tr-TR')}
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 p-6 overflow-y-auto text-[#CBD5E1] text-sm leading-relaxed whitespace-pre-wrap">
              {selectedMessage.bodyText || 'Gövde içeriği yok veya sadece HTML (Şu anki sürümde düz metin gösteriliyor).'}
            </div>

            {/* Reply Section */}
            <div className="p-4 border-t border-white/10 bg-[#1E293B]">
              {!isReplying ? (
                <button 
                  onClick={() => setIsReplying(true)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
                  Yanıtla
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <textarea 
                    rows={5}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full bg-[#0F172A] border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                    placeholder="Yanıtınızı buraya yazın..."
                  />
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => setIsReplying(false)}
                      className="px-4 py-2 text-[#94A3B8] hover:text-white transition-colors"
                    >
                      İptal
                    </button>
                    <button 
                      onClick={handleSendReply}
                      disabled={isSending || !replyText.trim()}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                    >
                      {isSending ? 'Gönderiliyor...' : 'Gönder'}
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#64748B]">
            Okumak için soldan bir mesaj seçin.
          </div>
        )}
      </div>
    </div>
  );
}
