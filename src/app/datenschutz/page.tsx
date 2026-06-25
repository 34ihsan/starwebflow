'use client'

import React from 'react'
import LegalPageLayout from '@/components/layout/LegalPageLayout'

export default function DatenschutzPage() {
  const sections = [
    {
      id: 'general',
      title: '1. Genel Bilgi ve Veri Sorumlusu',
      germanTitle: '1. Allgemeine Informationen & Verantwortlicher',
      englishTitle: '1. General Information & Data Controller',
      content: (
        <>
          <p>
            StarWebFlow olarak kişisel verilerinizin güvenliği ve gizliliği bizim için en üst düzeyde öneme sahiptir. Bu Gizlilik Politikası, web sitemizi ziyaret ettiğinizde, hizmetlerimizden faydalandığınızda ve başvuru formlarımızı doldurduğunuzda kişisel verilerinizin nasıl toplandığını, işlendiğini ve korunduğunu açıklar.
          </p>
          <p>
            Bu web sitesi, Avrupa Birliği Genel Veri Koruma Yönetmeliği (GDPR/DSGVO) ve Türkiye Cumhuriyeti 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ile uyumlu olarak veri işleme faaliyetleri gerçekleştirmektedir.
          </p>
          <p className="font-bold mt-4 text-white">Veri Sorumlusu (Verantwortlicher):</p>
          <p>
            StarWebFlow Dijital Ajans<br />
            E-posta: privacy@starwebflow.com<br />
            Telefon: +49 179 492 4556
          </p>
        </>
      ),
      germanContent: (
        <>
          <p>
            Der Schutz Ihrer persönlichen Daten ist uns ein wichtiges Anliegen. Diese Datenschutzerklärung klärt Sie über die Art, den Umfang und Zweck der Verarbeitung von personenbezogenen Daten innerhalb unseres Onlineangebotes auf.
          </p>
          <p>
            Diese Website verarbeitet Daten im Einklang mit der Datenschutz-Grundverordnung (DSGVO / GDPR) der Europäischen Union und dem türkischen Datenschutzgesetz (KVKK).
          </p>
          <p className="font-bold mt-4 text-white">Verantwortlicher im Sinne der DSGVO:</p>
          <p>
            StarWebFlow Digital Agent<br />
            E-Mail: privacy@starwebflow.com<br />
            Telefon: +49 179 492 4556
          </p>
        </>
      ),
      englishContent: (
        <>
          <p>
            At StarWebFlow, the security and confidentiality of your personal data is of the highest importance to us. This Privacy Policy explains how your personal data is collected, processed, and protected when you visit our website, benefit from our services, and fill out our application forms.
          </p>
          <p>
            This website processes data in accordance with the European Union General Data Protection Regulation (GDPR) and the Law on Protection of Personal Data of the Republic of Turkey No. 6698 (KVKK).
          </p>
          <p className="font-bold mt-4 text-white">Data Controller:</p>
          <p>
            StarWebFlow Digital Agent<br />
            Email: privacy@starwebflow.com<br />
            Phone: +49 179 492 4556
          </p>
        </>
      )
    },
    {
      id: 'data-collection',
      title: '2. Toplanan Veriler ve Amacı',
      germanTitle: '2. Erhobene Daten & Zweck',
      englishTitle: '2. Collected Data & Purpose',
      content: (
        <>
          <p>
            Web sitemizde işlem gerçekleştirdiğinizde aşağıdaki veriler şirketimizin meşru menfaatleri, sözleşme öncesi müzakereler ve yasal yükümlülükler çerçevesinde işlenir:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>İletişim ve Başvuru Bilgileri:</strong> İletişim formları veya simülatörlerde girdiğiniz Ad Soyad, E-posta, Telefon numarası ve Şirket adı. (Amaç: Taleplerinizi yanıtlamak, iş teklifleri hazırlamak).</li>
            <li><strong>Teknik Simülasyon Verileri:</strong> Tahmini bütçe, proje fikirleri, saatlik çalışan maliyetleri ve operasyonel bilgiler. (Amaç: Şirket analizleri ve değer teklifi sunumu).</li>
            <li><strong>Sunucu Log Kayıtları:</strong> IP adresiniz (maskelenmiş olarak), tarayıcı türü, işletim sistemi, yönlendirici URL ve erişim tarihi. (Amaç: Güvenlik, DDoS koruması ve sistem kararlılığı).</li>
          </ul>
        </>
      ),
      germanContent: (
        <>
          <p>
            Wir verarbeiten personenbezogene Daten unserer Nutzer nur unter Einhaltung der einschlägigen Datenschutzbestimmungen (Art. 6 Abs. 1 lit. b und f DSGVO):
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Kontaktdaten:</strong> Name, E-Mail-Adresse, Telefonnummer, Firmenname bei Nutzung unserer Formulare (Zweck: Beantwortung von Anfragen, Erstellung von Angeboten).</li>
            <li><strong>Nutzungsdaten:</strong> Angaben wie Projektideen, Budgetvorstellungen und Stundensätze (Zweck: Erstellung von individuellen Angeboten).</li>
            <li><strong>Server-Logfiles:</strong> IP-Adresse (anonymisiert), Browsertyp, Betriebssystem, Referrer URL, Datum und Uhrzeit des Zugriffs (Zweck: Systemsicherheit und Abwehr von DDoS-Angriffen).</li>
          </ul>
        </>
      ),
      englishContent: (
        <>
          <p>
            When you perform transactions on our website, the following data is processed within the framework of our legitimate interests, pre-contractual negotiations, and legal obligations:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Contact & Application Information:</strong> Full Name, Email, Phone number, and Company name you enter in contact forms or simulators. (Purpose: Responding to requests, preparing proposals).</li>
            <li><strong>Technical Simulation Data:</strong> Estimated budget, project ideas, hourly labor costs, and operational details. (Purpose: Business analysis and value proposition presentation).</li>
            <li><strong>Server Log Files:</strong> IP address (masked), browser type, operating system, referrer URL, and date/time of access automatically sent by your browser. (Purpose: Security, DDoS protection, and system stability).</li>
          </ul>
        </>
      )
    },
    {
      id: 'legal-basis',
      title: '3. Veri İşlemenin Hukuki Sebebi',
      germanTitle: '3. Rechtsgrundlagen der Verarbeitung',
      englishTitle: '3. Legal Basis of Processing',
      content: (
        <>
          <p>
            Kişisel verilerinizin işlenmesinde şu hukuki sebeplere dayanmaktayız:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Rıza (Art. 6 Abs. 1 lit. a DSGVO / KVKK M. 5/1):</strong> İletişim formunu göndererek veya Çerez rızası vererek açıkça onay verdiğiniz durumlar.</li>
            <li><strong>Sözleşmenin İfası veya Sözleşme Öncesi Tedbirler (Art. 6 Abs. 1 lit. b DSGVO / KVKK M. 5/2-c):</strong> Bize ilettiğiniz proje fikirlerine göre şartname hazırlamak ve fiyat teklifi oluşturmak.</li>
            <li><strong>Meşru Menfaatler (Art. 6 Abs. 1 lit. f DSGVO / KVKK M. 5/2-f):</strong> Web sitemizin güvenliğini sağlamak, kötüye kullanımı engellemek ve hizmet kalitemizi artırmak.</li>
          </ul>
        </>
      ),
      germanContent: (
        <>
          <p>
            Die Verarbeitung Ihrer personenbezogenen Daten erfolgt auf Basis folgender Rechtsgrundlagen:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Einwilligung (Art. 6 Abs. 1 lit. a DSGVO):</strong> Für die Zusendung von Dokumenten und das Setzen von Marketing-Cookies.</li>
            <li><strong>Vertragserfüllung / Vorvertragliche Maßnahmen (Art. 6 Abs. 1 lit. b DSGVO):</strong> Zur Angebotserstellung basierend auf den von Ihnen eingegebenen Projektdaten.</li>
            <li><strong>Berechtigte Interessen (Art. 6 Abs. 1 lit. f DSGVO):</strong> Für die Sicherheit der Webserver, DDoS-Schutz und statistische Auswertungen.</li>
          </ul>
        </>
      ),
      englishContent: (
        <>
          <p>
            We rely on the following legal bases for processing your personal data:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Consent (Art. 6 Abs. 1 lit. a GDPR / KVKK Art. 5/1):</strong> Situations where you explicitly agree by submitting contact forms or giving cookie consent.</li>
            <li><strong>Performance of Contract or Pre-Contractual Measures (Art. 6 Abs. 1 lit. b GDPR / KVKK Art. 5/2-c):</strong> Preparing specifications and generating price quotes based on project ideas you submit.</li>
            <li><strong>Legitimate Interests (Art. 6 Abs. 1 lit. f GDPR / KVKK Art. 5/2-f):</strong> Ensuring the security of our website, preventing abuse, and improving service quality.</li>
          </ul>
        </>
      )
    },
    {
      id: 'data-sharing',
      title: '4. Veri Aktarımı ve Üçüncü Taraflar',
      germanTitle: '4. Datenweitergabe an Dritte',
      englishTitle: '4. Data Sharing & Third Parties',
      content: (
        <>
          <p>
            Kişisel verileriniz, yasal zorunluluklar veya hizmetin ifası için gerekli teknik iş ortaklıklar haricinde asla üçüncü şahıslara satılmaz veya ticari amaçla paylaşılmaz. Veri işleme faaliyetlerinde kullandığımız güvenli altyapılar şunlardır:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Vercel & AWS:</strong> Web sitemizin barındırıldığı (hosting) ve Frankfurt/Almanya sunucularında GDPR uyumlu çalışan altyapı sağlayıcıları.</li>
            <li><strong>Calendly / Google:</strong> Toplantı planlamanız için kullanılan takvim entegrasyonu.</li>
            <li><strong>Google Analytics / Meta Pixel:</strong> Sadece çerez panelinden açık rıza verdiğiniz takdirde çalışan anonim analiz ve reklam pikselleri.</li>
          </ul>
        </>
      ),
      germanContent: (
        <>
          <p>
            Eine Weitergabe Ihrer Daten an Dritte erfolgt nur im Rahmen gesetzlicher Vorgaben oder zur Erfüllung unserer vertraglichen Pflichten:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Hosting (Vercel & AWS):</strong> Unsere Web-Infrastruktur befindet sich auf DSGVO-konformen Servern in Frankfurt, Deutschland.</li>
            <li><strong>Calendly / Google Calendar:</strong> Zur Direktbuchung von Strategiegesprächen auf freiwilliger Basis.</li>
            <li><strong>Analyse- & Tracking-Tools (Google, Meta):</strong> Nur aktiv, wenn Sie über unseren Cookie-Banner explizit eingewilligt haben.</li>
          </ul>
        </>
      ),
      englishContent: (
        <>
          <p>
            Your personal data is never sold or shared for commercial purposes with third parties, except as required by law or for technical partnerships necessary for service delivery. The secure infrastructures we use are:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Vercel & AWS:</strong> Hosting infrastructure providers operating in Frankfurt/Germany servers, fully GDPR compliant.</li>
            <li><strong>Calendly / Google:</strong> Calendar integration used for scheduling meetings.</li>
            <li><strong>Google Analytics / Meta Pixel:</strong> Anonymous analytics and advertising pixels that only run if you give explicit consent in the cookie settings panel.</li>
          </ul>
        </>
      )
    },
    {
      id: 'user-rights',
      title: '5. Haklarınız (DSGVO & KVKK)',
      germanTitle: '5. Ihre Rechte',
      englishTitle: '5. Your Rights',
      content: (
        <>
          <p>
            Veri sahibi olarak kişisel verileriniz üzerinde tam kontrol hakkına sahipsiniz. KVKK Madde 11 ve GDPR kapsamında şu haklara sahipsiniz:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Bilgi alma ve erişim hakkı (Hangi verilerinizin işlendiğini öğrenme).</li>
            <li>Düzeltme hakkı (Hatalı veya eksik verilerinizin güncellenmesini isteme).</li>
            <li>Silme ve unutulma hakkı (Verilerinizin sistemlerimizden tamamen silinmesini talep etme).</li>
            <li>Rızayı geri çekme hakkı (Verdiğiniz çerez veya iletişim rızalarını dilediğiniz an iptal etme).</li>
          </ul>
          <p className="mt-4">
            Tüm talepleriniz için bize <a href="mailto:privacy@starwebflow.com" className="text-[#4F8EF7] hover:underline">privacy@starwebflow.com</a> adresinden ulaşabilirsiniz. Talepleriniz en geç 30 gün içinde ücretsiz olarak sonuçlandırılacaktır.
          </p>
        </>
      ),
      germanContent: (
        <>
          <p>
            Sie haben jederzeit das Recht auf Auskunft, Berichtigung, Sperrung oder Löschung Ihrer gespeicherten Daten (Art. 15-21 DSGVO):
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Recht auf Auskunft über die verarbeiteten personenbezogenen Daten.</li>
            <li>Recht auf Berichtigung unrichtiger Daten.</li>
            <li>Recht auf Löschung ("Recht auf Vergessenwerden").</li>
            <li>Recht auf Widerruf erteilter Einwilligungen mit Wirkung für die Zukunft.</li>
          </ul>
          <p className="mt-4">
            Wenden Sie sich zur Ausübung dieser Rechte einfach an <a href="mailto:privacy@starwebflow.com" className="text-[#4F8EF7] hover:underline">privacy@starwebflow.com</a>.
          </p>
        </>
      ),
      englishContent: (
        <>
          <p>
            As a data subject, you have full control over your personal data. Under KVKK Article 11 and GDPR, you have the following rights:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Right to be informed and access (Learn what data is processed).</li>
            <li>Right to rectification (Request updates to incorrect/incomplete data).</li>
            <li>Right to erasure and to be forgotten (Request complete removal of your data from our systems).</li>
            <li>Right to withdraw consent (Cancel cookie or contact consents at any time).</li>
          </ul>
          <p className="mt-4">
            Contact us at <a href="mailto:privacy@starwebflow.com" className="text-[#4F8EF7] hover:underline">privacy@starwebflow.com</a> for any requests. We will resolve your requests within 30 days free of charge.
          </p>
        </>
      )
    },
    {
      id: 'data-processor',
      title: '6. Veri İşleyen Sıfatıyla Sorumluluklarımız',
      germanTitle: '6. Unsere Verantwortung als Auftragsverarbeiter',
      englishTitle: '6. Our Responsibility as Data Processor',
      content: (
        <>
          <p>
            Müşterilerimiz için geliştirdiğimiz yazılım, web sitesi veya uygulamalarda işlenen üçüncü taraf kişisel verileri (müşterilerimizin son kullanıcıları) için şirketimiz "Veri İşleyen (Data Processor)" konumundadır.
          </p>
          <p>
            Bu durumlarda "Veri Sorumlusu (Data Controller)", hizmeti satın alan müşterimizdir. Müşteri, işlenmesi için tarafımıza veya geliştirdiğimiz sistemlere aktardığı her türlü verinin yasalara (KVKK/GDPR) uygun olarak toplandığını, gerekli rızaların alındığını beyan ve taahhüt eder. Müşterinin hukuka aykırı veri yüklemesi veya veri toplaması nedeniyle doğacak hiçbir yasal ihlalden StarWebFlow sorumlu tutulamaz.
          </p>
          <p>
            Yapay zeka (AI) hizmetlerimiz bağlamında; StarWebFlow'a sağlanan anonimleştirilmiş proje verileri (API keyler ve gizli müşteri verileri hariç olmak kaydıyla), sadece ilgili müşteri projesinin geliştirilmesi amacıyla OpenAI/Gemini gibi 3. taraf AI servisleri aracılığıyla işlenebilir ancak bu veriler kamuya açık yapay zeka modellerini eğitmek amacıyla (training data) kesinlikle kullanılmaz.
          </p>
        </>
      ),
      germanContent: (
        <>
          <p>
            Bei personenbezogenen Daten Dritter (Endnutzer unserer Kunden), die in von uns entwickelten Softwares oder Websites verarbeitet werden, agiert unser Unternehmen als "Auftragsverarbeiter" (Data Processor).
          </p>
          <p>
            In diesen Fällen ist der Kunde, der die Dienstleistung erwirbt, der "Verantwortliche" (Data Controller). Der Kunde sichert zu, dass alle Daten, die er uns oder den von uns entwickelten Systemen zur Verarbeitung übermittelt, rechtmäßig (gemäß DSGVO) erhoben wurden. StarWebFlow übernimmt keine Haftung für rechtliche Verstöße, die aus einer unrechtmäßigen Datenerhebung oder -speicherung durch den Kunden resultieren.
          </p>
          <p>
            Im Zusammenhang mit unseren KI-Diensten (AI); Anonymisierte Projektdaten, die StarWebFlow zur Verfügung gestellt werden (mit Ausnahme von API-Schlüsseln und vertraulichen Kundendaten), können über KI-Dienste von Drittanbietern (wie OpenAI/Gemini) nur zur Entwicklung des jeweiligen Kundenprojekts verarbeitet werden, diese Daten werden jedoch keinesfalls zum Trainieren öffentlicher KI-Modelle (Trainingsdaten) verwendet.
          </p>
        </>
      ),
      englishContent: (
        <>
          <p>
            For third-party personal data (end-users of our clients) processed in the software, websites, or applications we develop for our clients, our company acts as the "Data Processor".
          </p>
          <p>
            In these cases, the "Data Controller" is our client purchasing the service. The client declares and undertakes that any data they transfer to us or the systems we develop for processing has been collected in compliance with the law (KVKK/GDPR), and necessary consents have been obtained. StarWebFlow cannot be held liable for any legal violations arising from the client's unlawful data upload or data collection.
          </p>
          <p>
            In the context of our AI services; Anonymized project data provided to StarWebFlow (excluding API keys and confidential client data) may be processed via third-party AI services (like OpenAI/Gemini) solely for the purpose of developing the respective client project, however, this data is strictly never used to train public AI models (training data).
          </p>
        </>
      )
    }
  ]

  return (
    <LegalPageLayout
      title="Gizlilik Politikası"
      germanTitle="Datenschutzerklärung"
      englishTitle="Privacy Policy"
      subtitle="StarWebFlow dijital ekosistemindeki kişisel verilerinizin korunması ve gizliliğine dair yasal bilgilendirme."
      germanSubtitle="Rechtliche Informationen zum Schutz und zur Vertraulichkeit Ihrer personenbezogenen Daten."
      englishSubtitle="Legal information regarding the protection and confidentiality of your personal data."
      lastUpdated="21 Haziran 2026"
      germanLastUpdated="21. Juni 2026"
      englishLastUpdated="June 21, 2026"
      sections={sections}
    />
  )
}
