/**
 * Starwebflow Auto-Responder (Akıllı Otomatik Yanıt) Kural Motoru
 * Soğuk e-posta kampanyalarına gelen yanıtları AI duygu analizi ve anahtar kelimelerle
 * sınıflandırıp otonom aksiyon alan kuralların standart tanımı ve değerlendiricisi.
 */

export type RuleCategory = 'meeting' | 'unsubscribe' | 'objection' | 'referral' | 'ooo' | 'vip';

export type ActionType = 
  | 'SEND_TEMPLATE'     // Hazır şablon ile yanıt ver (ör: Toplantı linki veya ROI analizi)
  | 'UNSUBSCRIBE'       // Listeden çıkar, karantinaya al, kampanyayı durdur
  | 'SEND_WHATSAPP'     // Satış temsilcisine acil WhatsApp alarmı gönder
  | 'NOTIFY_TEAM'       // Slack / Dahili bildirim ilet
  | 'RESCHEDULE';       // İzin / Ofis dışı tarihine göre takibi ertele

export interface AutoResponderRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  category: RuleCategory;
  trigger: {
    keywords: string[];
    sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'ANY';
    matchAllKeywords?: boolean;
  };
  action: {
    type: ActionType;
    templateId?: string;
    templateName?: string;
    delayMinutes: number; // Doğal insan görünümü için gecikme (15 dk vb.)
    leadScoreChange?: number; // Örn: +50 veya -100
    whatsappPhone?: string;
    customNote?: string;
  };
}

/**
 * Starwebflow Önceden Tanımlanmış 6 Elite Otomatik Yanıt Kuralı
 */
export const DEFAULT_CAMPAIGN_RULES: AutoResponderRule[] = [
  {
    id: 'rule-meeting-link',
    name: 'Kural 1: İlgi Gösterenlere Otomatik Toplantı Linki',
    description: 'Fiyat, ücret veya detay soran sıcak müşterilere gecikmeli toplantı daveti gönderir.',
    isActive: true,
    category: 'meeting',
    trigger: {
      keywords: ['fiyat', 'ücret', 'detay', 'demo', 'görüşelim', 'bilgi', 'teklif', 'maliyet', 'randevu', 'meeting', 'price'],
      sentiment: 'POSITIVE'
    },
    action: {
      type: 'SEND_TEMPLATE',
      templateName: 'Toplantı & Takvim Linki Şablonu',
      delayMinutes: 15,
      leadScoreChange: 50
    }
  },
  {
    id: 'rule-unsubscribe-negative',
    name: 'Kural 2: Reddedenleri Listeden Çıkar & İtibar Koru',
    description: 'İlgilenmeyenleri anında karantinaya alıp kampanyayı durdurarak spam riskini sıfırlar.',
    isActive: true,
    category: 'unsubscribe',
    trigger: {
      keywords: ['ilgilenmiyorum', 'çıkarın', 'istemiyorum', 'yazmayın', 'unsubscribe', 'remove', 'stop', 'silin'],
      sentiment: 'NEGATIVE'
    },
    action: {
      type: 'UNSUBSCRIBE',
      delayMinutes: 0,
      leadScoreChange: -100
    }
  },
  {
    id: 'rule-objection-roi',
    name: 'Kural 3: Bütçe / Fiyat İtirazına Otomatik ROI Yanıtı',
    description: '"Bütçemiz yetersiz" veya "Pahalı" diyenlere özel vaka analizi ve ROI hesabı iletir.',
    isActive: true,
    category: 'objection',
    trigger: {
      keywords: ['pahalı', 'bütçe', 'indirim', 'yüksek', 'maliyetli', 'şimdi değil', 'bütçemiz yok', 'expensive', 'budget'],
      sentiment: 'ANY'
    },
    action: {
      type: 'SEND_TEMPLATE',
      templateName: 'ROI & Vaka Analizi İtiraz Kırıcı Şablon',
      delayMinutes: 20,
      leadScoreChange: 20
    }
  },
  {
    id: 'rule-referral-detection',
    name: 'Kural 4: Yetkili Kişi Yönlendirmesi (Re-Referral Dedektörü)',
    description: '"Bu konuyla X ilgileniyor" yanıtlarından yeni yetkili e-postasını yakalayıp CRM\'e ekler.',
    isActive: true,
    category: 'referral',
    trigger: {
      keywords: ['ilgileniyor', 'yönlendiriyorum', 'yetkili', 'şuna yazın', 'bağlantıya geçin', 'forwarding to', 'contact with'],
      sentiment: 'ANY'
    },
    action: {
      type: 'NOTIFY_TEAM',
      delayMinutes: 5,
      leadScoreChange: 30,
      customNote: 'Yeni yetkili yönlendirmesi tespit edildi. CRM kaydı güncellendi.'
    }
  },
  {
    id: 'rule-ooo-rescheduler',
    name: 'Kural 5: Ofis Dışında / İzin Takibi (Out-of-Office)',
    description: 'Otomatik ofis dışı maillerinde kampanyayı duraklatıp dönüş tarihine erteleme koyar.',
    isActive: true,
    category: 'ooo',
    trigger: {
      keywords: ['ofis dışındayım', 'izindeyim', 'tatildeyim', 'out of office', 'ooo', 'on leave', 'şu tarihe kadar yokum'],
      sentiment: 'ANY'
    },
    action: {
      type: 'RESCHEDULE',
      delayMinutes: 0,
      customNote: 'Ofis dışı yanıtı algılandı. Takip 5 gün sonraya ertelendi.'
    }
  },
  {
    id: 'rule-vip-whatsapp-radar',
    name: 'Kural 6: VIP Acil İlgi Radar (Canlı WhatsApp Bildirimi)',
    description: 'Müşteri "hemen", "bugün arayın" dediğinde satış temsilcisine anında WhatsApp uyarısı atar.',
    isActive: true,
    category: 'vip',
    trigger: {
      keywords: ['hemen', 'acil', 'bugün', 'arayın', 'numaram', 'telefonum', 'call me', 'urgent', 'asap'],
      sentiment: 'POSITIVE'
    },
    action: {
      type: 'SEND_WHATSAPP',
      delayMinutes: 0,
      leadScoreChange: 100,
      customNote: '🔥 Sıcak Müşteri! WhatsApp üzerinden anında bildirim geçildi.'
    }
  }
];

/**
 * Gelen e-posta yanıtını aktif kurallara göre değerlendirir.
 */
export function evaluateReplyRules(replyText: string, rules: AutoResponderRule[] = DEFAULT_CAMPAIGN_RULES): {
  matchedRule: AutoResponderRule | null;
  detectedKeywords: string[];
  suggestedAction: ActionType | null;
} {
  const lowerText = replyText.toLowerCase();
  const activeRules = rules.filter(r => r.isActive);

  for (const rule of activeRules) {
    const hits = rule.trigger.keywords.filter(k => lowerText.includes(k.toLowerCase()));
    
    if (hits.length > 0) {
      return {
        matchedRule: rule,
        detectedKeywords: hits,
        suggestedAction: rule.action.type
      };
    }
  }

  return {
    matchedRule: null,
    detectedKeywords: [],
    suggestedAction: null
  };
}
