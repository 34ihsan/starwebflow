import { getClientDashboardData } from '@/app/actions/client';
import { prisma } from '@/lib/prisma';
import ClientInvoicesClient from './ClientInvoicesClient';

export const metadata = {
  title: 'StarWebFlow | Faturalar ve Ödemeler',
  description: 'Müşteri Faturaları',
}

import { isStripeEnabled } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export default async function ClientInvoicesPage() {
  const [res, settings] = await Promise.all([
    getClientDashboardData('default-tenant'),
    prisma.tenantSettings.findUnique({ where: { tenantId: 'default-tenant' } })
  ]);
  
  const invoices = res.success ? res.data?.recentInvoices || [] : [];
  
  const prefs: any = settings?.preferences || {};
  const billingSettings = prefs.billing || {};

  const defaultSettings = {
    name: billingSettings.legalName || settings?.companyName || "Star Web Flow",
    logo: prefs.branding?.logoUrl || "https://www.starwebflow.com/images/logo.png",
    address: billingSettings.address || "Anilinerstr 3, 67105 Schifferstadt, Deutschland",
    taxId: billingSettings.taxNumber || "41/056/80705",
    vatId: billingSettings.vatId || "",
    iban: billingSettings.iban || "DE98545500100194489159",
    bankName: billingSettings.bankName || "Sparkasse Vorderpfalz",
    swift: billingSettings.swift || "LUHSDE6AXXX",
    email: prefs.general?.supportEmail || "info@starwebflow.com",
    phone: prefs.general?.supportPhone || "",
    website: prefs.billing?.website || prefs.general?.website || "www.starwebflow.com",
    isKleinunternehmer: 
      String(billingSettings.vatRate) === "0" || 
      billingSettings.isKleinunternehmer === true || 
      String(prefs?.invoiceSettings?.vatRate) === "0" ||
      prefs?.invoiceSettings?.isKleinunternehmer === true ||
      false
  };

  return (
    <ClientInvoicesClient 
      initialInvoices={invoices} 
      tenantSettings={defaultSettings} 
      isStripeEnabled={isStripeEnabled} 
    />
  );
}
