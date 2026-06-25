import { getInvoices } from '@/app/actions/invoice';
import { getProjects } from '@/app/actions/project';
import { getClientCompanies } from '@/app/actions/clientCompany';
import { prisma } from '@/lib/prisma';
import InvoicesDashboardClient from './InvoicesDashboardClient';

export default async function AdminInvoicesDashboardPage() {
  const [invoicesRes, projectsRes, companiesRes, settings] = await Promise.all([
    getInvoices('default-tenant'),
    getProjects('default-tenant'),
    getClientCompanies('default-tenant'),
    prisma.tenantSettings.findUnique({ where: { tenantId: 'default-tenant' } })
  ]);

  const prefs: any = settings?.preferences || {};
  const invSettings = prefs.invoiceSettings || {};

  const defaultSettings = {
    name: invSettings.companyName || settings?.companyName || "Star Web Flow",
    logo: invSettings.logoUrl || "https://www.starwebflow.com/images/logo.png",
    address: invSettings.address || "Musterstr. 1, 12345 Berlin, Germany",
    taxId: invSettings.taxId || "12/345/67890",
    vatId: invSettings.vatId || "DE123456789",
    iban: invSettings.iban || "DE12 3456 7890 1234 5678 90",
    bankName: invSettings.bankName || "Musterbank",
    email: invSettings.email || "info@starwebflow.com",
    phone: invSettings.phone || "+49 123 456 789",
    website: invSettings.website || "www.starwebflow.com"
  };

  return (
    <InvoicesDashboardClient 
      initialInvoices={invoicesRes.data || []} 
      projects={projectsRes.data || []} 
      clientCompanies={companiesRes.data || []}
      tenantSettings={defaultSettings}
    />
  );
}
