'use client'

import { useState } from 'react'
import { LifeBuoy, Plus, Search, MessageSquare, Clock, ArrowRight } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

const localDict = {
  tr: {
    title: 'Destek Merkezi',
    subtitle: 'Yardıma mı ihtiyacınız var? Taleplerinizi buradan yönetebilirsiniz.',
    newRequest: 'Yeni Talep',
    all: 'Tümü',
    open: 'Açık',
    solved: 'Çözüldü',
    searchPlaceholder: 'Talep ara...',
    notFound: 'Kayıt Bulunamadı',
    notFoundDesc: 'Arama kriterlerinize uygun destek talebi bulunmuyor.',
    ticketInfo: 'Talep Bilgisi',
    priority: 'Öncelik',
    status: 'Durum',
    detail: 'Detay',
    priorityMapping: {
      'Yüksek': 'Yüksek',
      'Normal': 'Normal',
      'Düşük': 'Düşük'
    },
    statusMapping: {
      'OPEN': 'Açık',
      'CLOSED': 'Çözüldü'
    }
  },
  en: {
    title: 'Support Center',
    subtitle: 'Need help? You can manage your tickets here.',
    newRequest: 'New Ticket',
    all: 'All',
    open: 'Open',
    solved: 'Solved',
    searchPlaceholder: 'Search tickets...',
    notFound: 'No Tickets Found',
    notFoundDesc: 'No support tickets found matching your search criteria.',
    ticketInfo: 'Ticket Info',
    priority: 'Priority',
    status: 'Status',
    detail: 'Detail',
    priorityMapping: {
      'Yüksek': 'High',
      'Normal': 'Normal',
      'Düşük': 'Low'
    },
    statusMapping: {
      'OPEN': 'Open',
      'CLOSED': 'Resolved'
    }
  },
  de: {
    title: 'Support-Center',
    subtitle: 'Benötigen Sie Hilfe? Sie können Ihre Tickets hier verwalten.',
    newRequest: 'Neues Ticket',
    all: 'Alle',
    open: 'Offen',
    solved: 'Gelöst',
    searchPlaceholder: 'Tickets suchen...',
    notFound: 'Keine Tickets gefunden',
    notFoundDesc: 'Keine Support-Tickets gefunden, die Ihren Suchkriterien entsprechen.',
    ticketInfo: 'Ticket-Info',
    priority: 'Priorität',
    status: 'Status',
    detail: 'Details',
    priorityMapping: {
      'Yüksek': 'Hoch',
      'Normal': 'Normal',
      'Düşük': 'Niedrig'
    },
    statusMapping: {
      'OPEN': 'Offen',
      'CLOSED': 'Gelöst'
    }
  }
}

import { createTicket, evaluateTicketPriority, addTicketMessage } from '@/app/actions/ticket'
import { useRouter } from 'next/navigation'
import { Bot, Sparkles, X } from 'lucide-react'

export default function ClientSupportClient({ 
  initialTickets = [], 
  clientId, 
  tenantId 
}: { 
  initialTickets?: any[], 
  clientId?: string, 
  tenantId?: string 
}) {
  const { language } = useLanguage()
  const dict = localDict[language] || localDict.tr
  const router = useRouter()
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "OPEN" | "CLOSED">("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: "", description: "", priority: "MEDIUM" });
  
  // Ticket detail state
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [messageContent, setMessageContent] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  // AI Evaluation states
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{ priority: string, reason: string } | null>(null);



  const handleEvaluate = async () => {
    if (!newTicket.description || newTicket.description.length < 5) return;
    setIsEvaluating(true);
    const result = await evaluateTicketPriority(newTicket.description);
    setAiSuggestion(result);
    setNewTicket(prev => ({ ...prev, priority: result.priority }));
    setIsEvaluating(false);
  };

  // Map DB tickets to UI format
  const dbTickets = initialTickets.map(t => ({
    ...t,
    lastUpdate: new Date(t.updatedAt).toLocaleDateString()
  }));

  const filteredTickets = dbTickets.filter(t => {
    const matchesSearch = t.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = 
      activeTab === "ALL" ? true :
      activeTab === "OPEN" ? t.status === "OPEN" :
      t.status === "CLOSED";
    return matchesSearch && matchesTab;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !tenantId) return;
    setIsSubmitting(true);
    const res = await createTicket({
      tenantId,
      clientId,
      subject: newTicket.subject,
      description: newTicket.description,
      priority: newTicket.priority
    });
    setIsSubmitting(false);
    if (res.success) {
      setIsModalOpen(false);
      setNewTicket({ subject: "", description: "", priority: "MEDIUM" });
      setAiSuggestion(null);
      router.refresh();
    } else {
      alert("Hata: " + res.error);
    }
  };

  const handleSendTicketMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() || !selectedTicket || !clientId) return;
    setIsSendingMessage(true);
    const res = await addTicketMessage({
      ticketId: selectedTicket.id,
      senderId: clientId,
      content: messageContent,
    });
    setIsSendingMessage(false);
    if (res.success) {
      setMessageContent("");
      // Update local state instead of doing full refresh for speed, or just refresh and fetch
      router.refresh();
      setSelectedTicket({
        ...selectedTicket,
        messages: [...(selectedTicket.messages || []), res.data]
      });
    } else {
      alert("Hata: " + res.error);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black font-['Outfit'] text-slate-900 flex items-center gap-3">
            <LifeBuoy className="w-8 h-8 text-purple-600" />
            {dict.title}
          </h1>
          <p className="text-slate-600 mt-2 font-medium">{dict.subtitle}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-md shadow-purple-600/20 cursor-pointer">
          <Plus className="w-5 h-5" />
          {dict.newRequest}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs">
        <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200 w-full sm:w-auto">
          {["ALL", "OPEN", "CLOSED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab 
                  ? "bg-purple-600 text-white shadow-xs" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-white"
              }`}
            >
              {tab === "ALL" ? dict.all : tab === "OPEN" ? dict.open : dict.solved}
            </button>
          ))}
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder={dict.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors shadow-2xs"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        {filteredTickets.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center border-dashed border border-slate-200 rounded-2xl m-6 bg-slate-50">
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 font-['Outfit']">{dict.notFound}</h3>
            <p className="text-slate-600 text-center max-w-md text-sm">
              {dict.notFoundDesc}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">{dict.ticketInfo}</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">{dict.priority}</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">{dict.status}</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">{dict.detail}</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket, i) => {
                  const localizedPriority = dict.priorityMapping[ticket.priority as keyof typeof dict.priorityMapping] || ticket.priority
                  const localizedStatus = dict.statusMapping[ticket.status as keyof typeof dict.statusMapping] || ticket.status
                  return (
                    <tr key={ticket.id} onClick={() => setSelectedTicket(ticket)} className={`group hover:bg-slate-50 transition-colors cursor-pointer ${i !== filteredTickets.length - 1 ? 'border-b border-slate-100' : ''}`}>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ticket.status === 'OPEN' ? 'bg-purple-50 text-purple-600 border border-purple-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                            <MessageSquare className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-purple-600 transition-colors">{ticket.subject}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-slate-500 font-mono">#{ticket.id.split('-')[0]}</span>
                              <span className="text-slate-400">•</span>
                              <span className="text-xs text-slate-500 flex items-center gap-1 font-medium"><Clock className="w-3 h-3" /> {ticket.lastUpdate}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                          ticket.priority === 'Yüksek' || ticket.priority === 'HIGH' || ticket.priority === 'URGENT' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          ticket.priority === 'Normal' || ticket.priority === 'MEDIUM' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {localizedPriority}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md border uppercase tracking-wider ${
                          ticket.status === 'OPEN' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {localizedStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 group-hover:text-white group-hover:bg-purple-600 transition-colors ml-auto shadow-2xs">
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-slate-900">
            <h2 className="text-xl font-bold text-slate-900 mb-6 font-['Outfit']">Yeni Destek Talebi</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Konu</label>
                <input 
                  type="text" 
                  required
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors shadow-2xs"
                  placeholder="Kısaca talebinizi özetleyin"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Öncelik Derecesi</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* URGENT */}
                  <div 
                    onClick={() => setNewTicket({...newTicket, priority: 'URGENT'})}
                    className={`cursor-pointer rounded-xl border p-3 transition-all ${
                      newTicket.priority === 'URGENT' 
                        ? 'bg-red-50 border-red-300 shadow-xs' 
                        : 'bg-white border-slate-200 hover:border-red-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${newTicket.priority === 'URGENT' ? 'bg-red-600' : 'bg-slate-400'}`}></div>
                      <span className={`text-sm font-bold ${newTicket.priority === 'URGENT' ? 'text-red-700' : 'text-slate-700'}`}>Acil</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">Sistem tamamen kapalı, iş süreci durdu.</p>
                  </div>

                  {/* HIGH */}
                  <div 
                    onClick={() => setNewTicket({...newTicket, priority: 'HIGH'})}
                    className={`cursor-pointer rounded-xl border p-3 transition-all ${
                      newTicket.priority === 'HIGH' 
                        ? 'bg-orange-50 border-orange-300 shadow-xs' 
                        : 'bg-white border-slate-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${newTicket.priority === 'HIGH' ? 'bg-orange-600' : 'bg-slate-400'}`}></div>
                      <span className={`text-sm font-bold ${newTicket.priority === 'HIGH' ? 'text-orange-700' : 'text-slate-700'}`}>Yüksek</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">Önemli fonksiyonlar bozuk ama sistem açık.</p>
                  </div>

                  {/* MEDIUM */}
                  <div 
                    onClick={() => setNewTicket({...newTicket, priority: 'MEDIUM'})}
                    className={`cursor-pointer rounded-xl border p-3 transition-all ${
                      newTicket.priority === 'MEDIUM' 
                        ? 'bg-blue-50 border-blue-300 shadow-xs' 
                        : 'bg-white border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${newTicket.priority === 'MEDIUM' ? 'bg-blue-600' : 'bg-slate-400'}`}></div>
                      <span className={`text-sm font-bold ${newTicket.priority === 'MEDIUM' ? 'text-blue-700' : 'text-slate-700'}`}>Normal</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">Sistemi engellemeyen küçük hatalar.</p>
                  </div>

                  {/* LOW */}
                  <div 
                    onClick={() => setNewTicket({...newTicket, priority: 'LOW'})}
                    className={`cursor-pointer rounded-xl border p-3 transition-all ${
                      newTicket.priority === 'LOW' 
                        ? 'bg-slate-100 border-slate-300 shadow-xs' 
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${newTicket.priority === 'LOW' ? 'bg-slate-600' : 'bg-slate-400'}`}></div>
                      <span className={`text-sm font-bold ${newTicket.priority === 'LOW' ? 'text-slate-900' : 'text-slate-700'}`}>Düşük</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">Aciliyeti olmayan yeni özellik talepleri.</p>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-1">
                  <label className="block text-sm font-semibold text-slate-700">Açıklama</label>
                  <button 
                    type="button" 
                    onClick={handleEvaluate}
                    disabled={isEvaluating || newTicket.description.length < 5}
                    className="flex items-center gap-1.5 text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-lg font-bold transition-colors disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isEvaluating ? 'Analiz Ediliyor...' : 'Yapay Zeka ile Değerlendir'}
                  </button>
                </div>
                <textarea 
                  required
                  rows={4}
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors resize-none shadow-2xs"
                  placeholder="Detaylı açıklamanızı buraya yazın..."
                />
              </div>

              {aiSuggestion && (
                <div className="bg-purple-50 border border-purple-200 p-3 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                  <Bot className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-purple-900 mb-0.5">Yapay Zeka Önerisi</h4>
                    <p className="text-xs text-slate-700">Açıklamanız analiz edildi ve önceliğiniz otomatik olarak <span className="font-bold text-slate-900">{dict.priorityMapping[aiSuggestion.priority as keyof typeof dict.priorityMapping] || aiSuggestion.priority}</span> seviyesine ayarlandı.</p>
                    <p className="text-xs text-slate-500 italic mt-1">Neden: {aiSuggestion.reason}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-end gap-3 mt-8">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors font-semibold"
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal / Panel */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-end z-50">
          <div className="w-full max-w-xl bg-white h-full flex flex-col shadow-2xl border-l border-slate-200 animate-in slide-in-from-right text-slate-900">
            <div className="p-6 border-b border-slate-200 flex justify-between items-start bg-slate-50">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2 font-['Outfit']">{selectedTicket.subject}</h2>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border ${selectedTicket.priority === 'Yüksek' || selectedTicket.priority === 'URGENT' || selectedTicket.priority === 'HIGH' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                    {dict.priorityMapping[selectedTicket.priority as keyof typeof dict.priorityMapping] || selectedTicket.priority}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${selectedTicket.status === 'OPEN' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                    {dict.statusMapping[selectedTicket.status as keyof typeof dict.statusMapping] || selectedTicket.status}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">#{selectedTicket.id.split('-')[0]}</span>
                </div>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors shadow-2xs">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-700 font-bold text-sm border border-blue-200">
                  {selectedTicket.client?.name?.[0]?.toUpperCase() || 'C'}
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 w-full shadow-2xs">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-sm text-slate-900">{selectedTicket.client?.name || 'Müşteri'}</span>
                    <span className="text-xs text-slate-500 font-medium">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{selectedTicket.description}</p>
                </div>
              </div>

              {selectedTicket.messages?.map((msg: any) => {
                const isAdmin = msg.senderId !== clientId;
                return (
                  <div key={msg.id} className={`flex gap-4 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm ${isAdmin ? 'bg-purple-600' : 'bg-blue-600'}`}>
                      {msg.sender?.name?.[0]?.toUpperCase() || (isAdmin ? 'S' : 'C')}
                    </div>
                    <div className={`border rounded-2xl p-4 w-full max-w-[85%] shadow-2xs ${isAdmin ? 'bg-purple-50 border-purple-200 rounded-tr-none' : 'bg-white border-slate-200 rounded-tl-none'}`}>
                      <div className={`flex items-center mb-2 gap-2 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                        <span className="font-bold text-sm text-slate-900">{msg.sender?.name || (isAdmin ? 'StarWebFlow Ekibi' : 'Müşteri')}</span>
                        <span className="text-xs text-slate-500 font-medium">{new Date(msg.createdAt).toLocaleString()}</span>
                      </div>
                      <p className={`text-sm whitespace-pre-wrap leading-relaxed ${isAdmin ? 'text-purple-950 text-right' : 'text-slate-700'}`}>{msg.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-6 bg-white border-t border-slate-200">
              <form onSubmit={handleSendTicketMessage} className="flex flex-col gap-3">
                <textarea 
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Mesajınızı yazın..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                  rows={3}
                />
                <div className="flex justify-end">
                  <button 
                    type="submit" 
                    disabled={isSendingMessage || !messageContent.trim()}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl transition-colors shadow-xs disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSendingMessage ? 'Gönderiliyor...' : 'Yanıt Gönder'}
                    {!isSendingMessage && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
