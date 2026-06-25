import { getTenantSettings } from '@/app/actions/settings';
import React from 'react';
import LegalPageLayout from '@/components/layout/LegalPageLayout';

export default async function RevizyonPolitikasiPage() {
  const res = await getTenantSettings('default-tenant');
  const settings = res.data;
  const companyName = settings?.companyName || "StarWebFlow";

  const sections = [
    {
      id: 'revision-limits',
      title: '1. Revizyon Tanımı ve Kapsam Koruma (Scope Creep)',
      germanTitle: '1. Revisionsdefinition und Schutz vor Scope Creep',
      englishTitle: '1. Revision Definition and Scope Creep Protection',
      content: (
        <>
          <p>
            {companyName}, ajans ve müşteri arasındaki projelerin sağlıklı ve zamanında ilerleyebilmesi için revizyon sınırlarını net bir şekilde belirlemiştir. <strong>"Revizyon"</strong>, hali hazırda üretilmiş olan bir tasarım veya kod bloğunun renk, yazı tipi, hizalama veya küçük metin değişiklikleri gibi minör düzenlemelerini kapsar.
          </p>
          <p>
            İlk onaylanan proje özetine (Brief) veya teknik şartnameye (Scope) uymayan; tamamen yeni bir sayfa tasarımı, yeni bir iş mantığı (logic) eklenmesi veya baştan aşağı farklı bir tasarım talebi "revizyon" olarak değerlendirilmez; bunlar yepyeni bir özellik talebi (New Feature) olarak projelendirilir ve ek ücrete / yeni iş paketine tabidir.
          </p>
          <p>
            Aksi paket detaylarında veya özel bir sözleşmede açıkça belirtilmedikçe, teslim edilen her bir ana görev veya tasarım için <strong>maksimum 3 adet ücretsiz revizyon hakkı</strong> bulunmaktadır.
          </p>
        </>
      ),
      germanContent: (
        <>
          <p>
            {companyName} hat klare Revisionsgrenzen festgelegt. Eine <strong>"Revision"</strong> umfasst geringfügige Anpassungen (z. B. Farbe, Schriftart, Ausrichtung, Text) an bereits erstellten Designs oder Codeblöcken.
          </p>
          <p>
            Völlig neue Funktions- oder Designanfragen, die nicht dem ursprünglich genehmigten Projekt-Briefing (Scope) entsprechen, gelten nicht als "Revision"; sie werden als völlig neue Funktion (New Feature) behandelt und unterliegen zusätzlichen Gebühren.
          </p>
          <p>
            Sofern nicht anders angegeben, gilt für jede gelieferte Hauptaufgabe ein Limit von <strong>maximal 3 kostenlosen Revisionen</strong>.
          </p>
        </>
      ),
      englishContent: (
        <>
          <p>
            {companyName} has established clear revision limits. A <strong>"revision"</strong> covers minor adjustments (e.g., color, font, alignment, small text changes) to an already produced design or code block.
          </p>
          <p>
            Completely new feature requests, new page designs, or logic additions that do not comply with the initially approved project brief (Scope) are not considered "revisions"; they are treated as a New Feature and are subject to additional fees or a new work package.
          </p>
          <p>
            Unless otherwise specified, there is a limit of <strong>a maximum of 3 free revisions</strong> for each delivered main task.
          </p>
        </>
      )
    },
    {
      id: 'auto-approval',
      title: '2. Otomatik Onay Süreci (Auto-Approval) ve Karar Değişikliği',
      germanTitle: '2. Automatischer Genehmigungsprozess und Meinungsänderung',
      englishTitle: '2. Auto-Approval Process and Change of Mind',
      content: (
        <>
          <p>
            Teslimatların hızını kesmemek ve projenin duraklamasını engellemek amacıyla bir sessizlik onayı kuralı uygulanmaktadır. {companyName} tarafından tamamlanarak incelemeye sunulan (Review statüsündeki) işlere, müşteri tarafından <strong>3 takvim günü içerisinde</strong> yazılı olarak bir revizyon talebi veya itiraz gelmemesi durumunda;
          </p>
          <p>
            İlgili iş <strong>koşulsuz şartsız onaylanmış (Approved) kabul edilir</strong>. Müşterinin açıkça onayladığı (veya otomatik onaylanan) bir aşamadan sonra (örneğin; tel çerçeve - wireframe onaylandıktan sonra kodlama aşamasındayken), onaylanmış aşamaya dönüp yapılacak tasarımsal veya yapısal değişiklik talepleri (Change of Mind / Fikir Değişikliği) ücretsiz revizyon kapsamına girmez ve yeni bir iş kalemi (task) olarak faturalandırılır.
          </p>
        </>
      ),
      germanContent: (
        <>
          <p>
            Um Verzögerungen bei den Lieferungen zu vermeiden, wird eine Schweigezustimmungsregel angewendet. Erfolgt vom Kunden innerhalb von <strong>3 Kalendertagen</strong> kein schriftliches Feedback zu einer zur Überprüfung vorgelegten Arbeit, wird diese <strong>bedingungslos als genehmigt (Approved) betrachtet</strong>.
          </p>
          <p>
            Änderungsanfragen zu einer bereits ausdrücklich (oder automatisch) genehmigten Phase (z.B. Designänderungen, nachdem das Wireframe genehmigt wurde und die Codierung begonnen hat), fallen nicht unter die kostenlosen Revisionen und werden als neue Aufgabe in Rechnung gestellt (Change of Mind).
          </p>
        </>
      ),
      englishContent: (
        <>
          <p>
            To avoid slowing down deliveries, a silence-approval rule is enforced. If no written revision request is received from the client within <strong>3 calendar days</strong> for work submitted for review, the respective work is <strong>unconditionally considered approved</strong>.
          </p>
          <p>
            Structural or design change requests made to an already explicitly (or automatically) approved stage (e.g., requesting a design overhaul after the wireframe is approved and coding has begun) do not fall under free revisions and are billed as a new task (Change of Mind).
          </p>
        </>
      )
    },
    {
      id: 'bug-warranty',
      title: '3. Hata Düzeltme Garantisi (Bug Fix Warranty) ve Bakım',
      germanTitle: '3. Fehlerbehebungsgarantie und Wartung',
      englishTitle: '3. Bug Fix Warranty and Maintenance',
      content: (
        <>
          <p>
            {companyName}, teslim edilen bir projenin teknik şartnameye (Scope) tam olarak uygun çalıştığını garanti eder. Projenin (veya ilgili modülün) canlıya alınmasından / teslim edilmesinden sonraki <strong>14 gün boyunca</strong>, teknik şartnamede yer almasına rağmen çalışmayan veya hatalı çalışan fonksiyonlar (Bug) ücretsiz olarak düzeltilir.
          </p>
          <p>
            Bu garanti süresi dolduktan sonra talep edilecek her türlü hata düzeltmesi, performans optimizasyonu veya sunucu güncellemesi, müşterinin aktif bir bakım (Maintenance) aboneliğine sahip olmasını veya saatlik danışmanlık ücreti üzerinden ödeme yapmasını gerektirir. Üçüncü taraf API'lerin bozulması veya müşteri tarafından kodlara/sisteme yapılan yetkisiz müdahaleler garanti kapsamı dışındadır.
          </p>
        </>
      ),
      germanContent: (
        <>
          <p>
            {companyName} garantiert, dass das gelieferte Projekt genau den technischen Spezifikationen (Scope) entspricht. Für <strong>14 Tage</strong> nach Lieferung/Live-Schaltung werden Funktionen, die laut Spezifikation vorhanden sein sollten, aber nicht funktionieren (Bugs), kostenlos behoben.
          </p>
          <p>
            Nach Ablauf dieser Garantiezeit erfordern alle Fehlerbehebungen oder Updates ein aktives Wartungsabonnement (Maintenance) oder werden nach Stundensatz berechnet. Ausfälle von Drittanbieter-APIs oder unbefugte Codeänderungen durch den Kunden sind von der Garantie ausgeschlossen.
          </p>
        </>
      ),
      englishContent: (
        <>
          <p>
            {companyName} guarantees that the delivered project works exactly as per the technical specifications (Scope). For <strong>14 days</strong> following the delivery/go-live of the project (or relevant module), functions that fail to work despite being in the specifications (Bugs) will be fixed free of charge.
          </p>
          <p>
            Any bug fixes, performance optimizations, or server updates requested after this warranty period require the client to have an active Maintenance subscription or be billed at an hourly rate. Breakages in third-party APIs or unauthorized code modifications by the client are excluded from the warranty.
          </p>
        </>
      )
    },
    {
      id: 'delivery-times',
      title: '4. Teslimat Süreleri (ETA) ve Gecikmeler',
      germanTitle: '4. Lieferzeiten (ETA) und Verzögerungen',
      englishTitle: '4. Delivery Times (ETA) and Delays',
      content: (
        <>
          <p>
            {companyName} tarafından verilen tüm teslimat süreleri tahmini sürelerdir (Estimated Time of Arrival) ve kesin bir hukuki taahhüt (strict deadline) oluşturmaz. Projenin karmaşıklığı, müşteri geri dönüş hızı ve ek revizyon talepleri bu süreleri esnetebilir. Gecikmelerden dolayı veya fırsat kayıplarından dolayı şirketimizden tazminat talep edilemez.
          </p>
        </>
      ),
      germanContent: (
        <>
          <p>
            Alle von {companyName} angegebenen Lieferzeiten sind Schätzungen (ETA) und stellen keine strikte rechtliche Frist dar. Komplexität, Feedback-Geschwindigkeit des Kunden und zusätzliche Revisionsanfragen können diese Zeiten verlängern. Es können keine Entschädigungen für Verzögerungen oder entgangene Geschäftsmöglichkeiten gefordert werden.
          </p>
        </>
      ),
      englishContent: (
        <>
          <p>
            All delivery times provided by {companyName} are estimated times of arrival (ETA) and do not constitute a strict legal deadline. Complexity, client feedback speed, and extra revision requests can stretch these times. No compensation can be claimed for delays or lost business opportunities.
          </p>
        </>
      )
    }
  ];

  return (
    <LegalPageLayout
      title="Revizyon ve Teslimat Politikası"
      germanTitle="Revisions- und Lieferrichtlinie"
      englishTitle="Revision & Delivery Policy"
      subtitle={`${companyName} proje ilerleyişini koruyan revizyon limitleri ve onay mekanizmaları.`}
      germanSubtitle={`Revisionsgrenzen und Genehmigungsmechanismen zum Schutz des Projektfortschritts von ${companyName}.`}
      englishSubtitle={`Revision limits and approval mechanisms that protect the project progress of ${companyName}.`}
      lastUpdated="21 Haziran 2026"
      germanLastUpdated="21. Juni 2026"
      englishLastUpdated="June 21, 2026"
      sections={sections}
    />
  );
}
