'use server';

import { prisma } from '@/lib/prisma';
import { generateTextResilient, extractJsonFromText } from '@/lib/ai/gemini-client';
import { sendOutreachEmail } from '@/lib/email';
import { resolveTenantId } from '@/lib/tenant';

// Helper to deduce language & industry
export async function analyzeLeadProfile(email: string, name: string | null, company: string | null) {
  try {
    const { text } = await generateTextResilient({
      preferredModel: 'admin',
      system: `You are an expert data analyst. Based on the lead's email, name, and company, deduce their primary language (e.g. TR, EN, DE) and industry. Return ONLY a JSON object: {"language": "XX", "industry": "SectorName"}. DO NOT return markdown.`,
      prompt: `Name: ${name || 'N/A'}\nEmail: ${email}\nCompany: ${company || 'N/A'}`
    });
    const parsed = JSON.parse(extractJsonFromText(text));
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
    const { text } = await generateTextResilient({
      preferredModel: 'admin',
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

// Helper to generate dynamic, spam-proof high open-rate subject lines
export async function generateDynamicSubjectLine(leadProfile: { name: string | null, company: string | null, language: string, industry: string }) {
  try {
    const { text } = await generateTextResilient({
      preferredModel: 'admin',
      system: `You are an elite B2B copywriter specializing in ultra-high open-rate cold email subjects.
Generate EXACTLY ONE natural, personal subject line tailored to the lead.
STRICT RULES:
1. NEVER use spam words ("ÜCRETSİZ", "FREE", "GARANTİ", "FIRSAT", "ACİL", "SPECIAL OFFER", "!!!", exclamation marks, all-caps).
2. Sound like a direct 1-to-1 email from a fellow founder or tech director, not marketing fluff.
3. If language is TR, output Turkish. If DE, output German. Otherwise English.
4. Output ONLY the subject string. No quotation marks, no markdown, no prefixes.`,
      prompt: `Lead Name: ${leadProfile.name || 'Yetkili'}
Company: ${leadProfile.company || 'İşletme'}
Industry: ${leadProfile.industry}
Language: ${leadProfile.language}`
    });

    const cleanSubject = text.trim().replace(/^["']|["']$/g, '');
    if (cleanSubject && cleanSubject.length >= 6 && cleanSubject.length <= 80) {
      return cleanSubject;
    }
  } catch (err) {
    console.error("AI Subject Line Generation Failed, falling back", err);
  }

  // Graceful language-specific fallback
  if (leadProfile.language === 'DE') {
    return leadProfile.company ? `Kurze Frage bezüglich ${leadProfile.company}` : `Digitale Infrastruktur für ${leadProfile.industry}`;
  }
  if (leadProfile.language === 'TR') {
    return leadProfile.company ? `${leadProfile.company} hakkında kısa bir soru` : `${leadProfile.industry} sektörü için teknoloji altyapısı`;
  }
  return leadProfile.company ? `Quick question regarding ${leadProfile.company}` : `Digital infrastructure for ${leadProfile.industry}`;
}

// Enterprise Omni-Routing & Warmup Protection Logic
export async function omniRouteSelector(targetEmail: string, tenantId: string, campaignId?: string) {
  const targetDomain = (targetEmail.split('@')[1] || '').toLowerCase();
  const isTargetGoogle = targetDomain.includes('gmail') || targetDomain.includes('google');
  const isTargetMicrosoft = targetDomain.includes('outlook') || targetDomain.includes('hotmail') || targetDomain.includes('live') || targetDomain.includes('office365');

  const resolvedTenantId = resolveTenantId(tenantId);
  const whereClause: any = { 
    tenantId: resolvedTenantId, 
    isPaused: false,
    status: { not: 'ERROR' }
  };
  
  if (campaignId) {
    whereClause.campaigns = { some: { id: campaignId } };
  }

  const mailboxes = await prisma.emailMailbox.findMany({
    where: whereClause,
    orderBy: { reputation: 'desc' }
  });

  if (mailboxes.length === 0) {
    if (campaignId) {
      throw new Error('Lütfen bu kampanya için en az 1 aktif ve sağlıklı e-posta hesabı (Mailbox) seçin.');
    }
    throw new Error('Bu organizasyon için gönderim yapabilecek aktif posta kutusu bulunamadı.');
  }

  // 1. Isınma Kalkanı (Warmup Protection Shield):
  // Yeni eklenen ve henüz 14 gününü doldurmamış (warmupDay < 14) ve 'ACTIVE' onayına geçmemiş kutuları
  // soğuk satış kampanyalarına sokup domaini yakma!
  const matureMailboxes = mailboxes.filter(mb => {
    if (mb.status === 'ACTIVE') return true;
    if (mb.status === 'WARMUP' && (mb.warmupDay >= 14 || mb.warmupProgress >= 50) && mb.reputation >= 80) return true;
    return false;
  });

  if (matureMailboxes.length === 0) {
    throw new Error(
      'Seçilen posta kutusu henüz ilk 14 günlük ısınma (warmup) aşamasında. Domaininizin spam kara listelerine girmesini önlemek için soğuk satış kampanyaları en az 14 gün ısınmış veya ACTIVE onaylı hesaplarla başlatılabilir.'
    );
  }

  // 2. Günlük Limit Kotası Kontrolü
  const availableMailboxes = matureMailboxes.filter(mb => (mb.sentToday || 0) < (mb.maxDailyLimit || mb.limit || 40));
  
  if (availableMailboxes.length === 0) {
    throw new Error('Seçilen tüm sağlıklı posta kutuları günlük gönderim limitlerine ulaştı.');
  }

  // 3. Akıllı ESP Yönlendirme (ESP Omni-Routing):
  // Google hedeflerine Google kutusu, Microsoft hedeflerine Microsoft kutusu öncelikli
  let selectedMailbox = availableMailboxes[0];

  if (isTargetGoogle) {
    const googleMb = availableMailboxes.find(mb => 
      mb.provider === 'GOOGLE' || 
      (mb.email || '').toLowerCase().includes('gmail') || 
      (mb.smtpHost || '').toLowerCase().includes('google')
    );
    if (googleMb) selectedMailbox = googleMb;
  } else if (isTargetMicrosoft) {
    const msMb = availableMailboxes.find(mb => 
      mb.provider === 'MICROSOFT' || 
      (mb.email || '').toLowerCase().includes('outlook') || 
      (mb.smtpHost || '').toLowerCase().includes('office365')
    );
    if (msMb) selectedMailbox = msMb;
  }

  // Gönderim sayacını güncelle
  await prisma.emailMailbox.update({
    where: { id: selectedMailbox.id },
    data: { sentToday: { increment: 1 } }
  });

  return selectedMailbox.email;
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

      // 1.5 Verify Email
      const { verifyEmailSafely } = await import('@/lib/utils/email-validator');
      const validation = await verifyEmailSafely(item.email);
      if (!validation.isValid) {
        console.warn(`Email validation failed for ${item.email}: ${validation.reason}. Marking as FAILED.`);
        await prisma.outreachItem.update({
          where: { id: item.id },
          data: { status: 'FAILED', errorMsg: validation.reason || 'Geçersiz e-posta.' }
        });
        await prisma.lead.updateMany({
           where: { email: item.email },
           data: { unsubscribed: true, notes: validation.reason || 'Geçersiz e-posta.' }
        });
        failedCount++;
        // Update global progress
        await prisma.bulkOutreach.update({
          where: { id: bulkOutreachId },
          data: { sentCount, failedCount }
        });
        continue;
      }

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

      // 5. Dynamic AI Subject Generation & Resend Send
      const subjectText = await generateDynamicSubjectLine({
        name: item.name,
        company: item.company,
        industry: profile.industry,
        language: profile.language
      });

      await sendOutreachEmail({
        from: senderEmail,
        to: item.email,
        subject: subjectText,
        html: finalHtmlBody,
      });


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
