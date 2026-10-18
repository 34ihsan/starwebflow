'use client'

import React from 'react'
import LegalPageLayout from '@/components/layout/LegalPageLayout'

export default function KVKKPage() {
  const sections = [
    {
      id: 'kvkk-intro',
      title: '1. Veri Sorumlusu, AB/Almanya Uyumu ve Kapsam',
      germanTitle: '1. Verantwortlicher, EU/DE-Anpassung & Geltungsbereich',
      englishTitle: '1. Data Controller, EU/DE Compliance & Scope',
      content: (
        <>
          <p>
            İşbu Aydınlatma Metni; merkezi Almanya Federal Cumhuriyeti’nde yerleşik <strong>Star Web Flow - Sinan Günay</strong> (“Star Web Flow” veya “Şirket”) tarafından, Avrupa Birliği Genel Veri Koruma Tüzüğü (EU DSGVO / GDPR - Regulation 2016/679), Alman Federal Veri Koruma Kanunu (BDSG), Telekomünikasyon ve Dijital Hizmetler Veri Koruma Kanunu (TDDDG) ve Türkiye Cumhuriyeti 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca hazırlanmıştır.
          </p>
          <p className="mt-3">
            Star Web Flow, Avrupa Birliği, Almanya, Türkiye ve uluslararası pazarlara yönelik dijital web geliştirme, yapay zeka (AI) sistemleri, otomasyon ve yazılım mühendisliği hizmetleri sunmaktadır. Bu metin, hem web sitemizi (www.starwebflow.com) ziyaret edenlerin hem de interaktif araçlarımızı (ROI Hesaplayıcı, Teklif Sihirbazı, İletişim Formları) kullanan gerçek ve tüzel kişilerin kişisel verilerinin korunması ve şirketimizin yasal haklarının teminat altına alınması amacıyla düzenlenmiştir.
          </p>
          <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-sm space-y-1">
            <p className="font-semibold text-slate-900 dark:text-white">Veri Sorumlusu Bilgileri (Verantwortlicher gem. Art. 4 Nr. 7 DSGVO):</p>
            <p><strong>Unvan:</strong> Star Web Flow - Sinan Günay (Einzelunternehmen / Şahıs İşletmesi)</p>
            <p><strong>Adres:</strong> Anilinerstr. 3, 67105 Schifferstadt, Rheinland-Pfalz, Deutschland</p>
            <p><strong>E-Posta:</strong> <a href="mailto:info@starwebflow.com" className="text-[#4F8EF7] hover:underline">info@starwebflow.com</a> / <a href="mailto:privacy@starwebflow.com" className="text-[#4F8EF7] hover:underline">privacy@starwebflow.com</a></p>
            <p><strong>Telefon:</strong> +49 179 492 4556</p>
            <p><strong>Vergi Numarası (Steuernummer):</strong> 41/056/80705 (Finanzamt Speyer-Germersheim)</p>
            <p><strong>KDV Statüsü:</strong> Kleinunternehmer gemäß § 19 UStG (Alman Katma Değer Vergisi Kanunu 19. maddesi uyarınca KDV tahakkuk ettirilmemektedir)</p>
          </div>
        </>
      ),
      germanContent: (
        <>
          <p>
            Diese Erklärung zum Datenschutz und zur Aufklärung über die Verarbeitung personenbezogener Daten erfolgt durch <strong>Star Web Flow - Sinan Günay</strong> („Star Web Flow“ oder „wir“) im Einklang mit der Datenschutz-Grundverordnung der Europäischen Union (DSGVO / GDPR - Verordnung EU 2016/679), dem Bundesdatenschutzgesetz (BDSG), dem Telekommunikation-Digitale-Dienste-Datenschutz-Gesetz (TDDDG) sowie dem türkischen Datenschutzgesetz Nr. 6698 (KVKK).
          </p>
          <p className="mt-3">
            Star Web Flow bietet webbasierte Softwaredienstleistungen, KI-Entwicklung und digitale Unternehmenslösungen für Kunden in Deutschland, der Europäischen Union, der Türkei und weltweit an. Diese Richtlinie schützt die Privatsphäre der Nutzer und stellt gleichzeitig die vollumfängliche rechtliche Absicherung von Star Web Flow gegenüber Kunden und Dritten sicher.
          </p>
          <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-sm space-y-1">
            <p className="font-semibold text-slate-900 dark:text-white">Angaben zum Verantwortlichen (gemäß Art. 4 Nr. 7 DSGVO):</p>
            <p><strong>Name/Firma:</strong> Star Web Flow - Sinan Günay (Einzelunternehmen)</p>
            <p><strong>Anschrift:</strong> Anilinerstr. 3, 67105 Schifferstadt, Rheinland-Pfalz, Deutschland</p>
            <p><strong>E-Mail:</strong> <a href="mailto:info@starwebflow.com" className="text-[#4F8EF7] hover:underline">info@starwebflow.com</a> / <a href="mailto:privacy@starwebflow.com" className="text-[#4F8EF7] hover:underline">privacy@starwebflow.com</a></p>
            <p><strong>Telefon:</strong> +49 179 492 4556</p>
            <p><strong>Steuernummer:</strong> 41/056/80705 (Finanzamt Speyer-Germersheim)</p>
            <p><strong>Umsatzsteuer:</strong> Kleinunternehmer gemäß § 19 UStG (keine Ausweisung von Umsatzsteuer)</p>
          </div>
        </>
      ),
      englishContent: (
        <>
          <p>
            This Data Protection and Clarification Statement is provided by <strong>Star Web Flow - Sinan Günay</strong> (“Star Web Flow” or “Company”) in full compliance with the European Union General Data Protection Regulation (EU GDPR - Regulation 2016/679), the German Federal Data Protection Act (BDSG), the German Telecommunications-Telemedia Data Protection Act (TDDDG), and the Turkish Law on the Protection of Personal Data No. 6698 (“KVKK”).
          </p>
          <p className="mt-3">
            Star Web Flow delivers enterprise web applications, AI automation agents, and software engineering services for clients across Germany, the EU, Turkey, and internationally. This statement outlines how data is gathered and processed, ensuring airtight legal protection for our agency.
          </p>
          <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-sm space-y-1">
            <p className="font-semibold text-slate-900 dark:text-white">Data Controller Information (pursuant to Art. 4 No. 7 GDPR):</p>
            <p><strong>Entity:</strong> Star Web Flow - Sinan Günay (Sole Proprietorship / Einzelunternehmen)</p>
            <p><strong>Address:</strong> Anilinerstr. 3, 67105 Schifferstadt, Rhineland-Palatinate, Germany</p>
            <p><strong>Email:</strong> <a href="mailto:info@starwebflow.com" className="text-[#4F8EF7] hover:underline">info@starwebflow.com</a> / <a href="mailto:privacy@starwebflow.com" className="text-[#4F8EF7] hover:underline">privacy@starwebflow.com</a></p>
            <p><strong>Phone:</strong> +49 179 492 4556</p>
            <p><strong>Tax ID (Steuernummer):</strong> 41/056/80705 (Tax Office Speyer-Germersheim)</p>
            <p><strong>VAT Status:</strong> Small business pursuant to § 19 German UStG (no VAT applied)</p>
          </div>
        </>
      )
    },
    {
      id: 'legal-framework',
      title: '2. Çift Hukuki Rejim (EU DSGVO / BDSG & KVKK) ve Uygulanabilirlik',
      germanTitle: '2. Duales Rechtssystem (EU-DSGVO / BDSG & KVKK)',
      englishTitle: '2. Dual Legal System (EU GDPR / BDSG & KVKK) & Scope',
      content: (
        <>
          <p>
            Star Web Flow, Avrupa Birliği (Almanya) merkezli bir işletme olarak öncelikli olarak <strong>Avrupa Birliği Genel Veri Koruma Tüzüğü (DSGVO)</strong> ve <strong>Alman Federal Veri Koruma Kanunu (BDSG)</strong> hükümlerine tabidir. Türkiye Cumhuriyeti mukimi kullanıcılar veya Türkiye’deki müşterilerle yürütülen sözleşme ve etkileşimlerde ise <strong>6698 sayılı KVKK</strong> hükümleri ek ve uyumlu olarak tatbik edilir.
          </p>
          <p className="mt-3">
            Her iki hukuk düzeninde de geçerli olan temel veri koruma ilkeleri (hukuka ve dürüstlük kuralına uygun olma, belirli ve meşru amaçlar için işlenme, amaçla bağlantılı ve sınırlı olma, veri minimizasyonu ve saklama sınırlaması) Şirketimiz operasyonlarında eksiksiz uygulanır.
          </p>
        </>
      ),
      germanContent: (
        <>
          <p>
            Als in Deutschland ansässiges Unternehmen unterliegt Star Web Flow primär den strengen Vorgaben der <strong>EU-Datenschutz-Grundverordnung (DSGVO)</strong> sowie des <strong>Bundesdatenschutzgesetzes (BDSG)</strong>. Für Interaktionen, Verträge und Nutzer aus der Republik Türkei finden ergänzend die Bestimmungen des <strong>türkischen Gesetzes Nr. 6698 (KVKK)</strong> koordinierte Anwendung.
          </p>
          <p className="mt-3">
            Die Grundsätze der Rechtmäßigkeit, Verhältnismäßigkeit, Zweckbindung, Datenminimierung und Speicherbegrenzung (Art. 5 DSGVO) bilden das unerschütterliche Fundament unserer gesamten IT- und Verarbeitungsprozesse.
          </p>
        </>
      ),
      englishContent: (
        <>
          <p>
            As an enterprise established in Germany, Star Web Flow is primarily governed by the <strong>EU General Data Protection Regulation (GDPR)</strong> and the <strong>German Federal Data Protection Act (BDSG)</strong>. For transactions, contracts, and data subjects residing in Turkey, the provisions of the <strong>Turkish Data Protection Law No. 6698 (KVKK)</strong> apply in complementary harmony.
          </p>
          <p className="mt-3">
            The fundamental principles of lawful processing, purpose limitation, transparency, data minimization, and storage limitation (Art. 5 GDPR) are strictly integrated across all our operational architectures.
          </p>
        </>
      )
    },
    {
      id: 'kvkk-data-categories',
      title: '3. İşlenen Kişisel Veri Kategorileri ve Toplama Yöntemleri',
      germanTitle: '3. Kategorien verarbeiteter Daten & Erhebungsmethoden',
      englishTitle: '3. Processed Data Categories & Collection Methods',
      content: (
        <>
          <p>
            Web sitemiz ve dijital platformlarımız üzerinden otomatik, kısmen otomatik veya sözleşmesel dijital kanallarla aşağıdaki veri kategorileri toplanmaktadır:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li><strong>Kimlik Verileri:</strong> Ad, soyad, unvan.</li>
            <li><strong>İletişim Verileri:</strong> Kurumsal veya şahsi e-posta adresi, telefon numarası, fatura/işletme posta adresi.</li>
            <li><strong>Kurumsal ve Proje Verileri:</strong> Şirket ticari unvanı, vergi dairesi/numarası, proje kapsamı (Scope), Lastenheft detayları, bütçe aralıkları ve zamanlama gereksinimleri.</li>
            <li><strong>İşlem Güvenliği ve Teknik Veriler:</strong> IP adresi (maskelenmiş/anonymized), erişim tarih ve saati, HTTP istek başlıkları, cihaz ve işletim sistemi tipi, DDoS koruma logları, firewall güvenlik kayıtları.</li>
            <li><strong>Çerez ve Davranışsal Analiz Verileri:</strong> Yalnızca kullanıcı açık onayı (Opt-In) alınmışsa; oturum analitiği, sayfa etkileşim metrikleri ve dil/arayüz tercihleri (TDDDG § 25 uyumlu).</li>
            <li><strong>Yapay Zeka Etkileşim Kayıtları:</strong> Formlar veya chatbot üzerinden iletilen proje tanımları ve prompt girdileri (kurumsal güvenlik protokolleri altında işlenir).</li>
          </ul>
        </>
      ),
      germanContent: (
        <>
          <p>
            Über unsere Website und Plattformen erheben wir folgende Datenkategorien auf automatisierte oder vertragliche Weise:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li><strong>Identifikationsdaten:</strong> Vor- und Nachname, akademischer Titel/Rolle.</li>
            <li><strong>Kontaktdaten:</strong> Geschäftliche oder private E-Mail-Adresse, Telefonnummer, postalische Rechnungsadresse.</li>
            <li><strong>Unternehmens- & Projektdaten:</strong> Firmenname, Steuernummer, technische Anforderungen (Lastenheft/Pflichtenheft), Budgetrahmen, ROI-Parameter.</li>
            <li><strong>Sicherheits- & Serverlog-Daten:</strong> IP-Adresse (anonymisiert), Datum und Uhrzeit des Zugriffs, User-Agent, Referrer URL, DDoS- und Firewall-Protokolldaten.</li>
            <li><strong>Cookie- & Interaktionsdaten:</strong> Ausschließlich nach ausdrücklicher Einwilligung (Opt-In gem. § 25 TDDDG): Analytische Metriken und UI-Präferenzen.</li>
            <li><strong>KI-Interaktionsdaten:</strong> Textuelle Eingaben und Prompts in Chatbots oder Formularen zur Projektanalyse.</li>
          </ul>
        </>
      ),
      englishContent: (
        <>
          <p>
            Through our web applications and communication channels, we collect the following categories of data via automated or contractual means:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li><strong>Identity Data:</strong> First and last name, business title.</li>
            <li><strong>Contact Data:</strong> Business or personal email address, phone number, billing address.</li>
            <li><strong>Corporate & Project Data:</strong> Company legal name, tax identification, project specification (Scope/Lastenheft), target timelines, and budget expectations.</li>
            <li><strong>Technical & IT Security Logs:</strong> IP address (masked/anonymized), access timestamps, browser/OS user agent, referrer URL, firewall, and DDoS mitigation event logs.</li>
            <li><strong>Cookie & Preference Data:</strong> Strictly subject to explicit consent (Opt-In under TDDDG § 25): Anonymous analytics and user interface settings.</li>
            <li><strong>AI Interaction Logs:</strong> Prompts and structured inquiries entered into our interactive estimation and briefing tools.</li>
          </ul>
        </>
      )
    },
    {
      id: 'kvkk-processing-purposes',
      title: '4. İşleme Amaçları ve Hukuki Dayanaklar (Art. 6 DSGVO & KVKK M. 5)',
      germanTitle: '4. Verarbeitungszwecke & Rechtsgrundlagen (Art. 6 DSGVO & KVKK Art. 5)',
      englishTitle: '4. Processing Purposes & Legal Grounds (Art. 6 GDPR & KVKK Art. 5)',
      content: (
        <>
          <p>
            Kişisel verileriniz, hem Avrupa Birliği Genel Veri Koruma Tüzüğü (DSGVO) hem de 6698 sayılı KVKK’nın amir hükümleri doğrultusunda şu hukuki dayanaklarla işlenir:
          </p>
          <ul className="list-disc pl-5 space-y-3 mt-3">
            <li>
              <strong>Sözleşmenin Kurulması ve İfası (Art. 6 Abs. 1 lit. b DSGVO & KVKK M. 5/2-c):</strong> Şartname (Lastenheft) hazırlanması, fiyat teklifi sunulması, yazılım geliştirme projelerinin yürütülmesi, faturalandırma ve müşteri destek süreçlerinin işletilmesi.
            </li>
            <li>
              <strong>Hukuki Yükümlülüklerin Yerine Getirilmesi (Art. 6 Abs. 1 lit. c DSGVO & KVKK M. 5/2-ç):</strong> Alman Ticaret Kanunu (HGB § 257) ve Alman Vergi Usul Kanunu (AO § 147) uyarınca ticari defter, fatura ve muhasebe kayıtlarının yasal saklama süreleri boyunca muhafaza edilmesi.
            </li>
            <li>
              <strong>Meşru Menfaatlerimiz (Art. 6 Abs. 1 lit. f DSGVO & KVKK M. 5/2-f):</strong> BT altyapımızın siber saldırılardan (DDoS, SQLi, Brute-Force) korunması, sahte/spam form başvurularının engellenmesi, sistem kararlılığı ve şirketimizin yasal haklarının korunması.
            </li>
            <li>
              <strong>Açık Rıza (Art. 6 Abs. 1 lit. a DSGVO & KVKK M. 5/1):</strong> İsteğe bağlı pazarlama bültenleri veya zorunlu olmayan analitik/pazarlama çerezlerinin kullanımı (çerez bannerı üzerinden dilediğiniz an geri alınabilir).
            </li>
          </ul>
        </>
      ),
      germanContent: (
        <>
          <p>
            Ihre personenbezogenen Daten werden gemäß Art. 6 DSGVO und Art. 5 KVKK auf Basis folgender Rechtsgrundlagen verarbeitet:
          </p>
          <ul className="list-disc pl-5 space-y-3 mt-3">
            <li>
              <strong>Vertragserfüllung & vorvertragliche Maßnahmen (Art. 6 Abs. 1 lit. b DSGVO / KVKK Art. 5/2-c):</strong> Angebotserstellung, Lastenheft-Konzeption, Durchführung von Software- und KI-Projekten sowie Kundenkommunikation.
            </li>
            <li>
              <strong>Rechtliche Verpflichtungen (Art. 6 Abs. 1 lit. c DSGVO / KVKK Art. 5/2-ç):</strong> Erfüllung handels- und steuerrechtlicher Aufbewahrungspflichten (§ 257 HGB, § 147 AO).
            </li>
            <li>
              <strong>Berechtigte Interessen (Art. 6 Abs. 1 lit. f DSGVO / KVKK Art. 5/2-f):</strong> IT-Sicherheit, Abwehr von Cyberangriffen, Betrugsprävention und Geltendmachung rechtlicher Ansprüche.
            </li>
            <li>
              <strong>Einwilligung (Art. 6 Abs. 1 lit. a DSGVO / KVKK Art. 5/1):</strong> Für optionale Marketingmitteilungen oder Analyse-Cookies, jederzeit über unser Cookie-Center widerrufbar.
            </li>
          </ul>
        </>
      ),
      englishContent: (
        <>
          <p>
            Your personal data is processed under the strict legal mandates of Art. 6 GDPR and Art. 5 KVKK pursuant to the following grounds:
          </p>
          <ul className="list-disc pl-5 space-y-3 mt-3">
            <li>
              <strong>Contract Performance & Pre-contractual Measures (Art. 6(1)(b) GDPR & KVKK Art. 5/2-c):</strong> Formulation of technical specifications (Lastenheft), price quotations, custom software execution, and project deployment.
            </li>
            <li>
              <strong>Statutory Legal Compliance (Art. 6(1)(c) GDPR & KVKK Art. 5/2-ç):</strong> Compliance with statutory commercial and fiscal retention requirements under the German Commercial Code (§ 257 HGB) and Fiscal Code (§ 147 AO).
            </li>
            <li>
              <strong>Legitimate Interests (Art. 6(1)(f) GDPR & KVKK Art. 5/2-f):</strong> Securing digital infrastructure against cyber attacks, preventing spam/fraud, and defending corporate legal claims.
            </li>
            <li>
              <strong>Explicit Consent (Art. 6(1)(a) GDPR & KVKK Art. 5/1):</strong> Voluntary subscription to newsletters or activation of non-essential analytics cookies, revocable at any time.
            </li>
          </ul>
        </>
      )
    },
    {
      id: 'kvkk-data-processor-shield',
      title: '5. Veri İşleyen Sıfatıyla Sorumluluk Kalkanı ve Müşterinin Kusursuz Rücu Sorumluluğu',
      germanTitle: '5. Haftungsschutz als Auftragsverarbeiter & Vollständige Freistellung durch den Kunden',
      englishTitle: '5. Data Processor Liability Shield & Full Client Indemnification',
      content: (
        <>
          <p className="font-semibold text-amber-600 dark:text-amber-400">
            ÖNEMLİ HUKUKİ BİLGİLENDİRME (Müşteri Projeleri ve Son Kullanıcı Verileri):
          </p>
          <p className="mt-2">
            Star Web Flow; müşterileri için özel web sitesi, mobil uygulama, CRM, e-ticaret altyapısı, veritabanı veya yapay zeka entegrasyonu geliştirdiğinde, bu platformlara yüklenen veya müşterinin son kullanıcılarından toplanan veriler bakımından münhasıran <strong>"Veri İşleyen" (Auftragsverarbeiter gem. Art. 28 DSGVO / KVKK Veri İşleyen)</strong> sıfatını haizdir. Hizmeti satın alan müşteri ise hukuken tek başına <strong>"Veri Sorumlusu" (Verantwortlicher gem. Art. 4 Nr. 7 DSGVO / KVKK Veri Sorumlusu)</strong> sıfatını taşır.
          </p>
          <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-sm space-y-3 text-slate-800 dark:text-slate-200">
            <p>
              <strong>Müşterinin Kusursuz Sorumluluğu ve Taahhüdü:</strong> Müşteri, geliştirdiğimiz sistemler üzerinden topladığı, sakladığı veya tarafımıza aktardığı tüm son kullanıcı verilerinin yürürlükteki veri koruma mevzuatına (DSGVO, BDSG, TDDDG, KVKK vb.) tamamen uygun şekilde toplandığını, geçerli açık rızaların alındığını ve yasal aydınlatma metinlerinin eksiksiz sağlandığını gayrikabili rücu kabul, beyan ve taahhüt eder.
            </p>
            <p>
              <strong>Şirketimizin Tam Tazminat ve Rücu Koruması (Indemnification):</strong> Müşterinin hukuka aykırı veri işlemesi, aydınlatma yükümlülüğünü yerine getirmemesi, çerez rızası almaksızın veri toplaması, veri sızıntısına sebebiyet vermesi veya üçüncü kişilerin gizlilik haklarını ihlal etmesi sebebiyle Star Web Flow - Sinan Günay aleyhine uygulanabilecek her türlü idari para cezası (DSGVO Art. 83 ve KVKK cezaları dahil), resmi denetim masrafı, dava ve icra harcı, avukatlık ve danışmanlık ücreti ile üçüncü kişilere ödenecek tazminatlar, ilk yazılı talep üzerine hiçbir defi ve itiraz ileri sürülmeksizin derhal ve nakden MÜŞTERİ TARAFINDAN TAZMİN EDİLİR.
            </p>
            <p>
              Müşteri, Star Web Flow’u tüm resmi merci ve mahkeme kararlarına karşı tam muaf ve sorumsuz kılmayı peşinen kabul eder.
            </p>
          </div>
        </>
      ),
      germanContent: (
        <>
          <p className="font-semibold text-amber-600 dark:text-amber-400">
            WICHTIGER RECHTSHINWEIS (Kundenprojekte & Endnutzerdaten):
          </p>
          <p className="mt-2">
            Soweit Star Web Flow für Kunden Websites, Web-Apps, Kundenportale, Datenbanken oder KI-Automatisierungen entwickelt oder hostet und hierbei personenbezogene Daten der Kundenkunden (Endnutzer) verarbeitet werden, agiert Star Web Flow ausschließlich als <strong>Auftragsverarbeiter gemäß Art. 28 DSGVO (bzw. Veri İşleyen nach KVKK)</strong>. Der Auftraggeber (Kunde) ist und bleibt der alleinige <strong>Verantwortliche im Sinne von Art. 4 Nr. 7 DSGVO (Veri Sorumlusu)</strong>.
          </p>
          <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-sm space-y-3 text-slate-800 dark:text-slate-200">
            <p>
              <strong>Alleinige Compliance-Pflicht des Kunden:</strong> Der Kunde garantiert verbindlich, dass alle in die Systeme eingespeisten oder über die Anwendungen erhobenen Endnutzerdaten in strikter Übereinstimmung mit der DSGVO, dem BDSG, dem TDDDG und dem KVKK erhoben wurden und rechtsgültige Einwilligungen sowie Datenschutzerklärungen vorliegen.
            </p>
            <p>
              <strong>Vollständige Freistellung von Bußgeldern & Schadensersatzansprüchen (Indemnity):</strong> Sollten gegen Star Web Flow - Sinan Günay behördliche Bußgelder (insb. nach Art. 83 DSGVO oder KVKK), Abmahnungen oder Schadensersatzforderungen Dritter wegen Datenschutzverstößen geltend gemacht werden, die auf Pflichtverletzungen oder unrechtmäßigen Datenverarbeitungen des Kunden beruhen, stellt der Kunde Star Web Flow auf erstes Anfordern von sämtlichen Kosten, Strafen, Anwalts- und Gerichtskosten vollumfänglich und bedingungslos frei.
            </p>
          </div>
        </>
      ),
      englishContent: (
        <>
          <p className="font-semibold text-amber-600 dark:text-amber-400">
            CRITICAL LEGAL STIPULATION (Client Projects & End-User Data):
          </p>
          <p className="mt-2">
            When Star Web Flow engineers custom web applications, portals, AI integrations, or databases on behalf of clients, Star Web Flow acts strictly as a <strong>Data Processor (pursuant to Art. 28 GDPR / KVKK Data Processor)</strong>. The purchasing client is solely and exclusively the <strong>Data Controller (pursuant to Art. 4 No. 7 GDPR / KVKK Data Controller)</strong>.
          </p>
          <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-sm space-y-3 text-slate-800 dark:text-slate-200">
            <p>
              <strong>Sole Client Compliance Warranty:</strong> The client expressly guarantees that all end-user data collected, fed, or managed through their software is collected in full compliance with GDPR, BDSG, TDDDG, and KVKK with valid consent and disclosure notices.
            </p>
            <p>
              <strong>Comprehensive Indemnification & Hold Harmless:</strong> The client agrees to defend, unconditionally indemnify, and hold harmless Star Web Flow - Sinan Günay against any administrative fines (including GDPR Art. 83 fines and KVKK penalties), third-party claims, legal expenses, and litigation fees arising from the client's privacy non-compliance or unlawful data handling.
            </p>
          </div>
        </>
      )
    },
    {
      id: 'ai-thirdparty-disclaimer',
      title: '6. Yapay Zeka (AI) Servisleri, 3. Taraf API ve Bulut Altyapısı Güvencesi',
      germanTitle: '6. KI-Dienste (AI), Drittanbieter-APIs & Cloud-Infrastruktur',
      englishTitle: '6. AI Services, Third-Party APIs & Cloud Infrastructure Safeguards',
      content: (
        <>
          <p>
            Star Web Flow, modern dijital çözümlerinde kurumsal düzeyde yapay zeka (OpenAI API, Google Cloud Vertex / Gemini API, Anthropic) ve bulut barındırma teknolojilerinden faydalanmaktadır. Bu kapsamda şirketimiz şu yasal güvenceleri sunar ve sorumluluk sınırlarını çizer:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li><strong>Model Eğitimi Yasağı (Zero Model Training):</strong> Müşterilerimizin tescilli verileri, kaynak kodları ve kurumsal sırları, kamuya açık yapay zeka temel modellerini eğitmek amacıyla (training data) KESİNLİKLE KULLANILMAZ. Veriler yalnızca kurumsal API sözleşmeleri kapsamında ve anlık işlem süresiyle sınırlı olarak işlenir.</li>
            <li><strong>3. Taraf API Sorumsuzluğu:</strong> OpenAI, Google, AWS, Vercel, Supabase veya Cloudflare gibi küresel altyapı sağlayıcılarının sistem kesintilerinden, küresel API erişim engellerinden veya algoritmik halüsinasyon/çıktı sapmalarından doğabilecek dolaylı zararlardan Star Web Flow sorumlu tutulamaz.</li>
            <li><strong>Kurumsal Güvenlik Standartları:</strong> Tüm veri trafiği TLS 1.3 / SSL şifreleme protokolleri üzerinden uçtan uca şifrelenmiş tüneller ile aktarılır.</li>
          </ul>
        </>
      ),
      germanContent: (
        <>
          <p>
            Star Web Flow nutzt modernste KI-Modelle (OpenAI Enterprise API, Google Gemini, Anthropic) sowie Tier-1 Cloud-Provider (Vercel, AWS, Cloudflare). Folgende Richtlinien gelten uneingeschränkt:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li><strong>Kein Modell-Training mit Kundendaten:</strong> Vertrauliche Kundendaten oder geschützter Quellcode werden NIEMALS zum Training öffentlicher KI-Modelle verwendet. Die Verarbeitung erfolgt ausschließlich über gesicherte Enterprise-Schnittstellen (Zero Data Retention / No Training).</li>
            <li><strong>Haftungsausschluss für Drittanbieter-Infrastruktur:</strong> Für unvorhersehbare Ausfälle, Schnittstellenänderungen oder Latenzen externer Cloud- und KI-Anbieter (OpenAI, AWS, Vercel) übernimmt Star Web Flow keine Haftung für Folgeschäden.</li>
            <li><strong>Verschlüsselung:</strong> Sämtliche Datenströme werden nach modernstem Stand der Technik (TLS 1.3, AES-256) verschlüsselt übertragen.</li>
          </ul>
        </>
      ),
      englishContent: (
        <>
          <p>
            Star Web Flow leverages enterprise-grade AI technologies (OpenAI API, Google Vertex/Gemini, Anthropic) and global cloud infrastructure (Vercel, AWS, Cloudflare). We uphold the following safeguards and liability demarcations:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li><strong>Zero Training on Proprietary Data:</strong> Confidential client data and intellectual property are STRICTLY NEVER used to train public generative AI foundation models. Processing is conducted solely through isolated enterprise APIs under Zero Retention agreements.</li>
            <li><strong>Third-Party Infrastructure Disclaimer:</strong> Star Web Flow disclaims liability for indirect damages or operational downtime resulting from upstream service outages or policy alterations of third-party cloud/AI providers (e.g., AWS, OpenAI, Vercel).</li>
            <li><strong>Encryption Standards:</strong> Data in transit is secured via industry-standard TLS 1.3 cryptographic protocols.</li>
          </ul>
        </>
      )
    },
    {
      id: 'cross-border-transfers',
      title: '7. Uluslararası Veri Aktarımı ve Sunucu Konumları (Almanya / AB & Türkiye)',
      germanTitle: '7. Internationale Datenübermittlung & Serverstandorte',
      englishTitle: '7. Cross-Border Data Transfers & Server Locations',
      content: (
        <>
          <p>
            Star Web Flow’un ana sunucu ve veritabanı altyapıları, Avrupa Birliği sınırları dahilinde <strong>Frankfurt am Main / Almanya</strong> lokasyonundaki ISO 27001 ve SOC 2 sertifikalı güvenli veri merkezlerinde barındırılmaktadır.
          </p>
          <p className="mt-3">
            Türkiye Cumhuriyeti mukimi kullanıcıların verilerinin Almanya’daki sunucularımızda saklanması durumunda; KVKK Madde 9 (Yurt Dışına Veri Aktarımı) ve DSGVO Madde 44-49 (Drittlandübermittlung) hükümleri gözetilerek, teknik ve idari koruma tedbirleri ile AB Standart Sözleşme Maddeleri (SCC) doğrultusunda azami güvenlik sağlanmaktadır.
          </p>
        </>
      ),
      germanContent: (
        <>
          <p>
            Die primäre Server- und Datenbank-Infrastruktur von Star Web Flow befindet sich innerhalb der Europäischen Union im ISO-27001-zertifizierten Rechenzentrum in <strong>Frankfurt am Main, Deutschland</strong>.
          </p>
          <p className="mt-3">
            Jegliche Datenübertragung zwischen der EU und Drittländern (einschließlich der Türkei oder der USA) erfolgt unter strenger Beachtung von Art. 44 ff. DSGVO auf Basis von Angemessenheitsbeschlüssen, EU-Standardvertragsklauseln (SCC) oder Art. 9 KVKK.
          </p>
        </>
      ),
      englishContent: (
        <>
          <p>
            Star Web Flow’s primary servers and database clusters are hosted within the European Union in ISO 27001 and SOC 2 certified data centers located in <strong>Frankfurt am Main, Germany</strong>.
          </p>
          <p className="mt-3">
            Cross-border data transfers between the EU, Turkey, and other third jurisdictions comply rigorously with Chapter V of the GDPR (Articles 44–49) and KVKK Article 9, utilizing EU Standard Contractual Clauses (SCC) and robust technical safeguards.
          </p>
        </>
      )
    },
    {
      id: 'data-retention',
      title: '8. Saklama Süreleri ve Yasal Ticari Arşivleme (§ 147 AO, § 257 HGB)',
      germanTitle: '8. Speicherdauer & Gesetzliche Aufbewahrungspflichten (§ 147 AO, § 257 HGB)',
      englishTitle: '8. Retention Periods & Statutory Commercial Archiving',
      content: (
        <>
          <p>
            Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca ve her halükarda Alman Ticaret Kanunu (HGB § 257) ile Alman Vergi Usul Kanunu (AO § 147) uyarınca öngörülen yasal saklama süreleri boyunca muhafaza edilir:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li><strong>Ticari Defterler, Faturalar ve Muhasebe Kayıtları:</strong> 10 yıl (§ 147 Abs. 3 AO).</li>
            <li><strong>Sözleşmeler, Ticari Yazışmalar ve Teklif Dokümanları:</strong> 6 yıl (§ 257 Abs. 4 HGB).</li>
            <li><strong>Web Trafik Logları ve Güvenlik Kayıtları:</strong> Güvenlik analizleri ve DDoS önleme maksadıyla en fazla 14 ile 90 gün arasında tutulur, ardından otomatik olarak kalıcı silinir.</li>
          </ul>
        </>
      ),
      germanContent: (
        <>
          <p>
            Personenbezogene Daten werden nur so lange gespeichert, wie es für die Zweckerreichung erforderlich ist oder gesetzliche Aufbewahrungsfristen dies vorschreiben:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li><strong>Rechnungen, Buchungsbelege und Steuerunterlagen:</strong> 10 Jahre gemäß § 147 Abs. 3 AO.</li>
            <li><strong>Geschäftsbriefe, Verträge und Angebote:</strong> 6 Jahre gemäß § 257 Abs. 4 HGB.</li>
            <li><strong>Server-Logfiles:</strong> Zur Erkennung von Sicherheitsvorfällen maximal 14 bis 90 Tage, danach automatisierte Löschung.</li>
          </ul>
        </>
      ),
      englishContent: (
        <>
          <p>
            Personal data is retained only for the duration required to accomplish the stated purposes or as mandated by German statutory retention periods:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li><strong>Invoices, Accounting Records, and Financial Documents:</strong> 10 years pursuant to § 147(3) German Fiscal Code (AO).</li>
            <li><strong>Contracts, Commercial Letters, and Formal Offers:</strong> 6 years pursuant to § 257(4) German Commercial Code (HGB).</li>
            <li><strong>Server Log Files:</strong> Retained for 14 to 90 days for cybersecurity threat analysis, then permanently purged.</li>
          </ul>
        </>
      )
    },
    {
      id: 'data-subject-rights',
      title: '9. İlgili Kişinin Hakları ve Başvuru Usulü (DSGVO Art. 15-22 & KVKK M. 11)',
      germanTitle: '9. Rechte der betroffenen Personen (Art. 15-22 DSGVO & Art. 11 KVKK)',
      englishTitle: '9. Rights of Data Subjects & Formal Request Procedures',
      content: (
        <>
          <p>
            Veri sahibi olarak, hem Avrupa Birliği DSGVO hem de KVKK hükümleri uyarınca aşağıdaki haklara sahipsiniz:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li><strong>Erişim ve Bilgi Edinme Hakkı (Art. 15 DSGVO / KVKK M. 11/1-a,b):</strong> Hakkınızda işlenen verileri ve işleme amaçlarını öğrenme.</li>
            <li><strong>Düzeltme Hakkı (Art. 16 DSGVO / KVKK M. 11/1-d):</strong> Yanlış veya eksik kişisel verilerin düzeltilmesini talep etme.</li>
            <li><strong>Silme Hakkı / Unutulma Hakkı (Art. 17 DSGVO / KVKK M. 11/1-e):</strong> Yasal saklama zorunluluğu bulunmayan verilerin derhal silinmesini isteme.</li>
            <li><strong>İşlemenin Kısıtlanması Hakkı (Art. 18 DSGVO):</strong> Belirli koşullarda verilerin işlenmesinin sınırlandırılmasını talep etme.</li>
            <li><strong>Veri Taşınabilirliği Hakkı (Art. 20 DSGVO):</strong> Verilerinizi yapılandırılmış, yaygın kullanılan ve makinece okunabilir bir formatta alma.</li>
            <li><strong>İtiraz Hakkı (Art. 21 DSGVO / KVKK M. 11/1-g):</strong> Meşru menfaate dayalı veri işlemeye ve doğrudan pazarlama faaliyetlerine gerekçeli itiraz etme.</li>
          </ul>
          <p className="mt-4">
            <strong>Başvuru Yöntemi ve Kimlik Doğrulama:</strong> Kurumsal veri güvenliğini korumak ve kimlik sahteciliği yoluyla bilgi sızdırılmasını engellemek amacıyla; taleplerinizi kimliğinizi tevsik edici belgelerle birlikte ıslak imzalı olarak şirket adresimize veya kayıtlı e-posta adresimiz olan <a href="mailto:privacy@starwebflow.com" className="text-[#4F8EF7] hover:underline">privacy@starwebflow.com</a> adresine iletebilirsiniz. Başvurularınız en geç 30 gün içinde yasal süresi içinde ücretsiz olarak sonuçlandırılır.
          </p>
        </>
      ),
      germanContent: (
        <>
          <p>
            Als betroffene Person stehen Ihnen gemäß DSGVO (Art. 15–22) sowie Art. 11 KVKK folgende Rechte zu:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li>Recht auf Auskunft (Art. 15 DSGVO).</li>
            <li>Recht auf Berichtigung (Art. 16 DSGVO).</li>
            <li>Recht auf Löschung („Vergessenwerden“, Art. 17 DSGVO).</li>
            <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO).</li>
            <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO).</li>
            <li>Widerspruchsrecht gegen die Verarbeitung (Art. 21 DSGVO).</li>
          </ul>
          <p className="mt-4">
            Zur Ausübung Ihrer Rechte wenden Sie sich bitte mit einem Identitätsnachweis an <a href="mailto:privacy@starwebflow.com" className="text-[#4F8EF7] hover:underline">privacy@starwebflow.com</a>. Die Bearbeitung erfolgt unverzüglich und innerhalb von maximal 30 Tagen.
          </p>
        </>
      ),
      englishContent: (
        <>
          <p>
            Under GDPR (Articles 15–22) and KVKK Article 11, data subjects are entitled to:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li>Right of access to personal data (Art. 15 GDPR).</li>
            <li>Right to rectification of inaccuracies (Art. 16 GDPR).</li>
            <li>Right to erasure / "right to be forgotten" (Art. 17 GDPR).</li>
            <li>Right to restriction of processing (Art. 18 GDPR).</li>
            <li>Right to data portability (Art. 20 GDPR).</li>
            <li>Right to object to processing (Art. 21 GDPR).</li>
          </ul>
          <p className="mt-4">
            Formal inquiries accompanied by verifiable proof of identity may be directed to <a href="mailto:privacy@starwebflow.com" className="text-[#4F8EF7] hover:underline">privacy@starwebflow.com</a>. Requests will be resolved within statutory limits (maximum 30 days).
          </p>
        </>
      )
    },
    {
      id: 'supervisory-authorities',
      title: '10. Yetkili Denetim Makamları ve Şikayet Hakkı',
      germanTitle: '10. Zuständige Aufsichtsbehörden & Beschwerderecht',
      englishTitle: '10. Competent Supervisory Authorities & Right to Complain',
      content: (
        <>
          <p>
            Veri işleme faaliyetlerimizle ilgili olarak yürürlükteki mevzuat uyarınca yetkili denetim makamlarına şikayet hakkınız saklıdır:
          </p>
          <div className="mt-3 space-y-3 text-sm">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
              <p className="font-semibold text-slate-900 dark:text-white">Almanya / AB Yetkili Denetim Makamı (Zuständige Datenschutzbehörde):</p>
              <p>Der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Rheinland-Pfalz (LfDI RLP)</p>
              <p>Hintere Bleiche 34, 55116 Mainz, Deutschland</p>
              <p>Web: <a href="https://www.datenschutz.rlp.de" target="_blank" rel="noopener noreferrer" className="text-[#4F8EF7] hover:underline">www.datenschutz.rlp.de</a></p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
              <p className="font-semibold text-slate-900 dark:text-white">Türkiye Cumhuriyeti Yetkili Denetim Makamı:</p>
              <p>Kişisel Verileri Koruma Kurumu (KVKK)</p>
              <p>Nasuh Akar Mah. Ziyabey Cad. 1407. Sok. No: 4 06520 Balgat-Çankaya / Ankara, Türkiye</p>
              <p>Web: <a href="https://www.kvkk.gov.tr" target="_blank" rel="noopener noreferrer" className="text-[#4F8EF7] hover:underline">www.kvkk.gov.tr</a></p>
            </div>
          </div>
        </>
      ),
      germanContent: (
        <>
          <p>
            Sie haben das Recht auf Beschwerde bei einer Datenschutz-Aufsichtsbehörde (Art. 77 DSGVO):
          </p>
          <div className="mt-3 space-y-3 text-sm">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
              <p className="font-semibold text-slate-900 dark:text-white">Zuständige Aufsichtsbehörde in Deutschland:</p>
              <p>Der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Rheinland-Pfalz (LfDI RLP)</p>
              <p>Hintere Bleiche 34, 55116 Mainz, Deutschland</p>
              <p>Internet: <a href="https://www.datenschutz.rlp.de" target="_blank" rel="noopener noreferrer" className="text-[#4F8EF7] hover:underline">www.datenschutz.rlp.de</a></p>
            </div>
          </div>
        </>
      ),
      englishContent: (
        <>
          <p>
            You have the right to lodge a complaint with the competent supervisory authority (Art. 77 GDPR):
          </p>
          <div className="mt-3 space-y-3 text-sm">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
              <p className="font-semibold text-slate-900 dark:text-white">Competent Supervisory Authority (Germany / EU):</p>
              <p>Der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Rheinland-Pfalz (LfDI RLP)</p>
              <p>Hintere Bleiche 34, 55116 Mainz, Germany</p>
              <p>Website: <a href="https://www.datenschutz.rlp.de" target="_blank" rel="noopener noreferrer" className="text-[#4F8EF7] hover:underline">www.datenschutz.rlp.de</a></p>
            </div>
          </div>
        </>
      )
    },
    {
      id: 'governing-law',
      title: '11. Uygulanacak Hukuk ve Yetkili Yargı Yeri',
      germanTitle: '11. Anwendbares Recht & Gerichtsstand',
      englishTitle: '11. Governing Law & Jurisdiction',
      content: (
        <>
          <p>
            İşbu Aydınlatma Metni ve veri koruma ilişkisinden doğabilecek tüm uyuşmazlıklarda münhasıran <strong>Almanya Federal Cumhuriyeti Hukuku</strong> uygulanır.
          </p>
          <p className="mt-2">
            Taraflar arasındaki tüm hukuki ihtilaflarda münhasır yetkili yargı yeri <strong>Almanya / Ludwigshafen am Rhein (veya Speyer) Mahkemeleri ve İcra Daireleri</strong>dir.
          </p>
        </>
      ),
      germanContent: (
        <>
          <p>
            Es gilt ausschließlich das Recht der <strong>Bundesrepublik Deutschland</strong> unter Ausschluss des UN-Kaufrechts (CISG).
          </p>
          <p className="mt-2">
            Ausschließlicher Gerichtsstand für sämtliche Streitigkeiten ist <strong>Ludwigshafen am Rhein (bzw. Speyer), Rheinland-Pfalz, Deutschland</strong>.
          </p>
        </>
      ),
      englishContent: (
        <>
          <p>
            This statement and any disputes arising therefrom shall be governed exclusively by the laws of the <strong>Federal Republic of Germany</strong>.
          </p>
          <p className="mt-2">
            The exclusive venue and place of jurisdiction for all disputes shall be <strong>Ludwigshafen am Rhein (or Speyer), Rhineland-Palatinate, Germany</strong>.
          </p>
        </>
      )
    }
  ]

  return (
    <LegalPageLayout
      title="DSGVO & KVKK Aydınlatma Metni"
      germanTitle="Datenschutzerklärung & Aufklärung (DSGVO & KVKK)"
      englishTitle="Data Protection & Clarification Statement (GDPR & KVKK)"
      subtitle="Avrupa Birliği (DSGVO/TDDDG), Almanya (BDSG) ve Türkiye (KVKK) mevzuatına tam uyumlu kişisel verilerin korunması ve şirket güvencesi bildirimi."
      germanSubtitle="Rechtliche Erklärung zur Datenerhebung, DSGVO/TDDDG-Konformität, Auftragsverarbeitung und Haftungsausschluss für Star Web Flow."
      englishSubtitle="Legal disclosure on data collection, GDPR/TDDDG compliance, data processing boundaries, and enterprise safeguards for Star Web Flow."
      lastUpdated="18 Ekim 2026"
      germanLastUpdated="18. Oktober 2026"
      englishLastUpdated="October 18, 2026"
      sections={sections}
    />
  )
}
