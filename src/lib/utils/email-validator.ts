import dns from 'dns';

// Reliable DNS resolver with fallback public DNS (Google & Cloudflare)
const resolver = new dns.promises.Resolver();
resolver.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4', '1.0.0.1']);

/**
 * Known disposable / temporary email domains and providers blocklist
 */
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', '10minutemail.com', 'tempmail.com', 'guerrillamail.com',
  'yopmail.com', 'throwawaymail.com', 'trashmail.com', 'sharklasers.com',
  'dispostable.com', 'fakemailgenerator.com', 'generator.email', 'temp-mail.org',
  'getairmail.com', 'mohmal.com', 'inboxkitten.com', 'crazymailing.com',
  'mytemp.email', 'nada.ltd', 'dropmail.me', 'tempail.com', 'burnermail.io',
  'emailondeck.com', 'internxt.com', 'chacuo.net', 'uberip.com', 'mail.tm',
  'b.com', 'test.com', 'example.com', 'example.org', 'example.net', 'fake.com',
  'trashmail.net', 'trashmail.me', 'disposablemail.com', 'tmpmail.net',
  'tmpmail.org', 'disposable.com', 'guerrillamailblock.com', 'pokemail.net',
  'spam4.me', 'bccto.me', 'chacuo.net', '027168.com', 'yomail.info'
]);

/**
 * Known disposable MX host keywords
 */
const DISPOSABLE_MX_KEYWORDS = [
  'mail.tm',
  'in.mail.tm',
  'tempmail',
  'temp-mail',
  'guerrillamail',
  'trashmail',
  'yopmail',
  'mailinator',
  'dispostable',
  'sharklasers',
  'dropmail',
  'spam4',
  '10minutemail'
];

/**
 * Validates names against fake/spam single characters or bots
 */
export function verifyNameSafely(name: string): { isValid: boolean; reason?: string } {
  if (!name || typeof name !== 'string') {
    return { isValid: false, reason: 'İsim alanı boş bırakılamaz.' };
  }

  const cleanName = name.trim();
  if (cleanName.length < 2) {
    return { isValid: false, reason: 'Lütfen geçerli bir isim ve soyisim giriniz (en az 2 karakter).' };
  }

  // Prevent single letters repeated or nonsense like "n n", "a a", "..."
  if (/^[a-zA-Z0-9]$/.test(cleanName) || /^(.)\1{3,}$/.test(cleanName)) {
    return { isValid: false, reason: 'Lütfen gerçek bir ad ve soyad giriniz.' };
  }

  return { isValid: true };
}

/**
 * Multi-layer validation for emails:
 * 1. Syntax check
 * 2. Disposable domain list check
 * 3. DNS MX record validation (resolves actual mail server)
 * 4. Disposable MX exchange keyword check (catches newly created domains pointing to temp mail infra)
 */
export async function verifyEmailSafely(email: string): Promise<{ isValid: boolean; reason?: string }> {
  if (!email || typeof email !== 'string') {
    return { isValid: false, reason: 'E-posta adresi boş olamaz.' };
  }

  const cleanEmail = email.trim().toLowerCase();

  // 1. Regex Syntax Check
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { isValid: false, reason: 'Geçersiz e-posta formatı.' };
  }

  const parts = cleanEmail.split('@');
  if (parts.length !== 2) {
    return { isValid: false, reason: 'Geçersiz e-posta formatı.' };
  }

  const [localPart, domain] = parts;

  // Local part & domain length checks
  if (localPart.length < 1 || localPart.length > 64) {
    return { isValid: false, reason: 'E-posta kullanıcı adı uzunluğu geçersiz.' };
  }

  if (!domain || domain.length < 4 || !domain.includes('.')) {
    return { isValid: false, reason: 'Geçersiz e-posta alan adı (domain).' };
  }

  // 2. Disposable / Temporary Email Domain Check
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { isValid: false, reason: 'Geçici ve sahte (disposable) e-posta adreslerine izin verilmez.' };
  }

  // Check wildcard/subdomain temp mail patterns (e.g., *.mail.tm, *.uberip.com)
  for (const blocked of DISPOSABLE_DOMAINS) {
    if (domain.endsWith(`.${blocked}`)) {
      return { isValid: false, reason: 'Geçici ve sahte e-posta servislerine izin verilmez.' };
    }
  }

  // 3. DNS MX Record Check (with fallback to A record if domain has fallback mail handling)
  try {
    const mxRecords = await resolver.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return { isValid: false, reason: 'Alan adına ait aktif bir e-posta sunucusu (MX kaydı) bulunamadı.' };
    }

    // 4. Check if MX exchange points to known disposable infrastructure
    for (const record of mxRecords) {
      const exchangeLower = (record.exchange || '').toLowerCase();
      for (const keyword of DISPOSABLE_MX_KEYWORDS) {
        if (exchangeLower.includes(keyword)) {
          return { isValid: false, reason: 'Geçici ve tek kullanımlık e-posta sağlayıcıları sistemimiz tarafından engellenmiştir.' };
        }
      }
    }

    return { isValid: true };
  } catch (error: any) {
    if (error.code === 'ENOTFOUND' || error.code === 'ENODATA' || error.code === 'ESERVFAIL') {
      return { isValid: false, reason: 'E-posta alan adı mevcut değil veya aktif mail sunucusu bulunmuyor.' };
    }
    
    // In case of transient DNS query timeout, allow to not block genuine users
    console.warn(`[EmailValidator] DNS timeout/warning for ${domain}:`, error.message);
    return { isValid: true };
  }
}
