import dns from 'dns';
import { verifyEmailLive } from '@/lib/automation/utils/email-verifier';

/**
 * Email Intelligence Engine
 * 1. Şirket sitesini (ana sayfa + iletişim/impressum/kontakt sayfaları) tarar, gerçek e-postaları çıkarır
 * 2. Karar vericinin adından kalıp tahmini (first.last@) üretir
 * 3. MX + catch-all tespiti + SMTP ping ile güven skoru (0-100) verir
 * 4. Tek kullanımlık, junk ve rol-bazlı adresleri sınıflandırır
 */

export type EmailKind = 'PERSONAL' | 'ROLE' | 'GENERIC' | 'JUNK';

export interface EmailCandidate {
  email: string;
  source: 'SCRAPED' | 'MAILTO' | 'PATTERN' | 'GENERIC_GUESS';
  kind: EmailKind;
  /** 0-100: gönderim için güven skoru */
  confidence: number;
  mxValid: boolean;
  catchAll: boolean;
  smtpVerified: boolean;
}

export interface EmailDiscoveryResult {
  best: EmailCandidate | null;
  candidates: EmailCandidate[];
  domain: string | null;
  pagesCrawled: number;
  discoveredPhones?: string[];
}

const CONTACT_PATHS = [
  '', 
  '/impressum', '/impressum.html', '/impressum.htm', '/impressum.php',
  '/kontakt', '/kontakt.html', '/kontakt.htm', '/kontakt.php',
  '/contact', '/contact-us', '/contact.html',
  '/ueber-uns', '/about', '/team', '/anfahrt'
];

const JUNK_DOMAINS = new Set([
  'example.com', 'domain.com', 'email.com', 'sentry.io', 'wixpress.com', 'sentry-next.wixpress.com',
  'yourdomain.com', 'mysite.com', 'test.com',
]);
const JUNK_LOCALPARTS = /^(noreply|no-reply|donotreply|do-not-reply|mailer-daemon|postmaster|abuse|webmaster|root|privacy|dpo|datenschutz|unsubscribe|bounce|spam|stadtverwaltung|buergermeister)$/i;
const ASSET_EXT = /\.(png|jpe?g|gif|svg|webp|css|js|woff2?|ico|pdf)$/i;
const ROLE_LOCALPARTS = /^(info|contact|hello|hallo|office|sales|support|service|mail|kontakt|iletisim|bilgi|team|hi|admin|booking|reservierung|praxis|buero|büro|termin|termine|empfang)$/i;
const FREE_PROVIDERS = new Set(['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'gmx.de', 'gmx.net', 'web.de', 't-online.de', 'icloud.com', 'yandex.com']);

const mxCache = new Map<string, boolean>();
const catchAllCache = new Map<string, boolean>();

function resolveMxExists(domain: string, timeoutMs = 2500): Promise<boolean> {
  if (mxCache.has(domain)) return Promise.resolve(mxCache.get(domain)!);
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      mxCache.set(domain, true);
      resolve(true);
    }, timeoutMs);

    dns.resolveMx(domain, (err, records) => {
      clearTimeout(timer);
      if (err) {
        // Ağ kısıtlaması veya port 53 engeli durumunda (ECONNREFUSED/SERVFAIL vb.) taramayı engelleme
        if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEOUT' || err.code === 'EREFUSED') {
          mxCache.set(domain, true);
          return resolve(true);
        }
        mxCache.set(domain, false);
        return resolve(false);
      }
      const ok = Array.isArray(records) && records.length > 0;
      mxCache.set(domain, ok);
      resolve(ok);
    });
  });
}

export function classifyEmail(email: string): EmailKind {
  const [local, domain] = email.toLowerCase().split('@');
  if (!local || !domain) return 'JUNK';
  if (JUNK_DOMAINS.has(domain) || JUNK_LOCALPARTS.test(local) || ASSET_EXT.test(email) || /^[0-9a-f]{16,}$/.test(local)) return 'JUNK';
  if (ROLE_LOCALPARTS.test(local)) return 'GENERIC';
  if (/^(ceo|cto|coo|founder|owner|inhaber|geschaeftsfuehrer|gf|director|manager|marketing|hr|jobs|career|karriere|press|presse)$/i.test(local)) return 'ROLE';
  return 'PERSONAL';
}

/** Mail adresini, gizlenmiş formlar (info [at] x.com, info(at)x.com) dahil metinden çıkarır */
export function extractEmailsFromHtml(html: string): { email: string; viaMailto: boolean }[] {
  const found = new Map<string, boolean>();
  const decoded = html
    .replace(/&#64;|&commat;|%40/gi, '@')
    .replace(/\s*[\[\(\{]\s*(at|ät)\s*[\]\)\}]\s*/gi, '@')
    .replace(/\s*[\[\(\{]\s*(dot|punkt|nokta)\s*[\]\)\}]\s*/gi, '.');

  const mailtoRe = /mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;
  let m: RegExpExecArray | null;
  while ((m = mailtoRe.exec(decoded))) found.set(m[1].toLowerCase(), true);

  const re = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}/g;
  while ((m = re.exec(decoded))) {
    const e = m[0].toLowerCase();
    if (!found.has(e)) found.set(e, false);
  }
  return Array.from(found.entries()).map(([email, viaMailto]) => ({ email, viaMailto }));
}

/** Web sitesi HTML'inden gerçek telefon numaralarını (tel: linkleri ve Impressum/Kontakt formatları) çıkarır */
export function extractPhonesFromHtml(html: string): string[] {
  const found = new Set<string>();
  
  // 1. href="tel:..." linkleri (En kesin ve güvenilir)
  const telRe = /href=["']tel:([^"'\s>]+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = telRe.exec(html))) {
    let clean = m[1].replace(/[^0-9+]/g, ' ').replace(/\s+/g, ' ').trim();
    if (clean.length >= 6 && clean.length <= 25) found.add(clean);
  }

  // 2. Metin içindeki Telefon / Tel / Fon / Phone kalıpları (Almanca ve Uluslararası)
  const textRe = /(?:Tel(?:\.|efon)?|Phone|Fon|Mobil|Mobile)[:\.\s]+([+]?[0-9\(\)\/\s\-]{6,25})/gi;
  while ((m = textRe.exec(html))) {
    let clean = m[1].replace(/[\r\n\t<]/g, '').trim();
    clean = clean.replace(/\s+/g, ' ');
    const digitsOnly = clean.replace(/[^0-9]/g, '');
    if (digitsOnly.length >= 7 && digitsOnly.length <= 16) {
      found.add(clean);
    }
  }

  return Array.from(found);
}

async function fetchText(url: string, timeoutMs = 4500): Promise<string | null> {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', 
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'de-DE,de;q=0.9,tr-TR,tr;q=0.8,en-US,en;q=0.7'
      },
      redirect: 'follow',
    });
    clearTimeout(t);
    if (!res.ok) return null;
    const type = res.headers.get('content-type') || '';
    if (!type.includes('text/html') && !type.includes('text/plain')) return null;
    const text = await res.text();
    return text.slice(0, 600_000);
  } catch {
    return null;
  }
}

export function normalizeDomain(website?: string | null): string | null {
  if (!website) return null;
  if (/linkedin\.com|apollo\.io|crunchbase\.com|instagram\.com|facebook\.com|google\.[a-z]+\/maps/i.test(website)) return null;
  try {
    const host = new URL(website.startsWith('http') ? website : `https://${website}`).hostname;
    return host.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
}

/** Rastgele var olmayan adrese RCPT TO atarak catch-all domain tespiti. Sonuç domain başına önbelleğe alınır. */
export async function isCatchAllDomain(domain: string): Promise<boolean> {
  if (catchAllCache.has(domain)) return catchAllCache.get(domain)!;
  const probe = `zz${Math.random().toString(36).slice(2, 10)}qx@${domain}`;
  const accepts = await verifyEmailLive(probe).catch(() => false);
  catchAllCache.set(domain, accepts);
  return accepts;
}

function foldAscii(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ş/g, 's')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z\s-]/g, '')
    .trim();
}

/** Karar verici adından olası e-posta kalıpları (en yaygın olandan başlayarak) */
export function generatePersonPatterns(fullName: string, domain: string): string[] {
  const parts = foldAscii(fullName).split(/\s+/).filter(Boolean);
  if (parts.length < 2) return [];
  const first = parts[0];
  const last = parts[parts.length - 1];
  return [
    `${first}.${last}`, `${first}`, `${first[0]}${last}`, `${first}${last}`, `${first}_${last}`, `${last}`, `${first}${last[0]}`,
  ].map((l) => `${l}@${domain}`);
}

function score(c: { kind: EmailKind; source: EmailCandidate['source']; mxValid: boolean; catchAll: boolean; smtpVerified: boolean }, domainMatches: boolean): number {
  if (c.kind === 'JUNK' || !c.mxValid) return 0;
  let s = c.source === 'MAILTO' ? 70 : c.source === 'SCRAPED' ? 62 : c.source === 'PATTERN' ? 35 : 25;
  if (c.kind === 'PERSONAL') s += 12;
  if (c.kind === 'ROLE') s += 6;
  if (c.kind === 'GENERIC') s -= 4;
  if (domainMatches) s += 8;
  if (c.smtpVerified && !c.catchAll) s += 20; // gerçekten doğrulanmış
  else if (c.smtpVerified && c.catchAll) s -= 8; // catch-all her şeyi kabul eder -> kanıt değil
  return Math.max(0, Math.min(100, s));
}

async function buildCandidate(
  email: string,
  source: EmailCandidate['source'],
  domain: string,
  opts: { smtp: boolean }
): Promise<EmailCandidate> {
  const edomain = email.split('@')[1];
  const kind = classifyEmail(email);
  const mxValid = kind === 'JUNK' ? false : await resolveMxExists(edomain);
  const catchAll = mxValid && opts.smtp ? await isCatchAllDomain(edomain) : false;
  const smtpVerified = mxValid && opts.smtp && source !== 'SCRAPED' && source !== 'MAILTO'
    ? await verifyEmailLive(email).catch(() => false)
    : false;
  return {
    email,
    source,
    kind,
    mxValid,
    catchAll,
    smtpVerified,
    confidence: score({ kind, source, mxValid, catchAll, smtpVerified }, edomain === domain || FREE_PROVIDERS.has(edomain)),
  };
}

/**
 * Ana giriş noktası: bir şirket için en güvenilir e-postayı bulur.
 * `smtp=false` ise port 25 ping'i atlar (dinamik IP / bloklu ağlarda yanlış negatifleri önler).
 */
export async function discoverEmail(params: {
  website?: string | null;
  companyName?: string | null;
  personName?: string | null;
  smtp?: boolean;
}): Promise<EmailDiscoveryResult> {
  const { website, personName } = params;
  const smtp = params.smtp ?? true;
  const domain = normalizeDomain(website);
  const result: EmailDiscoveryResult = { best: null, candidates: [], domain, pagesCrawled: 0 };
  if (!domain) return result;
  if (!(await resolveMxExists(domain))) return result;

  const base = `https://${domain}`;
  const pages = await Promise.all(CONTACT_PATHS.map((p) => fetchText(base + p)));
  const raw = new Map<string, boolean>();
  const discoveredPhones: string[] = [];
  pages.forEach((html) => {
    if (!html) return;
    result.pagesCrawled++;
    extractEmailsFromHtml(html).forEach(({ email, viaMailto }) => {
      if (!raw.has(email) || viaMailto) raw.set(email, viaMailto);
    });
    extractPhonesFromHtml(html).forEach((phone) => {
      if (!discoveredPhones.includes(phone)) discoveredPhones.push(phone);
    });
  });
  result.discoveredPhones = discoveredPhones;

  const candidates: EmailCandidate[] = [];
  for (const [email, viaMailto] of Array.from(raw.entries())) {
    const edomain = email.split('@')[1];
    // Sadece şirket domaini veya bilinen ücretsiz sağlayıcı (küçük işletmeler için yaygın)
    if (edomain !== domain && !FREE_PROVIDERS.has(edomain) && !edomain.endsWith('.' + domain)) continue;
    candidates.push(await buildCandidate(email, viaMailto ? 'MAILTO' : 'SCRAPED', domain, { smtp: false }));
  }

  // Scrape sonucu iyi değilse kalıp tahmini yap
  const hasStrong = candidates.some((c) => c.confidence >= 60 && c.kind !== 'GENERIC');
  if (!hasStrong && smtp) {
    const catchAll = await isCatchAllDomain(domain);
    if (!catchAll) {
      const patterns = personName ? generatePersonPatterns(personName, domain).slice(0, 4) : [];
      for (const email of patterns) {
        const c = await buildCandidate(email, 'PATTERN', domain, { smtp: true });
        candidates.push(c);
        if (c.smtpVerified) break;
      }
      if (!candidates.some((c) => c.confidence >= 50)) {
        for (const prefix of ['info', 'kontakt', 'contact', 'hello', 'office']) {
          const c = await buildCandidate(`${prefix}@${domain}`, 'GENERIC_GUESS', domain, { smtp: true });
          candidates.push(c);
          if (c.smtpVerified) break;
        }
      }
    }
  }

  candidates.sort((a, b) => b.confidence - a.confidence);
  result.candidates = candidates;
  result.best = candidates.find((c) => c.confidence >= 40) || null;
  return result;
}
