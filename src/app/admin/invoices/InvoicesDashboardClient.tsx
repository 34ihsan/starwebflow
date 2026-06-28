"use client";

import { useState } from "react";
import { 
  FileText, Search, Plus,
  CheckCircle2, Clock, Eye,
  Download, CreditCard, Send, Settings,
  Trash2, Users, Building2, Mail, Phone, MapPin, Edit3, X, UserPlus
} from "lucide-react";

import { createInvoice, deleteInvoice, updateInvoice } from "@/app/actions/invoice";
import { sendInvoiceToClient } from "@/app/actions/dispatch";
import { createClientCompany, updateClientCompany, deleteClientCompany } from "@/app/actions/clientCompany";
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
    <tr class="border-b border-zinc-200">
      <td class="py-4 text-sm font-medium text-zinc-900">${item.description || (lang === 'de' ? 'Produkt/Dienstleistung' : 'Ürün/Hizmet')}</td>
      <td class="py-4 text-center text-sm text-zinc-600">${Number(item.quantity)}</td>
      <td class="py-4 text-right text-sm text-zinc-600">${formatVal(Number(item.unitPrice))}</td>
      <td class="py-4 text-right text-sm font-bold text-zinc-900">${formatVal(Number(item.total))}</td>
    </tr>
  `).join('');

  const logoHtml = companySettings.logo ? '<img src="' + companySettings.logo + '" alt="Logo" class="h-16 w-auto mb-6 object-contain" onerror="this.style.display=\'none\'" />' : `<h1 class="text-3xl font-bold tracking-tight text-zinc-900 mb-6">${companySettings.name}</h1>`;
  
  const diffDays = invoice.dueDate && invoice.invoiceDate 
    ? Math.round((new Date(invoice.dueDate).getTime() - new Date(invoice.invoiceDate).getTime()) / (1000 * 3600 * 24))
    : 14;

  let printNotes = '';
  const isKlein = companySettings.isKleinunternehmer === true ||
    String(companySettings.vatRate) === "0" ||
    Number(invoice.taxRate) === 0;
  const defaultNotes = lang === 'de' ? `Bitte überweisen Sie den Rechnungsbetrag innerhalb von ${diffDays} Tagen auf das unten angegebene Bankkonto unter Angabe der Rechnungsnummer.` : "";

  if (invoice.notes || (!invoice.notes && lang === 'de')) {
    printNotes = `
      <div class="mt-12 mb-16 border-l-4 border-indigo-600 pl-6 py-2">
        <h4 class="font-bold text-zinc-900 mb-2 uppercase tracking-widest text-xs">${labels.notes}</h4>
        <div class="text-sm text-zinc-700 leading-relaxed space-y-2">
          ${invoice.notes ? `<p class="whitespace-pre-wrap">${invoice.notes}</p>` : ''}
          ${!invoice.notes && defaultNotes ? `<p>${defaultNotes}</p>` : ''}
        </div>
      </div>
    `;
  }

  const kleinBox = isKlein ? `
    <div style="margin-bottom:2rem; background:#fffbeb; border:1.5px solid #fbbf24; border-radius:12px; padding:1rem 1.5rem;">
      <p style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:#92400e; margin-bottom:6px;">Hinweis / Steuerhinweis</p>
      <p style="font-size:13px; font-weight:600; color:#78350f; line-height:1.5;">Gem&auml;&szlig; &sect; 19 UStG wird keine Umsatzsteuer berechnet.</p>
      ${lang === 'tr' ? '<p style="font-size:11px; color:#92400e; margin-top:4px;">(Bu fatura &sect;19 UStG K&uuml;&ccedil;&uuml;k &Icirc;&scedil;letme Y&ouml;netmeli&gbreve;i kapsam&inodot;nda KDV\'den muaft&inodot;r.)</p>' : ''}
    </div>
  ` : '';

  printWindow.document.write(`
    <html>
      <head>
        <title>${labels.title} - ${invoice.invoiceNo}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: white; }
          @page { size: A4; margin: 0; }
          @media print {
            .no-print { display: none !important; }
            body { margin: 0; padding: 0; }
            .invoice-container { min-height: 100vh; position: relative; }
          }
        </style>
      </head>
      <body class="bg-zinc-100/50 flex justify-center items-start min-h-screen">
        <div class="no-print fixed top-4 right-4 z-50 flex gap-2">
          <button onclick="window.print()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-lg transition-all flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            ${labels.saveBtn}
          </button>
          <button onclick="window.close()" class="bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 px-6 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all">
            ${labels.closeBtn}
          </button>
        </div>

        <div class="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-2xl invoice-container flex flex-col mx-auto my-8 print:my-0 print:shadow-none">
          <!-- Top Strip -->
          <div class="h-4 w-full bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700"></div>
          
          <div class="px-16 py-16 flex-grow flex flex-col">
            <!-- Header -->
            <header class="flex justify-between items-start mb-16">
              <div class="flex-1 pr-8">
                ${logoHtml}
                <div class="text-zinc-500 text-sm leading-relaxed max-w-sm whitespace-pre-wrap">${companySettings.address}</div>
                <div class="text-zinc-500 text-sm mt-4 space-y-1">
                  ${companySettings.email ? `<div>E: ${companySettings.email}</div>` : ''}
                  ${companySettings.phone ? `<div>T: ${companySettings.phone}</div>` : ''}
                </div>
              </div>
              <div class="text-right flex-shrink-0">
                <h2 class="text-5xl font-light text-zinc-300 uppercase tracking-widest mb-8">${labels.title}</h2>
                <div class="bg-zinc-50 rounded-xl p-6 border border-zinc-100 min-w-[260px]">
                  <div class="flex justify-between items-center mb-4 pb-4 border-b border-zinc-200">
                    <span class="text-zinc-500 text-xs font-semibold uppercase tracking-widest">${labels.invoiceNo}</span>
                    <span class="font-bold text-zinc-900 text-base">${invoice.invoiceNo}</span>
                  </div>
                  <div class="space-y-3 text-sm">
                    <div class="flex justify-between items-center">
                      <span class="text-zinc-500">${labels.date}</span>
                      <span class="font-medium text-zinc-900">${formatDate(invoice.invoiceDate)}</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-zinc-500">${labels.deliveryDate}</span>
                      <span class="font-medium text-zinc-900">${formatDate(invoice.deliveryDate)}</span>
                    </div>
                    <div class="flex justify-between items-center mt-4 pt-4 border-t border-zinc-100">
                      <span class="font-bold text-indigo-700">${labels.dueDate}</span>
                      <span class="font-bold text-indigo-700">${formatDate(invoice.dueDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            <!-- Client Info -->
            <div class="mb-16">
              <div class="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-3 border-b border-zinc-200 inline-block pb-1">${labels.client}</div>
              <h3 class="text-xl font-bold text-zinc-900 mb-2">${client.name || 'Müşteri'}</h3>
              <p class="text-zinc-600 text-sm leading-relaxed">${client.addressStreet || ''}</p>
              <p class="text-zinc-600 text-sm leading-relaxed">${client.addressZip || ''} ${client.addressCity || ''}</p>
              <p class="text-zinc-600 text-sm leading-relaxed">${client.addressCountry || ''}</p>
              <div class="mt-4 text-xs text-zinc-500 space-y-1">
                ${client.vatId ? `<p>USt-IdNr.: <span class="font-medium text-zinc-900">${client.vatId}</span></p>` : ''}
                ${client.taxId ? `<p>Steuernummer: <span class="font-medium text-zinc-900">${client.taxId}</span></p>` : ''}
              </div>
            </div>

            <!-- Items Table -->
            <div class="mb-12">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b-2 border-zinc-800 text-zinc-800 text-xs uppercase tracking-widest">
                    <th class="py-3 font-bold w-[50%]">${labels.description}</th>
                    <th class="py-3 font-bold text-center">${labels.quantity}</th>
                    <th class="py-3 font-bold text-right">${labels.unitPrice}</th>
                    <th class="py-3 font-bold text-right">${labels.total}</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>

            <!-- Totals -->
            <div class="flex justify-end mb-8">
              <div class="w-full sm:w-[45%] md:w-[40%] bg-zinc-50 rounded-xl p-6 border border-zinc-100">
                ${isKlein ? `
                  <div class="flex justify-between items-center text-lg">
                    <span class="font-bold text-zinc-600 uppercase tracking-widest text-sm">${lang === 'de' ? 'Rechnungsbetrag' : 'Fatura Tutarı'}</span>
                    <span class="font-bold text-zinc-900 text-xl tabular-nums">${formatVal(invoice.netAmount)}</span>
                  </div>
                ` : `
                  <div class="flex justify-between py-2 text-sm text-zinc-600">
                    <span>${labels.netAmount}</span>
                    <span class="tabular-nums font-medium text-zinc-900">${formatVal(invoice.netAmount)}</span>
                  </div>
                  <div class="flex justify-between py-2 text-sm text-zinc-600 pb-4 border-b border-zinc-200">
                    <span>${labels.vat} (${Number(invoice.taxRate)}%)</span>
                    <span class="tabular-nums font-medium text-zinc-900">${formatVal(invoice.taxAmount)}</span>
                  </div>
                  <div class="flex justify-between items-center pt-4">
                    <span class="font-bold text-zinc-900 uppercase tracking-widest text-sm">${labels.grossAmount}</span>
                    <span class="font-bold text-indigo-700 text-xl tabular-nums">${formatVal(invoice.grossAmount)}</span>
                  </div>
                `}
              </div>
            </div>

            ${kleinBox}

            ${printNotes}

          </div>

          <!-- Footer -->
          <footer class="border-t border-zinc-200 bg-zinc-50/80 px-16 py-12 mt-auto">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-[11px] leading-relaxed text-zinc-500">
              <div>
                <p class="font-bold text-zinc-800 mb-3 uppercase tracking-widest">${companySettings.name}</p>
                <p class="whitespace-pre-wrap mb-2">${companySettings.address}</p>
                ${companySettings.phone ? `<p>T: ${companySettings.phone}</p>` : ''}
                ${companySettings.email ? `<p>E: ${companySettings.email}</p>` : ''}
                ${companySettings.website ? `<p>W: ${companySettings.website}</p>` : ''}
              </div>
              <div>
                <p class="font-bold text-zinc-800 mb-3 uppercase tracking-widest">${labels.bankInfo}</p>
                ${companySettings.bankName ? `<p>${companySettings.bankName}</p>` : ''}
                ${companySettings.iban ? `<p>IBAN: <span class="font-mono text-zinc-700">${companySettings.iban}</span></p>` : ''}
                ${companySettings.swift ? `<p>BIC/SWIFT: <span class="font-mono text-zinc-700">${companySettings.swift}</span></p>` : ''}
              </div>
              <div>
                <p class="font-bold text-zinc-800 mb-3 uppercase tracking-widest">${labels.taxInfo}</p>
                ${companySettings.taxId ? `<p>St-Nr.: <span class="font-mono text-zinc-700">${companySettings.taxId}</span></p>` : ''}
                ${companySettings.vatId ? `<p>USt-IdNr.: <span class="font-mono text-zinc-700">${companySettings.vatId}</span></p>` : ''}
                ${isKlein ? `<p style="margin-top:6px; color:#b45309; font-weight:600;">Kleinunternehmer gem. &sect; 19 UStG</p>` : ''}
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
};


export default function InvoicesDashboardClient({ initialInvoices, projects, clientCompanies, crmLeads = [], tenantSettings, tenantId }: { initialInvoices: any[], projects: any[], clientCompanies: any[], crmLeads?: any[], tenantSettings: any, tenantId: string }) {
  const [activeMainTab, setActiveMainTab] = useState<"invoices" | "clients">("invoices");
  const [activeTab, setActiveTab] = useState<"all" | "paid" | "pending" | "overdue">("all");
  const [invoices, setInvoices] = useState<any[]>(initialInvoices);
  const [companies, setCompanies] = useState<any[]>(clientCompanies);
  const [isAddInvoiceModalOpen, setIsAddInvoiceModalOpen] = useState(false);
  const [editInvoiceId, setEditInvoiceId] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<any | null>(null);
  const [printLang, setPrintLang] = useState<'tr' | 'de'>('tr');
  const [searchQuery, setSearchQuery] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [sending, setSending] = useState(false);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState(tenantSettings);
  const [savingSettings, setSavingSettings] = useState(false);

  // Client management state
  const [editingClient, setEditingClient] = useState<any | null>(null);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [clientFormData, setClientFormData] = useState({ name: "", email: "", phone: "", addressStreet: "", addressCity: "", addressZip: "", addressCountry: "Germany", taxId: "", vatId: "", contactPerson: "" });
  const [savingClient, setSavingClient] = useState(false);

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
    const taxAmount = tenantSettings.isKleinunternehmer ? 0 : netAmount * (invoiceData.taxRate / 100);
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

      const payload = {
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
      };

      let res;
      if (editInvoiceId) {
        res = await updateInvoice(editInvoiceId, tenantId, payload);
      } else {
        res = await createInvoice(payload);
      }

      if(res.success && res.data) {
        if (editInvoiceId) {
          setInvoices(invoices.map(i => i.id === res.data.id ? res.data : i));
        } else {
          setInvoices([res.data, ...invoices]);
        }
        setIsAddInvoiceModalOpen(false);
        setIsPreviewMode(false);
        setEditInvoiceId(null);
      } else {
        alert("Fatura kaydedilemedi: " + res.error);
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

  // Client management handlers
  const handleOpenAddClient = () => {
    setEditingClient(null);
    setClientFormData({ name: "", email: "", phone: "", addressStreet: "", addressCity: "", addressZip: "", addressCountry: "Germany", taxId: "", vatId: "", contactPerson: "" });
    setIsAddClientModalOpen(true);
  };

  const handleOpenEditClient = (client: any) => {
    setEditingClient(client);
    setClientFormData({
      name: client.name || "", email: client.email || "", phone: client.phone || "",
      addressStreet: client.addressStreet || "", addressCity: client.addressCity || "",
      addressZip: client.addressZip || "", addressCountry: client.addressCountry || "Germany",
      taxId: client.taxId || "", vatId: client.vatId || "", contactPerson: client.contactPerson || ""
    });
    setIsAddClientModalOpen(true);
  };

  const handleImportFromCRM = (lead: any) => {
    setEditingClient(null);
    setClientFormData({
      name: lead.companyName || lead.name || "", email: lead.email || "", phone: lead.phone || "",
      addressStreet: lead.addressStreet || lead.address || "", addressCity: lead.city || "",
      addressZip: lead.zip || "", addressCountry: lead.country || "Germany",
      taxId: "", vatId: "", contactPerson: lead.name || ""
    });
    setIsAddClientModalOpen(true);
  };

  const handleSaveClient = async () => {
    if (!clientFormData.name) { alert("Müşteri adı zorunludur."); return; }
    setSavingClient(true);
    try {
      if (editingClient) {
        const res = await updateClientCompany(editingClient.id, tenantId, clientFormData);
        if (res.success && res.data) {
          setCompanies(companies.map(c => c.id === editingClient.id ? { ...c, ...res.data } : c));
          setIsAddClientModalOpen(false);
        } else { alert(res.error || "Güncellenemedi."); }
      } else {
        const res = await createClientCompany({ tenantId, ...clientFormData });
        if (res.success && res.data) {
          setCompanies([...companies, res.data]);
          setIsAddClientModalOpen(false);
        } else { alert(res.error || "Oluşturulamadı."); }
      }
    } catch (e) { alert("Bir hata oluştu."); }
    finally { setSavingClient(false); }
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm("Bu müşteriyi silmek istediğinize emin misiniz?")) return;
    const res = await deleteClientCompany(id, tenantId);
    if (res.success) { setCompanies(companies.filter(c => c.id !== id)); }
    else { alert(res.error || "Silinemedi."); }
  };

  const filteredCompanies = companies.filter(c =>
    c.name?.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.email?.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const crmLeadsNotInCompanies = crmLeads.filter((lead: any) =>
    !companies.some(c => c.email && c.email === lead.email)
  );

  // Settings are now managed in /admin/settings. The local handleSaveSettings has been removed.


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
        taxRate: Number(viewInvoice.taxRate !== undefined && viewInvoice.taxRate !== null ? viewInvoice.taxRate : 19),
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

  const handleEditInvoice = (invoice: any) => {
    setEditInvoiceId(invoice.id);
    setInvoiceData({
      projectId: invoice.projectId || "",
      clientCompanyId: invoice.clientCompanyId || "",
      currency: invoice.currency || "EUR",
      taxRate: invoice.taxRate || 19,
      invoiceDate: new Date(invoice.invoiceDate).toISOString().split('T')[0],
      deliveryDate: new Date(invoice.deliveryDate).toISOString().split('T')[0],
      dueDate: new Date(invoice.dueDate).toISOString().split('T')[0],
      notes: invoice.notes || "",
      items: invoice.items.length > 0 ? invoice.items.map((item: any) => ({
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice)
      })) : [{ description: "", quantity: 1, unitPrice: 0 }]
    });
    setIsCreatingNewClient(false);
    setIsAddInvoiceModalOpen(true);
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
          <p className="text-[#94A3B8] mt-2">Finanzamt uyumlu faturalandırma, müşteri ve tahsilat yönetimi.</p>
        </div>
        <div className="flex items-center gap-3">
          {activeMainTab === 'invoices' ? (
            <>
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                <input
                  type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Fatura no veya firma ara..."
                  className="bg-[#0A0A0F] border border-white/[0.05] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#4F8EF7]/50 transition-colors w-64 placeholder:text-[#64748B]"
                />
              </div>
              <button onClick={() => setIsAddInvoiceModalOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-[#4F8EF7] to-purple-600 hover:opacity-90 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-[0_0_20px_rgba(79,142,247,0.3)]">
                <Plus className="w-4 h-4" /> Yeni Fatura Kes
              </button>
            </>
          ) : (
            <>
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                <input
                  type="text" value={clientSearch} onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="Müşteri ara..."
                  className="bg-[#0A0A0F] border border-white/[0.05] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#4F8EF7]/50 transition-colors w-64 placeholder:text-[#64748B]"
                />
              </div>
              <button onClick={handleOpenAddClient}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all">
                <UserPlus className="w-4 h-4" /> Müşteri Ekle
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveMainTab('invoices')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeMainTab === 'invoices'
              ? 'bg-gradient-to-r from-[#4F8EF7] to-purple-600 text-white shadow-lg'
              : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" /> Faturalar
          <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
            activeMainTab === 'invoices' ? 'bg-white/20' : 'bg-white/10 text-[#64748B]'
          }`}>{invoices.length}</span>
        </button>
        <button
          onClick={() => setActiveMainTab('clients')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeMainTab === 'clients'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
              : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" /> Müşteriler
          <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
            activeMainTab === 'clients' ? 'bg-white/20' : 'bg-white/10 text-[#64748B]'
          }`}>{companies.length}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#0A0A0F] border border-white/[0.05] p-6 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#94A3B8]">Toplam Ciro</p>
              <h3 className="text-2xl font-bold text-white">{formatCurrency(monthlyRevenue, "EUR")}</h3>
            </div>
          </div>
        </div>
        <div className="bg-[#0A0A0F] border border-white/[0.05] p-6 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 flex items-center justify-center border border-[#10B981]/20">
              <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#94A3B8]">Tahsil Edilen</p>
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
        <div className="bg-[#0A0A0F] border border-white/[0.05] p-6 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-[#4F8EF7]/10 flex items-center justify-center border border-[#4F8EF7]/20">
              <Users className="w-6 h-6 text-[#4F8EF7]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#94A3B8]">Toplam Müşteri</p>
              <h3 className="text-2xl font-bold text-white">{companies.length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* ============ CLIENTS TAB ============ */}
      {activeMainTab === 'clients' && (
        <div className="space-y-6">
          {/* CRM Import Banner */}
          {crmLeadsNotInCompanies.length > 0 && (
            <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                    <UserPlus className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">CRM'den Aktarılabilecek Müşteriler</p>
                    <p className="text-[#94A3B8] text-xs">{crmLeadsNotInCompanies.length} lead henüz fatura müşterisi değil</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {crmLeadsNotInCompanies.slice(0, 8).map((lead: any) => (
                  <button
                    key={lead.id}
                    onClick={() => handleImportFromCRM(lead)}
                    className="flex items-center gap-2 bg-white/5 hover:bg-indigo-500/20 border border-white/10 hover:border-indigo-500/40 text-white px-3 py-2 rounded-lg text-xs font-medium transition-all group"
                  >
                    <div className="w-5 h-5 rounded-full bg-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-[10px]">
                      {(lead.companyName || lead.name || '?')[0].toUpperCase()}
                    </div>
                    {lead.companyName || lead.name}
                    <UserPlus className="w-3 h-3 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Client Cards Grid */}
          {filteredCompanies.length === 0 ? (
            <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-16 text-center">
              <Building2 className="w-12 h-12 text-[#64748B] mx-auto mb-4" />
              <p className="text-white font-semibold mb-2">Henüz müşteri yok</p>
              <p className="text-[#64748B] text-sm mb-6">Yeni müşteri ekleyin veya CRM'den aktarın</p>
              <button onClick={handleOpenAddClient} className="bg-gradient-to-r from-[#4F8EF7] to-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium">
                <UserPlus className="w-4 h-4 inline mr-2" />İlk Müşteriyi Ekle
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCompanies.map((client: any) => {
                const clientInvoices = invoices.filter(inv => inv.clientCompanyId === client.id);
                const clientTotal = clientInvoices.reduce((acc: number, inv: any) => acc + Number(inv.grossAmount || 0), 0);
                const paidCount = clientInvoices.filter((inv: any) => inv.status === 'PAID').length;
                const initials = client.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
                return (
                  <div key={client.id} className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 group hover:border-[#4F8EF7]/30 transition-all">
                    {/* Client Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4F8EF7]/30 to-purple-500/30 border border-[#4F8EF7]/20 flex items-center justify-center text-white font-bold text-sm">
                          {initials}
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-sm leading-tight">{client.name}</h3>
                          {client.contactPerson && <p className="text-[#64748B] text-xs mt-0.5">{client.contactPerson}</p>}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenEditClient(client)} className="p-1.5 hover:bg-[#4F8EF7]/10 rounded-lg text-[#64748B] hover:text-[#4F8EF7] transition-colors">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteClient(client.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-[#64748B] hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-1.5 mb-4">
                      {client.email && (
                        <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                          <Mail className="w-3 h-3 text-[#64748B] flex-shrink-0" />
                          <span className="truncate">{client.email}</span>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                          <Phone className="w-3 h-3 text-[#64748B] flex-shrink-0" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                      {(client.addressCity || client.addressCountry) && (
                        <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                          <MapPin className="w-3 h-3 text-[#64748B] flex-shrink-0" />
                          <span>{[client.addressZip, client.addressCity, client.addressCountry].filter(Boolean).join(', ')}</span>
                        </div>
                      )}
                    </div>

                    {/* Tax Info */}
                    {(client.vatId || client.taxId) && (
                      <div className="mb-4 p-2.5 bg-white/[0.03] rounded-lg border border-white/5">
                        {client.vatId && <p className="text-[10px] text-[#64748B]">USt-IdNr.: <span className="text-white font-mono">{client.vatId}</span></p>}
                        {client.taxId && <p className="text-[10px] text-[#64748B]">St-Nr.: <span className="text-white font-mono">{client.taxId}</span></p>}
                      </div>
                    )}

                    {/* Invoice Stats */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
                      <div className="text-center">
                        <p className="text-lg font-bold text-white">{clientInvoices.length}</p>
                        <p className="text-[10px] text-[#64748B] uppercase tracking-wider">Fatura</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-[#10B981]">{paidCount}</p>
                        <p className="text-[10px] text-[#64748B] uppercase tracking-wider">Ödendi</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-[#4F8EF7]">{formatCurrency(clientTotal, 'EUR')}</p>
                        <p className="text-[10px] text-[#64748B] uppercase tracking-wider">Toplam</p>
                      </div>
                      <button
                        onClick={() => { setActiveMainTab('invoices'); setSearchQuery(client.name); }}
                        className="text-[10px] text-[#4F8EF7] hover:text-white bg-[#4F8EF7]/10 hover:bg-[#4F8EF7]/20 px-2 py-1 rounded-lg transition-colors font-medium"
                      >
                        Faturalar →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Main Content (Table) - Only show in invoices tab */}
      {activeMainTab === 'invoices' && (
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
                      <button onClick={() => handleEditInvoice(invoice)} className="p-2 hover:bg-[#4F8EF7]/10 rounded-lg text-[#64748B] hover:text-[#4F8EF7] transition-colors" title="Düzenle">
                        <Settings className="w-4 h-4" />
                      </button>
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
      )} {/* end invoices tab */}

      {/* CLIENT ADD/EDIT MODAL */}
      {isAddClientModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl max-w-xl w-full shadow-2xl my-auto">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#4F8EF7]" />
                {editingClient ? 'Müşteri Düzenle' : 'Yeni Müşteri Ekle'}
              </h3>
              <button onClick={() => setIsAddClientModalOpen(false)} className="text-[#64748B] hover:text-white p-1 rounded-lg hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1">Firma / Kişi Adı *</label>
                  <input type="text" value={clientFormData.name} onChange={e => setClientFormData({...clientFormData, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:border-[#4F8EF7] focus:outline-none" placeholder="ABC GmbH" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#94A3B8] mb-1">E-posta</label>
                    <input type="email" value={clientFormData.email} onChange={e => setClientFormData({...clientFormData, email: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:border-[#4F8EF7] focus:outline-none" placeholder="info@firma.de" />
                  </div>
                  <div>
                    <label className="block text-xs text-[#94A3B8] mb-1">Telefon</label>
                    <input type="text" value={clientFormData.phone} onChange={e => setClientFormData({...clientFormData, phone: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:border-[#4F8EF7] focus:outline-none" placeholder="+49 123..." />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1">Yetkili Kişi</label>
                  <input type="text" value={clientFormData.contactPerson} onChange={e => setClientFormData({...clientFormData, contactPerson: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:border-[#4F8EF7] focus:outline-none" placeholder="Max Mustermann" />
                </div>
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1">Adres</label>
                  <input type="text" value={clientFormData.addressStreet} onChange={e => setClientFormData({...clientFormData, addressStreet: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:border-[#4F8EF7] focus:outline-none" placeholder="Musterstraße 1" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-[#94A3B8] mb-1">PLZ</label>
                    <input type="text" value={clientFormData.addressZip} onChange={e => setClientFormData({...clientFormData, addressZip: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:border-[#4F8EF7] focus:outline-none" placeholder="67105" />
                  </div>
                  <div>
                    <label className="block text-xs text-[#94A3B8] mb-1">Şehir</label>
                    <input type="text" value={clientFormData.addressCity} onChange={e => setClientFormData({...clientFormData, addressCity: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:border-[#4F8EF7] focus:outline-none" placeholder="Mannheim" />
                  </div>
                  <div>
                    <label className="block text-xs text-[#94A3B8] mb-1">Ülke</label>
                    <input type="text" value={clientFormData.addressCountry} onChange={e => setClientFormData({...clientFormData, addressCountry: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:border-[#4F8EF7] focus:outline-none" placeholder="Germany" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#94A3B8] mb-1">Steuernummer</label>
                    <input type="text" value={clientFormData.taxId} onChange={e => setClientFormData({...clientFormData, taxId: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:border-[#4F8EF7] focus:outline-none" placeholder="123/456/78901" />
                  </div>
                  <div>
                    <label className="block text-xs text-[#94A3B8] mb-1">USt-IdNr.</label>
                    <input type="text" value={clientFormData.vatId} onChange={e => setClientFormData({...clientFormData, vatId: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:border-[#4F8EF7] focus:outline-none" placeholder="DE123456789" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setIsAddClientModalOpen(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-colors">
                  İptal
                </button>
                <button onClick={handleSaveClient} disabled={savingClient}
                  className="flex-1 py-3 bg-gradient-to-r from-[#4F8EF7] to-purple-600 hover:opacity-90 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50">
                  {savingClient ? 'Kaydediliyor...' : (editingClient ? 'Güncelle' : 'Müşteri Ekle')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                      {companies.length > 0 && (
                        <optgroup label="📋 Kayıtlı Müşteriler">
                          {companies.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </optgroup>
                      )}
                      {crmLeadsNotInCompanies.length > 0 && (
                        <optgroup label="🔗 CRM Leadleri (Aktarılmamış)">
                          {crmLeadsNotInCompanies.map((lead: any) => (
                            <option key={`crm-${lead.id}`} value={`crm-${lead.id}`}>
                              {lead.companyName || lead.name} (CRM)
                            </option>
                          ))}
                        </optgroup>
                      )}
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


      {/* Önizleme Modları */}
      {isPreviewMode && renderPreview()}

      {viewInvoice && renderViewInvoice()}
    </div>
  );
}
