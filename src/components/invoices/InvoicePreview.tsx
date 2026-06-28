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
    invoiceNo: 'Fatura No:',
    invoiceDate: 'Fatura Tarihi:',
    deliveryDate: 'Hizmet Tarihi:',
    dueDate: 'Son Ödeme:',
    description: 'Açıklama',
    quantity: 'Miktar',
    unitPrice: 'Birim Fiyat',
    total: 'Toplam',
    netAmount: 'Net Tutar:',
    vat: 'KDV',
    grossAmount: 'Genel Toplam:',
    bankDetails: 'Banka Bilgileri',
    bank: 'Banka:',
    taxDetails: 'Vergi Bilgileri',
    notes: 'Notlar:',
  },
  de: {
    invoice: 'Rechnung',
    invoiceNo: 'Rechnungsnr.:',
    invoiceDate: 'Rechnungsdatum:',
    deliveryDate: 'Leistungsdatum:',
    dueDate: 'Fälligkeitsdatum:',
    description: 'Beschreibung',
    quantity: 'Menge',
    unitPrice: 'Einzelpreis',
    total: 'Gesamtpreis',
    netAmount: 'Netto-Betrag:',
    vat: 'MwSt.',
    grossAmount: 'Rechnungsbetrag (Brutto):',
    bankDetails: 'Bankverbindung',
    bank: 'Bank:',
    taxDetails: 'Steuerangaben',
    notes: 'Bemerkungen:',
  }
};

export default function InvoicePreview({ companySettings, client, invoice, lang = 'tr' }: InvoicePreviewProps) {
  const dict = localDict[lang] || localDict.tr;
  const currencyLocale = invoice.currency === 'TRY' ? 'tr-TR' : 'de-DE';

  return (
    <div className="bg-white p-10 sm:p-14 text-zinc-900 shadow-2xl rounded-2xl max-w-4xl mx-auto text-[13px] font-sans leading-relaxed ring-1 ring-zinc-200/50" id="invoice-preview" style={{ minHeight: '1056px', position: 'relative' }}>
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-slate-800 to-zinc-600 rounded-t-2xl"></div>
      
      {/* Header */}
      <header className="flex justify-between items-start mb-20 pt-4">
        <div className="flex flex-col">
          {companySettings.logo ? (
            <img 
              src={companySettings.logo.startsWith('http') || companySettings.logo.startsWith('/') ? companySettings.logo : `/${companySettings.logo}`} 
              alt={companySettings.name} 
              className="h-12 w-auto mb-6 object-contain" 
              onError={(e) => e.currentTarget.style.display = 'none'} 
            />
          ) : null}
          {!companySettings.logo && (
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 mb-2">{companySettings.name}</h1>
          )}
          <p className="text-[11px] text-zinc-500 max-w-xs leading-relaxed">{companySettings.address}</p>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-light text-zinc-400 uppercase tracking-[0.25em] mb-8">{dict.invoice}</h2>
          <div className="grid grid-cols-[auto_auto] gap-x-6 gap-y-1.5 text-[11px] justify-end">
            <span className="text-zinc-400 text-right">{dict.invoiceNo}</span>
            <span className="font-semibold text-zinc-900 text-right">{invoice.invoiceNo}</span>
            
            <span className="text-zinc-400 text-right">{dict.invoiceDate}</span>
            <span className="font-medium text-zinc-800 text-right">{format(new Date(invoice.invoiceDate), 'dd.MM.yyyy')}</span>
            
            <span className="text-zinc-400 text-right">{dict.deliveryDate}</span>
            <span className="font-medium text-zinc-800 text-right">{format(new Date(invoice.deliveryDate), 'dd.MM.yyyy')}</span>
            
            <span className="text-zinc-400 text-right">{dict.dueDate}</span>
            <span className="font-medium text-zinc-800 text-right">{format(new Date(invoice.dueDate), 'dd.MM.yyyy')}</span>
          </div>
        </div>
      </header>

      {/* Addresses */}
      <div className="flex justify-between mb-20 pl-2">
        <div className="max-w-sm">
          <p className="text-[9px] text-zinc-400 mb-4 uppercase tracking-widest font-medium border-b border-zinc-200/60 inline-block pb-1">{companySettings.name} • {companySettings.address}</p>
          <h3 className="text-[15px] font-semibold text-zinc-900 mb-1">{client.name}</h3>
          <p className="text-zinc-600 text-xs leading-relaxed">{client.addressStreet}</p>
          <p className="text-zinc-600 text-xs leading-relaxed">{client.addressZip} {client.addressCity}</p>
          <p className="text-zinc-600 text-xs leading-relaxed">{client.addressCountry}</p>
          <div className="mt-4 text-[10px] text-zinc-400 space-y-0.5">
            {client.vatId && <p>USt-IdNr.: <span className="text-zinc-600">{client.vatId}</span></p>}
            {client.taxId && <p>Steuernummer: <span className="text-zinc-600">{client.taxId}</span></p>}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-zinc-900 text-zinc-900 text-[10px] uppercase tracking-widest">
              <th className="py-3 font-semibold w-[55%]">{dict.description}</th>
              <th className="py-3 font-semibold text-right">{dict.quantity}</th>
              <th className="py-3 font-semibold text-right">{dict.unitPrice}</th>
              <th className="py-3 font-semibold text-right">{dict.total}</th>
            </tr>
          </thead>
          <tbody className="text-zinc-700 text-xs">
            {invoice.items.map((item, idx) => (
              <tr key={idx} className="border-b border-zinc-100 group">
                <td className="py-4 pr-4 leading-relaxed">{item.description}</td>
                <td className="py-4 text-right tabular-nums">{Number(item.quantity)}</td>
                <td className="py-4 text-right tabular-nums">{new Intl.NumberFormat(currencyLocale, { style: 'currency', currency: invoice.currency }).format(Number(item.unitPrice))}</td>
                <td className="py-4 text-right font-medium text-zinc-900 tabular-nums">{new Intl.NumberFormat(currencyLocale, { style: 'currency', currency: invoice.currency }).format(Number(item.total))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-20">
        <div className="w-full sm:w-[45%] md:w-[35%] pt-2">
          {companySettings.isKleinunternehmer ? (
            <div className="flex justify-between items-baseline py-4 border-t-2 border-zinc-900 font-bold mt-2">
              <span className="uppercase tracking-widest text-[10px] text-zinc-900 mr-4">{lang === 'de' ? 'Rechnungsbetrag' : 'Fatura Tutarı'}</span>
              <span className="text-[17px] text-zinc-900 tabular-nums">{new Intl.NumberFormat(currencyLocale, { style: 'currency', currency: invoice.currency }).format(Number(invoice.netAmount))}</span>
            </div>
          ) : (
            <>
              <div className="flex justify-between py-2 text-xs text-zinc-500">
                <span>{dict.netAmount}</span>
                <span className="tabular-nums text-zinc-800">{new Intl.NumberFormat(currencyLocale, { style: 'currency', currency: invoice.currency }).format(Number(invoice.netAmount))}</span>
              </div>
              <div className="flex justify-between py-2 text-xs text-zinc-500">
                <span>{dict.vat} ({Number(invoice.taxRate)}%)</span>
                <span className="tabular-nums text-zinc-800">{new Intl.NumberFormat(currencyLocale, { style: 'currency', currency: invoice.currency }).format(Number(invoice.taxAmount))}</span>
              </div>
              <div className="flex justify-between items-baseline py-4 border-t-2 border-zinc-900 font-bold mt-2">
                <span className="uppercase tracking-widest text-[10px] text-zinc-900 mr-4">{dict.grossAmount}</span>
                <span className="text-[17px] text-zinc-900 tabular-nums">{new Intl.NumberFormat(currencyLocale, { style: 'currency', currency: invoice.currency }).format(Number(invoice.grossAmount))}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Notes */}
      {(() => {
        const diffDays = invoice.dueDate && invoice.invoiceDate 
          ? differenceInDays(new Date(invoice.dueDate), new Date(invoice.invoiceDate)) 
          : 14;
        
        let printNotes = invoice.notes 
          ? <div className="mb-24 pt-4 text-[11px]"><h4 className="font-semibold text-zinc-900 mb-2 uppercase tracking-widest">{dict.notes}</h4><p className="text-zinc-600 whitespace-pre-wrap leading-loose max-w-2xl">{invoice.notes}</p></div> 
          : <div className="mb-24"></div>;

        if (companySettings.isKleinunternehmer) {
          const kleinText = "Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.";
          if (invoice.notes) {
            printNotes = <div className="mb-24 pt-4 text-[11px]"><h4 className="font-semibold text-zinc-900 mb-2 uppercase tracking-widest">{dict.notes}</h4><p className="text-zinc-600 whitespace-pre-wrap leading-loose max-w-2xl">{invoice.notes}<br/><br/>{kleinText}</p></div>;
          } else {
            printNotes = <div className="mb-24 pt-4 text-[11px]"><p className="text-zinc-600 whitespace-pre-wrap leading-loose max-w-2xl">{kleinText}</p></div>;
          }
        } else if (!invoice.notes && lang === 'de') {
          printNotes = <div className="mb-24 text-[11px] text-zinc-500 leading-loose max-w-xl"><p>Bitte überweisen Sie den Rechnungsbetrag innerhalb von {diffDays} Tagen auf das unten angegebene Bankkonto unter Angabe der Rechnungsnummer.</p></div>;
        }

        return printNotes;
      })()}

      {/* Footer / Legal Info */}
      <footer className="absolute bottom-0 left-0 right-0 border-t border-zinc-200 px-10 sm:px-14 py-10 text-[9.5px] text-zinc-400 flex flex-col md:flex-row justify-between leading-loose tracking-wide">
        <div className="max-w-[30%]">
          <p className="font-semibold text-zinc-800 mb-2 uppercase tracking-widest">{companySettings.name}</p>
          <p>{companySettings.address}</p>
          <p>T: {companySettings.phone}</p>
          <p>E: {companySettings.email}</p>
          <p>W: {companySettings.website}</p>
        </div>
        <div className="max-w-[30%] mt-4 md:mt-0">
          <p className="font-semibold text-zinc-800 mb-2 uppercase tracking-widest">{dict.bankDetails}</p>
          <p>{companySettings.bankName}</p>
          <p>IBAN: <span className="font-mono text-zinc-600">{companySettings.iban}</span></p>
        </div>
        <div className="max-w-[30%] mt-4 md:mt-0">
          <p className="font-semibold text-zinc-800 mb-2 uppercase tracking-widest">{dict.taxDetails}</p>
          <p>St-Nr.: <span className="font-mono text-zinc-600">{companySettings.taxId}</span></p>
          <p>USt-IdNr.: <span className="font-mono text-zinc-600">{companySettings.vatId}</span></p>
        </div>
      </footer>
    </div>
  );
}
