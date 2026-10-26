import { generateText } from 'ai';
import { getAdminModel, extractJsonFromText } from '@/lib/ai/gemini-client';
import { analyzeSpamWords, SPAM_KEYWORDS } from '@/lib/deliverability-score';
import { computeMailboxHealth, type MailboxHealthInput } from '@/lib/warmup/health';

export type ProviderType = 'GOOGLE' | 'MICROSOFT' | 'YAHOO' | 'CUSTOM';

export interface WarmupMailboxMeta {
  id: string;
  email: string;
  senderName?: string | null;
  smtpHost?: string | null;
  smtpPort?: number | null;
  smtpUser?: string | null;
  smtpPassword?: string | null;
  appPassword?: string | null;
  tenantId: string;
  sentToday: number;
  limit: number;
  maxDailyLimit?: number | null;
  createdAt: Date;
  status: string;
  isPaused: boolean;
  bounceCount: number;
  warmupDay: number;
}

/**
 * E-posta sağlayıcısını host veya domain üzerinden tespit eder
 */
export function detectProvider(email: string, smtpHost?: string | null): ProviderType {
  const host = (smtpHost || '').toLowerCase();
  const domain = (email.split('@')[1] || '').toLowerCase();

  if (host.includes('google') || host.includes('gmail') || domain.includes('gmail')) {
    return 'GOOGLE';
  }
  if (
    host.includes('office365') ||
    host.includes('outlook') ||
    domain.includes('outlook') ||
    domain.includes('hotmail')
  ) {
    return 'MICROSOFT';
  }
  if (host.includes('yahoo') || domain.includes('yahoo')) {
    return 'YAHOO';
  }
  return 'CUSTOM';
}

/**
 * Organik insan çalışma saatleri ve hafta sonu filtresi
 * (Gece 03:00'te yoğun mailleşen insan olmaz; antispam filtreleri bunu yapay sayar)
 */
export function isWithinOrganicHours(): { allowed: boolean; reason: string; chance: number } {
  // Sunucu saati veya Türkiye / Avrupa saati (UTC+3)
  const now = new Date();
  const utcHours = now.getUTCHours();
  // UTC+3 yaklaşık saat
  const localHour = (utcHours + 3) % 24;
  const currentDay = now.getUTCDay(); // 0: Pazar, 6: Cumartesi
  const isWeekend = currentDay === 0 || currentDay === 6;

  // Gece 22:00 - 07:30 arası: Gönderim neredeyse tamamen durdurulur (%5 ihtimal)
  if (localHour >= 22 || localHour < 7) {
    const roll = Math.random();
    return {
      allowed: roll < 0.05,
      reason: 'Gece saatleri (Organik dinlenme modu)',
      chance: 0.05
    };
  }

  // Hafta sonları: %30 şansla düşük hacimli gönderim
  if (isWeekend) {
    const roll = Math.random();
    return {
      allowed: roll < 0.35,
      reason: 'Hafta sonu ritmi (Düşük hacim)',
      chance: 0.35
    };
  }

  // Akşam 19:00 - 22:00 arası: Yarı yoğunluk
  if (localHour >= 19) {
    const roll = Math.random();
    return {
      allowed: roll < 0.4,
      reason: 'Mesai sonrası ritmi',
      chance: 0.4
    };
  }

  // Mesai saatleri (08:00 - 19:00): Tam aktif
  return {
    allowed: true,
    reason: 'İdeal mesai saatleri (08:00 - 19:00)',
    chance: 1.0
  };
}

/**
 * Sistem Master Seed Havuzu (Sistemde tek bir hesap olduğunda devreye giren tohum ağı)
 */
export function getSystemMasterSeeds(): WarmupMailboxMeta[] {
  const envSeeds = process.env.WARMUP_SEED_POOL 
    ? process.env.WARMUP_SEED_POOL.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const defaultSeeds = [
    'contact@starwebflow.com',
    'support@starwebflow.com',
    'hello@starwebflow.de'
  ];

  const allSeedEmails = envSeeds.length > 0 ? envSeeds : defaultSeeds;

  return allSeedEmails.map((email, idx) => ({
    id: `master-seed-${idx}`,
    email,
    senderName: 'StarWebFlow Network Node',
    smtpHost: email.includes('gmail') ? 'smtp.gmail.com' : email.includes('outlook') ? 'smtp.office365.com' : 'smtp.ionos.de',
    tenantId: 'master-seed-system',
    sentToday: 0,
    limit: 50,
    createdAt: new Date('2024-01-01'),
    status: 'ACTIVE',
    isPaused: false,
    bounceCount: 0,
    warmupDay: 60
  }));
}

/**
 * Kısır döngüyü kıran çapraz havuz hedef seçici (Cross-Domain & Cross-ESP Matching)
 * 1. Asla aynı posta kutusuna atmaz.
 * 2. Mümkün olduğunca ASLA aynı domaine atmaz (farklı domainlere %95 öncelik).
 * 3. Google <-> Google / Microsoft, Microsoft <-> Microsoft / Google çapraz ağlarını dengeler.
 * 4. Sistemde başka hesap yoksa Starwebflow Master Seed havuzunu devreye sokar.
 */
export function selectWarmupTarget(
  sender: WarmupMailboxMeta,
  pool: WarmupMailboxMeta[]
): WarmupMailboxMeta | null {
  const senderDomain = (sender.email.split('@')[1] || '').toLowerCase();
  const senderProvider = detectProvider(sender.email, sender.smtpHost);

  // Gönderici haricindeki geçerli kutular
  let validCandidates = pool.filter(
    (box) => box.id !== sender.id && !box.isPaused && box.status !== 'ERROR'
  );

  // Eğer veritabanında başka hesap yoksa (Soğuk Başlangıç), Master Seed havuzunu kullan!
  if (validCandidates.length === 0) {
    const masterSeeds = getSystemMasterSeeds().filter(
      (s) => s.email.toLowerCase() !== sender.email.toLowerCase()
    );
    if (masterSeeds.length === 0) return null;
    validCandidates = masterSeeds;
  }

  // Farklı domaindeki hedefler (Kısır döngüyü kıran 1 numaralı kural)
  const differentDomainCandidates = validCandidates.filter(
    (b) => (b.email.split('@')[1] || '').toLowerCase() !== senderDomain
  );

  // Eğer farklı domainde kutular varsa, MUTLAKA farklı domain seç!
  const targetCandidates =
    differentDomainCandidates.length > 0 ? differentDomainCandidates : validCandidates;

  // ESP Çapraz Eşleşmesi (Google <-> Microsoft / Google)
  const matchedProviderCandidates = targetCandidates.filter((b) => {
    const bProvider = detectProvider(b.email, b.smtpHost);
    if (senderProvider === 'GOOGLE') {
      return bProvider === 'GOOGLE' || bProvider === 'MICROSOFT';
    }
    if (senderProvider === 'MICROSOFT') {
      return bProvider === 'MICROSOFT' || bProvider === 'GOOGLE';
    }
    return true;
  });

  // %75 ihtimalle uyumlu ESP havuzundan, aksi halde genel farklı domain havuzundan seç
  const finalPool =
    matchedProviderCandidates.length > 0 && Math.random() < 0.75
      ? matchedProviderCandidates
      : targetCandidates;

  return finalPool[Math.floor(Math.random() * finalPool.length)];
}

/**
 * Matematiksel güvenli rampalama eğrisi (Linear Safe Ramping)
 */
export function calculateDynamicWarmupLimit(mailbox: WarmupMailboxMeta): number {
  const daysActive =
    Math.max(
      1,
      Math.floor((Date.now() - new Date(mailbox.createdAt || Date.now()).getTime()) / 86400000)
    ) || mailbox.warmupDay || 1;

  const targetMax = mailbox.limit || mailbox.maxDailyLimit || 40;

  // Günlere göre kademeli sınır (Aşama 1 -> 2 -> 3)
  let safeLimit = 3;
  if (daysActive <= 3) {
    safeLimit = Math.min(4, targetMax);
  } else if (daysActive <= 7) {
    safeLimit = Math.min(8, targetMax);
  } else if (daysActive <= 14) {
    safeLimit = Math.min(16, targetMax);
  } else if (daysActive <= 21) {
    safeLimit = Math.min(26, targetMax);
  } else {
    safeLimit = targetMax;
  }

  return safeLimit;
}

// ---------------------------------------------------------------------------
// GERÇEK SAĞLIK SKORU & ADAPTİF LİMİT
// ---------------------------------------------------------------------------

// computeMailboxHealth / MailboxHealthInput -> '@/lib/warmup/health' (client-safe)
export { computeMailboxHealth };
export type { MailboxHealthInput };

/**
 * Rampa limitini sağlığa göre daraltır: sağlıksız kutu yavaşlar, çok sağlıklı kutu rampayı aynen sürdürür.
 * Spam/bounce sinyali gelirse otomatik olarak hacim düşer (reputation koruması).
 */
export function calculateAdaptiveWarmupLimit(mailbox: WarmupMailboxMeta & Partial<MailboxHealthInput>): number {
  const base = calculateDynamicWarmupLimit(mailbox);
  const health = computeMailboxHealth({
    reputation: mailbox.reputation ?? 100,
    bounceCount: mailbox.bounceCount || 0,
    spamCount: mailbox.spamCount,
    spammed: mailbox.spammed,
    spfStatus: !!mailbox.spfStatus,
    dkimStatus: !!mailbox.dkimStatus,
    dmarcStatus: !!mailbox.dmarcStatus,
    createdAt: mailbox.createdAt
  });
  const factor = health >= 75 ? 1 : health >= 55 ? 0.7 : health >= 35 ? 0.4 : 0.2;
  return Math.max(1, Math.round(base * factor));
}

// ---------------------------------------------------------------------------
// DİL SEÇİMİ (alıcı pazarına uygun içerik: DE / TR / EN)
// ---------------------------------------------------------------------------

export type WarmupLang = 'tr' | 'de' | 'en';

export function pickLanguage(sender: { email: string }, recipient: { email: string }): WarmupLang {
  const tld = (d: string) => (d.split('@')[1] || '').toLowerCase().split('.').pop() || '';
  const r = tld(recipient.email);
  const s = tld(sender.email);
  if (r === 'de' || r === 'at' || r === 'ch') return 'de';
  if (r === 'tr') return 'tr';
  if (r === 'com' || r === 'net' || r === 'org') {
    // Aynı pazardaki gönderici ile tutarlı kal
    if (s === 'de') return 'de';
    if (s === 'tr') return 'tr';
    return 'en';
  }
  return 'en';
}

const LANG_NAME: Record<WarmupLang, string> = { tr: 'Türkçe', de: 'Deutsch (Deutschland)', en: 'English' };

const I18N_FALLBACKS: Record<'de' | 'en', {
  conversations: { subject: string; body: string }[];
  closures: string[];
  replies: string[];
}> = {
  de: {
    conversations: [
      { subject: 'Kurze Abstimmung zum Projektplan', body: '<p>Hallo,</p><p>ich habe den aktuellen Zeitplan durchgesehen. Die Meilensteine wirken realistisch. Lass uns die offenen Punkte morgen kurz im Abstimmungstermin klären.</p><p>Viele Grüße</p>' },
      { subject: 'Wartungsfenster für die Server', body: '<p>Guten Tag,</p><p>wir würden das Wartungsfenster gern auf das Wochenende legen, um Ausfälle zu vermeiden. Passt das aus deiner Sicht?</p><p>Beste Grüße</p>' },
      { subject: 'Rückfrage zum Monatsbericht', body: '<p>Hallo,</p><p>die Zahlen im Monatsbericht sehen stimmig aus. Kannst du vor dem Versand noch einmal die Zusammenfassung prüfen?</p><p>Danke und Gruß</p>' }
    ],
    closures: [
      '<p>Danke dir, damit ist alles klar. Ich trage die Punkte ins Protokoll ein.</p><p>Viele Grüße</p>',
      '<p>Super, dann gehen wir so vor. Ich melde mich, sobald es Neuigkeiten gibt.</p><p>Beste Grüße</p>',
      '<p>Alles klar, ich habe die Aufgaben an das Team weitergegeben. Bis zum nächsten Termin.</p><p>Gruß</p>'
    ],
    replies: [
      '<p>Danke für die Info. Der Ansatz passt gut zum bisherigen Ablauf.</p><p>Viele Grüße</p>',
      '<p>Habe alles erhalten. Wir können das morgen kurz besprechen und dann entscheiden.</p><p>Beste Grüße</p>',
      '<p>Danke für das Feedback, ich passe die Version entsprechend an.</p><p>Gruß</p>'
    ]
  },
  en: {
    conversations: [
      { subject: 'Quick sync on the project timeline', body: '<p>Hi,</p><p>I went through the current timeline and the milestones look realistic. Let us settle the open items in tomorrow\'s check-in.</p><p>Best regards</p>' },
      { subject: 'Maintenance window for the servers', body: '<p>Hello,</p><p>We would like to schedule the maintenance window over the weekend to avoid downtime. Does that work on your side?</p><p>Kind regards</p>' },
      { subject: 'Question about the monthly report', body: '<p>Hi,</p><p>The figures in the monthly report look consistent. Could you double-check the summary before it goes out?</p><p>Thanks</p>' }
    ],
    closures: [
      '<p>Thanks, that clears everything up. I will add the points to the notes.</p><p>Best</p>',
      '<p>Great, let us proceed that way. I will get back to you as soon as there is news.</p><p>Regards</p>',
      '<p>Sounds good, I passed the tasks on to the team. Talk at the next sync.</p><p>Cheers</p>'
    ],
    replies: [
      '<p>Thanks for the update. The approach fits well with the current plan.</p><p>Best regards</p>',
      '<p>Got everything. We can go through it tomorrow and then decide.</p><p>Kind regards</p>',
      '<p>Thanks for the feedback, I will adjust the version accordingly.</p><p>Regards</p>'
    ]
  }
};

function pickFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Profesyonel B2B Senaryoları
const B2B_SCENARIOS = [
  {
    topic: 'Q3 Proje Zaman Planı ve Milestone Kontrolü',
    context: 'Yazılım geliştirme sürecindeki sprint hedefleri ve gecikmesiz teslimat üzerine kısa görüş alışverişi.'
  },
  {
    topic: 'Haftalık Ekip Değerlendirmesi ve Geri Bildirimler',
    context: 'Önceki haftanın tamamlanan işleri ve bu haftaki öncelikli görev dağılımı hakkında güncelleme.'
  },
  {
    topic: 'Altyapı ve Sunucu Optimizasyonu Toplantı Notları',
    context: 'Sunucu yanıt süreleri, önbellekleme mimarisi ve bakım penceresi belirleme.'
  },
  {
    topic: 'Tedarikçi Sözleşmesi ve Fatura Mutabakatı',
    context: 'Geçen aya ait hizmet dökümü ve muhasebe departmanına iletilecek onay belgesi.'
  },
  {
    topic: 'Yeni Tasarım Sistemi ve Kullanıcı Arayüzü İncelemesi',
    context: 'Mobil uyumluluk testleri ve Figma bileşen kütüphanesindeki son revizyonlar.'
  },
  {
    topic: 'Müşteri İletişim Protokolü ve Destek Süreçleri',
    context: 'Müşteri memnuniyet anket sonuçları ve yanıt sürelerinin iyileştirilmesi.'
  },
  {
    topic: 'Uzaktan Çalışma ve Ekip İçi Koordinasyon Araçları',
    context: 'Dokümantasyon standartları ve asenkron çalışma prensipleri.'
  }
];

const B2B_PERSONAS = [
  'Sen bir proje yöneticisisin. Profesyonel, dakik, kısa ve çözüm odaklı yazarsın.',
  'Sen bir baş mühendissin. Analitik, net ve teknik detaylara değer veren bir dille yazarsın.',
  'Sen operasyon koordinatörüsün. Süreç odaklı, nazik ve organize bir üslup kullanırsın.',
  'Sen bir ürün tasarımcısısın. Kullanıcı deneyimine önem veren, yapıcı ve samimi bir tarzın var.'
];

// Güvenli dinamik yedek şablonlar (AI ulaşılamazsa veya spam kelime içerirse döngü kırmayan zengin havuz)
const FALLBACK_CONVERSATIONS = [
  {
    subject: 'Haftalık Proje Değerlendirmesi ve Notlar',
    body: '<p>Merhaba,</p><p>Geçtiğimiz haftaki sprint değerlendirme notlarını inceledim. Öncelikli görevlerin dağılımı gayet dengeli görünüyor. Yarınki durum toplantısında detayları netleştirebiliriz.</p><p>İyi çalışmalar dilerim.</p>'
  },
  {
    subject: 'Altyapı İyileştirme Takvimi Hakkında',
    body: '<p>Selamlar,</p><p>Sunucu bakım ve güncelleme takvimini revize ettik. Bakım penceresini hafta sonu gece saatlerine planlamak kesinti riskini minimuma indirecektir. Görüşlerinizi paylaşırsanız sevinirim.</p><p>Kolay gelsin.</p>'
  },
  {
    subject: 'Rapor Formatı ve Veri Kontrolü',
    body: '<p>Merhaba,</p><p>Hazırladığınız aylık performans tablosundaki verileri kontrol ettim. Özet bölümü oldukça açıklayıcı olmuş, ekibe iletmeden önce son bir göz atmanızı rica ederim.</p><p>Selamlar,</p>'
  },
  {
    subject: 'Arayüz İnceleme Notları',
    body: '<p>Merhabalar,</p><p>Yeni ekran tasarımlarındaki tipografi ve kontrast oranları standartlarımıza tam uyum sağlamış. Geliştirme ekibine aktarmak için onay verebiliriz.</p><p>Başarılar.</p>'
  }
];

const FALLBACK_CLOSURES = [
  '<p>Geri bildirimlerin için çok teşekkürler, notları aldım. Yarınki durum toplantısında kalan detayları üzerinden geçeriz.</p><p>İyi çalışmalar dilerim.</p>',
  '<p>Detaylı açıklaman için teşekkür ederim, süreç gayet netleşti. Herhangi bir gelişme olursa tekrar haberleşiriz.</p><p>Kolay gelsin.</p>',
  '<p>Tamamdır, aksiyon maddelerini ekibe ilettim. İlgili güncellemeleri tamamlayıp tarafınıza bilgi vereceğim.</p><p>Görüşmek üzere.</p>',
  '<p>Bilgiler için teşekkürler, revizyonu bu doğrultuda tamamlıyorum. Emeğinize sağlık.</p><p>Selamlar,</p>',
  '<p>Harika bir planlama oldu. Bu haftaki teslimatları takvime uygun şekilde tamamlayabileceğiz. Başarılar dilerim.</p>',
  '<p>Açıklamalar için sağ olun, konuyla ilgili tüm sorular yanıtlanmış oldu. Yeni sprintte görüşmek dileğiyle.</p><p>İyi günler.</p>',
  '<p>Mutabakat sağlandı, ilgili departmanla süreci başlattım. Destekleriniz için teşekkür ederim.</p><p>Saygılarımla,</p>',
  '<p>Notları sisteme işledim. Şimdilik başka bir aksiyona gerek kalmadı, elinize sağlık.</p><p>İyi haftalar dilerim.</p>'
];

const FALLBACK_REPLIES = [
  '<p>Bilgilendirme için teşekkürler. Notları inceledim, belirtilen yaklaşım projenin genel akışına oldukça uygun görünüyor.</p><p>İyi çalışmalar.</p>',
  '<p>Paylaştığınız detayları aldım. Yarın öğleden sonraki toplantıda maddelerin üzerinden geçip nihai kararı verebiliriz.</p><p>Kolay gelsin.</p>',
  '<p>Geri bildiriminiz için teşekkürler. Bahsettiğiniz hususları dikkate alarak güncel versiyonu hazırlıyorum.</p><p>Selamlar,</p>',
  '<p>Konu gayet net, zaman planına sadık kalarak ilerlememiz en doğrusu olacaktır. Emeğinize sağlık.</p><p>İyi günler.</p>'
];

export interface WarmupContentResult {
  subject: string;
  body: string;
  inReplyTo?: string;
  shouldReply: boolean;
  isCompletedThread?: boolean;
}

/**
 * Gerçekçi, spam kelimelerden arındırılmış, bağlam korumalı e-posta içeriği üretir
 */
export async function generateWarmupContent(params: {
  sender: WarmupMailboxMeta;
  recipient: WarmupMailboxMeta;
  existingThread?: {
    id: string;
    subject: string;
    lastMessageId: string;
    messageCount: number;
    status: string;
  } | null;
}): Promise<WarmupContentResult> {
  const { sender, recipient, existingThread } = params;

  // 1. Thread Mantığı: Doğal insan davranışı için 3 ile 5 mesaj arasında değişken sonlanma
  const threadMaxMessages = 3 + (existingThread ? (existingThread.subject.length % 3) : 1);
  const isClosingTurn = existingThread ? existingThread.messageCount >= threadMaxMessages : false;

  // 2. Yanıt Oranı: Eğer thread varsa her seferinde değil, %45 ihtimalle cevap verilir (İnsan ritmi)
  // Ancak kapanış turu ise veya tek sayılı tur ise devam eder
  if (existingThread && !isClosingTurn) {
    const shouldReplyRoll = Math.random() < 0.45;
    if (!shouldReplyRoll) {
      // Bu sefer yanıt verme, sadece okunacak
      return {
        subject: existingThread.subject,
        body: '',
        shouldReply: false
      };
    }
  }

  const persona = B2B_PERSONAS[Math.floor(Math.random() * B2B_PERSONAS.length)];
  const senderSignatureName = sender.senderName || sender.email.split('@')[0];
  const lang = pickLanguage(sender, recipient);
  const langName = LANG_NAME[lang];
  // Dil bazlı yedek havuzu (TR için mevcut havuz, DE/EN için yerel havuz)
  const FB = lang === 'tr'
    ? { conversations: FALLBACK_CONVERSATIONS, closures: FALLBACK_CLOSURES, replies: FALLBACK_REPLIES }
    : I18N_FALLBACKS[lang];

  try {
    if (existingThread) {
      const cleanSubject = existingThread.subject.startsWith('Re:')
        ? existingThread.subject
        : `Re: ${existingThread.subject}`;

      if (isClosingTurn) {
        // AI İle Bağlamsal Doğal Kapanış Üret (Statik robotik cümleler tamamen kaldırıldı!)
        const { text: generatedClosing } = await generateText({
          model: getAdminModel(),
          system: `${persona}
GÖREV: Karşındaki meslektaşınla "${existingThread.subject}" konusunu görüşüyordunuz ve konu netleşti. 
Konuşmayı profesyonelce, yapıcı ve samimi bir dille sonlandıran 1-2 cümlelik çok doğal bir veda/kapanış yanıtı yaz. YANIT DİLİ: ${langName}.
KURALLAR:
- ASLA kalıp veya robotik bir dil kullanma (örn: 'Harika teşekkürler konuyu netleştirdik' gibi kalıplar KULLANMA).
- Gerçek bir iş insanı gibi: Notları aldığını, süreci başlattığını veya haftalık toplantıda görüşmeyi dileyen özgün bir cümle kur.
- ŞU KELİMELERİ ASLA KULLANMA: ${SPAM_KEYWORDS.slice(0, 15).join(', ')}.
- Markdown veya JSON verme. Sadece sade metin ver.
- İmza olarak "${senderSignatureName}" adını veya profesyonel bir kapanış kullan.`,
          prompt: 'Doğal, kurumsal ve kısa bir kapanış yaz.'
        });

        let cleanBody = generatedClosing.replace(/```/g, '').trim();
        const spamCheck = analyzeSpamWords(cleanBody);
        if (spamCheck.found.length > 0) {
          cleanBody = pickFrom(FB.closures);
        }

        return {
          subject: cleanSubject,
          body: cleanBody.startsWith('<p>') ? cleanBody : `<p>${cleanBody.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`,
          inReplyTo: existingThread.lastMessageId,
          shouldReply: true,
          isCompletedThread: true
        };
      }

      // Devam eden konuşmaya doğal B2B ara yanıt üret
      const { text: generatedEmail } = await generateText({
        model: getAdminModel(),
        system: `${persona}
GÖREV: Karşındaki meslektaşından gelen "${existingThread.subject}" başlıklı e-postaya 1-3 cümlelik çok doğal, profesyonel bir yanıt yaz. YANIT DİLİ: ${langName}.
KURALLAR:
- ASLA satış, pazarlama, reklam yapma.
- ŞU KELİMELERİ ASLA KULLANMA: ${SPAM_KEYWORDS.slice(0, 15).join(', ')}.
- Markdown, kod bloğu veya JSON verme. Sadece sade metin ver.
- İmza olarak "${senderSignatureName}" adını veya profesyonel bir kapanış kullan.`,
        prompt: 'Doğal, kurumsal ve kısa bir yanıt yaz.'
      });

      let cleanBody = generatedEmail.replace(/```/g, '').trim();

      // Spam denetimi
      const spamCheck = analyzeSpamWords(cleanBody);
      if (spamCheck.found.length > 0) {
        console.warn(`[WARMUP AI] Spam kelime tespit edildi, zengin yedek seçiliyor:`, spamCheck.found);
        cleanBody = pickFrom(FB.replies);
      }

      return {
        subject: cleanSubject,
        body: cleanBody.startsWith('<p>') ? cleanBody : `<p>${cleanBody.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`,
        inReplyTo: existingThread.lastMessageId,
        shouldReply: true
      };
    } else {
      // Yepyeni bir kurumsal konu başlat
      const scenario = B2B_SCENARIOS[Math.floor(Math.random() * B2B_SCENARIOS.length)];

      const { text: generatedEmail } = await generateText({
        model: getAdminModel(),
        system: `${persona}
GÖREV: İş arkadaşına göndermek üzere "${scenario.topic}" konulu kısa bir kurumsal e-posta hazırla. E-POSTA DİLİ: ${langName} (konu başlığı ve metin bu dilde, doğal biçimde yazılmalı).
BAĞLAM: ${scenario.context}
KURALLAR:
- ASLA satış, reklam, kampanya yapma.
- ŞU SPAM KELİMELERİ ASLA KULLANMA: ${SPAM_KEYWORDS.slice(0, 20).join(', ')}.
- ÇIKTI FORMATI MUTLAKA GEÇERLİ JSON OLMALIDIR:
{"subject": "Konu Başlığı", "body": "1-3 paragraflık samimi kurumsal gövde"}
- JSON dışında hiçbir şey yazma.`,
        prompt: 'Kurumsal e-posta üret.'
      });

      const parsed = JSON.parse(extractJsonFromText(generatedEmail));
      let subject = parsed.subject || scenario.topic;
      let bodyText = parsed.body || pickFrom(FB.conversations).body;

      // Spam kelime filtresi
      const spamCheck = analyzeSpamWords(subject + ' ' + bodyText);
      if (spamCheck.found.length > 0) {
        console.warn(`[WARMUP AI] Üretilen içerikte spam kelime bulundu, yedek seçiliyor:`, spamCheck.found);
        const fb = pickFrom(FB.conversations);
        subject = fb.subject;
        bodyText = fb.body;
      }

      // Güvenli referans link simülasyonu (%25 ihtimalle Wikipedia / GitHub gibi saygın link)
      if (Math.random() < 0.25) {
        const safeLinks = [
          'https://tr.wikipedia.org',
          'https://github.com',
          'https://developer.mozilla.org',
          'https://news.ycombinator.com'
        ];
        const link = safeLinks[Math.floor(Math.random() * safeLinks.length)];
        const refLabel = lang === 'de' ? 'Quelle' : lang === 'tr' ? 'Referans kaynak' : 'Reference';
        bodyText += `<p><br>${refLabel}: <a href="${link}">${link}</a></p>`;
      }

      return {
        subject,
        body: bodyText.startsWith('<p>') ? bodyText : `<p>${bodyText}</p>`,
        shouldReply: true
      };
    }
  } catch (err: any) {
    console.warn(`[WARMUP AI FALLBACK] AI üretimi sırasında hata oluştu, zengin yedek kullanılıyor:`, err?.message);
    if (existingThread) {
      const cleanSubject = existingThread.subject.startsWith('Re:')
        ? existingThread.subject
        : `Re: ${existingThread.subject}`;

      const fallbackBody = isClosingTurn ? pickFrom(FB.closures) : pickFrom(FB.replies);

      return {
        subject: cleanSubject,
        body: fallbackBody,
        inReplyTo: existingThread.lastMessageId,
        shouldReply: true,
        isCompletedThread: isClosingTurn
      };
    }

    const fb = pickFrom(FB.conversations);
    return {
      subject: fb.subject,
      body: fb.body,
      shouldReply: true
    };
  }
}
