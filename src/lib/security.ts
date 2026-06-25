/**
 * StarWebFlow Güvenlik Katmanı Yardımcı Fonksiyonları
 * XSS, SQL Enjeksiyonu ve Malicious Payload korumaları için veri sanitizasyonu sağlar.
 */

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
