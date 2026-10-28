export interface ServiceOffer {
  type: "AI_AGENT" | "AI_AUTOMATION" | "WEB_APP" | "ADS" | "AUDIT";
  title: string;
  description: string;
  deliverables: string[];
  estimatedTicket: string;
}

export interface NicheSectorBlueprint {
  id: string;
  category: "HEALTH_WELLNESS" | "LEGAL_FINANCE" | "TRADE_ENERGY" | "B2B_INDUSTRY" | "AUTOMOTIVE_TECH" | "LIFESTYLE_LUXURY";
  nameKey: string;
  titleTr: string;
  titleDe: string;
  titleEn: string;
  badge: string;
  defaultKeywords: {
    de: string[];
    tr: string[];
    en: string[];
  };
  targetRoles: string[];
  primaryPainPoint: string;
  services: ServiceOffer[];
  pitchHooks: {
    de: string;
    tr: string;
    en: string;
  };
}

export interface CountryGeoConfig {
  code: string;
  nameTr: string;
  nameDe: string;
  nameEn: string;
  flag: string;
  topCities: {
    name: string;
    radiusKm: number;
    priority: number; // 1: Büyük Metropol, 2: Sanayi / Bölge Merkezi
  }[];
}

export const COUNTRY_GEO_REGISTRY: CountryGeoConfig[] = [
  {
    code: "DE",
    nameTr: "Almanya",
    nameDe: "Deutschland",
    nameEn: "Germany",
    flag: "🇩🇪",
    topCities: [
      { name: "Berlin", radiusKm: 15, priority: 1 },
      { name: "Hamburg", radiusKm: 15, priority: 1 },
      { name: "München", radiusKm: 15, priority: 1 },
      { name: "Köln", radiusKm: 12, priority: 1 },
      { name: "Frankfurt am Main", radiusKm: 12, priority: 1 },
      { name: "Stuttgart", radiusKm: 12, priority: 1 },
      { name: "Düsseldorf", radiusKm: 10, priority: 1 },
      { name: "Leipzig", radiusKm: 10, priority: 1 },
      { name: "Dortmund", radiusKm: 10, priority: 1 },
      { name: "Essen", radiusKm: 10, priority: 1 },
      { name: "Bremen", radiusKm: 10, priority: 1 },
      { name: "Dresden", radiusKm: 10, priority: 1 },
      { name: "Hannover", radiusKm: 10, priority: 1 },
      { name: "Nürnberg", radiusKm: 10, priority: 1 },
      { name: "Duisburg", radiusKm: 10, priority: 2 },
      { name: "Bochum", radiusKm: 10, priority: 2 },
      { name: "Wuppertal", radiusKm: 10, priority: 2 },
      { name: "Bielefeld", radiusKm: 10, priority: 2 },
      { name: "Bonn", radiusKm: 10, priority: 2 },
      { name: "Münster", radiusKm: 10, priority: 2 },
      { name: "Mannheim", radiusKm: 10, priority: 2 },
      { name: "Karlsruhe", radiusKm: 10, priority: 2 },
      { name: "Augsburg", radiusKm: 10, priority: 2 },
      { name: "Wiesbaden", radiusKm: 10, priority: 2 },
      { name: "Aachen", radiusKm: 10, priority: 2 },
      { name: "Freiburg", radiusKm: 10, priority: 2 },
      { name: "Kiel", radiusKm: 10, priority: 2 },
      { name: "Lübeck", radiusKm: 10, priority: 2 },
      { name: "Erfurt", radiusKm: 10, priority: 2 },
      { name: "Mainz", radiusKm: 10, priority: 2 }
    ]
  },
  {
    code: "TR",
    nameTr: "Türkiye",
    nameDe: "Türkei",
    nameEn: "Turkey",
    flag: "🇹🇷",
    topCities: [
      { name: "İstanbul", radiusKm: 25, priority: 1 },
      { name: "Ankara", radiusKm: 20, priority: 1 },
      { name: "İzmir", radiusKm: 15, priority: 1 },
      { name: "Bursa", radiusKm: 15, priority: 1 },
      { name: "Antalya", radiusKm: 15, priority: 1 },
      { name: "Adana", radiusKm: 12, priority: 1 },
      { name: "Konya", radiusKm: 12, priority: 2 },
      { name: "Gaziantep", radiusKm: 12, priority: 2 },
      { name: "Kocaeli (İzmit)", radiusKm: 12, priority: 1 },
      { name: "Mersin", radiusKm: 10, priority: 2 },
      { name: "Diyarbakır", radiusKm: 10, priority: 2 },
      { name: "Kayseri", radiusKm: 10, priority: 2 },
      { name: "Eskişehir", radiusKm: 10, priority: 2 },
      { name: "Denizli", radiusKm: 10, priority: 2 },
      { name: "Samsun", radiusKm: 10, priority: 2 },
      { name: "Muğla (Bodrum/Fethiye)", radiusKm: 15, priority: 1 },
      { name: "Sakarya", radiusKm: 10, priority: 2 },
      { name: "Tekirdağ", radiusKm: 10, priority: 2 },
      { name: "Trabzon", radiusKm: 10, priority: 2 },
      { name: "Manisa", radiusKm: 10, priority: 2 }
    ]
  },
  {
    code: "AT_CH",
    nameTr: "Avusturya & İsviçre (DACH)",
    nameDe: "Österreich & Schweiz",
    nameEn: "Austria & Switzerland",
    flag: "🇦🇹🇨🇭",
    topCities: [
      { name: "Wien", radiusKm: 15, priority: 1 },
      { name: "Zürich", radiusKm: 15, priority: 1 },
      { name: "Genf", radiusKm: 12, priority: 1 },
      { name: "Basel", radiusKm: 12, priority: 1 },
      { name: "Bern", radiusKm: 10, priority: 1 },
      { name: "Graz", radiusKm: 12, priority: 1 },
      { name: "Linz", radiusKm: 10, priority: 2 },
      { name: "Salzburg", radiusKm: 10, priority: 1 },
      { name: "Innsbruck", radiusKm: 10, priority: 2 },
      { name: "Lausanne", radiusKm: 10, priority: 2 },
      { name: "Luzern", radiusKm: 10, priority: 2 },
      { name: "Klagenfurt", radiusKm: 10, priority: 2 }
    ]
  },
  {
    code: "GB",
    nameTr: "İngiltere (UK)",
    nameDe: "Großbritannien",
    nameEn: "United Kingdom",
    flag: "🇬🇧",
    topCities: [
      { name: "London", radiusKm: 25, priority: 1 },
      { name: "Manchester", radiusKm: 15, priority: 1 },
      { name: "Birmingham", radiusKm: 15, priority: 1 },
      { name: "Leeds", radiusKm: 12, priority: 1 },
      { name: "Glasgow", radiusKm: 12, priority: 1 },
      { name: "Liverpool", radiusKm: 12, priority: 2 },
      { name: "Edinburgh", radiusKm: 12, priority: 1 },
      { name: "Bristol", radiusKm: 10, priority: 2 },
      { name: "Sheffield", radiusKm: 10, priority: 2 },
      { name: "Newcastle", radiusKm: 10, priority: 2 }
    ]
  },
  {
    code: "NL_BE",
    nameTr: "Hollanda & Belçika (Benelux)",
    nameDe: "Niederlande & Belgien",
    nameEn: "Netherlands & Belgium",
    flag: "🇳🇱🇧🇪",
    topCities: [
      { name: "Amsterdam", radiusKm: 15, priority: 1 },
      { name: "Rotterdam", radiusKm: 15, priority: 1 },
      { name: "Den Haag", radiusKm: 12, priority: 1 },
      { name: "Utrecht", radiusKm: 12, priority: 1 },
      { name: "Eindhoven", radiusKm: 12, priority: 1 },
      { name: "Brüssel", radiusKm: 15, priority: 1 },
      { name: "Antwerpen", radiusKm: 15, priority: 1 },
      { name: "Gent", radiusKm: 10, priority: 2 },
      { name: "Brügge", radiusKm: 10, priority: 2 }
    ]
  }
];

export const NICHE_SECTOR_BLUEPRINTS: NicheSectorBlueprint[] = [
  // ==========================================
  // KATEGORİ 1: SAĞLIK, ESTETİK & WELLNESS
  // ==========================================
  {
    id: "dental_clinics",
    category: "HEALTH_WELLNESS",
    nameKey: "dental_clinics",
    titleTr: "Diş Klinikleri & İmplant Merkezleri",
    titleDe: "Zahnarztpraxen & Implantatzentren",
    titleEn: "Dental Clinics & Implant Centers",
    badge: "Yüksek Dönüşüm",
    defaultKeywords: {
      de: ["Zahnarzt", "Zahnklinik", "Implantologie", "Kieferorthopädie"],
      tr: ["Diş Kliniği", "İmplant Merkezi", "Ortodonti", "Diş Hekimi"],
      en: ["Dental Clinic", "Dentist", "Implant Center", "Orthodontics"]
    },
    targetRoles: ["owner", "founder", "managing_director"],
    primaryPainPoint: "Mesai dışı cevapsız kalan acil aramalar ve %20'yi bulan randevuya gelmeme (no-show) oranı.",
    services: [
      {
        type: "AI_AGENT",
        title: "7/24 Sesli & WhatsApp Randevu Asistanı",
        description: "Mesai saatleri dışında ve hekim hastadayken gelen çağrıları karşılar, hasta sorularını yanıtlar ve randevuyu takvime işler.",
        deliverables: ["WhatsApp Business API Entegrasyonu", "Kliniğin Takvimine Otomatik Randevu Kaydı", "Acil Durum Triyajı"],
        estimatedTicket: "€2.500 - €5.000 + €500/ay"
      },
      {
        type: "AI_AUTOMATION",
        title: "No-Show & Google Yorum Toplayıcı Motor",
        description: "Randevudan 24 saat önce otomatik onay ister, randevu sonrası mutlu hastalardan 5 yıldızlı Google yorumu çeker.",
        deliverables: ["2 Aşamalı SMS/WhatsApp Hatırlatma", "Negatif Yorum Filtreleme Ajanı", "CRM Entegrasyonu"],
        estimatedTicket: "€1.500 kurulum"
      },
      {
        type: "WEB_APP",
        title: "İnteraktif Gülüş Tasarımı Ön Değerlendirme Landing Page",
        description: "Hastanın selfie yükleyip tedavi tahmini aldığı yüksek dönüşümlü web arayüzü.",
        deliverables: ["Mobil Uyumlu Next.js Sayfa", "Fotoğraf Yükleme ve Lead Yakalama", "DSGVO Uyumlu KVKK Formu"],
        estimatedTicket: "€3.000 - €6.000"
      }
    ],
    pitchHooks: {
      de: "Sehr geehrte(r) Praxisinhaber(in), wir haben bemerkt, dass Patienten außerhalb Ihrer Sprechzeiten keine Sofort-Termine buchen können. Mit unserem KI-Terminassistenten sichern Sie sich monatlich 15-25 zusätzliche Neupatienten.",
      tr: "Merhaba, kliniğinizin akşam saatlerinde gelen hasta randevu taleplerini kaçırdığını fark ettik. Geliştirdiğimiz 7/24 AI Randevu Asistanı ile randevu kaçırma oranını sıfırlıyoruz.",
      en: "Dear Clinic Director, we noticed patients cannot book after-hours appointments on your website. Our 24/7 AI Receptionist captures 20+ extra high-ticket patients every month."
    }
  },
  {
    id: "hair_transplant_aesthetics",
    category: "HEALTH_WELLNESS",
    nameKey: "hair_transplant_aesthetics",
    titleTr: "Saç Ekimi & Estetik (Sağlık Turizmi)",
    titleDe: "Haartransplantation & Ästhetische Chirurgie",
    titleEn: "Hair Transplant & Plastic Surgery",
    badge: "Sağlık Turizmi",
    defaultKeywords: {
      de: ["Haartransplantation", "Schönheitsklinik", "Plastische Chirurgie"],
      tr: ["Saç Ekimi Merkezi", "Estetik Cerrahi Kliniği", "Sağlık Turizmi Acentesi"],
      en: ["Hair Transplant Clinic", "Plastic Surgery", "Aesthetic Clinic"]
    },
    targetRoles: ["founder", "ceo", "marketing_director"],
    primaryPainPoint: "Yurt dışından (Almanya, İngiltere) gelen lead'lere geç dönülmesi ve niteliksiz mesajlar arasında boğulma.",
    services: [
      {
        type: "AI_AGENT",
        title: "Çok Dilli (Almanca/İngilizce) Fotoğraf Analiz Asistanı",
        description: "Avrupa'dan yazan hastanın saç/vücut fotoğrafını analiz edip tahmini greft sayısı ve paket fiyatını anında sunar.",
        deliverables: ["WhatsApp & Web Entegre Bot", "Otomatik Bütçe & Pasaport Ön Eleme", "Kişiselleştirilmiş PDF Teklif"],
        estimatedTicket: "€4.000 - €8.000"
      },
      {
        type: "ADS",
        title: "Avrupa Hedefli Meta & Google Lead Ads Hunisi",
        description: "Almanya ve İngiltere'deki gurbetçi ve yabancı kitleye yönelik yüksek ROI garantili reklam yönetimi.",
        deliverables: ["Meta Reklam Kampanyası", "Kreatif Video & Görsel Üretimi", "CPA Optimizasyonu"],
        estimatedTicket: "€2.000 / ay + Bütçe"
      }
    ],
    pitchHooks: {
      de: "Hallo, Ihre europäischen Interessenten warten oft Stunden auf ein Angebot. Unser mehrsprachiger KI-Berater erstellt in 60 Sekunden eine personalisierte Vorab-Analyse.",
      tr: "Merhaba, Avrupa'dan kliniğinize gelen mesajlara dakikalar içinde Almanca yanıt veren ve fotoğraf analizi yapan AI asistanımızla satış kapatma oranınızı 2 katına çıkarıyoruz.",
      en: "Hello, your international leads often go cold due to slow response times. Our multi-language AI Consultant qualifies patients and delivers instant photo assessments."
    }
  },
  {
    id: "physiotherapy_osteopathy",
    category: "HEALTH_WELLNESS",
    nameKey: "physiotherapy_osteopathy",
    titleTr: "Fizyoterapi & Osteopati Merkezleri",
    titleDe: "Physiotherapie & Osteopathie Praxen",
    titleEn: "Physiotherapy & Osteopathy Clinics",
    badge: "Personel Tasarrufu",
    defaultKeywords: {
      de: ["Physiotherapie", "Osteopathie", "Krankengymnastik"],
      tr: ["Fizyoterapi Kliniği", "Osteopati Merkezi", "Manuel Terapi"],
      en: ["Physiotherapy", "Osteopathy", "Physical Therapy"]
    },
    targetRoles: ["owner", "managing_partner"],
    primaryPainPoint: "Terapistler hasta tedavisindeyken çalan telefonlara bakılamaması ve reçete (Rezept) takibinin elle yapılması.",
    services: [
      {
        type: "AI_AGENT",
        title: "Sesli KI-Telefon Asistanı (Telefonzentrale)",
        description: "Tedavi sırasında arayan hastaları karşılar, reçete detaylarını kaydeder ve boş saatlere randevu verir.",
        deliverables: ["VoIP / SIP Santral Entegrasyonu", "Sesli Yapay Zeka Ajanı", "Takvim Senkronizasyonu"],
        estimatedTicket: "€2.000 - €4.500"
      }
    ],
    pitchHooks: {
      de: "Guten Tag, wenn Sie in der Behandlung sind, geht oft der Anrufbeantworter an. Unsere KI nimmt das Gespräch wie eine Rezeptionistin an und bucht direkt Termine.",
      tr: "Merhaba, seans sırasındayken çalan telefonları cevapsız bırakmayın. Akıllı sesli asistanımız hastalarınızı karşılayıp takviminizi otomatik doldursun.",
      en: "Hello, missed calls during patient therapy sessions mean lost revenue. Our AI Voice Receptionist answers calls naturally and books appointments 24/7."
    }
  },
  {
    id: "eye_laser_centers",
    category: "HEALTH_WELLNESS",
    nameKey: "eye_laser_centers",
    titleTr: "Göz Lazer & Katarakt Merkezleri",
    titleDe: "Augenlaserzentren & Augenärzte",
    titleEn: "Laser Eye Surgery & Ophthalmology",
    badge: "Yüksek Gelir",
    defaultKeywords: {
      de: ["Augenlasern", "Augenarzt", "Femto-LASIK", "Katarakt"],
      tr: ["Göz Lazer Merkezi", "Göz Doktoru", "Lasik Tedavisi"],
      en: ["Laser Eye Surgery", "Ophthalmologist", "LASIK Center"]
    },
    targetRoles: ["managing_director", "owner"],
    primaryPainPoint: "Hastaların operasyon korkusu ve yüksek fiyat sebebiyle bilgi alıp randevu almadan siteden ayrılması.",
    services: [
      {
        type: "WEB_APP",
        title: "Göz Lazer Uygunluk & Maliyet Simülatörü",
        description: "Hastanın gözlük numarasını girip 30 saniyede operasyona uygunluğunu öğrendiği interaktif funnel.",
        deliverables: ["Etkileşimli Uygunluk Testi", "Otomatik SMS/Email Bilgilendirme Raporu", "CRM Lead Aktarımı"],
        estimatedTicket: "€3.500 - €7.000"
      }
    ],
    pitchHooks: {
      de: "Sehr geehrtes Team, viele Besucher verlassen Ihre Website aus Unsicherheit. Unser interaktiver LASIK-Eignungstest qualifiziert Interessenten vorab.",
      tr: "Göz lazeri düşünen hastaların %70'i siteden bilgi alamadan çıkıyor. İnteraktif uygunluk simülatörümüzle web sitenizi hasta mıknatısına çevirelim.",
      en: "Patients hesitate before booking LASIK surgery. Our interactive AI Suitability Checker qualifies visitors and converts them into booked consultations."
    }
  },
  {
    id: "veterinary_hospitals",
    category: "HEALTH_WELLNESS",
    nameKey: "veterinary_hospitals",
    titleTr: "Veteriner Klinikleri & Hayvan Hastaneleri",
    titleDe: "Tierarztpraxen & Tierkliniken",
    titleEn: "Veterinary Clinics & Animal Hospitals",
    badge: "Tekrarlayan Gelir",
    defaultKeywords: {
      de: ["Tierarzt", "Tierklinik", "Kleintierpraxis"],
      tr: ["Veteriner Kliniği", "Hayvan Hastanesi", "Veteriner Hekim"],
      en: ["Veterinary Clinic", "Animal Hospital", "Vet Practice"]
    },
    targetRoles: ["owner", "managing_partner"],
    primaryPainPoint: "Rutin aşı, parazit ve kontrol takiplerinin elle unutulması, acil gece çağrılarının yönetilememesi.",
    services: [
      {
        type: "AI_AUTOMATION",
        title: "Otonom Aşı & Kontrol Hatırlatma Motoru",
        description: "Hasta kayıt sisteminden aşı tarihi yaklaşan evcil hayvan sahiplerine kişiselleştirilmiş WhatsApp hatırlatması yollar.",
        deliverables: ["Hasta Veritabanı Entegrasyonu", "Otomatik Randevu Linki Gönderimi", "Aşı Karnesi Dijital Bildirimi"],
        estimatedTicket: "€1.800 + Aylık Bakım"
      }
    ],
    pitchHooks: {
      de: "Hallo, manuelle Impferinnerungen kosten viel Zeit. Unser System erinnert Tierhalter vollautomatisch per WhatsApp und füllt Ihren Kalender verlässlich.",
      tr: "Kliniğinizdeki aşı ve parazit hatırlatmalarını otomatikleştirelim; hem hasta sadakati artsın hem de her ay düzenli randevu akışı oluşsun.",
      en: "Automate pet vaccination and check-up reminders via WhatsApp, keeping your appointment calendar consistently full with zero staff effort."
    }
  },
  {
    id: "psychotherapy_coaching",
    category: "HEALTH_WELLNESS",
    nameKey: "psychotherapy_coaching",
    titleTr: "Psikoterapi & Yönetici Koçluğu Merkezleri",
    titleDe: "Psychotherapie & Executive Coaching",
    titleEn: "Psychotherapy & Executive Coaching",
    badge: "DSGVO / KVKK Odaklı",
    defaultKeywords: {
      de: ["Psychotherapie", "Coaching", "Supervision", "Psychologe"],
      tr: ["Psikoterapi Merkezi", "Yönetici Koçluğu", "Klinik Psikolog"],
      en: ["Psychotherapy", "Executive Coaching", "Counseling"]
    },
    targetRoles: ["founder", "owner"],
    primaryPainPoint: "Bekleme listelerinin dağınıklığı, danışan ön elemesinin vakit alması ve KVKK/DSGVO gizlilik hassasiyeti.",
    services: [
      {
        type: "WEB_APP",
        title: "DSGVO Uyumlu Dijital Ön Kabul & Eşleştirme Portalı",
        description: "Danışanların ihtiyaçlarını güvenli şekilde ilettiği, uygun terapistle eşleştiği şifreli portal.",
        deliverables: ["Uçtan Uca Şifreli Form Altyapısı", "Otomatik Bekleme Listesi Yönetimi", "Online Ödeme & Fatura"],
        estimatedTicket: "€2.800 - €5.500"
      }
    ],
    pitchHooks: {
      de: "Guten Tag, Ihre Warteliste manuell zu pflegen bindet wertvolle Ressourcen. Unser DSGVO-konformes Intake-Portal strukturiert Anfragen vollautomatisch.",
      tr: "Danışan ön görüşme ve bekleme listesi süreçlerinizi KVKK tam uyumlu dijital ön kabul portalıyla otomatikleştirin.",
      en: "Streamline client intake and waitlist management with a secure, GDPR-compliant onboarding portal built for mental health professionals."
    }
  },

  // ==========================================
  // KATEGORİ 2: HUKUK, FİNANS & DANIŞMANLIK
  // ==========================================
  {
    id: "labor_law_firms",
    category: "LEGAL_FINANCE",
    nameKey: "labor_law_firms",
    titleTr: "İş Hukuku & Tazminat Avukatları",
    titleDe: "Fachanwälte für Arbeitsrecht (Kündigung & Abfindung)",
    titleEn: "Employment & Labor Law Firms",
    badge: "Acil Dava Aksiyonu",
    defaultKeywords: {
      de: ["Arbeitsrecht", "Kündigungsschutz", "Abfindung", "Fachanwalt Arbeitsrecht"],
      tr: ["İş Hukuku Avukatı", "Kıdem Tazminatı", "İşe İade Davası"],
      en: ["Employment Lawyer", "Labor Law Firm", "Severance Pay"]
    },
    targetRoles: ["managing_partner", "founder", "owner"],
    primaryPainPoint: "İşten çıkarılan çalışanların 3 haftalık yasal süresi olması, hızlı ve kolay başvuru arayışında bulunmaları.",
    services: [
      {
        type: "AI_AGENT",
        title: "Tazminat Hesaplama & Hızlı Dava Kabul Asistanı",
        description: "İşten çıkarılan kişinin maaş ve kıdemine göre tahmini tazminatı hesaplar, vekaletname evraklarını toplayıp avukata iletir.",
        deliverables: ["Abfindungsrechner Web Aracı", "Otomatik Dava Ön Özeti Çıkarıcı AI", "Vekaletname Dijital İmza"],
        estimatedTicket: "€3.500 - €7.500"
      }
    ],
    pitchHooks: {
      de: "Sehr geehrte Kolleginnen und Kollegen, gekündigte Arbeitnehmer suchen schnelle Gewissheit. Unser digitaler Abfindungs-Rechner generiert Ihnen monatlich 20+ abschlussbereite Mandate.",
      tr: "İşten çıkarılan çalışanlar internette tazminat hesaplatmak istiyor. Büronuza entegre edeceğimiz Tazminat Hesaplama Botu ile müvekkil dosya sayınızı ikiye katlayın.",
      en: "Terminated employees seek instant severance estimates. Our AI Severance Calculator captures and pre-qualifies qualified litigation leads directly for your firm."
    }
  },
  {
    id: "traffic_law_firms",
    category: "LEGAL_FINANCE",
    nameKey: "traffic_law_firms",
    titleTr: "Trafik & Ceza Hukuku Avukatları",
    titleDe: "Verkehrsrecht & Bußgeld-Kanzleien",
    titleEn: "Traffic & Penalty Law Firms",
    badge: "Yüksek Dosya Hacmi",
    defaultKeywords: {
      de: ["Verkehrsrecht", "Bußgeldbescheid", "Blitzer Einspruch", "Fahrverbot"],
      tr: ["Trafik Kazası Avukatı", "Değer Kaybı Davası", "Ceza Avukatı"],
      en: ["Traffic Lawyer", "Speeding Ticket Defense", "Accident Claims"]
    },
    targetRoles: ["managing_partner", "founder"],
    primaryPainPoint: "Yüzlerce ceza ve itiraz dosyasının manuel incelenmesi ve evrak kontrolünün vakit alması.",
    services: [
      {
        type: "AI_AUTOMATION",
        title: "Ceza Kağıdı OCR & Otomatik İtiraz Dilekçesi Motoru",
        description: "Müvekkilin fotoğrafını çektiği ceza kağıdından (Bußgeldbescheid) ceza puanını okur ve itiraz taslağı hazırlar.",
        deliverables: ["Mobil Evrak Tarama OCR", "Otomatik Hata/Zamanaşımı Kontrolü", "Sigorta (Rechtsschutz) Sorgulama"],
        estimatedTicket: "€4.000 - €9.000"
      }
    ],
    pitchHooks: {
      de: "Guten Tag, automatisieren Sie die Annahme von Bußgeldfällen: Mandanten laden den Bescheid per Smartphone hoch, Ihre Kanzlei erhält die fertige Akte.",
      tr: "Trafik cezası ve değer kaybı itiraz evraklarını tek tıkla dijital ortamda toplayın, yapay zeka itiraz taslağını saniyeler içinde hazırlasın.",
      en: "Automate traffic ticket intake: clients upload ticket photos, AI extracts violation data and drafts defense filings automatically."
    }
  },
  {
    id: "tax_advisors_cpa",
    category: "LEGAL_FINANCE",
    nameKey: "tax_advisors_cpa",
    titleTr: "Yeminli Mali Müşavirler & Vergi Büroları",
    titleDe: "Steuerberater & Wirtschaftsprüfer",
    titleEn: "Tax Advisors & CPA Firms",
    badge: "Premium B2B",
    defaultKeywords: {
      de: ["Steuerberater", "Steuerkanzlei", "Finanzbuchhaltung", "Jahresabschluss"],
      tr: ["Mali Müşavir", "Yeminli Mali Müşavir", "Vergi Danışmanı"],
      en: ["Tax Advisor", "CPA Firm", "Accounting Firm"]
    },
    targetRoles: ["managing_partner", "owner"],
    primaryPainPoint: "Kapasitelerinin dolu olması ancak düşük karlı mikro müşteriler yüzünden yüksek cirolu şirketlere vakit ayıramamaları.",
    services: [
      {
        type: "AI_AGENT",
        title: "B2B Müşteri Eleme & Dijital Evrak Karşılama Botu",
        description: "Yeni başvuran şirketlerin yıllık cirosunu ve sektörünü analiz eder, sadece karlı B2B şirketleri danışmana aktarır.",
        deliverables: ["Akıllı Müşteri Filtresi (Pre-Qualification)", "Ay Sonu Evrak Hatırlatıcı Otomasyonu", "DATEV / Muhasebe Uyumlu API"],
        estimatedTicket: "€3.000 - €6.000"
      }
    ],
    pitchHooks: {
      de: "Sehr geehrte(r) Steuerberater(in), beenden Sie zeitraubende Erstgespräche mit unrentablen Mandanten. Unser KI-Filter qualifiziert nur Unternehmen ab 500k€ Umsatz vor.",
      tr: "Düşük karlı küçük işlerle vakit kaybetmeyin. Büronuza kuracağımız akıllı ön eleme asistanı ile sadece yüksek cirolu kurumsal şirketleri portföyünüze katın.",
      en: "Stop wasting billable hours on unprofitable client inquiries. Our AI Intake Agent filters and qualifies only high-revenue corporate clients."
    }
  },
  {
    id: "luxury_real_estate",
    category: "LEGAL_FINANCE",
    nameKey: "luxury_real_estate",
    titleTr: "Lüks Konut & Ticari Gayrimenkul Ajansları",
    titleDe: "Immobilienmakler & Luxusimmobilien",
    titleEn: "Luxury Real Estate & Commercial Brokerages",
    badge: "Yüksek Komisyon",
    defaultKeywords: {
      de: ["Immobilienmakler", "Luxusimmobilien", "Gewerbeimmobilien", "Villa kaufen"],
      tr: ["Lüks Gayrimenkul", "Gayrimenkul Danışmanı", "Villa Satılık", "Ticari Emlak"],
      en: ["Luxury Real Estate", "Real Estate Broker", "Commercial Property"]
    },
    targetRoles: ["founder", "ceo", "sales_director"],
    primaryPainPoint: "İlan portallarından gelen yüzlerce meraklı ve bütçesi yetersiz kişiyle saatlerce telefon görüşmesi yapılması.",
    services: [
      {
        type: "AI_AGENT",
        title: "WhatsApp VIP Virtual Broker & Bütçe Doğrulayıcı",
        description: "Portföydeki gayrimenkulleri müşterinin bütçesine göre eşleştirir, PDF broşür gönderir ve bütçesi onaylananları danışmana bağlar.",
        deliverables: ["WhatsApp Entegre Portföy Ajanı", "Alıcı Finansal Ön Onay Formu", "Sanal Tur Entegrasyonu"],
        estimatedTicket: "€3.500 - €8.000 + Başarı Primi"
      }
    ],
    pitchHooks: {
      de: "Guten Tag, filtern Sie unqualifizierte Immobilieninteressenten vollautomatisch aus. Unser KI-Maklerassistent qualifiziert Kapitalanleger vor der Besichtigung.",
      tr: "İlan sitelerinden gelen bütçesi yetersiz aramalarla vakit kaybetmeyin. Sanal brokerımız gerçek alıcıları filtreleyip sadece ciddi alıcılarla randevu ayarlasın.",
      en: "Stop hosting showings for unqualified tire-kickers. Our WhatsApp Virtual Broker pre-qualifies high-net-worth buyers before scheduling private viewings."
    }
  },
  {
    id: "mortgage_financing_brokers",
    category: "LEGAL_FINANCE",
    nameKey: "mortgage_financing_brokers",
    titleTr: "Konut Kredisi & Mortgage Finansman Danışmanları",
    titleDe: "Baufinanzierungsberater & Kreditvermittler",
    titleEn: "Mortgage Brokers & Loan Advisors",
    badge: "Hızlı Onay",
    defaultKeywords: {
      de: ["Baufinanzierung", "Immobilienkredit", "Baukredit Rechner"],
      tr: ["Konut Kredisi Danışmanı", "Mortgage Uzmanı", "Kredi Danışmanlığı"],
      en: ["Mortgage Broker", "Home Loan Advisor", "Financing Consultant"]
    },
    targetRoles: ["owner", "managing_director"],
    primaryPainPoint: "Müşterilerin eksik evrak getirmesi sebebiyle banka onay süreçlerinin haftalarca tıkanması.",
    services: [
      {
        type: "AI_AUTOMATION",
        title: "Kredi Uygunluk & Dijital Evrak Tamamlama Motoru",
        description: "Müşterinin maaş bordrosu ve özkaynağına göre banka faiz simülasyonu yapar, eksik evrakları WhatsApp üzerinden adım adım toplayıp dosyayı hazırlar.",
        deliverables: ["Online Kredi Faiz Hesaplayıcı", "WhatsApp Evrak Toplayıcı Bot", "Banka Dosya Hazırlama Motoru"],
        estimatedTicket: "€3.000 - €6.500"
      }
    ],
    pitchHooks: {
      de: "Hallo, unvollständige Kreditunterlagen verzögern Bankzusagen wochenlang. Unser digitaler Assistent sammelt Gehaltsnachweise automatisch per Chatbot ein.",
      tr: "Kredi başvurularındaki eksik evrak toplama çilesine son verin. Akıllı botumuz müşterinizden bordro ve tapu evraklarını otomatik toplayıp bankaya hazır dosya üretsin.",
      en: "Speed up mortgage approvals by days. Our automated document collection bot chases pay slips and tax filings directly through WhatsApp."
    }
  },

  // ==========================================
  // KATEGORİ 3: YENİLENEBİLİR ENERJİ, İKLİMLENDİRME & ZANAAT
  // ==========================================
  {
    id: "solar_photovoltaic",
    category: "TRADE_ENERGY",
    nameKey: "solar_photovoltaic",
    titleTr: "Güneş Enerjisi (Solar) & Fotovoltaik Kurulumcuları",
    titleDe: "Photovoltaik & Solaranlagen Fachbetriebe",
    titleEn: "Solar PV Installation Companies",
    badge: "Yüksek Ticket",
    defaultKeywords: {
      de: ["Photovoltaik", "Solaranlage", "PV Anlage Montage", "Solarstrom Speicher"],
      tr: ["Güneş Enerjisi Sistemleri", "GES Kurulumu", "Çatı GES", "Solar Panel"],
      en: ["Solar Panel Installation", "Commercial Solar", "Photovoltaic Installer"]
    },
    targetRoles: ["founder", "owner", "sales_director"],
    primaryPainPoint: "Keşfe gidilen çatıların uygun çıkmaması, teklif hazırlama sürecinin 3-5 gün sürmesi ve müşterinin soğuması.",
    services: [
      {
        type: "WEB_APP",
        title: "Uydu Destekli Çatı & Yıllık Tasarruf Konfigüratörü",
        description: "Müşteri adresini girer, harita üzerinden çatısını çizer, sistem elektrik tüketimine göre anında 10 sayfalık PDF teklif üretir.",
        deliverables: ["Google Maps Tabanlı Çatı Çizim Aracı", "Otomatik Amortisman & Tasarruf Hesaplayıcı", "CRM Senkronizasyonu"],
        estimatedTicket: "€4.500 - €9.500"
      },
      {
        type: "ADS",
        title: "Bölgesel Ev Sahibi Odaklı Meta & Google Lead Hunisi",
        description: "Sadece müstakil ev sahiplerini hedefleyen, çatı fotoğrafı yükleten yüksek kaliteli lead kampanyası.",
        deliverables: ["Hedefli Reklam Kampanyası", "CPA Optimizasyonu", "Haftalık 30+ Nitelikli Randevu"],
        estimatedTicket: "€2.500 / ay"
      }
    ],
    pitchHooks: {
      de: "Sehr geehrte Damen und Herren, verringern Sie Ihre Vor-Ort-Fehlfahrten. Mit unserem Satelliten-Dachrechner erhalten Interessenten in 60 Sekunden ein personalisiertes Ertragsangebot.",
      tr: "Uygun olmayan çatılara keşfe gidip zaman kaybetmeyin. Web sitenize kuracağımız uydu destekli çatı hesaplayıcı ile müşteriye anında teklif verip imzayı attırın.",
      en: "Eliminate wasted on-site roof inspections. Our interactive satellite solar calculator delivers accurate feasibility quotes in 60 seconds."
    }
  },
  {
    id: "hvac_heatpumps",
    category: "TRADE_ENERGY",
    nameKey: "hvac_heatpumps",
    titleTr: "Isı Pompası & İklimlendirme (HVAC)",
    titleDe: "Wärmepumpen & Heizungsbau Fachbetriebe",
    titleEn: "Heat Pump & HVAC Contractors",
    badge: "Sürekli Talep",
    defaultKeywords: {
      de: ["Wärmepumpe", "Heizungsbau", "Klimaanlage", "Heizungstausch Förderung"],
      tr: ["Isı Pompası", "HVAC Sistemleri", "Klima Montajı", "Merkezi Isıtma"],
      en: ["Heat Pump Installation", "HVAC Contractor", "Heating System"]
    },
    targetRoles: ["owner", "managing_director"],
    primaryPainPoint: "Yeni enerji yasaları ve devlet hibe teşvikleri (KfW / BAFA) konusunda müşterilerin kafasının karışık olması.",
    services: [
      {
        type: "AI_AGENT",
        title: "Bina Isı Pompası & Devlet Hibesi (Förderung) Danışmanı",
        description: "Bina yaşı ve radyatör tipine göre alabileceği maksimum devlet hibesini hesaplar, keşif randevusunu organize eder.",
        deliverables: ["Hibe Uygunluk Hesaplama Ajanı", "Eski Isıtma Cihazı Fotoğraf Yükleme Modülü", "Takvim Entegrasyonu"],
        estimatedTicket: "€3.000 - €6.000"
      }
    ],
    pitchHooks: {
      de: "Guten Tag, Kunden sind von den neuen Heizungsgesetzen verunsichert. Unser Förder-Assistent berechnet Hausbesitzern die maximale staatliche Förderung und bucht den Vor-Ort-Termin.",
      tr: "Müşteriler ısı pompası maliyeti ve hibe destekleri konusunda kararsız. Web sitenize ekleyeceğimiz akıllı hibe asistanı ile kararsız müşterileri sözleşmeye çevirin.",
      en: "Homeowners struggle with complex heat pump subsidies. Our AI Subsidy Calculator clarifies incentives and books ready-to-buy installation consultations."
    }
  },
  {
    id: "roofing_insulation",
    category: "TRADE_ENERGY",
    nameKey: "roofing_insulation",
    titleTr: "Çatı Ustaları & İzolasyon (Dachdecker)",
    titleDe: "Dachdecker & Fassadenbau Fachbetriebe",
    titleEn: "Roofing & Insulation Contractors",
    badge: "Acil Çağrı",
    defaultKeywords: {
      de: ["Dachdecker", "Dachsanierung", "Sturmschaden Dach", "Dachdämmung"],
      tr: ["Çatı Ustası", "Çatı İzolasyonu", "Çatı Tamiri"],
      en: ["Roofing Contractor", "Roof Repair", "Insulation Specialist"]
    },
    targetRoles: ["owner", "managing_partner"],
    primaryPainPoint: "Usta çatıda çalışırken telefonlara bakamaması ve fırtına sonrası oluşan acil tamir taleplerinin kaçması.",
    services: [
      {
        type: "AI_AGENT",
        title: "Sesli Fırtına Hasarı & Acil Durum Karşılama Asistanı",
        description: "Fırtına ve su sızıntısı durumlarında arayanları karşılar, adresi ve hasar büyüklüğünü sesli kaydedip ustaya anlık bildirim atar.",
        deliverables: ["7/24 Sesli Çağrı Karşılama", "WhatsApp Hasar Bildirim Ajanı", "Sigorta Raporu Taslak Motoru"],
        estimatedTicket: "€2.200 - €4.500"
      }
    ],
    pitchHooks: {
      de: "Hallo, wenn Sie auf dem Dach arbeiten, verpassen Sie lukrative Aufträge. Unser KI-Sprachassistent nimmt jeden Anruf an und erfasst Sturmschäden sofort.",
      tr: "Çatıdayken çalan telefonları kaçırmayın. Sesli yapay zeka asistanımız hasar detaylarını müşteriden alsın, siz sadece gidip işi teslim edin.",
      en: "Never miss an emergency roof repair call while working up on a roof. Our AI Voice Bot captures damage specs and dispatches quotes automatically."
    }
  },

  // ==========================================
  // KATEGORİ 4: YENİ NESİL OTOMOTİV & MOBİLİTE TEKNOLOJİLERİ
  // ==========================================
  {
    id: "ev_charging_infrastructure",
    category: "AUTOMOTIVE_TECH",
    nameKey: "ev_charging_infrastructure",
    titleTr: "EV Şarj İstasyonu & Altyapı Kurulumcuları",
    titleDe: "Ladeinfrastruktur & Wallbox Fachbetriebe",
    titleEn: "EV Charging Infrastructure & Wallbox Installers",
    badge: "Megatrend EV",
    defaultKeywords: {
      de: ["Wallbox Installation", "Ladeinfrastruktur Gewerbe", "Ladesäule Elektroauto", "Ladepark"],
      tr: ["Elektrikli Araç Şarj İstasyonu", "Wallbox Kurulumu", "Şarj Ağı Kurulumu", "Ticari Şarj İstasyonu"],
      en: ["EV Charger Installation", "Commercial EV Charging", "Wallbox Installer", "Fleet Electrification"]
    },
    targetRoles: ["founder", "ceo", "managing_director"],
    primaryPainPoint: "Filo yöneticileri ve sitelerin elektrik gücü kapasitesini bilmemesi ve teklif hazırlama sürecinin 1 haftayı bulması.",
    services: [
      {
        type: "WEB_APP",
        title: "Filo & Site EV Şarj Altyapısı Simülatörü",
        description: "Müşteri bina gücünü ve araç sayısını girer, sistem dinamik yük yönetimi (Load Management) ihtiyacını ve hibe desteğini anında hesaplar.",
        deliverables: ["B2B Güç Kapasite Hesaplayıcı Web App", "Şebeke Operatörü Başvuru Evrak Motoru", "Kurumsal Teklif Şablonu"],
        estimatedTicket: "€4.000 - €8.500"
      },
      {
        type: "AI_AGENT",
        title: "B2B Filo Elektriklendirme Danışmanı (Web/WhatsApp)",
        description: "Şirket araç filolarını benzin/dizelden elektriğe geçirirken yıllık yakıt ve vergi tasarrufunu gösteren etkileşimli danışman.",
        deliverables: ["Filo TCO (Toplam Sahip Olma Maliyeti) Hesaplayıcı", "B2B Lead Nitelendirme", "Takvim Rezervasyonu"],
        estimatedTicket: "€2.500 kurulum"
      }
    ],
    pitchHooks: {
      de: "Sehr geehrte(r) Geschäftsführer(in), Unternehmen möchten ihre Flotten elektrifizieren, wissen aber nicht, ob der Hausanschluss reicht. Unser KI-Lastmanagement-Kalkulator generiert Ihnen vorqualifizierte B2B-Großaufträge.",
      tr: "Kurumsal şirketler araç filolarını elektriğe geçirirken altyapı kapasitesini kestiremiyor. Geliştirdiğimiz B2B Şarj Simülatörü ile kurumsal filo tekliflerinizi 2 dakikada hazırlayın.",
      en: "Fleet managers struggle to size EV charging infrastructure against grid capacity. Our interactive B2B EV Simulator qualifies fleet managers and outputs complete load-management proposals in minutes."
    }
  },
  {
    id: "ev_battery_repair",
    category: "AUTOMOTIVE_TECH",
    nameKey: "ev_battery_repair",
    titleTr: "EV Batarya Onarım, Teşhis & 2. Ömür Dönüşüm",
    titleDe: "E-Auto Akku Reparatur & Zellentausch Spezialisten",
    titleEn: "EV Battery Repair & Remanufacturing Centers",
    badge: "Yüksek Marj",
    defaultKeywords: {
      de: ["Akku Reparatur E-Auto", "Hochvoltbatterie Reparatur", "Batteriediagnose SoH", "Zellentausch Tesla"],
      tr: ["Elektrikli Araç Batarya Tamiri", "Batarya Hücre Değişimi", "Batarya Sağlık Testi (SoH)"],
      en: ["EV Battery Repair", "High Voltage Battery Service", "Battery Cell Replacement"]
    },
    targetRoles: ["owner", "managing_partner"],
    primaryPainPoint: "Yetkili servislerin komple batarya değişimi için 20.000€ istemesi ancak bağımsız onarım merkezlerinin dijitalde bulunamaması.",
    services: [
      {
        type: "AI_AGENT",
        title: "Batarya Arıza Teşhis & Tahmini Onarım Botu",
        description: "Araç sahibinin hata kodunu veya arıza uyarısını okur, komple değişim yerine tahmini modül onarım fiyatı vererek servise randevu oluşturur.",
        deliverables: ["Hata Kodu (DTC) Kütüphanesi Entegre Bot", "Onarım vs Sıfır Fiyat Kıyaslama Motoru", "Servis Çekici/Randevu Formu"],
        estimatedTicket: "€3.500 - €7.000"
      }
    ],
    pitchHooks: {
      de: "Guten Tag, Vertragswerkstätten verlangen 20.000€ für Batterietausch, während Sie Zellen reparieren können. Unser Diagnose-Funnel bringt verzweifelte E-Auto-Besitzer direkt zu Ihnen.",
      tr: "Yetkili servislerin afaki batarya değişim fiyatlarından kaçan araç sahiplerine ulaşın. Hata kodunu yükleyen müşteriye anında onarım teklifi sunan akıllı huni.",
      en: "Dealerships charge $20k for full battery swaps while your shop can repair individual modules. Capture these high-margin repair jobs with an automated DTC Diagnostic Funnel."
    }
  },
  {
    id: "ai_car_inspection_damage",
    category: "AUTOMOTIVE_TECH",
    nameKey: "ai_car_inspection_damage",
    titleTr: "Yeni Nesil Oto Ekspertiz & AI Hasar Tespiti",
    titleDe: "KfZ-Gutachter & Digitale Schadengutachten",
    titleEn: "AI Vehicle Inspection & Damage Assessment",
    badge: "Sigorta & Değerleme",
    defaultKeywords: {
      de: ["Kfz Gutachter", "Schadengutachten Auto", "Unfallgutachten", "Fahrzeugbewertung"],
      tr: ["Oto Ekspertiz", "Kaza Değer Kaybı", "Hasar Tespiti", "Mobil Ekspertiz"],
      en: ["Vehicle Damage Appraisal", "Car Inspection", "Accident Valuation"]
    },
    targetRoles: ["founder", "owner"],
    primaryPainPoint: "Kaza yapan sürücülerin eksper çağırmak için günlerce beklemesi ve sigorta evraklarının karmaşık olması.",
    services: [
      {
        type: "WEB_APP",
        title: "Fotoğraftan AI Hasar & Değer Kaybı Ön Tespit Portalı",
        description: "Kaza yapan sürücü hasarlı bölgenin fotoğrafını çeker, AI hasar şiddetini puanlar ve ücretsiz bağımsız eksper randevusu oluşturur.",
        deliverables: ["Mobil Fotoğraf Yükleme ve Hasar Analizi", "Değer Kaybı Hak Hesaplayıcı", "Sigorta Şirketi Bildirim Taslağı"],
        estimatedTicket: "€3.500 - €7.500"
      }
    ],
    pitchHooks: {
      de: "Hallo, Unfallopfer wissen oft nicht, dass das Gutachten für sie kostenlos ist. Unser KI-Schadenmelder lässt Fahrer Fotos hochladen und generiert Ihnen fertige Gutachter-Aufträge.",
      tr: "Kaza yapan sürücüler haklarını bilmiyor. Fotoğraf yükletip anında değer kaybı potansiyelini gösteren akıllı portal ile eksper ve değer kaybı dosyalarınızı 3 katına çıkarın.",
      en: "Accident victims are unaware they are entitled to independent inspection. Capture high-paying appraisal claims by offering instant photo-based damage assessments."
    }
  },
  {
    id: "fleet_telematics_iot",
    category: "AUTOMOTIVE_TECH",
    nameKey: "fleet_telematics_iot",
    titleTr: "Filo Takip, Telematik & Akıllı Araç Yönetimi (Fleet IoT)",
    titleDe: "Flottentelematik & GPS-Fuhrparkmanagement",
    titleEn: "Fleet Telematics & IoT Asset Tracking",
    badge: "B2B SaaS / IoT",
    defaultKeywords: {
      de: ["Flottenmanagement Software", "GPS Fuhrpark", "Telematik B2B", "Fahrtenbuch digital"],
      tr: ["Filo Takip Sistemi", "Araç Takip Cihazı", "Dijital Takograf", "Yakıt Yönetimi"],
      en: ["Fleet Telematics", "GPS Fleet Tracking", "Fleet Management Software"]
    },
    targetRoles: ["ceo", "coo", "sales_director"],
    primaryPainPoint: "Lojistik ve servis firmalarına telematik satarken yakıt ve bakım tasarrufunu somut olarak ispatlamanın zor olması.",
    services: [
      {
        type: "AI_AGENT",
        title: "Filo Yakıt & ROI Tasarruf Simülatörü B2B Ajanı",
        description: "Filodaki araç tipi ve aylık kilometreye göre kaçak yakıt ve rölanti tasarrufunu hesaplar, 14 günlük ücretsiz demo cihazı başvurusunu alır.",
        deliverables: ["B2B ROI Hesaplama Widget'ı", "Otomatik Demo Cihazı Sözleşme Motoru", "Kurumsal Satış Sekansı"],
        estimatedTicket: "€3.000 - €6.500"
      }
    ],
    pitchHooks: {
      de: "Sehr geehrte(r) Vertriebsleiter(in), Fuhrparkleiter kaufen erst, wenn sie harte Zahlen sehen. Unser ROI-Simulator berechnet Flottenbetreibern die exakte Ersparnis und bucht qualifizierte Demos.",
      tr: "Lojistik yöneticileri ezbere teklif istemez. Filodaki araç sayısına göre yıllık yakıt ve amortisman tasarrufunu gösteren etkileşimli simülatörümüzle demo satışlarınızı patlatın.",
      en: "Fleet directors only buy when presented with concrete savings. Our B2B Fuel ROI Calculator generates qualified demo requests from verified fleet operators."
    }
  },
  {
    id: "car_wrapping_ppf",
    category: "AUTOMOTIVE_TECH",
    nameKey: "car_wrapping_ppf",
    titleTr: "Araç Kaplama, PPF (Boya Koruma) & Detailing Stüdyoları",
    titleDe: "Fahrzeugfolierung & Lackschutz (PPF) Studios",
    titleEn: "Car Wrapping, Paint Protection Film (PPF) & Detailing",
    badge: "Lüks Otomotiv",
    defaultKeywords: {
      de: ["Fahrzeugfolierung", "Lackschutzfolie PPF", "Car Wrapping", "Keramikversiegelung"],
      tr: ["PPF Kaplama", "Araç Kaplama", "Boya Koruma Filmi", "Seramik Kaplama"],
      en: ["Car Wrapping", "Paint Protection Film", "PPF Installer", "Ceramic Coating"]
    },
    targetRoles: ["owner", "founder"],
    primaryPainPoint: "Müşterilerin 'Fiyat ne kadar?' diye sorup günlerce geri dönmemesi, araç segmentine göre şeffaf fiyatlama sunulamaması.",
    services: [
      {
        type: "WEB_APP",
        title: "3D Araç Segmenti & PPF Paket Konfigüratörü",
        description: "Müşteri aracının marka/modelini seçer (örn. Porsche 911), ön tampon veya komple paket seçip anında şeffaf fiyat aralığını görerek depozito öder.",
        deliverables: ["İnteraktif Araç Seçici", "Kaplama Paketi Fiyat Hesaplayıcı", "Online Randevu ve Depozito Tahsilatı"],
        estimatedTicket: "€2.500 - €5.500"
      }
    ],
    pitchHooks: {
      de: "Hallo, Kunden fragen oft nach Preisen für Lackschutzfolierung und springen ab. Unser interaktiver PPF-Konfigurator zeigt Modellpreise sofort an und sammelt verbindliche Termine.",
      tr: "PPF ve seramik kaplama fiyatı sorup kaçan müşterileri sonlandırın. Araç modeline göre anında paket fiyatı sunup kapora alan etkileşimli stüdyo yazılımı.",
      en: "Stop spending hours quoting custom wraps and PPF jobs manually. Our interactive 3D Car Protection Configurator quotes packages instantly and secures deposits."
    }
  },

  // ==========================================
  // KATEGORİ 5: DERİN TEKNOLOJİ, ENERJİ DEPOLAMA & ROBOTİK
  // ==========================================
  {
    id: "commercial_bess_storage",
    category: "TRADE_ENERGY",
    nameKey: "commercial_bess_storage",
    titleTr: "Ticari Enerji Depolama (BESS) & Mikroşebeke Sistemleri",
    titleDe: "Gewerbliche Batteriespeicher (BESS) & Spitzenlastkappung",
    titleEn: "Commercial Battery Energy Storage Systems (BESS)",
    badge: "Endüstriyel B2B",
    defaultKeywords: {
      de: ["Gewerbespeicher Photovoltaik", "Großbatteriespeicher B2B", "Spitzenlastkappung Peak Shaving"],
      tr: ["Endüstriyel Enerji Depolama", "BESS Batarya", "Fabrika Enerji Depolama"],
      en: ["Commercial Battery Storage", "BESS", "Peak Shaving Storage", "Microgrid"]
    },
    targetRoles: ["managing_director", "cfo", "sales_director"],
    primaryPainPoint: "Fabrika ve sanayi tesislerinin yüksek elektrik pik cezaları (Peak Shaving) ödemesi ancak batarya amortismanını hesaplayamaması.",
    services: [
      {
        type: "WEB_APP",
        title: "Sanayi Faturası OCR & BESS Amortisman Hesaplayıcı Web App",
        description: "Fabrika müdürü elektrik faturasını PDF olarak yükler; sistem 1 dakikada yıllık pik yük ceza tasarrufunu ve batarya kapasite önerisini çıkarır.",
        deliverables: ["Sanayi Elektrik Faturası OCR Analizi", "Pik Yük & Amortisman Simülatörü", "Yatırımcı Seviyesinde PDF Teklif"],
        estimatedTicket: "€5.000 - €12.000"
      }
    ],
    pitchHooks: {
      de: "Sehr geehrte Geschäftsleitung, Industrieunternehmen zahlen enorme Lastspitzen-Netzentgelte. Unser Rechner analysiert Lastgänge in Minuten und generiert Ihnen hochkarätige BESS-Großprojekte.",
      tr: "Sanayi tesisleri aşırı elektrik güç cezalarından kurtulmak istiyor. Faturalarını yükleyen fabrikatörlere kaç yıllık amortismanla BESS kurabileceklerini gösteren B2B teklif motoru.",
      en: "Industrial plants pay exorbitant peak-load penalties. Our BESS Feasibility Analyzer parses corporate utility bills to calculate payback periods and capture multi-megawatt storage deals."
    }
  },
  {
    id: "industrial_robotics_cobots",
    category: "B2B_INDUSTRY",
    nameKey: "industrial_robotics_cobots",
    titleTr: "Endüstriyel Robot Entegratörleri & Cobot (Kolaboratif Robot) Çözümleri",
    titleDe: "Robotik-Systemintegratoren & Cobot-Automation",
    titleEn: "Industrial Robotics Integrators & Cobot Automation",
    badge: "Endüstri 4.0",
    defaultKeywords: {
      de: ["Roboter Automation Industrie", "Cobot Schweißen Palettieren", "Systemintegrator Robotik"],
      tr: ["Endüstriyel Robot Entegratörü", "Cobot Otomasyonu", "Paletleme Robotu", "Kaynak Robotu"],
      en: ["Robotics System Integrator", "Cobot Automation", "Industrial Palletizing Robot"]
    },
    targetRoles: ["managing_director", "coo", "plant_manager"],
    primaryPainPoint: "KOBİ üreticilerin robotları 'aşırı pahalı ve karmaşık' sanarak otomasyona geçmekten çekinmesi.",
    services: [
      {
        type: "WEB_APP",
        title: "KOBİ Üretim Hattı Robotik ROI & Amortisman Simülatörü",
        description: "Üretici vardiya sayısını ve işçi maliyetini girer, sistem robotik paletleme/kaynak hücresinin kaç ayda kendini amorti edeceğini kanıtlar.",
        deliverables: ["İşçilik vs Robotik Maliyet Simülatörü", "Sektörel 3D Hücre Seçici", "B2B Mühendislik Randevu Portalı"],
        estimatedTicket: "€4.500 - €9.500"
      }
    ],
    pitchHooks: {
      de: "Guten Tag, viele Mittelständler zögern bei Cobots aus Unwissenheit über die Amortisation. Unser interaktiver Rechner zeigt Fabrikanten, wie sich die Anlage in unter 14 Monaten rechnet.",
      tr: "KOBİ üreticileri personel bulamıyor ama robot yatırımından çekiniyor. Robotun 1 yılda kendini nasıl amorti ettiğini gösteren simülatörümüzle mühendislik satışlarınızı hızlandırın.",
      en: "SME manufacturers suffer labor shortages but fear high automation CAPEX. Our Cobot Payback Simulator proves sub-14-month ROI and fills your engineering discovery pipeline."
    }
  },
  {
    id: "drone_thermal_inspection",
    category: "B2B_INDUSTRY",
    nameKey: "drone_thermal_inspection",
    titleTr: "Endüstriyel İHA / Dron Termal Muayene & Haritalama",
    titleDe: "Industrielle Drohneninspektion & Thermografie (Windkraft & PV)",
    titleEn: "Industrial Drone Inspection & Thermal Asset Mapping",
    badge: "Hava İstihbaratı",
    defaultKeywords: {
      de: ["Drohneninspektion Windkraft", "Thermografie Photovoltaik Drohne", "Industriedrohnen Vermessung"],
      tr: ["Dronla Güneş Paneli Muayenesi", "Rüzgar Türbini Dron İnceleme", "Dron Termal Haritalama"],
      en: ["Drone Solar Inspection", "Wind Turbine Drone Inspection", "Thermal Drone Mapping"]
    },
    targetRoles: ["founder", "operations_director"],
    primaryPainPoint: "Rüzgar ve güneş santrali işletmecilerine gigabaytlarca ham dosya teslim edilmesi ve arıza raporlarının okunamaması.",
    services: [
      {
        type: "WEB_APP",
        title: "Bulut Tabanlı 3D Ortofoto & Termal Kusur Görüntüleme Portalı",
        description: "Müşterilerin taranan santrallerindeki kırık panelleri harita üzerinde kırmızı noktalarla tıkladığı interaktif müşteri teslim portalı.",
        deliverables: ["Harita Tabanlı Kusur İşaretleyici Web App", "Otomatik Kusur Sınıflandırma AI", "Yatırımcı PDF Rapor Çıkarıcı"],
        estimatedTicket: "€4.000 - €8.000"
      }
    ],
    pitchHooks: {
      de: "Hallo, Ihre Kunden möchten keine unübersichtlichen PDF-Dateien durchblättern. Unser interaktives Kundenportal visualisiert defekte PV-Module auf interaktiven Karten.",
      tr: "Santral sahiplerine yüzlerce gigabaytlık zip dosyası yollamayın. Arızalı güneş panellerini harita üzerinde 3D gösteren prestijli bulut portalımızla kurumsal rakiplerinizin önüne geçin.",
      en: "Stop delivering massive ZIP files of raw thermal images. Elevate your drone inspection business with an interactive cloud map highlighting defective solar panels."
    }
  },
  {
    id: "cybersecurity_compliance_nis2",
    category: "B2B_INDUSTRY",
    nameKey: "cybersecurity_compliance_nis2",
    titleTr: "B2B Siber Güvenlik & Regülasyon Uyumu (NIS2 / DORA Denetçileri)",
    titleDe: "NIS2 & DORA Compliance & Cybersicherheit für den Mittelstand",
    titleEn: "NIS-2 & DORA Cybersecurity Compliance Auditors",
    badge: "Zorunlu Regülasyon",
    defaultKeywords: {
      de: ["NIS2 Richtlinie Beratung", "DORA Compliance Kanzlei", "Cybersicherheit Audit Mittelstand"],
      tr: ["NIS2 Uyumluluk Danışmanlığı", "KVKK Siber Güvenlik Denetimi", "Penetrasyon Testi B2B"],
      en: ["NIS2 Directive Compliance", "DORA Cybersecurity Audit", "Penetration Testing B2B"]
    },
    targetRoles: ["ceo", "ciso", "managing_director"],
    primaryPainPoint: "Avrupa'da NIS2 direktifiyle şirket yöneticilerinin şahsi cezai sorumluluğunun başlaması ancak nereden başlayacaklarını bilememeleri.",
    services: [
      {
        type: "WEB_APP",
        title: "10 Soruda Şirket NIS2 Ceza Riski & Uyumluluk Test Motoru",
        description: "Şirket yöneticilerine 3 dakikada hangi yasal kategoride olduklarını ve alacakları para cezalarını gösteren lead toplama aracı.",
        deliverables: ["İnteraktif NIS2 Risk Puanlama Motoru", "Şirket E-posta Sızıntı (Darkweb) Ön Raporu", "C-Level Danışmanlık Randevu Akışı"],
        estimatedTicket: "€3.500 - €7.500"
      }
    ],
    pitchHooks: {
      de: "Sehr geehrte(r) Geschäftsführer(in), NIS2 nimmt Geschäftsführer persönlich in die Haftung. Unser interaktiver Compliance-Schnelltest zeigt Unternehmen in 3 Minuten ihren Handlungsbedarf.",
      tr: "Avrupa'daki yeni siber güvenlik direktifleri (NIS2) yöneticilere doğrudan şahsi sorumluluk yüklüyor. 10 soruluk akıllı uyumluluk testimizle kurumsal danışmanlık satışlarınızı katlayın.",
      en: "Under the new EU NIS-2 directive, company executives face personal liability for cyber breaches. Capture urgent C-level audit contracts with our automated NIS-2 Readiness Assessment tool."
    }
  },
  {
    id: "smart_agtech_irrigation",
    category: "TRADE_ENERGY",
    nameKey: "smart_agtech_irrigation",
    titleTr: "Akıllı Tarım Teknolojileri & Otonom Sulama/Sensör Sistemleri (AgTech)",
    titleDe: "Präzisionslandwirtschaft & Smart Irrigation Fachbetriebe",
    titleEn: "Smart AgTech, Precision Farming & Autonomous Irrigation",
    badge: "Sürdürülebilirlik",
    defaultKeywords: {
      de: ["Smart Farming", "Präzisionslandwirtschaft", "Bodenfeuchtesensoren B2B", "Automatisierte Bewässerung"],
      tr: ["Akıllı Tarım", "Otonom Sulama Sistemi", "Toprak Nemi Sensörü", "Zirai Dron"],
      en: ["Smart Irrigation", "AgTech Precision Farming", "Soil Moisture Sensors"]
    },
    targetRoles: ["founder", "managing_director"],
    primaryPainPoint: "Büyük tarım işletmelerinin su ve enerji israfını kestirememesi ve ekipman yatırım maliyetinden çekinmesi.",
    services: [
      {
        type: "WEB_APP",
        title: "Arazi Dönümü & Mahsul Su/Gübre Tasarruf Hesaplayıcısı",
        description: "Çiftlik büyüklüğü ve ürün tipine göre yıllık elektrik/su faturası tasarrufunu ve sensör paketini çıkaran B2B satış hunisi.",
        deliverables: ["Tarımsal ROI Simülatörü", "Otomatik Hibe (Tarım Bakanlığı / AB) Rehberi", "Saha Satış Lead Yakalama Modülü"],
        estimatedTicket: "€3.000 - €6.000"
      }
    ],
    pitchHooks: {
      de: "Guten Tag, Landwirte investieren in Sensorik, wenn der Wasser- und Düngerspareffekt klar belegt ist. Unser interaktiver AgTech-Rechner generiert abschlussstarke Leads für Ihre Technik.",
      tr: "Büyük tarım işletmelerine su ve gübre tasarruflarını rakamlarla gösterin. Arazi boyutuna göre anında tasarruf raporu sunan akıllı AgTech satış portalı.",
      en: "Farmers invest in precision agriculture when water and fertilizer ROI is clearly quantified. Our interactive AgTech Calculator generates qualified equipment proposals."
    }
  },
  {
    id: "3d_printing_additive_mfg",
    category: "B2B_INDUSTRY",
    nameKey: "3d_printing_additive_mfg",
    titleTr: "3D Baskı, Hızlı Prototipleme & Katmanlı İmalat Servisleri",
    titleDe: "3D-Druck Dienstleister & Additive Fertigung Express",
    titleEn: "3D Printing & Additive Manufacturing On-Demand",
    badge: "Mühendislik Express",
    defaultKeywords: {
      de: ["3D Druck Service B2B", "Additive Fertigung Kleinserie", "Rapid Prototyping SLS SLA"],
      tr: ["3D Baskı Hizmeti", "Hızlı Prototipleme", "Katmanlı İmalat", "Endüstriyel 3D Yazıcı"],
      en: ["3D Printing Service", "On-Demand Additive Manufacturing", "Rapid Prototyping"]
    },
    targetRoles: ["founder", "operations_director"],
    primaryPainPoint: "Mühendislerin ve AR-GE ekiplerinin STL dosyası gönderip fiyat teklifi için 24-48 saat beklemekten sıkılması.",
    services: [
      {
        type: "WEB_APP",
        title: "Anlık STL / STEP Dosyası Yükleme & Otomatik Fiyatlama Portalı",
        description: "Mühendis CAD dosyasını sürükler; AI parça hacmini, basılabilirliğini ve malzeme maliyetini 5 saniyede hesaplayıp online sipariş alır.",
        deliverables: ["Web Tabanlı 3D Model Önizleyici", "Hacim ve Malzeme Fiyat Algoritması", "Online Kredi Kartı & Kurumsal Fatura Tahsilatı"],
        estimatedTicket: "€4.500 - €9.000"
      }
    ],
    pitchHooks: {
      de: "Sehr geehrte(r) Geschäftsführer(in), Ingenieure bestellen dort, wo sie sofort einen Preis sehen. Mit unserem automatisierten 3D-Upload-Portal automatisieren Sie Ihre gesamte Angebotsphase.",
      tr: "AR-GE mühendisleri parça fiyatı beklemek istemiyor. CAD dosyasını yükleyen müşteriye 5 saniyede fiyat verip sipariş açan otomatik imalat portalı ile rakiplerinizi geride bırakın.",
      en: "Engineers order prototypes where pricing is instantaneous. Eliminate manual quoting with our automated 3D CAD Upload and Instant Pricing Portal."
    }
  }
];
