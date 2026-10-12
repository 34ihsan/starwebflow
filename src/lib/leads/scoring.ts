/**
 * Deterministic, explainable lead scoring (0-100) + tier.
 * Replaces random scoring. Combines: fit (digital gaps), intent, reachability and AI win-probability.
 */

export interface LeadScoreInput {
  hasWebsite?: boolean | null;
  website?: string | null;
  googleRating?: number | null;
  reviewCount?: number | null;
  isClaimed?: boolean | null;
  technologies?: string[];
  intentSignals?: string[];
  digitalGaps?: string[];
  painPoints?: string[];
  decisionMakerName?: string | null;
  email?: string | null;
  emailConfidence?: number | null; // 0-100
  phone?: string | null;
  aiWinProbability?: number | null; // 0-1
}

export interface LeadScoreResult {
  score: number;
  tier: 'HOT' | 'WARM' | 'COLD';
  reasons: string[];
}

const OUTDATED_TECH = ['Wix', 'Elementor'];
const MODERN_TECH = ['React/Next.js', 'Shopify'];

export function scoreLead(i: LeadScoreInput): LeadScoreResult {
  const reasons: string[] = [];
  let fit = 0; // max 40
  let intent = 0; // max 20
  let reach = 0; // max 25
  let ai = 0; // max 15

  // FIT: dijital boşluk = bizim için fırsat
  if (i.hasWebsite === false || !i.website) { fit += 16; reasons.push('Web sitesi yok'); }
  const tech = i.technologies || [];
  if (tech.some((t) => OUTDATED_TECH.includes(t))) { fit += 8; reasons.push('Eski/şablon tabanlı site'); }
  if (tech.length > 0 && !tech.includes('Google Analytics')) { fit += 4; reasons.push('Analitik kurulu değil'); }
  if (tech.length > 0 && !tech.includes('Facebook Pixel')) { fit += 2; }
  if (tech.some((t) => MODERN_TECH.includes(t))) fit -= 3;
  if (i.isClaimed === false) { fit += 5; reasons.push('Google profili sahiplenilmemiş'); }
  if (i.googleRating != null && i.googleRating < 4.0 && (i.reviewCount || 0) >= 10) { fit += 6; reasons.push('Düşük puan: itibar yönetimi fırsatı'); }
  if ((i.reviewCount || 0) >= 50) { fit += 3; reasons.push('Aktif iş hacmi (yorum sayısı yüksek)'); }
  fit += Math.min(8, (i.digitalGaps?.length || 0) * 2);
  fit += Math.min(4, (i.painPoints?.length || 0));
  fit = Math.max(0, Math.min(40, fit));

  // INTENT
  const sig = i.intentSignals || [];
  if (sig.includes('Hiring/Expanding')) { intent += 10; reasons.push('Büyüyor / işe alım yapıyor'); }
  if (sig.includes('Website Under Construction')) { intent += 10; reasons.push('Site yapım aşamasında'); }
  if (sig.includes('High-touch Sales Motion')) { intent += 5; }
  intent = Math.min(20, intent);

  // REACHABILITY: ulaşılamayan lead değersizdir
  if (i.email) reach += Math.round(((i.emailConfidence ?? 50) / 100) * 15);
  if (i.decisionMakerName) { reach += 6; reasons.push('Karar verici belirlendi'); }
  if (i.phone) reach += 4;
  reach = Math.min(25, reach);

  if (i.aiWinProbability != null) ai = Math.round(Math.max(0, Math.min(1, i.aiWinProbability)) * 15);

  const score = Math.max(0, Math.min(100, fit + intent + reach + ai));
  // Ulaşılamayan lead asla HOT olmaz
  const reachable = !!i.email && (i.emailConfidence ?? 50) >= 40;
  const tier: LeadScoreResult['tier'] = score >= 65 && reachable ? 'HOT' : score >= 40 ? 'WARM' : 'COLD';
  return { score, tier, reasons: reasons.slice(0, 6) };
}
