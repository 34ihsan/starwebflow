'use server';

import { prisma } from '@/lib/prisma';
import { safeRevalidatePath } from '@/lib/utils/cache';

// Yasal Saklama ve İmha Süreleri Yapılandırması (Gün olarak)
export const RETENTION_RULES = {
  AUTOMATION_LOGS: 180,       // 6 Ay (Güvenlik logları)
  LEADS_INACTIVE: 365,        // 1 Yıl (Müşteri adayı kayıtları)
  APPOINTMENTS_PAST: 365,     // 1 Yıl (Geçmiş randevular)
  CONTRACTS_DRAFT: 365,       // 1 Yıl (İmzalanmamış taslak sözleşmeler)
  CONTRACTS_SIGNED: 3650,     // 10 Yıl (İmzalı hukuki sözleşmeler)
  PROJECTS_COMPLETED: 3650,   // 10 Yıl (Proje, task, fatura, asset verileri)
  USERS_DELETED: 3650,        // 10 Yıl (Pasif/Silinmiş kullanıcı kayıtları)
};

export interface RetentionStats {
  automationLogs: { total: number; expired: number; ruleDays: number; legalBasis: string };
  leads: { total: number; expired: number; ruleDays: number; legalBasis: string };
  appointments: { total: number; expired: number; ruleDays: number; legalBasis: string };
  contracts: { total: number; expired: number; ruleDays: number; legalBasis: string };
  projects: { total: number; expired: number; ruleDays: number; legalBasis: string };
  users: { total: number; expired: number; ruleDays: number; legalBasis: string };
}

/**
 * Veri saklama ve imha istatistiklerini getirir
 */
export async function getRetentionStats(tenantId: string = 'default-tenant'): Promise<{ success: boolean; data?: RetentionStats; error?: string }> {
  try {
    const now = new Date();

    // Zaman eşiklerini hesapla
    const automationLogsThreshold = new Date(now.getTime() - RETENTION_RULES.AUTOMATION_LOGS * 24 * 60 * 60 * 1000);
    const leadsThreshold = new Date(now.getTime() - RETENTION_RULES.LEADS_INACTIVE * 24 * 60 * 60 * 1000);
    const appointmentsThreshold = new Date(now.getTime() - RETENTION_RULES.APPOINTMENTS_PAST * 24 * 60 * 60 * 1000);
    const contractsDraftThreshold = new Date(now.getTime() - RETENTION_RULES.CONTRACTS_DRAFT * 24 * 60 * 60 * 1000);
    const contractsSignedThreshold = new Date(now.getTime() - RETENTION_RULES.CONTRACTS_SIGNED * 24 * 60 * 60 * 1000);
    const projectsThreshold = new Date(now.getTime() - RETENTION_RULES.PROJECTS_COMPLETED * 24 * 60 * 60 * 1000);
    const usersThreshold = new Date(now.getTime() - RETENTION_RULES.USERS_DELETED * 24 * 60 * 60 * 1000);

    // 1. Automation Logs
    const totalLogs = await prisma.automationLog.count({ where: { tenantId } });
    const expiredLogs = await prisma.automationLog.count({
      where: { tenantId, createdAt: { lt: automationLogsThreshold } }
    });

    // 2. Leads (Kazanılmamış/Won olmayan adaylar)
    const totalLeads = await prisma.lead.count({ where: { tenantId } });
    const expiredLeads = await prisma.lead.count({
      where: {
        tenantId,
        status: { not: 'won' },
        createdAt: { lt: leadsThreshold }
      }
    });

    // 3. Appointments
    const totalAppointments = await prisma.appointment.count({ where: { tenantId } });
    const expiredAppointments = await prisma.appointment.count({
      where: {
        tenantId,
        startTime: { lt: appointmentsThreshold }
      }
    });

    // 4. Contracts
    const totalContracts = await prisma.contract.count({ where: { tenantId } });
    const expiredContracts = await prisma.contract.count({
      where: {
        tenantId,
        OR: [
          { status: { in: ['draft', 'sent', 'expired'] }, createdAt: { lt: contractsDraftThreshold } },
          { status: 'signed', signedAt: { lt: contractsSignedThreshold } }
        ]
      }
    });

    // 5. Projects (Asset, Invoice, Task kayıtları proje silindiğinde cascade ile otomatik silinir)
    const totalProjects = await prisma.project.count({ where: { tenantId } });
    const expiredProjects = await prisma.project.count({
      where: { tenantId, createdAt: { lt: projectsThreshold } }
    });

    // 6. Users (Silinmiş ve 10 yıldır işlem görmemiş)
    const totalUsers = await prisma.user.count({ where: { tenantId } });
    const expiredUsers = await prisma.user.count({
      where: {
        tenantId,
        deletedAt: { lt: usersThreshold }
      }
    });

    return {
      success: true,
      data: {
        automationLogs: {
          total: totalLogs,
          expired: expiredLogs,
          ruleDays: RETENTION_RULES.AUTOMATION_LOGS,
          legalBasis: 'GDPR Recital 49 (Ağ Güvenliği)',
        },
        leads: {
          total: totalLeads,
          expired: expiredLeads,
          ruleDays: RETENTION_RULES.LEADS_INACTIVE,
          legalBasis: 'GDPR Art. 5 (Veri Minimizasyonu) / KVKK',
        },
        appointments: {
          total: totalAppointments,
          expired: expiredAppointments,
          ruleDays: RETENTION_RULES.APPOINTMENTS_PAST,
          legalBasis: 'GDPR Art. 5 / KVKK Aydınlatma Metni',
        },
        contracts: {
          total: totalContracts,
          expired: expiredContracts,
          ruleDays: RETENTION_RULES.CONTRACTS_SIGNED,
          legalBasis: 'HGB § 257 (10 Yıl) / TBK M. 146 (Zamanaşımı)',
        },
        projects: {
          total: totalProjects,
          expired: expiredProjects,
          ruleDays: RETENTION_RULES.PROJECTS_COMPLETED,
          legalBasis: 'HGB § 257 (Şartnameler 6 Yıl / Faturalar 10 Yıl)',
        },
        users: {
          total: totalUsers,
          expired: expiredUsers,
          ruleDays: RETENTION_RULES.USERS_DELETED,
          legalBasis: 'TTK M. 82 (İşlem İlişkisi Bitimi + 10 Yıl)',
        }
      }
    };
  } catch (error: any) {
    console.error('getRetentionStats error:', error);
    return { success: false, error: error.message || 'Failed to fetch retention stats' };
  }
}

/**
 * Yasal süresi dolan kayıtları veritabanından kalıcı olarak siler ve denetim logunu günceller.
 */
export async function runRetentionCleanup(tenantId: string = 'default-tenant', runBy: string = 'Sistem Yöneticisi') {
  try {
    const now = new Date();

    // Zaman eşiklerini hesapla
    const automationLogsThreshold = new Date(now.getTime() - RETENTION_RULES.AUTOMATION_LOGS * 24 * 60 * 60 * 1000);
    const leadsThreshold = new Date(now.getTime() - RETENTION_RULES.LEADS_INACTIVE * 24 * 60 * 60 * 1000);
    const appointmentsThreshold = new Date(now.getTime() - RETENTION_RULES.APPOINTMENTS_PAST * 24 * 60 * 60 * 1000);
    const contractsDraftThreshold = new Date(now.getTime() - RETENTION_RULES.CONTRACTS_DRAFT * 24 * 60 * 60 * 1000);
    const contractsSignedThreshold = new Date(now.getTime() - RETENTION_RULES.CONTRACTS_SIGNED * 24 * 60 * 60 * 1000);
    const projectsThreshold = new Date(now.getTime() - RETENTION_RULES.PROJECTS_COMPLETED * 24 * 60 * 60 * 1000);
    const usersThreshold = new Date(now.getTime() - RETENTION_RULES.USERS_DELETED * 24 * 60 * 60 * 1000);

    // 1. Silme İşlemlerini Başlat (Sırayla)
    
    // a. Automation Logs
    const deletedLogs = await prisma.automationLog.deleteMany({
      where: { tenantId, createdAt: { lt: automationLogsThreshold } }
    });

    // b. Leads
    const deletedLeads = await prisma.lead.deleteMany({
      where: {
        tenantId,
        status: { not: 'won' },
        createdAt: { lt: leadsThreshold }
      }
    });

    // c. Appointments
    const deletedAppointments = await prisma.appointment.deleteMany({
      where: {
        tenantId,
        startTime: { lt: appointmentsThreshold }
      }
    });

    // d. Contracts
    const deletedContracts = await prisma.contract.deleteMany({
      where: {
        tenantId,
        OR: [
          { status: { in: ['draft', 'sent', 'expired'] }, createdAt: { lt: contractsDraftThreshold } },
          { status: 'signed', signedAt: { lt: contractsSignedThreshold } }
        ]
      }
    });

    // e. Projects (Cascade ile Asset, AssetRevision, Task ve Invoices otomatik silinecek)
    // Silinmeden önce kaç asset silineceğini bulalım (Denetim izi için yararlı)
    const expiredAssetsCount = await prisma.asset.count({
      where: { project: { tenantId, createdAt: { lt: projectsThreshold } } }
    });

    const deletedProjects = await prisma.project.deleteMany({
      where: { tenantId, createdAt: { lt: projectsThreshold } }
    });

    // f. Users (İşlem görmemiş ve silinmiş)
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        tenantId,
        deletedAt: { lt: usersThreshold }
      }
    });

    // 2. Denetim İzi (Audit Log) Hazırlığı
    const runId = Math.random().toString(36).substring(2, 9).toUpperCase();
    const newLogEntry = {
      id: runId,
      runAt: new Date().toISOString(),
      runBy: runBy,
      deletedCounts: {
        logs: deletedLogs.count,
        leads: deletedLeads.count,
        appointments: deletedAppointments.count,
        contracts: deletedContracts.count,
        projects: deletedProjects.count,
        assets: expiredAssetsCount,
        users: deletedUsers.count
      },
      status: 'success'
    };

    // Tenant Settings preferences alanını oku ve logu ekle
    let tenantSettings = await prisma.tenantSettings.findUnique({
      where: { tenantId }
    });

    if (!tenantSettings) {
      tenantSettings = await prisma.tenantSettings.create({
        data: {
          tenant: { connect: { id: tenantId } },
          companyName: 'StarWebFlow',
          apiKeys: { stripe: 'sk_live_51Mxyz...93jK' },
          preferences: { language: 'tr', timezone: 'Europe/Istanbul', cleanupHistory: [] }
        }
      });
    }

    const currentPreferences = (tenantSettings.preferences as any) || {};
    const cleanupHistory = Array.isArray(currentPreferences.cleanupHistory) 
      ? currentPreferences.cleanupHistory 
      : [];
    
    // Log listesini en baştan ekleyerek güncelle (Maksimum 50 log sakla)
    const updatedHistory = [newLogEntry, ...cleanupHistory].slice(0, 50);

    await prisma.tenantSettings.update({
      where: { tenantId },
      data: {
        preferences: {
          ...currentPreferences,
          cleanupHistory: updatedHistory
        }
      }
    });

    safeRevalidatePath('/admin/settings');
    return {
      success: true,
      log: newLogEntry
    };
  } catch (error: any) {
    console.error('runRetentionCleanup error:', error);
    return { success: false, error: error.message || 'Veri imha işlemi gerçekleştirilirken bir hata oluştu.' };
  }
}

/**
 * Geliştirme/Test aşamasında temizliği simüle edebilmek için veritabanına
 * yasal saklama süreleri geçmiş yapay (dummy) veriler yerleştirir.
 */
export async function seedRetentionMockData(tenantId: string = 'default-tenant') {
  try {
    const now = new Date();

    // Geçmiş tarihler (yasal sınırların ötesi)
    const past190Days = new Date(now.getTime() - 190 * 24 * 60 * 60 * 1000);  // loglar için (>180 gün)
    const past370Days = new Date(now.getTime() - 370 * 24 * 60 * 60 * 1000);  // lead/randevu/taslak için (>1 yıl)

    // 1. Süresi dolmuş otomasyon günlükleri ekle
    await prisma.automationLog.createMany({
      data: [
        { tenantId, flowId: 'flow-test-1', status: 'success', createdAt: past190Days },
        { tenantId, flowId: 'flow-test-2', status: 'failed', errorMsg: 'API Timeout', createdAt: past190Days },
      ]
    });

    // 2. Süresi dolmuş kazanılmamış adaylar ekle
    await prisma.lead.createMany({
      data: [
        { tenantId, name: 'Ahmet Yılmaz (Eski İrtibat)', email: 'ahmet.y@example.com', phone: '0555 111 2233', company: 'Yılmaz Tekstil', status: 'lost', createdAt: past370Days },
        { tenantId, name: 'Marcus Weber', email: 'marcus.weber@example.de', phone: '+49 170 1234567', company: 'Weber GmbH', status: 'new', createdAt: past370Days },
      ]
    });

    // 3. Süresi dolmuş randevular ekle
    await prisma.appointment.createMany({
      data: [
        { tenantId, title: 'Ön Tanışma Toplantısı', clientName: 'Ahmet Yılmaz', clientEmail: 'ahmet.y@example.com', startTime: past370Days, endTime: past370Days, status: 'completed' },
        { tenantId, title: 'Demo Görüşmesi (Canceled)', clientName: 'Marcus Weber', clientEmail: 'marcus.weber@example.de', startTime: past370Days, endTime: past370Days, status: 'canceled' },
      ]
    });

    // 4. Süresi dolmuş taslak sözleşmeler ekle
    await prisma.contract.createMany({
      data: [
        { tenantId, title: 'Web Geliştirme Hizmet Sözleşmesi Taslağı', clientName: 'Weber GmbH', clientEmail: 'marcus.weber@example.de', status: 'draft', type: 'LASTENHEFT', createdAt: past370Days },
        { tenantId, title: 'SEO Optimizasyonu Sözleşme Taslağı (Expired)', clientName: 'Lokal Müşteri', clientEmail: 'client@local.com', status: 'expired', type: 'CUSTOM', createdAt: past370Days },
      ]
    });

    safeRevalidatePath('/admin/settings');
    return { success: true };
  } catch (error: any) {
    console.error('seedRetentionMockData error:', error);
    return { success: false, error: error.message || 'Mock veri üretilemedi.' };
  }
}
