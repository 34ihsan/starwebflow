import { getInvoices } from '@/app/actions/invoice';
import { getProjects } from '@/app/actions/project';
import { getClientCompanies } from '@/app/actions/clientCompany';
import { getLeads } from '@/app/actions/lead';
import { prisma } from '@/lib/prisma';
import InvoicesDashboardClient from './InvoicesDashboardClient';
import { getServerSession } from '@/modules/auth/auth.helpers';

export default async function AdminInvoicesDashboardPage() {
  const session = await getServerSession();
  const isSuperAdmin = session?.role === 'SUPER_ADMIN';
  const tenantId = session?.tenantId || 'default-tenant';

  const [invoicesRes, projectsRes, companiesRes, leadsRes, settings] = await Promise.all([
    getInvoices(tenantId, isSuperAdmin),
    getProjects(tenantId, isSuperAdmin),
    getClientCompanies(tenantId, isSuperAdmin),
    getLeads(tenantId),
    prisma.tenantSettings.findFirst({
      where: {
        OR: [
          { tenantId },
          { tenantId: 'default-tenant' }
        ]
      }
    })
  ]);

  const prefs: any = settings?.preferences || {};
  const billingSettings = prefs.billing || {};

  const defaultSettings = {
    name: billingSettings.legalName || settings?.companyName || "Star Web Flow",
    founderName: billingSettings.founderName || prefs.general?.founderName || "Sinan Günay",
    founderTitle: billingSettings.founderTitle || prefs.general?.founderTitle || "Inhaber",
    showHeaderFounder: billingSettings.showHeaderFounder !== false,
    showFooterFounder: billingSettings.showFooterFounder !== false,
    logo: prefs.branding?.logoUrl || "",
    address: billingSettings.address || "Anilinerstr 3, 67105 Schifferstadt, Deutschland",
    taxId: billingSettings.taxNumber || "41/056/80705",
    vatId: billingSettings.vatId || "DE4105680705",
    iban: billingSettings.iban || "DE98545500100194489159",
    bankName: billingSettings.bankName || "Sparkasse Vorderpfalz",
    swift: billingSettings.swift || "LUHSDE6AXXX",
    bankCurrency: billingSettings.bankCurrency || "EUR",
    email: prefs.general?.supportEmail || billingSettings.email || "info@starwebflow.com",
    phone: prefs.general?.supportPhone || billingSettings.phone || "",
    website: billingSettings.website || prefs.general?.website || "www.starwebflow.com",
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
