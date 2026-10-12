/**
 * StarWebFlow Güvenlik Katmanı Yardımcı Fonksiyonları
 * XSS, SQL Enjeksiyonu, Zararlı Botlar ve Malicious Payload korumaları için veri sanitizasyonu ve WAF kontrolleri sağlar.
 */

// Meşru arama motorları ve AI tarayıcıları (Whitelisted - ASLA engellenmez)
const LEGITIMATE_BOT_PATTERNS = [
  /googlebot/i,
  /bingbot/i,
  /slurp/i,
  /duckduckbot/i,
  /baiduspider/i,
  /yandexbot/i,
  /applebot/i,
  /facebookexternalhit/i,
  /twitterbot/i,
  /linkedinbot/i,
  /discordbot/i,
  /telegrambot/i,
  /whatsapp/i,
  /gptbot/i,
  /chatgpt-user/i,
  /claudebot/i,
  /anthropic-ai/i,
  /perplexitybot/i,
  /amazonbot/i,
  /cohere-ai/i,
];

// Zararlı güvenlik açığı tarayıcıları, exploit araçları ve agresif saldırı botları (Blacklist)
const MALICIOUS_BOT_PATTERNS = [
  /sqlmap/i,
  /nikto/i,
  /wpscan/i,
  /dirbuster/i,
  /gobuster/i,
  /ffuf/i,
  /masscan/i,
  /nmap/i,
  /acunetix/i,
  /havij/i,
  /zaproxy/i,
  /hydra/i,
  /metasploit/i,
  /netsparker/i,
  /burpcollaborator/i,
  /shodan/i,
  /censys/i,
  /blexbot/i,
  /mj12bot/i,
  /dotbot/i,
  /petalbot/i,
  /bytespider/i,
  /zoominfobot/i,
  /libwww-perl/i,
  /morfeus/i,
  /fuzz/i,
];

// Sistem açıklarını arayan saldırı / probe yolları
const MALICIOUS_PATH_PATTERNS = [
  // Path traversal
  /(?:\.\.[\/\\]|%2e%2e|%252e%252e|%5c%2e)/i,
  // Ortam değişkenleri ve gizli anahtarlar
  /^\/(?:\.env|\.git|\.svn|\.aws|\.ssh|\.vscode|\.docker|web\.config|docker-compose)(?:\/|$)/i,
  // CMS açık taramaları
  /^\/(?:wp-admin|wp-login\.php|xmlrpc\.php|wp-content|wp-includes)(?:\/|$)/i,
  // Veritabanı ve panel taramaları
  /^\/(?:phpmyadmin|pma|adminer|myadmin|mysql|eval-stdin\.php|actuator|swagger-ui\.html|solr|autodiscover)(?:\/|$)/i,
  // Veritabanı dökümleri ve yedekler
  /\.(?:sql|bak|backup|dump|tar|gz|7z)$/i,
  // Tehlikeli gizli dosyalar
  /^\/(?:\.DS_Store|Thumbs\.db|id_rsa|id_dsa)(?:\/|$)/i,
];

// URL sorgularında SQLi, RCE ve XSS arama kalıpları
const INJECTION_PAYLOAD_PATTERNS = [
  // SQL Injection
  /(?:\bunion\b[\s\/\*\+]+select\b|\bselect\b[\s\/\*\+]+.*information_schema|\bsleep\s*\(\s*\d+\s*\)|\bbenchmark\s*\(\s*\d+|\bwaitfor\s+delay\b)/i,
  // RCE ve OS Command Injection
  /(?:\b(?:eval|exec|passthru|shell_exec|system)\s*\(|base64_decode\s*\(|\/bin\/(?:sh|bash)|cmd\.exe|powershell(?:\.exe)?)/i,
  // XSS Scripting
  /(?:<script\b|javascript\s*:|vbscript\s*:|onload\s*=|onerror\s*=|document\.cookie)/i,
];

/**
 * Gelen User-Agent başlığının zararlı bir tarayıcı veya saldırı aracı olup olmadığını doğrular.
 */
export function isMaliciousBot(userAgent: string | null): boolean {
  if (!userAgent || userAgent.trim().length === 0) return false;
  
  // Meşru arama motorları ve AI tarayıcılarına her zaman izin ver
  if (LEGITIMATE_BOT_PATTERNS.some(pattern => pattern.test(userAgent))) {
    return false;
  }

  // Bilinen saldırı araçları ve açıkları arayan botları tespit et
  return MALICIOUS_BOT_PATTERNS.some(pattern => pattern.test(userAgent));
}

/**
 * Gelen istek yolunun (.env, .git, wp-login, phpmyadmin, path traversal vb.) zararlı bir sistem taraması olup olmadığını kontrol eder.
 */
export function isMaliciousPath(pathname: string): boolean {
  if (!pathname) return false;
  
  // Let's Encrypt SSL doğrulamasını muaf tut
  if (pathname.startsWith('/.well-known/acme-challenge/')) {
    return false;
  }

  return MALICIOUS_PATH_PATTERNS.some(pattern => pattern.test(pathname));
}

/**
 * URL sorgu dizesinde (query string) SQL Injection, RCE veya XSS saldırı kodları olup olmadığını kontrol eder.
 */
export function hasInjectionPayload(queryOrString: string): boolean {
  if (!queryOrString) return false;
  try {
    const raw = queryOrString;
    const normalized = decodeURIComponent(queryOrString.replace(/\+/g, ' '));
    return INJECTION_PAYLOAD_PATTERNS.some(pattern => pattern.test(normalized) || pattern.test(raw));
  } catch {
    const fallback = queryOrString.replace(/\+/g, ' ');
    return INJECTION_PAYLOAD_PATTERNS.some(pattern => pattern.test(fallback) || pattern.test(queryOrString));
  }
}

/**
 * Gelen dize verilerini tüm HTML, script ve zararlı etiketlerden temizler.
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    // Script etiketlerini ve içeriklerini temizle
    .replace(/<script[^>]*>([\S\s]*?)<\/script>/gi, '')
    // Inline event handler'ları temizle (onclick, onerror, onload vb.)
    .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/on\w+\s*=\s*'[^']*'/gi, '')
    // HTML etiketlerini tamamen temizle
    .replace(/<\/?[^>]+(>|$)/g, '')
    // SQL Injection için tırnak kaçırma ve özel karakter kontrolleri
    .replace(/['";\-]/g, (match) => {
      switch (match) {
        case "'": return "''"; // SQL Safe Quote
        case '"': return '&quot;';
        case ';': return ''; // Komut birleştirmeyi engelle
        case '-': return ''; // SQL yorum satırını engelle
        default: return match;
      }
    })
    .trim();
}

/**
 * E-posta adreslerini temizler ve güvenli hale getirir.
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  // Sadece geçerli e-posta karakterlerine izin ver
  return email.toLowerCase().replace(/[^a-z0-9@._\-+]/g, '').trim();
}

/**
 * Telefon numaralarını temizler ve güvenli hale getirir.
 */
export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') return '';
  // Sadece rakam, artı ve boşluk karakterlerine izin ver
  return phone.replace(/[^0-9+\s\-()]/g, '').trim();
}

/**
 * JSON veya nesne yapılarını rekürsif olarak temizler.
 */
export function sanitizeObject<T>(obj: T): T {
  if (!obj) return obj;
  
  if (typeof obj === 'string') {
    return sanitizeString(obj) as unknown as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as unknown as T;
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeObject((obj as any)[key]);
      }
    }
    return sanitized as T;
  }
  
  return obj;
}
