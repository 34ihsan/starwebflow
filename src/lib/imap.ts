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

export async function processInboundEmails(config: ImapConfig) {
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
          
          // Eğer bu bizim ağımızdan veya starwebflow'dan gelen bir mail ise kurtar!
          if (from.toLowerCase().includes('starwebflow')) {
            const uid = item.attributes.uid;
            // IMAP Move command
            await connection.moveMessage(uid, 'INBOX');
            rescuedFromSpam++;
            console.log(`[SPAM RESCUE] Moved email from ${from} to INBOX for ${config.email}`);
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
      const uid = item.attributes.uid;
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

      // 2.A: BOUNCE DETECTION
      const isBounce = from.includes('mailer-daemon') || from.includes('postmaster') || from.includes('bounce');
      if (isBounce) {
        bounceCount++;
        // Optionally mark as read
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
            await fetch(confirmLink, { method: 'GET', headers: { 'User-Agent': 'Mozilla/5.0' } });
            console.log(`[Warmup] Confirmed newsletter for ${config.email}`);
          } catch (fetchErr) {
            // Ignore fetch errors
          }
        }
      }

      // 2.C: STAR & MARK SEEN FOR WARMUP EMAILS
      const isWarmupInteraction = from.includes('starwebflow') || from.includes('tldr') || from.includes('substack');
      
      if (isWarmupInteraction || isConfirmEmail) {
        await connection.addFlags(uid, 'SEEN');
        await connection.addFlags(uid, 'FLAGGED'); // Star the email (Important)
        readCount++;
      }
    }

    connection.end();
    return { success: true, rescuedFromSpam, readCount, bounceCount };
  } catch (error) {
    console.error(`IMAP processing error for ${config.email}:`, error);
    return { success: false, error };
  }
}
