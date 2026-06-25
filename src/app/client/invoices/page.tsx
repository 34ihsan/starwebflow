import { getClientDashboardData } from '@/app/actions/client';
import { prisma } from '@/lib/prisma';
import ClientInvoicesClient from './ClientInvoicesClient';

export const metadata = {
  title: 'StarWebFlow | Faturalar ve Ödemeler',
  description: 'Müşteri Faturaları',
}

import { isStripeEnabled } from '@/lib/stripe';

export default async function ClientInvoicesPage() {
  const [res, settings] = await Promise.all([
    getClientDashboardData('default-tenant'),
    prisma.tenantSettings.findUnique({ where: { tenantId: 'default-tenant' } })
  ]);
  
  const invoices = res.success ? res.data?.recentInvoices || [] : [];
  
  const defaultSettings = {
    name: settings?.companyName || "Star Web Flow",
    logo: "https://www.starwebflow.com/images/logo.png",
    address: "Musterstr. 1, 12345 Berlin, Germany",
    taxId: "12/345/67890",
    vatId: "DE123456789",
    iban: "DE12 3456 7890 1234 5678 90",
    bankName: "Musterbank",
    email: "info@starwebflow.com",
    phone: "+49 123 456 789",
    website: "www.starwebflow.com"
  };

  return (
    <ClientInvoicesClient 
      initialInvoices={invoices} 
      tenantSettings={defaultSettings} 
      isStripeEnabled={isStripeEnabled} 
    />
  );
}
