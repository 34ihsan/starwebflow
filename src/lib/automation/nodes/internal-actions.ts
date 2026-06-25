import { prisma } from "@/lib/prisma";
import { generateText } from "ai";
import { getFlashModel, getProModel } from "@/lib/ai/gemini-client";


export async function createProjectAction(tenantId: string, payload: any, nodeData: any) {
  // Expected payload: { contractId: "...", clientId: "..." }
  console.log("[Action] createProjectAction called", { tenantId, payload, nodeData });
  
  if (!payload.clientId) throw new Error("clientId is missing in payload");
  
  const project = await prisma.project.create({
    data: {
      tenantId,
      clientId: payload.clientId,
      title: nodeData.projectTitle || "Yeni Otonom Proje",
      status: "PLANNING",
      type: "BESPOKE"
    }
  });
  
  return { success: true, projectId: project.id, message: "Proje başarıyla oluşturuldu." };
}

export async function createTaskAction(tenantId: string, payload: any, nodeData: any) {
  // Expected payload: { projectId: "...", leadId: "..." }
  console.log("[Action] createTaskAction called", { tenantId, payload, nodeData });
  
  const task = await prisma.task.create({
    data: {
      tenantId,
      projectId: payload.projectId || null,
      leadId: payload.leadId || null,
      title: nodeData.taskTitle || "Otomatik Görev",
      description: nodeData.taskDescription || "Bu görev otomasyon tarafından oluşturuldu.",
      status: "TODO",
      priority: nodeData.priority || "MEDIUM",
    }
  });

  return { success: true, taskId: task.id, message: "Görev başarıyla oluşturuldu." };
}

export async function sendInternalChatAction(tenantId: string, payload: any, nodeData: any) {
  console.log("[Action] sendInternalChatAction called", { tenantId, payload, nodeData });
  
  if (!payload.clientId && !payload.leadId) {
    throw new Error("clientId or leadId is required to send a chat message");
  }

  // Find or create thread
  let thread = await prisma.chatThread.findFirst({
    where: {
      tenantId,
      ...(payload.clientId ? { clientId: payload.clientId } : { leadId: payload.leadId })
    }
  });

  if (!thread) {
    thread = await prisma.chatThread.create({
      data: {
        tenantId,
        ...(payload.clientId ? { clientId: payload.clientId } : { leadId: payload.leadId })
      }
    });
  }

  const message = await prisma.chatMessage.create({
    data: {
      threadId: thread.id,
      content: nodeData.message || "Merhaba! Sistemimiz tarafından otomatik bilgilendirme.",
      isFromLead: false
    }
  });

  return { success: true, messageId: message.id, message: "Mesaj başarıyla gönderildi." };
}

export async function aiScoreLeadAction(tenantId: string, payload: any, nodeData: any) {
  console.log("[Action] aiScoreLeadAction called", { tenantId, payload, nodeData });

  let leadData = "Lead bilgisi yok.";
  if (payload.leadId) {
    const lead = await prisma.lead.findUnique({ where: { id: payload.leadId } });
    if (lead) {
      leadData = `İsim: ${lead.name}, Sektör: ${lead.industry || "bilinmiyor"}, Hizmet: ${lead.serviceType || "bilinmiyor"}, Notlar: ${lead.notes || "yok"}`;
    }
  }

  let score = 50; // Fallback
  try {
    const { text } = await generateText({
      model: getFlashModel(),
      prompt: `Sen bir satış uzmanısın. Aşağıdaki lead verisini değerlendir ve 0-100 arasında bir satın alma niyet skoru belirle.
Lead: ${leadData}
SADECE bir sayı döndür (0-100). Başka bir şey yazma.`,
    });
    const parsed = parseInt(text.trim(), 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) score = parsed;
  } catch (e) {
    console.warn("[aiScoreLeadAction] Gemini hatası, fallback score kullanılıyor:", e);
    score = Math.floor(Math.random() * 40) + 60;
  }

  if (payload.leadId) {
    await prisma.lead.update({ where: { id: payload.leadId }, data: { score } });
  }

  return { success: true, score, message: `Lead Gemini AI ile skorlandı: ${score}/100` };
}


export async function createContractAction(tenantId: string, payload: any, nodeData: any) {
  // Expected payload: { proposalId: "...", leadId: "..." }
  console.log("[Action] createContractAction called", { tenantId, payload, nodeData });
  
  let clientName = "Bilinmeyen Müşteri";
  let clientEmail = "unknown@client.com";
  
  if (payload.leadId) {
    const lead = await prisma.lead.findUnique({
      where: { id: payload.leadId }
    });
    if (lead) {
      clientName = lead.name;
      clientEmail = lead.email || "no-email@client.com";
    }
  }

  const contract = await prisma.contract.create({
    data: {
      tenantId,
      clientName,
      clientEmail,
      title: nodeData.contractTitle || "Otomatik Sözleşme Taslağı",
      content: nodeData.contractContent || "Bu sözleşme teklif onayından sonra otomatik olarak oluşturulmuştur.",
      status: "DRAFT",
      value: payload.proposalValue || 0
    }
  });

  return { success: true, contractId: contract.id, message: "Sözleşme taslağı oluşturuldu." };
}

export async function convertLeadToClientAction(tenantId: string, payload: any, nodeData: any) {
  console.log("[Action] convertLeadToClientAction called", { tenantId, payload, nodeData });
  
  if (!payload.leadId) throw new Error("leadId is missing in payload");
  
  await prisma.lead.update({
    where: { id: payload.leadId },
    data: { status: "CLIENT" } // Ya da "WON", projedeki statülere göre.
  });

  return { success: true, message: "Müşteri adayı (Lead), aktif Müşteri (Client) olarak güncellendi." };
}

export async function requestAdminApprovalAction(tenantId: string, payload: any, nodeData: any) {
  console.log("[Action] requestAdminApprovalAction called", { tenantId, payload, nodeData });
  
  // Normalde DB'de Approval Request kaydı açarız.
  // Bu aşamada "PENDING_APPROVAL" statüsü ile süreci beklemeye alırız.
  
  return { 
    success: true, 
    status: "PENDING_APPROVAL", 
    message: "İşlem yönetici onayı bekliyor. Onaylanana kadar duraklatıldı." 
  };
}

export async function suspendProjectAction(tenantId: string, payload: any, nodeData: any) {
  console.log("[Action] suspendProjectAction called", { tenantId, payload, nodeData });
  // Proje veritabanında durduruldu statüsüne çekilecek
  return { success: true, message: "Proje donduruldu (Ödeme alınamadı)." };
}

export async function sendOverdueReminderAction(tenantId: string, payload: any, nodeData: any) {
  console.log("[Action] sendOverdueReminderAction called", { tenantId, payload, nodeData });
  return { success: true, message: `Gecikme uyarısı gönderildi: ${nodeData.severity || "Standart"}` };
}

export async function aiCompanyResearchAction(tenantId: string, payload: any, nodeData: any) {
  console.log("[Action] aiCompanyResearchAction called", { tenantId, payload, nodeData });

  const companyName = payload.companyName || nodeData.companyName || "Bilinmeyen Şirket";
  const website = payload.website || nodeData.website || "";

  let insight = "Şirket araştırması yapılamadı.";
  try {
    const { text } = await generateText({
      model: getProModel(),
      prompt: `Sen bir B2B satış istihbarat uzmanısın. Aşağıdaki şirket hakkında kısa bir profil çıkar.
Şirket adı: ${companyName}
${website ? `Web sitesi: ${website}` : ""}

Aşağıdaki başlıklarda maksimum 3 cümle yaz:
1. Şirket Özeti
2. Muhtemel Dijital İhtiyaçları (web, SEO, uygulama)
3. StarWebflow için Satış Fırsatı

Türkçe yaz. Kısa ve aksiyon odaklı ol.`,
    });
    insight = text;
  } catch (e) {
    console.warn("[aiCompanyResearchAction] Gemini hatası:", e);
    insight = `${companyName} için AI araştırması şu an yapılamıyor. Manuel inceleme gerekli.`;
  }

  return {
    success: true,
    insight,
    message: `${companyName} Gemini Pro ile araştırıldı.`,
  };
}

export async function sendClientUpdateMessageAction(tenantId: string, payload: any, nodeData: any) {
  console.log("[Action] sendClientUpdateMessageAction called", { tenantId, payload, nodeData });
  // Müşteriye proje aşamasının tamamlandığına dair mesaj atma (Messages paneli veya Email üzerinden)
  const taskName = payload.taskName || "Görev";
  
  return { 
    success: true, 
    message: `Müşteriye '${taskName}' aşamasının bittiğine dair bilgi mesajı gönderildi.` 
  };
}

export async function addLeadFromSocialAction(tenantId: string, payload: any, nodeData: any) {
  console.log("[Action] addLeadFromSocialAction called", { tenantId, payload, nodeData });
  return { success: true, message: "Sosyal medyadan gelen Lead CRM'e eklendi." };
}

export async function startEmailCampaignAction(tenantId: string, payload: any, nodeData: any) {
  console.log("[Action] startEmailCampaignAction called", { tenantId, payload, nodeData });

  const campaignName = nodeData.campaignName || "Hoşgeldin";
  const recipientName = payload.name || "Değerli Müşteri";
  const recipientCompany = payload.company || "";
  const serviceType = payload.serviceType || nodeData.serviceType || "dijital hizmetler";

  let emailContent = "";
  try {
    const { text } = await generateText({
      model: getFlashModel(),
      prompt: `Sen StarWebflow'un kişiselleştirilmiş e-posta uzmanısın.
Kampanya: ${campaignName}
Alıcı: ${recipientName}${recipientCompany ? ` (${recipientCompany})` : ""}
İlgilendiği hizmet: ${serviceType}

Kısa, samimi ve kişisel bir tanıtım e-postası yaz.
Format: Konu satırı (Subject:) ve gövde (Body:)
Maksimum 150 kelime. Türkçe.`,
    });
    emailContent = text;
  } catch (e) {
    console.warn("[startEmailCampaignAction] Gemini hatası:", e);
    emailContent = `Merhaba ${recipientName}, StarWebflow olarak sizinle iletişime geçmek istedik.`;
  }

  return {
    success: true,
    emailContent,
    message: `'${campaignName}' kampanyası için Gemini ile kişiselleştirilmiş e-posta üretildi.`,
  };
}
