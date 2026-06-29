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
      authTimeout: 5000
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
    await connection.openBox('INBOX');

    // Search for unread emails
    const searchCriteria = ['UNSEEN'];
    const fetchOptions = {
      bodies: ['HEADER', 'TEXT', ''], // Empty string gets full raw message (RFC822)
      markSeen: false
    };

    const messages = await connection.search(searchCriteria, fetchOptions);
    let confirmedCount = 0;
    let readCount = 0;

    for (const item of messages) {
      const allParts = item.parts;
      const id = item.attributes.uid;
      const headerPart = allParts.find(part => part.which === 'HEADER');
      const textPart = allParts.find(part => part.which === 'TEXT');
      const rawPart = allParts.find(part => part.which === '');
      
      const subject = headerPart?.body?.subject?.[0] || '';
      const from = headerPart?.body?.from?.[0] || '';

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

      // Check if it's a newsletter confirm email
      const isConfirmEmail = 
        subject.toLowerCase().includes('confirm') || 
        subject.toLowerCase().includes('bestätigen') || 
        subject.toLowerCase().includes('verify') ||
        subject.toLowerCase().includes('abo') ||
        bodyText.toLowerCase().includes('confirm your subscription') ||
        bodyText.toLowerCase().includes('newsletter');

      if (isConfirmEmail) {
        // Look for confirmation URLs
        const urlRegex = /https?:\/\/[^\s"'<>]+/g;
        const matches = (bodyText + ' ' + htmlContent).match(urlRegex) || [];
        
        // Find links that look like verification/activation
        const confirmLink = matches.find(url => 
          url.includes('confirm') || 
          url.includes('verify') || 
          url.includes('activate') || 
          url.includes('subscribe') ||
          url.includes('bestaetigen') ||
          url.includes('aktivieren')
        );

        if (confirmLink) {
          try {
            console.log(`[Warmup] Confirming newsletter subscription for ${config.email} via link: ${confirmLink}`);
            await fetch(confirmLink, { method: 'GET', headers: { 'User-Agent': 'Mozilla/5.0' } });
            confirmedCount++;
          } catch (fetchErr) {
            console.error(`Failed to fetch confirmation link: ${confirmLink}`, fetchErr);
          }
        }
      }

      // If it is from a newsletter or warmup interaction, mark it as read and star it
      const isNewsletterSender = 
        from.includes('tldr') || 
        from.includes('substack') || 
        from.includes('morningbrew') || 
        from.includes('starwebflow.com') ||
        from.includes('starwebflow');

      if (isNewsletterSender || isConfirmEmail) {
        // Mark as seen
        await connection.addFlags(id, 'SEEN');
        // Add flagged/star status for positive reputation
        await connection.addFlags(id, 'FLAGGED');
        readCount++;
      }
    }

    connection.end();
    return { success: true, confirmedCount, readCount };
  } catch (error) {
    console.error(`IMAP processing error for ${config.email}:`, error);
    return { success: false, error };
  }
}
