'use client'

import React from 'react'
import LegalPageLayout from '@/components/layout/LegalPageLayout'

export default function KVKKPage() {
  const sections = [
    {
      id: 'kvkk-intro',
      title: '1. Giriş ve Veri Sorumlusu Bilgilendirmesi',
      germanTitle: '1. Einführung & Informationen zum Verantwortlichen',
      englishTitle: '1. Introduction & Data Controller Information',
      content: (
        <>
          <p>
            StarWebFlow Dijital Ajans olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, veri sorumlusu sıfatıyla, kişisel verilerinizin güvenliğine ve hukuka uygun şekilde işlenmesine büyük önem veriyoruz.
          </p>
          <p>
            Bu Aydınlatma Metni, web sitemiz üzerindeki etkileşimli araçları (ROI Hesaplayıcı, Spec-Builder) ve başvuru formlarını kullandığınızda kendi toplayacağımız kişisel verilerinizin işlenme amaçlarını, hukuki sebeplerini, aktarılabileceği üçüncü tarafları ve KVKK kapsamında sahip olduğunuz hakları açıklamak amacıyla hazırlanmıştır.
          </p>
        </>
      ),
      germanContent: (
        <>
          <p>
            Als StarWebFlow legen wir großen Wert auf die rechtmäßige Verarbeitung und Sicherheit Ihrer personenbezogenen Daten gemäß dem türkischen Datenschutzgesetz Nr. 6698 (KVKK).
          </p>
          <p>
            Diese Aufklärungserklärung dient dazu, Sie über die Zwecke der Datenverarbeitung, Rechtsgrundlagen, Weitergabe an Dritte und Ihre Rechte im Rahmen des Gesetzes Nr. 6698 zu informieren.
          </p>
        </>
      ),
      englishContent: (
        <>
          <p>
            As StarWebFlow, we attach great importance to the security and lawful processing of your personal data as a data controller in accordance with the Personal Data Protection Law No. 6698 (“KVKK”).
          </p>
          <p>
            This Clarification Text has been prepared to explain the purposes, legal grounds, third parties to whom the personal data collected when you use interactive tools and application forms on our website may be transferred, and the rights you have under KVKK.
          </p>
        </>
      )
    },
    {
      id: 'kvkk-data-categories',
      title: '2. İşlenen Kişisel Veri Kategorileri ve Toplama Yöntemleri',
      germanTitle: '2. Kategorien verarbeiteter Daten & Erhebungsmethoden',
      englishTitle: '2. Processed Personal Data Categories & Collection Methods',
      content: (
        <>
          <p>
            Web sitemiz üzerinden dijital, otomatik ve kısmen otomatik yöntemlerle aşağıdaki kişisel veri kategorileriniz toplanmakta ve işlenmektedir:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Kimlik Bilgisi:</strong> Adınız ve soyadınız.</li>
            <li><strong>İletişim Bilgisi:</strong> E-posta adresiniz, telefon numaranız.</li>
            <li><strong>Kurumsal Bilgi:</strong> Temsil ettiğiniz şirketin adı, departmanınız veya unvanınız.</li>
            <li><strong>İşlem Güvenliği ve Davranışsal Analiz:</strong> İnternet sitesi trafik logları (IP adresiniz, erişim saatleriniz), sayfa içi gezinme hareketleriniz ve simülasyon araçlarındaki tercihleriniz.</li>
            <li><strong>Yapay Zeka (AI) Etkileşim Logları:</strong> Chatbot üzerinden veya formlarla ilettiğiniz mesaj içerikleri ve talepleriniz.</li>
          </ul>
        </>
      ),
      germanContent: (
        <>
          <p>
            Folgende personenbezogene Daten werden über unsere Website automatisch oder teilautomatisiert erfasst:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Identitätsdaten:</strong> Vor- und Nachname.</li>
            <li><strong>Kontaktdaten:</strong> E-Mail-Adresse, Telefonnummer.</li>
            <li><strong>Unternehmensdaten:</strong> Name des vertretenen Unternehmens.</li>
            <li><strong>Nutzungs- & Sicherheitsdaten:</strong> Server-Logfiles (IP-Adresse, Zugriffszeiten), im ROI-Rechner gewählte Parameter und Projektideen.</li>
          </ul>
        </>
      ),
      englishContent: (
        <>
          <p>
            The following categories of your personal data are collected and processed through our website via digital, automatic, and partially automatic methods:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Identity Information:</strong> Your name and surname.</li>
            <li><strong>Contact Information:</strong> Your email address, phone number.</li>
            <li><strong>Corporate Information:</strong> Name of the company you represent, your department or title.</li>
            <li><strong>Transaction Security and Behavioral Analysis:</strong> Website traffic logs (your IP address, access times), in-page navigation movements, and preferences in simulation tools.</li>
            <li><strong>AI Interaction Logs:</strong> Message contents and requests you send via chatbot or forms.</li>
          </ul>
        </>
      )
    },
    {
      id: 'kvkk-processing-purposes',
      title: '3. Kişisel Verilerin İşlenme Amaçları ve Hukuki Sebepleri',
      germanTitle: '3. Zwecke & Rechtsgrundlagen der Datenverarbeitung',
      englishTitle: '3. Purposes & Legal Basis of Processing Personal Data',
      content: (
        <>
          <p>
            Kişisel verileriniz, Kanun’un 5. maddesinde belirtilen hukuki sebepler çerçevesinde ve şirketimizin lehine olacak hukuki korumalar kapsamında şu amaçlarla işlenir:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Sözleşmenin Kurulması ve İfası (KVKK M. 5/2-c):</strong> Girdiğiniz verilere göre size özel şartname (Lastenheft) raporunun hazırlanması, iletilmesi ve sözleşme öncesi teklif süreçlerinin yürütülmesi.</li>
            <li><strong>Veri Sorumlusunun Meşru Menfaatleri (KVKK M. 5/2-f):</strong> Web sitemizin performansının izlenmesi, güvenlik duvarları oluşturulması ve sahte başvuruların tespiti. Yapay zeka (AI) aracılığıyla site içi davranışlarınızın anlık analiz edilerek hizmetlerin kişiselleştirilmesi.</li>
            <li><strong>Açık Rıza (KVKK M. 5/1):</strong> İletişim izni vermeniz halinde, yeni ürün, kampanya ve strateji raporlarımızın e-posta yoluyla gönderilmesi.</li>
          </ul>
        </>
      ),
      germanContent: (
        <>
          <p>
            Ihre personenbezogenen Daten werden gemäß Art. 5 KVKK für folgende Zwecke verarbeitet:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Vertragsanbahnung (Art. 5 Abs. 2 lit. c KVKK):</strong> Erstellung und Zusendung des Lastenhefts basierend auf Ihren Projektangaben.</li>
            <li><strong>Berechtigte Interessen (Art. 5 Abs. 2 lit. f KVKK):</strong> Gewährleistung der IT-Sicherheit der Website, Spam-Abwehr und Performance-Optimierung.</li>
            <li><strong>Einwilligung (Art. 5 Abs. 1 KVKK):</strong> Für Marketing-Aktivitäten wie dem E-Mail-Newsletter, sofern Sie eingewilligt haben.</li>
          </ul>
        </>
      ),
      englishContent: (
        <>
          <p>
            Your personal data is processed for the following purposes within the framework of the legal grounds specified in Article 5 of the Law:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Establishment and Performance of the Contract (KVKK Art. 5/2-c):</strong> Preparation and transmission of a custom specification (Lastenheft) report based on the data you enter, and conducting pre-contractual proposal processes.</li>
            <li><strong>Legitimate Interests of the Data Controller (KVKK Art. 5/2-f):</strong> Monitoring the performance of our website, building firewalls, and detecting fake applications. Real-time analysis of your in-site behavior via AI to personalize services.</li>
            <li><strong>Explicit Consent (KVKK Art. 5/1):</strong> Sending new product, campaign, and strategy reports via email if you give communication permission.</li>
          </ul>
        </>
      )
    },
    {
      id: 'kvkk-data-transfer',
      title: '4. İşlenen Verilerin Kimlere ve Hangi Amaçlarla Aktarılabileceği',
      germanTitle: '4. Datenübermittlung & deren Zwecke',
      englishTitle: '4. To Whom and For What Purposes Processed Data May Be Transferred',
      content: (
        <>
          <p>
            Toplanan kişisel verileriniz, yukarıda belirtilen işleme amaçlarının gerçekleştirilmesiyle sınırlı olarak ve şirketimizin haklarını korumak üzere; iş ortaklarımıza, bulut altyapı sağlayıcılarımıza (Vercel, AWS), takvim planlama servislerimize (Calendly) ve iletişim/davranış analizi amaçlı yapay zeka servis sağlayıcılarına (Örn: OpenAI API, Gemini API) veri işleme şartları doğrultusunda aktarılabilecektir.
          </p>
          <p>
            Sunucu altyapılarımızın (hosting) yurt dışında (Almanya) bulunması nedeniyle, sisteme girdiğiniz veriler teknik barındırma standartları gereği güvenli ve KVKK yurt dışı aktarım şartlarına / GDPR uyumlu sunucularda saklanmaktadır.
          </p>
        </>
      ),
      germanContent: (
        <>
          <p>
            Die erhobenen Daten können zur Erfüllung der oben genannten Zwecke an unsere Cloud-Dienstleister (Vercel & AWS in Frankfurt, Deutschland) sowie an gesetzlich befugte Behörden zur Erfüllung rechtlicher Pflichten übermittelt werden.
          </p>
        </>
      ),
      englishContent: (
        <>
          <p>
            Your collected personal data may be transferred, limited to the realization of the processing purposes stated above and to protect our company's rights, to our business partners, cloud infrastructure providers (Vercel, AWS), calendar scheduling services (Calendly), and AI service providers (e.g., OpenAI API, Gemini API) in line with data processing conditions.
          </p>
          <p>
            Due to our hosting infrastructures being located abroad (Germany), the data you enter into the system is stored securely on GDPR-compliant servers in accordance with technical hosting standards and KVKK overseas transfer conditions.
          </p>
        </>
      )
    },
    {
      id: 'data-processor',
      title: '5. Veri İşleyen Sıfatıyla Sorumluluk İstisnalarımız',
      germanTitle: '5. Haftungsausschluss als Auftragsverarbeiter',
      englishTitle: '5. Our Exclusions of Liability as a Data Processor',
      content: (
        <>
          <p>
            StarWebFlow olarak müşterilerimize ait projelere (web, yazılım, portal) veri girilmesi, müşterinin son kullanıcı verilerinin toplanması ve işlenmesi durumlarında yalnızca <strong>Veri İşleyen</strong> konumundayız. Müşteri (hizmeti satın alan taraf) <strong>Veri Sorumlusu</strong>'dur.
          </p>
          <p>
            Veri Sorumlusu sıfatına sahip müşteri, uygulamaları aracılığıyla topladığı tüm verilerin KVKK'ya uygun olarak açık rıza ve aydınlatma metinleri ile toplandığını kabul ve taahhüt eder. Müşterinin (Veri Sorumlusu) veri ihlalleri, hukuka aykırı veri yüklemesi veya aydınlatma yükümlülüğünü yerine getirmemesinden doğacak idari para cezaları ve zararlardan StarWebFlow sorumlu tutulamaz. Müşteri, bu ihlallerden doğacak tüm maliyetleri StarWebFlow'a rücu edilemeyeceğini kabul eder.
          </p>
        </>
      ),
      germanContent: (
        <>
          <p>
            Wenn wir als StarWebFlow Daten in Kundenprojekte eingeben, sammeln und verarbeiten, fungieren wir ausschließlich als <strong>Auftragsverarbeiter</strong>. Der Kunde ist der <strong>Verantwortliche</strong>.
          </p>
          <p>
            Der Kunde als Verantwortlicher garantiert, dass alle durch seine Anwendungen gesammelten Daten in Übereinstimmung mit dem Gesetz mit ausdrücklicher Zustimmung und Aufklärungstexten gesammelt wurden. StarWebFlow kann nicht für Verwaltungsgeldstrafen und Schäden haftbar gemacht werden, die aus Datenschutzverletzungen, unrechtmäßigen Datenuploads oder der Nichterfüllung der Aufklärungspflicht des Kunden entstehen.
          </p>
        </>
      ),
      englishContent: (
        <>
          <p>
            As StarWebFlow, when data is entered, collected, and processed into client projects, we act solely as the <strong>Data Processor</strong>. The client is the <strong>Data Controller</strong>.
          </p>
          <p>
            The client, acting as the Data Controller, guarantees that all data collected through its applications is collected in accordance with KVKK, with explicit consent and clarification texts. StarWebFlow cannot be held liable for administrative fines and damages arising from the client's data breaches, unlawful data uploading, or failure to fulfill the clarification obligation.
          </p>
        </>
      )
    },
    {
      id: 'kvkk-rights',
      title: '6. KVKK Madde 11 Kapsamındaki Haklarınız',
      germanTitle: '6. Ihre Rechte gemäß Artikel 11 KVKK',
      englishTitle: '6. Your Rights Under KVKK Article 11',
      content: (
        <>
          <p>
            KVKK Madde 11 uyarınca, bize başvurarak kişisel verilerinizin;
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>İşlenip işlenmediğini öğrenme,</li>
            <li>İşlenmişse bilgi talep etme,</li>
            <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
            <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
            <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme,</li>
            <li>Kanun'a uygun olarak silinmesini veya yok edilmesini talep etme,</li>
            <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme hakkına sahipsiniz.</li>
          </ul>
          <p className="mt-4">
            Tüm bu haklarınızı kullanmak üzere taleplerinizi ıslak imzalı bir dilekçe ile şirket adresimize veya <a href="mailto:privacy@starwebflow.com" className="text-[#4F8EF7] hover:underline">privacy@starwebflow.com</a> kayıtlı e-posta adresimize iletebilirsiniz. Başvurularınız 30 gün içinde yasal süre çerçevesinde cevaplanacaktır.
          </p>
        </>
      ),
      germanContent: (
        <>
          <p>
            Gemäß Artikel 11 KVKK haben Sie das Recht zu erfahren, ob Ihre Daten verarbeitet werden, Auskunft zu verlangen, die Berichtigung oder Löschung zu beantragen und der Verarbeitung zu widersprechen.
          </p>
          <p className="mt-4">
            Bitte richten Sie Ihre Anträge an <a href="mailto:privacy@starwebflow.com" className="text-[#4F8EF7] hover:underline">privacy@starwebflow.com</a>.
          </p>
        </>
      ),
      englishContent: (
        <>
          <p>
            Under KVKK Article 11, by applying to us, you have the right to:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Learn whether your personal data is processed,</li>
            <li>Request information if processed,</li>
            <li>Learn the purpose of processing and whether it is used accordingly,</li>
            <li>Know the third parties to whom it is transferred domestically or abroad,</li>
            <li>Request correction if processed incompletely or incorrectly,</li>
            <li>Request deletion or destruction in accordance with the Law.</li>
          </ul>
          <p className="mt-4">
            Please direct your applications to <a href="mailto:privacy@starwebflow.com" className="text-[#4F8EF7] hover:underline">privacy@starwebflow.com</a>.
          </p>
        </>
      )
    }
  ]

  return (
    <LegalPageLayout
      title="KVKK Aydınlatma Metni"
      germanTitle="KVKK-Aufklärungstext"
      englishTitle="KVKK Clarification Text"
      subtitle="Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında veri toplama, saklama ve haklarınıza dair yasal açıklama."
      germanSubtitle="Rechtliche Erklärung zur Datenerhebung, -speicherung und Ihren Rechten im Rahmen des Gesetzes zum Schutz personenbezogener Daten (KVKK)."
      englishSubtitle="Legal explanation regarding data collection, storage, and your rights under the Personal Data Protection Law (KVKK)."
      lastUpdated="21 Haziran 2026"
      germanLastUpdated="21. Juni 2026"
      englishLastUpdated="June 21, 2026"
      sections={sections}
    />
  )
}
