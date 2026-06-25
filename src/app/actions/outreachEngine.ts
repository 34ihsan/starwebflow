'use server';

import { prisma } from '@/lib/prisma';
import { generateText } from 'ai';
import { getFlashModel } from '@/lib/ai/gemini-client';
import { Resend } from 'resend';


const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

// Helper to deduce language & industry
export async function analyzeLeadProfile(email: string, name: string | null, company: string | null) {
  try {
    const { text } = await generateText({
      model: getFlashModel(),
      system: `You are an expert data analyst. Based on the lead's email, name, and company, deduce their primary language (e.g. TR, EN, DE) and industry. Return ONLY a JSON object: {"language": "XX", "industry": "SectorName"}. DO NOT return markdown.`,
      prompt: `Name: ${name || 'N/A'}\nEmail: ${email}\nCompany: ${company || 'N/A'}`
    });
    const parsed = JSON.parse(text);
    return {
      language: parsed.language || 'EN',
      industry: parsed.industry || 'Genel'
    };
  } catch (e) {
    console.error("AI Analysis Failed", e);
    return { language: 'EN', industry: 'Genel' };
  }
}

// Helper to rewrite the template using Metamorphic Design (Spinning for Anti-Spam)
export async function metamorphicRewrite(basePrompt: string, leadProfile: { name: string | null, company: string | null, language: string, industry: string }) {
  try {
    const { text } = await generateText({
      model: getFlashModel(),
      system: `Sen elit bir B2B Satış Yöneticisisin. Sana verilen e-posta taslağını (prompt), %100 özgün ve yapısal olarak tamamen farklı olacak şekilde yeniden yazacaksın (Hyper-Spintax / Metamorphic Spinning). Bu işlem spam filtrelerini atlatmak için kritik öneme sahip.
Kurallar:
1. Ana mesajın özü ve sunulan değer (Value Proposition) KESİNLİKLE aynı kalmalı ancak cümle yapıları, paragraf dizilimi ve kullanılan kelime dağarcığı tamamen değiştirilmeli. Her bir çıktı birbirinden benzersiz olmalı.
2. Basit eşanlamlı kelime değişimi (spinning) yapma; konsepti baştan farklı cümlelerle, farklı bağlaçlar ve farklı girişlerle ifade et.
3. Sadece HTML çıktısı ver (Markdown kullanma).
4. Metin içindeki {Name}, {Company}, {Industry} gibi değişken isimlerine ve [Abonelikten Çık] gibi köşeli parantezli link/buton metinlerine ASLA dokunma.
5. E-postanın sonundaki imza (Sinan, Kurucu / Yönetici vb.) ve Yasal Uyarı metnini BİREBİR KORU, hiçbir kelimesini değiştirme.
6. Aşırı satıcı, acil (urgent) tonlardan kaçın; son derece kurumsal, özgüvenli ve değer odaklı ol.`,
      prompt: `Hedef Müşteri:
- Ad: ${leadProfile.name || 'Yetkili'}
- Şirket: ${leadProfile.company || 'Şirketiniz'}
- Sektör: ${leadProfile.industry}
- Dil: ${leadProfile.language}

Orijinal E-posta Taslağı:
${basePrompt}

Lütfen bu taslağı hedef dilde, belirtilen kurallara tam uyarak HTML formatında spinleyerek yeniden yaz.`
    });
    return text;
  } catch (e) {
    console.error("Metamorphic Rewrite Failed", e);
    // Fallback to basic HTML if AI fails, to ensure variables are preserved loosely.
    return `<div>${basePrompt.replace(/\n/g, '<br/>')}</div>`;
  }
}

// Omni-Routing Logic
export async function omniRouteSelector(targetEmail: string, tenantId: string) {
  // Demo Logic: Check if it's outlook or gmail
  const domain = targetEmail.split('@')[1] || '';
  
  const mailboxes = await prisma.emailMailbox.findMany({
    where: { tenantId, status: 'WARMUP' },
    orderBy: { reputation: 'desc' }
  });

  if (mailboxes.length === 0) {
    return process.env.OUTBOUND_EMAIL_ADDRESS || 'info@starwebflow.com';
  }

  // Ideally, match google MX to google sending IPs, Microsoft to Office365 IPs.
  // For MVP, we return the highest reputation mailbox.
  return mailboxes[0].email;
}

export async function processOutreachBatch(bulkOutreachId: string, tenantId: string, basePrompt: string) {
  // Update status to PROCESSING
  await prisma.bulkOutreach.update({
    where: { id: bulkOutreachId },
    data: { status: 'PROCESSING' }
  });

  const items = await prisma.outreachItem.findMany({
    where: { bulkOutreachId, status: 'PENDING' }
  });

  let sentCount = 0;
  let failedCount = 0;

  for (const item of items) {
    try {
      // 1. Status -> SENDING
      await prisma.outreachItem.update({
        where: { id: item.id },
        data: { status: 'SENDING' }
      });

      // 2. AI Lead Analysis
      const profile = await analyzeLeadProfile(item.email, item.name, item.company);
      
      // 3. AI Metamorphic Template Rewrite
      const htmlBody = await metamorphicRewrite(basePrompt, { ...profile, name: item.name, company: item.company });

      // 4. Omni-Routing
      const senderEmail = await omniRouteSelector(item.email, tenantId);

      // 4.5. Process Unsubscribe Link
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const unsubscribeLink = `${appUrl}/api/unsubscribe?email=${encodeURIComponent(item.email)}`;
      const finalHtmlBody = htmlBody.replace(/\[Abonelikten Çık\]/g, `<a href="${unsubscribeLink}" style="color: #6b7280; text-decoration: underline;">Abonelikten Çık</a>`);

      // 5. Send via Resend with High Priority
      const subjectText = profile.language === 'TR' 
        ? `StarWebflow - ${profile.industry} Sektörüne Özel Davet` 
        : `StarWebflow - Exclusive Invitation for ${item.company || profile.industry}`;

      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: `StarWebflow <${senderEmail}>`,
          to: item.email,
          subject: subjectText,
          html: finalHtmlBody,
          replyTo: senderEmail,
          headers: {
            'X-Priority': '1',
            'X-MSMail-Priority': 'High',
            'Importance': 'high'
          }
        });
      } else {
        console.warn(`Simulating email to ${item.email} via ${senderEmail} with priority HIGH`);
      }

      // 6. Stealth Delay (Simulated 2-5 seconds for dev, normally 3-12 minutes)
      const stealthDelayMs = Math.floor(Math.random() * 3000) + 2000;
      await new Promise(resolve => setTimeout(resolve, stealthDelayMs));

      // 7. Success
      await prisma.outreachItem.update({
        where: { id: item.id },
        data: { 
          status: 'SENT', 
          language: profile.language, 
          industry: profile.industry,
          sentAt: new Date()
        }
      });
      sentCount++;

    } catch (error: any) {
      console.error(`Error sending to ${item.email}:`, error);
      await prisma.outreachItem.update({
        where: { id: item.id },
        data: { status: 'FAILED', errorMsg: error.message }
      });
      failedCount++;
    }

    // Update global progress
    await prisma.bulkOutreach.update({
      where: { id: bulkOutreachId },
      data: { sentCount, failedCount }
    });
  }

  // Done
  await prisma.bulkOutreach.update({
    where: { id: bulkOutreachId },
    data: { status: 'COMPLETED' }
  });
}
