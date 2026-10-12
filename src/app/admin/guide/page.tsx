"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  BookOpen, Search, Compass, Target, Mail, Users, 
  ReceiptText, FolderKanban, FileSpreadsheet, Bot, Sparkles, 
  Rocket, FileText, Calendar, Globe, Settings, ShieldCheck, 
  ArrowRight, CheckCircle2, AlertTriangle, Lightbulb, ExternalLink,
  ChevronRight, Inbox, TrendingUp, TicketCheck, MessageSquare, Activity
} from "lucide-react";

interface GuideSection {
  id: string;
  category: "growth" | "sales" | "operations" | "ai" | "system";
  title: string;
  subtitle: string;
  href: string;
  icon: any;
  color: string;
  gradient: string;
  whatIsIt: string;
  howToUse: { step: string; desc: string }[];
  proTips: string[];
  warnings?: string[];
}

const GUIDE_SECTIONS: GuideSection[] = [
  // -------------------------------------------------------------
  // 1. MÜŞTERİ BULMA & BÜYÜME (OUTREACH & GROWTH)
  // -------------------------------------------------------------
  {
    id: "prospecting",
    category: "growth",
    title: "Müşteri Avcısı (Prospecting)",
    subtitle: "Yapay zeka ve Google Maps/Apify ile hedef kitle bulma ve analiz motoru",
    href: "/admin/prospecting",
    icon: Target,
    color: "#8B5CF6",
    gradient: "from-purple-500/20 to-indigo-500/10",
    whatIsIt: "Belirlediğiniz sektör (ör. Diş Hekimi, Hukuk Bürosu, Lojistik) ve hedef ülkede (Almanya, Türkiye, İsviçre vb.) karar vericileri (CEO, Kurucu, Müdür) e-posta, telefon ve web siteleriyle birlikte tarayan otomatik lead bulma merkezidir.",
    howToUse: [
      {
        step: "1. Arama Kriterlerini Belirleyin",
        desc: "Sektör (örn: 'Zahnarzt' veya 'Yazılım'), Ülke ve Şehir girin. Karar verici rollerini (CEO, Kurucu, Satış Direktörü vb.) seçin."
      },
      {
        step: "2. Aramayı Başlatın (veya Apify Tetikleyin)",
        desc: "'Müşteri Ara' butonuna tıklayarak yerleşik OpenStreetMap tarayıcısını veya 'Gerçek Apify Tara' ile derin web kazıma motorunu başlatın."
      },
      {
        step: "3. AI ile Acı Noktası Analizi Yapın",
        desc: "Listelenen firmanın yanındaki yapay zeka ikonuna basarak Google Maps müşteri yorumlarını analiz edin. AI, firmanın zayıf yönünü (örn: randevu aksaması) bulur ve firmaya özel 'Custom Pitch' üretir."
      },
      {
        step: "4. Onaylayın ve Kampanyaya Aktarın",
        desc: "Uygun bulduğunuz firmaları sol taraftaki kutucuklardan seçin ve 'Seçilenleri Kampanyaya Aktar' butonuna basın. Seçtiğiniz firmalar 5 adımlı otomatik e-posta sırasına girer."
      }
    ],
    proTips: [
      "AI analizi yapılan adayların maillerinde açılma ve dönüşüm oranı ortalama %45 daha yüksektir.",
      "Aynı anda 50'den fazla aday seçmeyerek günlük mailbox limitinizi dengeli kullanın."
    ],
    warnings: [
      "Siz 'Kampanyaya Aktar' butonuna basmadığınız sürece sisteme eklenen hiçbir firmaya e-posta gönderilmez; tam kontrol sizdedir."
    ]
  },
  {
    id: "email",
    category: "growth",
    title: "E-Posta Motoru (Cold Outreach)",
    subtitle: "5 adımlı Master Blueprint, Mailbox ısınma (Warmup) ve gönderim kuyruğu",
    href: "/admin/email",
    icon: Mail,
    color: "#3B82F6",
    gradient: "from-blue-500/20 to-cyan-500/10",
    whatIsIt: "Kampanyaya aktarılan potansiyel müşterilere 1., 3., 7., 12. ve 20. günlerde otomatik e-posta gönderen, giden kutusunu yöneten ve posta kutularının (IONOS, Gmail vb.) spam puanını koruyan ana omurgadır.",
    howToUse: [
      {
        step: "1. Mailbox Durumlarını Kontrol Edin (Warmup Tab)",
        desc: "Mailbox Warmup sekmesinde bağlı e-posta adreslerinizin (info@, contact@ vb.) SPF, DKIM, DMARC puanlarını ve ısınma seviyelerini inceleyin."
      },
      {
        step: "2. Kampanyaları Yönetin (Campaigns Tab)",
        desc: "'Hibrit B2B Tanışma Serisi' kampanyasının durumunu görün. Dilediğiniz zaman kampanyayı tek tıkla 'Durdur' (Pause) veya 'Başlat' (Resume) yapabilirsiniz."
      },
      {
        step: "3. Şablonları Özelleştirin (Templates Tab)",
        desc: "5 günlük Master Blueprint şablonlarını dilediğiniz gibi düzenleyebilir veya AI Şablon Üreticisi ile sıfırdan yeni mailler üretebilirsiniz."
      },
      {
        step: "4. Gönderim Kuyruğunu İzleyin (Outreach & Outbox Tab)",
        desc: "Sıradaki e-postaların hangi dakikada kime gideceğini, son gönderilenleri ve sekenleri anlık olarak takip edin."
      }
    ],
    proTips: [
      "Sistem her gönderim arasına 25-50 saniye rastgele bekleme (jitter) ekler. Bu sayede Google ve Microsoft filtreleri toplu bot değil insan yazdığını varsayar.",
      "1. Gün tanışma e-postalarında takip pikseli kapatılmıştır; bu sayede ilk e-posta doğrudan birincil gelen kutusuna (Primary Inbox) düşer."
    ],
    warnings: [
      "Sert seken (Hard Bounce) oranı %2'yi aşarsa acil durum freni (Circuit Breaker) otomatik devreye girer ve domaininizi korumak için gönderimi geçici olarak durdurur."
    ]
  },
  {
    id: "inbox",
    category: "growth",
    title: "Gelen Kutusu (Unified Inbox)",
    subtitle: "Outreach kampanyalarına gelen tüm müşteri yanıtlarını tek ekranda karşılama",
    href: "/admin/inbox",
    icon: Inbox,
    color: "#10B981",
    gradient: "from-emerald-500/20 to-teal-500/10",
    whatIsIt: "Soğuk e-posta attığınız potansiyel müşteriler cevap verdiğinde bu yanıtların anında düştüğü merkezdir. Müşteri yanıt verdiği an o kişi için sonraki takip mailleri otomatik olarak kesilir.",
    howToUse: [
      {
        step: "1. Gelen Yanıtları İnceleyin",
        desc: "Müşteriden gelen yanıt 'Toplantı İstiyor', 'Daha Fazla Bilgi İstiyor' veya 'İlgilenmiyorum' şeklinde yapay zeka tarafından etiketlenir."
      },
      {
        step: "2. Doğrudan Yanıt Verin veya Randevuya Yönlendirin",
        desc: "Müşteriye panel içinden doğrudan cevap yazabilir veya takvim randevu linkinizi (/randevu) iletebilirsiniz."
      }
    ],
    proTips: [
      "Yanıt veren müşteriye ilk 15 dakika içinde dönüldüğünde satışa dönüşme ihtimali 7 kat artar."
    ]
  },
  {
    id: "growth",
    category: "growth",
    title: "Büyüme Radarı - Apex",
    subtitle: "B2B büyüme hedefleri, dönüşüm hunisi ve hedef metrik takibi",
    href: "/admin/growth",
    icon: TrendingUp,
    color: "#F59E0B",
    gradient: "from-amber-500/20 to-orange-500/10",
    whatIsIt: "Ajansınızın aylık ciro hedefleri, müşteri edinme maliyetleri (CAC) ve dönüşüm hunisinin aşamalarını grafiklerle gösteren stratejik analiz panelidir.",
    howToUse: [
      {
        step: "1. Hedef Belirleyin",
        desc: "Aylık yeni müşteri ve ciro hedeflerinizi tanımlayın."
      },
      {
        step: "2. Hunideki Tıkanıklıkları İnceleyin",
        desc: "Hangi aşamada müşteri kaybettiğinizi (E-posta açıldı mı? Yanıt geldi mi? Teklif onaylandı mı?) görerek stratejinizi optimize edin."
      }
    ],
    proTips: ["Haftalık periyotlarla huniyi inceleyip en çok tıkanan adıma odaklanın."]
  },

  // -------------------------------------------------------------
  // 2. SATIŞ VE MÜŞTERİ İLİŞKİLERİ (SALES & CRM)
  // -------------------------------------------------------------
  {
    id: "crm",
    category: "sales",
    title: "CRM ve Müşteri Leadleri",
    subtitle: "Satış hunisi (Kanban), aday müşteri kartları ve teklif aşamaları",
    href: "/admin/crm",
    icon: Users,
    color: "#6366F1",
    gradient: "from-indigo-500/20 to-blue-500/10",
    whatIsIt: "Web sitesinden gelen formlar, canlı sohbet adayları ve outreach'ten yanıt veren tüm müşterilerin aşama aşama takip edildiği CRM merkezidir.",
    howToUse: [
      {
        step: "1. Aday Müşteriyi Kartına Tıklayarak Açın",
        desc: "Müşterinin adı, e-postası, bütçesi, şirket tipi ve geçmiş konuşmaları kart detayında listelenir."
      },
      {
        step: "2. Sürükle-Bırak ile Aşama Değiştirin",
        desc: "Müşteriyi 'Yeni Lead' -> 'İletişimde' -> 'Teklif Verildi' -> 'Kazanıldı' sütunlarına sürükleyerek durumunu güncelleyin."
      },
      {
        step: "3. Özel Notlar ve Görevler Ekleyin",
        desc: "Müşteri kartının içine görüşme notları ve bir sonraki arama tarihini kaydedin."
      }
    ],
    proTips: [
      "'Kazanıldı' sütununa taşınan müşteriler için otomatik olarak Fatura ve Proje oluşturma kısayolları açılır."
    ]
  },
  {
    id: "proposals",
    category: "sales",
    title: "Teklif Talepleri & Fiyatlandırma",
    subtitle: "Profesyonel B2B dijital teklifler hazırlama ve PDF çıktısı alma",
    href: "/admin/proposals",
    icon: FileSpreadsheet,
    color: "#EC4899",
    gradient: "from-pink-500/20 to-rose-500/10",
    whatIsIt: "Müşterilerinize ileteceğiniz kapsamlı web geliştirme, yapay zeka ajanı veya otomasyon tekliflerini dakikalar içinde hazırlamanızı sağlayan modüldür.",
    howToUse: [
      {
        step: "1. 'Yeni Teklif Oluştur' Butonuna Basın",
        desc: "Müşteri adını, proje kapsamını, teslim süresini ve kalem kalem fiyatlandırmayı girin."
      },
      {
        step: "2. PDF İndirin veya Müşteriye Gönderin",
        desc: "Hazırlanan teklifi profesyonel ajans formatında PDF olarak indirin veya e-posta ile iletin."
      },
      {
        step: "3. Onay Durumunu Takip Edin",
        desc: "Teklif 'Beklemede', 'Onaylandı' veya 'Revizyon' olarak güncellendiğinde bildirim alın."
      }
    ],
    proTips: ["Teklif kabul edildiğinde tek tıkla 'Sözleşme' ve 'Fatura' modülüne aktarılabilir."]
  },
  {
    id: "appointments",
    category: "sales",
    title: "Randevular & Takvim",
    subtitle: "Müşteri görüşmeleri ve demo randevu yönetimi",
    href: "/admin/appointments",
    icon: Calendar,
    color: "#06B6D4",
    gradient: "from-cyan-500/20 to-blue-500/10",
    whatIsIt: "Müşterilerin web sitesindeki randevu formundan aldığı görüşme taleplerini listeleyen ve takviminizle senkronize eden modüldür.",
    howToUse: [
      {
        step: "1. Yaklaşan Randevuları Kontrol Edin",
        desc: "Günün ve haftanın planlanmış toplantılarını saat ve katılımcı bilgisiyle görün."
      },
      {
        step: "2. Toplantı Notlarını Kaydedin",
        desc: "Görüşme sonrasında konuşulan detayları randevu kartına işleyin."
      }
    ],
    proTips: ["Randevu saati yaklaştığında müşteriye otomatik e-posta hatırlatması gönderilir."]
  },
  {
    id: "messages",
    category: "sales",
    title: "Mesajlar & Canlı İletişim",
    subtitle: "İletişim formları ve anlık mesaj kayıtları",
    href: "/admin/messages",
    icon: MessageSquare,
    color: "#14B8A6",
    gradient: "from-teal-500/20 to-emerald-500/10",
    whatIsIt: "Web sitesindeki iletişim formlarından (CTA Banner, Modal) gelen doğrudan mesajların toplandığı arşivdir.",
    howToUse: [
      {
        step: "Gelen mesajları filtreleyin ve cevaplanmamış olanları işaretleyin.",
        desc: "Gerektiğinde mesaj sahibini tek tıkla CRM'e aktarabilirsiniz."
      }
    ],
    proTips: ["Honeypot koruması sayesinde spam bot mesajları buraya hiç düşmeden engellenir."]
  },

  // -------------------------------------------------------------
  // 3. OPERASYON VE FİNANS (OPERATIONS & FINANCE)
  // -------------------------------------------------------------
  {
    id: "projects",
    category: "operations",
    title: "Projeler & Görevler",
    subtitle: "Web geliştirme, AI ajanı ve otomasyon teslimat süreçleri",
    href: "/admin/projects",
    icon: FolderKanban,
    color: "#8B5CF6",
    gradient: "from-violet-500/20 to-purple-500/10",
    whatIsIt: "Kazanılan müşteri işlerinin (Web sitesi yapımı, n8n akışları, reklam yönetimi) adım adım ilerlediği Kanban ve görev yönetim panosudur.",
    howToUse: [
      {
        step: "1. Proje Kartı Oluşturun",
        desc: "Müşteri adını, teslim tarihini ve bütçesini tanımlayın."
      },
      {
        step: "2. Alt Görevler Ekleyin",
        desc: "'Tasarım Onayı', 'Backend Kurulumu', 'Test & Canlıya Alma' adımlarını açıp tamamlandıkça işaretleyin."
      }
    ],
    proTips: ["Müşteriler kendi Müşteri Panellerinden (/client) projenin ilerleme yüzdesini canlı izleyebilir."]
  },
  {
    id: "invoices",
    category: "operations",
    title: "Faturalar (Invoices)",
    subtitle: "Almanya & Türkiye vergi uyumlu fatura kesme, PDF ve ödeme takibi",
    href: "/admin/invoices",
    icon: ReceiptText,
    color: "#10B981",
    gradient: "from-emerald-500/20 to-green-500/10",
    whatIsIt: "Almanya Kleinunternehmer (§19 UStG) veya KDV/MwSt oranlarına uygun resmi faturalar oluşturan, otomatik fatura numarası veren ve PDF üreten finans modülüdür.",
    howToUse: [
      {
        step: "1. 'Yeni Fatura' Butonuna Tıklayın",
        desc: "Müşteriyi seçin, hizmet kalemlerini ve tutarları girin."
      },
      {
        step: "2. Vergi Durumunu Belirleyin",
        desc: "Ayarlarınızdaki IBAN, Vergi Numarası (Steuernummer) ve KDV muafiyet notu faturaya otomatik yerleşir."
      },
      {
        step: "3. PDF Olarak İndirin veya Paylaşın",
        desc: "Müşterinize iletebileceğiniz A4 standartlarında PDF faturayı tek tıkla oluşturun."
      }
    ],
    proTips: [
      "Fatura ayarlarınızı /admin/settings altından güncelleyerek banka ve IBAN bilgilerinizi kalıcı hale getirin."
    ]
  },
  {
    id: "contracts",
    category: "operations",
    title: "Sözleşmeler (Contracts)",
    subtitle: "Hizmet sözleşmeleri, gizlilik anlaşmaları (NDA) ve dijital onay",
    href: "/admin/contracts",
    icon: FileText,
    color: "#64748B",
    gradient: "from-slate-500/20 to-zinc-500/10",
    whatIsIt: "Projelerin yasal güvenliğini sağlayan, gizlilik ve hizmet şartlarını içeren dijital sözleşme yönetim merkezidir.",
    howToUse: [
      {
        step: "1. Şablon Seçin",
        desc: "Yazılım geliştirme veya AI Danışmanlık sözleşme taslağını açın."
      },
      {
        step: "2. Müşteri Bilgilerini Doldurup Onaya Sunun",
        desc: "Müşterinizin dijital olarak imzalayabilmesi için bağlantıyı iletin."
      }
    ],
    proTips: ["İmzalanan sözleşmeler sistemde şifreli olarak arşivlenir."]
  },
  {
    id: "tickets",
    category: "operations",
    title: "Destek Talepleri (Tickets)",
    subtitle: "Müşteri teknik destek biletleri ve SLA takibi",
    href: "/admin/tickets",
    icon: TicketCheck,
    color: "#EF4444",
    gradient: "from-red-500/20 to-rose-500/10",
    whatIsIt: "Müşterilerinizin teslimat sonrası açtığı teknik arıza, güncelleme veya soru taleplerinin çözüldüğü destek merkezidir.",
    howToUse: [
      {
        step: "Açık biletleri önem derecesine göre sıralayın, yanıt yazın ve çözüldüğünde kapatın.",
        desc: "Müşteriye bilet durumu güncellendiğinde otomatik bildirim gider."
      }
    ],
    proTips: ["30 günlük garanti süresi boyunca müşterilerin taleplerine hızlı yanıt vermek puanınızı artırır."]
  },

  // -------------------------------------------------------------
  // 4. YAPAY ZEKA VE İÇERİK MOTORLARI (AI & CONTENT)
  // -------------------------------------------------------------
  {
    id: "ai-studio",
    category: "ai",
    title: "Google AI Stüdyo",
    subtitle: "Gemini 2.5 Flash & Pro ile prompt denemeleri ve metin üretimi",
    href: "/admin/ai-studio",
    icon: Sparkles,
    color: "#8B5CF6",
    gradient: "from-purple-500/20 to-pink-500/10",
    whatIsIt: "Google Gemini yapay zeka modellerini kullanarak ajansınız için strateji geliştirebileceğiniz, e-posta metinleri yazdırabileceğiniz ve prompt testleri yapabileceğiniz laboratuvardır.",
    howToUse: [
      {
        step: "1. Modeli ve Sıcaklığı Seçin",
        desc: "Gemini 2.5 Flash (Hızlı) veya Gemini 1.5 Pro (Derin Akıl Yürütme) seçeneğini belirleyin."
      },
      {
        step: "2. İstediğiniz Görevi Yazın",
        desc: "'Almanya'daki diş klinikleri için 3 adet ikna edici soğuk e-posta başlığı üret' yazarak anında çıktı alın."
      }
    ],
    proTips: ["Üretilen metinleri tek tıkla kopyalayıp E-Posta Motoru şablonlarına aktarabilirsiniz."]
  },
  {
    id: "blog",
    category: "ai",
    title: "AI Blog Motoru",
    subtitle: "SEO ve GEO uyumlu, otomatik görsel ve makale yayınlama sistemi",
    href: "/admin/blog",
    icon: FileText,
    color: "#3B82F6",
    gradient: "from-blue-500/20 to-indigo-500/10",
    whatIsIt: "Yapay zeka yardımıyla Google ve AI arama motorlarında (ChatGPT, Perplexity) üst sıralara çıkacak teknik ve B2B makaleleri saniyeler içinde yazıp yayınlayan içerik fabrikasıdır.",
    howToUse: [
      {
        step: "1. Makale Konusunu Belirleyin",
        desc: "Örn: 'Almanya'da B2B Şirketler İçin Yapay Zeka Otomasyonu Rehberi'."
      },
      {
        step: "2. 'AI ile Oluştur' Butonuna Basın",
        desc: "Yapay zeka başlıkları, alt başlıkları, kapak görseli promptunu ve meta etiketlerini hazırlar."
      },
      {
        step: "3. İnceleyin ve Yayına Alın",
        desc: "Gerekli düzenlemeleri yapıp 'Yayınla' butonuna basın; makale anında /blog altında canlıya geçer."
      }
    ],
    proTips: ["Her hafta 1 adet teknik makale yayınlamak sitenizin otoritesini ve organik lead akışını katlar."]
  },
  {
    id: "social",
    category: "ai",
    title: "Sosyal İçerikler (Social Studio)",
    subtitle: "LinkedIn, Instagram ve TikTok için otomatik B2B paylaşım üretici",
    href: "/admin/social",
    icon: Rocket,
    color: "#EC4899",
    gradient: "from-pink-500/20 to-rose-500/10",
    whatIsIt: "Ajansınızın sosyal medya kanalları için görsel taslakları, metinleri ve hashtagleri otomatik üreten ve planlayan modüldür.",
    howToUse: [
      {
        step: "Platformu seçin (LinkedIn, Instagram), konuyu girin ve görseliyle birlikte tek tıkla post taslağı üretin.",
        desc: "Hazırlanan içerikleri doğrudan kopyalayıp paylaşabilirsiniz."
      }
    ],
    proTips: ["LinkedIn gönderilerinde vaka analizleri (Case Study) paylaşmak en yüksek B2B etkileşimi sağlar."]
  },
  {
    id: "automations",
    category: "ai",
    title: "Otomasyonlar & İş Akışları",
    subtitle: "n8n, Zapier ve Webhook entegrasyon merkezi",
    href: "/admin/automations",
    icon: Bot,
    color: "#F59E0B",
    gradient: "from-amber-500/20 to-yellow-500/10",
    whatIsIt: "Sitedeki olayları (yeni lead, randevu, ödeme) harici sistemlere (CRM, Telegram, Slack, WhatsApp) bağlayan akıllı tetikleyici merkezidir.",
    howToUse: [
      {
        step: "Webhook URL'lerinizi bağlayın ve tetikleyici olayları (Yeni Form Gönderildi vb.) aktif hale getirin.",
        desc: "Gelen her verinin akışını canlı günlüklerden (log) izleyin."
      }
    ],
    proTips: ["WhatsApp entegrasyonu ile yeni bir teklif talebi geldiğinde telefonunuza anında bildirim alabilirsiniz."]
  },

  // -------------------------------------------------------------
  // 5. SİSTEM, GÜVENLİK VE AYARLAR (SYSTEM & SETTINGS)
  // -------------------------------------------------------------
  {
    id: "analytics",
    category: "system",
    title: "Analitik & Trafik Takibi",
    subtitle: "Canlı ziyaretçiler, sayfa görüntülemeleri ve dönüşüm oranları",
    href: "/admin/analytics",
    icon: Activity,
    color: "#3B82F6",
    gradient: "from-blue-500/20 to-cyan-500/10",
    whatIsIt: "Web sitenize gelen ziyaretçilerin hangi ülkelerden geldiğini, hangi sayfaları gezdiğini ve cihaz dağılımlarını gösteren yerleşik analitik motorudur.",
    howToUse: [
      {
        step: "Günlük, haftalık ve aylık tekil ziyaretçi sayılarını izleyin.",
        desc: "En çok ilgi gören hizmet sayfalarını belirleyerek pazarlama çalışmalarınızı yönlendirin."
      }
    ],
    proTips: ["Gizlilik dostudur; üçüncü taraf çerezler kullanmadan DSGVO/KVKK tam uyumlu çalışır."]
  },
  {
    id: "monitoring",
    category: "system",
    title: "Servis Takibi (System Health)",
    subtitle: "Veritabanı, API'ler, WAF ve sunucu kesinti durumu monitörü",
    href: "/admin/monitoring",
    icon: Globe,
    color: "#10B981",
    gradient: "from-emerald-500/20 to-teal-500/10",
    whatIsIt: "PostgreSQL veritabanının, Gemini API'sinin, e-posta sunucularının ve WAF güvenlik filtrelerinin çalışıp çalışmadığını saniye saniye test eden sağlık panelidir.",
    howToUse: [
      {
        step: "Tüm göstergelerin yeşil ('Operational') olduğunu teyit edin.",
        desc: "Herhangi bir serviste gecikme veya hata oluşursa panelde uyarı belirir."
      }
    ],
    proTips: ["Sistem her 60 saniyede bir otomatik sağlık kontrolü (heartbeat) gerçekleştirir."]
  },
  {
    id: "users",
    category: "system",
    title: "Kullanıcı Yönetimi (RBAC)",
    subtitle: "Yönetici, çalışan ve müşteri yetkilendirme sistemi",
    href: "/admin/users",
    icon: Users,
    color: "#6366F1",
    gradient: "from-indigo-500/20 to-purple-500/10",
    whatIsIt: "Sisteme giriş yapabilecek ekip üyelerinin ve müşterilerin hesaplarını, rollerini (SUPER_ADMIN, AGENCY_MEMBER, CLIENT_OWNER) yönettiğiniz ekrandır.",
    howToUse: [
      {
        step: "Yeni kullanıcı ekleyin, şifresini belirleyin ve rolünü atayın.",
        desc: "Müşteriler sadece /client paneline erişebilirken, yöneticiler /admin paneline tam erişir."
      }
    ],
    proTips: ["Güvenlik için her ekip üyesine kendi e-postasıyla ayrı bir hesap tanımlayın."]
  },
  {
    id: "settings",
    category: "system",
    title: "Sistem Ayarları",
    subtitle: "Ajans kimliği, fatura bilgileri, logo ve API anahtarları",
    href: "/admin/settings",
    icon: Settings,
    color: "#64748B",
    gradient: "from-slate-500/20 to-zinc-500/10",
    whatIsIt: "Ajansınızın adı, resmi unvanı, IBAN adresi, vergi dairesi, logosu ve sistem entegrasyonlarının yönetildiği ana ayarlar tablosudur.",
    howToUse: [
      {
        step: "1. Fatura Bilgilerini Girin",
        desc: "IBAN, banka adı, vergi numarası ve yasal unvanınızı kaydedin; bu bilgiler otomatik fatura şablonlarına yerleşir."
      },
      {
        step: "2. Dil ve Para Birimini Ayarlayın",
        desc: "Varsayılan para birimini (EUR, USD, TRY) ve zaman dilimini belirleyin."
      }
    ],
    proTips: ["Burada yaptığınız değişiklikler tüm panellerde ve PDF çıktılarında anında geçerli olur."]
  }
];

const CATEGORIES = [
  { id: "all", label: "Tüm Modüller" },
  { id: "growth", label: "🚀 Müşteri Bulma & Büyüme" },
  { id: "sales", label: "💼 Satış & Müşteri İlişkileri" },
  { id: "operations", label: "🛠️ Operasyon & Finans" },
  { id: "ai", label: "🤖 Yapay Zeka & İçerik" },
  { id: "system", label: "⚙️ Sistem, Güvenlik & Ayarlar" }
];

export default function AdminGuidePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>("prospecting");

  const filteredSections = GUIDE_SECTIONS.filter((section) => {
    const matchesCategory = selectedCategory === "all" || section.category === selectedCategory;
    const matchesSearch = 
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.whatIsIt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="relative space-y-8 p-6 lg:p-10 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* Üst Başlık Banner */}
      <div className="relative rounded-3xl p-8 lg:p-10 overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-2xl border border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-purple-200">
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span>StarWebFlow Komuta Kılavuzu &amp; Master Dokümantasyon</span>
          </div>

          <h1 className="text-3xl lg:text-5xl font-black tracking-tight font-['Outfit'] text-white">
            Admin Paneli <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-300 to-pink-400">Kullanım Kılavuzu</span>
          </h1>

          <p className="text-slate-300 text-sm lg:text-base leading-relaxed">
            StarWebFlow projesindeki tüm panellerin ne işe yaradığını, sistemin arka planda nasıl çalıştığını ve bir yönetici olarak her adımı nasıl kontrol edip onaylayacağınızı adım adım bu rehberden takip edebilirsiniz.
          </p>

          {/* Hızlı Arama */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Modül veya işlem ara (örn: prospecting, fatura, warmup)..."
                className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all backdrop-blur-md"
              />
            </div>
            <div className="text-xs text-slate-400">
              Toplam <span className="text-white font-bold">{GUIDE_SECTIONS.length}</span> Modül Listelendi
            </div>
          </div>
        </div>
      </div>

      {/* Kategori Filtre Butonları */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-105"
                : "bg-white dark:bg-[#0A0A12] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Modül Kartları Listesi */}
      <div className="space-y-6">
        {filteredSections.map((section) => {
          const Icon = section.icon;
          const isExpanded = expandedId === section.id;

          return (
            <div
              key={section.id}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                isExpanded
                  ? "bg-white dark:bg-[#0D0E17] border-purple-500/40 shadow-xl dark:shadow-purple-950/20"
                  : "bg-white/80 dark:bg-[#0A0A12] border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20"
              }`}
            >
              {/* Kart Başlık Alanı (Aç / Kapa Tetikleyici) */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : section.id)}
                className="p-5 lg:p-6 cursor-pointer flex items-center justify-between gap-4 select-none hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md flex-shrink-0"
                    style={{ backgroundColor: `${section.color}20`, border: `1px solid ${section.color}40` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: section.color }} />
                  </div>
                  <div>
                    <h3 className="text-lg lg:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {section.title}
                    </h3>
                    <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      {section.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={section.href}
                    onClick={(e) => e.stopPropagation()}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-white/10 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 transition-colors text-slate-700 dark:text-slate-300"
                  >
                    <span>Panele Git</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>

                  <div className={`p-2 rounded-lg bg-slate-100 dark:bg-white/5 transition-transform duration-300 ${isExpanded ? "rotate-90" : ""}`}>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Genişletilmiş İçerik Alanı */}
              {isExpanded && (
                <div className="px-5 pb-6 lg:px-6 lg:pb-8 pt-2 border-t border-slate-100 dark:border-white/[0.06] space-y-6 animate-in fade-in duration-300">
                  
                  {/* Bu Panel Nedir? */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      <Compass className="w-3.5 h-3.5" />
                      <span>Bu Panel Nedir &amp; Ne İşe Yarar?</span>
                    </div>
                    <p className="text-sm lg:text-base text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-white/[0.02] p-4 rounded-xl border border-slate-100 dark:border-white/5">
                      {section.whatIsIt}
                    </p>
                  </div>

                  {/* Adım Adım Nasıl Kullanılır? */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Adım Adım Nasıl Kullanılır?</span>
                    </div>
                    
                    <div className="grid gap-3 sm:grid-cols-2">
                      {section.howToUse.map((item, idx) => (
                        <div 
                          key={idx}
                          className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] space-y-1.5"
                        >
                          <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-[10px] font-black">
                              {idx + 1}
                            </span>
                            {item.step}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-7">
                            {item.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* İpuçları ve Uyarılar */}
                  <div className="grid gap-4 sm:grid-cols-2 pt-2">
                    {/* Pro İpuçları */}
                    <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-200/50 dark:border-emerald-500/20 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        <Lightbulb className="w-4 h-4" />
                        <span>Kritik İpuçları &amp; Başarı Stratejisi</span>
                      </div>
                      <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                        {section.proTips.map((tip, idx) => (
                          <li key={idx} className="leading-relaxed">{tip}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Uyarılar (Varsa) */}
                    {section.warnings && section.warnings.length > 0 && (
                      <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-500/5 border border-amber-200/50 dark:border-amber-500/20 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Admin Kontrolü &amp; Güvenlik</span>
                        </div>
                        <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                          {section.warnings.map((warn, idx) => (
                            <li key={idx} className="leading-relaxed">{warn}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Panele Geçiş Butonu */}
                  <div className="pt-2 flex justify-end">
                    <Link
                      href={section.href}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-purple-500/25 transition-all transform hover:-translate-y-0.5"
                    >
                      <span>{section.title} Paneline Git</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                </div>
              )}
            </div>
          );
        })}

        {filteredSections.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-[#0A0A12] rounded-2xl border border-dashed border-slate-300 dark:border-white/10 p-8 space-y-3">
            <Search className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
              "{searchQuery}" için eşleşen bir modül bulunamadı.
            </p>
            <button
              onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
              className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline"
            >
              Tüm modülleri tekrar göster
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
