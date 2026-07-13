/**
 * Deliverability Score Calculator
 * Formula: SPF*20 + DKIM*20 + DMARC*20 + reputation_bonus - bounce_penalty - spam_penalty
 * Returns a score from 0-100
 */

export interface DeliverabilityInput {
  spfStatus: boolean;
  dkimStatus: boolean;
  dmarcStatus: boolean;
  reputation: number;       // 0-100
  bounceCount: number;
  spamCount: number;
  sentToday: number;
  warmupDay: number;
}

export interface DeliverabilityResult {
  score: number;            // 0-100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  color: 'emerald' | 'green' | 'yellow' | 'orange' | 'red';
  breakdown: {
    spf: number;
    dkim: number;
    dmarc: number;
    reputation: number;
    bouncePenalty: number;
    spamPenalty: number;
  };
  recommendations: string[];
}

export function calculateDeliverabilityScore(input: DeliverabilityInput): DeliverabilityResult {
  const cappedReputation = Math.min(100, Math.max(0, input.reputation));
  
  const spf = input.spfStatus ? 20 : 0;
  const dkim = input.dkimStatus ? 20 : 0;
  const dmarc = input.dmarcStatus ? 20 : 0;
  const reputationBonus = Math.round((cappedReputation / 100) * 25);
  const bouncePenalty = Math.min(input.bounceCount * 5, 30);
  const spamPenalty = Math.min(input.spamCount * 8, 40);

  const raw = spf + dkim + dmarc + reputationBonus - bouncePenalty - spamPenalty;
  const score = Math.max(0, Math.min(100, raw));

  let grade: DeliverabilityResult['grade'];
  let color: DeliverabilityResult['color'];

  if (score >= 90) { grade = 'A+'; color = 'emerald'; }
  else if (score >= 80) { grade = 'A'; color = 'green'; }
  else if (score >= 65) { grade = 'B'; color = 'yellow'; }
  else if (score >= 50) { grade = 'C'; color = 'orange'; }
  else if (score >= 30) { grade = 'D'; color = 'red'; }
  else { grade = 'F'; color = 'red'; }

  const recommendations: string[] = [];
  if (!input.spfStatus) recommendations.push('SPF kaydı eksik — DNS\'e ekleyin');
  if (!input.dkimStatus) recommendations.push('DKIM kaydı eksik — e-posta imzalaması yapılamıyor');
  if (!input.dmarcStatus) recommendations.push('DMARC politikası tanımlı değil');
  if (input.bounceCount > 2) recommendations.push(`${input.bounceCount} bounce tespit edildi — listeyi temizleyin`);
  if (input.spamCount > 0) recommendations.push(`${input.spamCount} spam şikayeti var — içerik gözden geçirilmeli`);
  if (cappedReputation < 70) recommendations.push('İtibar puanı düşük — warmup süresini uzatın');
  if (input.warmupDay < 14) recommendations.push(`Hesap ${input.warmupDay}. günde — en az 30 gün ısınma önerilir`);

  return {
    score,
    grade,
    color,
    breakdown: { spf, dkim, dmarc, reputation: reputationBonus, bouncePenalty, spamPenalty },
    recommendations
  };
}

// Spam keyword database
export const SPAM_KEYWORDS = [
  'ücretsiz', 'free', 'bedava', 'kazan', 'win', 'kazanın',
  'tıklayın', 'click here', 'buraya tıkla', 'hemen al',
  'sınırlı süre', 'limited time', 'son fırsat', 'last chance',
  'garanti', 'guarantee', '%100', '100%', 'risk yok', 'no risk',
  'kredi kartı gerekmez', 'no credit card',
  'acele et', 'hurry', 'hemen', 'şimdi satın',
  'büyük indirim', 'huge discount', 'özel teklif', 'special offer',
  'para iade', 'money back', 'ödül', 'prize', 'kazandınız', 'you won',
  'spam değil', 'not spam', 'spam free',
  'satın al', 'buy now', 'order now', 'sipariş ver',
  '!!!', '???', 'BÜYÜK HARF',
];

export function analyzeSpamWords(text: string): { found: string[]; riskScore: number } {
  const lowerText = text.toLowerCase();
  const found: string[] = [];

  for (const keyword of SPAM_KEYWORDS) {
    if (lowerText.includes(keyword.toLowerCase())) {
      found.push(keyword);
    }
  }

  // Check for excessive caps (>30% uppercase words)
  const words = text.split(/\s+/);
  const capsWords = words.filter(w => w.length > 2 && w === w.toUpperCase()).length;
  if (capsWords / words.length > 0.3) {
    found.push('Aşırı büyük harf kullanımı');
  }

  // Check for excessive punctuation
  const exclamation = (text.match(/!/g) || []).length;
  if (exclamation > 3) {
    found.push(`Aşırı ünlem işareti (${exclamation} adet)`);
  }

  const riskScore = Math.min(100, found.length * 12);
  return { found, riskScore };
}
