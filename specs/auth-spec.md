# MODULE SPECIFICATION — Auth & Tenant Init

## [MODÜL]
*   **Modül adı**: `auth` (Auth & Tenant Init)
*   **Risk seviyesi**: KRİTİK
*   **Bağımlılıklar**: Yok (Tümü tamamlandı: Evet)
`[/MODÜL]`

---

## STOP — Başlamadan Önce Kontrol Et:
*   Tüm bağımlılıklar tamamlandı mı? **Evet (Bağımlılık yok)**.
*   Architecture contract'ta bu modülle çelişen bir karar var mı? **Hayır**. Mimaride tanımlanan JWT-session, httpOnly cookie ve RBAC modeli birebir uygulanacaktır.

## NON-NEGOTIABLE:
Bu modül şu kararları miras alır ve değiştiremez:
*   **Auth**: Auth.js tabanlı JWT (JSON Web Token) Session. Token storage: `httpOnly`, `secure`, `sameSite: lax` cookie'leri. JWT expire süresi 1 gün, silent refresh tetikleyicisi son 4 saat. Rol modeli: `SUPER_ADMIN`, `AGENCY_OWNER`, `AGENCY_MEMBER`, `CLIENT_OWNER`, `CLIENT_MEMBER`.
*   **Error**: Standart error formatı:
    ```json
    {
      "success": false,
      "error": {
        "code": "[ERROR_CODE]",
        "message": "[Kullanıcı dostu mesaj]",
        "details": []
      }
    }
    ```
*   **Naming**: Dosya ve klasör adlarında `kebab-case`, componentlerde `PascalCase`, hooklarda `useResourceAction`, API route'larında `/api/v1/auth/...` yapısı.
*   **State**: Global UI state için `Zustand`, server cache ve fetch işlemleri için `React Query`.

---

## 1. Kapsam & Sınırlar

### Bu Modül Tam Olarak Ne Yapar?
1.  **Tenant Initialization (Ajans Kurulumu)**: İlk kez kayıt olan bir ajans için `Tenant` kaydı oluşturur, bu ajansa ait benzersiz `slug` ataması yapar ve kurucu kullanıcıyı `AGENCY_OWNER` rolüyle kaydeder.
2.  **Kimlik Doğrulama (Authentication)**: E-posta/şifre çifti ve Google OAuth ile güvenli kimlik doğrulama sağlar. Doğrulama başarılı olduğunda JWT üretir ve cookie'lere yazar.
3.  **Yetki Kontrolü (Authorization / RBAC)**: Next.js middleware düzeyinde JWT çözerek kullanıcının rolüne göre `/admin` veya `/client` yollarına erişimini denetler.
4.  **Şifre Yönetimi**: Kayıp şifreler için Resend e-posta servisi üzerinden süreli şifre sıfırlama (Reset Password token) akışını yürütür.

### Kesinlikle Ne Yapmaz? (Boundary)
1.  **Çoklu Tenant Sahipliği**: Bir kullanıcı aynı anda birden fazla bağımsız ajans tenant'ına doğrudan üye olamaz. Her kullanıcı tek bir `tenantId` ile eşleşir.
2.  **Özel Domain Yönlendirmesi (Custom Domains/CNAME)**: Bu aşamada ajanslar kendi özel domainlerini (örn: `portal.ajansadi.com`) bağlayamazlar. Sadece `starwebflow.com/slug` veya `slug.starwebflow.com` (wildcard DNS) üzerinden erişim sağlanır.
3.  **İki Faktörlü Doğrulama (2FA)**: MVP kapsamında SMS veya Authenticator app tabanlı 2FA doğrulaması desteklenmeyecektir.

### Hangi Roller Erişebilir?
*   `/api/v1/auth/login` ve `/api/v1/auth/register-tenant` endpoint'lerine kimlik doğrulaması yapılmamış (misafir) kullanıcılar erişebilir.
*   `/api/v1/auth/logout` ve `/api/v1/auth/me` endpoint'lerine tüm roller erişebilir.
*   Tenant davet etme ve alt kullanıcı yönetimi sadece `AGENCY_OWNER` ve `SUPER_ADMIN` rolleriyle sınırlandırılmıştır.

---

## 2. Kritik User Flows

### Happy Path (Adım Adım)
#### Flow 1: Yeni Ajans Kaydı & Tenant Init
1.  Kullanıcı landing page'de "Ajansını Başlat" butonuna tıklar.
2.  Ajans Adı, Slug, Ad Soyad, E-posta ve Şifre bilgilerini doldurur.
3.  Form gönderildiğinde frontend (Zod ile) validasyon yapar ve API'ye POST isteği gönderir.
4.  Backend veritabanında `slug` ve `email` kontrolü yapar (benzersiz olmalıdır).
5.  İşlem transaction içinde yürütülür:
    *   `Tenant` kaydı oluşturulur.
    *   Şifre bcrypt ile hash'lenir.
    *   `User` kaydı oluşturulur ve `role` alanı `AGENCY_OWNER` olarak atanır.
6.  Başarılı kayıt sonrası Auth.js JWT session üretilir, httpOnly cookie yazılır.
7.  Kullanıcı `/admin/dashboard` sayfasına yönlendirilir.

#### Flow 2: E-posta / Şifre Giriş & Sessiz Yenileme
1.  Kullanıcı `/login` sayfasına gelir, e-posta ve şifresini girer.
2.  API isteği şifreyi doğrular, JWT oluşturup cookie olarak döner.
3.  Kullanıcı portalda gezinirken her sayfa geçişinde Next.js middleware JWT'nin expire süresini okur.
4.  JWT süresinin dolmasına 4 saat veya daha az kaldıysa, middleware arka planda token süresini 1 gün daha uzatacak şekilde `Set-Cookie` header'ını günceller.

### Edge Case'ler
1.  **Slug Çakışması**: Kullanıcı `Ajans XYZ` ismiyle kaydolmak ister ve sistem otomatik olarak `ajans-xyz` slug'ını üretir. Eğer bu slug veritabanında zaten varsa, API hata döner. Frontend kullanıcıya "Bu adres alınmış, alternatif deneyin" mesajı gösterir ve slug alanını manuel düzenlenebilir hale getirir.
2.  **Aynı E-posta ile Tekrar Kayıt**: E-posta adresi sistem genelinde benzersizdir. Zaten kayıtlı olan bir e-posta ile yeni bir Tenant açılmaya çalışıldığında şifre veya hesap sızdırılmasını önlemek amacıyla "Bu e-posta kullanımda" genel hatası dönülür.
3.  **Abonelik İptal Durumunda Auth**: Aboneliği askıya alınan veya iptal edilen bir `AGENCY_OWNER` giriş yapabilir ancak middleware onu doğrudan `/billing` (ödeme güncelleme) ekranına yönlendirir, diğer dashboard yolları engellenir.

### Failure Senaryoları & Recovery
1.  **Veritabanı Transaction Hatası**: Tenant kaydı başarılı olur fakat User kaydı sırasında veritabanı bağlantısı koparsa, transaction otomatik rollback edilir. Kullanıcıya "Kayıt sırasında teknik bir hata oluştu, lütfen tekrar deneyin" denir (yarı-oluşturulmuş yetim tenant'lar önlenir).
2.  **Resend Mail Servisi Kesintisi**: Kullanıcı şifre sıfırlama talep ettiğinde e-posta gönderim API'si çökerse, backend işlemi durdurur, veritabanına token'ı kaydetmez ve kullanıcıya "E-posta gönderiminde hata oluştu, lütfen birazdan tekrar deneyin" bilgisi döner.

---

## 3. API Şemaları

### 1. POST `/api/v1/auth/register-tenant`
*   **Açıklama**: Yeni bir ajans yapısı ve kurucu kullanıcıyı oluşturur.
*   **Request Body**:
    ```json
    {
      "agencyName": "Beta Creative",
      "slug": "beta-creative",
      "fullName": "Ahmet Yılmaz",
      "email": "ahmet@betacreative.com",
      "password": "Password123!"
    }
    ```
*   **Validation Kuralları**:
    *   `agencyName`: string, min 2, max 100 karakter.
    *   `slug`: string, min 2, max 50 karakter, sadece küçük harf, sayı ve tire (`-`).
    *   `fullName`: string, min 2, max 100 karakter.
    *   `email`: geçerli email formatı.
    *   `password`: string, min 8 karakter, en az 1 büyük harf, 1 küçük harf ve 1 sayı içermeli.
*   **Response (HTTP 201 Created)**:
    ```json
    {
      "success": true,
      "data": {
        "userId": "d290f1ee-6c54-4b01-90e6-d701748f0851",
        "tenantId": "fa8172df-8239-44af-888e-4a6c6e7f1020",
        "slug": "beta-creative",
        "role": "AGENCY_OWNER"
      }
    }
    ```

### 2. POST `/api/v1/auth/login`
*   **Request Body**:
    ```json
    {
      "email": "ahmet@betacreative.com",
      "password": "Password123!"
    }
    ```
*   **Response (HTTP 200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "userId": "d290f1ee-6c54-4b01-90e6-d701748f0851",
        "tenantId": "fa8172df-8239-44af-888e-4a6c6e7f1020",
        "role": "AGENCY_OWNER"
      }
    }
    ```
*   **Response Header**:
    `Set-Cookie: next-auth.session-token=jwt_data; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`

---

## 4. Veritabanı Tasarımı (Auth Modülü)

### İlgili Tablolar
*   **Tenant**: Ajans bilgilerini tutar.
*   **User**: Kullanıcı bilgilerini ve şifre hash'ini tutar.
*   **PasswordResetToken**: Şifre sıfırlama istekleri için kısa ömürlü token'ları tutar.

### Veritabanı İlişkileri & Şema Detayı
```
Tenant (1) <--- (N) User
User (1) <--- (N) PasswordResetToken
```

#### PasswordResetToken Tablo Yapısı:
*   `id`: UUID (Primary Key)
*   `userId`: UUID (Foreign Key -> User.id, ON DELETE CASCADE)
*   `token`: String (Unique, Hashlenmiş token verisi)
*   `expiresAt`: Timestamp
*   `used`: Boolean (Default false)
*   `created_at`: Timestamp

### Migration Listesi
1.  `01_create_tenant_table`: `Tenant` tablosunun oluşturulması (id, name, slug, created_at, updated_at).
2.  `02_create_user_table`: `User` tablosunun oluşturulması (id, tenantId, email, passwordHash, name, role, created_at, updated_at).
3.  `03_create_password_reset_token_table`: `PasswordResetToken` tablosunun oluşturulması.
4.  `04_add_unique_constraints_and_indices`: `users.email` ve `tenants.slug` alanlarına unique index'lerin tanımlanması.

---

## 5. Güvenlik Analizi

### Risk 1: Kaba Kuvvet Saldırısı (Brute Force on Password Login)
*   **Tehdit**: Saldırganın popüler şifre listeleriyle API'ye sürekli istek atması.
*   **Önlem**: Redis tabanlı sliding-window rate limiter. Aynı IP adresinden veya aynı e-posta hesabı için 15 dakika içinde en fazla 5 başarısız login denemesine izin verilir. Limit aşılırsa IP/Hesap 15 dakika süreyle kilitlenir.

### Risk 2: XSS ve Token Hırsızlığı (Token Stealing via XSS)
*   **Tehdit**: XSS açığı kullanılarak kullanıcının localStorage'ındaki token'ın çalınması.
*   **Önlem**: Session token'ı hiçbir şekilde client-side JavaScript kodu tarafından erişilemeyen `httpOnly` cookie'lerinde tutulur. `Secure` flag aktif edilerek sadece HTTPS üzerinden iletilmesi garanti edilir.

### Risk 3: Şifre Sızıntısı (Database Compromise)
*   **Tehdit**: Veritabanının sızdırılması durumunda kullanıcı şifrelerinin açığa çıkması.
*   **Önlem**: Şifreler veritabanına asla düz metin yazılmaz. Yüksek maliyetli ve güvenli olan **bcrypt** (salt rounds = 12) algoritması ile tek yönlü hash'lenerek saklanır.

---

## 6. Ölçülebilir Acceptance Criteria

1.  **Giriş Yanıt Süresi (Latency)**: E-posta ve şifre doğrulama (login) API isteğinin p95 yanıt süresi 350ms'nin altında olmalıdır (bcrypt hash hesaplaması dahil).
2.  **Sessiz Token Yenileme**: Kullanıcı sayfada aktifken, ömrü 4 saatten az kalmış geçerli bir JWT, herhangi bir API isteğinde arka planda kullanıcının haberi olmadan ve oturumu kesintiye uğratmadan otomatik yenilenmelidir.
3.  **Güvenli Hashing**: Veritabanındaki hiçbir şifre kaydı düz metin (plaintext) veya MD5/SHA1 gibi zayıf algoritmalarla şifrelenmiş olamaz; tamamı bcrypt ile hash'lenmiş olmalıdır.
4.  **Middleware Yetki Kararı (RBAC Overhead)**: Middleware düzeyinde yapılan JWT doğrulama ve yetki kontrolü işlemi, istek başına toplam yanıt süresine en fazla 15ms gecikme eklemelidir (Edge optimized).
5.  **Multi-Tenant İzolasyon Kontrolü**: `AGENCY_MEMBER` veya `CLIENT_MEMBER` rolündeki bir kullanıcının kendi `tenantId`'si dışındaki bir `tenantId`'ye sahip veriyi (User, Project vb.) talep ettiği tüm API istekleri tavizsiz olarak HTTP 403 Forbidden ile reddedilmelidir.
