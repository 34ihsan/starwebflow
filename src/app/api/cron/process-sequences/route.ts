import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzeLeadProfile, metamorphicRewrite, omniRouteSelector } from '@/app/actions/outreachEngine';
import { sendOutreachEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const NEXT_STEPS: Record<number, { nextStep: number, daysToAdd: number } | null> = {
  1: { nextStep: 3, daysToAdd: 2 },   // Step 1 done -> Next is step 3 (in 2 days)
  3: { nextStep: 7, daysToAdd: 4 },   // Step 3 done -> Next is step 7 (in 4 days)
  7: { nextStep: 12, daysToAdd: 5 },  // Step 7 done -> Next is step 12 (in 5 days)
  12: { nextStep: 20, daysToAdd: 8 }, // Step 12 done -> Next is step 20 (in 8 days)
  20: null                            // Step 20 done -> sequence ends
};

/**
 * Spintax parser
 * Supports nested spintax like {Hi|Hello {there|friend}}
 */
function parseSpintax(text: string): string {
  let result = text;
  while (/\{[^{}]*\}/.test(result)) {
    result = result.replace(/\{([^{}]*)\}/g, (match, contents) => {
      const parts = contents.split('|');
      return parts[Math.floor(Math.random() * parts.length)];
    });
  }
  return result;
}

/**
 * Personalization variable replacer
 * Supports: {{ad}}, {{soyad}}, {{sirket}}, {{sehir}}, {{sektor}}, {{url_1}}
 * Also handles legacy {Name}, {Company}, {Industry} tokens
 */
function replacePersonalizationVars(
  text: string,
  lead: { name?: string | null; company?: string | null },
  aiProfile?: { industry?: string; language?: string }
): string {
  const nameParts = (lead.name || '').split(' ');
  const firstName = nameParts[0] || 'Değerli Müşteri';
  const lastName = nameParts.slice(1).join(' ') || '';
  const company = lead.company || aiProfile?.industry || 'şirketiniz';
  const sector = aiProfile?.industry || 'sektörünüz';

  return text
    // Turkish variable tokens
    .replace(/\{\{ad\}\}/gi, firstName)
    .replace(/\{\{soyad\}\}/gi, lastName)
    .replace(/\{\{isim\}\}/gi, firstName)
    .replace(/\{\{sirket\}\}/gi, company)
    .replace(/\{\{şirket\}\}/gi, company)
    .replace(/\{\{sektor\}\}/gi, sector)
    .replace(/\{\{sektör\}\}/gi, sector)
    .replace(/\{\{url_1\}\}/gi, '')
    // Legacy tokens
    .replace(/\{Name\}/g, firstName)
    .replace(/\{Company\}/g, company)
    .replace(/\{Industry\}/g, sector);
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();

    // Business Hours Protection (06:00 UTC to 15:00 UTC -> 09:00 to 18:00 TRT)
    const utcHour = now.getUTCHours();
    const dayOfWeek = now.getUTCDay(); // 0 = Sunday, 6 = Saturday
    
    if (dayOfWeek === 0 || dayOfWeek === 6 || utcHour < 6 || utcHour >= 15) {
      return NextResponse.json({ 
        message: 'Out of business hours (Weekends or outside 09:00-18:00). Paused until next window.', 
        success: true, 
        processed: 0, 
        sent: 0 
      });
    }

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

        // Parse Spintax FIRST before AI rewrite
        const spunTemplate = parseSpintax(dbTemplate.htmlBody);

        // AI Metamorphic Template Rewrite
        const htmlBody = await metamorphicRewrite(spunTemplate, { ...profile, name, company });

        // Omni-Routing
        const senderEmail = await omniRouteSelector(email, sequence.tenantId);

        // Process Unsubscribe Link
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const unsubscribeLink = `${appUrl}/api/unsubscribe?email=${encodeURIComponent(email)}`;
        
        // Apply personalization variables + unsubscribe link
        const personalizedHtml = replacePersonalizationVars(htmlBody, { name, company }, profile)
          .replace(/\[Abonelikten Çık\]/g, `<a href="${unsubscribeLink}" style="color: #6b7280; text-decoration: underline;">Abonelikten Çık</a>`);

        // Apply personalization to subject
        const subjectText = replacePersonalizationVars(
          dbTemplate.subject,
          { name, company },
          profile
        );

        // Send Email via Nodemailer + SMTP
        await sendOutreachEmail({
          from: senderEmail,
          to: email,
          subject: subjectText,
          html: personalizedHtml,
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
