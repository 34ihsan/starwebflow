import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';

export interface InvoicePreviewProps {
  companySettings: {
    name: string;
    logo?: string;
    address: string;
    taxId: string;
    vatId: string;
    iban: string;
    bankName: string;
    swift?: string;
    email: string;
    phone: string;
    website: string;
    isKleinunternehmer?: boolean;
  };
  client: {
    name: string;
    addressStreet?: string | null;
    addressCity?: string | null;
    addressZip?: string | null;
    addressCountry?: string | null;
    taxId?: string | null;
    vatId?: string | null;
  };
  invoice: {
    invoiceNo: string;
    invoiceDate: Date;
    deliveryDate: Date;
    dueDate: Date;
    netAmount: number;
    taxRate: number;
    taxAmount: number;
    grossAmount: number;
    currency: string;
    notes?: string | null;
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
  };
  lang?: 'tr' | 'de';
}

const localDict = {
  tr: {
    invoice: 'Fatura',
    invoiceNo: 'Fatura No',
    invoiceDate: 'Fatura Tarihi',
    deliveryDate: 'Hizmet Tarihi',
    dueDate: 'Son Ödeme',
    description: 'Açıklama',
    quantity: 'Miktar',
    unitPrice: 'Birim Fiyat',
    total: 'Toplam',
    netAmount: 'Net Tutar',
    vat: 'KDV',
    grossAmount: 'Genel Toplam',
    bankDetails: 'Banka Bilgileri',
    bank: 'Banka',
    taxDetails: 'Vergi Bilgileri',
    notes: 'Notlar',
  },
  de: {
    invoice: 'Rechnung',
    invoiceNo: 'Rechnungsnr.',
    invoiceDate: 'Rechnungsdatum',
    deliveryDate: 'Leistungsdatum',
    dueDate: 'Fälligkeitsdatum',
    description: 'Beschreibung',
    quantity: 'Menge',
    unitPrice: 'Einzelpreis',
    total: 'Gesamtpreis',
    netAmount: 'Netto-Betrag',
    vat: 'MwSt.',
    grossAmount: 'Rechnungsbetrag (Brutto)',
    bankDetails: 'Bankverbindung',
    bank: 'Bank',
    taxDetails: 'Steuerangaben',
    notes: 'Bemerkungen',
  }
};

export default function InvoicePreview({ companySettings, client, invoice, lang = 'tr' }: InvoicePreviewProps) {
  const dict = localDict[lang] || localDict.tr;
  const currencyLocale = invoice.currency === 'TRY' ? 'tr-TR' : 'de-DE';

  return (
    <div className="bg-white text-zinc-900 shadow-2xl rounded-2xl max-w-4xl mx-auto font-sans ring-1 ring-zinc-200/50 overflow-hidden flex flex-col" id="invoice-preview" style={{ minHeight: '1123px', position: 'relative' }}>
      {/* Premium Header Strip */}
      <div className="h-3 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600"></div>

      <div className="p-12 sm:p-16 flex-grow flex flex-col">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-16">
          <div className="flex-1">
            {companySettings.logo ? (
              <img 
                src={companySettings.logo.startsWith('http') || companySettings.logo.startsWith('/') ? companySettings.logo : `/${companySettings.logo}`} 
                alt={companySettings.name} 
                className="h-16 w-auto mb-6 object-contain" 
                onError={(e) => e.currentTarget.style.display = 'none'} 
              />
            ) : null}
            {!companySettings.logo && (
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">{companySettings.name}</h1>
            )}
            <div className="text-zinc-500 text-sm leading-relaxed mt-4 max-w-sm whitespace-pre-wrap">
              {companySettings.address}
            </div>
            {(companySettings.email || companySettings.phone) && (
              <div className="text-zinc-500 text-sm mt-3 space-y-1">
                {companySettings.email && <div className="flex items-center gap-2"><svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>{companySettings.email}</div>}
                {companySettings.phone && <div className="flex items-center gap-2"><svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>{companySettings.phone}</div>}
              </div>
            )}
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-light text-zinc-300 uppercase tracking-widest mb-8">{dict.invoice}</h2>
            
            <div className="bg-zinc-50 rounded-xl p-5 border border-zinc-100 shadow-sm min-w-[240px]">
              <div className="flex justify-between items-center mb-3 pb-3 border-b border-zinc-200">
                <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">{dict.invoiceNo}</span>
                <span className="font-bold text-zinc-900 text-sm">{invoice.invoiceNo}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">{dict.invoiceDate}</span>
                  <span className="font-medium text-zinc-800">{format(new Date(invoice.invoiceDate), 'dd.MM.yyyy')}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">{dict.deliveryDate}</span>
                  <span className="font-medium text-zinc-800">{format(new Date(invoice.deliveryDate), 'dd.MM.yyyy')}</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-3 pt-3 border-t border-zinc-100">
                  <span className="text-indigo-600 font-medium">{dict.dueDate}</span>
                  <span className="font-bold text-indigo-700">{format(new Date(invoice.dueDate), 'dd.MM.yyyy')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Client Address */}
        <div className="mb-14">
          <div className="inline-block relative">
            <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold mb-2 ml-1">Fatura Edilen</div>
            <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-100 min-w-[300px]">
              <h3 className="text-lg font-bold text-zinc-900 mb-2">{client.name}</h3>
              <p className="text-zinc-600 text-sm leading-relaxed">{client.addressStreet}</p>
              <p className="text-zinc-600 text-sm leading-relaxed">{client.addressZip} {client.addressCity}</p>
              <p className="text-zinc-600 text-sm leading-relaxed">{client.addressCountry}</p>
              
              {(client.vatId || client.taxId) && (
                <div className="mt-4 pt-4 border-t border-zinc-200 text-xs text-zinc-500 space-y-1">
                  {client.vatId && <div className="flex justify-between"><span className="text-zinc-400">USt-IdNr.:</span> <span className="font-medium text-zinc-700">{client.vatId}</span></div>}
                  {client.taxId && <div className="flex justify-between"><span className="text-zinc-400">Steuernummer:</span> <span className="font-medium text-zinc-700">{client.taxId}</span></div>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-zinc-200 text-zinc-500 text-xs uppercase tracking-wider">
                <th className="pb-3 font-semibold pl-2 w-3/5">{dict.description}</th>
                <th className="pb-3 font-semibold text-center">{dict.quantity}</th>
                <th className="pb-3 font-semibold text-right">{dict.unitPrice}</th>
                <th className="pb-3 font-semibold text-right pr-2">{dict.total}</th>
              </tr>
            </thead>
            <tbody className="text-zinc-800 text-sm align-top">
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50/50 transition-colors">
                  <td className="py-5 pl-2 font-medium">{item.description}</td>
                  <td className="py-5 text-center text-zinc-600 tabular-nums">{Number(item.quantity)}</td>
                  <td className="py-5 text-right text-zinc-600 tabular-nums">{new Intl.NumberFormat(currencyLocale, { style: 'currency', currency: invoice.currency }).format(Number(item.unitPrice))}</td>
                  <td className="py-5 text-right font-semibold text-zinc-900 pr-2 tabular-nums">{new Intl.NumberFormat(currencyLocale, { style: 'currency', currency: invoice.currency }).format(Number(item.total))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end mb-8">
          <div className="w-full sm:w-1/2 md:w-2/5 bg-zinc-50 rounded-xl p-6 border border-zinc-100 shadow-sm">
            {(() => {
              const isKlein = companySettings.isKleinunternehmer === true ||
                String((companySettings as any).vatRate) === "0" ||
                Number(invoice.taxRate) === 0;
              if (isKlein) {
                return (
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-medium text-zinc-600">{lang === 'de' ? 'Rechnungsbetrag' : 'Fatura Tutarı'}</span>
                    <span className="font-bold text-zinc-900 tabular-nums">{new Intl.NumberFormat(currencyLocale, { style: 'currency', currency: invoice.currency }).format(Number(invoice.netAmount))}</span>
                  </div>
                );
              }
              return (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-zinc-500">
                    <span>{dict.netAmount}</span>
                    <span className="tabular-nums font-medium text-zinc-700">{new Intl.NumberFormat(currencyLocale, { style: 'currency', currency: invoice.currency }).format(Number(invoice.netAmount))}</span>
                  </div>
                  <div className="flex justify-between text-sm text-zinc-500 pb-3 border-b border-zinc-200">
                    <span>{dict.vat} ({Number(invoice.taxRate)}%)</span>
                    <span className="tabular-nums font-medium text-zinc-700">{new Intl.NumberFormat(currencyLocale, { style: 'currency', currency: invoice.currency }).format(Number(invoice.taxAmount))}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg pt-1">
                    <span className="font-bold text-zinc-900">{dict.grossAmount}</span>
                    <span className="font-bold text-indigo-600 tabular-nums">{new Intl.NumberFormat(currencyLocale, { style: 'currency', currency: invoice.currency }).format(Number(invoice.grossAmount))}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* §19 UStG Legal Notice - Prominent Box */}
        {(companySettings.isKleinunternehmer === true ||
          String((companySettings as any).vatRate) === "0" ||
          Number(invoice.taxRate) === 0) && (
          <div className="mb-10 bg-amber-50 border border-amber-200 rounded-xl px-6 py-4">
            <p className="text-amber-900 text-xs font-bold uppercase tracking-widest mb-1.5">Hinweis / {lang === 'tr' ? 'KDV Muafiyeti Notu' : 'Steuerhinweis'}</p>
            <p className="text-amber-800 text-sm leading-relaxed font-medium">
              Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.
            </p>
            {lang === 'tr' && (
              <p className="text-amber-700 text-xs mt-1 leading-relaxed">
                (Bu fatura §19 UStG Küçük İşletme Yönetmeliği kapsamında KDV'den muaftır.)
              </p>
            )}
          </div>
        )}

        {/* Notes */}
        <div className="mb-10">
          {(() => {
            const diffDays = invoice.dueDate && invoice.invoiceDate 
              ? differenceInDays(new Date(invoice.dueDate), new Date(invoice.invoiceDate)) 
              : 14;
            
            const transferText = (!invoice.notes && lang === 'de') ? `Bitte überweisen Sie den Rechnungsbetrag innerhalb von ${diffDays} Tagen auf das unten angegebene Bankkonto unter Angabe der Rechnungsnummer.` : null;

            if (!invoice.notes && !transferText) return null;

            return (
              <div className="border-l-4 border-indigo-600 pl-6 py-2">
                <h4 className="font-bold text-zinc-900 mb-2 text-xs uppercase tracking-widest">{dict.notes}</h4>
                <div className="text-zinc-700 text-sm leading-relaxed space-y-2">
                  {invoice.notes && <p className="whitespace-pre-wrap">{invoice.notes}</p>}
                  {transferText && <p>{transferText}</p>}
                </div>
              </div>
            );
          })()}
        </div>

      </div>

      {/* Premium Light Footer */}
      <div className="border-t border-zinc-200 bg-zinc-50/50 p-10 sm:px-16 sm:py-10 mt-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-[11px] leading-relaxed text-zinc-500">
          <div>
            <h5 className="text-zinc-800 font-semibold mb-3 uppercase tracking-widest text-[10px]">{companySettings.name}</h5>
            <p className="whitespace-pre-wrap mb-2">{companySettings.address || 'Adres bilgisi girilmedi'}</p>
            {companySettings.email && <p>{companySettings.email}</p>}
            {companySettings.phone && <p>{companySettings.phone}</p>}
            {companySettings.website && <p>{companySettings.website}</p>}
          </div>
          <div>
            <h5 className="text-zinc-800 font-semibold mb-3 uppercase tracking-widest text-[10px]">{dict.bankDetails}</h5>
            {companySettings.bankName ? <p>{companySettings.bankName}</p> : <p className="italic opacity-50">Banka adı girilmedi</p>}
            {companySettings.iban && <p>IBAN: <span className="font-mono text-zinc-700">{companySettings.iban}</span></p>}
            {companySettings.swift && <p>BIC/SWIFT: <span className="font-mono text-zinc-700">{companySettings.swift}</span></p>}
          </div>
          <div>
            <h5 className="text-zinc-800 font-semibold mb-3 uppercase tracking-widest text-[10px]">{dict.taxDetails}</h5>
            {companySettings.taxId ? <p>St-Nr.: <span className="font-mono text-zinc-700">{companySettings.taxId}</span></p> : <p className="italic opacity-50">Vergi no girilmedi</p>}
            {companySettings.vatId && <p>USt-IdNr.: <span className="font-mono text-zinc-700">{companySettings.vatId}</span></p>}
            {(companySettings.isKleinunternehmer === true ||
              String((companySettings as any).vatRate) === "0" ||
              Number(invoice.taxRate) === 0) && (
              <p className="mt-2 text-amber-700 font-semibold leading-snug">Kleinunternehmer gem. § 19 UStG</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
