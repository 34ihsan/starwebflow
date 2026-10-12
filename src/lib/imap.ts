import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';

export interface ImapConfig {
  email: string;
  appPassword?: string;
  imapHost?: string;
  imapPort?: number;
  imapUser?: string;
  imapPassword?: string;
}

function getImapConfig(config: ImapConfig) {
  return {
    imap: {
      user: config.imapUser || config.email,
      password: config.imapPassword || config.appPassword || '',
      host: config.imapHost || 'imap.ionos.de',
      port: config.imapPort || 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
      authTimeout: 10000
    }
  };
}

/** "Name <a@b.com>" veya ham adres -> a@b.com */
function extractAddress(from: any): string {
  const s = typeof from === 'string' ? from : (from?.address || from?.text || '');
  const m = String(s).match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return (m ? m[0] : String(s)).toLowerCase();
}

export interface PlacementEvent {
  sender: string;
  folder: 'INBOX' | 'SPAM';
}

export async function processInboundEmails(config: ImapConfig, seedEmails: string[] = []) {
  const imapConnectionConfig = getImapConfig(config);
  if (!imapConnectionConfig.imap.password) {
    console.warn(`No password provided for IMAP mailbox: ${config.email}`);
    return { success: false, reason: 'No password' };
  }

  try {
    const connection = await imaps.connect(imapConnectionConfig);
    
    let rescuedFromSpam = 0;
    let readCount = 0;
    let bounceCount = 0;
    let bouncedRecipients: string[] = [];
    const placements: PlacementEvent[] = [];

    // --- 1. SPAM RESCUE (Move to Inbox) ---
    const boxes = await connection.getBoxes();
    let spamBoxName: string | null = null;
    
    // Recursive function to find Spam/Junk folder
    const scanBoxes = (boxObj: any, prefix = '') => {
      for (const [boxName, boxDetails] of Object.entries(boxObj)) {
        const fullBoxName = prefix + boxName;
        const lowerName = fullBoxName.toLowerCase();
        if (lowerName.includes('spam') || lowerName.includes('junk')) {
          spamBoxName = fullBoxName;
          return;
        }
        if ((boxDetails as any).children) {
          scanBoxes((boxDetails as any).children, fullBoxName + (boxDetails as any).delimiter);
        }
      }
    };
    scanBoxes(boxes);

    if (spamBoxName) {
      try {
        await connection.openBox(spamBoxName);
        // Sadece okunmamış mailleri tarayalım (gereksiz yük olmasın)
        const spamMessages = await connection.search(['UNSEEN'], { bodies: ['HEADER'] });
        for (const item of spamMessages) {
          const headerPart = item.parts.find(part => part.which === 'HEADER');
          const from = headerPart?.body?.from?.[0] || '';
          
          // Eğer bu bizim havuzumuzdan veya seed hesaplardan veya bültenlerden gelen bir mail ise kurtar!
          const isSeedAccount = seedEmails.some(seed => from.toLowerCase().includes(seed.toLowerCase()));
          const isKnownNewsletter = ['tldr', 'substack', 'beehiiv', 'densediscovery', 'hackernewsletter', 'medium'].some(d => from.toLowerCase().includes(d));

          if (isSeedAccount || isKnownNewsletter) {
            // Ölçüm: kurtarmadan ÖNCE kaydet (warmup göndericisi spam'e düştü)
            if (isSeedAccount) placements.push({ sender: extractAddress(from), folder: 'SPAM' });
            const uid = item.attributes.uid as number;
            // IMAP Move command to INBOX (Not Spam signal)
            await connection.moveMessage(String(uid), 'INBOX');
            rescuedFromSpam++;
            console.log(`[SPAM RESCUE] Rescued email from ${from} to INBOX for ${config.email}`);
          }
        }
      } catch (err) {
        console.error(`Error processing Spam box for ${config.email}:`, err);
      }
    }

    // --- 2. INBOX PROCESSING (Read, Star, and Bounce Detection) ---
    await connection.openBox('INBOX');
    const messages = await connection.search(['UNSEEN'], {
      bodies: ['HEADER', 'TEXT', ''],
      markSeen: false
    });

    for (const item of messages) {
      const allParts = item.parts;
      const uid = item.attributes.uid as number;
      const headerPart = allParts.find(part => part.which === 'HEADER');
      const textPart = allParts.find(part => part.which === 'TEXT');
      const rawPart = allParts.find(part => part.which === '');
      
      const subject = headerPart?.body?.subject?.[0] || '';
      const from = (headerPart?.body?.from?.[0] || '').toLowerCase();

      // Parse full body using mailparser
      let bodyText = textPart?.body || '';
      let htmlContent = '';
      
      try {
        const rawMail = rawPart?.body || '';
        if (rawMail) {
          const parsed = await simpleParser(rawMail);
          bodyText = parsed.text || '';
          htmlContent = parsed.html || '';
        }
      } catch (err) {
        console.error('Mail parsing failed', err);
      }

      // 2.A: BOUNCE DETECTION (Universal parser)
      const isBounce = from.includes('mailer-daemon') || from.includes('postmaster') || from.includes('bounce') || subject.toLowerCase().includes('delivery status notification') || subject.toLowerCase().includes('undelivered');
      if (isBounce) {
        bounceCount++;
        
        const bodyContent = bodyText + ' ' + htmlContent;
        const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
        const matches = bodyContent.match(emailRegex) || [];
        
        const senderLower = config.email.toLowerCase();
        for (const match of matches) {
           const emailMatch = match.toLowerCase();
           // Ignore mailer daemons and the current mailbox itself
           if (
             emailMatch !== senderLower && 
             !emailMatch.includes('mailer-daemon') && 
             !emailMatch.includes('postmaster') &&
             !emailMatch.includes('google.com') &&
             !emailMatch.includes('protection.outlook.com')
           ) {
              if (!bouncedRecipients.includes(emailMatch)) {
                 bouncedRecipients.push(emailMatch);
              }
           }
        }

        // Mark bounce notification as seen
        await connection.addFlags(uid, 'SEEN');
        continue;
      }

      // 2.B: NEWSLETTER CONFIRMATION
      const isConfirmEmail = 
        subject.toLowerCase().includes('confirm') || 
        subject.toLowerCase().includes('verify') ||
        bodyText.toLowerCase().includes('confirm your subscription');

      if (isConfirmEmail) {
        const urlRegex = /https?:\/\/[^\s"'<>]+/g;
        const matches = (bodyText + ' ' + htmlContent).match(urlRegex) || [];
        const confirmLink = matches.find(url => 
          url.includes('confirm') || url.includes('verify') || url.includes('subscribe') || url.includes('aktivieren')
        );

        if (confirmLink) {
          try {
            await fetch(confirmLink, { method: 'GET', headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(5000) });
            console.log(`[Warmup] Confirmed newsletter for ${config.email}`);
          } catch (fetchErr) {
            // Ignore fetch errors
          }
        }
      }

      // 2.C: STAR, CLICK & MARK SEEN FOR WARMUP EMAILS
      const isSeedAccount = seedEmails.some(seed => from.includes(seed.toLowerCase()));
      const isKnownNewsletterSender = ['tldr', 'substack', 'beehiiv', 'densediscovery', 'hackernewsletter', 'medium'].some(d => from.includes(d));
      const isSwfWarmupTag = 
        (rawPart?.body || '').toString().toLowerCase().includes('x-starwebflow-warmup') ||
        (htmlContent || '').includes('swf-warmup-token') ||
        (bodyText || '').includes('swf-warmup-token');

      const isWarmupInteraction = isSeedAccount || isKnownNewsletterSender || isSwfWarmupTag;
      
      if (isWarmupInteraction || isConfirmEmail) {
        // Gerçek inbox yerleşimi: warmup maili spam'e değil INBOX'a düştü
        if (isSeedAccount || isSwfWarmupTag) placements.push({ sender: extractAddress(headerPart?.body?.from?.[0] || from), folder: 'INBOX' });
        // Elite Pro: Link Click Simulation (Tıklama Simülasyonu)
        if (isWarmupInteraction) {
          const urlRegex = /https?:\/\/[^\s"'<>]+/g;
          const matches = (bodyText + ' ' + htmlContent).match(urlRegex) || [];
          if (matches.length > 0) {
            const randomLink = matches[Math.floor(Math.random() * matches.length)];
            try {
              // Sadece HTTP GET isteği atarak tıklamayı simüle et
              await fetch(randomLink, { method: 'GET', headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }, signal: AbortSignal.timeout(3000) });
              console.log(`[Warmup] Simulated click on ${randomLink} for ${config.email}`);
            } catch (e) {
              // ignore fetch errors for dummy links
            }
          }
        }

        await connection.addFlags(uid, 'SEEN');
        await connection.addFlags(uid, 'FLAGGED'); // Star the email (Important)
        readCount++;

        // 2.C.1: AUTO-TRASH / ARCHIVE ENGINE (24-48 Saat Sonra Otomatik Temizleme)
        // E-postanın dahili tarihi 24 saatten eski ise Deleted bayrağı koy
        const emailDateStr = headerPart?.body?.date?.[0] || item.attributes?.date;
        if (emailDateStr) {
          const emailDate = new Date(emailDateStr);
          const ageHours = (Date.now() - emailDate.getTime()) / (1000 * 60 * 60);
          if (ageHours >= 24) {
            try {
              // 24 saat geçmiş warmup/bülten mailine silme bayrağı ekle
              await connection.addFlags(uid, '\\Deleted');
              console.log(`[Warmup Auto-Clean] Marked 24h+ warmup email as Deleted for ${config.email}`);
            } catch (delErr) {
              // ignore delete flag error
            }
          }
        }
      }

      // 2.D: ORGANIC EMAIL CAPTURE (INBOX SYSTEM)
      if (!isWarmupInteraction && !isConfirmEmail && !isBounce) {
        // This is a real email from a real person
        try {
          // Import dynamic to avoid circular dependencies if any
          const { prisma } = require('@/lib/prisma');
          const { notifyAdminForOrganicEmail } = require('@/lib/notifications');
          
          const fromName = headerPart?.body?.from?.[0]?.name || '';
          const fromAddress = headerPart?.body?.from?.[0]?.address || from;

          // Check if we already saved this message (prevent duplicates on next run if not marked as seen/moved)
          // Actually, we should probably mark it as seen or flag it?
          // Since it's organic, we don't want to mark it as read so the user can read it in their real inbox too.
          // But to prevent duplicate parsing every cron tick, we'll check DB by subject + from + date.
          
          // Let's find the mailbox to get tenantId
          const mailbox = await prisma.emailMailbox.findFirst({
            where: { email: config.email }
          });

          if (mailbox) {
            // Very simple duplicate check (bodyText could be long, so we just check recently created)
            const exists = await prisma.inboxMessage.findFirst({
              where: {
                mailboxEmail: config.email,
                fromEmail: fromAddress,
                subject: subject
              },
              orderBy: { createdAt: 'desc' }
            });

            const isRecent = exists && (Date.now() - new Date(exists.createdAt).getTime() < 1000 * 60 * 60 * 24); // Within 24h

            if (!isRecent) {
              await prisma.inboxMessage.create({
                data: {
                  tenantId: mailbox.tenantId,
                  mailboxId: mailbox.id,
                  mailboxEmail: config.email,
                  fromEmail: fromAddress,
                  fromName: fromName,
                  subject: subject,
                  bodyText: bodyText,
                  bodyHtml: htmlContent,
                  isRead: false
                }
              });

              // AI Sentiment Analysis (Otomatik Durdurma & Unsubscribe Koruması)
              const lowerText = (subject + ' ' + bodyText).toLowerCase();
              const isUnsubscribeRequest = 
                lowerText.includes('unsubscribe') || 
                lowerText.includes('çıkar') || 
                lowerText.includes('mail atmayın') || 
                lowerText.includes('remove me') ||
                lowerText.includes('stop sending') ||
                lowerText.includes('listenizden çıkarın');

              if (isUnsubscribeRequest) {
                // Adayı otomatik unsubscribed işaretle ve sekansı durdur
                const targetLead = await prisma.lead.findFirst({
                  where: { email: fromAddress }
                });
                if (targetLead) {
                  await prisma.lead.update({
                    where: { id: targetLead.id },
                    data: { unsubscribed: true }
                  });
                  await prisma.leadSequence.updateMany({
                    where: { leadId: targetLead.id },
                    data: { status: 'PAUSED' }
                  });
                  console.log(`[AI Sentiment Protection] Auto-unsubscribed lead ${fromAddress} and paused active sequences.`);
                }
              }

              // Send Notification
              await notifyAdminForOrganicEmail({
                toMailbox: config.email,
                fromEmail: fromAddress,
                subject: subject,
                bodyPreview: bodyText || htmlContent.replace(/<[^>]+>/g, '') // Strip HTML
              });

              console.log(`[INBOX] Saved organic email from ${fromAddress} to ${config.email}`);
              
              // We could mark it as seen here so we don't process it again next minute
              await connection.addFlags(uid, 'SEEN');
            }
          }
        } catch (e) {
          console.error('[INBOX] Error saving organic email', e);
        }
      }
    }

    connection.end();
    return { success: true, rescuedFromSpam, readCount, bounceCount, bouncedRecipients, placements };
  } catch (error) {
    console.error(`IMAP processing error for ${config.email}:`, error);
    return { success: false, error };
  }
}
