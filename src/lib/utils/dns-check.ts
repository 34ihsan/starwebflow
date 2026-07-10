import { resolveTxt, resolveCname } from 'dns/promises';

const DNS_TIMEOUT_MS = 5000;

async function resolveTxtWithTimeout(domain: string): Promise<string[][]> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('DNS Timeout')), DNS_TIMEOUT_MS);
  });
  
  try {
    const result = await Promise.race([
      resolveTxt(domain),
      timeoutPromise
    ]);
    return result;
  } finally {
    clearTimeout(timeoutId!);
  }
}

async function resolveCnameWithTimeout(domain: string): Promise<string[]> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('DNS Timeout')), DNS_TIMEOUT_MS);
  });
  
  try {
    const result = await Promise.race([
      resolveCname(domain),
      timeoutPromise
    ]);
    return result;
  } finally {
    clearTimeout(timeoutId!);
  }
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
    'ionos', 's1-ionos', 's2-ionos', 'pic', 'zoho', 'protonmail', 'protonmail2', 'protonmail3',
    'x', 'y', 'z', 'm1', 'm2', 'sg', 'sendgrid', 'resend'
  ];

  for (const selector of commonSelectors) {
    const recordName = `${selector}._domainkey.${domain}`;
    
    // First try direct TXT lookup
    try {
      const records = await resolveTxtWithTimeout(recordName);
      if (records.some(r => r.join('').includes('v=DKIM1'))) {
        return true;
      }
    } catch (error) {
      // Ignore error, we will try CNAME next
    }
    
    // If TXT failed or didn't contain DKIM, explicitly check CNAME
    // Some OS resolvers (like on certain VPS setups) do not automatically follow CNAMEs for TXT queries
    try {
      const cnames = await resolveCnameWithTimeout(recordName);
      if (cnames && cnames.length > 0) {
        const cnameRecords = await resolveTxtWithTimeout(cnames[0]);
        if (cnameRecords.some(r => r.join('').includes('v=DKIM1'))) {
          return true;
        }
      }
    } catch (cnameError) {
      // Continue checking next selector
      continue;
    }
  }
  return false;
}
