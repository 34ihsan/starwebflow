import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EventBus } from '@/lib/automation/eventBus';
import { getStaffTenantId, getTenantIdOrLegacy } from '@/lib/tenant';
import { MASTER_BLUEPRINT } from '@/lib/email-pool';

export async function POST(req: Request) {
  try {
    const tenantId = (await getStaffTenantId()) || (await getTenantIdOrLegacy());
    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { leadIds, campaignId = 'master-blueprint-1' } = body;

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ success: false, error: "Geçersiz veya boş potansiyel müşteri listesi." }, { status: 400 });
    }

    // Convert all IDs to string to prevent any number/UUID type mismatches
    const stringLeadIds = leadIds.map((id: any) => String(id));

    // 1. Fetch matching leads for this tenant
    const leads = await prisma.lead.findMany({
      where: {
        id: { in: stringLeadIds },
        tenantId
      }
    });

    if (leads.length === 0) {
      return NextResponse.json({ success: false, error: "Seçilen müşteriler sistemde bulunamadı." }, { status: 404 });
    }

    console.log(`[Campaign API] Enrolling ${leads.length} leads to campaign '${campaignId}' for tenant ${tenantId}`);

    // 2. Resolve or automatically create the Target Email Campaign
    let campaign = await prisma.emailCampaign.findFirst({
      where: {
        tenantId,
        OR: [
          { id: campaignId },
          { name: { contains: "Hibrit B2B", mode: "insensitive" } },
          { name: { contains: "Tanışma", mode: "insensitive" } }
        ]
      },
      include: {
        templates: true,
        mailboxes: true
      }
    });

    // If no existing campaign found, auto-generate standard 5-step Master Blueprint Campaign
    if (!campaign) {
      console.log(`[Campaign API] Auto-creating default 5-step B2B Outreach Campaign for tenant ${tenantId}...`);
      campaign = await prisma.emailCampaign.create({
        data: {
          tenantId,
          name: "Hibrit B2B Tanışma Serisi (5 Günlük)",
          subject: "{{sirket}} için dijital büyüme ve AI otomasyonu hk.",
          type: "SEQUENCE",
          status: "sending",
          routingStrategy: "ROUND_ROBIN",
          dailyLimit: 50,
          templates: {
            create: [
              {
                tenantId,
                name: "Adım 1 - Buz Kırıcı & Acı Noktası",
                subject: MASTER_BLUEPRINT.day1.subject,
                htmlBody: MASTER_BLUEPRINT.day1.body.replace(/\n/g, '<br/>'),
                stepDay: 1,
                importance: "HIGH"
              },
              {
                tenantId,
                name: "Adım 2 - Vaka Analizi & Metrik",
                subject: MASTER_BLUEPRINT.day3.subject,
                htmlBody: MASTER_BLUEPRINT.day3.body.replace(/\n/g, '<br/>'),
                stepDay: 3,
                importance: "NORMAL"
              },
              {
                tenantId,
                name: "Adım 3 - Büyümenin Yeni Kuralı",
                subject: MASTER_BLUEPRINT.day7.subject,
                htmlBody: MASTER_BLUEPRINT.day7.body.replace(/\n/g, '<br/>'),
                stepDay: 7,
                importance: "NORMAL"
              },
              {
                tenantId,
                name: "Adım 4 - Değer & Karşılıklılık",
                subject: MASTER_BLUEPRINT.day12.subject,
                htmlBody: MASTER_BLUEPRINT.day12.body.replace(/\n/g, '<br/>'),
                stepDay: 12,
                importance: "NORMAL"
              },
              {
                tenantId,
                name: "Adım 5 - Profesyonel Çıkış (Breakup)",
                subject: MASTER_BLUEPRINT.day20.subject,
                htmlBody: MASTER_BLUEPRINT.day20.body.replace(/\n/g, '<br/>'),
                stepDay: 20,
                importance: "NORMAL"
              }
            ]
          }
        },
        include: {
          templates: true,
          mailboxes: true
        }
      });
    }

    // 3. Connect active mailboxes to campaign if not already linked
    const activeMailboxes = await prisma.emailMailbox.findMany({
      where: {
        tenantId,
        status: { in: ['ACTIVE', 'WARMUP'] }
      }
    });

    if (activeMailboxes.length > 0 && campaign.mailboxes.length === 0) {
      await prisma.emailCampaign.update({
        where: { id: campaign.id },
        data: {
          mailboxes: {
            connect: activeMailboxes.map(m => ({ id: m.id }))
          }
        }
      });
    }

    // 4. Update Leads status to IN_CAMPAIGN
    await prisma.lead.updateMany({
      where: {
        id: { in: leads.map(l => l.id) },
        tenantId
      },
      data: {
        status: "IN_CAMPAIGN"
      }
    });

    // 5. Create or Reset LeadSequence records ready for the cron worker
    let sequencesCreated = 0;
    const now = new Date();

    for (const lead of leads) {
      const existingSeq = await prisma.leadSequence.findFirst({
        where: {
          leadId: lead.id,
          tenantId
        }
      });

      if (existingSeq) {
        await prisma.leadSequence.update({
          where: { id: existingSeq.id },
          data: {
            campaignId: campaign.id,
            flowType: 'COLD_OUTREACH',
            currentStep: 1,
            status: 'ACTIVE',
            nextRunAt: now,
            metadata: {
              customPitch: lead.customPitch,
              painPoints: lead.painPoints,
              source: 'PROSPECTING',
              enrolledAt: now.toISOString()
            }
          }
        });
      } else {
        await prisma.leadSequence.create({
          data: {
            tenantId,
            leadId: lead.id,
            campaignId: campaign.id,
            flowType: 'COLD_OUTREACH',
            currentStep: 1,
            status: 'ACTIVE',
            nextRunAt: now,
            metadata: {
              customPitch: lead.customPitch,
              painPoints: lead.painPoints,
              source: 'PROSPECTING',
              enrolledAt: now.toISOString()
            }
          }
        });
      }
      sequencesCreated++;
    }

    // 6. Broadcast event to EventBus for any listening subscribers
    try {
      await EventBus.emit('campaign.started', { 
        campaignId: campaign.id, 
        leadIds: leads.map(l => l.id), 
        tenantId,
        count: sequencesCreated
      });
    } catch (e) {
      console.warn('[Campaign API] EventBus emit warning:', e);
    }

    return NextResponse.json({
      success: true,
      count: sequencesCreated,
      campaignName: campaign.name,
      message: `${sequencesCreated} potansiyel müşteri '${campaign.name}' kampanyasına başarıyla eklendi ve 5 adımlı otomatik e-posta sırasına alındı!`
    });

  } catch (error: any) {
    console.error("[Campaign API] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
