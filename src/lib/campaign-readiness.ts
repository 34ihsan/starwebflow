/**
 * Mail kutusunun soğuk kampanyada kullanıma hazır olup olmadığını belirler.
 * Kurallar `omniRouteSelector` (outreachEngine.ts) ile birebir uyumludur:
 *  - ACTIVE kutular her zaman olgun sayılır.
 *  - WARMUP kutular: (warmupDay >= 14 veya warmupProgress >= 50) ve reputation >= 80.
 * Ek olarak DNS durumu (SPF/DKIM/DMARC) uyarı olarak raporlanır.
 */

export type ReadinessLevel = 'ready' | 'caution' | 'blocked';

export interface MailboxReadiness {
  level: ReadinessLevel;
  /** Kampanyaya eklenebilir mi? (blocked ise hayır) */
  assignable: boolean;
  /** Gönderim motoru bu kutuyu gerçekten seçer mi? */
  sendable: boolean;
  /** Engelleyici sebepler */
  blockers: string[];
  /** Engellemeyen ama dikkat edilmesi gereken uyarılar */
  warnings: string[];
  /** Günlük etkin gönderim kapasitesi */
  dailyCapacity: number;
}

export function getMailboxReadiness(mb: any): MailboxReadiness {
  const blockers: string[] = [];
  const warnings: string[] = [];

  const status: string = (mb?.status || '').toUpperCase();
  const warmupDay: number = mb?.warmupDay ?? 0;
  const progress: number = mb?.warmupProgress ?? 0;
  const reputation: number = mb?.reputation ?? 0;

  if (status === 'ERROR') blockers.push('Bağlantı hatası (ERROR)');
  if (mb?.isPaused) blockers.push('Duraklatılmış');

  if (status === 'WARNING') {
    warnings.push('DNS/itibar uyarısı (WARNING)');
  }

  if (status === 'WARMUP') {
    const matureEnough = warmupDay >= 14 || progress >= 50;
    if (!matureEnough) blockers.push(`Isınma yetersiz (${warmupDay}. gün, %${progress})`);
    else if (reputation < 80) blockers.push(`İtibar düşük (${reputation}/100, min 80)`);
    else warnings.push('Hâlâ WARMUP modunda. "Aktif Yap" ile kesinleştirin');
  } else if (status !== 'ACTIVE' && status !== 'ERROR' && status !== 'WARNING') {
    blockers.push(`Uygun olmayan durum (${status || 'bilinmiyor'})`);
  }

  if (status === 'ACTIVE' && reputation < 60) {
    warnings.push(`İtibar düşük (${reputation}/100)`);
  }

  if (!mb?.spfStatus) warnings.push('SPF eksik');
  if (!mb?.dkimStatus) warnings.push('DKIM eksik');
  if (!mb?.dmarcStatus) warnings.push('DMARC eksik');

  const email = String(mb?.email || '').toLowerCase();
  if (email.endsWith('@gmail.com') || email.endsWith('@googlemail.com')) {
    warnings.push('Ücretsiz Gmail adresi: B2B kampanyada itibar düşürür');
  }

  const sendable =
    blockers.length === 0 &&
    status !== 'WARNING' &&
    (status === 'ACTIVE' || status === 'WARMUP');

  const level: ReadinessLevel =
    blockers.length > 0 ? 'blocked' : warnings.length > 0 || status === 'WARNING' ? 'caution' : 'ready';

  const dailyCapacity = sendable
    ? Math.max(0, Math.min(mb?.limit || 40, mb?.maxDailyLimit || mb?.limit || 40))
    : 0;

  return {
    level,
    assignable: blockers.length === 0,
    sendable,
    blockers,
    warnings,
    dailyCapacity,
  };
}
