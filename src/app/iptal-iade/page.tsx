import { getTenantSettings } from '@/app/actions/settings';
import React from 'react';
import LegalPageLayout from '@/components/layout/LegalPageLayout';

export default async function IptalIadePage() {
  const res = await getTenantSettings('default-tenant');
  const settings = res.data;
  const companyName = settings?.companyName || "StarWebFlow";
  const supportEmail = (settings?.preferences as any)?.general?.supportEmail || "support@starwebflow.com";

  const sections = [
    {
      id: 'no-refund-policy',
      title: '1. İade Edilmeme Politikası (No Refund Policy)',
      germanTitle: '1. Keine-Rückerstattungs-Richtlinie',
      englishTitle: '1. No Refund Policy',
      content: (
        <>
          <p>
            {companyName} tarafından sunulan hizmetler; özel yazılım geliştirme, dijital tasarım, AI ajan geliştirme ve danışmanlık gibi tamamen müşteriye özel üretilen, anında ifa edilen ve geri alınması/iadesi mümkün olmayan dijital hizmetler kapsamındadır.
          </p>
          <p>
            Bu nedenle, projeye veya ilgili abonelik paketine ait çalışmalar (araştırma, UX tasarımı, kodlama vb.) başladıktan sonra, yapılan <strong>hiçbir ödeme için para iadesi (refund) yapılmamaktadır.</strong>
          </p>
        </>
      ),
      germanContent: (
        <>
          <p>
            Die von {companyName} angebotenen Dienstleistungen umfassen vollständig kundenspezifische, sofort erbrachte und unwiderrufliche digitale Dienstleistungen (z. B. individuelle Softwareentwicklung, AI-Entwicklung).
          </p>
          <p>
            Daher werden nach Beginn der Arbeiten an einem Projekt oder Abonnementpaket <strong>keine Rückerstattungen für geleistete Zahlungen gewährt.</strong>
          </p>
        </>
      ),
      englishContent: (
        <>
          <p>
            The services offered by {companyName} fall under the scope of completely custom-made, instantly performed, and irrevocable digital services such as custom software development, AI agent development, and digital consulting.
          </p>
          <p>
            Therefore, once work has commenced on a project or subscription package, <strong>no refunds will be issued for any payments made.</strong>
          </p>
        </>
      )
    },
    {
      id: 'subscription-cancellation',
      title: '2. Abonelik İptali',
      germanTitle: '2. Kündigung des Abonnements',
      englishTitle: '2. Subscription Cancellation',
      content: (
        <>
          <p>
            Aylık veya yıllık retainer (abonelik) paketi satın alan müşterilerimiz, aboneliklerini diledikleri zaman iptal etme hakkına sahiptir. İptal talepleri sadece Müşteri Portalı üzerinden veya resmi yetkili destek kanallarından ({supportEmail}) yapılmalıdır.
          </p>
          <p>
            İptal işlemi, halihazırda ödemesi yapılmış olan ve devam eden fatura döngüsünün sonunda devreye girer. Yani müşteri, o ayın sonuna kadar hakkı olan hizmetleri kullanmaya devam edebilir, ancak bir sonraki ay için faturalandırma yapılmaz. Devam eden aya ait iade kesinlikle söz konusu değildir.
          </p>
        </>
      ),
      germanContent: (
        <>
          <p>
            Kunden, die ein monatliches oder jährliches Retainer-Paket (Abonnement) erwerben, haben das Recht, ihr Abonnement jederzeit zu kündigen. Kündigungsanfragen müssen über das Kundenportal gestellt werden.
          </p>
          <p>
            Die Kündigung wird am Ende des bereits bezahlten und laufenden Abrechnungszyklus wirksam. Das bedeutet, dass der Kunde die Dienste bis zum Ende dieses Monats weiterhin nutzen kann. Eine Rückerstattung für den laufenden Monat ist ausgeschlossen.
          </p>
        </>
      ),
      englishContent: (
        <>
          <p>
            Customers who purchase a monthly or yearly retainer (subscription) package have the right to cancel their subscription at any time. Cancellation requests must be made via the Client Portal.
          </p>
          <p>
            The cancellation takes effect at the end of the already paid and ongoing billing cycle. This means the customer can continue to use the services until the end of that month. There are absolutely no refunds for the ongoing month.
          </p>
        </>
      )
    },
    {
      id: 'right-of-withdrawal',
      title: '3. Cayma Hakkı İstisnası',
      germanTitle: '3. Ausnahme vom Widerrufsrecht',
      englishTitle: '3. Exception to the Right of Withdrawal',
      content: (
        <>
          <p>
            Tüketici koruma yasaları ve elektronik ticaret mevzuatları uyarınca; "elektronik ortamda anında ifa edilen hizmetler ve tüketiciye anında teslim edilen gayrimaddi mallar", cayma hakkının istisnaları arasındadır. {companyName} hizmetleri (Yazılım, Kod, Tasarım dosyaları) bu kapsama girdiğinden, ödeme sonrası süreçte yasal cayma hakkı süresi (14 gün) uygulanmaz.
          </p>
        </>
      ),
      germanContent: (
        <>
          <p>
            Gemäß Verbraucherschutzgesetzen und E-Commerce-Vorschriften sind "Dienstleistungen, die sofort elektronisch erbracht werden, und immaterielle Güter, die dem Verbraucher sofort geliefert werden" von den Ausnahmen des Widerrufsrechts erfasst. Da die Dienstleistungen von {companyName} in diese Kategorie fallen, gilt keine gesetzliche Widerrufsfrist.
          </p>
        </>
      ),
      englishContent: (
        <>
          <p>
            In accordance with consumer protection laws and e-commerce regulations, "services performed instantly in an electronic environment and intangible goods delivered instantly to the consumer" are among the exceptions to the right of withdrawal. Since {companyName} services fall into this category, the statutory right of withdrawal period (14 days) does not apply.
          </p>
        </>
      )
    },
    {
      id: 'chargeback-abuse',
      title: '4. Ters İbraz (Chargeback) Kötüye Kullanımı ve Hizmetlerin Durdurulması',
      germanTitle: '4. Missbrauch von Rückbuchungen (Chargebacks) und Einstellung der Dienste',
      englishTitle: '4. Chargeback Abuse and Suspension of Services',
      content: (
        <>
          <p>
            Proje kapsamında veya abonelik sürecinde, müşteri tarafından önceden yazılı olarak bildirilmiş ve {companyName} tarafından kabul edilmiş geçerli bir yasal sebep olmaksızın, banka veya kredi kartı sağlayıcısı üzerinden "ters ibraz (chargeback)" veya haksız ödeme itirazı yapılması durumunda; {companyName}, müşteriye ait tüm sunucuları, veritabanlarını, tasarımları, kaynak kodlarını ve yazılım lisanslarını anında, haber vermeksizin ve kalıcı olarak erişime kapatma, askıya alma veya silme hakkını saklı tutar.
          </p>
          <p>
            Haksız ters ibrazlardan (Chargeback fraud) doğan tüm maddi zararlar (hizmet bedelleri, banka kesintileri), hukuki, avukatlık ve idari masraflar müşteriden yasal yollarla ve tazminat davası açılarak rücu edilir. İhtilaf durumunda {companyName} müşteri portalındaki iş teslim onay logları, e-posta kayıtları ve proje ilerleme raporları kesin delil olarak resmi makamlara sunulacaktır.
          </p>
        </>
      ),
      germanContent: (
        <>
          <p>
            Sollte ein Kunde ohne gültigen rechtlichen Grund eine "Rückbuchung" (Chargeback) über seine Bank oder seinen Kreditkartenanbieter einleiten, behält sich {companyName} das Recht vor, die Server, Datenbanken, Quellcodes und Lizenzen des Kunden mit sofortiger Wirkung, ohne vorherige Ankündigung und dauerhaft auszusetzen oder zu löschen.
          </p>
          <p>
            Alle finanziellen Verluste (Dienstleistungsgebühren, Bankgebühren) sowie rechtliche und administrative Kosten, die aus ungerechtfertigten Rückbuchungen (Chargeback-Betrug) resultieren, werden vom Kunden auf dem Rechtsweg eingefordert. Im Streitfall dienen Freigabe-Logs im Kundenportal, E-Mails und Projektberichte als endgültiger rechtlicher Beweis.
          </p>
        </>
      ),
      englishContent: (
        <>
          <p>
            If a client initiates a "chargeback" or unjustified payment dispute through their bank or credit card provider without a valid legal reason during the project or subscription process; {companyName} reserves the right to instantly, without notice, and permanently suspend or delete all of the client's servers, databases, designs, source codes, and software licenses.
          </p>
          <p>
            All financial losses (service fees, bank deductions), legal, attorney, and administrative costs arising from unjustified chargebacks (Chargeback fraud) will be recovered from the client through legal means and compensation lawsuits. In case of dispute, work delivery approval logs in the client portal, email records, and project progress reports will be presented to official authorities as conclusive evidence.
          </p>
        </>
      )
    }
  ];

  return (
    <LegalPageLayout
      title="İptal ve İade Politikası"
      germanTitle="Widerrufsbelehrung & Rückerstattung"
      englishTitle="Cancellation & Refund Policy"
      subtitle={`${companyName} abonelik iptalleri ve iade koşullarına dair yasal bilgilendirme.`}
      germanSubtitle={`Rechtliche Informationen zu Abonnementkündigungen und Rückerstattungsbedingungen für ${companyName}.`}
      englishSubtitle={`Legal information regarding subscription cancellations and refund conditions for ${companyName}.`}
      lastUpdated="21 Haziran 2026"
      germanLastUpdated="21. Juni 2026"
      englishLastUpdated="June 21, 2026"
      sections={sections}
    />
  );
}
