# Müşteri Bulma Canavarı (Ultimate Lead Scraper) Mimari Tasarımı

Bu otomasyon sıradan bir arka plan işleminden çıkıp, sistemin **ana büyüme motoru (Growth Engine)** haline geldiği için, onu çok yönlü ve esnek bir mimariyle tasarlamalıyız. Sadece "Berlin" ve "Diş Kliniği" değil, dünyanın herhangi bir yerindeki herhangi bir sektörü avlayabilecek bir "Canavar" tasarlıyoruz.

## 1. Çok Yönlü Tasarım Felsefesi

Bu sistemi tek bir scraping koduna bağlamak yerine, kullanıcının hedefine göre farklı silahlar seçebileceği bir **Modüler Kazıma Ağı** olarak tasarlamalıyız.

### A. Hedefleme Modülleri (Kimi Arıyoruz?)
Otomasyon arayüzünde (veya özel bir Müşteri Bul ekranında) yöneticinin girebileceği dinamik parametreler:
*   **Sektör (Niche):** Anahtar kelime (Örn: "Avukat", "SaaS Şirketleri", "Güzellik Salonu")
*   **Lokasyon:** Ülke, Şehir veya Posta Kodu (Örn: "Londra", "Texas", "Kadıköy")
*   **Platform Seçimi:** 
    *   *Google Maps:* Yerel işletmeler (Klinik, Restoran, Tesisatçı) için.
    *   *LinkedIn:* Kurumsal B2B (Yazılım, Danışmanlık, İK) için.
    *   *Apollo.io / Contact Out:* Karar vericilerin (CEO, CTO) direkt e-postalarını bulmak için.

### B. Yapay Zeka İşleme Merkezi (Zenginleştirme)
Ham veriler geldiğinde AI (Star AI) sadece isim temizlemekle kalmayıp **sektöre özel bir ajan** gibi çalışmalıdır:
*   *Sektör Tespiti:* Bulunan şirketin web sitesini ziyaret edip ne iş yaptığını anlama.
*   *Kişiselleştirme Kancası:* Web sitesinden bir cümle alıp, atılacak ilk e-postanın içine "Sitenizde X hizmetini verdiğinizi gördüm..." şeklinde **buz kırıcı (ice-breaker)** bir cümle ekleme.

### C. Zekice Dağıtım (Akıllı Filtreleme)
Bulunan binlerce kişi direkt e-posta yağmuruna tutulmaz.
*   **Çöpleri Ekleme:** Web sitesi veya e-postası olmayanlar elenir.
*   **VIP Skorlama:** Ciro potansiyeli yüksek duranlar (büyük şirketler) CRM'de "VIP" olarak etiketlenip manuel aramaya (Call) düşer, küçükler ise otomatik e-posta kampanyasına aktarılır.

---

## 2. Sisteme Nasıl Entegre Edeceğiz? (Geliştirme Planı)

Bu yapıyı UI (Arayüz) ve Backend olarak iki aşamada geliştireceğiz.

# AI-First Otomasyon Oluşturucu (Prompt-based Automation Builder)

Mevcut durumda otomasyonlar sadece "isim" girilerek ve sabit şablonlarla oluşturuluyor. Bu durum, sistemin esnekliğini kısıtlıyor ve adminin kendi senaryolarını kolayca oluşturmasını engelliyor.

Bu problemi aşmak için **"Doğal Dil ile Akış Tasarımı (AI-First Automation Builder)"** yöntemini uygulamalıyız.

## User Review Required

> [!IMPORTANT]
> Bu vizyon, sistemin kullanım kolaylığını (UX) tamamen değiştirecek bir adımdır. Otomasyon oluşturmayı teknik bir iş olmaktan çıkarıp, ChatGPT ile konuşur gibi bir deneyime dönüştüreceğiz. Lütfen aşağıdaki akışı ve UI planını inceleyip onaylayın.

## Open Questions

1. Yapay zeka otomasyonu oluşturduktan sonra, kullanıcının bunu görsel olarak inceleyip manuel müdahale edebileceği ekranı basit liste formatında mı tutalım, yoksa (ileride) React Flow gibi görsel bir Canvas (sürükle-bırak) yapısına mı geçelim? Şu anki aşamada liste tabanlı gelişmiş bir UI yeterli olur mu?

## Proposed Changes

### 1. Yeni Otomasyon Ekleme Modalının Değişimi (Prompt-based Creation)
Sabit şablon butonları yerine, adminin karşısına geniş bir metin kutusu (`textarea`) çıkacak.
**Admin:** *"Bir müşteri teklifi onayladığında, ona teşekkür emaili at, Projeler panosunda yeni proje aç ve Slack'e bildirim gönder."* yazacak.
Sistem (simüle edilmiş AI), bu metni analiz edip `Trigger` ve `Action` düğümlerini (nodes) otomatik oluşturacak.

#### [MODIFY] src/app/admin/automations/AutomationsDashboardClient.tsx
- `isAddModalOpen` içeriği tamamen değiştirilecek.
- Sadece `newFlowName` yerine `promptText` state'i eklenecek.
- "Yapay Zeka ile Oluştur" butonu eklenecek ve tıklandığında prompta uygun bir `nodes` dizisi üreten mock bir AI fonksiyonu çalıştırılacak.

### 2. Gelişmiş Kural Düzenleyici (Visual Rule Builder)
Yapay zeka akışı oluşturduktan sonra, admin az önce yaptığımız "Akışı Düzenle" ekranının daha gelişmiş bir versiyonuna yönlendirilecek.
- **Tetikleyici (Trigger) Seçimi:** Açılır menü ile (Örn: Zamanlanmış, Webhook, Veritabanı Değişikliği).
- **Aksiyon (Action) Zinciri:** Her aksiyon için hangi uygulamanın (Email, CRM, Slack) kullanılacağı ve parametreleri açıkça görülebilecek.
- **Test Et (Dry Run):** Akışı canlıya almadan önce simüle edip çıktıları görebilme.

### 3. Doğal Dil ile Edit (Conversational Editing)
"Düzenle" modalı içine de bir AI input'u eklenecek.
**Admin:** *"Email adımından önce 1 gün bekleme süresi ekle."*
Sistem mevcut kuralları güncelleyip "Delay (24h)" adımını araya yerleştirecek.

## Verification Plan

### Manual Verification
- Otomasyon Ekle butonuna basılacak. Doğal dilde bir prompt girilecek.
- Sistemin bu promp'ta uygun Tetikleyici ve Aksiyonları içeren bir akış oluşturduğu görülecek.
- Oluşan akış "Düzenle" butonuyla açılıp, manuel ekleme/çıkarma yapılabildiği doğrulanacak.

### [MODIFY] `src/lib/automation/nodes/external-actions.ts`
*   Apify bağlantısını dinamikleştireceğiz. `nodeData.sector` ve `nodeData.location` verilerini parametrik hale getireceğiz.
*   Gelen verileri zenginleştirmek için (Web sitesinden meta açıklama çekmek gibi) ekstra Node.js kütüphaneleri (örn: `cheerio` veya hafif bir fetcher) ekleyeceğiz.

### [MODIFY] E-posta Şablonları (Email Pool) Entegrasyonu
*   Daha önce yaptığımız hibrid e-posta motoru ile bu Canavar'ı birleştireceğiz. "Müşteri Avcısı"nın bulduğu her yeni Lead için, sektöre özel hazırlanmış o Master Sablonlardan biri seçilip taslağa (Draft) atılacak.

## User Review Required

> [!IMPORTANT]
> Bu vizyon sistemi inanılmaz bir boyuta taşıyor. Bunu gerçekleştirmek için şu sırayı izlemeyi öneriyorum:
> 
> 1. CRM altında veya ayrı bir menü olarak görsel olarak çok şık, haritalı/radarlı bir **"Müşteri Avcısı" sayfası (UI)** tasarlayayım. (Kullanıcı şehir, sektör ve limit girebilsin).
> 2. Bu UI, arka planda az önce yazdığımız Automation Engine'i tetikleyip işlemleri başlatsın.
> 3. Bulunan müşteriler, daha önce tasarladığımız Hibrid E-Posta motoruna (Templates) bağlansın.
>
> Bu yaklaşım (Özel sayfa yapma fikri) sizin hayalinizdeki çok yönlü kullanıma uygun mu? Uygunsa ilk adım olan özel sayfanın (UI) inşası ile başlayayım mı?
