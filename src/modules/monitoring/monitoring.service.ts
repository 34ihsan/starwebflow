import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { ServiceMonitor } from "@prisma/client";

// Resend instance for sending emails
// Make sure RESEND_API_KEY is available in the environment
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export class MonitoringService {
  /**
   * List all monitors for a tenant
   */
  static async listMonitors(tenantId: string) {
    return prisma.serviceMonitor.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      include: {
        logs: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
  }

  /**
   * Get a specific monitor
   */
  static async getMonitor(id: string, tenantId: string) {
    return prisma.serviceMonitor.findUnique({
      where: { id, tenantId },
      include: {
        logs: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });
  }

  /**
   * Create a new monitor
   */
  static async createMonitor(tenantId: string, data: any) {
    return prisma.serviceMonitor.create({
      data: {
        ...data,
        tenantId,
        status: "PENDING",
      },
    });
  }

  /**
   * Update a monitor
   */
  static async updateMonitor(id: string, tenantId: string, data: any) {
    return prisma.serviceMonitor.update({
      where: { id, tenantId },
      data,
    });
  }

  /**
   * Delete a monitor
   */
  static async deleteMonitor(id: string, tenantId: string) {
    return prisma.serviceMonitor.delete({
      where: { id, tenantId },
    });
  }

  /**
   * Run health checks for all active monitors that are due
   */
  static async runChecks() {
    const now = new Date();

    // Find monitors that need checking (nextCheckAt is null or past)
    const dueMonitors = await prisma.serviceMonitor.findMany({
      where: {
        isActive: true,
        OR: [
          { nextCheckAt: null },
          { nextCheckAt: { lte: now } }
        ]
      },
    });

    const results = [];

    for (const monitor of dueMonitors) {
      const result = await this.checkMonitor(monitor);
      results.push(result);
    }

    return {
      checked: dueMonitors.length,
      results,
    };
  }

  /**
   * Check a single monitor and update its status
   */
  private static async checkMonitor(monitor: ServiceMonitor) {
    const startTime = Date.now();
    let isHealthy = false;
    let statusCode = null;
    let errorMessage = null;

    try {
      // Basic HTTP check
      const response = await fetch(monitor.url, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        },
        // Short timeout for health checks
        signal: AbortSignal.timeout(10000),
      });

      statusCode = response.status;
      isHealthy = response.ok;
      
      if (!isHealthy) {
        errorMessage = `Status: ${statusCode}`;
      }
    } catch (error: any) {
      isHealthy = false;
      errorMessage = error.message || "Connection failed";
    }

    const responseTime = Date.now() - startTime;
    const newStatus = isHealthy ? "HEALTHY" : "DOWN";

    // Detect if status changed to DOWN
    const wentDown = monitor.status === "HEALTHY" && newStatus === "DOWN";

    // Calculate next check time
    const nextCheckAt = new Date();
    nextCheckAt.setMinutes(nextCheckAt.getMinutes() + monitor.checkIntervalMinutes);

    // Update monitor
    const updatedMonitor = await prisma.serviceMonitor.update({
      where: { id: monitor.id },
      data: {
        status: newStatus,
        lastCheckAt: new Date(),
        nextCheckAt,
      },
    });

    // Create log entry
    await prisma.monitorLog.create({
      data: {
        monitorId: monitor.id,
        status: newStatus,
        statusCode,
        responseTime,
        errorMessage,
      },
    });

    // Trigger notification if it went down
    if (wentDown && monitor.notifyOnDown) {
      await this.handleDownNotification(updatedMonitor);
    }

    return {
      id: monitor.id,
      name: monitor.name,
      status: newStatus,
      responseTime,
    };
  }

  /**
   * Handle notifications and upselling when a service goes down
   */
  private static async handleDownNotification(monitor: ServiceMonitor) {
    if (!resend) {
      console.warn("RESEND_API_KEY is not set, skipping email notification.");
      return;
    }

    // In a real scenario, you'd fetch the tenant/client email.
    // For this implementation, we will log or send to a default/admin email 
    // or fetch the client email if \`monitor.clientId\` is populated.
    
    let toEmail = "admin@example.com"; // Fallback
    
    // Attempt to get client email
    if (monitor.clientId) {
      const client = await prisma.user.findUnique({
        where: { id: monitor.clientId }
      });
      if (client && client.email) {
        toEmail = client.email;
      }
    }

    const subject = `[URGENT] Your Service is DOWN: ${monitor.name}`;
    
    let htmlContent = `
      <p>Hello,</p>
      <p>We've detected that your service <strong>${monitor.name}</strong> (${monitor.url}) is currently experiencing downtime.</p>
    `;

    // Upsell logic for maintenance contract
    if (!monitor.maintenanceContractActive) {
      htmlContent += `
        <div style="background-color: #fff3cd; color: #856404; padding: 15px; border-radius: 5px; margin-top: 20px;">
          <h3 style="margin-top: 0;">Need immediate help?</h3>
          <p>We noticed you don't have an active maintenance contract with us.</p>
          <p>Our team can help you resolve this issue quickly and prevent future downtimes. Reply to this email to get a quote for a maintenance and support package.</p>
        </div>
      `;
    } else {
      htmlContent += `
        <p>Since you have an active maintenance contract, our team has already been notified and is looking into the issue.</p>
      `;
    }

    htmlContent += `<p>Best regards,<br>Your Agency Team</p>`;

    try {
      await resend.emails.send({
        from: "Monitoring <onboarding@resend.dev>",
        to: [toEmail],
        subject,
        html: htmlContent,
      });
      console.log(`Sent downtime notification for ${monitor.name} to ${toEmail}`);
    } catch (err) {
      console.error("Failed to send downtime email:", err);
    }
  }

  /**
   * Send manual update/maintenance notification to client
   */
  static async sendUpdateNotification(id: string, tenantId: string) {
    if (!resend) {
      throw new Error("RESEND_API_KEY is not set.");
    }

    const monitor = await prisma.serviceMonitor.findUnique({
      where: { id, tenantId },
    });

    if (!monitor) throw new Error("Monitor not found");

    let toEmail = "admin@example.com";
    if (monitor.clientId) {
      const client = await prisma.user.findUnique({
        where: { id: monitor.clientId }
      });
      if (client && client.email) {
        toEmail = client.email;
      }
    }

    const subject = `[BİLGİLENDİRME] Siteniz İçin Güncelleme Gerekiyor: ${monitor.name}`;
    let htmlContent = `
      <p>Merhaba,</p>
      <p>Sistemlerimiz <strong>${monitor.name}</strong> (${monitor.url}) adresindeki projenizin altyapısında veya modüllerinde güvenlik ve performans güncellemeleri yapılması gerektiğini tespit etmiştir.</p>
    `;

    if (!monitor.maintenanceContractActive) {
      htmlContent += `
        <div style="background-color: #fff3cd; color: #856404; padding: 15px; border-radius: 5px; margin-top: 20px;">
          <h3 style="margin-top: 0;">Bakım Paketimiz Yok</h3>
          <p>Şu anda aktif bir bakım anlaşmanız bulunmamaktadır. Güncellemelerin yapılmaması durumunda sitenizde performans düşüklüğü veya güvenlik zafiyetleri oluşabilir.</p>
          <p>Güncellemelerin uzman ekibimiz tarafından yapılması ve aylık düzenli bakım paketlerimiz hakkında bilgi almak için bu maile yanıt verebilirsiniz.</p>
        </div>
      `;
    } else {
      htmlContent += `
        <p>Sizinle aktif bir bakım anlaşmamız olduğu için bu güncellemeler ekibimiz tarafından en kısa sürede planlanıp sitenize uygulanacaktır.</p>
      `;
    }

    htmlContent += `<p>Saygılarımızla,<br>Agency Ekibi</p>`;

    await resend.emails.send({
      from: "Monitoring <onboarding@resend.dev>",
      to: [toEmail],
      subject,
      html: htmlContent,
    });
    
    return { success: true };
  }

  /**
   * Maintenance Reports CRUD
   */
  static async listMaintenanceReports(monitorId: string, tenantId: string) {
    // Verify monitor belongs to tenant
    const monitor = await prisma.serviceMonitor.findUnique({
      where: { id: monitorId, tenantId },
    });
    if (!monitor) throw new Error("Monitor not found");

    return prisma.maintenanceReport.findMany({
      where: { monitorId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async createMaintenanceReport(monitorId: string, tenantId: string, data: any) {
    const monitor = await prisma.serviceMonitor.findUnique({
      where: { id: monitorId, tenantId },
    });
    if (!monitor) throw new Error("Monitor not found");

    return prisma.maintenanceReport.create({
      data: {
        monitorId,
        description: data.description || "",
        updatesApplied: data.updatesApplied || [],
        performanceNotes: data.performanceNotes || "",
        status: "DRAFT",
      },
    });
  }

  static async sendMaintenanceReport(reportId: string, monitorId: string, tenantId: string) {
    if (!resend) {
      throw new Error("RESEND_API_KEY is not set.");
    }

    const report = await prisma.maintenanceReport.findUnique({
      where: { id: reportId, monitorId },
      include: { monitor: true },
    });

    if (!report || report.monitor.tenantId !== tenantId) {
      throw new Error("Report not found");
    }

    const monitor = report.monitor;
    let toEmail = "admin@example.com";
    if (monitor.clientId) {
      const client = await prisma.user.findUnique({
        where: { id: monitor.clientId }
      });
      if (client && client.email) {
        toEmail = client.email;
      }
    }

    // Format the updates array for email
    let updatesHtml = "";
    if (report.updatesApplied && Array.isArray(report.updatesApplied) && report.updatesApplied.length > 0) {
      updatesHtml = `
        <h3 style="color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 5px;">🔧 Yapılan Güncellemeler ve İşlemler</h3>
        <ul style="padding-left: 20px; line-height: 1.6;">
          ${report.updatesApplied.map((update: any) => `<li>${update}</li>`).join("")}
        </ul>
      `;
    }

    let performanceHtml = "";
    if (report.performanceNotes) {
      performanceHtml = `
        <h3 style="color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 20px;">⚡ Performans ve Güvenlik Notları</h3>
        <p style="line-height: 1.6;">${report.performanceNotes.replace(/\\n/g, "<br>")}</p>
      `;
    }

    const subject = `[BAKIM RAPORU] Sistem Güncellemeleriniz Tamamlandı - ${monitor.name}`;
    const reportDate = new Date(report.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

    let htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #0056b3; text-align: center;">Profesyonel Bakım ve Güncelleme Raporu</h2>
        <p>Merhaba,</p>
        <p><strong>${monitor.name}</strong> (${monitor.url}) projeniz için periyodik sistem bakım ve güvenlik güncellemeleri ekibimiz tarafından başarıyla tamamlanmıştır. Detayları aşağıda bulabilirsiniz:</p>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Rapor Tarihi:</strong> ${reportDate}</p>
          <p style="margin: 0;"><strong>Genel Durum:</strong> ${report.description}</p>
        </div>

        ${updatesHtml}
        ${performanceHtml}
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center;">
          <p style="font-size: 13px; color: #777;">Sistemleriniz uzman ekibimiz tarafından sürekli olarak izlenmekte ve güvenli tutulmaktadır. Herhangi bir sorunuz olursa bu e-postayı yanıtlayabilirsiniz.</p>
          <p style="font-weight: bold; margin-top: 10px;">Saygılarımızla,<br>Agency Bakım Ekibi</p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: "Monitoring <onboarding@resend.dev>",
      to: [toEmail],
      subject,
      html: htmlContent,
    });

    // Mark as sent
    await prisma.maintenanceReport.update({
      where: { id: reportId },
      data: {
        status: "SENT",
        sentAt: new Date(),
      },
    });

    return { success: true };
  }
}
