export interface EmailTemplatePayload {
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  followUpSubject?: string;
  followUpBodyText?: string;
}

export interface SectorEmailBundle {
  blueprintId: string;
  de: {
    cold: EmailTemplatePayload;
    warmFollowUp: EmailTemplatePayload;
  };
  tr: {
    cold: EmailTemplatePayload;
    warmFollowUp: EmailTemplatePayload;
  };
  en: {
    cold: EmailTemplatePayload;
    warmFollowUp: EmailTemplatePayload;
  };
}

/**
 * Samimi, kısa, can alıcı ve ağdalı olmayan hazır e-posta kütüphanesi
 * Dinamik değişkenler:
 * {{decisionMakerName}}, {{decisionMakerLastName}}, {{companyName}}, {{city}},
 * {{senderName}}, {{senderPhone}}, {{senderEmail}}, {{unsubscribeLink}}, {{customPitch}}
 */
export const SECTOR_EMAIL_TEMPLATES: Record<string, SectorEmailBundle> = {
  // 1. EV ŞARJ & ALTYAPI
  ev_charging_infrastructure: {
    blueprintId: "ev_charging_infrastructure",
    de: {
      cold: {
        subject: "Kurze Frage zur Ladeinfrastruktur bei {{companyName}}",
        bodyText: `Guten Tag Herr/Frau {{decisionMakerLastName}},

ich habe gesehen, dass Sie in {{city}} hochwertige Ladeinfrastruktur für Gewerbe und Immobilien installieren.

Ein Detail fällt mir bei vielen Projekten auf:
Gewerbekunden wissen selten, ob ihr Hausanschluss für 10+ Ladepunkte überhaupt ausreicht. Ihre Projektleiter verbringen wahrscheinlich viel Zeit mit Vor-Ort-Terminen, nur um festzustellen, dass das Netz überlastet ist.

Wir haben für Fachbetriebe einen 60-Sekunden-Lastmanagement-Konfigurator gebaut: Der Kunde gibt seine Fahrzeuganzahl ein und erhält sofort eine realistische Machbarkeits- und Förderübersicht.

Hätten Sie diese Woche 5 Minuten Zeit, damit ich Ihnen kurz zeige, wie das für {{companyName}} aussehen könnte?

Beste Grüße,
{{senderName}}
StarWebFlow Automation
Tel: {{senderPhone}}`,
      },
      warmFollowUp: {
        subject: "45-Sekunden-Demo für {{companyName}}",
        bodyText: `Hallo {{decisionMakerLastName}},

ich wollte kurz nachhaken – vermutlich geht es bei Ihnen bei den Montageprojekten gerade turbulent zu.

Ich habe kurz aufgenommen, wie ein Gewerbekunde auf Ihrer Website in unter 1 Minute ein fertiges Lastenheft anfordert:
👉 [45-Sekunden-Vorschau für {{companyName}}]

Falls das Thema aktuell nicht passt, sagen Sie mir einfach kurz Bescheid.

Beste Grüße,
{{senderName}}`,
      }
    },
    tr: {
      cold: {
        subject: "{{companyName}} için ufak bir tespit (Şarj İstasyonu Talepleri)",
        bodyText: `Selamlar {{decisionMakerName}} Bey/Hanım,

{{city}} bölgesinde {{companyName}} olarak kurduğunuz şarj istasyonu projelerinizi incelerken web sitenize denk geldim. Gerçekten sektörün öncülerindensiniz, tebrik ederim.

Sitede gördüğüm önemli bir detayı samimiyetle paylaşmak istedim:
Filo veya site yöneticileri sitenize girdiğinde trafo gücüne göre kaç adet istasyon kurabileceklerini kestiremiyor ve sadece form bırakıp bekliyorlar. Bu da sıcak lead'lerin soğumasına yol açıyor.

Benzer kuruculara entegre ettiğimiz "B2B Güç & Şarj Simülatörü" ile müşteri 30 saniyede bina gücünü seçip anında ön fizibilite raporu alıyor ve sıcak talep doğrudan satış ekibinize düşüyor.

Size bunun canlıda nasıl çalıştığını gösteren 1 dakikalık kısa bir video iletmemi ister misiniz?

İyi çalışmalar dilerim,
{{senderName}}
StarWebFlow Dijital Sistemler
WhatsApp / Tel: {{senderPhone}}`,
      },
      warmFollowUp: {
        subject: "{{companyName}} / Çok kısa bir ekleme",
        bodyText: `{{decisionMakerName}} Merhaba,

Geçen hafta gönderdiğim mesaja bakacak fırsatınız olmadı muhtemelen, yoğunluğunuzu anlıyorum.

Sizi hiç yormak istemem; {{companyName}} için hazırladığım örnek simülasyon ekranını buraya bırakıyorum:
👉 [{{companyName}} Özel Şarj Demo Ekranı]

Gündeminizde yoksa "İlgilenmiyorum" yazmanız yeterli, tekrar rahatsız etmem.

Görüşmek üzere,
{{senderName}}`,
      }
    },
    en: {
      cold: {
        subject: "Quick question regarding fleet charging at {{companyName}}",
        bodyText: `Hi {{decisionMakerName}},

I came across {{companyName}} while researching commercial EV infrastructure installers around {{city}}. Great work on your recent installations!

I noticed one common friction point:
Fleet managers rarely know if their grid connection can handle 10+ chargers. They submit generic contact forms, and your engineers waste hours calculating load viability manually.

We developed an interactive 60-second Fleet Load Configurator that qualifies power requirements automatically before scheduling an on-site audit.

Would you be open to a 5-minute preview this week?

Best regards,
{{senderName}}
StarWebFlow Automation`,
      },
      warmFollowUp: {
        subject: "45-second demo link for {{companyName}}",
        bodyText: `Hi {{decisionMakerName}},

Following up briefly on my previous email. I recorded a quick 45-second walkthrough showing how commercial clients can configure grid capacity on your website:

👉 [45-sec interactive demo for {{companyName}}]

If this isn't a priority right now, just let me know and I won't follow up again.

Cheers,
{{senderName}}`,
      }
    }
  },

  // 2. DİŞ KLİNİKLERİ & İMPLANT
  dental_clinics: {
    blueprintId: "dental_clinics",
    de: {
      cold: {
        subject: "Verpasste Patientenanrufe bei {{companyName}}?",
        bodyText: `Guten Tag Dr. {{decisionMakerLastName}},

Ihr Team leistet in {{city}} exzellente Arbeit – die vielen zufriedenen Patientenbewertungen belegen das.

Mir ist jedoch ein typischer Engpass aufgefallen:
Wenn das Telefon am Empfang durchgehend klingelt oder Patienten nach 18:00 Uhr anrufen, geht oft niemand ran. Gerade Schmerzpatienten oder lukrative Implantat-Interessenten rufen dann einfach die nächste Praxis an.

Unser KI-Telefonassistent nimmt solche Anrufe 24/7 freundlich und menschlich entgegen und trägt den Termin direkt in Ihr Praxissystem ein.

Wäre es für Sie interessant zu sehen, wie andere Praxen damit monatlich 15-20 Neupatienten ohne Mehrarbeit für die Rezeption gewinnen?

Beste Grüße,
{{senderName}}
StarWebFlow Health Automation
Tel: {{senderPhone}}`,
      },
      warmFollowUp: {
        subject: "Kurzes Audio-Beispiel für Dr. {{decisionMakerLastName}}",
        bodyText: `Guten Tag Dr. {{decisionMakerLastName}},

ich wollte kurz nachhaken. Hier ist eine 30-sekündige Audio-Aufnahme, wie natürlich unsere KI einen Patientenanruf nach Praxisschluss annimmt:
👉 [Audio-Demo für {{companyName}}]

Falls aktuell kein Bedarf besteht, reicht ein kurzes "Nein danke".

Mit freundlichen Grüßen,
{{senderName}}`,
      }
    },
    tr: {
      cold: {
        subject: "{{companyName}} için mesai dışı hasta randevuları hk.",
        bodyText: `Hocam merhabalar Dr. {{decisionMakerName}},

{{city}} bölgesinde kliniğinizin hasta memnuniyetini ve Google yorumlarını inceledim, gerçekten çok kıymetli bir hekimlik yapıyorsunuz.

Sadece gözüme çarpan ufak bir noktayı paylaşmak istedim:
Akşam 19:00'dan sonra veya sekreterya meşgulken arayan hastalar telefona ulaşamayınca genelde nöbetçi veya hemen yanıt veren başka bir kliniğe yöneliyor. Bu da ayda ciddi bir hasta kaybı demek.

Kliniğinize entegre edebileceğimiz 7/24 Akıllı WhatsApp & Sesli Randevu Asistanı ile; hastanın şikayetini dinleyip boş takviminize anında randevu yazan bir sistem kuruyoruz.

Size bunun kliniğinizde nasıl çalışacağını gösteren kısa bir örnek video ileteyim mi?

Saygılarımla,
{{senderName}}
StarWebFlow Sağlık Sistemleri`,
      },
      warmFollowUp: {
        subject: "Hocam merhaba / {{companyName}} demo",
        bodyText: `Dr. {{decisionMakerName}} Hocam,

Geçen hafta ilettiğim mesaja yoğunluğunuzdan dolayı bakamadınız sanırım.

Kliniğiniz için hazırladığım 40 saniyelik örnek WhatsApp randevu akışı burada:
👉 [{{companyName}} Randevu Botu Önizleme]

Şu an gündeminizde yoksa "Gerek yok" demeniz yeterli, sizi tekrar rahatsız etmem.

İyi çalışmalar dilerim,
{{senderName}}`,
      }
    },
    en: {
      cold: {
        subject: "Missed patient bookings at {{companyName}}?",
        bodyText: `Dear Dr. {{decisionMakerLastName}},

Your clinic has built an outstanding reputation in {{city}}.

One common challenge we see with high-performing practices:
When reception is overwhelmed or patients call after 6 PM, calls go straight to voicemail. High-value implant or cosmetic cases often just call the next clinic on Google.

Our 24/7 AI Voice & WhatsApp Receptionist answers calls naturally and books directly into your calendar.

Would you be open to a 3-minute demo showing how this recovers 15+ high-ticket patients monthly?

Best regards,
{{senderName}}`,
      },
      warmFollowUp: {
        subject: "Quick audio sample for Dr. {{decisionMakerLastName}}",
        bodyText: `Dear Dr. {{decisionMakerLastName}},

Following up briefly. Here is a 30-second audio sample of our AI handling an after-hours patient consultation:
👉 [Live Audio Demo for {{companyName}}]

If you're all set, just let me know and I won't follow up again.

Best,
{{senderName}}`,
      }
    }
  },

  // 3. GÜNEŞ ENERJİSİ (SOLAR) & HVAC
  solar_photovoltaic: {
    blueprintId: "solar_photovoltaic",
    de: {
      cold: {
        subject: "Vor-Ort-Fehlfahrten bei PV-Anlagen in {{city}}",
        bodyText: `Guten Tag Herr/Frau {{decisionMakerLastName}},

Sie montieren mit {{companyName}} hochwertige Solaranlagen in der Region {{city}}.

Ein Problem kennen Sie sicher:
Interessenten fordern ein Angebot an, Ihre Berater fahren 40 km zur Besichtigung – und vor Ort stellt sich heraus, dass das Dach verschattet oder statisch ungeeignet ist. Das verbrennt jede Woche hunderte Euro Arbeitszeit.

Wir haben einen Satelliten-Dachrechner gebaut: Der Kunde zeichnet sein Dach auf Google Maps ein, und unser System spuckt in 60 Sekunden eine Ertragsprognose aus. Nur geeignete Dächer landen bei Ihren Vertrieblern.

Hätten Sie 5 Minuten für einen kurzen Blick darauf?

Beste Grüße,
{{senderName}}
StarWebFlow Energy Systems`,
      },
      warmFollowUp: {
        subject: "45-Sekunden-Dachrechner für {{companyName}}",
        bodyText: `Hallo {{decisionMakerLastName}},

ich wollte kurz nachhaken. Hier ist ein 45-Sekunden-Video, wie ein Hausbesitzer in {{city}} sein Dach bei Ihnen berechnen könnte:
👉 [Demo-Dachrechner {{companyName}}]

Beste Grüße,
{{senderName}}`,
      }
    },
    tr: {
      cold: {
        subject: "{{companyName}} / Çatı keşifleri ve teklif süresi hk.",
        bodyText: `Selamlar {{decisionMakerName}} Bey/Hanım,

{{city}} bölgesinde {{companyName}} olarak kurduğunuz çatı GES projelerini ilgiyle takip ediyorum.

Sektördeki en büyük zaman kaybını bildiğim için doğrudan konuya girmek istedim:
Müşteri teklif istiyor, ekibiniz keşfe gidiyor ama çatının statik veya gölge durumu uygun çıkmayınca o günkü mesai boşa gidiyor.

Web sitenize entegre edeceğimiz Uydu Destekli Çatı Hesaplayıcı ile; müşteri adresini girip çatısını haritada işaretliyor, sistem 30 saniyede amortisman ve panel adedi teklifini PDF olarak veriyor. Ekibiniz sadece uygun olan evlere gidiyor.

Bunun canlı demosunu size 1 dakikalık video ile göstermemi ister misiniz?

İyi çalışmalar,
{{senderName}}
StarWebFlow Dijital Sistemler`,
      },
      warmFollowUp: {
        subject: "{{companyName}} / Örnek çatı hesaplayıcı linki",
        bodyText: `{{decisionMakerName}} Merhaba,

Geçen haftaki mesaja dönüş yapamadınız muhtemelen, sahadaki yoğunluğu tahmin edebiliyorum.

Hazırladığım örnek çatı simülatörünün linki burada:
👉 [{{companyName}} Özel Simülatör]

İlginizi çekmiyorsa "Gerek yok" yazmanız yeterli, tekrar yazmam.

Görüşmek üzere,
{{senderName}}`,
      }
    },
    en: {
      cold: {
        subject: "Wasted solar site audits at {{companyName}}?",
        bodyText: `Hi {{decisionMakerName}},

I noticed {{companyName}} does exceptional solar installations around {{city}}.

One major bottleneck solar installers face is driving out for on-site roof audits only to discover heavy shading or unviable roof structures.

Our interactive Satellite Roof Calculator lets homeowners outline their roof on satellite imagery and generates an instant ROI proposal in 60 seconds. Your sales reps only visit pre-qualified, ready-to-buy homeowners.

Open to a 5-minute preview this week?

Best,
{{senderName}}`,
      },
      warmFollowUp: {
        subject: "45-second solar preview for {{companyName}}",
        bodyText: `Hi {{decisionMakerName}},

Brief follow-up. Here is a 45-second video of how homeowners could calculate roof solar yield directly on your site:
👉 [Solar Configurator Demo]

Let me know if you'd like a live test.

Cheers,
{{senderName}}`,
      }
    }
  },

  // 4. İŞ HUKUKU & AVUKATLAR
  labor_law_firms: {
    blueprintId: "labor_law_firms",
    de: {
      cold: {
        subject: "Abfindungs-Mandate für Ihre Kanzlei in {{city}}",
        bodyText: `Sehr geehrte(r) Herr/Frau {{decisionMakerLastName}},

geküdigte Arbeitnehmer haben nach Erhalt der Kündigung genau 3 Wochen Zeit für eine Kündigungsschutzklage. Wer in dieser Phase googelt, sucht eine schnelle Einschätzung seiner Abfindungschancen – keine langen juristischen Texte.

Wir haben einen digitalen Abfindungsrechner entwickelt: Der Mandant gibt Gehalt und Beschäftigungsdauer ein und lädt das Kündigungsschreiben hoch. Ihre Kanzlei erhält eine fertige, vorstrukturierte Akte.

Hätten Sie diese Woche 5 Minuten Zeit für eine kurze Online-Vorschau?

Mit freundlichen Grüßen,
{{senderName}}
StarWebFlow Legal Automation`,
      },
      warmFollowUp: {
        subject: "Kurzer Einblick: Abfindungsrechner für {{companyName}}",
        bodyText: `Sehr geehrte(r) Herr/Frau {{decisionMakerLastName}},

hier ist ein kurzer 40-Sekunden-Einblick, wie Rechtsuchende in {{city}} über das Tool qualifiziert werden:
👉 [Abfindungsrechner Demo für {{companyName}}]

Falls Sie aktuell ausgelastet sind, genügt eine kurze Rückmeldung.

Mit freundlichen Grüßen,
{{senderName}}`,
      }
    },
    tr: {
      cold: {
        subject: "İşten çıkarma & kıdem tazminatı davaları hk. ({{companyName}})",
        bodyText: `Sayın Av. {{decisionMakerName}},

{{city}} bölgesindeki hukuk büronuzun çalışma alanlarını incelerken iş hukuku ve işe iade davalarındaki başarılarınızı gördüm.

İşten çıkarılan çalışanlar internette saatlerce avukat aramak yerine önce "Kaç para tazminat alırım?" diye hesaplatmak istiyor. Sitenizde doğrudan bu hesaplamayı yapan bir araç olmayınca potansiyel müvekkiller başka sitelere kayıyor.

Büronuza kuracağımız Kıdem & İhbar Tazminatı Hesaplama Botu ile; çalışan maaşını giriyor, tahmini tazminatını görüp dava evraklarını doğrudan büronuza yüklüyor.

Bunun büronuza nasıl müvekkil kazandıracağını 1 dakikalık kısa bir video ile paylaşmamı ister misiniz?

Saygılarımla,
{{senderName}}`,
      },
      warmFollowUp: {
        subject: "Av. {{decisionMakerName}} Bey/Hanım / Demo Linki",
        bodyText: `Sayın Meslektaşım,

Geçen haftaki mesaja duruşma yoğunluğundan bakamadınız muhtemelen.

Büronuz için tasarladığım örnek tazminat hesaplama aracının önizleme linkini bırakıyorum:
👉 [{{companyName}} Tazminat Botu Demo]

Şu an gündeminizde yoksa "İlgilenmiyorum" demeniz kafi, tekrar rahatsız etmem.

İyi çalışmalar dilerim,
{{senderName}}`,
      }
    },
    en: {
      cold: {
        subject: "Severance litigation intake for {{companyName}}",
        bodyText: `Dear {{decisionMakerName}},

When employees are terminated, they urgently search online to estimate their severance payout within days.

We developed an automated Severance Calculator that calculates potential severance awards in 30 seconds and prompts qualified clients to upload their dismissal letters directly to your firm.

Would you be open to a 5-minute preview of how this works?

Best regards,
{{senderName}}`,
      },
      warmFollowUp: {
        subject: "45-second preview for {{companyName}}",
        bodyText: `Dear {{decisionMakerName}},

Following up briefly on my previous email. Here is a 45-second video of the severance intake calculator:
👉 [Interactive Intake Demo]

Let me know if you would like to explore this further.

Best,
{{senderName}}`,
      }
    }
  }
};

/**
 * Genel Fallback Şablonu (Eğer özel blueprint yoksa sektör bilgilerini akıllıca doldurur)
 */
export function getSectorEmailBundle(blueprintId: string): SectorEmailBundle {
  if (SECTOR_EMAIL_TEMPLATES[blueprintId]) {
    return SECTOR_EMAIL_TEMPLATES[blueprintId];
  }

  // Akıllı Fallback
  return {
    blueprintId,
    de: {
      cold: {
        subject: "Kurze Frage zu {{companyName}} in {{city}}",
        bodyText: `Guten Tag Herr/Frau {{decisionMakerLastName}},

ich bin auf Ihre Website aufmerksam geworden und sehe, dass Sie in {{city}} hervorragende Arbeit leisten.

Ein Detail ist mir direkt aufgefallen:
Interessenten, die Ihre Seite besuchen, finden aktuell keinen schnellen Weg, um sofort ein präzises Vorab-Angebot oder einen Beratungstermin zu erhalten. Viele springen ab und gehen zum nächsten Anbieter.

Wir haben für Unternehmen in Ihrer Branche eine KI-Lösung gebaut, die Anfragen 24/7 qualifiziert und Termine vollautomatisch einbucht.

Hätten Sie diese Woche 5 Minuten für einen kurzen Blick darauf?

Beste Grüße,
{{senderName}}
StarWebFlow Automation
Tel: {{senderPhone}}`,
      },
      warmFollowUp: {
        subject: "Kurzes Video für {{companyName}}",
        bodyText: `Hallo {{decisionMakerLastName}},

ich wollte kurz nachhaken. Hier ist ein 45-Sekunden-Video, wie Kunden auf Ihrer Website sofort verbindliche Angebote anfordern können:
👉 [45-Sekunden-Vorschau für {{companyName}}]

Falls das Thema aktuell nicht passt, sagen Sie mir einfach kurz Bescheid.

Beste Grüße,
{{senderName}}`,
      }
    },
    tr: {
      cold: {
        subject: "{{companyName}} için ufak bir tespit (Müşteri Talepleri)",
        bodyText: `Selamlar {{decisionMakerName}} Bey/Hanım,

{{city}} bölgesinde {{companyName}} olarak sunduğunuz hizmetleri incelerken web sitenize denk geldim. Başarılarınızı takdirle takip ediyorum.

Sitede gördüğüm önemli bir detayı samimiyetle paylaşmak istedim:
Hizmet almak isteyen bir müşteri sitenize girdiğinde hızlıca bir fiyat veya ön bilgi alamıyor; form doldurup beklemek zorunda kalıyor. Günümüzde insanların çoğu anında yanıt veren alternatiflere kayıyor.

Sektörünüzdeki firmalara kurduğumuz akıllı teklif ve randevu asistanı ile; gelen müşteri 30 saniyede ihtiyacını seçip teklif alıyor ve hazır müşteri ekibinize bağlanıyor.

Bunun canlıda nasıl çalıştığını gösteren 1 dakikalık kısa bir video iletmemi ister misiniz?

İyi çalışmalar dilerim,
{{senderName}}
StarWebFlow Dijital Sistemler
WhatsApp: {{senderPhone}}`,
      },
      warmFollowUp: {
        subject: "{{companyName}} / Çok kısa bir ekleme",
        bodyText: `{{decisionMakerName}} Merhaba,

Geçen hafta gönderdiğim mesaja bakacak fırsatınız olmadı muhtemelen, işlerin yoğunluğunu anlayabiliyorum.

{{companyName}} için hazırladığım örnek demo ekranının linkini buraya bırakıyorum:
👉 [{{companyName}} Özel Demo Ekranı]

Gündeminizde yoksa "İlgilenmiyorum" yazmanız kafi, sizi tekrar rahatsız etmem.

Görüşmek üzere,
{{senderName}}`,
      }
    },
    en: {
      cold: {
        subject: "Quick question regarding {{companyName}}",
        bodyText: `Hi {{decisionMakerName}},

I came across {{companyName}} while researching businesses in {{city}}. Great work on your recent projects!

I noticed one common friction point: visitors on your website have to fill out static forms and wait hours for a quote, causing many high-value leads to bounce.

We built an automated AI quoting assistant that pre-qualifies client needs in 60 seconds and books ready-to-buy appointments automatically.

Would you be open to a 5-minute preview this week?

Best regards,
{{senderName}}
StarWebFlow Automation`,
      },
      warmFollowUp: {
        subject: "45-second preview for {{companyName}}",
        bodyText: `Hi {{decisionMakerName}},

Following up briefly on my previous email. Here is a 45-second video of how clients could receive instant preliminary quotes on your site:
👉 [45-second Demo for {{companyName}}]

Let me know if this makes sense to explore.

Cheers,
{{senderName}}`,
      }
    }
  };
}

/**
 * Mail şablonunu lead verileriyle derler, Unsubscribe linkini ve DSGVO / Impressum altbilgisini ekler
 */
export function compileEmailTemplate({
  template,
  lead,
  sender = {
    name: "İhsan Tanrıverdi",
    email: "info@starwebflow.com",
    phone: "+49 176 0000000",
    company: "StarWebFlow"
  },
  lang = "de",
  appUrl = "https://www.starwebflow.com"
}: {
  template: EmailTemplatePayload;
  lead: {
    id?: string;
    company?: string | null;
    name?: string | null;
    decisionMakerName?: string | null;
    location?: string | null;
    customPitch?: string | null;
    email?: string | null;
    painPoints?: string[] | null;
    digitalGaps?: string[] | null;
    googleRating?: number | null;
    reviewCount?: number | null;
  };
  sender?: {
    name: string;
    email: string;
    phone: string;
    company: string;
  };
  selectedServiceTitle?: string;
  selectedServiceDeliverables?: string[];
  lang?: "de" | "tr" | "en";
  appUrl?: string;
}): { subject: string; bodyText: string; bodyHtml: string } {
  const companyName = lead.company || lead.name || (lang === "de" ? "Ihr Unternehmen" : "Şirketiniz");
  const rawPersonName = lead.decisionMakerName || lead.name || "";
  
  // Soyadı ayrıştırma (Örn: Dr. Stefan Weber -> Weber)
  const nameParts = rawPersonName.trim().split(" ");
  const decisionMakerLastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : rawPersonName;
  const decisionMakerName = rawPersonName || (lang === "de" ? "Damen und Herren" : "Yetkili");
  const city = lead.location || (lang === "de" ? "Ihrer Region" : "bölgeniz");

  // AI Analiz Özeti ve Tespitleri
  const detectedPain = (lead.painPoints && lead.painPoints.length > 0)
    ? lead.painPoints[0]
    : (lead.customPitch || (lang === "de" ? "Verzögerungen bei Kundenrückmeldungen" : "müşteri dönüşlerindeki gecikmeler"));

  const detectedGaps = (lead.digitalGaps && lead.digitalGaps.length > 0)
    ? lead.digitalGaps.join(", ")
    : (lang === "de" ? "fehlende interaktive Buchung / Angebotserstellung" : "eksik interaktif teklif & randevu altyapısı");

  const serviceTitle = selectedServiceTitle || (lang === "de" ? "KI-Automations-Lösung" : "Yapay Zeka Otomasyon Çözümü");
  const serviceBullets = selectedServiceDeliverables && selectedServiceDeliverables.length > 0
    ? selectedServiceDeliverables.map(d => `• ${d}`).join("\n")
    : (lang === "de" ? "• 24/7 KI-Assistent\n• Automatische Termin- & Angebotsübermittlung" : "• 7/24 AI Asistanı\n• Otomatik Randevu & Teklif Entegrasyonu");

  const unsubscribeUrl = `${appUrl}/api/unsubscribe?leadId=${encodeURIComponent(lead.id || "")}&email=${encodeURIComponent(lead.email || "")}`;

  const replaceTags = (text: string) => {
    return text
      .replace(/{{companyName}}/g, companyName)
      .replace(/{{decisionMakerName}}/g, decisionMakerName)
      .replace(/{{decisionMakerLastName}}/g, decisionMakerLastName)
      .replace(/{{city}}/g, city)
      .replace(/{{senderName}}/g, sender.name)
      .replace(/{{senderPhone}}/g, sender.phone)
      .replace(/{{senderEmail}}/g, sender.email)
      .replace(/{{customPitch}}/g, lead.customPitch || "")
      .replace(/{{detectedPain}}/g, detectedPain)
      .replace(/{{detectedGaps}}/g, detectedGaps)
      .replace(/{{serviceTitle}}/g, serviceTitle)
      .replace(/{{serviceBullets}}/g, serviceBullets)
      .replace(/{{unsubscribeLink}}/g, unsubscribeUrl);
  };

  const subject = replaceTags(template.subject);
  let bodyText = replaceTags(template.bodyText);

  // Yasal altbilgi ve Unsubscribe ekleme
  let legalFooter = "";
  if (lang === "de") {
    legalFooter = `\n\n---\nAbmelden: Wenn Sie keine weiteren Nachrichten von mir wünschen, klicken Sie hier: ${unsubscribeUrl}\nImpressum: ${sender.company} | info@starwebflow.com | DSGVO-konform`;
  } else if (lang === "tr") {
    legalFooter = `\n\n---\nBu tarz bilgilendirme mesajları almak istemiyorsanız tek tıkla ayrılabilirsiniz: ${unsubscribeUrl}\nStarWebFlow Teknoloji | Levent, İstanbul`;
  } else {
    legalFooter = `\n\n---\nUnsubscribe: If you do not wish to receive further emails, click here: ${unsubscribeUrl}\n${sender.company} | GDPR compliant`;
  }

  bodyText += legalFooter;

  // Temiz HTML Dönüştürme
  const bodyHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; }
    p { margin-bottom: 16px; font-size: 15px; }
    a { color: #4f46e5; text-decoration: underline; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
    .footer a { color: #94a3b8; text-decoration: underline; }
  </style>
</head>
<body>
  ${bodyText.split('\n\n').map(p => {
    if (p.startsWith('---')) {
      return `<div class="footer">${p.replace('---', '').trim().replace(/\n/g, '<br/>')}</div>`;
    }
    return `<p>${p.replace(/\n/g, '<br/>')}</p>`;
  }).join('')}
</body>
</html>`;

  return { subject, bodyText, bodyHtml };
}
