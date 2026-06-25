'use client'

import { useState } from 'react'
import { FileSignature, Search, Download, ExternalLink, PenTool, Eye } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { updateContractStatus } from '@/app/actions/contract'
import ReactMarkdown from 'react-markdown'

function renderMarkdownToHtmlSimple(md: string): string {
  if (!md) return "";
  
  let html = md
    // Headers
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4 text-slate-900 border-b pb-2">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-5 mb-3 text-slate-800 border-b pb-1">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2 text-slate-700">$1</h3>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Lists
    .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc my-1">$1</li>')
    // Line breaks
    .replace(/\n/g, '<br/>');

  return html;
}

export const handlePrintContract = (contract: any) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const contentHtml = contract.content || "";
  
  const docType = contract.type || "LASTENHEFT";
  const docNo = contract.contractNo || contract.id || "TASLAK-001";
  const dateStr = contract.createdAt ? new Date(contract.createdAt).toLocaleDateString('tr-TR') : new Date().toLocaleDateString('tr-TR');
  const validUntilStr = contract.validUntil ? new Date(contract.validUntil).toLocaleDateString('tr-TR') : 'Süresiz';
  const clientName = contract.clientName || 'Müşteri';
  const clientEmail = contract.clientEmail || '-';
  const valStr = contract.value ? `${Number(contract.value).toLocaleString('tr-TR')} ${contract.currency || 'TRY'}` : 'Belirtilmedi';

  printWindow.document.write(`
    <html>
      <head>
        <title>${contract.title || 'Sözleşme'}</title>
        <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,500&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            background: #ffffff;
            color: #1e293b;
            margin: 0;
            padding: 0;
          }
          .font-signature {
            font-family: 'Playfair Display', serif;
            font-style: italic;
          }
          @media print {
            body {
              background: #ffffff;
              color: #000000;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body class="p-12 max-w-4xl mx-auto">
        <div class="no-print mb-8 flex justify-end gap-3 bg-slate-100 p-4 rounded-xl border border-slate-200">
          <button onclick="window.print()" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors cursor-pointer shadow-sm">
            PDF Olarak Kaydet / Yazdır
          </button>
          <button onclick="window.close()" class="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-5 py-2.5 rounded-lg font-medium text-sm transition-colors cursor-pointer">
            Kapat
          </button>
        </div>

        <div class="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-start">
          <div>
            <h1 class="text-2xl font-bold tracking-tight text-slate-900">STARWEBFLOW</h1>
            <p class="text-xs text-slate-500 max-w-xs mt-1">Musterstr. 1, 12345 Berlin, Germany<br/>info@starwebflow.com | www.starwebflow.com</p>
          </div>
          <div class="text-right">
            <h2 class="text-3xl font-light text-slate-400 uppercase tracking-widest">${docType}</h2>
            <p class="text-xs text-slate-600 mt-2 font-mono">Belge No: ${docNo}</p>
            <p class="text-xs text-slate-600 font-mono">Tarih: ${dateStr}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-8 mb-8 text-sm bg-slate-50 p-6 rounded-xl border border-slate-200">
          <div>
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">HİZMET SAĞLAYICI</h3>
            <p class="font-semibold text-slate-800">StarWebFlow Gmbh</p>
            <p class="text-slate-600 text-xs">Musterstr. 1, 12345 Berlin</p>
            <p class="text-slate-600 text-xs">Steuernummer: 12/345/67890</p>
          </div>
          <div>
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">MÜŞTERİ / ALICI</h3>
            <p class="font-semibold text-slate-800">${clientName}</p>
            <p class="text-slate-600 text-xs">${clientEmail}</p>
            <p class="text-slate-600 text-xs">Sözleşme Tutarı: ${valStr}</p>
            <p class="text-slate-600 text-xs">Geçerlilik: ${validUntilStr}</p>
          </div>
        </div>

        <div class="prose prose-slate max-w-none text-slate-800 text-sm leading-relaxed mb-16">
          ${renderMarkdownToHtmlSimple(contentHtml)}
        </div>

        <div class="grid grid-cols-2 gap-12 pt-8 border-t border-slate-200 text-sm">
          <div class="text-center">
            <p class="text-slate-500 mb-8">Hizmet Sağlayıcı İmza</p>
            <div class="h-12 flex items-center justify-center">
              <span class="font-signature text-2xl text-blue-600">StarWebFlow</span>
            </div>
            <p class="font-semibold text-slate-800 mt-2">StarWebFlow Gmbh</p>
            <p class="text-xs text-slate-400 mt-1">Dijital Olarak İmzalandı</p>
          </div>
          <div class="text-center">
            <p class="text-slate-500 mb-8">Alıcı / Müşteri İmza</p>
            <div class="h-12 flex items-center justify-center">
              ${contract.status === 'SIGNED' || contract.status === 'signed' ? '<span class="font-signature text-2xl text-emerald-600">' + clientName + '</span>' : '<span class="text-slate-300 font-light italic">İmza Bekliyor</span>'}
            </div>
            <p class="font-semibold text-slate-800 mt-2">${clientName}</p>
            <p class="text-xs text-slate-400 mt-1">
              ${contract.status === 'SIGNED' || contract.status === 'signed' ? 'Dijital Olarak Onaylandı' : 'İmza Bekliyor'}
            </p>
          </div>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
};

const localDict = {
  tr: {
    title: 'Sözleşmelerim',
    subtitle: 'Gizlilik, hizmet ve proje sözleşmelerinizi yönetin ve onaylayın.',
    pendingApproval: 'Onay Bekleyen',
    activeContracts: 'Aktif Sözleşmeler',
    all: 'Tümü',
    pending: 'Bekleyen',
    approved: 'Onaylanan',
    searchPlaceholder: 'Sözleşme ara...',
    notFound: 'Sözleşme Bulunamadı',
    notFoundDesc: 'Kayıtlı sözleşmeniz bulunmuyor.',
    contractName: 'Sözleşme Adı',
    status: 'Durum',
    actions: 'İşlemler',
    sign: 'İmzala',
    view: 'Görüntüle',
    pcs: 'Adet',
    statusMapping: {
      'İmza Bekliyor': 'İmza Bekliyor',
      'Onaylandı': 'Onaylandı',
      'PENDING': 'İmza Bekliyor',
      'draft': 'İmza Bekliyor',
      'SIGNED': 'Onaylandı'
    }
  },
  en: {
    title: 'My Contracts',
    subtitle: 'Manage and approve your privacy, service, and project contracts.',
    pendingApproval: 'Pending Approval',
    activeContracts: 'Active Contracts',
    all: 'All',
    pending: 'Pending',
    approved: 'Approved',
    searchPlaceholder: 'Search contracts...',
    notFound: 'No Contracts Found',
    notFoundDesc: 'You have no registered contracts.',
    contractName: 'Contract Name',
    status: 'Status',
    actions: 'Actions',
    sign: 'Sign',
    view: 'View',
    pcs: 'pcs',
    statusMapping: {
      'İmza Bekliyor': 'Awaiting Signature',
      'Onaylandı': 'Approved',
      'PENDING': 'Awaiting Signature',
      'draft': 'Awaiting Signature',
      'SIGNED': 'Approved'
    }
  },
  de: {
    title: 'Meine Verträge',
    subtitle: 'Verwalten und genehmigen Sie Ihre Datenschutz-, Dienstleistungs- und Projektverträge.',
    pendingApproval: 'Ausstehende Genehmigung',
    activeContracts: 'Aktive Verträge',
    all: 'Alle',
    pending: 'Ausstehend',
    approved: 'Genehmigt',
    searchPlaceholder: 'Verträge suchen...',
    notFound: 'Keine Verträge gefunden',
    notFoundDesc: 'Sie haben keine registrierten Verträge.',
    contractName: 'Vertragsname',
    status: 'Status',
    actions: 'Aktionen',
    sign: 'Unterschreiben',
    view: 'Ansehen',
    pcs: 'Stk.',
    statusMapping: {
      'İmza Bekliyor': 'Unterschrift ausstehend',
      'Onaylandı': 'Genehmigt',
      'PENDING': 'Unterschrift ausstehend',
      'draft': 'Unterschrift ausstehend',
      'SIGNED': 'Genehmigt'
    }
  }
}

export default function ClientContractsClient({ initialContracts }: { initialContracts: any[] }) {
  const { language } = useLanguage()
  const dict = localDict[language] || localDict.tr
  
  const [contracts, setContracts] = useState<any[]>(initialContracts);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "APPROVED">("ALL");
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const filteredContracts = contracts.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = 
      activeTab === "ALL" ? true :
      activeTab === "PENDING" ? (c.status === "İmza Bekliyor" || c.status === "PENDING" || c.status === "draft") :
      (c.status === "Onaylandı" || c.status === "SIGNED");
    return matchesSearch && matchesTab;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold font-['Outfit'] text-white flex items-center gap-3">
            <FileSignature className="w-8 h-8 text-[#06B6D4]" />
            {dict.title}
          </h1>
          <p className="text-slate-400 mt-2">{dict.subtitle}</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 shadow-lg">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{dict.pendingApproval}</p>
          <h3 className="text-2xl font-bold text-orange-400 font-['Outfit'] flex items-center gap-2">
            {contracts.filter(c => c.status === 'İmza Bekliyor' || c.status === 'PENDING' || c.status === 'draft').length}
            <span className="text-sm font-normal text-slate-400">{dict.pcs}</span>
          </h3>
        </div>
        <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 shadow-lg">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{dict.activeContracts}</p>
          <h3 className="text-2xl font-bold text-white font-['Outfit'] flex items-center gap-2">
            {contracts.filter(c => c.status === 'Onaylandı' || c.status === 'SIGNED').length}
            <span className="text-sm font-normal text-slate-400">{dict.pcs}</span>
          </h3>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#0A0A0F] border border-white/[0.05] p-4 rounded-2xl">
        <div className="flex bg-[#131B2A] rounded-lg p-1 border border-white/[0.05] w-full sm:w-auto">
          {["ALL", "PENDING", "APPROVED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 sm:flex-none px-6 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab 
                  ? "bg-[#06B6D4] text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab === "ALL" ? dict.all : tab === "PENDING" ? dict.pending : dict.approved}
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
            className="w-full bg-[#131B2A] border border-white/[0.05] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#06B6D4] transition-colors"
          />
        </div>
      </div>

      {/* Contracts List */}
      <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl overflow-hidden shadow-lg">
        {filteredContracts.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center border-dashed border border-white/[0.05] rounded-2xl m-6">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <FileSignature className="w-8 h-8 text-slate-500" />
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
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">{dict.contractName}</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">{dict.status}</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">{dict.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredContracts.map((contract, i) => {
                  const isPending = contract.status === 'İmza Bekliyor' || contract.status === 'PENDING' || contract.status === 'draft';
                  const localizedStatus = dict.statusMapping[contract.status as keyof typeof dict.statusMapping] || contract.status;
                  return (
                    <tr key={contract.id} className={`group hover:bg-white/[0.02] transition-colors ${i !== filteredContracts.length - 1 ? 'border-b border-white/[0.05]' : ''}`}>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${!isPending ? 'bg-[#06B6D4]/10' : 'bg-orange-500/10'}`}>
                            <FileSignature className={`w-5 h-5 ${!isPending ? 'text-[#06B6D4]' : 'text-orange-400'}`} />
                          </div>
                          <div>
                            <p className="font-bold text-white">{contract.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">ID: {contract.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md border uppercase tracking-wider ${
                          !isPending ? 'bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                        }`}>
                          {localizedStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => { setSelectedContract(contract); setIsViewModalOpen(true); }}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            {dict.view}
                          </button>
                          {isPending && (
                            <button 
                              onClick={() => { setSelectedContract(contract); setIsSignModalOpen(true); }}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#06B6D4] hover:bg-cyan-400 text-white text-xs font-bold transition-colors shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                            >
                              <PenTool className="w-4 h-4" />
                              {dict.sign}
                            </button>
                          )}
                          <button 
                            onClick={() => handlePrintContract(contract)}
                            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors" 
                            title="PDF İndir"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* E-Signature Modal */}
      {isSignModalOpen && selectedContract && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><PenTool className="w-5 h-5 text-[#06B6D4]" /> Güvenli E-İmza</h3>
              <button onClick={() => setIsSignModalOpen(false)} className="text-[#64748B] hover:text-white p-2">✕</button>
            </div>
            <div className="p-6">
              <p className="text-sm text-[#94A3B8] mb-4">
                <strong className="text-white">{selectedContract.title}</strong> başlıklı belgeyi dijital olarak imzalamak üzeresiniz.
              </p>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 h-32 flex flex-col items-center justify-center mb-4 border-dashed cursor-crosshair">
                <span className="text-[#06B6D4] font-signature text-2xl opacity-50">Buraya imzanızı çizin...</span>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-black/40 text-[#06B6D4] focus:ring-[#06B6D4]" />
                <span className="text-xs text-[#94A3B8]">Okudum, anladım ve 5070 sayılı Elektronik İmza Kanunu kapsamında imzalamayı kabul ediyorum.</span>
              </label>
            </div>
            <div className="p-6 border-t border-white/5 flex justify-end gap-3">
              <button 
                onClick={async () => {
                  const res = await updateContractStatus(selectedContract.id, 'SIGNED');
                  if (res.success && res.data) {
                    setContracts(prev => prev.map(c => c.id === res.data.id ? res.data : c));
                  }
                  setIsSignModalOpen(false);
                  setSelectedContract(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#06B6D4] text-white font-medium text-sm hover:bg-cyan-400 transition-colors"
              >
                İmzayı Tamamla
              </button>
            </div>
          </div>
        </div>
      )}
      {/* View Contract Modal */}
      {isViewModalOpen && selectedContract && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-[#131B2A] to-black/40">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileSignature className="w-5 h-5 text-[#06B6D4]" />
                  {selectedContract.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">Sözleşme tipi: {selectedContract.type} • Belge No: {selectedContract.contractNo || selectedContract.id}</p>
              </div>
              <button 
                onClick={() => { setIsViewModalOpen(false); setSelectedContract(null); }}
                className="text-slate-400 hover:text-white p-2 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex justify-between items-center bg-white/[0.02] border border-white/[0.05] p-4 rounded-xl">
                <span className="text-sm text-slate-400">Belge Önizleme (A4 Kağıt Düzeni)</span>
                <button 
                  onClick={() => handlePrintContract(selectedContract)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#06B6D4] hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <Download className="w-4 h-4" /> Yazdır / PDF Kaydet
                </button>
              </div>

              <div className="bg-white p-8 sm:p-12 text-slate-900 shadow-2xl rounded-xl max-w-3xl mx-auto text-sm border border-slate-200" style={{ minHeight: '842px' }}>
                {/* Header */}
                <div className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-start">
                  <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">STARWEBFLOW</h1>
                    <p className="text-[10px] text-slate-500 max-w-xs mt-1">Musterstr. 1, 12345 Berlin, Germany<br/>info@starwebflow.com | www.starwebflow.com</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-2xl font-light text-slate-400 uppercase tracking-widest">{selectedContract.type}</h2>
                    <p className="text-[10px] text-slate-600 mt-2 font-mono">Belge No: {selectedContract.contractNo || selectedContract.id}</p>
                    <p className="text-[10px] text-slate-600 font-mono">Tarih: {new Date(selectedContract.createdAt || Date.now()).toLocaleDateString('tr-TR')}</p>
                  </div>
                </div>

                {/* Info Box */}
                <div className="grid grid-cols-2 gap-8 mb-8 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div>
                    <h3 className="font-bold text-slate-400 uppercase tracking-wider mb-1">HİZMET SAĞLAYICI</h3>
                    <p className="font-semibold text-slate-800">StarWebFlow Gmbh</p>
                    <p className="text-slate-600">Musterstr. 1, 12345 Berlin</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-400 uppercase tracking-wider mb-1">MÜŞTERİ / ALICI</h3>
                    <p className="font-semibold text-slate-800">{selectedContract.clientName || 'Müşteri'}</p>
                    <p className="text-slate-600">{selectedContract.clientEmail || '-'}</p>
                    {selectedContract.value && (
                      <p className="text-slate-600">Bütçe: {Number(selectedContract.value).toLocaleString('tr-TR')} {selectedContract.currency}</p>
                    )}
                  </div>
                </div>

                {/* Markdown Content */}
                <div className="prose prose-slate max-w-none text-slate-800 text-sm leading-relaxed mb-16">
                  <ReactMarkdown>{selectedContract.content}</ReactMarkdown>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-12 pt-8 border-t border-slate-200 text-xs mt-12">
                  <div className="text-center">
                    <p className="text-slate-500 mb-6">Hizmet Sağlayıcı İmza</p>
                    <span className="font-signature text-2xl text-blue-600 block">StarWebFlow</span>
                    <p className="font-semibold text-slate-800 mt-2">StarWebFlow Gmbh</p>
                    <p className="text-[10px] text-slate-400">Dijital Olarak İmzalandı</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-500 mb-6">Alıcı / Müşteri İmza</p>
                    {selectedContract.status === 'SIGNED' || selectedContract.status === 'signed' ? (
                      <>
                        <span className="font-signature text-2xl text-emerald-600 block">{selectedContract.clientName}</span>
                        <p className="font-semibold text-slate-800 mt-2">{selectedContract.clientName}</p>
                        <p className="text-[10px] text-slate-400">Dijital Olarak Onaylandı</p>
                      </>
                    ) : (
                      <>
                        <span className="text-slate-300 italic block">İmza Bekliyor</span>
                        <p className="font-semibold text-slate-800 mt-2">{selectedContract.clientName}</p>
                        <p className="text-[10px] text-slate-400">Beklemede</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-white/5 flex items-center justify-end gap-3 bg-[#0A0A0F]">
              <button 
                onClick={() => { setIsViewModalOpen(false); setSelectedContract(null); }}
                className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
              >
                Kapat
              </button>
              {(selectedContract.status === 'PENDING' || selectedContract.status === 'draft' || selectedContract.status === 'İmza Bekliyor') && (
                <button 
                  onClick={() => { setIsViewModalOpen(false); setIsSignModalOpen(true); }}
                  className="px-5 py-2.5 rounded-xl bg-[#06B6D4] text-white hover:bg-cyan-500 transition-colors text-sm font-medium flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                >
                  <PenTool className="w-4 h-4" />
                  Sözleşmeyi İmzala
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
