import { getTenantSettings } from '@/app/actions/settings';
import React from 'react';
import LegalPageLayout from '@/components/layout/LegalPageLayout';

export default async function NutzungsbedingungenPage() {
  const res = await getTenantSettings('default-tenant');
  const settings = res.data;
  const companyName = settings?.companyName || "StarWebFlow";
  const legalName = (settings?.preferences as any)?.general?.legalName || "StarWebFlow GmbH";
  const supportEmail = (settings?.preferences as any)?.general?.supportEmail || "support@starwebflow.com";

  const sections = [
    {
      id: 'agreement',
      title: '1. Sözleşmenin Kabulü ve Hizmet Modeli',
      germanTitle: '1. Vertragsannahme und Dienstleistungsmodell',
      englishTitle: '1. Acceptance of Terms and Service Model',
      content: (
        <>
          <p>
            Bu web sitesine erişerek ve hizmetlerimizi kullanarak, {legalName} (bundan böyle "{companyName}" olarak anılacaktır) ile bu Hizmet Şartlarını kabul etmiş sayılırsınız.
          </p>
          <p>
            {companyName}, ajans ve abonelik tabanlı (productized service) dijital hizmetler sunar. Abonelik veya proje anlaşması başlatan tüm müşteriler, iletişim ve proje yönetiminin münhasıran {companyName} Müşteri Portalı veya belirlenen resmi kanallar üzerinden yürütüleceğini kabul eder. Resmi olmayan kanallardan (WhatsApp, yetkisiz e-posta vb.) gelen talepler işleme alınmaz ve yasal bağlayıcılığı yoktur.
          </p>
        </>
      ),
      germanContent: (
        <>
          <p>
            Durch den Zugriff auf diese Website und die Nutzung unserer Dienste stimmen Sie diesen Nutzungsbedingungen mit {legalName} (im Folgenden als "{companyName}" bezeichnet) zu.
          </p>
          <p>
            {companyName} bietet agentur- und abonnementbasierte (productized service) digitale Dienstleistungen an. Alle Kunden erklären sich damit einverstanden, dass die Kommunikation und das Projektmanagement ausschließlich über das {companyName} Kundenportal oder festgelegte offizielle Kanäle abgewickelt werden. Anfragen über inoffizielle Kanäle (z.B. WhatsApp) werden nicht bearbeitet.
          </p>
        </>
      ),
      englishContent: (
        <>
          <p>
            By accessing this website and using our services, you agree to these Terms of Service with {legalName} (hereinafter referred to as "{companyName}").
          </p>
          <p>
            {companyName} provides agency and subscription-based digital services. All clients agree that communication and project management will be conducted exclusively through the {companyName} Client Portal or official channels. Requests from unofficial channels are not processed.
          </p>
        </>
      )
    },
    {
      id: 'intellectual-property',
      title: '2. Fikri Mülkiyet Hakları ve Lisans',
      germanTitle: '2. Geistiges Eigentum und Lizenzen',
      englishTitle: '2. Intellectual Property Rights and License',
      content: (
        <>
          <p>
            Üretilen tüm yazılımlar, tasarımlar, grafikler ve kaynak kodlarının mülkiyeti ve telif hakları, proje veya abonelik kapsamındaki <strong>tüm ödemeler eksiksiz olarak yapılana kadar</strong> tamamen {companyName}'a aittir. Ödemeler tamamlandıktan sonra müşteriye ilgili ürün için ticari kullanım lisansı devredilir; ancak altyapı bileşenleri, şirket içi framework'ler ve açık kaynaklı kütüphanelerin fikri mülkiyeti {companyName} veya asıl hak sahiplerinde kalır.
          </p>
          <p>
            Aksi yönde ekstra ücretlendirilmiş yazılı bir Gizlilik Sözleşmesi (White-Label / NDA) imzalanmadıkça, {companyName} üretilen ve tamamlanan işleri, referans, vaka çalışması (case study) ve portfolyo amacıyla kendi web sitesinde veya pazarlama materyallerinde (gizli şirket/müşteri verileri hariç olmak üzere) sergileme ve "Tarafından Yapıldı" (Built by {companyName}) ibaresini projede uygun bir yere ekleme hakkını saklı tutar.
          </p>
        </>
      ),
      germanContent: (
        <>
          <p>
            Das Eigentum und die Urheberrechte an allen erstellten Softwares, Designs und Quellcodes verbleiben bei {companyName}, <strong>bis alle Zahlungen vollständig geleistet sind</strong>. Nach vollständiger Bezahlung erhält der Kunde eine kommerzielle Nutzungslizenz; das Eigentum an zugrundeliegenden Frameworks und Open-Source-Komponenten verbleibt jedoch bei {companyName} oder den jeweiligen Rechteinhabern.
          </p>
          <p>
            Sofern keine gesondert vergütete Geheimhaltungsvereinbarung (NDA) geschlossen wurde, behält sich {companyName} das Recht vor, die abgeschlossenen Arbeiten (ausgenommen vertrauliche Daten) als Referenz in Portfolios zu nutzen und einen "Built by {companyName}"-Hinweis im Projekt zu platzieren.
          </p>
        </>
      ),
      englishContent: (
        <>
          <p>
            Ownership and copyrights of all software, designs, and source codes produced remain solely with {companyName} <strong>until all payments have been made in full</strong>. Upon full payment, a commercial use license is transferred to the client; however, ownership of underlying frameworks and open-source libraries remains with {companyName} or the original rights holders.
          </p>
          <p>
            Unless a separately billed Non-Disclosure Agreement (NDA / White-label) is signed, {companyName} reserves the right to showcase the completed work (excluding confidential data) as a reference in portfolios and marketing materials, and to include a "Built by {companyName}" attribution in the project.
          </p>
        </>
      )
    },
    {
      id: 'subscription-rules',
      title: '3. Abonelik, Kredi Devri ve Fiyatlandırma',
      germanTitle: '3. Abonnement, Guthabenübertragung und Preisgestaltung',
      englishTitle: '3. Subscription, Credit Rollover and Pricing',
      content: (
        <>
          <p>
            Abonelik tabanlı (Retainer) hizmetlerde, müşterinin ilgili ay içerisindeki kullanılmayan çalışma saatleri veya tanımlı görev hakları (krediler) kesinlikle bir sonraki aya devretmez (No Rollover Policy).
          </p>
          <p>
            {companyName}, hizmet bedellerini, abonelik paket ücretlerini ve saatlik danışmanlık oranlarını dilediği zaman, önceden makul bir süre bildirerek değiştirme hakkını saklı tutar. Müşteri, aboneliğini dilediği zaman iptal edebilir; iptal işlemi mevcut fatura döneminin sonundan itibaren geçerli olur. Tahsil edilmiş ücretler iade edilmez.
          </p>
        </>
      ),
      germanContent: (
        <>
          <p>
            Bei abonnementbasierten Diensten (Retainer) werden ungenutzte Arbeitsstunden oder Credits des Kunden innerhalb des jeweiligen Monats nicht auf den nächsten Monat übertragen (No Rollover Policy).
          </p>
          <p>
            {companyName} behält sich das Recht vor, Servicegebühren, Abonnementpreise und Stundensätze jederzeit mit angemessener Vorankündigung zu ändern. Der Kunde kann sein Abonnement jederzeit kündigen; die Kündigung wird zum Ende des aktuellen Abrechnungszeitraums wirksam. Bereits erhobene Gebühren werden nicht erstattet.
          </p>
        </>
      ),
      englishContent: (
        <>
          <p>
            In subscription-based (Retainer) services, the client's unused working hours or defined task rights (credits) within the respective month strictly do not roll over to the next month (No Rollover Policy).
          </p>
          <p>
            {companyName} reserves the right to change service fees, subscription prices, and hourly rates at any time with reasonable prior notice. The client can cancel their subscription at any time; cancellation is effective at the end of the current billing cycle. Collected fees are non-refundable.
          </p>
        </>
      )
    },
    {
      id: 'client-responsibilities',
      title: '4. Müşteri Sorumlulukları ve Gecikmeler',
      germanTitle: '4. Kundenpflichten und Verzögerungen',
      englishTitle: '4. Client Responsibilities and Delays',
      content: (
        <>
          <p>
            Projenin ilerleyebilmesi için müşteri, ihtiyaç duyulan tüm materyalleri (metin, görsel, API anahtarları, geri bildirim vb.) zamanında ve eksiksiz olarak sağlamakla yükümlüdür.
          </p>
          <p>
            Müşteriden kaynaklanan bilgi veya onay eksiklikleri nedeniyle projenin <strong>14 günden fazla beklemede kalması (Ghosting)</strong> durumunda, {companyName} projeyi askıya alma ve yeniden başlatma ücreti talep etme veya projeyi mevcut haliyle tamamlanmış sayıp kalan bakiyenin tamamını faturalandırma hakkına sahiptir. Müşteri gecikmelerinden kaynaklanan teslimat uzamalarından {companyName} sorumlu tutulamaz.
          </p>
        </>
      ),
      germanContent: (
        <>
          <p>
            Für den Fortschritt des Projekts ist der Kunde verpflichtet, alle benötigten Materialien (Texte, Bilder, API-Schlüssel, Feedback usw.) rechtzeitig und vollständig zur Verfügung zu stellen.
          </p>
          <p>
            Wenn das Projekt aufgrund mangelnder Informationen oder Freigaben seitens des Kunden für <strong>mehr als 14 Tage pausiert (Ghosting)</strong>, hat {companyName} das Recht, das Projekt auszusetzen und eine Wiederaufnahmegebühr zu erheben oder das Projekt im aktuellen Zustand als abgeschlossen zu betrachten und den vollen Restbetrag in Rechnung zu stellen.
          </p>
        </>
      ),
      englishContent: (
        <>
          <p>
            For the project to progress, the client is obliged to provide all necessary materials (texts, images, API keys, feedback, etc.) in a timely and complete manner.
          </p>
          <p>
            If the project is put on hold for <strong>more than 14 days due to lack of information or approval from the client (Ghosting)</strong>, {companyName} has the right to suspend the project and charge a restart fee, or consider the project completed in its current state and invoice the entire remaining balance. {companyName} cannot be held responsible for delivery extensions caused by client delays.
          </p>
        </>
      )
    },
    {
      id: 'liability-limitation',
      title: '5. Sorumlulukların Sınırlandırılması ve Üçüncü Taraf Hizmetleri',
      germanTitle: '5. Haftungsbeschränkung und Dienste Dritter',
      englishTitle: '5. Limitation of Liability and Third-Party Services',
      content: (
        <>
          <p>
            {companyName}, teslim edilen yazılımın, tasarımın veya stratejinin müşterinin ticari başarı (satış artışı, kar sağlama) elde etmesini garanti etmez. {companyName}'ın, hizmetlerin kullanımından veya kullanılamamasından kaynaklanan dolaylı zararlar, veri kaybı, kar kaybı veya iş kesintisi için sorumluluğu, yasaların izin verdiği azami ölçüde, <strong>müşterinin son 3 ayda ödediği toplam hizmet bedeli ile sınırlıdır.</strong>
          </p>
          <p>
            Web siteleri veya uygulamalar için entegre edilen üçüncü taraf servislerin (örneğin; Stripe, Vercel, OpenAI, AWS vb.) fiyat politikalarından, erişim kesintilerinden (downtime) veya API değişikliklerinden dolayı projede oluşabilecek aksaklıklardan {companyName} hiçbir şekilde sorumlu tutulamaz. Ek olarak şirketimiz, yazılım projeleri için "uptime garantisi" sağlamaz (Aksi yönde SLA sözleşmesi imzalanmadıkça).
          </p>
        </>
      ),
      germanContent: (
        <>
          <p>
            {companyName} garantiert nicht, dass die gelieferte Software oder das Design zu kommerziellem Erfolg führt. Die Haftung von {companyName} für indirekte Schäden, Datenverlust, entgangenen Gewinn oder Betriebsunterbrechungen ist im gesetzlich zulässigen Höchstmaß auf <strong>den Betrag beschränkt, den der Kunde in den letzten 3 Monaten gezahlt hat.</strong>
          </p>
          <p>
            {companyName} haftet in keiner Weise für Störungen, die durch Preisänderungen, Ausfallzeiten (Downtime) oder API-Änderungen integrierter Dienste Dritter (z.B. Stripe, Vercel, OpenAI) entstehen. Es gibt keine "Uptime-Garantie" für die Dienstleistungen (es sei denn, ein spezieller SLA-Vertrag wurde unterzeichnet).
          </p>
        </>
      ),
      englishContent: (
        <>
          <p>
            {companyName} does not guarantee that the delivered software, design, or strategy will result in commercial success for the client. {companyName}'s liability for indirect damages, data loss, lost profits, or business interruption arising from the use of services is limited, to the maximum extent permitted by law, to <strong>the total service fee paid by the client in the last 3 months.</strong>
          </p>
          <p>
            {companyName} cannot be held responsible in any way for disruptions in the project caused by pricing policies, downtime, or API changes of third-party services integrated (e.g., Stripe, Vercel, OpenAI). Additionally, our company does not provide an "uptime guarantee" (Unless an SLA contract is signed to the contrary).
          </p>
        </>
      )
    },
    {
      id: 'jurisdiction',
      title: '6. Yetkili Mahkeme ve Hukuk',
      germanTitle: '6. Anwendbares Recht & Gerichtsstand',
      englishTitle: '6. Applicable Law & Jurisdiction',
      content: (
        <>
          <p>
            Bu Kullanım Koşullarından doğabilecek tüm ihtilaflarda Alman Hukuku uygulanacaktır. İhtilafların çözümünde Almanya (ilgili eyalet) Mahkemeleri münhasıran yetkilidir.
          </p>
          <p>
            Herhangi bir yasal sorunda bizimle {supportEmail} adresi üzerinden iletişime geçebilirsiniz.
          </p>
        </>
      ),
      germanContent: (
        <>
          <p>
            Für diese Nutzungsbedingungen gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand für alle Streitigkeiten aus oder im Zusammenhang mit diesem Vertrag ist Deutschland.
          </p>
          <p>
            Bei rechtlichen Fragen können Sie uns unter {supportEmail} kontaktieren.
          </p>
        </>
      ),
      englishContent: (
        <>
          <p>
            German Law shall apply to all disputes arising from these Terms of Use. The Courts of Germany shall have exclusive jurisdiction for the resolution of disputes.
          </p>
          <p>
            For any legal issues, you can contact us at {supportEmail}.
          </p>
        </>
      )
    }
  ];

  return (
    <LegalPageLayout
      title="Hizmet ve Kullanım Koşulları"
      germanTitle="Allgemeine Geschäftsbedingungen"
      englishTitle="Terms of Service"
      subtitle={`${companyName} hizmetlerinin kullanımına ilişkin yasal kurallar ve ticari sınırlar.`}
      germanSubtitle={`Rechtliche Regeln und kommerzielle Grenzen für die Nutzung von ${companyName}-Diensten.`}
      englishSubtitle={`Legal rules and commercial limitations regarding the use of ${companyName} services.`}
      lastUpdated="21 Haziran 2026"
      germanLastUpdated="21. Juni 2026"
      englishLastUpdated="June 21, 2026"
      sections={sections}
    />
  );
}
