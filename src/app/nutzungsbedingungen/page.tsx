import { getTenantSettings } from '@/app/actions/settings';
import React from 'react';
import LegalPageLayout from '@/components/layout/LegalPageLayout';

export default async function NutzungsbedingungenPage() {
  const res = await getTenantSettings('default-tenant');
  const settings = res.data;
  const companyName = settings?.companyName || "StarWebFlow";
  const legalName = (settings?.preferences as any)?.billing?.legalName || "Star Web Flow - Sinan Günay";
  const supportEmail = (settings?.preferences as any)?.general?.supportEmail || "info@starwebflow.com";

  const sections = [
    {
      id: 'agreement',
      title: '1. Sözleşmenin Kabulü, Taraflar ve Hizmet Modeli',
      germanTitle: '1. Geltungsbereich, Vertragspartner und Leistungsmodell',
      englishTitle: '1. Scope, Contracting Parties, and Service Model',
      content: (
        <>
          <p>
            Bu web sitesine erişerek veya hizmetlerimizden faydalanarak, merkezi Anilinerstr 3, 67105 Schifferstadt, Almanya adresinde mukim <strong>{legalName}</strong> (bundan böyle "{companyName}" olarak anılacaktır) ile bu Genel Hüküm ve Koşulları (AGB) bütünüyle kabul etmiş sayılırsınız.
          </p>
          <p>
            {companyName}, ajans, özel yazılım geliştirme, yapay zeka otomasyonları ve abonelik tabanlı (Productized Service) dijital çözümler sunar. Taraflar arasındaki tüm proje yönetimi, görev bildirimleri, revizyon ve teslimat süreçleri münhasıran {companyName} Müşteri Portalı ve kayıtlı resmi e-posta adresleri üzerinden yürütülür. Yetkisiz üçüncü taraf kanallardan (WhatsApp, kişisel sosyal medya vb.) iletilen taleplerin şirketimiz nezdinde hiçbir yasal veya operasyonel bağlayıcılığı yoktur.
          </p>
        </>
      ),
      germanContent: (
        <>
          <p>
            Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge und Dienstleistungen zwischen <strong>{legalName}</strong>, Inhaber Sinan Günay, Anilinerstr 3, 67105 Schifferstadt, Deutschland (nachfolgend "{companyName}") und dem Kunden.
          </p>
          <p>
            {companyName} erbringt Dienstleistungen in den Bereichen Webentwicklung, KI-Automatisierung, Softwareentwicklung und abonnementbasierte digitale Services (Productized Agency). Die Kommunikation und das Projektmanagement erfolgen ausschließlich über das offizielle {companyName}-Kundenportal sowie verifizierte E-Mail-Adressen. Informelle Anfragen über Messengerdienste (z. B. WhatsApp) entfalten keine rechtliche Bindungswirkung.
          </p>
        </>
      ),
      englishContent: (
        <>
          <p>
            These General Terms and Conditions (GTC / AGB) govern all contracts and services provided by <strong>{legalName}</strong> (Owner: Sinan Günay, Anilinerstr 3, 67105 Schifferstadt, Germany; hereinafter "{companyName}") and the client.
          </p>
          <p>
            {companyName} delivers bespoke web engineering, AI workflow automations, and subscription-based digital agency solutions. Project requests, tickets, approvals, and formal handovers are processed strictly via the {companyName} Client Portal and verified email channels. Unofficial communications (e.g. personal instant messengers) carry no binding legal effect.
          </p>
        </>
      )
    },
    {
      id: 'intellectual-property',
      title: '2. Mülkiyetin Saklı Tutulması (§ 449 BGB) ve Fikri Haklar',
      germanTitle: '2. Eigentumsvorbehalt (§ 449 BGB) & Urheberrechte',
      englishTitle: '2. Retention of Title (§ 449 BGB) & Intellectual Property',
      content: (
        <>
          <p>
            Alman Medeni Kanunu (§ 449 BGB Eigentumsvorbehalt) uyarınca; teslim edilen yazılımlar, tasarım dosyaları, kaynak kodlar ve dijital varlıklar üzerindeki tüm fikri mülkiyet ve kullanım hakları, <strong>fatura bedeli eksiksiz ve nakden ödenene kadar münhasıran {companyName}'a aittir</strong>.
          </p>
          <p>
            Müşterinin ödemede gecikmeye düşmesi durumunda, {companyName} derhal ve önceden ihtara gerek kalmaksızın yazılım erişimini askıya alma, sunucu barındırma hizmetini durdurma ve fikri hakların kullanımını men etme hakkına sahiptir.
          </p>
          <p>
            Aksi yönde ilave ücretlendirilmiş yazılı bir Gizlilik Sözleşmesi (White-Label / NDA) akdedilmedikçe, {companyName} tamamlanan projeleri (müşterinin gizli ticari sırları hariç tutulmak kaydıyla) portfolyosunda referans vaka çalışması (Case Study) olarak sergileme ve projenin altbilgisinde "Built by {companyName}" ibaresine yer verme hakkını saklı tutar.
          </p>
        </>
      ),
      germanContent: (
        <>
          <p>
            Gemäß § 449 BGB behält sich {companyName} das Eigentum und alle Nutzungs- sowie Verwertungsrechte an den gelieferten Arbeitsergebnissen, Quellcodes und Designs <strong>bis zur vollständigen Begleichung aller offenen Forderungen aus dem jeweiligen Vertrag vor</strong>.
          </p>
          <p>
            Bei Zahlungsverzug ist {companyName} berechtigt, den Zugriff auf erbrachte Online-Dienste, Software-Deployments oder Kundeninstanzen bis zum vollständigen Zahlungsausgleich unverzüglich zu sperren.
          </p>
          <p>
            Sofern nicht schriftlich gegen gesonderte Vergütung eine White-Label- bzw. Geheimhaltungsvereinbarung (NDA) geschlossen wurde, ist {companyName} berechtigt, erbrachte Leistungen in angemessener Form als Referenzprojekt (Portfolio, Case Study) darzustellen und eine unaufdringliche Urheberkennzeichnung ("Built by {companyName}") im Footer zu platzieren.
          </p>
        </>
      ),
      englishContent: (
        <>
          <p>
            Pursuant to § 449 German Civil Code (BGB - Eigentumsvorbehalt), all intellectual property, source codes, and usage licenses remain the sole property of {companyName} <strong>until all contractual fees and invoices are paid in full</strong>.
          </p>
          <p>
            In the event of client payment default, {companyName} reserves the absolute right to suspend hosting, deactivate API integrations, or revoke access to deployed systems without prior grace notice.
          </p>
          <p>
            Unless an explicit, separately compensated White-Label / NDA agreement has been executed, {companyName} maintains the right to showcase the finalized work as a public case study and include a subtle attribution link in the deliverables.
          </p>
        </>
      )
    },
    {
      id: 'acceptance-inspection',
      title: '3. Teslimat, Muayene ve Kabul Prosedürü (§ 640 BGB)',
      germanTitle: '3. Abnahme und Rügepflicht (§ 640 BGB)',
      englishTitle: '3. Acceptance, Inspection, and Notification (§ 640 BGB)',
      content: (
        <>
          <p>
            {companyName} tarafından geliştirilen yazılım veya aşama teslimatı müşteriye bildirildiği tarihten itibaren, müşteri <strong>7 (yedi) iş günü içerisinde</strong> teslimatı test etmek ve varsa esaslı kusurları yazılı olarak bildirmekle yükümlüdür.
          </p>
          <p>
            Bu süre zarfında yazılı, somut ve tekrarlanabilir bir ayıp bildirilmemesi veya müşterinin ilgili yazılımı/web sitesini fiilen yayına alıp ticari faaliyete sokması halinde teslimat, Alman Medeni Kanunu (§ 640 Abs. 2 BGB) uyarınca <strong>hukuken itirazsız kabul edilmiş (abgenommen)</strong> sayılır. Kabul sonrası talep edilecek yeni özellik veya tasarım değişiklikleri ek ücrete tabidir.
          </p>
        </>
      ),
      germanContent: (
        <>
          <p>
            Nach Mitteilung der Fertigstellung bzw. Bereitstellung eines Meilensteins ist der Kunde verpflichtet, das Arbeitsergebnis innerhalb einer Frist von <strong>7 (sieben) Werktagen</strong> zu prüfen und die Abnahme zu erklären oder wesentliche Mängel schriftlich und reproduzierbar zu rügen.
          </p>
          <p>
            Erfolgt innerhalb dieser Frist keine berechtigte schriftliche Mängelrüge oder setzt der Kunde das Werk ganz oder teilweise produktiv ein, <strong>gilt das Werk gemäß § 640 Abs. 2 BGB als vorbehaltlos abgenommen</strong>. Nachträgliche Änderungswünsche stellen gesondert zu vergütende Mehraufwände dar.
          </p>
        </>
      ),
      englishContent: (
        <>
          <p>
            Upon notification of milestone completion or delivery, the client is obligated to inspect the deliverables within <strong>7 (seven) business days</strong> and provide written, reproducible defect notices if any substantial flaws exist.
          </p>
          <p>
            If no written notice is provided within this inspection window, or if the client puts the software or website into live productive use, the deliverable is <strong>statutorily deemed fully accepted pursuant to § 640 para. 2 BGB</strong>. Subsequent alterations constitute chargeable change requests.
          </p>
        </>
      )
    },
    {
      id: 'subscription-rules',
      title: '4. Abonelikler, Saat Devretmeme Kuralı ve Ödemeler',
      germanTitle: '4. Abonnements, No-Rollover-Prinzip und Vergütung',
      englishTitle: '4. Subscriptions, No-Rollover Principle, and Payments',
      content: (
        <>
          <p>
            Abonelik tabanlı (Retainer) hizmetlerde, müşterinin ilgili fatura dönemi içerisinde kullanmadığı geliştirme saatleri veya görev kredileri bir sonraki aya devretmez (Kesin No-Rollover İlkesi).
          </p>
          <p>
            Tahakkuk eden veya peşin ödenen abonelik ücretleri, hizmet altyapısı ve kaynakların rezerve edilmesi nedeniyle iade edilmez (Non-Refundable). Müşteri aboneliğini istediği zaman iptal edebilir; iptal işlemi mevcut fatura döneminin bitiminde geçerli olur.
          </p>
        </>
      ),
      germanContent: (
        <>
          <p>
            Bei abonnementbasierten Dienstleistungen (Retainer) verfallen nicht genutzte Stundenkontingente oder Task-Credits mit Ablauf des jeweiligen Abrechnungsmonats; eine Übertragung in Folgemonate ist ausdrücklich ausgeschlossen (No-Rollover-Klausel).
          </p>
          <p>
            Bereits abgerechnete und fällige Abonnementgebühren sind aufgrund der verbindlichen Vorhaltung von Entwicklerkapazitäten nicht erstattungsfähig. Kündigungen sind jederzeit zum Ende des laufenden Abrechnungszeitraums über das Kundenportal möglich.
          </p>
        </>
      ),
      englishContent: (
        <>
          <p>
            For subscription/retainer engagements, unused development hours or task allocations expire at the end of each billing cycle; carrying over hours into subsequent months is strictly excluded (No-Rollover Policy).
          </p>
          <p>
            All invoiced and paid subscription fees are strictly non-refundable due to pre-allocated infrastructure and engineering capacity. Cancellations take effect at the conclusion of the active billing period.
          </p>
        </>
      )
    },
    {
      id: 'client-responsibilities',
      title: '5. Müşteri İş Birliği Yükümlülüğü ve Proje Duraklatma (Ghosting)',
      germanTitle: '5. Mitwirkungspflichten des Kunden & Projektaussetzung',
      englishTitle: '5. Client Collaboration & Project Suspension (Ghosting)',
      content: (
        <>
          <p>
            Projenin takvimine uygun ilerlemesi için müşteri; talep edilen metin, marka görseli, API anahtarları, alan adı yönlendirmeleri ve onayları gecikmeksizin sağlamak zorundadır.
          </p>
          <p>
            Müşterinin geri bildirim vermemesi veya onay eksikliği nedeniyle projenin <strong>14 günden fazla kesintiye uğraması (Ghosting)</strong> halinde, {companyName} projeyi askıya alma, yeniden başlatma halinde ek organizasyon bedeli tahakkuk ettirme veya projeyi tamamlanmış sayarak bakiye sözleşme bedelinin tamamını derhal muaccel kılma hakkına sahiptir.
          </p>
        </>
      ),
      germanContent: (
        <>
          <p>
            Der Kunde ist zur ordnungsgemäßen und zügigen Mitwirkung verpflichtet (Beistellung von Inhalten, Zugangsdaten, Schnittstellen-Keys und Freigaben).
          </p>
          <p>
            Kommt der Kunde seinen Mitwirkungspflichten trotz Erinnerung für <strong>mehr als 14 Tage nicht nach (Projektstillstand / Ghosting)</strong>, ist {companyName} berechtigt, das Projekt zu pausieren, eine Reaktivierungsgebühr zu verlangen oder die erbrachten Teilleistungen abzurechnen und das Projekt unter Fälligstellung des vereinbarten Restentgelts abzuschließen.
          </p>
        </>
      ),
      englishContent: (
        <>
          <p>
            The client is obligated to provide prompt, active collaboration by supplying required branding assets, content, API credentials, and approvals.
          </p>
          <p>
            If a project is halted for <strong>more than 14 calendar days due to client unresponsive behavior or missing approvals (Ghosting)</strong>, {companyName} reserves the right to suspend development, impose a reactivation fee, or declare the milestone concluded and invoice the full remaining contract amount immediately.
          </p>
        </>
      )
    },
    {
      id: 'liability-limitation',
      title: '6. Sorumluluk Sınırı ve Üçüncü Taraf Kesintileri',
      germanTitle: '6. Haftungsbegrenzung & Drittanbieter-Services',
      englishTitle: '6. Limitation of Liability & Third-Party Dependencies',
      content: (
        <>
          <p>
            {companyName}, teslim edilen yazılımların müşteriye belirli bir satış hacmi veya ticari başarı sağlayacağını taahhüt etmez. Şirketimizin sözleşmeden veya haksız fiilden doğabilecek toplam tazminat sorumluluğu, kasıt ve ağır kusur halleri hariç olmak üzere, <strong>müşterinin son 3 (üç) ayda ödediği net hizmet bedeli ile sınırlıdır</strong>.
          </p>
          <p>
            Dolaylı zararlar, kâr mahrumiyeti, veri kaybı veya iş durması tazminat kapsamı dışındadır. Entegre edilen üçüncü parti bulut ve API servislerinin (Stripe, OpenAI, Google, AWS, Vercel, Cloudflare vb.) fiyat artışlarından, politika değişikliklerinden veya global erişim kesintilerinden (downtime) {companyName} hiçbir surette sorumlu tutulamaz.
          </p>
        </>
      ),
      germanContent: (
        <>
          <p>
            {companyName} haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit. Bei leichter Fahrlässigkeit haftet {companyName} nur bei Verletzung wesentlicher Vertragspflichten (Kardinalpflichten), begrenzt auf den vorhersehbaren, vertragstypischen Schaden, maximal jedoch auf <strong>die Höhe der in den vorangegangenen 3 Monaten vom Kunden tatsächlich gezahlten Nettovergütung</strong>.
          </p>
          <p>
            Die Haftung für entgangenen Gewinn, mittelbare Schäden, Datenverlust oder Betriebsunterbrechungen ist ausgeschlossen. Für Ausfälle, Preisänderungen oder API-Abschaltungen externer Drittanbieter (z. B. OpenAI, Google, Stripe, Cloudflare, Vercel, AWS) übernimmt {companyName} keine Haftung.
          </p>
        </>
      ),
      englishContent: (
        <>
          <p>
            {companyName} disclaims all warranties regarding specific commercial return on investment. Except in cases of willful intent or gross negligence, total aggregate liability for any claims is strictly capped at <strong>the net fees paid by the client in the three (3) months preceding the incident</strong>.
          </p>
          <p>
            Liability for indirect losses, consequential damages, lost profits, data corruption, or downtime is explicitly excluded. {companyName} bears zero liability for outages, rate adjustments, or API deactivations caused by upstream third-party platforms (e.g. OpenAI, Google, Stripe, Vercel, AWS).
          </p>
        </>
      )
    },
    {
      id: 'jurisdiction',
      title: '7. Uygulanacak Hukuk ve Münhasır Yetkili Mahkeme',
      germanTitle: '7. Anwendbares Recht & ausschließlicher Gerichtsstand',
      englishTitle: '7. Applicable Law & Exclusive Place of Jurisdiction',
      content: (
        <>
          <p>
            Bu sözleşmeden ve tarafların ticari ilişkisinden doğacak tüm uyuşmazlıklarda <strong>Almanya Federal Cumhuriyeti Hukuku</strong> uygulanır. Birleşmiş Milletler Uluslararası Mal Satımına İlişkin Sözleşmeler Hakkında Antlaşma (CISG) uygulanmaz.
          </p>
          <p>
            Tacirler, kamu tüzel kişileri veya Almanya'da genel yetkili mahkemesi bulunmayan taraflar için doğabilecek tüm ihtilaflarda münhasır yargı yetkisi <strong>Ludwigshafen am Rhein / Speyer (Rheinland-Pfalz, Almanya) Mahkemeleri</strong>'ne aittir.
          </p>
        </>
      ),
      germanContent: (
        <>
          <p>
            Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts (CISG).
          </p>
          <p>
            Ausschließlicher Gerichtsstand für alle Streitigkeiten aus oder im Zusammenhang mit diesem Vertrag ist, soweit der Kunde Kaufmann im Sinne des HGB, eine juristische Person des öffentlichen Rechts oder ein öffentlich-rechtliches Sondervermögen ist, der Geschäftssitz von {companyName} (<strong>Amtsgericht Ludwigshafen am Rhein bzw. Landgericht Frankenthal / Speyer</strong>).
          </p>
        </>
      ),
      englishContent: (
        <>
          <p>
            These terms and all related contractual relationships shall be governed exclusively by the laws of the Federal Republic of Germany, excluding the UN Convention on Contracts for the International Sale of Goods (CISG).
          </p>
          <p>
            To the extent permitted by law, the exclusive venue and jurisdiction for all disputes arising between the parties shall be the competent courts at the registered seat of {companyName} in <strong>Ludwigshafen am Rhein / Speyer (Rhineland-Palatinate, Germany)</strong>.
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
