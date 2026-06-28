import { getInvoices } from '@/app/actions/invoice';
import { getProjects } from '@/app/actions/project';
import { getClientCompanies } from '@/app/actions/clientCompany';
import { getLeads } from '@/app/actions/lead';
import { prisma } from '@/lib/prisma';
import InvoicesDashboardClient from './InvoicesDashboardClient';
import { getServerSession } from '@/modules/auth/auth.helpers';

export default async function AdminInvoicesDashboardPage() {
  const session = await getServerSession();
  const tenantId = session?.tenantId || 'default-tenant';

  const [invoicesRes, projectsRes, companiesRes, leadsRes, settings] = await Promise.all([
    getInvoices(tenantId),
    getProjects(tenantId),
    getClientCompanies(tenantId),
    getLeads(tenantId),
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
    isKleinunternehmer: 
      String(billingSettings.vatRate) === "0" || 
      billingSettings.isKleinunternehmer === true || 
      String(prefs?.invoiceSettings?.vatRate) === "0" ||
      prefs?.invoiceSettings?.isKleinunternehmer === true ||
      false
  };

  return (
    <InvoicesDashboardClient 
      initialInvoices={invoicesRes.data || []} 
      projects={projectsRes.data || []} 
      clientCompanies={companiesRes.data || []}
      crmLeads={leadsRes.data || []}
      tenantSettings={defaultSettings}
      tenantId={tenantId}
    />
  );
}
