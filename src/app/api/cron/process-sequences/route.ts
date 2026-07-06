import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzeLeadProfile, metamorphicRewrite, omniRouteSelector } from '@/app/actions/outreachEngine';
import { sendOutreachEmail } from '@/lib/email';

const NEXT_STEPS: Record<number, { nextStep: number, daysToAdd: number } | null> = {
  1: { nextStep: 3, daysToAdd: 2 },   // Step 1 done -> Next is step 3 (in 2 days)
  3: { nextStep: 7, daysToAdd: 4 },   // Step 3 done -> Next is step 7 (in 4 days)
  7: { nextStep: 12, daysToAdd: 5 },  // Step 7 done -> Next is step 12 (in 5 days)
  12: { nextStep: 20, daysToAdd: 8 }, // Step 12 done -> Next is step 20 (in 8 days)
  20: null                            // Step 20 done -> sequence ends
};

// Legacy sector determining logic (removed since we use CampaignId now)

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();

    // Find sequences ready to run
    const sequences = await prisma.leadSequence.findMany({
      where: {
        status: 'ACTIVE',
        nextRunAt: { lte: now },
        lead: {
          unsubscribed: false,
          email: { not: null }
        }
      },
      include: { lead: true },
      take: 50 // process in batches
    });

    let sentCount = 0;

    for (const sequence of sequences) {
      const email = sequence.lead.email;
      const name = sequence.lead.name;
      const company = sequence.lead.company;

      if (!email) {
        await prisma.leadSequence.update({
          where: { id: sequence.id },
          data: { status: 'COMPLETED' }
        });
        continue;
      }

      try {
        // AI Lead Analysis for personalization context
        const profile = await analyzeLeadProfile(email, name, company);
        
        let dbTemplate = null;
        if (sequence.campaignId) {
          dbTemplate = await prisma.emailTemplate.findFirst({
            where: { 
              campaignId: sequence.campaignId,
              stepDay: sequence.currentStep 
            }
          });
        }
        
        // Fallback for legacy sequences without campaignId
        if (!dbTemplate && !sequence.campaignId) {
          dbTemplate = await prisma.emailTemplate.findFirst({
            where: { name: `DRIP_B2B_${sequence.currentStep}` }
          });
        }
        
        if (!dbTemplate) {
          console.warn(`No template found for step ${sequence.currentStep} (Campaign: ${sequence.campaignId}). Marking sequence ${sequence.id} as COMPLETED.`);
          await prisma.leadSequence.update({
            where: { id: sequence.id },
            data: { status: 'COMPLETED' }
          });
          continue;
        }

        // AI Metamorphic Template Rewrite
        const htmlBody = await metamorphicRewrite(dbTemplate.htmlBody, { ...profile, name, company });

        // Omni-Routing
        const senderEmail = await omniRouteSelector(email, sequence.tenantId);

        // Process Unsubscribe Link
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const unsubscribeLink = `${appUrl}/api/unsubscribe?email=${encodeURIComponent(email)}`;
        const finalHtmlBody = htmlBody.replace(/\\[Abonelikten Çık\\]/g, `<a href="${unsubscribeLink}" style="color: #6b7280; text-decoration: underline;">Abonelikten Çık</a>`);

        // Update subject for the user's language/industry if needed
        const subjectText = dbTemplate.subject
          .replace('{Name}', name || 'Müşterimiz')
          .replace('{Industry}', profile.industry || 'sektörünüz')
          .replace('{Company}', company || profile.industry || 'şirketiniz');

        // Send Email via Nodemailer + Hostinger SMTP
        await sendOutreachEmail({
          from: senderEmail,
          to: email,
          subject: subjectText,
          html: finalHtmlBody,
          replyTo: senderEmail,
        });

        // Calculate next step
        const stepProgression = NEXT_STEPS[sequence.currentStep];
        
        if (stepProgression) {
          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + stepProgression.daysToAdd);
          
          await prisma.leadSequence.update({
            where: { id: sequence.id },
            data: {
              currentStep: stepProgression.nextStep,
              nextRunAt: nextDate
            }
          });
        } else {
          // No more steps -> sequence completed
          await prisma.leadSequence.update({
            where: { id: sequence.id },
            data: { status: 'COMPLETED', nextRunAt: null }
          });
        }

        sentCount++;
        
        // Stealth Delay (1-3 seconds)
        await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 2000) + 1000));
        
      } catch (err) {
        console.error(`Failed sequence ${sequence.id}`, err);
      }
    }

    return NextResponse.json({ success: true, processed: sequences.length, sent: sentCount });

  } catch (error: any) {
    console.error('[Process Sequences Cron Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
