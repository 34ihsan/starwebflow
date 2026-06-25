'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Paperclip, MessageSquare, Search, User, Clock, Mail, Edit2, Trash2, X, Check } from 'lucide-react'
import { getOrCreateClientThread, sendChatMessage, getThreadMessages, updateChatMessage, deleteChatMessage } from '@/app/actions/chat'
import { sendEmailMessageToLead } from '@/app/actions/email-chat'
import { useRouter } from 'next/navigation'

export default function AdminMessagesClient({ initialThreads, allUsers, tenantId, adminId }: any) {
  const router = useRouter()
  
  // Merge initialThreads and allUsers to show everyone
  const mergedThreads = [...(initialThreads || [])];
  
  if (allUsers && allUsers.length > 0) {
    allUsers.forEach((user: any) => {
      // Check if user already has a thread
      const exists = mergedThreads.some(t => t.clientId === user.id);
      if (!exists) {
        mergedThreads.push({
          id: `virtual_${user.id}`,
          isVirtual: true,
          tenantId,
          clientId: user.id,
          client: user,
          messages: []
        });
      }
    });
  }

  const [threads, setThreads] = useState<any[]>(mergedThreads)
  const [activeThread, setActiveThread] = useState<any | null>(null)
  
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Edit state
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Polling for real-time updates
  useEffect(() => {
    if (!activeThread) return;
    
    const pollMessages = async () => {
      try {
        if (activeThread.isVirtual) {
          // Check if client started a conversation in the meantime
          const checkRes = await getOrCreateClientThread(tenantId, activeThread.clientId);
          if (checkRes.success && checkRes.data && checkRes.data.messages && checkRes.data.messages.length > 0) {
            setActiveThread(checkRes.data);
            setMessages(checkRes.data.messages);
            // Also update threads list to remove virtual status
            setThreads(prev => prev.map(t => t.id === activeThread.id ? checkRes.data : t));
          }
          return;
        }

        const res = await getThreadMessages(activeThread.id);
        if (res.success && res.data) {
          setMessages(res.data.messages || []);
        }
      } catch (e) {
        console.error(e);
      }
    };

    const interval = setInterval(pollMessages, 3000);
    return () => clearInterval(interval);
  }, [activeThread, tenantId]);

  const handleSelectThread = async (clientThread: any) => {
    setActiveThread(clientThread)
    if (clientThread.isVirtual) {
      // Attempt to fetch from DB just in case client sent a message recently
      const res = await getOrCreateClientThread(tenantId, clientThread.clientId);
      if (res.success && res.data && res.data.messages && res.data.messages.length > 0) {
        setActiveThread(res.data);
        setMessages(res.data.messages);
        setThreads(prev => prev.map(t => t.id === clientThread.id ? res.data : t));
      } else {
        setMessages([])
      }
    } else {
      // Fetch full messages for this thread
      const res = await getThreadMessages(clientThread.id)
      if (res.success && res.data) {
        setMessages(res.data.messages || [])
      }
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeThread) return

    setIsSending(true)

    try {
      let targetThreadId = activeThread.id;
      let actualClientId = activeThread.clientId;

      // If it's a virtual thread, we need to create it first
      if (activeThread.isVirtual) {
        const createRes = await getOrCreateClientThread(tenantId, actualClientId);
        if (createRes.success && createRes.data) {
          targetThreadId = createRes.data.id;
          setActiveThread(createRes.data);
          
          setThreads(prev => prev.map(t => {
            if (t.id === activeThread.id) {
              return createRes.data;
            }
            return t;
          }));
        } else {
          alert("Sohbet oluşturulamadı");
          setIsSending(false);
          return;
        }
      }

      // Optimistic UI update
      const tempMsg = {
        id: "temp-" + Date.now(),
        content: newMessage,
        senderId: adminId,
        createdAt: new Date().toISOString(),
        isEmail: !!activeThread.leadId
      };
      
      setMessages(prev => [...prev, tempMsg]);
      setNewMessage("");

      if (activeThread.leadId) {
        try {
          const res = await sendEmailMessageToLead(targetThreadId, tempMsg.content);
          if (res && res.id) {
            setMessages(prev => prev.map(m => m.id === tempMsg.id ? res : m));
            setThreads(prev => prev.map(t => t.id === targetThreadId ? { ...t, messages: [res, ...(t.messages || [])] } : t));
          }
        } catch (e) {
          console.error(e);
          alert("Email gönderilemedi.");
        }
      } else {
        const res = await sendChatMessage({
          threadId: targetThreadId,
          senderId: adminId,
          content: tempMsg.content,
        });

        if (res.success && res.data) {
          setMessages(prev => prev.map(m => m.id === tempMsg.id ? res.data : m));
          setThreads(prev => prev.map(t => t.id === targetThreadId ? { ...t, messages: [res.data, ...(t.messages || [])] } : t));
        } else {
          alert("Mesaj gönderilemedi.");
        }
      }
    } catch (error) {
      console.error(error);
      alert("Bir hata oluştu");
    } finally {
      setIsSending(false)
    }
  }

  const handleDelete = async (msgId: string) => {
    if (!confirm("Bu mesajı silmek istediğinize emin misiniz?")) return;
    
    setMessages(prev => prev.filter(m => m.id !== msgId));
    const res = await deleteChatMessage(msgId, adminId);
    if (!res.success) {
      alert(res.error || "Mesaj silinemedi");
      // Optionally re-fetch thread messages if optimistic update fails
      if (activeThread && !activeThread.isVirtual) {
        const fresh = await getThreadMessages(activeThread.id);
        if (fresh.success && fresh.data) {
          setMessages(fresh.data.messages || []);
        }
      }
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
    
    const oldMessages = [...messages];
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: editContent } : m));
    setEditingMessageId(null);
    
    const res = await updateChatMessage(msgId, adminId, editContent);
    if (!res.success) {
      alert(res.error || "Mesaj güncellenemedi");
      setMessages(oldMessages); // revert
    }
  }

  const filteredThreads = threads.filter(t => {
    const name = (t.client?.name || t.lead?.name || "").toLowerCase();
    const email = (t.client?.email || t.lead?.email || "").toLowerCase();
    return name.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase());
  })

  return (
    <div className="p-8 max-w-[1600px] mx-auto h-[calc(100vh-100px)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-['Outfit'] text-white flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-[#8B5CF6]" />
          Müşteri Mesajları
        </h1>
        <p className="text-slate-400 mt-2">Tüm müşterilerinizle olan iletişimlerinizi buradan yönetin.</p>
      </div>

      <div className="flex-1 bg-[#0A0A0F] border border-white/[0.05] rounded-2xl flex overflow-hidden shadow-lg">
        
        {/* Left Sidebar (Clients/Threads) */}
        <div className="w-80 border-r border-white/[0.05] flex flex-col bg-[#131B2A]/50">
          <div className="p-4 border-b border-white/[0.05]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Müşteri ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0A0A0F] border border-white/[0.05] rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredThreads.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                Kayıtlı mesaj veya müşteri bulunamadı.
              </div>
            ) : (
              filteredThreads.map(thread => {
                const lastMsg = thread.messages && thread.messages.length > 0 ? thread.messages[0] : null;
                const isActive = activeThread?.id === thread.id;
                
                return (
                  <div 
                    key={thread.id} 
                    onClick={() => handleSelectThread(thread)}
                    className={`p-4 border-b border-white/[0.02] cursor-pointer transition-colors ${
                      isActive ? 'bg-[#8B5CF6]/10 border-l-2 border-l-[#8B5CF6]' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-[#8B5CF6]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <h4 className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-slate-200'}`}>
                            {thread.client?.name || thread.client?.email || thread.lead?.name || thread.lead?.email || 'Bilinmeyen'}
                            {thread.leadId && <span className="ml-2 text-[10px] bg-slate-800 text-slate-300 px-1 py-0.5 rounded">Lead</span>}
                          </h4>
                          {lastMsg && (
                            <span className="text-[10px] text-slate-500 flex-shrink-0 ml-2">
                              {new Date(lastMsg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate">
                          {lastMsg ? lastMsg.content : 'Henüz mesaj yok'}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right Chat Area */}
        <div className="flex-1 flex flex-col bg-[#0A0A0F]">
          {!activeThread ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
              <MessageSquare className="w-16 h-16 mb-4 opacity-10" />
              <p>Sohbeti görüntülemek için soldan bir müşteri seçin.</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="h-16 border-b border-white/[0.05] bg-[#131B2A]/80 px-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-[#8B5CF6]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      {activeThread.client?.name || activeThread.client?.email || activeThread.lead?.name || activeThread.lead?.email}
                      {activeThread.leadId && <span className="ml-2 text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">Lead (Email)</span>}
                    </h3>
                    <p className="text-xs text-slate-400">{activeThread.client?.email || activeThread.lead?.email}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500">
                    <p>Henüz mesaj yok. Görüşmeyi başlatın!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.senderId === adminId;
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
                              <div className={`text-[10px] mt-2 flex justify-end items-center gap-1 ${isMine ? 'text-white/70' : 'text-slate-500'}`}>
                                {msg.isEmail && <Mail className="w-3 h-3" />}
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
                    placeholder={`${activeThread.client?.name || activeThread.lead?.name} için mesaj yazın...`}
                    className="flex-1 bg-[#0A0A0F] border border-white/[0.05] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  />
                  <button 
                    type="submit" 
                    disabled={isSending || !newMessage.trim()}
                    className="p-3 rounded-xl bg-[#8B5CF6] text-white hover:bg-[#7C3AED] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                  >
                    {activeThread.leadId ? <Mail className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
