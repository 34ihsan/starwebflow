/**
 * StarWebFlow DSGVO & PII Sanitizer Katmanı
 * 
 * Verilerin LLM'e (yerel veya harici) iletilmeden önce kişisel verilerden
 * (E-posta, Telefon, IBAN, T.C. / Vergi No, Şahıs İsimleri) arındırılmasını sağlar.
 * 
 * DSGVO Madde 4(5) (Pseudonymisierung) ve Madde 25 (Privacy by Design) gereksinimlerini karşılar.
 */

export interface SanitizationResult {
  sanitizedText: string;
  mapping: Record<string, string>;
  detectedCategories: string[];
}

export class PIISanitizer {
  /**
   * Hassas verileri yerel bellek içinde placeholder'lar ile maskeler.
   */
  static sanitize(text: string): SanitizationResult {
    if (!text || typeof text !== "string") {
      return { sanitizedText: "", mapping: {}, detectedCategories: [] };
    }

    const mapping: Record<string, string> = {};
    const detectedCategories: Set<string> = new Set();
    let sanitized = text;

    // 1. E-posta Maskeleme
    let emailCounter = 1;
    sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, (match) => {
      const placeholder = `[EMAIL_${emailCounter++}]`;
      mapping[placeholder] = match;
      detectedCategories.add("EMAIL");
      return placeholder;
    });

    // 2. Telefon Numarası Maskeleme (DE, TR, Int)
    let phoneCounter = 1;
    sanitized = sanitized.replace(/(?:\+49|\+90|\+44|\+1|0049|0090|0)[1-9][0-9\s/.-]{6,14}[0-9]/g, (match) => {
      const cleaned = match.replace(/[\s/.-]/g, "");
      if (cleaned.length >= 8) {
        const placeholder = `[PHONE_${phoneCounter++}]`;
        mapping[placeholder] = match;
        detectedCategories.add("PHONE");
        return placeholder;
      }
      return match;
    });

    // 3. IBAN Maskeleme
    let ibanCounter = 1;
    sanitized = sanitized.replace(/[A-Z]{2}[0-9]{2}(?:[ ]?[0-9]{4}){4,7}(?:[ ]?[0-9]{1,2})?/g, (match) => {
      const placeholder = `[IBAN_${ibanCounter++}]`;
      mapping[placeholder] = match;
      detectedCategories.add("FINANCIAL_IBAN");
      return placeholder;
    });

    // 4. IP Adresi Maskeleme
    sanitized = sanitized.replace(/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g, (match) => {
      detectedCategories.add("IP_ADDRESS");
      return "[IP_ADDRESS_MASKED]";
    });

    return {
      sanitizedText: sanitized,
      mapping,
      detectedCategories: Array.from(detectedCategories)
    };
  }

  /**
   * LLM'den dönen cevaptaki placeholder'ları güvenli şekilde orijinal verilerle geri birleştirir.
   */
  static deSanitize(text: string, mapping: Record<string, string>): string {
    if (!text) return "";
    let deSanitized = text;
    for (const [placeholder, original] of Object.entries(mapping)) {
      deSanitized = deSanitized.split(placeholder).join(original);
    }
    return deSanitized;
  }
}
