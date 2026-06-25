'use client'

import { useState } from 'react'
import { Receipt, Search, Download, CreditCard, Eye, FileText } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import InvoicePreview from "@/components/invoices/InvoicePreview";

export const handlePrintInvoice = (companySettings: any, client: any, invoice: any) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const currencyLocale = invoice.currency === 'TRY' ? 'tr-TR' : 'de-DE';
  const formatter = new Intl.NumberFormat(currencyLocale, { style: 'currency', currency: invoice.currency || 'EUR' });
  const formatVal = (val: number) => formatter.format(Number(val));
  const formatDate = (d: any) => d ? new Date(d).toLocaleDateString('tr-TR') : '-';

  const itemsHtml = invoice.items.map((item: any) => `
    <tr class="border-b border-slate-200 text-xs">
      <td class="py-3 text-slate-800">${item.description || 'Ürün/Hizmet'}</td>
      <td class="py-3 text-right text-slate-800">${Number(item.quantity)}</td>
      <td class="py-3 text-right text-slate-800">${formatVal(Number(item.unitPrice))}</td>
      <td class="py-3 text-right font-medium text-slate-900">${formatVal(Number(item.total))}</td>
    </tr>
  `).join('');

  const logoHtml = companySettings.logo ? '<img src="' + companySettings.logo + '" alt="Logo" class="h-12 mb-4" />' : '<h1 class="text-2xl font-bold text-slate-900 mb-2">' + companySettings.name + '</h1>';
  const clientVatHtml = client.vatId ? '<p>USt-IdNr: ' + client.vatId + '</p>' : '';
  const clientTaxHtml = client.taxId ? '<p>Steuernummer: ' + client.taxId + '</p>' : '';
  const notesHtml = invoice.notes ? '<div class="mb-16 text-xs"><h4 class="font-semibold text-slate-800 mb-1">Notlar:</h4><p class="text-slate-600 whitespace-pre-wrap">' + invoice.notes + '</p></div>' : '';

  printWindow.document.write(`
    <html>
      <head>
        <title>Fatura - ${invoice.invoiceNo}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            background: #ffffff;
            color: #1e293b;
            margin: 0;
            padding: 0;
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

        <header class="flex justify-between items-start mb-16 border-b border-slate-200 pb-8">
          <div>
            ${logoHtml}
            <p class="text-xs text-slate-500 max-w-xs leading-relaxed">${companySettings.address}</p>
          </div>
          <div class="text-right">
            <h2 class="text-3xl font-light text-slate-400 uppercase tracking-widest mb-4">Fatura</h2>
            <div class="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-right font-mono">
              <span class="text-slate-500">Fatura No:</span>
              <span class="font-medium text-slate-800">${invoice.invoiceNo}</span>
              <span class="text-slate-500">Tarih:</span>
              <span class="font-medium text-slate-800">${formatDate(invoice.invoiceDate)}</span>
              <span class="text-slate-500">Hizmet Tarihi:</span>
              <span class="font-medium text-slate-800">${formatDate(invoice.deliveryDate)}</span>
              <span class="text-slate-500">Son Ödeme:</span>
              <span class="font-medium text-slate-800">${formatDate(invoice.dueDate)}</span>
            </div>
          </div>
        </header>

        <div class="mb-12 text-sm">
          <p class="text-[10px] text-slate-400 mb-2 border-b border-slate-100 pb-1 max-w-sm">${companySettings.name} • ${companySettings.address}</p>
          <h3 class="text-base font-bold text-slate-800">${client.name || 'Müşteri'}</h3>
          <p class="text-slate-600 text-xs mt-1">${client.addressStreet || ''}</p>
          <p class="text-slate-600 text-xs">${client.addressZip || ''} ${client.addressCity || ''}</p>
          <p class="text-slate-600 text-xs">${client.addressCountry || ''}</p>
          <div class="mt-4 text-xs text-slate-500">
            ${clientVatHtml}
            ${clientTaxHtml}
          </div>
        </div>

        <div class="mb-12">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b-2 border-slate-800 text-slate-800 text-xs font-semibold">
                <th class="py-3 w-1/2">Açıklama</th>
                <th class="py-3 text-right">Miktar</th>
                <th class="py-3 text-right">Birim Fiyat</th>
                <th class="py-3 text-right">Toplam</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>

        <div class="flex justify-end mb-16">
          <div class="w-1/3 text-xs">
            <div class="flex justify-between py-2 text-slate-600">
              <span>Net Tutar:</span>
              <span>${formatVal(invoice.netAmount)}</span>
            </div>
            <div class="flex justify-between py-2 text-slate-600">
              <span>KDV (${Number(invoice.taxRate)}%):</span>
              <span>${formatVal(invoice.taxAmount)}</span>
            </div>
            <div class="flex justify-between py-3 border-t-2 border-slate-800 font-bold text-sm text-slate-900 mt-2">
              <span>Genel Toplam:</span>
              <span>${formatVal(invoice.grossAmount)}</span>
            </div>
          </div>
        </div>

        ${notesHtml}

        <footer class="border-t border-slate-200 pt-8 text-[10px] text-slate-400 flex justify-between leading-relaxed">
          <div>
            <p class="font-semibold text-slate-500 mb-1">${companySettings.name}</p>
            <p>${companySettings.address}</p>
            <p>${companySettings.phone}</p>
            <p>${companySettings.email} | ${companySettings.website}</p>
          </div>
          <div>
            <p class="font-semibold text-slate-500 mb-1">Banka Bilgileri</p>
            <p>Banka: ${companySettings.bankName}</p>
            <p>IBAN: ${companySettings.iban}</p>
          </div>
          <div>
            <p class="font-semibold text-slate-500 mb-1">Vergi Bilgileri</p>
            <p>Steuernummer: ${companySettings.taxId}</p>
            <p>USt-IdNr: ${companySettings.vatId}</p>
          </div>
        </footer>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
};

const localDict = {
  tr: {
    title: 'Faturalar ve Ödemeler',
    subtitle: 'Finansal dökümlerinizi görüntüleyin, faturalarınızı indirin ve güvenle ödeme yapın.',
    totalPending: 'Toplam Bekleyen',
    lastPaid: 'Son Ödenen Fatura',
    none: 'Yok',
    all: 'Tümü',
    pending: 'Bekleyen',
    paid: 'Ödenen',
    searchPlaceholder: 'Fatura No ara...',
    notFound: 'Fatura Bulunamadı',
    notFoundDesc: 'Kayıtlı faturanız bulunmuyor.',
    invoiceNo: 'Fatura No',
    date: 'Tarih',
    amount: 'Tutar',
    status: 'Durum',
    actions: 'İşlemler',
    dueDatePrefix: 'Vade:',
    pay: 'Öde',
    statusMapping: {
      'PENDING': 'Ödenmedi',
      'PAID': 'Ödendi',
      'OVERDUE': 'Gecikmiş'
    }
  },
  en: {
    title: 'Invoices & Payments',
    subtitle: 'View your financial statements, download your invoices, and pay securely.',
    totalPending: 'Total Outstanding',
    lastPaid: 'Last Paid Invoice',
    none: 'None',
    all: 'All',
    pending: 'Pending',
    paid: 'Paid',
    searchPlaceholder: 'Search invoice no...',
    notFound: 'No Invoices Found',
    notFoundDesc: 'You have no registered invoices.',
    invoiceNo: 'Invoice No',
    date: 'Date',
    amount: 'Amount',
    status: 'Status',
    actions: 'Actions',
    dueDatePrefix: 'Due:',
    pay: 'Pay',
    statusMapping: {
      'PENDING': 'Unpaid',
      'PAID': 'Paid',
      'OVERDUE': 'Overdue'
    }
  },
  de: {
    title: 'Rechnungen & Zahlungen',
    subtitle: 'Sehen Sie Ihre Abrechnungen ein, laden Sie Ihre Rechnungen herunter und zahlen Sie sicher.',
    totalPending: 'Ausstehend Gesamt',
    lastPaid: 'Zuletzt bezahlte Rechnung',
    none: 'Keine',
    all: 'Alle',
    pending: 'Ausstehend',
    paid: 'Bezahlt',
    searchPlaceholder: 'Rechnungsnr. suchen...',
    notFound: 'Keine Rechnungen gefunden',
    notFoundDesc: 'Sie haben keine registrierten Rechnungen.',
    invoiceNo: 'Rechnungsnr.',
    date: 'Datum',
    amount: 'Betrag',
    status: 'Status',
    actions: 'Aktionen',
    dueDatePrefix: 'Fällig:',
    pay: 'Zahlen',
    statusMapping: {
      'PENDING': 'Unbezahlt',
      'PAID': 'Bezahlt',
      'OVERDUE': 'Überfällig'
    }
  }
}

export default function ClientInvoicesClient({ 
  initialInvoices, 
  tenantSettings, 
  isStripeEnabled = false 
}: { 
  initialInvoices: any[], 
  tenantSettings: any, 
  isStripeEnabled?: boolean 
}) {
  const { language } = useLanguage()
  const dict = localDict[language] || localDict.tr
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "PAID">("ALL");
  const [viewInvoice, setViewInvoice] = useState<any | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);

  const filteredInvoices = initialInvoices.filter(i => {
    const matchesSearch = i.invoiceNo?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = 
      activeTab === "ALL" ? true :
      activeTab === "PENDING" ? i.status === "PENDING" || i.status === "OVERDUE" :
      i.status === "PAID";
    return matchesSearch && matchesTab;
  });

  const getStatusBadge = (status: string) => {
    const localizedLabel = dict.statusMapping[status as keyof typeof dict.statusMapping] || status
    switch (status) {
      case "PENDING":
        return <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase">{localizedLabel}</span>;
      case "PAID":
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase">{localizedLabel}</span>;
      case "OVERDUE":
        return <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase">{localizedLabel}</span>;
      default:
        return <span className="bg-slate-500/10 text-slate-400 border border-slate-500/20 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase">{localizedLabel}</span>;
    }
  };

  const currencyLocale = language === 'tr' ? 'tr-TR' : 'de-DE'

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold font-['Outfit'] text-white flex items-center gap-3">
            <Receipt className="w-8 h-8 text-emerald-400" />
            {dict.title}
          </h1>
          <p className="text-slate-400 mt-2">{dict.subtitle}</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 shadow-lg">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{dict.totalPending}</p>
          <h3 className="text-2xl font-bold text-white font-['Outfit']">
            {new Intl.NumberFormat(currencyLocale, { style: 'currency', currency: 'TRY' }).format(
              initialInvoices.filter(i => i.status === 'PENDING' || i.status === 'OVERDUE').reduce((acc, curr) => acc + Number(curr.amount), 0)
            )}
          </h3>
        </div>
        <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 shadow-lg">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{dict.lastPaid}</p>
          <h3 className="text-2xl font-bold text-emerald-400 font-['Outfit']">
            {initialInvoices.filter(i => i.status === 'PAID').length > 0 
              ? new Intl.NumberFormat(currencyLocale, { style: 'currency', currency: 'TRY' }).format(Number(initialInvoices.filter(i => i.status === 'PAID')[0].amount))
              : dict.none}
          </h3>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#0A0A0F] border border-white/[0.05] p-4 rounded-2xl">
        <div className="flex bg-[#131B2A] rounded-lg p-1 border border-white/[0.05] w-full sm:w-auto">
          {["ALL", "PENDING", "PAID"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 sm:flex-none px-6 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab 
                  ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab === "ALL" ? dict.all : tab === "PENDING" ? dict.pending : dict.paid}
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
            className="w-full bg-[#131B2A] border border-white/[0.05] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl overflow-hidden shadow-lg">
        {filteredInvoices.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center border-dashed border border-white/[0.05] rounded-2xl m-6">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <Receipt className="w-8 h-8 text-slate-500" />
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
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">{dict.invoiceNo}</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">{dict.date}</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">{dict.amount}</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">{dict.status}</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">{dict.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice, i) => (
                  <tr key={invoice.id} className={`group hover:bg-white/[0.02] transition-colors ${i !== filteredInvoices.length - 1 ? 'border-b border-white/[0.05]' : ''}`}>
                     <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${invoice.status === 'PAID' ? 'bg-emerald-500/10' : 'bg-orange-500/10'}`}>
                          <Receipt className={`w-5 h-5 ${invoice.status === 'PAID' ? 'text-emerald-400' : 'text-orange-400'}`} />
                        </div>
                        <div>
                          <p 
                            onClick={() => setViewInvoice(invoice)}
                            className="font-bold text-white hover:text-emerald-400 transition-colors cursor-pointer"
                          >
                            {invoice.invoiceNo || 'TASLAK'}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">{dict.dueDatePrefix} {new Date(invoice.dueDate).toLocaleDateString(currencyLocale)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-slate-300">{new Date(invoice.createdAt).toLocaleDateString(currencyLocale)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-bold text-white font-['Outfit']">
                        {new Intl.NumberFormat(currencyLocale, { style: 'currency', currency: invoice.currency || 'TRY' }).format(Number(invoice.amount || invoice.grossAmount || 0))}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setViewInvoice(invoice)} 
                          className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors" 
                          title="Görüntüle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            const client = invoice.clientCompany || invoice.project?.client || {};
                            handlePrintInvoice(tenantSettings, client, {
                              ...invoice,
                              netAmount: invoice.netAmount || (Number(invoice.amount || invoice.grossAmount) / (1 + Number(invoice.taxRate || 19) / 100)),
                              taxAmount: invoice.taxAmount || (Number(invoice.amount || invoice.grossAmount) - (Number(invoice.amount || invoice.grossAmount) / (1 + Number(invoice.taxRate || 19) / 100))),
                              grossAmount: invoice.grossAmount || invoice.amount
                            });
                          }}
                          className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors" 
                          title="Faturayı İndir"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {invoice.status !== 'PAID' && (
                          <button 
                            disabled={payingId === invoice.id}
                            onClick={async () => {
                              if (!isStripeEnabled) {
                                alert(
                                  language === 'tr' 
                                    ? "Ödeme altyapısı şu an entegre edilme aşamasındadır. Lütfen faturanızı havale yoluyla ödeyiniz veya destek talebi oluşturunuz." 
                                    : "Payment infrastructure is currently being integrated. Please pay your invoice via bank transfer or contact support."
                                );
                                return;
                              }
                              try {
                                setPayingId(invoice.id);
                                const res = await fetch('/api/payments/create-checkout-session', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ invoiceId: invoice.id })
                                });
                                const data = await res.json();
                                if (data.url) {
                                  window.location.href = data.url;
                                } else {
                                  alert(data.error || 'Failed to initialize payment session');
                                }
                              } catch (err: any) {
                                alert(err.message || 'An error occurred');
                              } finally {
                                setPayingId(null);
                              }
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold transition-colors shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                          >
                            <CreditCard className="w-4 h-4" />
                            {payingId === invoice.id ? '...' : dict.pay}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Invoice Modal */}
      {viewInvoice && (() => {
        const client = viewInvoice.clientCompany || viewInvoice.project?.client || {};
        const previewProps = {
          companySettings: tenantSettings,
          client: {
            name: client.name || client.companyName || "Bilinmiyor",
            addressStreet: client.addressStreet,
            addressCity: client.addressCity,
            addressZip: client.addressZip,
            addressCountry: client.addressCountry,
            taxId: client.taxId,
            vatId: client.vatId
          },
          invoice: {
            invoiceNo: viewInvoice.invoiceNo,
            invoiceDate: new Date(viewInvoice.invoiceDate || viewInvoice.createdAt),
            deliveryDate: new Date(viewInvoice.deliveryDate || viewInvoice.createdAt),
            dueDate: new Date(viewInvoice.dueDate),
            netAmount: Number(viewInvoice.netAmount || (Number(viewInvoice.amount || viewInvoice.grossAmount || 0) / (1 + Number(viewInvoice.taxRate || 19) / 100))),
            taxRate: Number(viewInvoice.taxRate || 19),
            taxAmount: Number(viewInvoice.taxAmount || (Number(viewInvoice.amount || viewInvoice.grossAmount || 0) - (Number(viewInvoice.amount || viewInvoice.grossAmount || 0) / (1 + Number(viewInvoice.taxRate || 19) / 100)))),
            grossAmount: Number(viewInvoice.grossAmount || viewInvoice.amount || 0),
            currency: viewInvoice.currency || "EUR",
            notes: viewInvoice.notes,
            items: viewInvoice.items?.map((item: any) => ({
              description: item.description,
              quantity: Number(item.quantity),
              unitPrice: Number(item.unitPrice),
              total: Number(item.total)
            })) || [
              {
                description: viewInvoice.project?.title || "Yazılım Geliştirme Hizmeti",
                quantity: 1,
                unitPrice: Number(viewInvoice.amount || viewInvoice.grossAmount || 0) / (1 + Number(viewInvoice.taxRate || 19) / 100),
                total: Number(viewInvoice.amount || viewInvoice.grossAmount || 0) / (1 + Number(viewInvoice.taxRate || 19) / 100)
              }
            ]
          }
        };

        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] overflow-y-auto p-4 md:p-8 flex flex-col">
            <div className="flex justify-between items-center mb-6 max-w-4xl mx-auto w-full">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                Fatura: {viewInvoice.invoiceNo || 'TASLAK'}
              </h3>
              <div className="flex gap-3">
                <button 
                  onClick={() => handlePrintInvoice(tenantSettings, client, previewProps.invoice)}
                  className="px-4 py-2 bg-[#06B6D4] hover:bg-cyan-500 text-white rounded-lg text-sm transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                >
                  <Download className="w-4 h-4" /> PDF İndir
                </button>
                <button 
                  onClick={() => setViewInvoice(null)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
                >
                  Kapat
                </button>
              </div>
            </div>
            <InvoicePreview {...previewProps} />
          </div>
        );
      })()}
    </div>
  )
}
