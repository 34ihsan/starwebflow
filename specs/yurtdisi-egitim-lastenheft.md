# YURTDIŞI EĞİTİM & KARİYER DANIŞMANLIĞI PLATFORMU
## TEKNİK VE FONKSİYONEL GEREKSİNİMLER BELGESİ (LASTENHEFT)

---

## 1. Yönetici Özeti & Vizyon (Executive Summary)

Bu proje, geleneksel yurtdışı eğitim danışmanlığı süreçlerini **Yapay Zeka Destekli Otomasyonlar** ve **Transparan Süreç Yönetimi** ile modernize etmeyi amaçlayan uçtan uca bir B2B2C yazılım platformudur. 

Platform; öğrenciler, eğitim danışmanları, partner eğitim kurumları ve süper adminler arasındaki tüm iş akışını tek bir dijital merkezde birleştirir. Statik bir web sitesinin ötesinde, arka planda çalışan yapay zeka ajanları sayesinde operasyonel verimliliği maksimuma çıkaran ve müşteri kazanım süreçlerini otomatikleştiren bir **Büyüme Motoru (Growth Engine)** olarak tasarlanmıştır.

---

## 2. İş Değeri ve ROI (Müşteri Ne Kazanacak?)

Platformun hayata geçirilmesiyle, yurtdışı eğitim firmasının elde edeceği temel ticari ve operasyonel kazanımlar şunlardır:

*   **Dönüşüm Oranlarında (CRO) %45+ Artış:** Potansiyel öğrencilerden (lead) gelen talepler, AI ajanları tarafından saniyeler içinde yanıtlanır. Sıcak leadlerin danışmanlara anında aktarılmasıyla satış kaçırma riski sıfırlanır.
*   **Operasyonel Süreçlerde %60+ Zaman Tasarrufu:** Evrakların toplanması, doğrulanması ve uygun programların tespiti gibi manuel işlemler yapay zeka tarafından yürütülür. Danışmanlar dosya takibiyle değil, öğrenci yönlendirmesiyle ilgilenir.
*   **7/24 Global Hizmet Yeteneği:** Farklı saat dilimlerindeki öğrenciler, AI Gece Asistanı ve Akıllı Eşleştirme sayesinde mesai saatleri dışında da kesintisiz destek alır.
*   **Şeffaflık ve Güven (Client Portal):** Öğrenciler başvurularının hangi aşamada olduğunu (vize, okul onayı, evrak inceleme vb.) anlık olarak takip edebilir. Bu durum, "belirsizlik" kaynaklı müşteri desteği çağrılarını %70 oranında azaltır.

---

## 3. Mevcut Sorunlar ve AI Tabanlı Çözümler (Problem vs. Solution)

| Mevcut Operasyonel Sorunlar | Platformun Sunacağı AI & Dijital Çözüm |
| :--- | :--- |
| **Manuel Belge Doğrulama:** Transkriptlerin, dil belgelerinin ve diplomaların danışmanlar tarafından tek tek incelenmesi, eksiklerin geç fark edilmesi. | **AI Document Validator:** OCR ve NLP tabanlı yapay zeka ajanı, yüklenen belgeleri saniyeler içinde analiz eder. Geçersiz veya eksik kısımları (örn. eksik imza, süresi geçmiş IELTS) anında tespit ederek öğrenciye düzeltme uyarısı gönderir. |
| **Eşleştirme ve Öneri Gecikmeleri:** Öğrencinin bütçesine, dil puanına ve not ortalamasına uygun programların aranması sürecinin günlerce sürmesi. | **AI SmartMatch Agent:** Gelişmiş veri eşleştirme motoru, öğrenci profili ile 500+ okulun 10.000+ programını saniyeler içinde kıyaslar. Finansal, akademik ve vize başarı oranına göre optimize edilmiş en iyi 3 alternatif seçeneği gerekçeleriyle sunar. |
| **Kaçırılan Potansiyel Müşteriler (Leads):** Gece veya hafta sonu gelen başvuruların geç dönülmesi sonucu öğrencilerin rakip firmalara yönelmesi. | **AI Lead & WhatsApp Agent:** Web sitesi veya WhatsApp hattı üzerinden gelen ilk soruları (örn: "Kanada dil okulu fiyatları nelerdir?") anında cevaplar. Ön eleme (bütçe, dönem) sorularını sorup lead'i skorlar ve CRM'e sıcak satış fırsatı olarak kaydeder. |
| **Süreç Takip Zorluğu:** Öğrencinin "Başvurum ne durumda?" sorusu için sürekli arama/e-posta gönderme ihtiyacı hissetmesi. | **Transparan State Machine:** Öğrenci Portalı üzerinden vize, okul kabülü, konaklama adımları net durum çizgileri (visual pipeline) üzerinden gösterilir. Durum değiştiğinde e-posta ve SMS/WhatsApp bildirimleri otomatik tetiklenir. |

---

## 4. Modüler Fonksiyonel Kapsam

Platform 4 ana modül üzerine inşa edilecektir:

### A. Öğrenci Portalı (Student Hub)
*   **Başvuru Sihirbazı:** Adım adım kişisel, akademik ve finansal profil oluşturma.
*   **Belge Yükleme Merkezi:** Sürükle-bırak yöntemiyle pasaport, transkript, niyet mektubu yükleme. Güvenli presigned upload teknolojisi.
*   **Başvuru Takip Paneli:** Okul ve vize süreçlerinin anlık durum takibi (`DRAFT` -> `DOCS_PENDING` -> `UNDER_REVIEW` -> `OFFER_SENT` -> `CONTRACT_SIGNED` -> `COMPLETED`).
*   **AI Eğitim Asistanı Chatbot:** Programlar, yaşam maliyetleri ve vize prosedürleri hakkında anlık soru-cevap.

### B. Danışman Paneli (Consultant Workstation)
*   **Öğrenci CRM Panosu:** Kendisine atanan öğrencilerin profilleri, belgeleri ve iletişim geçmişi.
*   **Belge Onaylama Ekranı:** AI tarafından ön analizi yapılmış belgeleri inceleme ve nihai onay/red verme arayüzü.
*   **Sözleşme & Teklif Sihirbazı:** Öğrenciye özel teklif ve dijital sözleşme şablonları hazırlama ve portala gönderme.
*   **Görev ve Randevu Yönetimi:** Görüşme takvimi, vize randevusu hatırlatmaları.

### C. Yapay Zeka Katmanı (AI Agents Layer)
1.  **AI SmartMatch Agent:**
    *   *Girdi:* Öğrencinin not ortalaması (GPA), bütçe limiti, hedef ülke, dil skoru (IELTS/TOEFL/Duolingo) ve alan tercihi.
    *   *Çıktı:* Başarı şansı en yüksek 3 program önerisi, tahmini kabul süresi ve vize riski analizi.
2.  **AI Document Validator:**
    *   *Girdi:* Yüklenen PDF/Görsel formatındaki belgeler.
    *   *Çıktı:* Belge türü doğrulaması (örneğin pasaport yükleme alanına transkript yüklenirse hata verir), ad-soyad uyuşmazlığı kontrolü, dil puanı doğrulaması.
3.  **AI WhatsApp Lead Agent:**
    *   *Entegrasyon:* Meta API / WhatsApp Business.
    *   *Yetenek:* Doğal dilde diyalog kurarak potansiyel müşterinin bütçesini ve gitmek istediği ülkeyi öğrenir, uygun bilgi broşürünü iletir ve danışmana "Sıcak Fırsat" olarak atar.

### D. Süper Admin & Acente Yönetimi (Agency Management)
*   **Çoklu Acente (Multi-Tenancy) Desteği:** Bayi/şube bazlı çalışan firmalar için her şubenin kendi öğrencilerini ve danışmanlarını izole şekilde yönetebilmesi.
*   **İş Analitiği Panosu:** En çok tercih edilen ülkeler, danışman performansları (ortalama kapatma süresi), başvuru kabul oranları.

---

## 5. Teknik Gereksinimler & Mimari Tercihler

*   **Frontend (Arayüz):** Next.js 15 (React 19, App Router) tabanlı, yüksek SEO performansına sahip landing page ve dinamik, hızlı Single Page Application (SPA) hissi veren dashboard yapısı. Tailwind CSS ile modern, göz yormayan, güven veren kurumsal kimlik ("Deep Blue" ve "Warm Orange" kontrastlı premium glassmorphism tasarımı).
*   **Backend (Sunucu ve İş Mantığı):** Next.js Route Handlers (Node.js/TypeScript) ile tek bir depoda (Modular Monolith) yüksek hızlı ve tip güvenli backend yapısı.
*   **Veritabanı & ORM:** PostgreSQL (Neon Serverless veya AWS RDS). ACID uyumluluğu sayesinde finansal ve sözleşme kayıtlarında sıfır hata payı. Prisma 7 ORM ile güçlü tip güvenliği ve veritabanı şema yönetimi.
*   **Dosya Depolama:** Cloudflare R2 / AWS S3. Büyük boyutlu evrakların doğrudan tarayıcı üzerinden güvenli linklerle (presigned URL) sunucuyu yormadan yüklenmesi.
*   **Kimlik Doğrulama & RBAC:** Auth.js (NextAuth) entegrasyonu. `httpOnly` cookie tabanlı oturum yönetimi ile XSS ve CSRF korumalı, rol bazlı erişim kontrolü (Student, Consultant, Agency Admin, Super Admin).

---

## 6. Güvenlik, Gizlilik & GDPR/DSGVO Uyumluluğu

*   **Bank-Grade Security:** Tüm hassas kullanıcı verileri veritabanında AES-256 şifreleme algoritması ile saklanır. İletişim tamamen TLS 1.3/HTTPS üzerinden gerçekleşir.
*   **GDPR / DSGVO ve KVKK Uyumluluğu:** 
    *   Sunucular ve veritabanları AB sınırları içinde (EU central) konumlandırılacaktır.
    *   Öğrenci kayıt olurken "Açık Rıza Metni" ve "Çerez Politikası" onay süreçleri (Consent Management) yasal mevzuata uygun tasarlanacaktır.
    *   "Hesabımı Sil / Unutulma Hakkı" entegrasyonu sayesinde kullanıcı verileri sistemden ve yedeklerden tamamen temizlenebilecektir.
*   **Tenant İzolasyonu:** Multi-tenancy mimarisi gereği, her şube veya acentenin verisi veritabanı sorguları düzeyinde `tenantId` ile filtrelenerek diğer acentelerin erişimine kesin olarak kapatılacaktır (IDOR koruması).

---

## 7. Proje Teslimat Takvimi ve Sprint Planı

Proje, 4 haftalık sprint döngüleriyle **Çevik (Agile) Metodoloji** kullanılarak teslim edilecektir:

### Sprint 1: Strateji, UI/UX Tasarımı & Altyapı (1. Hafta)
*   Veritabanı şemasının tasarlanması ve Prisma 7 entegrasyonu.
*   Auth.js ile rol bazlı yetkilendirme (RBAC) ve Tenant yapısının kurulması.
*   Figma tasarımlarının tamamlanması, kurumsal renk paleti ve premium dashboard bileşenlerinin oluşturulması.

### Sprint 2: Core Başvuru Akışı & Öğrenci/Danışman Portalları (2. Hafta)
*   Öğrenci başvuru sihirbazının yapılması.
*   Danışman paneli ve öğrenci yönetim ekranlarının inşası.
*   Cloudflare R2/S3 presigned URL güvenli belge yükleme altyapısının kurulması.
*   Başvuru durum yönetim motorunun (State Machine) entegre edilmesi.

### Sprint 3: AI Ajanları Entegrasyonu & Akıllı Eşleştirme (3. Hafta)
*   OpenAI API tabanlı **AI SmartMatch Agent**'ın yazılması ve okul veritabanıyla entegrasyonu.
*   **AI Document Validator** ajanının entegrasyonu (Evrak doğruluğunun OCR ile denetlenmesi).
*   **AI WhatsApp Lead Agent** entegrasyonu ve otomatik CRM kayıt akışı.

### Sprint 4: QA, Güvenlik Testleri, GDPR Uyum & Canlıya Alış (4. Hafta)
*   Bütünsel sistem testleri (End-to-End Testing) ve güvenlik sızma taramaları.
*   GDPR/KVKK rıza yönetimi ve veri temizleme araçlarının doğrulanması.
*   UAT (Kullanıcı Kabul Testleri) onayı ve platformun Vercel/VPS üzerine canlıya alınması.

---

## 8. Ölçülebilir Başarı Kriterleri (Acceptance Criteria)

1.  **AI SmartMatch Başarısı:** Sistem, öğrencinin akademik ve finansal girdilerine göre 3 saniye altında p95 süresi ile doğruluğu yüksek okul önerisi üretebilmelidir.
2.  **OCR Evrak Denetimi:** Yüklenen pasaport veya transkript belgelerinin doğruluğu en fazla 5 saniye içinde taranıp, eksik alanlar veya yanlış belge türü tespit edilerek sisteme raporlanmalıdır.
3.  **Hızlı Yükleme ve Mobil Uyumluluk:** Platform, PWA (Progressive Web App) uyumlu olmalı ve Lighthouse performans puanlarında mobil cihazlarda dahi minimum 90/100 skorunu yakalamalıdır.
4.  **Veri Sızıntısı Koruması:** Acentesinin `tenantId`'si dışındaki bir veriye erişmek isteyen tüm yetkisiz talepler, Next.js middleware ve veritabanı katmanında engellenerek loglanmalıdır.
