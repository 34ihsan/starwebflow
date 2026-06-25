# MODULE SPECIFICATION — Tasks & Flow

## [MODÜL]
*   **Modül adı**: `tasks` (Tasks & Flow)
*   **Risk seviyesi**: NORMAL
*   **Bağımlılıklar**: Auth, Projects (Tümü tamamlandı: Evet)
`[/MODÜL]`

---

## STOP — Başlamadan Önce Kontrol Et:
*   Tüm bağımlılıklar tamamlandı mı? **Evet (Auth ve Projects modülleri tamamlandı ve derlendi)**.
*   Architecture contract'ta bu modülle çelişen bir karar var mı? **Hayır**. Mimaride tanımlanan REST standartları ve tenant izolasyon kuralları geçerlidir.

## NON-NEGOTIABLE:
Bu modül şu kararları miras alır ve değiştiremez:
*   **Auth**: NextAuth JWT tabanlı cookies. Middleware RBAC kontrolleri.
*   **Error**: Standart error formatı.
*   **Naming**: Klasör ve dosyalarda `kebab-case`, API rotalarında `/api/v1/` standardı.
*   **State**: Global UI state için `Zustand`, server cache ve fetch işlemleri için `React Query`.

---

## 1. Kapsam & Sınırlar

### Bu Modül Tam Olarak Ne Yapar?
1.  **Görev Yönetimi (Task CRUD)**: Proje altında yeni görevler ekler, listeler, günceller ve siler.
2.  **Kanban Durum Akışı**: Görev durumlarını (`todo`, `doing`, `review`, `done`) günceller.
3.  **Görev Atamaları (Assignee)**: Ajans çalışanlarını görev sorumlusu olarak atar (`assigneeId`).
4.  **Teslim Tarihi (Due Date)**: Görevlerin tamamlanması gereken teslim tarihlerini yönetir.

### Kesinlikle Ne Yapmaz? (Boundary)
1.  **Alt Görevler (Subtasks) ve Kontrol Listeleri**: MVP kapsamında görevler tek kademelidir; alt görev dallanmaları desteklenmez.
2.  **Yorum & Tartışma Sistemi**: Görevler üzerindeki yorumlaşmalar `tasks` modülünün değil, `comments` modülünün sorumluluğundadır (MVP sonrası).

### Hangi Roller Erişebilir?
*   `AGENCY_OWNER` ve `AGENCY_MEMBER`: Görev oluşturabilir, silebilir, sorumlu atayabilir ve tüm durumları güncelleyebilir.
*   `CLIENT_OWNER` ve `CLIENT_MEMBER`: Proje altındaki görevleri görebilir, sadece `review` durumundaki görevleri onaylayıp `done` durumuna çekebilir veya revizyon için geri bırakabilir. Görev silemez ve sorumlu atayamaz.

---

## 2. Kritik User Flows

### Happy Path
1.  **Görev Tanımlama**: Ajans üyesi (`AGENCY_MEMBER`) bir proje detayına girer -> "Yeni Görev Ekle" formunu doldurur -> Başlık, açıklama ve teslim tarihi girer -> Görevi kendisi veya bir çalışma arkadaşı üzerine atar -> Görev `todo` statüsünde oluşur.
2.  **Kanban Akışı**: Sorumlu çalışan görevi `doing` durumuna çeker, işi tamamladığında müşterinin görmesi için `review` durumuna günceller.

### Edge Case'ler
1.  **Geçersiz Sorumlu Ataması (Cross-Tenant Assignee)**: Ajans üyesinin, görevi başka bir ajans tenant'ına bağlı bir kullanıcıya atamaya çalışması. API, `assigneeId` kullanıcısının aynı `tenantId` ile eşleştiğini doğrular.
2.  **Müşteri Sınırları**: Bir müşterinin görev başlığını veya açıklamasını değiştirmeye çalışması ya da görevi silmeye çalışması. API, rol kontrolü yaparak bunu engeller.
3.  **Proje-Task Tenant Uyuşmazlığı**: Bir görevin, kullanıcının erişim yetkisi olmayan başka bir tenant projesine eklenmeye çalışılması. API, `projectId` üzerinden tenant doğrulaması yapar.

---

## 3. API Şemaları

### 1. GET `/api/v1/projects/{projectId}/tasks`
*   **Açıklama**: Projeye ait tüm görevleri listeler.
*   **Response (HTTP 200 OK)**:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "task-uuid-1",
          "title": "Ana Sayfa Banner Tasarımı",
          "status": "todo",
          "assigneeId": "user-uuid-2",
          "dueDate": "2026-06-15T18:00:00Z"
        }
      ]
    }
    ```

### 2. POST `/api/v1/projects/{projectId}/tasks`
*   **Request Body**:
    ```json
    {
      "title": "Logo Vektörel Çizimi",
      "description": "Vektörel SVG formatında teslim edilecek.",
      "assigneeId": "user-uuid-2",
      "dueDate": "2026-06-12T12:00:00Z"
    }
    ```
*   **Response (HTTP 201 Created)**:
    ```json
    {
      "success": true,
      "data": {
        "id": "new-task-uuid",
        "projectId": "project-uuid-1",
        "title": "Logo Vektörel Çizimi",
        "status": "todo"
      }
    }
    ```

### 3. PUT `/api/v1/tasks/{id}`
*   **Request Body**:
    ```json
    {
      "status": "doing"
    }
    ```

---

## 4. Güvenlik Analizi

*   **Risk**: **Yetkisiz Görev Silme / Düzenleme**. Müşteri veya yetkisiz çalışanların kritik görevleri silmesi ya da durumlarını manipüle etmesi.
*   **Önlem**: Her API rotasında kullanıcının rolü (`role`) kontrol edilerek, işlem yetkisi denetlenir. Silme ve atama işlemleri sadece `AGENCY_OWNER` ve `AGENCY_MEMBER` rollerine açıktır.

---

## 5. Ölçülebilir Acceptance Criteria

1.  **Tenant İzolasyonu**: Atanan sorumlu (`assigneeId`) kesinlikle aynı tenant üyesi olmak zorundadır.
2.  **Yetki Kontrolleri**: Müşteri rolleri (`CLIENT_OWNER`, `CLIENT_MEMBER`) hiçbir görevi silemez, yeni görev oluşturamaz; sadece `status` güncelleyebilir (kısıtlı durumlarda).
3.  **Durum Geçiş Hızı**: Durum güncelleme API p95 yanıt süresi 150ms'nin altında olmalıdır.
