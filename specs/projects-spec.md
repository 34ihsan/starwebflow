# MODULE SPECIFICATION — Projects & Briefs

## [MODÜL]
*   **Modül adı**: `projects` (Projects & Briefs)
*   **Risk seviyesi**: NORMAL
*   **Bağımlılıklar**: Auth (Tümü tamamlandı: Evet)
`[/MODÜL]`

---

## STOP — Başlamadan Önce Kontrol Et:
*   Tüm bağımlılıklar tamamlandı mı? **Evet (Auth modülü tamamlandı ve derlendi)**.
*   Architecture contract'ta bu modülle çelişen bir karar var mı? **Hayır**. Mimaride belirtilen REST API standartları ve Tenant izolasyonu birebir korunacaktır.

## NON-NEGOTIABLE:
Bu modül şu kararları miras alır ve değiştiremez:
*   **Auth**: B2B Tenant tabanlı JWT (NextAuth/httpOnly cookie). Middleware düzeyinde yetki doğrulaması yapılır.
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
*   **Naming**: Dosya ve klasör adlarında `kebab-case`, componentlerde `PascalCase`, service ve API rotalarında standart isimlendirmeler.
*   **State**: Global UI state için `Zustand`, server cache ve fetch işlemleri için `React Query`.

---

## 1. Kapsam & Sınırlar

### Bu Modül Tam Olarak Ne Yapar?
1.  **Proje Oluşturma (Project Creation)**: `CLIENT_OWNER` veya `AGENCY_OWNER` tarafından yeni bir proje kaydı başlatır.
2.  **Brief Yönetimi (Brief Data)**: Projeye ait dinamik brief form verilerini yarı-yapılandırılmış JSONB formatında veritabanında saklar ve günceller.
3.  **Proje Durum Takibi**: Projenin süreç durumunu (`briefing`, `in_progress`, `review`, `completed`, `paused`) günceller ve listeler.
4.  **Multi-Tenant İzolasyonu**: Veri sızıntılarını önlemek amacıyla projeleri sadece bağlı oldukları `tenantId` ile sınırlandırır.

### Kesinlikle Ne Yapmaz? (Boundary)
1.  **Görev Yönetimi (Task Management)**: Proje altındaki iş parçacıklarının (Tasks) yönetimi bu modüle ait değildir. (Bu işlem `tasks` modülü kapsamındadır).
2.  **Dosya Depolama ve Yükleme**: Projeye yüklenen dosyaların (Assets) fiziksel depolanması ve presigned URL süreçleri `assets` modülü altındadır.

### Hangi Roller Erişebilir?
*   `CLIENT_MEMBER` ve `CLIENT_OWNER`: Kendi şirketlerine (Tenant) ait projeleri listeleyebilir ve görüntüleyebilir.
*   `AGENCY_MEMBER` ve `AGENCY_OWNER`: Ajansa bağlı tüm tenant projelerini görebilir ve güncelleyebilir.

---

## 2. Kritik User Flows

### Happy Path
1.  **Müşteri Proje Talebi (Flow 1)**: Müşteri (`CLIENT_OWNER`) portalına giriş yapar -> "Yeni Proje Başlat" formuna tıklar -> Brief form şablonunu (proje adı, detaylar, bütçe/zaman hedefleri) doldurur -> Form gönderildiğinde veritabanına `status: briefing` olarak proje kaydedilir -> Ajans paneline bildirim gider.
2.  **Ajans Proje Ataması (Flow 2)**: Ajans Yöneticisi (`AGENCY_OWNER`) gelen brief'i inceler -> Projenin durumunu `in_progress` yapar ve projeye bir yönetici (`AGENCY_MEMBER`) atar (`managerId`).

### Edge Case'ler
1.  **Eksik/Bozuk JSONB Brief Verisi**: Dinamik formlardan gelen verilerde şema bozukluğu yaşanabilir. Kayıt öncesinde Zod ile dinamik JSON yapısı kısmi valide edilir.
2.  **Farklı Tenant Projesine Erişim Girişimi**: Kötü niyetli bir müşteri (`CLIENT_OWNER`), başka bir ajansa ait `projectId` ile detay sorgularsa, API middleware/Prisma filtresi ile bunu yakalar ve `HTTP 403 Forbidden` döner.
3.  **Yönetici Atama Sınırı**: Atanmaya çalışılan `managerId` kullanıcısının o Tenant'a bağlı bir `AGENCY_MEMBER` veya `AGENCY_OWNER` olup olmadığı kontrol edilmelidir.

### Failure Senaryoları & Recovery
1.  **Dinamik Form Validasyon Hatası**: Brief formu gönderilirken validation çökerse, API isteği reddedilir ve kullanıcıya standart hata formatında eksik alanlar listelenir.

---

## 3. API Şemaları

### 1. GET `/api/v1/projects`
*   **Açıklama**: Tenant'a ait projeleri liste halinde getirir (Cursor-based pagination).
*   **Response (HTTP 200 OK)**:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "project-uuid-1",
          "title": "E-Ticaret Tasarım Revizyonu",
          "status": "in_progress",
          "createdAt": "2026-06-09T23:00:00Z"
        }
      ],
      "pagination": {
        "nextCursor": "eyJpZCI6InByb2plY3QtdXVpZC0xIn0",
        "hasNextPage": false
      }
    }
    ```

### 2. POST `/api/v1/projects`
*   **Request Body**:
    ```json
    {
      "title": "Mobil Uygulama Arayüz Tasarımı",
      "briefData": {
        "description": "Mobil arayüz tasarımı yenilenmesi.",
        "targetAudience": "Genç profesyoneller",
        "referenceUrls": ["https://dribbble.com/example"]
      }
    }
    ```
*   **Response (HTTP 201 Created)**:
    ```json
    {
      "success": true,
      "data": {
        "id": "new-project-uuid",
        "title": "Mobil Uygulama Arayüz Tasarımı",
        "status": "briefing",
        "tenantId": "tenant-uuid-1"
      }
    }
    ```

---

## 4. Güvenlik Analizi

*   **Risk**: **IDOR (Insecure Direct Object Reference)**. Bir kullanıcının URL'deki `projectId` UUID parametresini değiştirerek başka bir firmaya ait gizli tasarımları ve brief verilerini okuyabilmesi.
*   **Önlem**: API'nin ve veritabanı sorgularının en altında, oturum açmış kullanıcının `tenantId`'si ile projenin `tenantId`'sinin birebir eşleştiğini doğrulamak. Eşleşmiyorsa veri yokmuş gibi davranılması veya doğrudan HTTP 403 hata kodu dönülmesi.

---

## 5. Ölçülebilir Acceptance Criteria

1.  **Tenant İzolasyonu**: Hiçbir müşteri, başka bir tenant'a ait projeyi listeleyemez, detayını sorgulayamaz veya güncelleyemez. (Test senaryoları ile kanıtlanmalıdır).
2.  **Sorgu Performansı**: `GET /api/v1/projects` listeleme sorgusu, tenant projeleri filtrelenirken p95 seviyesinde < 100ms sürede tamamlanmalıdır.
3.  **Dinamik Brief Desteği**: `briefData` JSONB alanı, dinamik form alanlarını esnek biçimde tutabilmeli ve PostgreSQL JSONB indeksleri sayesinde performans kaybı yaşatmamalıdır.
