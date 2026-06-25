'use client'

import React from 'react'
import LegalPageLayout from '@/components/layout/LegalPageLayout'

export default function CookieRichtliniePage() {
  const sections = [
    {
      id: 'what-are-cookies',
      title: '1. Çerez Nedir?',
      germanTitle: '1. Was sind Cookies?',
      englishTitle: '1. What are Cookies?',
      content: (
        <>
          <p>
            Çerezler (Cookies), ziyaret ettiğiniz web siteleri tarafından bilgisayarınıza veya mobil cihazınıza kaydedilen küçük metin dosyalarıdır. Web sitemizin düzgün çalışmasını sağlamak, kullanıcı deneyiminizi kişiselleştirmek ve reklamlarımızın başarısını analiz etmek amacıyla çerezleri ve benzer takip teknolojilerini kullanırız.
          </p>
          <p>
            StarWebFlow üzerindeki çerez izinlerinizi dilediğiniz zaman ekranın sol alt köşesindeki <strong>yüzer Çerez İkonuna</strong> tıklayarak güncelleyebilir veya tamamen iptal edebilirsiniz.
          </p>
        </>
      ),
      germanContent: (
        <>
          <p>
            Cookies sind kleine Textdateien, die von Websites auf Ihrem Computer oder Mobilgerät gespeichert werden, wenn Sie diese besuchen. Wir verwenden Cookies und ähnliche Technologien, um das ordnungsgemäße Funktionieren unserer Website zu gewährleisten, Ihr Nutzererlebnis zu personalisieren und die Leistung unserer Kampagnen zu messen.
          </p>
          <p>
            Sie können Ihre Cookie-Einstellungen bei StarWebFlow jederzeit anpassen oder widerrufen, indem Sie auf das <strong>schwebende Cookie-Symbol</strong> in der linken unteren Ecke des Bildschirms klicken.
          </p>
        </>
      ),
      englishContent: (
        <>
          <p>
            Cookies are small text files stored on your computer or mobile device by websites you visit. We use cookies and similar tracking technologies to ensure our website functions properly, personalize your user experience, and analyze the success of our advertising campaigns.
          </p>
          <p>
            You can update or completely revoke your cookie consents on StarWebFlow at any time by clicking the <strong>floating Cookie Icon</strong> in the bottom left corner of the screen.
          </p>
        </>
      )
    },
    {
      id: 'cookie-types',
      title: '2. Çerez Kategorileri',
      germanTitle: '2. Cookie-Kategorien',
      englishTitle: '2. Cookie Categories',
      content: (
        <>
          <p>
            Web sitemizde kullanılan çerezler, işlevlerine göre aşağıdaki dört ana gruba ayrılır. DSGVO ve TDDDG uyarınca, zorunlu çerezler dışındakiler varsayılan olarak devre dışıdır:
          </p>
          <ul className="list-disc pl-5 space-y-3">
            <li>
              <strong>Zorunlu Çerezler (Notwendige Cookies):</strong> Web sitemizin teknik olarak çalışması, oturum güvenliğinin sağlanması ve çerez rızası tercihlerinizin kaydedilmesi için zorunlu olan çerezlerdir. Devre dışı bırakılamazlar.
            </li>
            <li>
              <strong>Analiz ve İstatistik Çerezleri (Statistiken):</strong> Sitemizi kaç kişinin ziyaret ettiğini, hangi hizmet sayfalarının daha çok ilgi gördüğünü ölçümlememizi sağlar. Veriler anonim olarak işlenir.
            </li>
            <li>
              <strong>Pazarlama ve Takip Çerezleri (Marketing):</strong> Reklam ortaklarımız (Google Ads, Meta) aracılığıyla ilgi alanlarınıza yönelik reklamlar göstermek ve reklamlarımızın dönüşüm başarısını ölçmek amacıyla kullanılır.
            </li>
            <li>
              <strong>Fonksiyonel Çerezler (Präferenzen):</strong> ROI hesaplayıcımızda seçtiğiniz para birimi veya chatbot geçmişiniz gibi tercihlerinizi cihazınızda yerel olarak saklamamızı sağlar.
            </li>
          </ul>
        </>
      ),
      germanContent: (
        <>
          <p>
            Die auf unserer Website verwendeten Cookies werden basierend auf ihrer Funktion in vier Kategorien unterteilt. Gemäß DSGVO und TDDDG sind nicht-essenzielle Cookies standardmäßig deaktiviert (Opt-In-Prinzip):
          </p>
          <ul className="list-disc pl-5 space-y-3">
            <li>
              <strong>Zwingend notwendige Cookies:</strong> Erforderlich für den technischen Betrieb der Website (z. B. Speicherung der Cookie-Präferenzen, Session-Sicherheit). Können nicht deaktiviert werden.
            </li>
            <li>
              <strong>Analytische Cookies:</strong> Ermöglichen es uns, Besuche und Klickpfade zu zählen, um die Leistung unserer Website zu optimieren. Alle Daten werden anonym erhoben.
            </li>
            <li>
              <strong>Marketing-Cookies:</strong> Ermöglichen es Werbepartnern (Google, Meta), interessengerechte Anzeigen zu schalten und Konversionen zu messen.
            </li>
            <li>
              <strong>Funktionelle Cookies:</strong> Speichern Ihre individuellen Präferenzen, wie z.B. die gewählte Währung oder den Chat-Verlauf.
            </li>
          </ul>
        </>
      ),
      englishContent: (
        <>
          <p>
            Cookies used on our website are divided into four main categories based on their functions. In accordance with GDPR and TDDDG, non-essential cookies are disabled by default (Opt-In principle):
          </p>
          <ul className="list-disc pl-5 space-y-3">
            <li>
              <strong>Strictly Necessary Cookies:</strong> Essential for the technical operation of our website, ensuring session security, and saving your cookie consent preferences. They cannot be disabled.
            </li>
            <li>
              <strong>Analytics and Statistics Cookies:</strong> Allow us to measure how many people visit our site and which service pages are of more interest. Data is processed anonymously.
            </li>
            <li>
              <strong>Marketing and Tracking Cookies:</strong> Used to show interest-based ads via our advertising partners (Google Ads, Meta) and measure the conversion success of our campaigns.
            </li>
            <li>
              <strong>Functional Cookies:</strong> Allow us to locally store preferences on your device, such as your chosen currency in the ROI calculator or your chatbot conversation history.
            </li>
          </ul>
        </>
      )
    },
    {
      id: 'third-party-cookies',
      title: '3. Üçüncü Taraf Çerezler',
      germanTitle: '3. Drittanbieter-Cookies',
      englishTitle: '3. Third-Party Cookies',
      content: (
        <>
          <p>
            Hizmet kalitemizi artırmak amacıyla bazı analiz ve pazarlama hizmetlerini entegre etmekteyiz. Bu servisler kendi çerezlerini cihazınıza bırakabilirler:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Google Analytics:</strong> Web analizi amacıyla çerezler yerleştirir (Rızanıza bağlıdır).</li>
            <li><strong>Google Ads & DoubleClick:</strong> Dönüşüm ölçümü ve yeniden pazarlama (Retargeting) için çerezler yerleştirir (Rızanıza bağlıdır).</li>
            <li><strong>Meta Pixel:</strong> Instagram ve Facebook üzerinden gelen ziyaretçilerin dönüşümlerini analiz etmek için kullanılır (Rızanıza bağlıdır).</li>
          </ul>
        </>
      ),
      germanContent: (
        <>
          <p>
            Zur Bereitstellung bestimmter Dienste binden wir Drittanbieter-Technologien ein, die eigene Cookies setzen können:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Google Analytics:</strong> Zur Reichweitenmessung (Einwilligung erforderlich).</li>
            <li><strong>Google Ads & Meta Pixel:</strong> Zur Konversionsmessung und Schaltung zielgerichteter Retargeting-Kampagnen (Einwilligung erforderlich).</li>
          </ul>
        </>
      ),
      englishContent: (
        <>
          <p>
            To improve our service quality, we integrate certain analytics and marketing services. These services may place their own cookies on your device:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Google Analytics:</strong> Places cookies for web analytics purposes (Subject to your consent).</li>
            <li><strong>Google Ads & DoubleClick:</strong> Places cookies for conversion tracking and retargeting (Subject to your consent).</li>
            <li><strong>Meta Pixel:</strong> Used to analyze conversions of visitors coming from Instagram and Facebook (Subject to your consent).</li>
          </ul>
        </>
      )
    },
    {
      id: 'how-to-manage',
      title: '4. Çerez Yönetimi ve Rızayı Geri Çekme',
      germanTitle: '4. Verwaltung & Widerruf der Einwilligung',
      englishTitle: '4. Cookie Management & Consent Withdrawal',
      content: (
        <>
          <p>
            Çerez rızalarınızı yönetmek son derece basittir:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Web sitemizin sol altındaki <strong>Mavi Çerez İkonuna</strong> tıklayarak çerez panelini istediğiniz zaman yeniden açabilir, onaylarınızı değiştirebilir veya tüm izinleri saniyeler içinde geri çekebilirsiniz.</li>
            <li>Tarayıcı ayarlarınız üzerinden de çerezlerin tamamını engelleyebilir veya önbelleğinizi temizleyebilirsiniz. Ancak bazı teknik fonksiyonların (oturum yönetimi, form korumaları) çalışmayabileceğini hatırlatmak isteriz.</li>
          </ul>
        </>
      ),
      germanContent: (
        <>
          <p>
            Sie haben die volle Kontrolle über Ihre Cookie-Daten:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Klicken Sie einfach auf das <strong>blaue Cookie-Icon</strong> unten links auf unserer Website, um das Einstellungsfenster jederzeit erneut zu öffnen und Ihre Einwilligungen anzupassen oder vollständig zu widerrufen.</li>
            <li>Alternativ können Sie in den Browsereinstellungen das Speichern von Cookies generell deaktivieren oder bestehende Cookies löschen. Dies kann jedoch die Funktionalität einiger Website-Bereiche einschränken.</li>
          </ul>
        </>
      ),
      englishContent: (
        <>
          <p>
            Managing your cookie consents is extremely simple:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>By clicking the <strong>Blue Cookie Icon</strong> at the bottom left of our website, you can reopen the cookie panel at any time, change your approvals, or withdraw all permissions in seconds.</li>
            <li>You can also block all cookies or clear your cache through your browser settings. However, please note that some technical functions (session management, form protections) may not work as a result.</li>
          </ul>
        </>
      )
    },
    {
      id: 'security-fraud-cookies',
      title: '5. Güvenlik ve Dolandırıcılığı Önleme Çerezleri',
      germanTitle: '5. Sicherheits- und Betrugspräventions-Cookies',
      englishTitle: '5. Security and Fraud Prevention Cookies',
      content: (
        <>
          <p>
            Müşteri portalımızın güvenliğini sağlamak, yetkisiz erişimleri engellemek ve siber saldırılara (Örn: DDoS) karşı platformu korumak amacıyla kullanılan çerezler, sistemin temel güvenliği için kritik olduğundan kapatılamazlar.
          </p>
        </>
      ),
      germanContent: (
        <>
          <p>
            Cookies, die zur Gewährleistung der Sicherheit unseres Kundenportals, zur Verhinderung unbefugten Zugriffs und zum Schutz der Plattform vor Cyberangriffen (z. B. DDoS) verwendet werden, sind für die grundlegende Sicherheit des Systems von entscheidender Bedeutung und können nicht deaktiviert werden.
          </p>
        </>
      ),
      englishContent: (
        <>
          <p>
            Cookies used to ensure the security of our client portal, prevent unauthorized access, and protect the platform against cyberattacks (e.g., DDoS) are critical for the basic security of the system and cannot be disabled.
          </p>
        </>
      )
    }
  ]

  return (
    <LegalPageLayout
      title="Çerez Politikası"
      germanTitle="Cookie-Richtlinie"
      englishTitle="Cookie Policy"
      subtitle="StarWebFlow dijital ekosisteminde kullanılan çerez türleri, kullanım amaçları ve rıza yönetim süreci."
      germanSubtitle="Arten von Cookies, Zwecke und Einwilligungsmanagement im StarWebFlow-Ökosystem."
      englishSubtitle="Types of cookies, purposes, and consent management in the StarWebFlow ecosystem."
      lastUpdated="21 Haziran 2026"
      germanLastUpdated="21. Juni 2026"
      englishLastUpdated="June 21, 2026"
      sections={sections}
    />
  )
}
