import { NextRequest, NextResponse } from 'next/server';
import dns from 'dns/promises';

// Top DNSBL blacklists
const BLACKLISTS = [
  { name: 'Spamhaus ZEN', host: 'zen.spamhaus.org' },
  { name: 'Spamhaus DBL', host: 'dbl.spamhaus.org', isDomainBased: true },
  { name: 'Barracuda BRBL', host: 'b.barracudacentral.org' },
  { name: 'SORBS SPAM', host: 'spam.sorbs.net' },
  { name: 'SpamCop', host: 'bl.spamcop.net' },
  { name: 'URIBL', host: 'multi.uribl.com', isDomainBased: true },
];

async function checkDNSBL(query: string, blacklistHost: string): Promise<boolean> {
  try {
    await dns.resolve4(`${query}.${blacklistHost}`);
    return true; // Listed!
  } catch {
    return false; // Not listed (NXDOMAIN = clean)
  }
}

function reverseIP(ip: string): string {
  return ip.split('.').reverse().join('.');
}

export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get('domain');
  const ip = req.nextUrl.searchParams.get('ip');

  if (!domain && !ip) {
    return NextResponse.json({ error: 'domain veya ip parametresi gerekli' }, { status: 400 });
  }

  const results: { name: string; listed: boolean; query: string }[] = [];

  try {
    // Resolve domain to IP if only domain given
    let resolvedIp = ip;
    if (domain && !ip) {
      try {
        const addresses = await dns.resolve4(domain);
        resolvedIp = addresses[0];
      } catch {
        resolvedIp = null as any;
      }
    }

    // Check each DNSBL in parallel (with timeout)
    const checks = await Promise.allSettled(
      BLACKLISTS.map(async (bl) => {
        let query: string;

        if (bl.isDomainBased && domain) {
          query = domain;
        } else if (resolvedIp) {
          query = reverseIP(resolvedIp);
        } else {
          return { name: bl.name, listed: false, query: 'N/A' };
        }

        const listed = await Promise.race([
          checkDNSBL(query, bl.host),
          new Promise<boolean>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
        ]).catch(() => false);

        return { name: bl.name, listed: listed as boolean, query };
      })
    );

    checks.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        results.push({ name: BLACKLISTS[i].name, listed: false, query: 'timeout' });
      }
    });

    // Also check SPF/DKIM/DMARC DNS records if domain provided
    let dnsRecords = null;
    if (domain) {
      dnsRecords = await checkDNSRecords(domain);
    }

    const listedCount = results.filter(r => r.listed).length;
    const isClean = listedCount === 0;

    return NextResponse.json({
      success: true,
      domain,
      ip: resolvedIp,
      isClean,
      listedCount,
      totalChecked: results.length,
      blacklists: results,
      dnsRecords,
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function checkDNSRecords(domain: string) {
  const result = {
    spf: { exists: false, record: '' },
    dmarc: { exists: false, record: '' },
    mx: { exists: false, records: [] as string[] },
  };

  // Check SPF
  try {
    const txtRecords = await dns.resolveTxt(domain);
    const spfRecord = txtRecords.flat().find(r => r.startsWith('v=spf1'));
    if (spfRecord) {
      result.spf.exists = true;
      result.spf.record = spfRecord;
    }
  } catch { /* No SPF */ }

  // Check DMARC
  try {
    const dmarcRecords = await dns.resolveTxt(`_dmarc.${domain}`);
    const dmarcRecord = dmarcRecords.flat().find(r => r.startsWith('v=DMARC1'));
    if (dmarcRecord) {
      result.dmarc.exists = true;
      result.dmarc.record = dmarcRecord;
    }
  } catch { /* No DMARC */ }

  // Check MX
  try {
    const mxRecords = await dns.resolveMx(domain);
    result.mx.exists = mxRecords.length > 0;
    result.mx.records = mxRecords.map(mx => `${mx.exchange} (priority: ${mx.priority})`);
  } catch { /* No MX */ }

  return result;
}
