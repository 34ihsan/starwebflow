'use server';

import { prisma } from '@/lib/prisma';

export async function getClientDashboardData(tenantId: string, clientId?: string) {
  try {
    // If no specific client is provided, try to find the first client in the tenant
    let actualClientId = clientId;
    if (!actualClientId) {
      const firstClient = await prisma.user.findFirst({
        where: { tenantId, role: 'CLIENT_MEMBER' },
        select: { id: true }
      });
      if (firstClient) {
        actualClientId = firstClient.id;
      }
    }

    // Default mock data if no client exists in DB yet
    if (!actualClientId) {
      return {
        success: true,
        data: {
          client: { name: 'Demo Müşteri', email: 'demo@client.com' },
          projects: [],
          contracts: [],
          recentInvoices: []
        }
      };
    }

    const client = await prisma.user.findUnique({
      where: { id: actualClientId },
      select: { name: true, email: true }
    });

    const projects = await prisma.project.findMany({
      where: { tenantId, clientId: actualClientId },
      orderBy: { updatedAt: 'desc' },
      take: 5
    });

    // Find all invoices associated with this client's projects
    const projectIds = projects.map(p => p.id);
    const recentInvoices = await prisma.invoice.findMany({
      where: {
        tenantId,
        OR: [
          { projectId: { in: projectIds } },
          client?.email ? { clientCompany: { email: client.email } } : {}
        ]
      },
      include: {
        items: true,
        clientCompany: true,
        project: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Fetch real contracts from DB matching client email, with mock fallbacks if empty
    let contracts: any[] = [];
    if (client?.email) {
      const dbContracts = await prisma.contract.findMany({
        where: {
          tenantId,
          clientEmail: client.email
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      });
      contracts = dbContracts;
    }

    if (contracts.length === 0) {
      contracts = [
        { 
          id: 'C-101', 
          title: 'Yazılım Geliştirme Sözleşmesi (Web)', 
          status: 'PENDING', 
          type: 'LASTENHEFT', 
          value: 12000, 
          currency: 'EUR', 
          clientName: client?.name || 'Müşteri', 
          clientEmail: client?.email || 'client@example.com', 
          content: `# LASTENHEFT (TEKNİK ŞARTNAME)\n\n## 1. PROJE TANIMI\nBu işbu teknik şartname, **StarWebFlow** tarafından geliştirilecek web tabanlı sistemin gereksinimlerini belirlemektedir.\n\n## 2. FONKSİYONEL GEREKSİNİMLER\n- **Kullanıcı Paneli:** Müşteri kendi faturalarını ve sözleşmelerini görüntüleyebilmeli.\n- **PDF Yazdırma:** Tüm sözleşme ve faturalar A4 formatında PDF olarak indirilebilmeli.\n- **AI Destekli Ajanlar:** İş süreçlerini otomatikleştiren yapay zeka entegrasyonu.\n\n## 3. TEKNİK ALTYAPI\n- **Frontend:** Next.js 14, Tailwind CSS, TypeScript.\n- **Backend & Database:** PostgreSQL, Prisma ORM.` 
        },
        { 
          id: 'C-102', 
          title: 'NDA (Gizlilik Sözleşmesi)', 
          status: 'SIGNED', 
          type: 'NDA', 
          value: 0, 
          currency: 'EUR', 
          clientName: client?.name || 'Müşteri', 
          clientEmail: client?.email || 'client@example.com', 
          content: `# GİZLİLİK SÖZLEŞMESİ (NDA)\n\n## 1. TARAFLAR\nİşbu sözleşme **StarWebFlow** (Hizmet Sağlayıcı) ile **${client?.name || 'Müşteri'}** (Alıcı) arasında imzalanmıştır.\n\n## 2. GİZLİ BİLGİ TANIMI\nTaraflar arasında paylaşılan her türlü kaynak kod, veri tabanı şeması, müşteri portföyü ve ticari stratejiler "Gizli Bilgi" olarak kabul edilir.\n\n## 3. CEZAİ ŞART\nGizlilik ihlali durumunda ihlal eden taraf, diğer tarafın uğradığı tüm maddi ve manevi zararları tazmin etmekle yükümlüdür.` 
        },
      ];
    }

    return {
      success: true,
      data: {
        client,
        projects,
        contracts,
        recentInvoices
      }
    };

  } catch (error) {
    console.error('getClientDashboardData error:', error);
    return { success: false, error: 'Veriler alınamadı' };
  }
}
