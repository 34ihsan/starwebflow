"use client";

import { useState, useEffect } from "react";
import { 
  FileText, Search, Plus,
  CheckCircle2, Clock, Eye,
  Download, CreditCard, Send, Settings,
  Trash2, Users, Building2, Mail, Phone, MapPin, Edit3, X, UserPlus, Globe, LayoutTemplate,
  AlertCircle, ArrowRight, RefreshCw, Check
} from "lucide-react";

import { createInvoice, deleteInvoice, updateInvoice, updateInvoiceStatus } from "@/app/actions/invoice";
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
    closeBtn: 'Schließen',
    billedTo: 'Rechnungsempfänger',
    founderLabel: 'Inhaber'
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
    closeBtn: 'Kapat',
    billedTo: 'Fatura Edilen',
    founderLabel: 'Kurucu'
  };

  const itemsHtml = invoice.items.map((item: any) => `
    <tr class="border-b border-zinc-100 last:border-b-0">
      <td class="py-5 pl-2 font-medium text-zinc-900">${item.description || (lang === 'de' ? 'Produkt/Dienstleistung' : 'Ürün/Hizmet')}</td>
      <td class="py-5 text-center text-zinc-600 font-mono">${Number(item.quantity)}</td>
      <td class="py-5 text-right text-zinc-600 font-mono">${formatVal(Number(item.unitPrice))}</td>
      <td class="py-5 text-right font-semibold text-zinc-900 pr-2 font-mono">${formatVal(Number(item.total))}</td>
    </tr>
  `).join('');

  const logoHtml = companySettings.logo ? '<img src="' + companySettings.logo + '" alt="Logo" class="h-16 w-auto mb-6 object-contain" onerror="this.style.display=\'none\'" />' : `<h1 class="text-3xl font-bold tracking-tight text-zinc-900 mb-6">${companySettings.name}</h1>`;
  const websiteDisplay = (companySettings?.website || 'www.starwebflow.com').replace(/^https?:\/\//, '').replace(/\/$/, '');
  const founderDisplay = companySettings.founderName || 'Sinan Günay';
  
  const diffDays = invoice.dueDate && invoice.invoiceDate 
    ? Math.round((new Date(invoice.dueDate).getTime() - new Date(invoice.invoiceDate).getTime()) / (1000 * 3600 * 24))
    : 14;

  const isKlein = companySettings.isKleinunternehmer === true ||
    String(companySettings.vatRate) === "0" ||
    String(companySettings.isKleinunternehmer) === "true" ||
    Number(invoice.taxRate) === 0 ||
    Number(invoice.taxAmount) === 0;
  const defaultNotes = lang === 'de' ? `Bitte überweisen Sie den Rechnungsbetrag innerhalb von ${diffDays} Tagen auf das unten angegebene Bankkonto unter Angabe der Rechnungsnummer.` : "";

  let printNotes = '';
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { 
            font-family: 'Inter', sans-serif; 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
            background-color: #f4f4f5; 
            color: #1f2937;
            line-height: 1.5;
          }
          
          /* Print toolbar */
          .no-print { 
            position: fixed; 
            top: 16px; 
            right: 16px; 
            z-index: 50; 
            display: flex; 
            gap: 8px; 
          }
          .btn {
            cursor: pointer;
            padding: 10px 24px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            border: 1px solid transparent;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .btn-primary {
            background-color: #4f46e5;
            color: #ffffff;
          }
          .btn-primary:hover {
            background-color: #4338ca;
          }
          .btn-secondary {
            background-color: #ffffff;
            color: #374151;
            border-color: #e5e7eb;
          }
          .btn-secondary:hover {
            background-color: #f9fafb;
          }

          /* A4 Container Page Styling - Clean Flat Layout for 1:1 Screen/Print Match */
          .invoice-page {
            background-color: #ffffff;
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            position: relative;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
          .top-strip {
            height: 10px;
            background: linear-gradient(to right, #2563eb, #4f46e5, #7c3aed);
          }
          .page-content {
            padding: 40px 60px 20px 60px; /* Reduced from 60px 80px to save vertical space */
            flex-grow: 1;
            display: flex;
            flex-direction: column;
          }

          /* Header Layout */
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px; /* Reduced from 60px */
          }
          .company-info {
            flex-grow: 1;
          }
          .company-address {
            color: #6b7280;
            font-size: 13px;
            line-height: 1.5;
            margin-top: 12px;
            max-width: 320px;
            white-space: pre-wrap;
          }
          .company-contact {
            margin-top: 10px;
            font-size: 13px;
            color: #6b7280;
          }
          .company-contact div {
            margin-bottom: 2px;
          }
          
          .invoice-meta-box {
            text-align: right;
          }
          .invoice-title {
            font-size: 32px; /* Reduced from 36px */
            font-weight: 300;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #d1d5db;
            margin-bottom: 20px; /* Reduced from 32px */
          }
          .meta-card {
            background-color: #f9fafb;
            border: 1px solid #f3f4f6;
            border-radius: 12px;
            padding: 16px; /* Reduced from 20px */
            min-width: 250px;
            text-align: left;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          }
          .meta-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 13px;
            margin-bottom: 6px;
          }
          .meta-row-main {
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 8px;
            margin-bottom: 8px;
          }
          .meta-label {
            color: #6b7280;
          }
          .meta-value {
            font-weight: 500;
            color: #1f2937;
          }
          .meta-value-bold {
            font-weight: 700;
            color: #111827;
          }
          .meta-value-due {
            color: #4338ca;
            font-weight: 700;
          }

          /* Client Info Layout */
          .client-section {
            margin-bottom: 25px;
          }
          .client-title {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #9ca3af;
            font-weight: 600;
            margin-bottom: 6px;
            margin-left: 4px;
          }
          .client-card {
            background-color: #f9fafb;
            border: 1px solid #f3f4f6;
            border-radius: 12px;
            padding: 16px 20px;
            width: 100%; /* Make card full width */
            display: flex;
            justify-content: space-between;
            align-items: stretch;
            gap: 40px;
          }
          .client-details {
            flex: 1;
          }
          .client-name {
            font-size: 15px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 4px;
          }
          .client-address {
            font-size: 13px;
            color: #4b5563;
            line-height: 1.4;
          }
          .client-tax-info {
            flex-shrink: 0;
            width: 240px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            border-left: 1px solid #e5e7eb;
            padding-left: 20px;
            font-size: 12px;
            color: #6b7280;
          }
          .tax-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
          }
          .tax-row:last-child {
            margin-bottom: 0;
          }

          /* Items Table */
          .items-table-container {
            margin-bottom: 30px; /* Reduced from 40px */
            width: 100%;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
          }
          .items-table th {
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
            color: #6b7280;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .items-table td {
            padding: 14px 0; /* Reduced from 20px */
            border-bottom: 1px solid #f3f4f6;
            font-size: 13px;
            color: #374151;
            vertical-align: top;
          }
          .items-table tr:last-child td {
            border-bottom: none;
          }
          .item-description {
            font-weight: 500;
            color: #111827;
            padding-left: 8px;
          }
          .item-quantity {
            text-align: center;
            color: #4b5563;
            font-family: monospace;
          }
          .item-price {
            text-align: right;
            color: #4b5563;
            font-family: monospace;
          }
          .item-total {
            text-align: right;
            font-weight: 600;
            color: #111827;
            padding-right: 8px;
            font-family: monospace;
          }

          /* Totals Layout */
          .totals-section {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 25px; /* Reduced from 32px */
          }
          .totals-card {
            background-color: #f9fafb;
            border: 1px solid #f3f4f6;
            border-radius: 12px;
            padding: 16px 20px; /* Reduced from 24px */
            width: 300px;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 10px;
          }
          .totals-row-final {
            margin-bottom: 0;
            font-size: 15px;
            font-weight: 700;
            color: #111827;
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
          }
          .totals-row-final-gross {
            border-top: 1px solid #e5e7eb;
            padding-top: 12px;
            margin-top: 4px;
          }
          .gross-amount {
            color: #4f46e5;
            font-family: monospace;
            font-size: 18px;
            font-weight: 700;
            text-align: right;
            white-space: nowrap;
          }
          .net-amount {
            font-family: monospace;
          }

          /* §19 Box */
          .klein-box {
            margin-bottom: 25px; /* Reduced from 40px */
            background-color: #fffbeb;
            border: 1px solid #fde68a;
            border-radius: 12px;
            padding: 12px 20px;
          }
          .klein-box-title {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #92400e;
            margin-bottom: 4px;
          }
          .klein-box-text {
            font-size: 12px; /* Reduced from 13px */
            font-weight: 600;
            color: #78350f;
            line-height: 1.4;
          }
          .klein-box-subtext {
            font-size: 10px;
            color: #b45309;
            margin-top: 2px;
          }

          /* Notes layout */
          .notes-box {
            border-left: 4px solid #4f46e5;
            padding-left: 20px;
            padding-top: 4px;
            padding-bottom: 4px;
            margin-bottom: 30px; /* Reduced from 40px */
          }
          .notes-title {
            font-weight: 700;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #111827;
            margin-bottom: 6px;
          }
          .notes-text {
            font-size: 13px;
            color: #374151;
            line-height: 1.5;
            white-space: pre-wrap;
          }

          /* Footer Layout */
          .footer {
            border-top: 1px solid #e5e7eb;
            background-color: #fafafa;
            padding: 30px 60px; /* Reduced padding */
            display: flex;
            justify-content: space-between;
            gap: 32px;
            margin-top: auto; /* Push footer to the absolute bottom of page container */
          }
          .footer-col {
            flex: 1;
            font-size: 10px; /* Reduced from 11px */
            line-height: 1.6;
            color: #6b7280;
          }
          .footer-col-title {
            font-weight: 600;
            color: #374151;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 10px;
            font-size: 9px;
          }
          .footer-col span {
            font-family: monospace;
          }
          .klein-footer-text {
            margin-top: 6px;
            color: #b45309;
            font-weight: 600;
          }
          @page { 
            size: A4; 
            margin: 0 !important; /* Set margins to 0 to hide browser headers (RE-2026-0001, date, etc) and footers (about:blank, 1/1) */
          }
          @media print {
            .no-print { display: none !important; }
            html, body {
              height: auto !important;
              overflow: visible !important;
              background-color: #ffffff;
            }
            body { 
              font-size: 9.5px;
              padding: 15mm 20mm 20mm 20mm !important; /* Managed printable padding to offset the 0 margin */
              margin: 0 !important;
              box-sizing: border-box;
            }
            .invoice-page {
              width: 100% !important;
              height: auto !important;
              min-height: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
              border-radius: 0 !important;
              box-shadow: none !important;
              display: block !important;
              position: relative !important;
            }
            .page-content {
              padding: 0 !important;
              display: block !important;
            }
            .header {
              margin-bottom: 15px !important;
              page-break-inside: avoid;
            }
            .invoice-title {
              font-size: 20px !important;
              margin-bottom: 8px !important;
            }
            .meta-card {
              padding: 8px !important;
              min-width: 180px !important;
            }
            .meta-row {
              font-size: 9px !important;
              margin-bottom: 3px !important;
            }
            .meta-row-main {
              padding-bottom: 3px !important;
              margin-bottom: 3px !important;
            }
            .client-section {
              margin-bottom: 12px !important;
            }
            .client-card {
              padding: 8px 14px !important;
              display: flex !important;
              justify-content: space-between !important;
              align-items: stretch !important;
              width: 100% !important;
              gap: 20px !important;
            }
            .client-details {
              flex: 1 !important;
            }
            .client-name {
              font-size: 11px !important;
            }
            .client-address {
              font-size: 9px !important;
            }
            .client-tax-info {
              width: 180px !important;
              border-left: 1px solid #e5e7eb !important;
              padding-left: 15px !important;
              margin-top: 0 !important;
              padding-top: 0 !important;
              justify-content: center !important;
            }
            .items-table-container {
              margin-bottom: 12px !important;
            }
            .items-table th {
              font-size: 9px !important;
              padding-bottom: 4px !important;
            }
            .items-table td {
              padding: 6px 0 !important; 
              font-size: 10px !important;
            }
            .totals-section {
              margin-bottom: 12px !important;
            }
            .totals-card {
              padding: 8px 12px !important;
              width: 280px !important;
            }
            .totals-row {
              font-size: 9px !important;
              margin-bottom: 4px !important;
            }
            .totals-row-final {
              font-size: 11px !important;
            }
            .gross-amount {
              font-size: 12px !important;
            }
            .klein-box {
              padding: 6px 12px !important;
              margin-bottom: 10px !important;
              border-radius: 6px !important;
            }
            .klein-box-text {
              font-size: 9px !important;
            }
            .klein-box-subtext {
              font-size: 8px !important;
            }
            .notes-box {
              margin-bottom: 10px !important;
              padding-left: 10px !important;
            }
            .notes-title {
              font-size: 8.5px !important;
              margin-bottom: 3px !important;
            }
            .notes-text {
              font-size: 9px !important;
            }
            .footer {
              padding: 8px 0 0 0 !important;
              border-top: 1px solid #e5e7eb !important;
              background-color: transparent !important;
              position: fixed !important;
              bottom: 12mm !important;
              left: 20mm !important;
              right: 20mm !important;
              height: 82px !important; /* Increased to allow bottom spacing for page numbering and website */
              display: flex !important;
              page-break-inside: avoid;
            }
            .footer-col {
              font-size: 7.5px !important;
              line-height: 1.35 !important;
              padding-bottom: 15px !important; /* Reserve bottom space inside footer columns */
            }
            .footer-col-title {
              font-size: 7.5px !important;
              margin-bottom: 4px !important;
            }
            .invoice-page {
              padding-bottom: 110px !important; /* Safe offset for footer container height */
            }
            /* Custom Page Number Styles at footer bottom-right corner */
            .page-number-indicator {
              position: absolute;
              bottom: 2px;
              right: 0;
              font-size: 9px;
              color: #4b5563;
              font-weight: 600;
            }
            .page-number-indicator::after {
              content: "- " counter(page) " -";
            }
            body {
              counter-reset: page;
            }
            .invoice-page {
              counter-increment: page;
            }
          }
        </style>
      </head>
      <body>
        <!-- Print Toolbar -->
        <div class="no-print">
          <button onclick="window.print()" class="btn btn-primary">
            <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
            </svg>
            ${labels.saveBtn}
          </button>
          <button onclick="window.close()" class="btn btn-secondary">
            ${labels.closeBtn}
          </button>
        </div>

        <!-- Premium Invoice Container -->
        <div class="invoice-page">
          <!-- Top Strip -->
          <div class="top-strip"></div>
          
          <div class="page-content">
            <!-- Header -->
            <div class="header">
              <div class="company-info">
                ${companySettings.logo ? `<img src="${companySettings.logo}" alt="Logo" style="height: 64px; max-width: 200px; object-fit: contain; margin-bottom: 24px;" onerror="this.style.display='none'" />` : `<h1 style="font-size: 28px; font-weight: 700; tracking-tight: -0.025em; color: #111827; margin-bottom: 16px;">${companySettings.name}</h1>`}
                <div class="company-address">${companySettings.address}</div>
                <div class="company-contact">
                  ${companySettings.email ? `<div>E: ${companySettings.email}</div>` : ''}
                  ${companySettings.phone ? `<div>T: ${companySettings.phone}</div>` : ''}
                  <div>W: ${websiteDisplay}</div>
                </div>
              </div>
              <div class="invoice-meta-box">
                ${companySettings.showHeaderFounder !== false ? `
                <div style="text-align: right; margin-bottom: 12px;">
                  <div style="font-size: 20px; font-weight: 800; color: #111827; letter-spacing: -0.02em; line-height: 1.2;">
                    ${companySettings.name || 'Star Web Flow'}
                  </div>
                  ${founderDisplay ? `<div style="font-size: 11px; font-weight: 600; color: #4b5563; margin-top: 3px; letter-spacing: 0.05em; text-transform: uppercase;">
                    ${companySettings.founderTitle || labels.founderLabel}: ${founderDisplay}
                  </div>` : ''}
                </div>` : ''}
                <div class="invoice-title">${labels.title}</div>
                <div class="meta-card">
                  <div class="meta-row meta-row-main">
                    <span class="meta-label" style="font-weight: 600; text-transform: uppercase; font-size: 10px; letter-spacing: 0.1em;">${labels.invoiceNo}</span>
                    <span class="meta-value-bold" style="font-size: 14px;">${invoice.invoiceNo}</span>
                  </div>
                  <div class="meta-row">
                    <span class="meta-label">${labels.date}</span>
                    <span class="meta-value">${formatDate(invoice.invoiceDate)}</span>
                  </div>
                  <div class="meta-row">
                    <span class="meta-label">${labels.deliveryDate}</span>
                    <span class="meta-value">${formatDate(invoice.deliveryDate)}${invoice.deliveryEndDate ? ' - ' + formatDate(invoice.deliveryEndDate) : ''}</span>
                  </div>
                  <div class="meta-row" style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #e5e7eb;">
                    <span class="meta-label" style="font-weight: 600; color: #4f46e5;">${labels.dueDate}</span>
                    <span class="meta-value-due">${formatDate(invoice.dueDate)}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Client Info Address Card -->
            <div class="client-section">
              <div class="client-title">${labels.billedTo}</div>
              <div class="client-card">
                <div class="client-details">
                  <h3 class="client-name">${client.name || 'Müşteri'}</h3>
                  <div class="client-address">
                    <p>${client.addressStreet || ''}</p>
                    <p>${client.addressZip || ''} ${client.addressCity || ''}</p>
                    <p>${client.addressCountry || ''}</p>
                  </div>
                </div>

              </div>
            </div>

            <!-- Items Table -->
            <div class="items-table-container">
              <table class="items-table">
                <thead>
                  <tr>
                    <th style="width: 55%; text-align: left; padding-left: 8px;">${labels.description}</th>
                    <th style="width: 15%; text-align: center;">${labels.quantity}</th>
                    <th style="width: 15%; text-align: right;">${labels.unitPrice}</th>
                    <th style="width: 15%; text-align: right; padding-right: 8px;">${labels.total}</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoice.items.map((item: any) => `
                    <tr>
                      <td class="item-description">${item.description || (lang === 'de' ? 'Produkt/Dienstleistung' : 'Ürün/Hizmet')}</td>
                      <td class="item-quantity">${Number(item.quantity)}</td>
                      <td class="item-price">${formatVal(Number(item.unitPrice))}</td>
                      <td class="item-total">${formatVal(Number(item.total))}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- Totals Section -->
            <div class="totals-section">
              <div class="totals-card">
                ${isKlein ? `
                  <div class="totals-row totals-row-final">
                    <span style="font-weight: 500; color: #4b5563; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">${lang === 'de' ? 'Rechnungsbetrag' : 'Fatura Tutarı'}</span>
                    <span class="gross-amount" style="font-size: 20px;">${formatVal(invoice.netAmount)}</span>
                  </div>
                ` : `
                  <div class="totals-row">
                    <span>${labels.netAmount}</span>
                    <span class="net-amount">${formatVal(invoice.netAmount)}</span>
                  </div>
                  <div class="totals-row" style="padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
                    <span>${labels.vat} (${Number(invoice.taxRate)}%)</span>
                    <span class="net-amount">${formatVal(invoice.taxAmount)}</span>
                  </div>
                  <div class="totals-row totals-row-final totals-row-final-gross">
                    <span style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">${labels.grossAmount}</span>
                    <span class="gross-amount" style="font-size: 20px;">${formatVal(invoice.grossAmount)}</span>
                  </div>
                `}
              </div>
            </div>

            <!-- §19 UStG Legal Notice - Prominent Box -->
            ${isKlein ? `
              <div class="klein-box">
                <p class="klein-box-title">Hinweis / ${lang === 'tr' ? 'KDV Muafiyeti Notu' : 'Steuerhinweis'}</p>
                <p class="klein-box-text">Gem&auml;&szlig; &sect; 19 UStG wird keine Umsatzsteuer berechnet.</p>
                ${lang === 'tr' ? '<p class="klein-box-subtext">(Bu fatura &sect;19 UStG K&uuml;&ccedil;&uuml;k &Icirc;&scedil;letme Y&ouml;netmeli&gbreve;i kapsam&inodot;nda KDV\'den muaft&inodot;r.)</p>' : ''}
              </div>
            ` : ''}

            <!-- Notes -->
            ${invoice.notes ? `
              <div class="notes-box">
                <h4 class="notes-title">${labels.notes}</h4>
                <div class="notes-text">${invoice.notes}</div>
              </div>
            ` : (lang === 'de' && defaultNotes ? `
              <div class="notes-box">
                <h4 class="notes-title">${labels.notes}</h4>
                <div class="notes-text">${defaultNotes}</div>
              </div>
            ` : '')}

          </div>

          <!-- Premium Light Footer -->
          <footer class="footer">
            <div class="page-number-indicator"></div>
            <div class="footer-col">
              <h5 class="footer-col-title">${companySettings.name}</h5>
              ${companySettings.showFooterFounder !== false && founderDisplay ? `<p style="font-weight: 600; color: #4b5563; margin-bottom: 4px;">${companySettings.founderTitle || labels.founderLabel}: ${founderDisplay}</p>` : ''}
              <p style="white-space: pre-wrap; margin-bottom: 8px;">${companySettings.address || 'Adres bilgisi girilmedi'}</p>
              ${companySettings.email ? `<p>${companySettings.email}</p>` : ''}
              ${companySettings.phone ? `<p>${companySettings.phone}</p>` : ''}
              <p>${websiteDisplay}</p>
            </div>
            <div class="footer-col">
              <h5 class="footer-col-title">${labels.bankInfo}</h5>
              ${companySettings.bankName ? `<p>${companySettings.bankName}</p>` : '<p class="italic" style="opacity: 0.5;">Banka adı girilmedi</p>'}
              ${companySettings.iban ? `<p>IBAN: <span>${companySettings.iban}</span></p>` : ''}
              ${companySettings.swift ? `<p>BIC/SWIFT: <span>${companySettings.swift}</span></p>` : ''}
            </div>
            <div class="footer-col">
              <h5 class="footer-col-title">${labels.taxInfo}</h5>
              ${companySettings.taxId ? `<p>St-Nr.: <span>${companySettings.taxId}</span></p>` : '<p class="italic" style="opacity: 0.5;">Vergi no girilmedi</p>'}
              ${companySettings.vatId ? `<p>USt-IdNr.: <span>${companySettings.vatId}</span></p>` : ''}
              ${isKlein ? `<p class="klein-footer-text">Kleinunternehmer gem. &sect; 19 UStG</p>` : ''}
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
  const [activeMainTab, setActiveMainTab] = useState<"invoices" | "clients" | "approvals">("invoices");
  const [activeTab, setActiveTab] = useState<"all" | "paid" | "pending" | "overdue">("all");
  const [invoices, setInvoices] = useState<any[]>(initialInvoices || []);
  const [companies, setCompanies] = useState<any[]>(clientCompanies || []);

  useEffect(() => {
    setInvoices(initialInvoices || []);
  }, [initialInvoices]);

  useEffect(() => {
    setCompanies(clientCompanies || []);
  }, [clientCompanies]);

  const [isAddInvoiceModalOpen, setIsAddInvoiceModalOpen] = useState(false);
  const [editInvoiceId, setEditInvoiceId] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<any | null>(null);
  const [printLang, setPrintLang] = useState<'tr' | 'de'>('tr');
  const [searchQuery, setSearchQuery] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [sending, setSending] = useState(false);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState(tenantSettings || {});
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (tenantSettings) {
      setLocalSettings(tenantSettings);
    }
  }, [tenantSettings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const payload = {
        companyName: localSettings.name,
        preferences: {
          general: {
            supportEmail: localSettings.email || "info@starwebflow.com",
            supportPhone: localSettings.phone || "",
            website: localSettings.website || "www.starwebflow.com",
            founderName: localSettings.founderName || "Sinan Günay",
            founderTitle: localSettings.founderTitle || "Inhaber",
            currency: localSettings.bankCurrency || "EUR"
          },
          branding: {
            logoUrl: localSettings.logo || ""
          },
          billing: {
            legalName: localSettings.name,
            founderName: localSettings.founderName || "Sinan Günay",
            founderTitle: localSettings.founderTitle || "Inhaber",
            showHeaderFounder: localSettings.showHeaderFounder !== false,
            showFooterFounder: localSettings.showFooterFounder !== false,
            email: localSettings.email || "info@starwebflow.com",
            phone: localSettings.phone || "",
            address: localSettings.address || "",
            taxNumber: localSettings.taxId || "",
            vatId: localSettings.vatId || "",
            bankName: localSettings.bankName || "",
            iban: localSettings.iban || "",
            swift: localSettings.swift || "",
            bankCurrency: localSettings.bankCurrency || "EUR",
            website: localSettings.website || "www.starwebflow.com",
            isKleinunternehmer: localSettings.isKleinunternehmer === true,
            vatRate: localSettings.isKleinunternehmer ? "0" : "19"
          }
        }
      };

      const res = await updateTenantSettings(tenantId, payload);
      if (res.success) {
        setIsSettingsModalOpen(false);
        setLocalSettings({ ...localSettings });
        Object.assign(tenantSettings, localSettings);
        alert("Fatura & şirket iletişim bilgileri başarıyla kaydedildi!");
      } else {
        alert("Ayarlar kaydedilemedi: " + (res.error || "Bilinmeyen hata"));
      }
    } catch (err: any) {
      console.error("Save settings error:", err);
      alert("Bir hata oluştu: " + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  // Client management state
  const [editingClient, setEditingClient] = useState<any | null>(null);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [clientFormData, setClientFormData] = useState({ name: "", email: "", phone: "", addressStreet: "", addressCity: "", addressZip: "", addressCountry: "Germany", taxId: "", vatId: "", contactPerson: "" });
  const [savingClient, setSavingClient] = useState(false);

  const [invoiceData, setInvoiceData] = useState({
    invoiceNo: "",
    projectId: "",
    clientCompanyId: "",
    currency: "EUR",
    taxRate: 19,
    status: "PENDING",
    invoiceDate: new Date().toISOString().split('T')[0],
    deliveryDate: new Date().toISOString().split('T')[0],
    deliveryEndDate: "",
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: "",
    items: [{ description: "", quantity: 1, unitPrice: 0 }]
  });

  // Approval / Collection state
  const [approvingInvoice, setApprovingInvoice] = useState<any | null>(null);
  const [approvalMethod, setApprovalMethod] = useState<string>("Banka Havalesi / SEPA");
  const [approvalDate, setApprovalDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [approvalNotes, setApprovalNotes] = useState<string>("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  const handleQuickStatusChange = async (invoice: any, newStatus: string) => {
    if (newStatus === 'PAID') {
      setApprovingInvoice(invoice);
      setApprovalDate(new Date().toISOString().split('T')[0]);
      setApprovalMethod("Banka Havalesi / SEPA");
      setApprovalNotes("");
      return;
    }

    try {
      setIsUpdatingStatus(true);
      const res = await updateInvoiceStatus(invoice.id, tenantId, newStatus);
      if (res.success && res.data) {
        setInvoices(prev => prev.map(inv => inv.id === invoice.id ? { ...inv, status: newStatus.toUpperCase() } : inv));
      } else {
        alert("Durum güncellenemedi: " + (res.error || "Bilinmeyen hata"));
      }
    } catch (err: any) {
      alert("Hata: " + err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleConfirmApproval = async () => {
    if (!approvingInvoice) return;
    setIsUpdatingStatus(true);
    try {
      const noteMsg = `[Tahsilat Onayı] Tarih: ${approvalDate} | Yöntem: ${approvalMethod}${approvalNotes ? ` | Not: ${approvalNotes}` : ''}`;
      const res = await updateInvoiceStatus(approvingInvoice.id, tenantId, 'PAID', noteMsg);
      if (res.success && res.data) {
        setInvoices(prev => prev.map(inv => inv.id === approvingInvoice.id ? { 
          ...inv, 
          status: 'PAID',
          notes: res.data.notes || inv.notes 
        } : inv));
        const approvedNo = approvingInvoice.invoiceNo;
        setApprovingInvoice(null);
        alert(`✓ ${approvedNo} numaralı faturanın tahsilatı başarıyla onaylandı ve kaydedildi!`);
      } else {
        alert("Tahsilat onaylanamadı: " + (res.error || "Bilinmeyen hata"));
      }
    } catch (err: any) {
      console.error(err);
      alert("Tahsilat onaylanırken hata oluştu: " + err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const [newClientData, setNewClientData] = useState({
    name: "", email: "", addressStreet: "", addressCity: "", addressZip: "", addressCountry: "Germany", taxId: "", vatId: ""
  });
  
  const [isCreatingNewClient, setIsCreatingNewClient] = useState(false);
  const [loading, setLoading] = useState(false);

  // Stats
  const monthlyRevenue = invoices.filter(i => (i.status || '').toUpperCase() === 'PAID').reduce((acc, curr) => acc + Number(curr.grossAmount || curr.amount || 0), 0);
  const pendingAmount = invoices.filter(i => ['PENDING', 'DRAFT'].includes((i.status || '').toUpperCase())).reduce((acc, curr) => acc + Number(curr.grossAmount || curr.amount || 0), 0);
  const overdueAmount = invoices.filter(i => (i.status || '').toUpperCase() === 'OVERDUE').reduce((acc, curr) => acc + Number(curr.grossAmount || curr.amount || 0), 0);
  
  const filteredInvoices = invoices.filter(invoice => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
                          (invoice.invoiceNo || "").toLowerCase().includes(q) || 
                          (invoice.clientCompany?.name || invoice.project?.client?.name || "").toLowerCase().includes(q) ||
                          (invoice.project?.title || "").toLowerCase().includes(q) ||
                          (invoice.notes || "").toLowerCase().includes(q);
    if (!matchesSearch) return false;
    if (activeTab === "all") return true;
    const invStatus = (invoice.status || '').toLowerCase();
    if (activeTab === "pending") {
      return invStatus === "pending" || invStatus === "draft";
    }
    return invStatus === activeTab.toLowerCase();
  });

  const calculateTotals = () => {
    const netAmount = invoiceData.items.reduce((acc, item) => acc + ((item.quantity || 0) * (item.unitPrice || 0)), 0);
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
        quantity: item.quantity || 0,
        unitPrice: item.unitPrice || 0,
        total: (item.quantity || 0) * (item.unitPrice || 0)
      }));

      const payload = {
        tenantId: tenantId,
        invoiceNo: invoiceData.invoiceNo?.trim() || undefined,
        projectId: invoiceData.projectId || undefined,
        clientCompanyId: finalClientId,
        netAmount,
        taxRate: invoiceData.taxRate,
        taxAmount,
        grossAmount,
        currency: invoiceData.currency,
        status: invoiceData.status || 'PENDING',
        invoiceDate: invoiceData.invoiceDate ? new Date(invoiceData.invoiceDate) : undefined,
        deliveryDate: invoiceData.deliveryDate ? new Date(invoiceData.deliveryDate) : undefined,
        deliveryEndDate: invoiceData.deliveryEndDate ? new Date(invoiceData.deliveryEndDate) : undefined,
        dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate) : undefined,
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
        invoiceNo: invoiceData.invoiceNo?.trim() || "TASLAK-001",
        invoiceDate: new Date(invoiceData.invoiceDate),
        deliveryDate: new Date(invoiceData.deliveryDate),
        deliveryEndDate: invoiceData.deliveryEndDate ? new Date(invoiceData.deliveryEndDate) : undefined,
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
        deliveryEndDate: viewInvoice.deliveryEndDate ? new Date(viewInvoice.deliveryEndDate) : undefined,
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
              onClick={() => {
                const inv = viewInvoice;
                setViewInvoice(null);
                handleEditInvoice(inv);
              }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors flex items-center gap-2 font-medium"
              title="Faturayı Düzenle"
            >
              <Edit3 className="w-4 h-4" /> Düzenle
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

  const handleOpenNewInvoice = () => {
    setEditInvoiceId(null);
    setIsCreatingNewClient(false);

    // Auto-calculate next invoice number
    const year = new Date().getFullYear();
    const prefix = `RE-${year}-`;
    let maxNum = 0;
    invoices.forEach(i => {
      if (i.invoiceNo && i.invoiceNo.startsWith(prefix)) {
        const parts = i.invoiceNo.split('-');
        if (parts.length === 3) {
          const num = parseInt(parts[2], 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      }
    });
    const defaultInvoiceNo = `${prefix}${(maxNum + 1).toString().padStart(4, '0')}`;

    setInvoiceData({
      invoiceNo: defaultInvoiceNo,
      projectId: "",
      clientCompanyId: "",
      currency: "EUR",
      taxRate: 19,
      status: "PENDING",
      invoiceDate: new Date().toISOString().split('T')[0],
      deliveryDate: new Date().toISOString().split('T')[0],
      deliveryEndDate: "",
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: "",
      items: [{ description: "", quantity: 1, unitPrice: 0 }]
    });
    setIsAddInvoiceModalOpen(true);
  };

  const handleEditInvoice = (invoice: any) => {
    setEditInvoiceId(invoice.id);
    setInvoiceData({
      invoiceNo: invoice.invoiceNo || "",
      projectId: invoice.projectId || "",
      clientCompanyId: invoice.clientCompanyId || "",
      currency: invoice.currency || "EUR",
      taxRate: invoice.taxRate !== undefined && invoice.taxRate !== null ? Number(invoice.taxRate) : 19,
      status: (invoice.status || "PENDING").toUpperCase(),
      invoiceDate: invoice.invoiceDate ? new Date(invoice.invoiceDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      deliveryDate: invoice.deliveryDate ? new Date(invoice.deliveryDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      deliveryEndDate: invoice.deliveryEndDate ? new Date(invoice.deliveryEndDate).toISOString().split('T')[0] : "",
      dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: invoice.notes || "",
      items: invoice.items && invoice.items.length > 0 ? invoice.items.map((item: any) => ({
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
          {activeMainTab === 'invoices' && (
            <>
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                <input
                  type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Fatura no veya firma ara..."
                  className="bg-[#0A0A0F] border border-white/[0.05] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#4F8EF7]/50 transition-colors w-64 placeholder:text-[#64748B]"
                />
              </div>
              <button 
                onClick={() => {
                  setLocalSettings({ ...tenantSettings, ...localSettings });
                  setIsSettingsModalOpen(true);
                }}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all"
                title="Fatura & Şirket Bilgileri Ayarları"
              >
                <Settings className="w-4 h-4 text-[#94A3B8]" />
                <span className="hidden sm:inline">Fatura Ayarları</span>
              </button>
              <button onClick={handleOpenNewInvoice}
                className="flex items-center gap-2 bg-gradient-to-r from-[#4F8EF7] to-purple-600 hover:opacity-90 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-[0_0_20px_rgba(79,142,247,0.3)]">
                <Plus className="w-4 h-4" /> Yeni Fatura Kes
              </button>
            </>
          )}
          {activeMainTab === 'clients' && (
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
          {activeMainTab === 'approvals' && (
            <>
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                <input
                  type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Fatura veya müşteri ara..."
                  className="bg-[#0A0A0F] border border-white/[0.05] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-amber-500/50 transition-colors w-64 placeholder:text-[#64748B]"
                />
              </div>
              <button onClick={handleOpenNewInvoice}
                className="flex items-center gap-2 bg-gradient-to-r from-[#4F8EF7] to-purple-600 hover:opacity-90 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-[0_0_20px_rgba(79,142,247,0.3)]">
                <Plus className="w-4 h-4" /> Yeni Fatura Kes
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex flex-wrap gap-1 bg-white/5 border border-white/10 rounded-xl p-1 w-fit">
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
        <button
          onClick={() => setActiveMainTab('approvals')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeMainTab === 'approvals'
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
              : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" /> Tahsilat & Ödeme Onayı
          <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
            activeMainTab === 'approvals' ? 'bg-white/20 text-white' : 'bg-amber-400/20 text-amber-400'
          }`}>{invoices.filter(i => ['PENDING', 'DRAFT', 'OVERDUE'].includes((i.status || '').toUpperCase())).length}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div 
          onClick={() => setActiveTab('all')}
          className={`bg-[#0A0A0F] border p-6 rounded-2xl relative overflow-hidden group cursor-pointer transition-all ${
            activeTab === 'all' ? 'border-[#4F8EF7]/50 ring-1 ring-[#4F8EF7]/30 shadow-lg shadow-[#4F8EF7]/10' : 'border-white/[0.05] hover:border-white/20'
          }`}
        >
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
        <div 
          onClick={() => setActiveTab('paid')}
          className={`bg-[#0A0A0F] border p-6 rounded-2xl relative overflow-hidden group cursor-pointer transition-all ${
            activeTab === 'paid' ? 'border-[#10B981]/50 ring-1 ring-[#10B981]/30 shadow-lg shadow-[#10B981]/10' : 'border-white/[0.05] hover:border-white/20'
          }`}
        >
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
        <div 
          onClick={() => setActiveTab('pending')}
          className={`bg-[#0A0A0F] border p-6 rounded-2xl relative overflow-hidden group cursor-pointer transition-all ${
            activeTab === 'pending' ? 'border-amber-400/50 ring-1 ring-amber-400/30 shadow-lg shadow-amber-400/10' : 'border-white/[0.05] hover:border-white/20'
          }`}
        >
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
        <div 
          onClick={() => setActiveMainTab('clients')}
          className={`bg-[#0A0A0F] border p-6 rounded-2xl relative overflow-hidden group cursor-pointer transition-all ${
            activeMainTab === 'clients' ? 'border-[#4F8EF7]/50 ring-1 ring-[#4F8EF7]/30' : 'border-white/[0.05] hover:border-white/20'
          }`}
        >
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

      {/* Invoice Filter Pills (Only in invoices tab) */}
      {activeMainTab === 'invoices' && (
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
          {[
            { id: 'all', label: 'Tüm Faturalar', count: invoices.length },
            { id: 'paid', label: 'Tahsil Edilenler', count: invoices.filter(i => (i.status || '').toUpperCase() === 'PAID').length },
            { id: 'pending', label: 'Bekleyen / Taslak', count: invoices.filter(i => ['PENDING', 'DRAFT'].includes((i.status || '').toUpperCase())).length },
            { id: 'overdue', label: 'Gecikmiş', count: invoices.filter(i => (i.status || '').toUpperCase() === 'OVERDUE').length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 border ${
                activeTab === tab.id
                  ? 'bg-[#4F8EF7] text-white border-[#4F8EF7] shadow-sm shadow-[#4F8EF7]/30'
                  : 'bg-white/5 text-[#94A3B8] border-white/5 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-white/10 text-[#64748B]'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      )}

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
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-[#64748B]">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#64748B]" />
                    <p className="font-semibold text-white/80 text-sm">Fatura bulunamadı</p>
                    <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
                      {searchQuery ? `"${searchQuery}" aramasıyla eşleşen fatura bulunamadı.` : 'Bu filtrede henüz kayıtlı fatura bulunmuyor.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(invoice => (
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
                    <div className="flex items-center gap-2">
                      <select
                        value={(invoice.status || 'PENDING').toUpperCase()}
                        onChange={(e) => handleQuickStatusChange(invoice, e.target.value)}
                        disabled={isUpdatingStatus}
                        className={`text-xs font-bold rounded-lg px-2.5 py-1 border transition-colors cursor-pointer focus:outline-none ${
                          (invoice.status || '').toUpperCase() === 'PAID' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                            : (invoice.status || '').toUpperCase() === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : (invoice.status || '').toUpperCase() === 'OVERDUE'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-white/5 text-[#94A3B8] border-white/10'
                        }`}
                      >
                        <option value="PENDING" className="bg-[#12121A] text-amber-400">Ödeme Bekliyor</option>
                        <option value="PAID" className="bg-[#12121A] text-emerald-400">Tahsil Edildi (Ödendi)</option>
                        <option value="OVERDUE" className="bg-[#12121A] text-rose-400">Gecikti</option>
                        <option value="DRAFT" className="bg-[#12121A] text-slate-400">Taslak</option>
                        <option value="CANCELLED" className="bg-[#12121A] text-red-500">İptal Edildi</option>
                      </select>

                      {(invoice.status || '').toUpperCase() !== 'PAID' && (
                        <button
                          type="button"
                          onClick={() => {
                            setApprovingInvoice(invoice);
                            setApprovalDate(new Date().toISOString().split('T')[0]);
                            setApprovalMethod("Banka Havalesi / SEPA");
                            setApprovalNotes("");
                          }}
                          className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold transition-all flex items-center gap-1 shadow-sm whitespace-nowrap"
                          title="Tahsilatı Onayla"
                        >
                          <Check className="w-3 h-3" /> Onayla
                        </button>
                      )}
                    </div>
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
                          const mappedInvoice = {
                            ...invoice,
                            taxRate: Number(invoice.taxRate !== undefined && invoice.taxRate !== null ? invoice.taxRate : 19),
                            netAmount: Number(invoice.netAmount || 0),
                            taxAmount: Number(invoice.taxAmount || 0),
                            grossAmount: Number(invoice.grossAmount || invoice.amount || 0)
                          };
                          handlePrintInvoice(tenantSettings, client, mappedInvoice, defaultLang);
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
              )))}
            </tbody>
          </table>
        </div>
      </div>
      )} {/* end invoices tab */}

      {/* ============ APPROVALS / TAHSİLAT ONAYI TAB ============ */}
      {activeMainTab === 'approvals' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Executive Tahsilat KPI Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-[#0A0A0F] border border-amber-500/20 p-5 rounded-2xl relative overflow-hidden">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#94A3B8]">Onay Bekleyen Tahsilat</p>
                  <h4 className="text-xl font-bold text-amber-400 font-mono mt-0.5">
                    {formatCurrency(pendingAmount, "EUR")}
                  </h4>
                </div>
              </div>
              <p className="text-[11px] text-[#64748B]">
                {invoices.filter(i => ['PENDING', 'DRAFT'].includes((i.status || '').toUpperCase())).length} adet fatura tahsilat bekliyor
              </p>
            </div>

            <div className="bg-[#0A0A0F] border border-emerald-500/20 p-5 rounded-2xl relative overflow-hidden">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#94A3B8]">Tahsil Edilen (Onaylı)</p>
                  <h4 className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
                    {formatCurrency(monthlyRevenue, "EUR")}
                  </h4>
                </div>
              </div>
              <p className="text-[11px] text-[#64748B]">
                {invoices.filter(i => (i.status || '').toUpperCase() === 'PAID').length} adet fatura kasaya girdi
              </p>
            </div>

            <div className="bg-[#0A0A0F] border border-rose-500/20 p-5 rounded-2xl relative overflow-hidden">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 text-rose-400">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#94A3B8]">Gecikmiş Ödemeler</p>
                  <h4 className="text-xl font-bold text-rose-400 font-mono mt-0.5">
                    {formatCurrency(overdueAmount, "EUR")}
                  </h4>
                </div>
              </div>
              <p className="text-[11px] text-[#64748B]">
                {invoices.filter(i => (i.status || '').toUpperCase() === 'OVERDUE').length} adet faturanın vadesi doldu
              </p>
            </div>

            <div className="bg-[#0A0A0F] border border-indigo-500/20 p-5 rounded-2xl relative overflow-hidden">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#94A3B8]">Tahsilat Başarı Oranı</p>
                  <h4 className="text-xl font-bold text-indigo-400 font-mono mt-0.5">
                    {monthlyRevenue + pendingAmount > 0 
                      ? `%${Math.round((monthlyRevenue / (monthlyRevenue + pendingAmount)) * 100)}` 
                      : '%100'}
                  </h4>
                </div>
              </div>
              <p className="text-[11px] text-[#64748B]">
                Toplam {invoices.length} fatura üzerinden
              </p>
            </div>
          </div>

          {/* Section 1: Onay Bekleyen Faturalar (Tahsilat Bekleyenler) */}
          <div className="bg-[#0A0A0F] border border-white/[0.08] rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  Onay Bekleyen Faturalar & Tahsilat Girişi
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1">
                  Müşteriden ödemesi alınan faturaları buradan doğrudan onaylayıp tahsilatı sisteme işleyebilirsiniz.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-bold w-fit">
                {invoices.filter(i => ['PENDING', 'DRAFT', 'OVERDUE'].includes((i.status || '').toUpperCase())).length} Bekleyen Fatura
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.05] font-semibold text-xs text-[#64748B] uppercase tracking-wider bg-white/[0.01]">
                    <th className="py-4 px-6">Fatura No / Müşteri</th>
                    <th className="py-4 px-6">Bekleyen Tutar</th>
                    <th className="py-4 px-6">Fatura & Vade Tarihi</th>
                    <th className="py-4 px-6">Vade Durumu</th>
                    <th className="py-4 px-6">Mevcut Durum</th>
                    <th className="py-4 px-6 text-right">Tahsilat Onayı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05] text-sm">
                  {invoices.filter(i => ['PENDING', 'DRAFT', 'OVERDUE'].includes((i.status || '').toUpperCase())).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-14 text-center text-[#64748B]">
                        <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-400/50" />
                        <p className="font-semibold text-white/90 text-sm">Harika! Bekleyen tahsilat bulunmuyor.</p>
                        <p className="text-xs text-[#64748B] mt-1">Tüm faturalarınız başarıyla tahsil edilmiş ve onaylanmış durumda.</p>
                      </td>
                    </tr>
                  ) : (
                    invoices
                      .filter(i => ['PENDING', 'DRAFT', 'OVERDUE'].includes((i.status || '').toUpperCase()))
                      .filter(i => {
                        const q = searchQuery.toLowerCase().trim();
                        if (!q) return true;
                        return (i.invoiceNo || "").toLowerCase().includes(q) ||
                               (i.clientCompany?.name || i.project?.client?.name || "").toLowerCase().includes(q) ||
                               (i.notes || "").toLowerCase().includes(q);
                      })
                      .map(invoice => {
                        const diffDays = invoice.dueDate 
                          ? Math.ceil((new Date(invoice.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
                          : null;

                        return (
                          <tr key={invoice.id} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="py-4 px-6">
                              <div onClick={() => handleViewInvoice(invoice)} className="font-semibold text-white flex items-center gap-2 group-hover:text-[#4F8EF7] transition-colors cursor-pointer">
                                <FileText className="w-4 h-4 text-amber-400" />
                                {invoice.invoiceNo}
                              </div>
                              <div className="text-xs text-[#94A3B8] mt-1 font-medium">
                                {invoice.clientCompany?.name || invoice.project?.client?.name || "Bilinmiyor"}
                              </div>
                            </td>
                            <td className="py-4 px-6 font-mono text-white text-base font-bold">
                              {formatCurrency(Number(invoice.grossAmount || invoice.amount || 0), invoice.currency || 'EUR')}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex flex-col gap-0.5 text-xs font-mono">
                                <span className="text-[#94A3B8]">Düzenleme: {new Date(invoice.invoiceDate || invoice.createdAt).toLocaleDateString('tr-TR')}</span>
                                <span className="text-amber-300 font-semibold">Vade: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('tr-TR') : '-'}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              {diffDays !== null ? (
                                diffDays < 0 ? (
                                  <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {Math.abs(diffDays)} gün gecikti
                                  </span>
                                ) : diffDays === 0 ? (
                                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                                    Bugün son gün!
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-xs font-medium text-[#94A3B8] bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                                    {diffDays} gün kaldı
                                  </span>
                                )
                              ) : (
                                <span className="text-xs text-[#64748B]">-</span>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              <select
                                value={(invoice.status || 'PENDING').toUpperCase()}
                                onChange={(e) => handleQuickStatusChange(invoice, e.target.value)}
                                disabled={isUpdatingStatus}
                                className="text-xs font-bold rounded-lg px-2.5 py-1 bg-[#12121A] text-amber-400 border border-amber-500/30 cursor-pointer focus:outline-none"
                              >
                                <option value="PENDING" className="text-amber-400">Bekliyor (PENDING)</option>
                                <option value="OVERDUE" className="text-rose-400">Gecikti (OVERDUE)</option>
                                <option value="DRAFT" className="text-slate-400">Taslak (DRAFT)</option>
                                <option value="CANCELLED" className="text-red-500">İptal (CANCELLED)</option>
                              </select>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setApprovingInvoice(invoice);
                                    setApprovalDate(new Date().toISOString().split('T')[0]);
                                    setApprovalMethod("Banka Havalesi / SEPA");
                                    setApprovalNotes("");
                                  }}
                                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" /> Tahsilatı Onayla
                                </button>
                                <button 
                                  onClick={() => handleViewInvoice(invoice)} 
                                  className="p-2 hover:bg-white/[0.05] rounded-lg text-[#64748B] hover:text-white transition-colors" 
                                  title="Görüntüle"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Son Tamamlanan / Tahsil Edilen Faturalar (PAID) */}
          <div className="bg-[#0A0A0F] border border-white/[0.08] rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Tamamlanan Tahsilatlar (Tahsil Edildi)
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1">
                  Onaylanmış ve kasaya girmiş tüm faturaların detaylı tahsilat kaydı.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold w-fit">
                {invoices.filter(i => (i.status || '').toUpperCase() === 'PAID').length} Onaylı Tahsilat
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.05] font-semibold text-xs text-[#64748B] uppercase tracking-wider bg-white/[0.01]">
                    <th className="py-4 px-6">Fatura No / Müşteri</th>
                    <th className="py-4 px-6">Tahsil Edilen Tutar</th>
                    <th className="py-4 px-6">Fatura & Vade Tarihi</th>
                    <th className="py-4 px-6">Tahsilat Notu & İşlem Bilgisi</th>
                    <th className="py-4 px-6">Durum</th>
                    <th className="py-4 px-6 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05] text-sm">
                  {invoices.filter(i => (i.status || '').toUpperCase() === 'PAID').length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#64748B]">
                        Henüz onaylanmış tahsilat kaydı bulunmuyor.
                      </td>
                    </tr>
                  ) : (
                    invoices
                      .filter(i => (i.status || '').toUpperCase() === 'PAID')
                      .filter(i => {
                        const q = searchQuery.toLowerCase().trim();
                        if (!q) return true;
                        return (i.invoiceNo || "").toLowerCase().includes(q) ||
                               (i.clientCompany?.name || i.project?.client?.name || "").toLowerCase().includes(q) ||
                               (i.notes || "").toLowerCase().includes(q);
                      })
                      .map(invoice => (
                        <tr key={invoice.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="py-4 px-6">
                            <div onClick={() => handleViewInvoice(invoice)} className="font-semibold text-white flex items-center gap-2 group-hover:text-[#4F8EF7] transition-colors cursor-pointer">
                              <FileText className="w-4 h-4 text-emerald-400" />
                              {invoice.invoiceNo}
                            </div>
                            <div className="text-xs text-[#94A3B8] mt-1 font-medium">
                              {invoice.clientCompany?.name || invoice.project?.client?.name || "Bilinmiyor"}
                            </div>
                          </td>
                          <td className="py-4 px-6 font-mono text-emerald-400 text-base font-bold">
                            {formatCurrency(Number(invoice.grossAmount || invoice.amount || 0), invoice.currency || 'EUR')}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex flex-col gap-0.5 text-xs font-mono text-[#94A3B8]">
                              <span>Tarih: {new Date(invoice.invoiceDate || invoice.createdAt).toLocaleDateString('tr-TR')}</span>
                              <span>Vade: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('tr-TR') : '-'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 max-w-xs">
                            <div className="text-xs text-[#94A3B8] truncate" title={invoice.notes || ''}>
                              {invoice.notes || <span className="italic text-[#64748B]">Not eklenmemiş</span>}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">
                              <Check className="w-3.5 h-3.5" /> Tahsil Edildi
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`${invoice.invoiceNo} numaralı faturanın durumunu tekrar "Ödeme Bekliyor" olarak değiştirmek istiyor musunuz?`)) {
                                    handleQuickStatusChange(invoice, 'PENDING');
                                  }
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#94A3B8] hover:text-white text-xs font-medium border border-white/5 transition-colors cursor-pointer"
                                title="Onayı Geri Al"
                              >
                                Geri Al
                              </button>
                              <button 
                                onClick={() => handleViewInvoice(invoice)} 
                                className="p-2 hover:bg-white/[0.05] rounded-lg text-[#64748B] hover:text-white transition-colors" 
                                title="Görüntüle"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => {
                                  const client = invoice.clientCompany || invoice.project?.client || {};
                                  const defaultLang = (client.addressCountry?.toLowerCase().includes('de') || client.addressCountry?.toLowerCase().includes('almanya') || invoice.currency === 'EUR') ? 'de' : 'tr';
                                  const mappedInvoice = {
                                    ...invoice,
                                    taxRate: Number(invoice.taxRate !== undefined && invoice.taxRate !== null ? invoice.taxRate : 19),
                                    netAmount: Number(invoice.netAmount || 0),
                                    taxAmount: Number(invoice.taxAmount || 0),
                                    grossAmount: Number(invoice.grossAmount || invoice.amount || 0)
                                  };
                                  handlePrintInvoice(tenantSettings, client, mappedInvoice, defaultLang);
                                }} 
                                className="p-2 hover:bg-white/[0.05] rounded-lg text-[#64748B] hover:text-white transition-colors" 
                                title="PDF İndir"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )} {/* end approvals tab */}

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

      {/* INVOICE SETTINGS MODAL */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[60] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl max-w-2xl w-full shadow-2xl my-auto flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-white/5 flex justify-between items-center sticky top-0 bg-[#0A0A0F] z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4F8EF7]/10 border border-[#4F8EF7]/20 flex items-center justify-center text-[#4F8EF7]">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Fatura & Şirket Bilgileri Ayarları</h3>
                  <p className="text-xs text-[#94A3B8]">Faturalarınızda, alt bilgi ve PDF çıktılarında görünecek bilgiler</p>
                </div>
              </div>
              <button 
                onClick={() => setIsSettingsModalOpen(false)} 
                className="text-[#64748B] hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="p-6 space-y-6 overflow-y-auto">
              {/* Bölüm 1: Şirket & İletişim Bilgileri */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-[#4F8EF7] uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> Şirket & İletişim Bilgileri
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Şirket / Yasal Ünvan *</label>
                    <input 
                      type="text" 
                      required
                      value={localSettings.name || ""} 
                      onChange={e => setLocalSettings({...localSettings, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-[#4F8EF7] focus:outline-none" 
                      placeholder="Star Web Flow" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Kurucu / Yetkili Adı (Inhaber / Founder)</label>
                    <input 
                      type="text" 
                      value={localSettings.founderName || ""} 
                      onChange={e => setLocalSettings({...localSettings, founderName: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-[#4F8EF7] focus:outline-none" 
                      placeholder="Sinan Günay" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Fatura / İletişim E-Postası *</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="email" 
                        required
                        value={localSettings.email || ""} 
                        onChange={e => setLocalSettings({...localSettings, email: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-[#4F8EF7] focus:outline-none" 
                        placeholder="info@starwebflow.com" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Telefon Numarası</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        value={localSettings.phone || ""} 
                        onChange={e => setLocalSettings({...localSettings, phone: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-[#4F8EF7] focus:outline-none" 
                        placeholder="+49 ..." 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Web Sitesi</label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        value={localSettings.website || ""} 
                        onChange={e => setLocalSettings({...localSettings, website: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-[#4F8EF7] focus:outline-none" 
                        placeholder="www.starwebflow.com" 
                      />
                    </div>
                  </div>
                </div>

                {/* Gösterim Seçenekleri (Header & Footer) */}
                <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <LayoutTemplate className="w-3.5 h-3.5 text-[#4F8EF7]" /> Faturada Kurucu & Şirket Gösterim Seçenekleri
                    </span>
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] text-[#94A3B8]">Ünvan Etiketi:</label>
                      <input 
                        type="text" 
                        value={localSettings.founderTitle || "Inhaber"} 
                        onChange={e => setLocalSettings({...localSettings, founderTitle: e.target.value})}
                        className="bg-[#12121A] border border-white/10 text-white rounded-lg px-2.5 py-1 text-xs focus:border-[#4F8EF7] focus:outline-none w-28" 
                        placeholder="Inhaber" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={localSettings.showHeaderFounder !== false} 
                        onChange={e => setLocalSettings({...localSettings, showHeaderFounder: e.target.checked})}
                        className="mt-0.5 w-4 h-4 rounded text-blue-600 bg-white/5 border-white/20 focus:ring-blue-500 focus:ring-offset-0" 
                      />
                      <div>
                        <p className="text-white text-xs font-semibold">Header'da Göster (Sağ Üst)</p>
                        <p className="text-[#94A3B8] text-[11px] mt-0.5">Faturanın sağ üst köşesinde şirket ve kurucu adını gösterir</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={localSettings.showFooterFounder !== false} 
                        onChange={e => setLocalSettings({...localSettings, showFooterFounder: e.target.checked})}
                        className="mt-0.5 w-4 h-4 rounded text-blue-600 bg-white/5 border-white/20 focus:ring-blue-500 focus:ring-offset-0" 
                      />
                      <div>
                        <p className="text-white text-xs font-semibold">Footer'da Göster (Alt Bilgi)</p>
                        <p className="text-[#94A3B8] text-[11px] mt-0.5">Faturanın altındaki şirket sütununda kurucu adını gösterir</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Açık Adres (Sokak, No, Posta Kodu, Şehir, Ülke)</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
                    <textarea 
                      rows={2}
                      value={localSettings.address || ""} 
                      onChange={e => setLocalSettings({...localSettings, address: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-[#4F8EF7] focus:outline-none resize-none" 
                      placeholder="Anilinerstr 3, 67105 Schifferstadt, Deutschland" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Logo URL (İsteğe bağlı)</label>
                  <input 
                    type="text" 
                    value={localSettings.logo || ""} 
                    onChange={e => setLocalSettings({...localSettings, logo: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2 text-sm focus:border-[#4F8EF7] focus:outline-none" 
                    placeholder="https://www.starwebflow.com/images/logo.png" 
                  />
                </div>
              </div>

              {/* Bölüm 2: Vergi Bilgileri & Muafiyet */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Vergi Bilgileri (Finanzamt)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Steuernummer (Vergi Numarası)</label>
                    <input 
                      type="text" 
                      value={localSettings.taxId || ""} 
                      onChange={e => setLocalSettings({...localSettings, taxId: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-[#4F8EF7] focus:outline-none font-mono" 
                      placeholder="41/056/80705" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">USt-IdNr. (KDV Kimlik No)</label>
                    <input 
                      type="text" 
                      value={localSettings.vatId || ""} 
                      onChange={e => setLocalSettings({...localSettings, vatId: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-[#4F8EF7] focus:outline-none font-mono" 
                      placeholder="DE4105680705" 
                    />
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
                  <input 
                    type="checkbox" 
                    id="isKleinunternehmerCheck"
                    checked={localSettings.isKleinunternehmer === true} 
                    onChange={e => setLocalSettings({...localSettings, isKleinunternehmer: e.target.checked})}
                    className="mt-1 w-4 h-4 rounded text-blue-600 bg-white/5 border-white/20 focus:ring-blue-500 focus:ring-offset-0" 
                  />
                  <label htmlFor="isKleinunternehmerCheck" className="cursor-pointer">
                    <p className="text-white font-semibold text-xs">Kleinunternehmer (§19 UStG) KDV Muafiyeti</p>
                    <p className="text-[#94A3B8] text-[11px] mt-0.5">
                      İşaretlendiğinde faturalarda %0 KDV uygulanır ve faturanın altına yasal muafiyet metni (Gemäß § 19 UStG wird keine Umsatzsteuer berechnet) eklenir.
                    </p>
                  </label>
                </div>
              </div>

              {/* Bölüm 3: Banka ve Ödeme Bilgileri */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> Banka & Ödeme Bilgileri
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Banka Adı</label>
                    <input 
                      type="text" 
                      value={localSettings.bankName || ""} 
                      onChange={e => setLocalSettings({...localSettings, bankName: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-[#4F8EF7] focus:outline-none" 
                      placeholder="Sparkasse Vorderpfalz" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Para Birimi</label>
                    <select 
                      value={localSettings.bankCurrency || "EUR"} 
                      onChange={e => setLocalSettings({...localSettings, bankCurrency: e.target.value})}
                      className="w-full bg-[#12121A] border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-[#4F8EF7] focus:outline-none"
                    >
                      <option value="EUR">EUR (€)</option>
                      <option value="TRY">TRY (₺)</option>
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">IBAN Numarası</label>
                    <input 
                      type="text" 
                      value={localSettings.iban || ""} 
                      onChange={e => setLocalSettings({...localSettings, iban: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-[#4F8EF7] focus:outline-none font-mono" 
                      placeholder="DE98545500100194489159" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">BIC / SWIFT Kodu</label>
                    <input 
                      type="text" 
                      value={localSettings.swift || ""} 
                      onChange={e => setLocalSettings({...localSettings, swift: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-[#4F8EF7] focus:outline-none font-mono" 
                      placeholder="LUHSDE6AXXX" 
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t border-white/5 sticky bottom-0 bg-[#0A0A0F] pb-1">
                <button 
                  type="button" 
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Vazgeç
                </button>
                <button 
                  type="submit" 
                  disabled={savingSettings}
                  className="flex-1 py-3 bg-gradient-to-r from-[#4F8EF7] to-purple-600 hover:opacity-90 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 shadow-lg shadow-[#4F8EF7]/20"
                >
                  {savingSettings ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW INVOICE MODAL */}
      {isAddInvoiceModalOpen && !isPreviewMode && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 py-10 overflow-y-auto">
          <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl max-w-4xl w-full shadow-2xl my-auto flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-white/5 flex justify-between items-center sticky top-0 bg-[#0A0A0F] z-10">
              <h3 className="text-xl font-bold text-white">
                {editInvoiceId ? `Faturayı Düzenle (${invoiceData.invoiceNo || ''})` : 'Yeni Fatura Kes (Finanzamt Uyumlu)'}
              </h3>
              <button onClick={() => setIsAddInvoiceModalOpen(false)} className="text-[#64748B] hover:text-white">✕</button>
            </div>
            
            <div className="p-6 space-y-8 overflow-y-auto">
              {/* Şirket / Fatura Kesici Bilgileri Banner */}
              <div className="bg-gradient-to-r from-blue-950/40 via-purple-950/20 to-transparent border border-blue-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-sm">{localSettings.name || 'Star Web Flow'}</span>
                      <span className="text-xs text-[#94A3B8]">({`Inhaber / Kurucu: ${localSettings.founderName || 'Sinan Günay'}`})</span>
                    </div>
                    <div className="text-xs text-[#94A3B8] mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>✉️ {localSettings.email || 'info@starwebflow.com'}</span>
                      {localSettings.phone && <span>📞 {localSettings.phone}</span>}
                      {localSettings.taxId && <span>🏛️ St-Nr: {localSettings.taxId}</span>}
                      {localSettings.vatId && <span>🇪🇺 USt-IdNr: {localSettings.vatId}</span>}
                      <span>{localSettings.isKleinunternehmer ? '⚠️ §19 UStG (KDV Muaf)' : '🧾 Standart KDV'}</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#4F8EF7]/20 hover:bg-[#4F8EF7]/30 border border-[#4F8EF7]/40 text-[#4F8EF7] hover:text-white text-xs font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer shadow-sm"
                >
                  <Settings className="w-4 h-4" />
                  Şirket & Fatura Ayarlarını Düzenle
                </button>
              </div>

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
                      <option value="" className="text-black bg-white">-- Müşteri Seçin --</option>
                      {companies.length > 0 && (
                        <optgroup label="📋 Kayıtlı Müşteriler" className="text-black bg-white">
                          {companies.map(c => (
                            <option key={c.id} value={c.id} className="text-black bg-white">{c.name}</option>
                          ))}
                        </optgroup>
                      )}
                      {crmLeadsNotInCompanies.length > 0 && (
                        <optgroup label="🔗 CRM Leadleri (Aktarılmamış)" className="text-black bg-white">
                          {crmLeadsNotInCompanies.map((lead: any) => (
                            <option key={`crm-${lead.id}`} value={`crm-${lead.id}`} className="text-black bg-white">
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
                      <option value="" className="text-black bg-white">-- Proje Seçin --</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id} className="text-black bg-white">{p.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Fatura Detayları */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <h4 className="font-semibold text-white">Fatura Numarası & Tarihleri</h4>
                    <button 
                      type="button" 
                      onClick={() => setIsSettingsModalOpen(true)}
                      className="text-xs text-[#4F8EF7] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5" /> Şirket/E-posta Ayarları
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs text-[#94A3B8] mb-1">Fatura Numarası (Rechnungsnr.)</label>
                      <input 
                        type="text" 
                        className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 font-mono text-sm focus:border-[#4F8EF7] focus:outline-none" 
                        placeholder="Örn: RE-2026-0001" 
                        value={invoiceData.invoiceNo} 
                        onChange={e => setInvoiceData({...invoiceData, invoiceNo: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#94A3B8] mb-1">Fatura Tarihi (Rechnungsdatum)</label>
                      <input type="date" className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2" value={invoiceData.invoiceDate} onChange={e => setInvoiceData({...invoiceData, invoiceDate: e.target.value})}/>
                    </div>
                    <div>
                      <label className="block text-xs text-[#94A3B8] mb-1">Hizmet Başlangıç (Leistungsbeginn)</label>
                      <input type="date" className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2" value={invoiceData.deliveryDate} onChange={e => setInvoiceData({...invoiceData, deliveryDate: e.target.value})}/>
                    </div>
                    <div>
                      <label className="block text-xs text-[#94A3B8] mb-1">Hizmet Bitiş (Leistungsende)</label>
                      <input type="date" className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2" value={invoiceData.deliveryEndDate} onChange={e => setInvoiceData({...invoiceData, deliveryEndDate: e.target.value})}/>
                    </div>
                    <div>
                      <label className="block text-xs text-[#94A3B8] mb-1">Son Ödeme (Fälligkeitsdatum)</label>
                      <input type="date" className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2" value={invoiceData.dueDate} onChange={e => setInvoiceData({...invoiceData, dueDate: e.target.value})}/>
                    </div>
                    <div>
                      <label className="block text-xs text-[#94A3B8] mb-1">Para Birimi</label>
                      <select className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2" value={invoiceData.currency} onChange={e => setInvoiceData({...invoiceData, currency: e.target.value})}>
                        {CURRENCIES.map(c => <option key={c.code} value={c.code} className="text-black bg-white">{c.code}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-[#94A3B8] mb-1">KDV (MwSt) %</label>
                      <select className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2" value={invoiceData.taxRate} onChange={e => setInvoiceData({...invoiceData, taxRate: Number(e.target.value)})}>
                        <option value={19} className="text-black bg-white">19%</option>
                        <option value={7} className="text-black bg-white">7%</option>
                        <option value={0} className="text-black bg-white">0% (Reverse Charge)</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-[#94A3B8] mb-1">Tahsilat / Ödeme Durumu</label>
                      <select 
                        className={`w-full bg-[#12121A] border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none ${
                          invoiceData.status === 'PAID' 
                            ? 'text-emerald-400 border-emerald-500/40' 
                            : invoiceData.status === 'PENDING'
                            ? 'text-amber-400 border-amber-500/40'
                            : invoiceData.status === 'OVERDUE'
                            ? 'text-rose-400 border-rose-500/40'
                            : 'text-white border-white/10'
                        }`}
                        value={invoiceData.status || "PENDING"} 
                        onChange={e => setInvoiceData({...invoiceData, status: e.target.value})}
                      >
                        <option value="PENDING" className="bg-[#12121A] text-amber-400">⏳ Ödeme Bekliyor (PENDING)</option>
                        <option value="PAID" className="bg-[#12121A] text-emerald-400">✓ Tahsil Edildi (PAID)</option>
                        <option value="OVERDUE" className="bg-[#12121A] text-rose-400">⚠️ Gecikti (OVERDUE)</option>
                        <option value="DRAFT" className="bg-[#12121A] text-slate-400">📝 Taslak (DRAFT)</option>
                        <option value="CANCELLED" className="bg-[#12121A] text-red-500">✕ İptal Edildi (CANCELLED)</option>
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
                  {loading ? 'Kaydediliyor...' : (editInvoiceId ? 'Faturayı Güncelle' : 'Faturayı Oluştur')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ============ PAYMENT APPROVAL MODAL ============ */}
      {approvingInvoice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#0A0A0F] border border-white/15 rounded-2xl max-w-lg w-full shadow-2xl my-auto overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-emerald-950/40 via-transparent to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Tahsilat Onayı</h3>
                  <p className="text-xs text-[#94A3B8]">Fatura tahsilatını onaylayıp sisteme işleyin</p>
                </div>
              </div>
              <button 
                onClick={() => setApprovingInvoice(null)} 
                className="text-[#64748B] hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Invoice Summary Box */}
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#64748B] font-medium block">Fatura & Müşteri</span>
                  <span className="text-sm font-bold text-white block mt-0.5 font-mono">{approvingInvoice.invoiceNo}</span>
                  <span className="text-xs text-[#94A3B8] block mt-0.5 font-medium">
                    {approvingInvoice.clientCompany?.name || approvingInvoice.project?.client?.name || "Bilinmiyor"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#64748B] font-medium block">Tahsil Edilecek Tutar</span>
                  <span className="text-xl font-extrabold text-emerald-400 font-mono block mt-0.5">
                    {formatCurrency(Number(approvingInvoice.grossAmount || approvingInvoice.amount || 0), approvingInvoice.currency || 'EUR')}
                  </span>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                    Tahsilat / Ödeme Tarihi *
                  </label>
                  <input
                    type="date"
                    value={approvalDate}
                    onChange={(e) => setApprovalDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                    Ödeme Kanalı / Yöntemi *
                  </label>
                  <select
                    value={approvalMethod}
                    onChange={(e) => setApprovalMethod(e.target.value)}
                    className="w-full bg-[#12121A] border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Banka Havalesi / SEPA">🏦 Banka Havalesi / SEPA</option>
                    <option value="Kredi Kartı / Stripe">💳 Kredi Kartı / Online Ödeme</option>
                    <option value="PayPal">🅿️ PayPal</option>
                    <option value="Nakit / Elden">💵 Nakit</option>
                    <option value="Diğer">📋 Diğer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                    İşlem / Dekont Notu (İsteğe bağlı)
                  </label>
                  <textarea
                    rows={3}
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    placeholder="Örn: Sparkasse dekont ref no: 2026-9481, hesaba geçti."
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/10 flex items-center justify-end gap-3 bg-white/[0.01]">
              <button
                type="button"
                onClick={() => setApprovingInvoice(null)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleConfirmApproval}
                disabled={isUpdatingStatus}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-white text-sm font-bold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                {isUpdatingStatus ? 'Onaylanıyor...' : 'Tahsilatı Onayla ve Kaydet'}
              </button>
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
