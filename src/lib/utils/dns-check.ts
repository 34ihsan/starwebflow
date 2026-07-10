import { resolveTxt } from 'dns/promises';

const DNS_TIMEOUT_MS = 5000;

async function resolveTxtWithTimeout(domain: string): Promise<string[][]> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('DNS Timeout')), DNS_TIMEOUT_MS)
  );
  return Promise.race([
    resolveTxt(domain),
    timeoutPromise
  ]);
}

export async function checkSPF(domain: string): Promise<boolean> {
  try {
    const records = await resolveTxtWithTimeout(domain);
    for (const record of records) {
      const txt = record.join('');
      if (txt.includes('v=spf1')) {
        return true;
      }
    }
  } catch (error) {
    // ignore
  }
  return false;
}

export async function checkDMARC(domain: string): Promise<boolean> {
  try {
    const records = await resolveTxtWithTimeout(`_dmarc.${domain}`);
    for (const record of records) {
      const txt = record.join('');
      if (txt.includes('v=DMARC1')) {
        return true;
      }
    }
  } catch (error) {
    // ignore
  }
  return false;
}

export async function checkDKIM(domain: string): Promise<boolean> {
  // Most common DKIM selectors (PRO level exhaustive list)
  const commonSelectors = [
    'google', 'default', 'mail', 'selector1', 's1', 's2', 'k1', 'k2', 'smtp',
    'ionos', 'pic', 'zoho', 'protonmail', 'protonmail2', 'protonmail3',
    'x', 'y', 'z', 'm1', 'm2', 'sg', 'sendgrid'
  ];
  for (const selector of commonSelectors) {
    try {
      const records = await resolveTxtWithTimeout(`${selector}._domainkey.${domain}`);
      for (const record of records) {
        const txt = record.join('');
        // DKIM record usually has v=DKIM1 or k=rsa or p=...
        if (txt.includes('v=DKIM1') || txt.includes('p=')) {
          return true;
        }
      }
    } catch (error) {
      // ignore
    }
  }
  return false;
}
