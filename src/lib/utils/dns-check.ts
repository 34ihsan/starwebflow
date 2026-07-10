import dns from 'dns/promises';

export async function checkSPF(domain: string): Promise<boolean> {
  try {
    const records = await dns.resolveTxt(domain);
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
    const records = await dns.resolveTxt(`_dmarc.${domain}`);
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
  // Most common DKIM selectors
  const commonSelectors = ['google', 'default', 'mail', 'selector1', 's1', 'k1', 'smtp'];
  
  for (const selector of commonSelectors) {
    try {
      const records = await dns.resolveTxt(`${selector}._domainkey.${domain}`);
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
