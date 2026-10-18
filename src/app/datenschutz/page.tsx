'use client'

import React from 'react'
import LegalPageLayout from '@/components/layout/LegalPageLayout'

export default function DatenschutzPage() {
  const sections = [
    {
      id: 'general',
      title: '1. Genel Bilgi ve Veri Sorumlusu (Verantwortlicher)',
      germanTitle: '1. Allgemeine Informationen & Verantwortlicher',
      englishTitle: '1. General Information & Data Controller',
      content: (
        <>
          <p>
            Star Web Flow olarak kişisel verilerinizin güvenliği, gizliliği ve korunması bizim için en üst düzeyde öneme sahiptir. Bu Gizlilik Politikası (Datenschutzerklärung), web sitemizi (www.starwebflow.com) ziyaret ettiğinizde, dijital hesaplama ve iletişim araçlarımızı kullandığınızda veya ajansımızdan yazılım ve dijital dönüşüm hizmeti aldığınızda kişisel verilerinizin nasıl işlendiğini, korunduğunu ve şirketimizin yasal haklarını açıklar.
          </p>
          <p className="mt-3">
            Veri işleme faaliyetlerimiz, Avrupa Birliği Genel Veri Koruma Tüzüğü (DSGVO / GDPR - Verordnung EU 2016/679), Alman Federal Veri Koruma Kanunu (BDSG), Telekomünikasyon ve Dijital Hizmetler Veri Koruma Kanunu (TDDDG) ve Türkiye Cumhuriyeti 6698 sayılı KVKK mevzuatına tam uyumlu olarak yürütülür.
          </p>
          <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-sm space-y-1">
            <p className="font-semibold text-slate-900 dark:text-white">Veri Sorumlusu (Verantwortlicher gem. Art. 4 Nr. 7 DSGVO):</p>
            <p><strong>Unvan:</strong> Star Web Flow - Sinan Günay (Einzelunternehmen / Şahıs İşletmesi)</p>
            <p><strong>Adres:</strong> Anilinerstr. 3, 67105 Schifferstadt, Rheinland-Pfalz, Deutschland</p>
            <p><strong>E-Posta:</strong> <a href="mailto:privacy@starwebflow.com" className="text-[#4F8EF7] hover:underline">privacy@starwebflow.com</a> / <a href="mailto:info@starwebflow.com" className="text-[#4F8EF7] hover:underline">info@starwebflow.com</a></p>
            <p><strong>Telefon:</strong> +49 179 492 4556</p>
            <p><strong>Vergi Numarası (St-Nr.):</strong> 41/056/80705 (Finanzamt Speyer-Germersheim)</p>
            <p><strong>KDV Muafiyeti:</strong> Kleinunternehmer gemäß § 19 UStG</p>
          </div>
        </>
      ),
      germanContent: (
        <>
          <p>
            Der Schutz Ihrer persönlichen Daten ist für uns von höchster Bedeutung. Diese Datenschutzerklärung klärt Sie über die Art, den Umfang und Zweck der Erhebung und Verwendung personenbezogener Daten auf unserer Website (www.starwebflow.com) sowie im Rahmen unserer Agenturdienstleistungen auf.
          </p>
          <p className="mt-3">
            Die Datenverarbeitung erfolgt in strikter Übereinstimmung mit der europäischen Datenschutz-Grundverordnung (DSGVO), dem Bundesdatenschutzgesetz (BDSG) sowie dem Telekommunikation-Digitale-Dienste-Datenschutz-Gesetz (TDDDG).
          </p>
          <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-sm space-y-1">
            <p className="font-semibold text-slate-900 dark:text-white">Verantwortlicher im Sinne von Art. 4 Nr. 7 DSGVO:</p>
            <p><strong>Firma/Inhaber:</strong> Star Web Flow - Sinan Günay (Einzelunternehmen)</p>
            <p><strong>Anschrift:</strong> Anilinerstr. 3, 67105 Schifferstadt, Rheinland-Pfalz, Deutschland</p>
            <p><strong>E-Mail:</strong> <a href="mailto:privacy@starwebflow.com" className="text-[#4F8EF7] hover:underline">privacy@starwebflow.com</a> / <a href="mailto:info@starwebflow.com" className="text-[#4F8EF7] hover:underline">info@starwebflow.com</a></p>
            <p><strong>Telefon:</strong> +49 179 492 4556</p>
            <p><strong>Steuernummer:</strong> 41/056/80705 (Finanzamt Speyer-Germersheim)</p>
            <p><strong>Status:</strong> Kleinunternehmer gemäß § 19 UStG (keine Umsatzsteuerausweisung)</p>
          </div>
        </>
      ),
      englishContent: (
        <>
          <p>
            At Star Web Flow, safeguarding your personal data and confidentiality is our highest priority. This Privacy Policy outlines how your personal data is collected, processed, and safeguarded when visiting www.starwebflow.com, utilizing our interactive tools, or engaging our software engineering services.
          </p>
          <p className="mt-3">
            Our data processing operations strictly adhere to the European Union General Data Protection Regulation (EU GDPR), the German Federal Data Protection Act (BDSG), and the German Telecommunications-Telemedia Data Protection Act (TDDDG).
          </p>
          <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-sm space-y-1">
            <p className="font-semibold text-slate-900 dark:text-white">Data Controller (pursuant to Art. 4 No. 7 GDPR):</p>
            <p><strong>Entity:</strong> Star Web Flow - Sinan Günay (Sole Proprietorship / Einzelunternehmen)</p>
            <p><strong>Address:</strong> Anilinerstr. 3, 67105 Schifferstadt, Rhineland-Palatinate, Germany</p>
            <p><strong>Email:</strong> <a href="mailto:privacy@starwebflow.com" className="text-[#4F8EF7] hover:underline">privacy@starwebflow.com</a> / <a href="mailto:info@starwebflow.com" className="text-[#4F8EF7] hover:underline">info@starwebflow.com</a></p>
            <p><strong>Phone:</strong> +49 179 492 4556</p>
            <p><strong>Tax ID:</strong> 41/056/80705 (Finanzamt Speyer-Germersheim)</p>
            <p><strong>VAT Status:</strong> Small business pursuant to § 19 German UStG (no VAT applied)</p>
          </div>
        </>
      )
    },
    {
      id: 'data-collection',
      title: '2. Toplanan Veri Türleri ve Toplama Yöntemleri',
      germanTitle: '2. Datenkategorien & Erfassungsmethoden',
      englishTitle: '2. Categories of Collected Data & Methods',
      content: (
        <>
          <p>
            Web sitemizi ziyaretinizde veya etkileşimli hizmetlerimizi kullanımınız sırasında şu veriler işlenmektedir:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li><strong>İletişim ve Talep Verileri:</strong> Teklif ve iletişim formlarında ilettiğiniz Ad, Soyad, Kurumsal E-posta adresi, Telefon numarası ve Şirket unvanı.</li>
            <li><strong>Proje Parametreleri ve Şartname Bilgileri:</strong> ROI hesaplama araçlarında ve Lastenheft oluşturucuda seçilen özellikler, bütçe tahminleri ve sektör bilgileri.</li>
            <li><strong>Sunucu Log Kayıtları ve Siber Güvenlik Verileri:</strong> Maskelenmiş IP adresiniz, tarayıcı tipi ve versiyonu, işletim sistemi, yönlendiren URL (Referrer), sunucu erişim saati ve DDoS/WAF güvenlik filtreleme logları.</li>
            <li><strong>Çerez ve Tercih Verileri:</strong> Çerez bannerı üzerinden açık onay vermeniz halinde (Opt-in) analitik ve oturum tercihleri verileri.</li>
          </ul>
        </>
      ),
      germanContent: (
        <>
          <p>
            Bei der Nutzung unseres Webangebots werden folgende Kategorien personenbezogener Daten verarbeitet:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li><strong>Kontaktdaten:</strong> Name, E-Mail-Adresse, Telefonnummer und Firmenbezeichnung bei Absenden von Formularen oder Anfragen.</li>
            <li><strong>Projekt- & Lastenheft-Angaben:</strong> In interaktiven Rechnern ausgewählte technische Anforderungen, Zeithorizonte und Budgetschätzungen.</li>
            <li><strong>Server-Logfiles & IT-Sicherheitsdaten:</strong> Anonymisierte IP-Adresse, Browsertyp/-version, Betriebssystem, Referrer URL, Zeitstempel der Serveranfrage, Sicherheitsereignisse zur DDoS- und Firewall-Abwehr.</li>
            <li><strong>Cookie- & Einwilligungsdaten:</strong> Ihre ausgewählten Präferenzen bezüglich Tracking- und Analyse-Cookies gem. § 25 TDDDG.</li>
          </ul>
        </>
      ),
      englishContent: (
        <>
          <p>
            During your interaction with our platforms, we collect and process the following categories of data:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li><strong>Contact Information:</strong> First and last name, business email, telephone number, and company name submitted via forms.</li>
            <li><strong>Project Brief & Specification Details:</strong> Functional requirements, timeline estimates, and budget tiers selected in our calculators.</li>
            <li><strong>Server Logs & Cybersecurity Telemetry:</strong> Masked IP address, browser type/version, operating system, referrer URL, request timestamps, and DDoS/WAF protection event data.</li>
            <li><strong>Cookie Consent Logs:</strong> Your explicit consent preferences regarding non-essential tracking cookies under TDDDG § 25.</li>
          </ul>
        </>
      )
    },
    {
      id: 'legal-basis',
      title: '3. Veri İşlemenin Hukuki Sebepleri (Art. 6 DSGVO)',
      germanTitle: '3. Rechtsgrundlagen der Verarbeitung (Art. 6 DSGVO)',
      englishTitle: '3. Legal Bases for Processing (Art. 6 GDPR)',
      content: (
        <>
          <p>
            Kişisel verilerinizin işlenmesinde Avrupa Birliği DSGVO Madde 6 uyarınca şu hukuki sebeplere dayanmaktayız:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li><strong>Sözleşmenin İfası veya Ön Hazırlık (Art. 6 Abs. 1 lit. b DSGVO):</strong> Bize ilettiğiniz proje talepleri için teknik şartname hazırlamak, teklif sunmak ve yazılım sözleşmelerini ifa etmek.</li>
            <li><strong>Yasal Yükümlülükler (Art. 6 Abs. 1 lit. c DSGVO):</strong> Ticari ve mali mevzuat uyarınca faturaların ve ticari yazışmaların arşivlenmesi (§ 257 HGB, § 147 AO).</li>
            <li><strong>Meşru Menfaatler (Art. 6 Abs. 1 lit. f DSGVO):</strong> Web sunucularımızın güvenliğini sağlamak, siber saldırıları ve kötü niyetli spam faaliyetlerini engellemek, şirketimizin yasal haklarını korumak.</li>
            <li><strong>Açık Rıza (Art. 6 Abs. 1 lit. a DSGVO & § 25 Abs. 1 TDDDG):</strong> Çerez onay panelinden izin verdiğiniz analitik ve pazarlama çerezlerinin kullanımı.</li>
          </ul>
        </>
      ),
      germanContent: (
        <>
          <p>
            Die Verarbeitung Ihrer personenbezogenen Daten stützt sich auf folgende Rechtsgrundlagen gemäß Art. 6 DSGVO:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li><strong>Vertragserfüllung & vorvertragliche Maßnahmen (Art. 6 Abs. 1 lit. b DSGVO):</strong> Zur Angebotserstellung und Ausführung digitaler Entwicklungsaufträge.</li>
            <li><strong>Rechtliche Verpflichtung (Art. 6 Abs. 1 lit. c DSGVO):</strong> Zur Erfüllung gesetzlicher Buchführungs- und Aufbewahrungspflichten (§ 257 HGB, § 147 AO).</li>
            <li><strong>Berechtigte Interessen (Art. 6 Abs. 1 lit. f DSGVO):</strong> Gewährleistung der Serverstabilität, Abwehr von Angriffen und Betrugsschutz.</li>
            <li><strong>Einwilligung (Art. 6 Abs. 1 lit. a DSGVO i.V.m. § 25 Abs. 1 TDDDG):</strong> Für optionale Marketing- und Web-Analyse-Tools, jederzeit widerrufbar.</li>
          </ul>
        </>
      ),
      englishContent: (
        <>
          <p>
            Processing is grounded on the strict legal mandates of Art. 6 GDPR:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li><strong>Contract Execution & Pre-contractual Inquiries (Art. 6(1)(b) GDPR):</strong> Preparing project specifications, commercial estimates, and executing development agreements.</li>
            <li><strong>Statutory Compliance (Art. 6(1)(c) GDPR):</strong> Mandatory fiscal and trade law record-keeping (§ 257 HGB, § 147 AO).</li>
            <li><strong>Legitimate Interests (Art. 6(1)(f) GDPR):</strong> Safeguarding IT perimeter security, fraud prevention, and enforcing legal claims.</li>
            <li><strong>Explicit Consent (Art. 6(1)(a) GDPR & § 25(1) TDDDG):</strong> For non-mandatory analytics cookies, revocable at any moment.</li>
          </ul>
        </>
      )
    },
    {
      id: 'data-processor',
      title: '4. Veri İşleyen Sıfatıyla Sorumluluk Sınırları ve Müşterinin Tazminat Borcu',
      germanTitle: '4. Haftungsausschluss als Auftragsverarbeiter & Freistellung',
      englishTitle: '4. Data Processor Safeguards & Client Indemnification',
      content: (
        <>
          <p>
            Müşterilerimiz için geliştirdiğimiz web siteleri, veritabanları, SaaS yazılımları veya yapay zeka otomasyonlarında; müşterinin son kullanıcılarına ait verilerin işlenmesi bakımından Star Web Flow münhasıran <strong>"Veri İşleyen (Auftragsverarbeiter gem. Art. 28 DSGVO)"</strong> statüsündedir.
          </p>
          <p className="mt-3">
            Hizmeti satın alan müşteri ise yasal olarak tek başına <strong>"Veri Sorumlusu (Verantwortlicher gem. Art. 4 Nr. 7 DSGVO)"</strong> sıfatına sahiptir. Müşteri, geliştirdiğimiz platformlara aktarılan veya sistemler aracılığıyla toplanan tüm son kullanıcı verilerinin yürürlükteki veri koruma yasalarına (DSGVO, BDSG, TDDDG, KVKK) uygun şekilde toplandığını, gerekli açık rıza ve aydınlatma metinlerinin sağlandığını garanti eder.
          </p>
          <p className="mt-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm">
            <strong>Kusursuz Tazminat Taahhüdü:</strong> Müşterinin veri koruma yükümlülüklerine aykırı davranışı, eksik rıza alması veya hukuka aykırı veri işlemesi nedeniyle Star Web Flow - Sinan Günay aleyhine doğabilecek her türlü idari para cezası (DSGVO Art. 83 cezaları dahil), resmi denetim giderleri, avukatlık ücretleri ve üçüncü şahıs tazminat talepleri, ilk yazılı ihtarla birlikte MÜŞTERİ TARAFINDAN DEFATEN VE EKSİKSİZ TAZMİN EDİLİR.
          </p>
        </>
      ),
      germanContent: (
        <>
          <p>
            Soweit Star Web Flow im Auftrag von Kunden Softwarelösungen, Datenbanken oder KI-Systeme entwickelt oder hostet, in denen Endnutzerdaten des Kunden verarbeitet werden, wird Star Web Flow ausschließlich als <strong>Auftragsverarbeiter gemäß Art. 28 DSGVO</strong> tätig.
          </p>
          <p className="mt-3">
            Der Kunde ist und bleibt alleiniger <strong>Verantwortlicher im Sinne von Art. 4 Nr. 7 DSGVO</strong>. Der Kunde sichert vertraglich zu, dass sämtliche verarbeiteten Endnutzerdaten vollumfänglich datenschutzkonform erhoben wurden.
          </p>
          <p className="mt-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm">
            <strong>Freistellungsverpflichtung des Kunden:</strong> Der Kunde stellt Star Web Flow - Sinan Günay auf erstes schriftliches Anfordern von allen behördlichen Bußgeldern (insb. Art. 83 DSGVO), Rechtsanwaltskosten, Gerichtskosten und Schadensersatzansprüchen Dritter frei, die aus datenschutzrechtlichen Verstößen des Kunden resultieren.
          </p>
        </>
      ),
      englishContent: (
        <>
          <p>
            When engineering custom platforms, databases, or AI systems handling end-user data on behalf of clients, Star Web Flow acts strictly as a <strong>Data Processor pursuant to Art. 28 GDPR</strong>.
          </p>
          <p className="mt-3">
            The client purchasing our services remains the sole <strong>Data Controller under Art. 4 No. 7 GDPR</strong>. The client guarantees that all end-user data processed was lawfully obtained with valid consent.
          </p>
          <p className="mt-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm">
            <strong>Indemnification Guarantee:</strong> The client unconditionally agrees to indemnify and hold harmless Star Web Flow - Sinan Günay from all administrative penalties (including GDPR Art. 83 fines), legal defense costs, and third-party claims arising from the client’s failure to comply with privacy laws.
          </p>
        </>
      )
    },
    {
      id: 'ai-thirdparty-safeguards',
      title: '5. Yapay Zeka (AI) Güvenliği, Bulut Altyapısı ve Sunucu Lokasyonu',
      germanTitle: '5. KI-Sicherheit, Cloud-Infrastruktur & Serverstandort',
      englishTitle: '5. AI Security, Cloud Infrastructure & Hosting Location',
      content: (
        <>
          <p>
            Star Web Flow, müşterilerine en yüksek performans ve güvenliği sunmak üzere Tier-1 küresel altyapı sağlayıcıları ile çalışmaktadır:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li><strong>Sunucu Konumu (Almanya / AB):</strong> Web sitemiz ve veritabanı altyapılarımız, ISO 27001 ve SOC 2 sertifikalı Frankfurt am Main / Almanya veri merkezlerinde (Vercel, AWS, Cloudflare) barındırılmaktadır.</li>
            <li><strong>Yapay Zeka API Güvencesi:</strong> Kullandığımız kurumsal AI modelleri (OpenAI Enterprise, Google Cloud Vertex AI, Anthropic); müşterilerimize ait ticari sırları veya kaynak kodlarını kamuya açık modelleri eğitmek amacıyla (training data) KESİNLİKLE KULLANMAZ.</li>
            <li><strong>3. Taraf Altyapı Sorumsuzluğu:</strong> Küresel bulut veya AI sağlayıcılarının geçici servis kesintilerinden veya üçüncü taraf politika değişikliklerinden doğabilecek dolaylı iş kayıplarından şirketimiz sorumlu değildir.</li>
          </ul>
        </>
      ),
      germanContent: (
        <>
          <p>
            Star Web Flow setzt auf erstklassige, zertifizierte Cloud- und KI-Infrastrukturen:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li><strong>Serverstandort (Deutschland / EU):</strong> Unsere Web- und Datenbankinfrastruktur wird auf ISO-27001-zertifizierten Rechenzentren in Frankfurt am Main, Deutschland betrieben (Vercel, AWS, Cloudflare).</li>
            <li><strong>KI-Datenschutz:</strong> Eingesetzte KI-Schnittstellen (OpenAI, Google Gemini) verarbeiten Daten ausschließlich situativ über sichere Enterprise-APIs; Kundendaten werden NIEMALS für öffentliches Modell-Training verwendet.</li>
            <li><strong>Infrastruktur-Ausschluss:</strong> Für externe Ausfälle von Cloud- oder Schnittstellenbetreibern übernimmt Star Web Flow keine Haftung für Folgeschäden.</li>
          </ul>
        </>
      ),
      englishContent: (
        <>
          <p>
            Star Web Flow utilizes certified global cloud and enterprise AI infrastructures:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li><strong>Hosting Location (Germany / EU):</strong> Primary web clusters and databases are hosted in ISO 27001 certified data centers in Frankfurt am Main, Germany (Vercel, AWS, Cloudflare).</li>
            <li><strong>Enterprise AI Governance:</strong> AI integrations (OpenAI, Google Gemini) operate under strict enterprise API terms; client data is STRICTLY NEVER utilized to train public foundation models.</li>
            <li><strong>Third-Party Outage Disclaimer:</strong> Star Web Flow accepts no liability for indirect business disruptions caused by external upstream service interruptions.</li>
          </ul>
        </>
      )
    },
    {
      id: 'retention-periods',
      title: '6. Saklama Süreleri ve Ticari Arşivleme (§ 147 AO, § 257 HGB)',
      germanTitle: '6. Speicherdauer & Gesetzliche Aufbewahrung (§ 147 AO, § 257 HGB)',
      englishTitle: '6. Data Retention & Statutory Archiving Periods',
      content: (
        <>
          <p>
            Kişisel verileriniz, işleme amacının gerektirdiği süre ve Alman vergi ile ticaret mevzuatının zorunlu kıldığı yasal süreler boyunca saklanır:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li><strong>Faturalar ve Mali Defterler:</strong> 10 yıl (§ 147 Abs. 3 AO).</li>
            <li><strong>Sözleşmeler ve Ticari Yazışmalar:</strong> 6 yıl (§ 257 Abs. 4 HGB).</li>
            <li><strong>Web Güvenlik Logları:</strong> Siber saldırı tespiti ve savunması amacıyla azami 14-90 gün süreyle saklanır ve ardından kalıcı olarak silinir.</li>
          </ul>
        </>
      ),
      germanContent: (
        <>
          <p>
            Personenbezogene Daten werden nach Zweckfortfall gelöscht, sofern keine gesetzlichen Aufbewahrungsfristen entgegenstehen:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li><strong>Buchungsbelege und Rechnungen:</strong> 10 Jahre gemäß § 147 Abs. 3 AO.</li>
            <li><strong>Handelsbriefe und Verträge:</strong> 6 Jahre gemäß § 257 Abs. 4 HGB.</li>
            <li><strong>Sicherheits-Logfiles:</strong> Werden zur Gefahrenabwehr maximal 14 bis 90 Tage vorgehalten.</li>
          </ul>
        </>
      ),
      englishContent: (
        <>
          <p>
            Data is erased once the primary purpose expires, unless statutory archiving rules require continued retention:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li><strong>Invoices and Fiscal Records:</strong> 10 years pursuant to § 147(3) German Fiscal Code (AO).</li>
            <li><strong>Commercial Correspondence and Contracts:</strong> 6 years pursuant to § 257(4) German Commercial Code (HGB).</li>
            <li><strong>Security Server Logs:</strong> Maintained for 14–90 days for cybersecurity defenses, then automatically purged.</li>
          </ul>
        </>
      )
    },
    {
      id: 'user-rights',
      title: '7. Veri Sahibinin Hakları ve Denetim Makamı (LfDI Rheinland-Pfalz)',
      germanTitle: '7. Betroffenenrechte & Aufsichtsbehörde (LfDI Rheinland-Pfalz)',
      englishTitle: '7. Data Subject Rights & Supervisory Authority (LfDI RLP)',
      content: (
        <>
          <p>
            DSGVO Madde 15-22 ve KVKK uyarınca sahip olduğunuz yasal haklar:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li><strong>Bilgi Edinme ve Erişim (Art. 15 DSGVO):</strong> Hangi verilerinizin işlendiğini öğrenme.</li>
            <li><strong>Düzeltme (Art. 16 DSGVO):</strong> Hatalı verilerin düzeltilmesini talep etme.</li>
            <li><strong>Silme / Unutulma (Art. 17 DSGVO):</strong> Verilerinizin yasal şartlar dahilinde silinmesini isteme.</li>
            <li><strong>İşlemenin Kısıtlanması ve Taşınabilirlik (Art. 18 & 20 DSGVO):</strong> İşlemenin sınırlandırılması ve verilerin makinece okunabilir formatta teslimi.</li>
            <li><strong>İtiraz Hakkı (Art. 21 DSGVO):</strong> Meşru menfaate dayalı işlemelere itiraz etme.</li>
          </ul>
          <p className="mt-4">
            Talepleriniz için lütfen kimlik teyidiyle birlikte <a href="mailto:privacy@starwebflow.com" className="text-[#4F8EF7] hover:underline">privacy@starwebflow.com</a> adresine başvurunuz.
          </p>
          <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-sm">
            <p className="font-semibold text-slate-900 dark:text-white">Almanya Yetkili Denetim Makamı (Zuständige Aufsichtsbehörde):</p>
            <p>Der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Rheinland-Pfalz (LfDI RLP)</p>
            <p>Hintere Bleiche 34, 55116 Mainz, Deutschland | Web: <a href="https://www.datenschutz.rlp.de" target="_blank" rel="noopener noreferrer" className="text-[#4F8EF7] hover:underline">www.datenschutz.rlp.de</a></p>
          </div>
        </>
      ),
      germanContent: (
        <>
          <p>
            Ihnen stehen nach Art. 15–22 DSGVO umfassende Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch zu.
          </p>
          <p className="mt-4">
            Zur Geltendmachung Ihrer Rechte schreiben Sie bitte an: <a href="mailto:privacy@starwebflow.com" className="text-[#4F8EF7] hover:underline">privacy@starwebflow.com</a>.
          </p>
          <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-sm">
            <p className="font-semibold text-slate-900 dark:text-white">Zuständige Aufsichtsbehörde:</p>
            <p>Der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Rheinland-Pfalz (LfDI RLP)</p>
            <p>Hintere Bleiche 34, 55116 Mainz, Deutschland | Internet: <a href="https://www.datenschutz.rlp.de" target="_blank" rel="noopener noreferrer" className="text-[#4F8EF7] hover:underline">www.datenschutz.rlp.de</a></p>
          </div>
        </>
      ),
      englishContent: (
        <>
          <p>
            Pursuant to Articles 15–22 of the GDPR, you have the right to access, rectify, erase, restrict processing, transfer data, and object to processing.
          </p>
          <p className="mt-4">
            To submit a verified data subject request, please email: <a href="mailto:privacy@starwebflow.com" className="text-[#4F8EF7] hover:underline">privacy@starwebflow.com</a>.
          </p>
          <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-sm">
            <p className="font-semibold text-slate-900 dark:text-white">Competent Supervisory Authority:</p>
            <p>Der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Rheinland-Pfalz (LfDI RLP)</p>
            <p>Hintere Bleiche 34, 55116 Mainz, Germany | Web: <a href="https://www.datenschutz.rlp.de" target="_blank" rel="noopener noreferrer" className="text-[#4F8EF7] hover:underline">www.datenschutz.rlp.de</a></p>
          </div>
        </>
      )
    },
    {
      id: 'applicable-law',
      title: '8. Uygulanacak Hukuk ve Yetkili Mahkeme (Gerichtsstand)',
      germanTitle: '8. Anwendbares Recht & Gerichtsstand',
      englishTitle: '8. Applicable Law & Exclusive Venue',
      content: (
        <>
          <p>
            İşbu Gizlilik Politikası ve veri koruma süreçlerine münhasıran <strong>Almanya Federal Cumhuriyeti Hukuku</strong> tatbik edilir.
          </p>
          <p className="mt-2">
            Doğabilecek tüm uyuşmazlıklarda yetkili mahkeme <strong>Almanya / Ludwigshafen am Rhein (veya Speyer) Mahkemeleri</strong>dir.
          </p>
        </>
      ),
      germanContent: (
        <>
          <p>
            Es gilt das Recht der <strong>Bundesrepublik Deutschland</strong>.
          </p>
          <p className="mt-2">
            Ausschließlicher Gerichtsstand für alle Streitigkeiten ist <strong>Ludwigshafen am Rhein (bzw. Speyer), Rheinland-Pfalz, Deutschland</strong>.
          </p>
        </>
      ),
      englishContent: (
        <>
          <p>
            This policy is governed exclusively by the laws of the <strong>Federal Republic of Germany</strong>.
          </p>
          <p className="mt-2">
            The exclusive place of jurisdiction is <strong>Ludwigshafen am Rhein (or Speyer), Rhineland-Palatinate, Germany</strong>.
          </p>
        </>
      )
    }
  ]

  return (
    <LegalPageLayout
      title="Gizlilik Politikası (Datenschutz)"
      germanTitle="Datenschutzerklärung"
      englishTitle="Privacy Policy (GDPR)"
      subtitle="Star Web Flow dijital ekosistemindeki kişisel verilerinizin korunması, DSGVO/TDDDG uyumu ve kurumsal güvence esasları."
      germanSubtitle="Informationen zur Verarbeitung personenbezogener Daten gemäß DSGVO, BDSG und TDDDG durch Star Web Flow."
      englishSubtitle="Legal disclosures regarding personal data handling, GDPR/TDDDG compliance, and liability boundaries for Star Web Flow."
      lastUpdated="18 Ekim 2026"
      germanLastUpdated="18. Oktober 2026"
      englishLastUpdated="October 18, 2026"
      sections={sections}
    />
  )
}
