'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Paperclip, MessageSquare, Clock, File, Edit2, Trash2, X, Check } from 'lucide-react'
import { sendChatMessage, updateChatMessage, deleteChatMessage } from '@/app/actions/chat'
import { useRouter } from 'next/navigation'

export default function ClientMessagesClient({ initialThread, tenantId, clientId }: any) {
  const router = useRouter()
  const [messages, setMessages] = useState<any[]>(initialThread?.messages || [])
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  
  // Edit state
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Polling for real-time updates
  useEffect(() => {
    if (!initialThread) return;
    
    const pollMessages = async () => {
      try {
        // Needs a way to get thread messages from client side, we can import getThreadMessages
        const { getThreadMessages } = await import('@/app/actions/chat');
        const res = await getThreadMessages(initialThread.id);
        if (res.success && res.data) {
          setMessages(res.data.messages || []);
        }
      } catch (e) {
        console.error(e);
      }
    };

    const interval = setInterval(pollMessages, 3000);
    return () => clearInterval(interval);
  }, [initialThread?.id]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !initialThread) return

    setIsSending(true)
    
    // Optimistic UI update
    const tempMsg = {
      id: "temp-" + Date.now(),
      content: newMessage,
      senderId: clientId,
      createdAt: new Date().toISOString(),
      sender: { name: "Siz" }
    }
    setMessages(prev => [...prev, tempMsg])
    setNewMessage("")

    const res = await sendChatMessage({
      threadId: initialThread.id,
      senderId: clientId,
      content: tempMsg.content,
    })

    if (res.success && res.data) {
      setMessages(prev => prev.map(m => m.id === tempMsg.id ? res.data : m))
      router.refresh()
    } else {
      alert("Mesaj gönderilemedi.")
    }
    
    setIsSending(false)
  }

  const handleDelete = async (msgId: string) => {
    if (!confirm("Bu mesajı silmek istediğinize emin misiniz?")) return;
    
    setMessages(prev => prev.filter(m => m.id !== msgId))
    const res = await deleteChatMessage(msgId, clientId);
    if (!res.success) {
      alert(res.error || "Mesaj silinemedi");
      router.refresh(); // revert optimistic
    }
  }

  const startEditing = (msg: any) => {
    setEditingMessageId(msg.id);
    setEditContent(msg.content);
  }

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditContent("");
  }

  const saveEdit = async (msgId: string) => {
    if (!editContent.trim()) return;
    
    // Optimistic
    const oldMessages = [...messages];
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: editContent } : m));
    setEditingMessageId(null);
    
    const res = await updateChatMessage(msgId, clientId, editContent);
    if (!res.success) {
      alert(res.error || "Mesaj güncellenemedi");
      setMessages(oldMessages); // revert
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-['Outfit'] text-white flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-[#8B5CF6]" />
          Mesajlar
        </h1>
        <p className="text-slate-400 mt-2">StarWebFlow yetkilileriyle iletişime geçin.</p>
      </div>

      <div className="flex-1 bg-[#0A0A0F] border border-white/[0.05] rounded-2xl flex flex-col overflow-hidden shadow-lg">
        {/* Messages Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
              <p>Henüz mesajınız yok. Görüşmeyi başlatın!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === clientId;
              const isEditing = editingMessageId === msg.id;

              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-5 py-3 relative group ${
                    isMine 
                      ? 'bg-[#8B5CF6] text-white rounded-tr-sm' 
                      : 'bg-[#131B2A] border border-white/[0.05] text-slate-200 rounded-tl-sm'
                  }`}>
                    {isEditing ? (
                      <div className="flex flex-col gap-2">
                        <textarea 
                          value={editContent}
                          onChange={e => setEditContent(e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded p-2 text-white text-sm focus:outline-none focus:border-white/50 min-h-[60px]"
                        />
                        <div className="flex justify-end gap-2">
                          <button onClick={cancelEditing} className="p-1 hover:bg-white/10 rounded">
                            <X className="w-4 h-4 text-white/70 hover:text-white" />
                          </button>
                          <button onClick={() => saveEdit(msg.id)} className="p-1 hover:bg-white/10 rounded">
                            <Check className="w-4 h-4 text-white/70 hover:text-white" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <div className={`text-[10px] mt-2 flex justify-end items-center gap-2 ${isMine ? 'text-white/70' : 'text-slate-500'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        
                        {/* Hover Actions */}
                        {isMine && !msg.id.startsWith("temp-") && (
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-[#8B5CF6] px-1 rounded shadow-lg">
                            <button onClick={() => startEditing(msg)} className="p-1 hover:bg-white/20 rounded text-white" title="Düzenle">
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button onClick={() => handleDelete(msg.id)} className="p-1 hover:bg-white/20 rounded text-red-200 hover:text-red-100" title="Sil">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#131B2A] border-t border-white/[0.05]">
          <form onSubmit={handleSend} className="flex items-center gap-3">
            <button type="button" className="p-3 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Mesajınızı yazın..."
              className="flex-1 bg-[#0A0A0F] border border-white/[0.05] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
            />
            <button 
              type="submit" 
              disabled={isSending || !newMessage.trim()}
              className="p-3 rounded-xl bg-[#8B5CF6] text-white hover:bg-[#7C3AED] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(139,92,246,0.3)]"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
