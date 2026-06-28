import { getInvoices } from '@/app/actions/invoice';
import { getProjects } from '@/app/actions/project';
import { getClientCompanies } from '@/app/actions/clientCompany';
import { prisma } from '@/lib/prisma';
import InvoicesDashboardClient from './InvoicesDashboardClient';
import { getServerSession } from '@/modules/auth/auth.helpers';

export default async function AdminInvoicesDashboardPage() {
  const session = await getServerSession();
  const tenantId = session?.tenantId || 'default-tenant';

  const [invoicesRes, projectsRes, companiesRes, settings] = await Promise.all([
    getInvoices(tenantId),
    getProjects(tenantId),
    getClientCompanies(tenantId),
    prisma.tenantSettings.findUnique({ where: { tenantId } })
  ]);

  const prefs: any = settings?.preferences || {};
  const billingSettings = prefs.billing || {};

  const defaultSettings = {
    name: billingSettings.legalName || settings?.companyName || "Şirket Adı",
    logo: prefs.branding?.logoUrl || "",
    address: billingSettings.address || "",
    taxId: billingSettings.taxNumber || "",
    vatId: billingSettings.vatId || "",
    iban: billingSettings.iban || "",
    bankName: billingSettings.bankName || "",
    swift: billingSettings.swift || "",
    bankCurrency: billingSettings.bankCurrency || "TRY",
    email: prefs.general?.supportEmail || session?.email || "",
    phone: prefs.general?.supportPhone || "",
    website: prefs.general?.website || "",
    isKleinunternehmer: billingSettings.vatRate === "0" || billingSettings.isKleinunternehmer || false
  };

  return (
    <InvoicesDashboardClient 
      initialInvoices={invoicesRes.data || []} 
      projects={projectsRes.data || []} 
      clientCompanies={companiesRes.data || []}
      tenantSettings={defaultSettings}
      tenantId={tenantId}
    />
  );
}
