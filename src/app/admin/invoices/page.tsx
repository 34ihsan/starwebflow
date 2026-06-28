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
  const invSettings = prefs.invoiceSettings || {};

  const defaultSettings = {
    name: invSettings.companyName || settings?.companyName || "Şirket Adı",
    logo: invSettings.logoUrl || "",
    address: invSettings.address || "",
    taxId: invSettings.taxId || "",
    vatId: invSettings.vatId || "",
    iban: invSettings.iban || "",
    bankName: invSettings.bankName || "",
    email: invSettings.email || session?.email || "",
    phone: invSettings.phone || "",
    website: invSettings.website || "",
    isKleinunternehmer: invSettings.isKleinunternehmer || false
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
