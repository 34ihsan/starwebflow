"use client";

import { useState } from "react";
import { 
  FileText, Search, Plus, Filter, 
  CheckCircle2, Clock, AlertTriangle, Eye,
  Download, MoreVertical, CreditCard, Send, Settings, LineChart as LineChartIcon,
  Trash2
} from "lucide-react";

import { createInvoice, deleteInvoice } from "@/app/actions/invoice";
import { sendInvoiceToClient } from "@/app/actions/dispatch";
import { createClientCompany } from "@/app/actions/clientCompany";
import { updateTenantSettings } from "@/app/actions/settings";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CURRENCIES, formatCurrency } from "@/lib/utils";
import InvoicePreview from "@/components/invoices/InvoicePreview";

export const handlePrintInvoice = (companySettings: any, client: any, invoice: any, lang: 'tr' | 'de' = 'tr') => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const currencyLocale = invoice.currency === 'TRY' ? 'tr-TR' : 'de-DE';
  const formatter = new Intl.NumberFormat(currencyLocale, { style: 'currency', currency: invoice.currency || 'EUR' });
  const formatVal = (val: number) => formatter.format(Number(val));
  const formatDate = (d: any) => d ? new Date(d).toLocaleDateString('tr-TR') : '-';

  const labels = lang === 'de' ? {
    title: 'Rechnung',
    invoiceNo: 'Rechnungsnr.:',
    date: 'Rechnungsdatum:',
    deliveryDate: 'Leistungsdatum:',
    dueDate: 'Fälligkeitsdatum:',
    client: 'Empfänger',
    description: 'Beschreibung',
    quantity: 'Menge',
    unitPrice: 'Einzelpreis',
    total: 'Gesamtpreis',
    netAmount: 'Netto-Betrag:',
    vat: 'MwSt.',
    grossAmount: 'Rechnungsbetrag (Brutto):',
    bankInfo: 'Bankverbindung',
    taxInfo: 'Steuerangaben',
    bank: 'Bank:',
    notes: 'Bemerkungen:',
    saveBtn: 'Rechnung drucken / PDF speichern',
    closeBtn: 'Schließen'
  } : {
    title: 'Fatura',
    invoiceNo: 'Fatura No:',
    date: 'Tarih:',
    deliveryDate: 'Hizmet Tarihi:',
    dueDate: 'Son Ödeme:',
    client: 'Müşteri',
    description: 'Açıklama',
    quantity: 'Miktar',
    unitPrice: 'Birim Fiyat',
    total: 'Toplam',
    netAmount: 'Net Tutar:',
    vat: 'KDV',
    grossAmount: 'Genel Toplam:',
    bankInfo: 'Banka Bilgileri',
    taxInfo: 'Vergi Bilgileri',
    bank: 'Banka:',
    notes: 'Notlar:',
    saveBtn: 'PDF Olarak Kaydet / Yazdır',
    closeBtn: 'Kapat'
  };

  const itemsHtml = invoice.items.map((item: any) => `
    <tr class="border-b border-zinc-100 group text-xs text-zinc-700">
      <td class="py-4 pr-4 leading-relaxed">${item.description || (lang === 'de' ? 'Produkt/Dienstleistung' : 'Ürün/Hizmet')}</td>
      <td class="py-4 text-right tabular-nums">${Number(item.quantity)}</td>
      <td class="py-4 text-right tabular-nums">${formatVal(Number(item.unitPrice))}</td>
      <td class="py-4 text-right font-medium text-zinc-900 tabular-nums">${formatVal(Number(item.total))}</td>
    </tr>
  `).join('');

  const logoHtml = companySettings.logo ? '<img src="' + companySettings.logo + '" alt="Logo" class="h-12 w-auto mb-6 object-contain" onerror="this.style.display=\'none\'" />' : '';
  const clientVatHtml = client.vatId ? `<p>USt-IdNr.: ${client.vatId}</p>` : '';
  const clientTaxHtml = client.taxId ? `<p>Steuernummer: ${client.taxId}</p>` : '';
  
  const diffDays = invoice.dueDate && invoice.invoiceDate 
    ? Math.round((new Date(invoice.dueDate).getTime() - new Date(invoice.invoiceDate).getTime()) / (1000 * 3600 * 24))
    : 14;

  const notesHtml = invoice.notes 
    ? `<div class="mb-24 pt-4 text-[11px]"><h4 class="font-semibold text-zinc-900 mb-2 uppercase tracking-widest">${labels.notes}</h4><p class="text-zinc-600 whitespace-pre-wrap leading-loose max-w-2xl">${invoice.notes}</p></div>` 
    : (lang === 'de' ? `<div class="mb-24 text-[11px] text-zinc-500 leading-loose max-w-xl"><p>Bitte überweisen Sie den Rechnungsbetrag innerhalb von ${diffDays} Tagen auf das unten angegebene Bankkonto unter Angabe der Rechnungsnummer.</p></div>` : '<div class="mb-24"></div>');

  printWindow.document.write(`
    <html>
      <head>
        <title>${labels.title} - ${invoice.invoiceNo}</title>
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
              color: #18181b; /* zinc-900 */
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .no-print {
              display: none;
            }
            @page {
              margin: 1cm;
            }
          }
        </style>
      </head>
      <body class="p-10 sm:p-14 max-w-4xl mx-auto text-[13px] font-sans leading-relaxed relative">
        <!-- Decorative top border -->
        <div class="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-slate-800 to-zinc-600"></div>
        <div class="no-print mb-8 flex justify-end gap-3 bg-slate-100 p-4 rounded-xl border border-slate-200">
          <button onclick="window.print()" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors cursor-pointer shadow-sm">
            ${labels.saveBtn}
          </button>
          <button onclick="window.close()" class="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-5 py-2.5 rounded-lg font-medium text-sm transition-colors cursor-pointer">
            ${labels.closeBtn}
          </button>
        </div>

        <header class="flex justify-between items-start mb-20 pt-4">
          <div class="flex flex-col">
            ${logoHtml}
            ${!companySettings.logo ? `<h1 class="text-2xl font-semibold tracking-tight text-zinc-900 mb-2">${companySettings.name}</h1>` : ''}
            <p class="text-[11px] text-zinc-500 max-w-xs leading-relaxed">${companySettings.address}</p>
          </div>
          <div class="text-right">
            <h2 class="text-3xl font-light text-zinc-400 uppercase tracking-[0.25em] mb-8">${labels.title}</h2>
            <div class="grid grid-cols-[auto_auto] gap-x-6 gap-y-1.5 text-[11px] justify-end">
              <span class="text-zinc-400 text-right">${labels.invoiceNo}</span>
              <span class="font-semibold text-zinc-900 text-right">${invoice.invoiceNo}</span>
              
              <span class="text-zinc-400 text-right">${labels.date}</span>
              <span class="font-medium text-zinc-800 text-right">${formatDate(invoice.invoiceDate)}</span>
              
              <span class="text-zinc-400 text-right">${labels.deliveryDate}</span>
              <span class="font-medium text-zinc-800 text-right">${formatDate(invoice.deliveryDate)}</span>
              
              <span class="text-zinc-400 text-right">${labels.dueDate}</span>
              <span class="font-medium text-zinc-800 text-right">${formatDate(invoice.dueDate)}</span>
            </div>
          </div>
        </header>

        <div class="flex justify-between mb-20 pl-2">
          <div class="max-w-sm">
            <p class="text-[9px] text-zinc-400 mb-4 uppercase tracking-widest font-medium border-b border-zinc-200/60 inline-block pb-1">${companySettings.name} • ${companySettings.address}</p>
            <h3 class="text-[15px] font-semibold text-zinc-900 mb-1">${client.name || 'Müşteri'}</h3>
            <p class="text-zinc-600 text-xs leading-relaxed">${client.addressStreet || ''}</p>
            <p class="text-zinc-600 text-xs leading-relaxed">${client.addressZip || ''} ${client.addressCity || ''}</p>
            <p class="text-zinc-600 text-xs leading-relaxed">${client.addressCountry || ''}</p>
            <div class="mt-4 text-[10px] text-zinc-400 space-y-0.5">
              ${client.vatId ? `<p>USt-IdNr.: <span class="text-zinc-600">${client.vatId}</span></p>` : ''}
              ${client.taxId ? `<p>Steuernummer: <span class="text-zinc-600">${client.taxId}</span></p>` : ''}
            </div>
          </div>
        </div>

        <div class="mb-8">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b-2 border-zinc-900 text-zinc-900 text-[10px] uppercase tracking-widest">
                <th class="py-3 font-semibold w-[55%]">${labels.description}</th>
                <th class="py-3 font-semibold text-right">${labels.quantity}</th>
                <th class="py-3 font-semibold text-right">${labels.unitPrice}</th>
                <th class="py-3 font-semibold text-right">${labels.total}</th>
              </tr>
            </thead>
            <tbody class="text-zinc-700 text-xs">
              ${itemsHtml}
            </tbody>
          </table>
        </div>

        <div class="flex justify-end mb-20">
          <div class="w-full sm:w-[45%] md:w-[35%] pt-2">
            <div class="flex justify-between py-2 text-xs text-zinc-500">
              <span>${labels.netAmount}</span>
              <span class="tabular-nums text-zinc-800">${formatVal(invoice.netAmount)}</span>
            </div>
            <div class="flex justify-between py-2 text-xs text-zinc-500">
              <span>${labels.vat} (${Number(invoice.taxRate)}%)</span>
              <span class="tabular-nums text-zinc-800">${formatVal(invoice.taxAmount)}</span>
            </div>
            <div class="flex justify-between items-baseline py-4 border-t-2 border-zinc-900 font-bold mt-2">
              <span class="uppercase tracking-widest text-[10px] text-zinc-900 mr-4">${labels.grossAmount}</span>
              <span class="text-[17px] text-zinc-900 tabular-nums">${formatVal(invoice.grossAmount)}</span>
            </div>
          </div>
        </div>

        ${notesHtml}

        <footer class="absolute bottom-0 left-0 right-0 border-t border-zinc-200 px-10 sm:px-14 py-10 text-[9.5px] text-zinc-400 flex flex-col md:flex-row justify-between leading-loose tracking-wide">
          <div class="max-w-[30%]">
            <p class="font-semibold text-zinc-800 mb-2 uppercase tracking-widest">${companySettings.name}</p>
            <p>${companySettings.address}</p>
            <p>T: ${companySettings.phone}</p>
            <p>E: ${companySettings.email}</p>
            <p>W: ${companySettings.website}</p>
          </div>
          <div class="max-w-[30%] mt-4 md:mt-0">
            <p class="font-semibold text-zinc-800 mb-2 uppercase tracking-widest">${labels.bankInfo}</p>
            <p>${companySettings.bankName}</p>
            <p>IBAN: <span class="font-mono text-zinc-600">${companySettings.iban}</span></p>
          </div>
          <div class="max-w-[30%] mt-4 md:mt-0">
            <p class="font-semibold text-zinc-800 mb-2 uppercase tracking-widest">${labels.taxInfo}</p>
            <p>St-Nr.: <span class="font-mono text-zinc-600">${companySettings.taxId}</span></p>
            <p>USt-IdNr.: <span class="font-mono text-zinc-600">${companySettings.vatId}</span></p>
          </div>
        </footer>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
};


export default function InvoicesDashboardClient({ initialInvoices, projects, clientCompanies, tenantSettings, tenantId }: { initialInvoices: any[], projects: any[], clientCompanies: any[], tenantSettings: any, tenantId: string }) {
  const [activeTab, setActiveTab] = useState<"all" | "paid" | "pending" | "overdue">("all");
  const [invoices, setInvoices] = useState<any[]>(initialInvoices);
  const [companies, setCompanies] = useState<any[]>(clientCompanies);
  const [isAddInvoiceModalOpen, setIsAddInvoiceModalOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<any | null>(null);
  const [printLang, setPrintLang] = useState<'tr' | 'de'>('tr');
  const [searchQuery, setSearchQuery] = useState("");
  const [sending, setSending] = useState(false);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState(tenantSettings);
  const [savingSettings, setSavingSettings] = useState(false);

  const [invoiceData, setInvoiceData] = useState({
    projectId: "",
    clientCompanyId: "",
    currency: "EUR",
    taxRate: 19,
    invoiceDate: new Date().toISOString().split('T')[0],
    deliveryDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: "",
    items: [{ description: "", quantity: 1, unitPrice: 0 }]
  });

  const [newClientData, setNewClientData] = useState({
    name: "", email: "", addressStreet: "", addressCity: "", addressZip: "", addressCountry: "Germany", taxId: "", vatId: ""
  });
  
  const [isCreatingNewClient, setIsCreatingNewClient] = useState(false);
  const [loading, setLoading] = useState(false);

  // Stats
  const monthlyRevenue = invoices.filter(i => i.status === 'PAID' || i.status === 'paid').reduce((acc, curr) => acc + Number(curr.grossAmount || curr.amount || 0), 0);
  const pendingAmount = invoices.filter(i => i.status === 'PENDING' || i.status === 'draft').reduce((acc, curr) => acc + Number(curr.grossAmount || curr.amount || 0), 0);
  const overdueAmount = invoices.filter(i => i.status === 'OVERDUE' || i.status === 'overdue').reduce((acc, curr) => acc + Number(curr.grossAmount || curr.amount || 0), 0);
  
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNo?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (invoice.clientCompany?.name || invoice.project?.client?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === "all") return true;
    return invoice.status.toLowerCase() === activeTab;
  });

  const calculateTotals = () => {
    const netAmount = invoiceData.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const taxAmount = netAmount * (invoiceData.taxRate / 100);
    const grossAmount = netAmount + taxAmount;
    return { netAmount, taxAmount, grossAmount };
  };

  const handleAddItem = () => {
    setInvoiceData({ ...invoiceData, items: [...invoiceData.items, { description: "", quantity: 1, unitPrice: 0 }] });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = invoiceData.items.filter((_, i) => i !== index);
    setInvoiceData({ ...invoiceData, items: newItems });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...invoiceData.items];
    (newItems[index] as any)[field] = value;
    setInvoiceData({ ...invoiceData, items: newItems });
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!confirm("Bu faturayı tamamen silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await deleteInvoice(id, tenantId);
      if (res.success) {
        setInvoices(invoices.filter(i => i.id !== id));
        alert("Fatura başarıyla silindi.");
      } else {
        alert(res.error || "Fatura silinirken bir hata oluştu.");
      }
    } catch (err) {
      console.error(err);
      alert("Fatura silinemedi.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInvoice = async () => {
    setLoading(true);
    try {
      let finalClientId = invoiceData.clientCompanyId;

      if (isCreatingNewClient) {
        if (!newClientData.name) {
          alert("Lütfen müşteri adını girin.");
          setLoading(false);
          return;
        }
        const clientRes = await createClientCompany({
          tenantId: tenantId,
          ...newClientData
        });
        if (clientRes.success && clientRes.data) {
          finalClientId = clientRes.data.id;
          setCompanies([...companies, clientRes.data]);
        } else {
          alert("Müşteri oluşturulamadı.");
          setLoading(false);
          return;
        }
      } else if (!finalClientId) {
        alert("Lütfen bir müşteri seçin veya yeni oluşturun.");
        setLoading(false);
        return;
      }

      const { netAmount, taxAmount, grossAmount } = calculateTotals();
      
      const formattedItems = invoiceData.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice
      }));

      const res = await createInvoice({
        tenantId: tenantId,
        projectId: invoiceData.projectId || undefined,
        clientCompanyId: finalClientId,
        netAmount,
        taxRate: invoiceData.taxRate,
        taxAmount,
        grossAmount,
        currency: invoiceData.currency,
        status: 'PENDING',
        invoiceDate: new Date(invoiceData.invoiceDate),
        deliveryDate: new Date(invoiceData.deliveryDate),
        dueDate: new Date(invoiceData.dueDate),
        notes: invoiceData.notes,
        items: formattedItems
      });

      if(res.success && res.data) {
        setInvoices([res.data, ...invoices]);
        setIsAddInvoiceModalOpen(false);
        setIsPreviewMode(false);
      } else {
        alert("Fatura oluşturulamadı: " + res.error);
      }
    } catch (error) {
      console.error(error);
      alert("Bir hata oluştu.");
    }
    setLoading(false);
  };

  const renderPreview = () => {
    const { netAmount, taxAmount, grossAmount } = calculateTotals();
    const selectedClient = isCreatingNewClient ? newClientData : companies.find(c => c.id === invoiceData.clientCompanyId) || {} as any;
    
    const previewProps = {
      companySettings: tenantSettings,
      client: {
        name: selectedClient.name || "Müşteri Adı",
        addressStreet: selectedClient.addressStreet,
        addressCity: selectedClient.addressCity,
        addressZip: selectedClient.addressZip,
        addressCountry: selectedClient.addressCountry,
        taxId: selectedClient.taxId,
        vatId: selectedClient.vatId
      },
      invoice: {
        invoiceNo: "TASLAK-001",
        invoiceDate: new Date(invoiceData.invoiceDate),
        deliveryDate: new Date(invoiceData.deliveryDate),
        dueDate: new Date(invoiceData.dueDate),
        netAmount,
        taxRate: invoiceData.taxRate,
        taxAmount,
        grossAmount,
        currency: invoiceData.currency,
        notes: invoiceData.notes,
        items: invoiceData.items.map(item => ({
          description: item.description || "Ürün/Hizmet",
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice
        }))
      }
    };

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] overflow-y-auto p-4 md:p-8 flex flex-col">
        <div className="flex justify-between items-center mb-6 max-w-4xl mx-auto w-full">
          <h3 className="text-xl font-bold text-white">Fatura Önizleme</h3>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsPreviewMode(false)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
            >
              Düzenlemeye Dön
            </button>
            <button 
              onClick={handleSaveInvoice}
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-[#4F8EF7] to-purple-600 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {loading ? "Kaydediliyor..." : "Kaydet ve Gönder"}
            </button>
          </div>
        </div>
        <InvoicePreview {...previewProps} />
      </div>
    );
  };

  const handleViewInvoice = (invoice: any) => {
    const client = invoice.clientCompany || invoice.project?.client || {};
    const isGerman = (client.addressCountry?.toLowerCase().includes('de') || 
                      client.addressCountry?.toLowerCase().includes('almanya') || 
                      invoice.currency === 'EUR');
    setPrintLang(isGerman ? 'de' : 'tr');
    setViewInvoice(invoice);
  };

  const handleSendInvoice = async () => {
    if (!viewInvoice) return;
    setSending(true);
    try {
      const res = await sendInvoiceToClient(viewInvoice.id, tenantId);
      if (res.success) {
        alert(`Fatura müşteriye başarıyla iletildi! (${res.method === 'portal' ? 'Müşteri Paneli + E-posta Bildirimi' : 'Doğrudan Detaylı E-posta'})`);
      } else {
        alert(res.error || 'İletim sırasında hata oluştu.');
      }
    } catch (err) {
      console.error(err);
      alert('Fatura iletilemedi.');
    } finally {
      setSending(false);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await updateTenantSettings(tenantId, {
        preferences: {
          invoiceSettings: localSettings
        }
      });
      if (res.success) {
        alert('Fatura ayarları başarıyla kaydedildi.');
        setIsSettingsModalOpen(false);
      } else {
        alert(res.error || 'Ayarlar kaydedilemedi.');
      }
    } catch (error) {
      console.error('Settings save error', error);
      alert('Bir hata oluştu.');
    } finally {
      setSavingSettings(false);
    }
  };

  const renderViewInvoice = () => {
    if (!viewInvoice) return null;
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
        netAmount: Number(viewInvoice.netAmount || 0),
        taxRate: Number(viewInvoice.taxRate || 19),
        taxAmount: Number(viewInvoice.taxAmount || 0),
        grossAmount: Number(viewInvoice.grossAmount || viewInvoice.amount || 0),
        currency: viewInvoice.currency || "EUR",
        notes: viewInvoice.notes,
        items: viewInvoice.items?.map((item: any) => ({
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          total: Number(item.total)
        })) || []
      },
      lang: printLang
    };

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] overflow-y-auto p-4 md:p-8 flex flex-col">
        <div className="flex justify-between items-center mb-6 max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#4F8EF7]" />
              Fatura: {viewInvoice.invoiceNo}
            </h3>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1">
              <span className="text-xs text-[#94A3B8]">Fatura Dili:</span>
              <select 
                value={printLang} 
                onChange={(e) => setPrintLang(e.target.value as 'tr' | 'de')}
                className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="tr" className="bg-[#0A0A0F] text-white">Türkçe (TR)</option>
                <option value="de" className="bg-[#0A0A0F] text-white">Deutsch (DE)</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => handlePrintInvoice(tenantSettings, client, previewProps.invoice, printLang)}
              className="px-4 py-2 bg-[#4F8EF7] hover:bg-[#4F8EF7]/90 text-white rounded-lg text-sm transition-colors flex items-center gap-2 font-medium"
            >
              <Download className="w-4 h-4" /> PDF İndir / Yazdır
            </button>
            <button 
              onClick={handleSendInvoice}
              disabled={sending}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors flex items-center gap-2 font-medium disabled:opacity-50"
            >
              <Send className="w-4 h-4" /> {sending ? 'İletiliyor...' : 'Müşteriye İlet'}
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
  };

  const { netAmount, taxAmount, grossAmount } = calculateTotals();

  return (
    <div className="space-y-8 p-8 animate-in fade-in duration-500 min-h-screen pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <span className="bg-gradient-to-r from-[#4F8EF7] to-purple-500 bg-clip-text text-transparent">
              Faturalar & Tahsilatlar
            </span>
          </h1>
          <p className="text-[#94A3B8] mt-2">Finanzamt uyumlu faturalandırma ve tahsilat yönetimi.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Fatura no veya firma ara..." 
              className="bg-[#0A0A0F] border border-white/[0.05] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#4F8EF7]/50 transition-colors w-64 placeholder:text-[#64748B]"
            />
          </div>
          <button 
            onClick={() => setIsSettingsModalOpen(true)}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-[#94A3B8] hover:text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all border border-white/10"
          >
            <Settings className="w-4 h-4" />
            Ayarlar
          </button>
          <button 
            onClick={() => setIsAddInvoiceModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-[#4F8EF7] to-purple-600 hover:opacity-90 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-[0_0_20px_rgba(79,142,247,0.3)]"
          >
            <Plus className="w-4 h-4" />
            Yeni Fatura Kes
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#0A0A0F] border border-white/[0.05] p-6 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#94A3B8]">Aylık Ciro</p>
              <h3 className="text-2xl font-bold text-white">{formatCurrency(monthlyRevenue, "EUR")}</h3>
            </div>
          </div>
        </div>
        {/* ... (other stats simplified for brevity) ... */}
        <div className="bg-[#0A0A0F] border border-white/[0.05] p-6 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 flex items-center justify-center border border-[#10B981]/20">
              <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#94A3B8]">Tahsil Edilen (Aylık)</p>
              <h3 className="text-2xl font-bold text-white">{formatCurrency(monthlyRevenue, "EUR")}</h3>
            </div>
          </div>
        </div>
        <div className="bg-[#0A0A0F] border border-white/[0.05] p-6 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-amber-400/10 flex items-center justify-center border border-amber-400/20">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#94A3B8]">Bekleyen Ödemeler</p>
              <h3 className="text-2xl font-bold text-white">{formatCurrency(pendingAmount, "EUR")}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content (Table) */}
      <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.05] font-semibold text-xs text-[#64748B] uppercase tracking-wider">
                <th className="py-4 px-6">Fatura No / Müşteri</th>
                <th className="py-4 px-6">Proje Açıklaması</th>
                <th className="py-4 px-6">Tutar</th>
                <th className="py-4 px-6">Tarihler</th>
                <th className="py-4 px-6">Durum</th>
                <th className="py-4 px-6 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05] text-sm">
              {filteredInvoices.map(invoice => (
                <tr key={invoice.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="py-4 px-6">
                    <div onClick={() => handleViewInvoice(invoice)} className="font-semibold text-white flex items-center gap-2 group-hover:text-[#4F8EF7] transition-colors cursor-pointer">
                      <FileText className="w-4 h-4 text-[#64748B]" />
                      {invoice.invoiceNo}
                    </div>
                    <div className="text-xs text-[#94A3B8] mt-1">{invoice.clientCompany?.name || invoice.project?.client?.name || "Bilinmiyor"}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-xs text-[#94A3B8]">{invoice.project?.title || "-"}</div>
                  </td>
                  <td className="py-4 px-6 font-mono text-white text-base">
                    {formatCurrency(Number(invoice.grossAmount || invoice.amount || 0), invoice.currency || 'EUR')}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[#64748B]">Tarih:</span>
                        <span className="text-[#94A3B8] font-mono">{new Date(invoice.invoiceDate || invoice.createdAt).toLocaleDateString('tr-TR')}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[#64748B]">Son Ödeme:</span>
                        <span className={`font-mono ${invoice.status === 'OVERDUE' ? 'text-red-400 font-bold' : 'text-[#94A3B8]'}`}>{new Date(invoice.dueDate).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                      invoice.status === 'PAID' ? 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20' : 
                      invoice.status === 'PENDING' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' :
                      'text-slate-400 bg-slate-400/10 border-slate-400/20'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleViewInvoice(invoice)} className="p-2 hover:bg-white/[0.05] rounded-lg text-[#64748B] hover:text-white transition-colors" title="Görüntüle">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          const client = invoice.clientCompany || invoice.project?.client || {};
                          const defaultLang = (client.addressCountry?.toLowerCase().includes('de') || client.addressCountry?.toLowerCase().includes('almanya') || invoice.currency === 'EUR') ? 'de' : 'tr';
                          handlePrintInvoice(tenantSettings, client, invoice, defaultLang);
                        }} 
                        className="p-2 hover:bg-white/[0.05] rounded-lg text-[#64748B] hover:text-white transition-colors" 
                        title="PDF İndir"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteInvoice(invoice.id)} 
                        className="p-2 hover:bg-red-500/10 rounded-lg text-[#64748B] hover:text-red-400 transition-colors" 
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW INVOICE MODAL */}
      {isAddInvoiceModalOpen && !isPreviewMode && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 py-10 overflow-y-auto">
          <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl max-w-4xl w-full shadow-2xl my-auto flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-white/5 flex justify-between items-center sticky top-0 bg-[#0A0A0F] z-10">
              <h3 className="text-xl font-bold text-white">Yeni Fatura Kes (Finanzamt Uyumlu)</h3>
              <button onClick={() => setIsAddInvoiceModalOpen(false)} className="text-[#64748B] hover:text-white">✕</button>
            </div>
            
            <div className="p-6 space-y-8 overflow-y-auto">
              {/* Müşteri ve Proje */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-white border-b border-white/10 pb-2">Müşteri Bilgileri</h4>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={!isCreatingNewClient} onChange={() => setIsCreatingNewClient(false)} className="accent-[#4F8EF7]"/>
                      <span className="text-sm text-white">Kayıtlı Müşteri</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={isCreatingNewClient} onChange={() => setIsCreatingNewClient(true)} className="accent-[#4F8EF7]"/>
                      <span className="text-sm text-white">Yeni Müşteri Oluştur</span>
                    </label>
                  </div>

                  {!isCreatingNewClient ? (
                    <select 
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:border-[#4F8EF7]"
                      value={invoiceData.clientCompanyId}
                      onChange={e => setInvoiceData({...invoiceData, clientCompanyId: e.target.value})}
                    >
                      <option value="">-- Müşteri Seçin --</option>
                      {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      <input type="text" placeholder="Firma Adı *" className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2" value={newClientData.name} onChange={e => setNewClientData({...newClientData, name: e.target.value})}/>
                      <input type="email" placeholder="E-posta" className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2" value={newClientData.email} onChange={e => setNewClientData({...newClientData, email: e.target.value})}/>
                      <input type="text" placeholder="Sokak, Bina No" className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2" value={newClientData.addressStreet} onChange={e => setNewClientData({...newClientData, addressStreet: e.target.value})}/>
                      <div className="flex gap-2">
                        <input type="text" placeholder="Posta Kodu" className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 w-1/3" value={newClientData.addressZip} onChange={e => setNewClientData({...newClientData, addressZip: e.target.value})}/>
                        <input type="text" placeholder="Şehir" className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 w-2/3" value={newClientData.addressCity} onChange={e => setNewClientData({...newClientData, addressCity: e.target.value})}/>
                      </div>
                      <div className="flex gap-2">
                        <input type="text" placeholder="Steuernummer" className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 w-1/2" value={newClientData.taxId} onChange={e => setNewClientData({...newClientData, taxId: e.target.value})}/>
                        <input type="text" placeholder="USt-IdNr" className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 w-1/2" value={newClientData.vatId} onChange={e => setNewClientData({...newClientData, vatId: e.target.value})}/>
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <label className="block text-sm text-[#94A3B8] mb-1">Bağlı Proje (Opsiyonel)</label>
                    <select 
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:border-[#4F8EF7]"
                      value={invoiceData.projectId}
                      onChange={e => setInvoiceData({...invoiceData, projectId: e.target.value})}
                    >
                      <option value="">-- Proje Seçin --</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Fatura Detayları */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-white border-b border-white/10 pb-2">Fatura Ayarları</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[#94A3B8] mb-1">Fatura Tarihi (Rechnungsdatum)</label>
                      <input type="date" className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2" value={invoiceData.invoiceDate} onChange={e => setInvoiceData({...invoiceData, invoiceDate: e.target.value})}/>
                    </div>
                    <div>
                      <label className="block text-xs text-[#94A3B8] mb-1">Hizmet Tarihi (Leistungsdatum)</label>
                      <input type="date" className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2" value={invoiceData.deliveryDate} onChange={e => setInvoiceData({...invoiceData, deliveryDate: e.target.value})}/>
                    </div>
                    <div>
                      <label className="block text-xs text-[#94A3B8] mb-1">Son Ödeme (Fälligkeitsdatum)</label>
                      <input type="date" className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2" value={invoiceData.dueDate} onChange={e => setInvoiceData({...invoiceData, dueDate: e.target.value})}/>
                    </div>
                    <div>
                      <label className="block text-xs text-[#94A3B8] mb-1">Para Birimi</label>
                      <select className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2" value={invoiceData.currency} onChange={e => setInvoiceData({...invoiceData, currency: e.target.value})}>
                        {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-[#94A3B8] mb-1">KDV (MwSt) %</label>
                      <select className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2" value={invoiceData.taxRate} onChange={e => setInvoiceData({...invoiceData, taxRate: Number(e.target.value)})}>
                        <option value={19}>19%</option>
                        <option value={7}>7%</option>
                        <option value={0}>0% (Reverse Charge)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kalemler */}
              <div>
                <h4 className="font-semibold text-white border-b border-white/10 pb-2 mb-4">Hizmet / Ürün Kalemleri</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-12 gap-3 text-xs font-semibold text-[#64748B] px-2">
                    <div className="col-span-6">Açıklama</div>
                    <div className="col-span-2 text-right">Miktar</div>
                    <div className="col-span-2 text-right">Birim Fiyat</div>
                    <div className="col-span-2 text-right">Toplam</div>
                  </div>
                  {invoiceData.items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-3 items-center">
                      <div className="col-span-6">
                        <input type="text" className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2" placeholder="Örn: Web Geliştirme Danışmanlığı" value={item.description} onChange={e => handleItemChange(idx, 'description', e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <input type="number" min="1" className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-right" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', Number(e.target.value))} />
                      </div>
                      <div className="col-span-2">
                        <input type="number" min="0" className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-right" value={item.unitPrice} onChange={e => handleItemChange(idx, 'unitPrice', Number(e.target.value))} />
                      </div>
                      <div className="col-span-1 text-right text-white font-mono text-sm">
                        {formatCurrency(item.quantity * item.unitPrice, invoiceData.currency)}
                      </div>
                      <div className="col-span-1 flex justify-end">
                        {invoiceData.items.length > 1 && (
                          <button onClick={() => handleRemoveItem(idx)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg">
                            <Trash2 className="w-4 h-4"/>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={handleAddItem} className="mt-4 flex items-center gap-2 text-[#4F8EF7] text-sm font-medium hover:underline">
                  <Plus className="w-4 h-4"/> Yeni Kalem Ekle
                </button>
              </div>

              {/* Notlar & Toplam */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/10">
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-2">Notlar / Ek Açıklamalar</label>
                  <textarea className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 min-h-[100px]" value={invoiceData.notes} onChange={e => setInvoiceData({...invoiceData, notes: e.target.value})} placeholder="Fatura altında görünecek notlar..."></textarea>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="flex justify-between py-2 text-sm text-[#94A3B8]">
                    <span>Net Toplam:</span>
                    <span className="text-white">{formatCurrency(netAmount, invoiceData.currency)}</span>
                  </div>
                  <div className="flex justify-between py-2 text-sm text-[#94A3B8]">
                    <span>KDV ({invoiceData.taxRate}%):</span>
                    <span className="text-white">{formatCurrency(taxAmount, invoiceData.currency)}</span>
                  </div>
                  <div className="flex justify-between py-3 mt-2 border-t border-white/10 text-lg font-bold text-white">
                    <span>Genel Toplam:</span>
                    <span className="text-[#10B981]">{formatCurrency(grossAmount, invoiceData.currency)}</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="p-6 border-t border-white/5 flex items-center justify-between sticky bottom-0 bg-[#0A0A0F] z-10">
              <button onClick={() => setIsPreviewMode(true)} className="px-5 py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors text-sm font-medium flex items-center gap-2">
                <Eye className="w-4 h-4" /> Önizleme
              </button>
              <div className="flex gap-3">
                <button onClick={() => setIsAddInvoiceModalOpen(false)} className="px-5 py-2.5 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors text-sm font-medium">İptal</button>
                <button onClick={handleSaveInvoice} disabled={loading} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4F8EF7] to-[#8B5CF6] text-white hover:opacity-90 transition-opacity text-sm font-medium disabled:opacity-50">
                  {loading ? 'Oluşturuluyor...' : 'Faturayı Oluştur'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A0A0F] border border-white/10 p-6 md:p-8 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#4F8EF7]" /> 
                Fatura ve Şirket Ayarları
              </h2>
              <button onClick={() => setIsSettingsModalOpen(false)} className="text-[#94A3B8] hover:text-white">
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1">Şirket Adı</label>
                  <input type="text" value={localSettings?.name || ''} onChange={(e) => setLocalSettings({...localSettings, name: e.target.value})} className="w-full bg-[#05050A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4F8EF7]/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1">Logo URL</label>
                  <input type="text" value={localSettings?.logo || ''} onChange={(e) => setLocalSettings({...localSettings, logo: e.target.value})} className="w-full bg-[#05050A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4F8EF7]/50" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1">Adres</label>
                <input type="text" value={localSettings?.address || ''} onChange={(e) => setLocalSettings({...localSettings, address: e.target.value})} className="w-full bg-[#05050A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4F8EF7]/50" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1">Steuernummer (Tax ID)</label>
                  <input type="text" value={localSettings?.taxId || ''} onChange={(e) => setLocalSettings({...localSettings, taxId: e.target.value})} className="w-full bg-[#05050A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4F8EF7]/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1">USt-IdNr. (VAT ID)</label>
                  <input type="text" value={localSettings?.vatId || ''} onChange={(e) => setLocalSettings({...localSettings, vatId: e.target.value})} className="w-full bg-[#05050A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4F8EF7]/50" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1">Banka Adı</label>
                  <input type="text" value={localSettings?.bankName || ''} onChange={(e) => setLocalSettings({...localSettings, bankName: e.target.value})} className="w-full bg-[#05050A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4F8EF7]/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1">IBAN</label>
                  <input type="text" value={localSettings?.iban || ''} onChange={(e) => setLocalSettings({...localSettings, iban: e.target.value})} className="w-full bg-[#05050A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4F8EF7]/50" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1">E-posta</label>
                  <input type="text" value={localSettings?.email || ''} onChange={(e) => setLocalSettings({...localSettings, email: e.target.value})} className="w-full bg-[#05050A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4F8EF7]/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1">Telefon</label>
                  <input type="text" value={localSettings?.phone || ''} onChange={(e) => setLocalSettings({...localSettings, phone: e.target.value})} className="w-full bg-[#05050A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4F8EF7]/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1">Web Sitesi</label>
                  <input type="text" value={localSettings?.website || ''} onChange={(e) => setLocalSettings({...localSettings, website: e.target.value})} className="w-full bg-[#05050A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4F8EF7]/50" />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button 
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="px-4 py-2 text-sm text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button 
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className="px-4 py-2 text-sm text-white bg-[#4F8EF7] hover:bg-[#4F8EF7]/90 rounded-lg transition-colors disabled:opacity-50"
                >
                  {savingSettings ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Önizleme Modları */}
      {isPreviewMode && renderPreview()}
      {viewInvoice && renderViewInvoice()}
    </div>
  );
}
