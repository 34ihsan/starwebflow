import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzeLeadProfile, metamorphicRewrite, omniRouteSelector } from '@/app/actions/outreachEngine';
import { sendMail } from '@/lib/email';
// Helper to determine next step and day delay
function getNextSequenceStep(currentStep: number) {
  const sequenceDays = [1, 3, 7, 12, 20];
  const currentIndex = sequenceDays.indexOf(currentStep);
  if (currentIndex === -1 || currentIndex === sequenceDays.length - 1) {
    return { nextStep: null, delayDays: 0 }; // Sequence complete
  }
  const nextStep = sequenceDays[currentIndex + 1];
  const delayDays = nextStep - currentStep;
  return { nextStep, delayDays };
}

function getSystemPromptForStep(step: number, flowType: string) {
  if (step === 1) return `Sen otonom bir Satış Uzmanısın. Müşterinin problemi odaklı, kısa ve merak uyandıran bir tanışma maili (Hook) yaz. "Bana bir şey satılıyor" hissi uyandırma.`;
  if (step === 3) return `Müşteriye sektörlerindeki benzer bir firmanın nasıl bir sorun yaşayıp bizimle nasıl çözdüğünü anlatan, altı dolu bir 'Değer/Vaka Analizi' (Value/Case Study) e-postası yaz.`;
  if (step === 7) return `"Sektörünüzde 2026 sonuna kadar şu AI/Web teknolojileri standart olacak, hazır mısınız?" temalı, otorite konumlandıran ufuk açıcı bir mail (Insight) yaz.`;
  if (step === 12) return `"Sanırım şu an önceliğiniz bu konu değil..." ile başlayan, karşı tarafa kontrolü veren, ancak yine de kapıyı açık bırakan zarif bir çekilme (Soft Breakup) maili yaz.`;
  if (step === 20) return `"Farklı bir departmandan biriyle mi görüşmeliyim?" veya tamamen yeni bir mikro-çözüm (Örn: Ücretsiz Denetim Raporu) teklifi (The Pivot) yaz.`;
  return `Profesyonel bir e-posta yaz.`;
}

export async function GET(req: Request) {
  // Authentication for Cron Job (e.g., using a secret token)
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const now = new Date();

    // 1. Find all active sequences that are due to run
    const activeSequences = await prisma.leadSequence.findMany({
      where: {
        status: 'ACTIVE',
        nextRunAt: { lte: now }
      },
      include: {
        lead: true,
        tenant: true
      },
      take: 50 // Process in batches
    });

    if (activeSequences.length === 0) {
      return NextResponse.json({ message: 'No active sequences due to run.', processed: 0 });
    }

    let processedCount = 0;

    for (const seq of activeSequences) {
      const lead = seq.lead;
      if (!lead.email) continue;

      // 2. AI Profile Analysis
      const profile = await analyzeLeadProfile(lead.email, lead.name, lead.company || '');

      // 3. Determine Prompt based on current step
      const stepPrompt = getSystemPromptForStep(seq.currentStep, seq.flowType || 'outreach');
      const basePrompt = `Amacımız: ${seq.flowType || 'outreach'} kampanyasının ${seq.currentStep}. gün e-postasını göndermek.`;
      
      // 4. Generate Content
      const htmlBody = await metamorphicRewrite(stepPrompt + " " + basePrompt, {
        name: lead.name,
        company: lead.company || '',
        language: profile.language,
        industry: lead.industry || profile.industry
      });

      // 5. Omni-Routing
      const senderEmail = await omniRouteSelector(lead.email, seq.tenantId);
      const subjectText = profile.language === 'TR'
        ? `StarWebflow - ${lead.company || lead.industry || 'Sektörünüz'} İçin Özel Bir Fikir`
        : `StarWebflow - Quick Idea for ${lead.company || lead.industry || 'Your Business'}`;

      // 6. Send Email
      try {
        await sendMail({
          from: `StarWebflow <${senderEmail}>`,
          to: lead.email,
          subject: subjectText,
          html: htmlBody,
          replyTo: senderEmail,
        });

        // 7. Calculate Next Step
        const { nextStep, delayDays } = getNextSequenceStep(seq.currentStep);

        if (nextStep === null) {
          // Sequence is complete. Let's schedule a Cross-Sell 60 days later if needed.
          // Add 'SEO' to needs as an example of cross-sell logic
          await prisma.lead.update({
            where: { id: lead.id },
            data: { needs: { push: 'SEO_CROSS_SELL' } }
          });

          await prisma.leadSequence.update({
            where: { id: seq.id },
            data: { status: 'COMPLETED' }
          });

        } else {
          // Schedule next run
          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + delayDays);

          await prisma.leadSequence.update({
            where: { id: seq.id },
            data: {
              currentStep: nextStep,
              nextRunAt: nextDate
            }
          });
        }

        processedCount++;

      } catch (err: any) {
        console.error(`Failed to process sequence ${seq.id}:`, err);
        // We might want to pause or log the error
      }
    }

    return NextResponse.json({ message: 'Success', processed: processedCount });

  } catch (error: any) {
    console.error('Sequence Runner Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
