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
    },
    tickets: [
      { id: 'TKT-001', subject: 'Tasarım revizyonu hk.', status: 'OPEN', priority: 'Normal', lastUpdate: '2 saat önce' },
      { id: 'TKT-002', subject: 'Sunucu geçiş planlaması', status: 'CLOSED', priority: 'Yüksek', lastUpdate: 'Dün' },
      { id: 'TKT-003', subject: 'Yeni özellik talebi: Ödeme Sistemi', status: 'OPEN', priority: 'Düşük', lastUpdate: '3 gün önce' },
    ]
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
    },
    tickets: [
      { id: 'TKT-001', subject: 'Design revision request', status: 'OPEN', priority: 'Normal', lastUpdate: '2 hours ago' },
      { id: 'TKT-002', subject: 'Server migration planning', status: 'CLOSED', priority: 'Yüksek', lastUpdate: 'Yesterday' },
      { id: 'TKT-003', subject: 'New feature request: Payment System', status: 'OPEN', priority: 'Düşük', lastUpdate: '3 days ago' },
    ]
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
    },
    tickets: [
      { id: 'TKT-001', subject: 'Design-Revisionsanfrage', status: 'OPEN', priority: 'Normal', lastUpdate: 'vor 2 Stunden' },
      { id: 'TKT-002', subject: 'Server-Migrationsplanung', status: 'CLOSED', priority: 'Yüksek', lastUpdate: 'Gestern' },
      { id: 'TKT-003', subject: 'Neue Feature-Anfrage: Zahlungssystem', status: 'OPEN', priority: 'Düşük', lastUpdate: 'vor 3 Tagen' },
    ]
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

  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', content: string}[]>([
    { role: 'ai', content: 'Merhaba! Ben StarWebFlow AI asistanıyım. Projenizle ilgili (Tasarım durumu, SEO verileri vb.) bana her şeyi sorabilirsiniz.' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const newMessages = [...chatMessages, { role: 'user', content: chatInput }] as any;
    setChatMessages(newMessages);
    setChatInput('');
    
    // Simulate AI response based on keywords
    setTimeout(() => {
      let response = 'Bu konuda müşteri temsilciniz en kısa sürede size dönecektir.';
      const lower = chatInput.toLowerCase();
      if (lower.includes('tasarım') || lower.includes('aşama')) {
        response = 'Tasarım aşaması şu an %65 tamamlandı. Ana sayfa mockup onaylandı, alt sayfalar kodlanıyor.';
      } else if (lower.includes('tık') || lower.includes('seo') || lower.includes('trafik')) {
        response = 'Bu ay toplam organik trafiğiniz geçen aya göre %24 artışla 3,200 tekil ziyaretçiye ulaştı.';
      } else if (lower.includes('sosyal') || lower.includes('reklam')) {
        response = 'Aktif Meta reklamlarınız 3.2x ROAS ile çalışıyor. Yeni creative üretimleri planlandı.';
      }

      setChatMessages(prev => [...prev, { role: 'ai', content: response }]);
    }, 1000);
  };

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

  // If no DB tickets, use mock for demo, otherwise use DB
  const displayTickets = dbTickets.length > 0 ? dbTickets : [];

  const filteredTickets = displayTickets.filter(t => {
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
          <h1 className="text-3xl font-bold font-['Outfit'] text-white flex items-center gap-3">
            <LifeBuoy className="w-8 h-8 text-[#8B5CF6]" />
            {dict.title}
          </h1>
          <p className="text-slate-400 mt-2">{dict.subtitle}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(139,92,246,0.3)]">
          <Plus className="w-5 h-5" />
          {dict.newRequest}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#0A0A0F] border border-white/[0.05] p-4 rounded-2xl">
        <div className="flex bg-[#131B2A] rounded-lg p-1 border border-white/[0.05] w-full sm:w-auto">
          {["ALL", "OPEN", "CLOSED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 sm:flex-none px-6 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab 
                  ? "bg-[#8B5CF6] text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
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
            className="w-full bg-[#131B2A] border border-white/[0.05] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6] transition-colors"
          />
        </div>
      </div>

      <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl overflow-hidden shadow-lg">
        {filteredTickets.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center border-dashed border border-white/[0.05] rounded-2xl m-6">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 font-['Outfit']">{dict.notFound}</h3>
            <p className="text-slate-400 text-center max-w-md">
              {dict.notFoundDesc}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.05] bg-[#131B2A]/50">
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
                    <tr key={ticket.id} onClick={() => setSelectedTicket(ticket)} className={`group hover:bg-white/[0.02] transition-colors cursor-pointer ${i !== filteredTickets.length - 1 ? 'border-b border-white/[0.05]' : ''}`}>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ticket.status === 'OPEN' ? 'bg-[#8B5CF6]/10' : 'bg-slate-500/10'}`}>
                            <MessageSquare className={`w-5 h-5 ${ticket.status === 'OPEN' ? 'text-[#8B5CF6]' : 'text-slate-400'}`} />
                          </div>
                          <div>
                            <p className="font-bold text-white group-hover:text-[#8B5CF6] transition-colors">{ticket.subject}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-slate-500 font-mono">{ticket.id}</span>
                              <span className="text-slate-600">•</span>
                              <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {ticket.lastUpdate}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                          ticket.priority === 'Yüksek' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                          ticket.priority === 'Normal' ? 'bg-[#4F8EF7]/10 text-[#4F8EF7] border-[#4F8EF7]/20' :
                          'bg-slate-500/10 text-slate-400 border-slate-500/20'
                        }`}>
                          {localizedPriority}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md border uppercase tracking-wider ${
                          ticket.status === 'OPEN' ? 'bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {localizedStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#8B5CF6] transition-colors ml-auto shadow-sm">
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#131B2A] border border-white/[0.05] rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6 font-['Outfit']">Yeni Destek Talebi</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Konu</label>
                <input 
                  type="text" 
                  required
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                  className="w-full bg-[#0A0A0F] border border-white/[0.05] rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  placeholder="Kısaca talebinizi özetleyin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Öncelik Derecesi</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* URGENT */}
                  <div 
                    onClick={() => setNewTicket({...newTicket, priority: 'URGENT'})}
                    className={`cursor-pointer rounded-xl border p-3 transition-all ${
                      newTicket.priority === 'URGENT' 
                        ? 'bg-red-500/10 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]' 
                        : 'bg-[#131B2A] border-white/[0.05] hover:border-red-500/30 hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${newTicket.priority === 'URGENT' ? 'bg-red-500' : 'bg-slate-600'}`}></div>
                      <span className={`text-sm font-bold ${newTicket.priority === 'URGENT' ? 'text-red-400' : 'text-slate-300'}`}>Acil</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">Sistem tamamen kapalı, iş süreci durdu (Örn: Site çöktü, ödeme alınamıyor).</p>
                  </div>

                  {/* HIGH */}
                  <div 
                    onClick={() => setNewTicket({...newTicket, priority: 'HIGH'})}
                    className={`cursor-pointer rounded-xl border p-3 transition-all ${
                      newTicket.priority === 'HIGH' 
                        ? 'bg-orange-500/10 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.15)]' 
                        : 'bg-[#131B2A] border-white/[0.05] hover:border-orange-500/30 hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${newTicket.priority === 'HIGH' ? 'bg-orange-500' : 'bg-slate-600'}`}></div>
                      <span className={`text-sm font-bold ${newTicket.priority === 'HIGH' ? 'text-orange-400' : 'text-slate-300'}`}>Yüksek</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">Önemli fonksiyonlar bozuk ama sistem açık (Örn: İletişim formu çalışmıyor).</p>
                  </div>

                  {/* MEDIUM */}
                  <div 
                    onClick={() => setNewTicket({...newTicket, priority: 'MEDIUM'})}
                    className={`cursor-pointer rounded-xl border p-3 transition-all ${
                      newTicket.priority === 'MEDIUM' 
                        ? 'bg-[#4F8EF7]/10 border-[#4F8EF7]/50 shadow-[0_0_15px_rgba(79,142,247,0.15)]' 
                        : 'bg-[#131B2A] border-white/[0.05] hover:border-[#4F8EF7]/30 hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${newTicket.priority === 'MEDIUM' ? 'bg-[#4F8EF7]' : 'bg-slate-600'}`}></div>
                      <span className={`text-sm font-bold ${newTicket.priority === 'MEDIUM' ? 'text-[#4F8EF7]' : 'text-slate-300'}`}>Normal</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">Sistemi engellemeyen küçük hatalar (Örn: Metin, görsel veya renk değişimi).</p>
                  </div>

                  {/* LOW */}
                  <div 
                    onClick={() => setNewTicket({...newTicket, priority: 'LOW'})}
                    className={`cursor-pointer rounded-xl border p-3 transition-all ${
                      newTicket.priority === 'LOW' 
                        ? 'bg-slate-500/20 border-slate-400/50' 
                        : 'bg-[#131B2A] border-white/[0.05] hover:border-slate-400/30 hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${newTicket.priority === 'LOW' ? 'bg-slate-400' : 'bg-slate-600'}`}></div>
                      <span className={`text-sm font-bold ${newTicket.priority === 'LOW' ? 'text-slate-300' : 'text-slate-400'}`}>Düşük</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">Aciliyeti olmayan yeni özellik talepleri veya geliştirme fikirleri.</p>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-1">
                  <label className="block text-sm font-medium text-slate-400">Açıklama</label>
                  <button 
                    type="button" 
                    onClick={handleEvaluate}
                    disabled={isEvaluating || newTicket.description.length < 5}
                    className="flex items-center gap-1.5 text-xs bg-[#8B5CF6]/20 text-[#8B5CF6] hover:bg-[#8B5CF6]/30 px-3 py-1.5 rounded-md font-bold transition-colors disabled:opacity-50"
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
                  className="w-full bg-[#0A0A0F] border border-white/[0.05] rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#8B5CF6] transition-colors resize-none"
                  placeholder="Detaylı açıklamanızı buraya yazın..."
                />
              </div>

              {aiSuggestion && (
                <div className="bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 p-3 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                  <Bot className="w-5 h-5 text-[#8B5CF6] mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-[#8B5CF6] mb-0.5">Yapay Zeka Önerisi</h4>
                    <p className="text-xs text-slate-300">Açıklamanız analiz edildi ve önceliğiniz otomatik olarak <span className="font-bold text-white">{dict.priorityMapping[aiSuggestion.priority as keyof typeof dict.priorityMapping] || aiSuggestion.priority}</span> seviyesine ayarlandı.</p>
                    <p className="text-xs text-slate-400 italic mt-1">Neden: {aiSuggestion.reason}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-end gap-3 mt-8">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors font-medium"
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(139,92,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-50">
          <div className="w-full max-w-xl bg-[#131B2A] h-full flex flex-col shadow-2xl border-l border-white/[0.05] animate-in slide-in-from-right">
            <div className="p-6 border-b border-white/[0.05] flex justify-between items-start bg-[#0A0A0F]">
              <div>
                <h2 className="text-xl font-bold text-white mb-2 font-['Outfit']">{selectedTicket.subject}</h2>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border ${selectedTicket.priority === 'Yüksek' || selectedTicket.priority === 'URGENT' || selectedTicket.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-[#4F8EF7]/10 text-[#4F8EF7] border-[#4F8EF7]/20'}`}>
                    {dict.priorityMapping[selectedTicket.priority as keyof typeof dict.priorityMapping] || selectedTicket.priority}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${selectedTicket.status === 'OPEN' ? 'bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                    {dict.statusMapping[selectedTicket.status as keyof typeof dict.statusMapping] || selectedTicket.status}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">#{selectedTicket.id.split('-')[0]}</span>
                </div>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#131B2A]">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                  {selectedTicket.client?.name?.[0]?.toUpperCase() || 'C'}
                </div>
                <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl rounded-tl-none p-4 w-full">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-sm text-white">{selectedTicket.client?.name || 'Müşteri'}</span>
                    <span className="text-xs text-slate-500">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap">{selectedTicket.description}</p>
                </div>
              </div>

              {selectedTicket.messages?.map((msg: any) => {
                const isAdmin = msg.senderId !== clientId;
                return (
                  <div key={msg.id} className={`flex gap-4 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm ${isAdmin ? 'bg-[#8B5CF6]' : 'bg-white/10'}`}>
                      {msg.sender?.name?.[0]?.toUpperCase() || (isAdmin ? 'S' : 'C')}
                    </div>
                    <div className={`border rounded-2xl p-4 w-full max-w-[85%] ${isAdmin ? 'bg-[#8B5CF6]/10 border-[#8B5CF6]/20 rounded-tr-none' : 'bg-[#0A0A0F] border-white/[0.05] rounded-tl-none'}`}>
                      <div className={`flex items-center mb-2 gap-2 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                        <span className="font-bold text-sm text-white">{msg.sender?.name || (isAdmin ? 'StarWebFlow Ekibi' : 'Müşteri')}</span>
                        <span className="text-xs text-slate-500">{new Date(msg.createdAt).toLocaleString()}</span>
                      </div>
                      <p className={`text-sm whitespace-pre-wrap ${isAdmin ? 'text-slate-200 text-right' : 'text-slate-300'}`}>{msg.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-6 bg-[#0A0A0F] border-t border-white/[0.05]">
              <form onSubmit={handleSendTicketMessage} className="flex flex-col gap-3">
                <textarea 
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Mesajınızı yazın..."
                  className="w-full bg-[#131B2A] border border-white/[0.05] rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6] transition-colors resize-none"
                  rows={3}
                />
                <div className="flex justify-end">
                  <button 
                    type="submit" 
                    disabled={isSendingMessage || !messageContent.trim()}
                    className="px-6 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(139,92,246,0.3)] disabled:opacity-50 flex items-center gap-2"
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

      {/* Floating AI Chatbot Widget */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isChatOpen ? (
          <button 
            onClick={() => setIsChatOpen(true)}
            className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
          >
            <Bot className="w-6 h-6 text-white" />
          </button>
        ) : (
          <div className="bg-[#131B2A] border border-white/[0.1] rounded-2xl w-80 h-96 flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center">
              <div className="flex items-center gap-2 text-white">
                <Bot className="w-5 h-5" />
                <span className="font-bold font-['Outfit']">Proje Asistanı</span>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0A0A0F]">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white/10 text-slate-200 rounded-bl-none'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-white/[0.05] bg-[#131B2A] flex gap-2">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Bir soru sorun..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
              <button 
                onClick={handleSendMessage}
                className="w-10 h-10 bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center justify-center text-white transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
