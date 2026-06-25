'use client'

import React from 'react'
import LegalPageLayout from '@/components/layout/LegalPageLayout'

export default function ImpressumPage() {
  const sections = [
    {
      id: 'imprint-details',
      title: 'Angaben gemäß § 5 DDG (ehemals TMG) / Yasal Künye Bilgileri',
      content: (
        <>
          <p className="font-bold text-white mb-2">Verantwortliche Stelle / Veri Sorumlusu:</p>
          <p className="text-[#94A3B8] leading-relaxed">
            StarWebFlow Dijital Ajans<br />
            Anilinerstr 3<br />
            67105 Schifferstadt, Deutschland
          </p>

          <p className="font-bold text-white mt-6 mb-2">Vertreten durch / Temsil Eden Yetkili:</p>
          <p className="text-[#94A3B8]">
            Sinan Günay (Inhaber / Kurucu)
          </p>

          <p className="font-bold text-white mt-6 mb-2">Kontakt / İletişim Bilgileri:</p>
          <p className="text-[#94A3B8]">
            Telefon: +49 179 492 4556<br />
            E-Mail: info@starwebflow.com<br />
            Web: www.starwebflow.com<br />
            IBAN: DE98545500100194489159
          </p>
        </>
      ),
      germanContent: (
        <>
          <p className="font-bold text-white mb-2">Angaben zur Gesellschaft:</p>
          <p className="text-[#94A3B8] leading-relaxed">
            StarWebFlow Digital Agent<br />
            Anilinerstr 3<br />
            67105 Schifferstadt, Deutschland
          </p>

          <p className="font-bold text-white mt-6 mb-2">Vertreten durch:</p>
          <p className="text-[#94A3B8]">
            Sinan Günay (Inhaber)
          </p>

          <p className="font-bold text-white mt-6 mb-2">Kontakt:</p>
          <p className="text-[#94A3B8]">
            Telefon: +49 179 492 4556<br />
            E-Mail: info@starwebflow.com<br />
            Web: www.starwebflow.com<br />
            IBAN: DE98545500100194489159
          </p>
        </>
      )
    },
    {
      id: 'imprint-registry',
      title: 'Umsatzsteuer / Vergi Bilgileri',
      content: (
        <>
          <p className="font-bold text-white mt-6 mb-2">Steuernummer / Vergi Kimlik Numarası:</p>
          <p className="text-[#94A3B8]">
            Steuernummer / Vergi No: 41 / 056 / 80705
          </p>
        </>
      ),
      germanContent: (
        <>
          <p className="font-bold text-white mt-6 mb-2">Steuernummer:</p>
          <p className="text-[#94A3B8]">
            Steuernummer: 41 / 056 / 80705
          </p>
        </>
      )
    },
    {
      id: 'imprint-responsible',
      title: 'Verantwortlich für den Inhalt / İçerikten Sorumlu Kişi',
      content: (
        <>
          <p>
            Almanya Yayın Sözleşmesi (MStV) § 18 fıkra 2 uyarınca içerikten sorumlu kişi:
          </p>
          <p className="text-[#94A3B8] mt-2">
            Sinan Günay<br />
            StarWebFlow Dijital Ajans<br />
            Anilinerstr 3, 67105 Schifferstadt
          </p>
        </>
      ),
      germanContent: (
        <>
          <p>
            Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:
          </p>
          <p className="text-[#94A3B8] mt-2">
            Sinan Günay<br />
            StarWebFlow Digital Agent<br />
            Anilinerstr 3, 67105 Schifferstadt
          </p>
        </>
      )
    },
    {
      id: 'imprint-dispute',
      title: 'Streitschlichtung / Uyuşmazlıkların Çözümü',
      content: (
        <>
          <p>
            Avrupa Komisyonu, çevrimiçi uyuşmazlık çözümü (OS) için bir platform sağlamaktadır. Platforma şu bağlantıdan ulaşabilirsiniz: <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-[#4F8EF7] hover:underline">https://ec.europa.eu/consumers/odr/</a>.
          </p>
          <p className="mt-4">
            Bir tüketici hakem heyeti nezdinde uyuşmazlık çözüm prosedürlerine katılma yükümlülüğümüz veya taahhüdümüz bulunmamaktadır.
          </p>
        </>
      ),
      germanContent: (
        <>
          <p>
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-[#4F8EF7] hover:underline">https://ec.europa.eu/consumers/odr/</a>.
          </p>
          <p className="mt-4">
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </>
      )
    },
    {
      id: 'imprint-disclaimer',
      title: 'Haftungsausschluss (Disclaimer) / Sorumluluk Reddi',
      content: (
        <>
          <p className="font-bold text-white mb-2">Haftung für Inhalte / İçerik Sorumluluğu:</p>
          <p className="text-[#94A3B8] mb-4">
            Web sitemizdeki içerikler büyük bir özenle hazırlanmıştır. Ancak, içeriklerin doğruluğu, eksiksizliği ve güncelliği konusunda hiçbir garanti veremeyiz. Genel yasalara göre kendi içeriklerimizden sorumluyuz, ancak iletilen veya kaydedilen üçüncü taraf bilgilerini izlemek veya yasadışı bir faaliyete işaret eden koşulları araştırmakla yükümlü değiliz.
          </p>
          <p className="font-bold text-white mb-2">Haftung für Links / Bağlantı Sorumluluğu:</p>
          <p className="text-[#94A3B8] mb-4">
            Teklifimiz, içeriği üzerinde hiçbir etkimiz olmayan üçüncü taraf harici web sitelerine bağlantılar (linkler) içerebilir. Bu nedenle, bu yabancı içerikler için herhangi bir sorumluluk kabul edemeyiz. Bağlantı verilen sayfaların içeriğinden her zaman sayfanın ilgili sağlayıcısı veya operatörü sorumludur.
          </p>
          <p className="font-bold text-white mb-2">Urheberrecht / Telif Hakkı:</p>
          <p className="text-[#94A3B8]">
            Bu web sitesinde tarafımızca oluşturulan içerik ve eserler (yazılım, tasarım, metin) telif hakkı yasalarına tabidir. İlgili yazarın veya telif hakkı sahibinin yazılı izni olmadan çoğaltılamaz, düzenlenemez, dağıtılamaz veya herhangi bir şekilde kullanılamaz.
          </p>
        </>
      ),
      germanContent: (
        <>
          <p className="font-bold text-white mb-2">Haftung für Inhalte:</p>
          <p className="text-[#94A3B8] mb-4">
            Als Diensteanbieter sind wir gemäß § 7 Abs.1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
          </p>
          <p className="font-bold text-white mb-2">Haftung für Links:</p>
          <p className="text-[#94A3B8] mb-4">
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
          </p>
          <p className="font-bold text-white mb-2">Urheberrecht:</p>
          <p className="text-[#94A3B8]">
            Die durch die Seitenbetreiber erstellten Inhalte und Werke (Software, Design, Text) auf diesen Seiten unterliegen dem Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
          </p>
        </>
      )
    }
  ]

  return (
    <LegalPageLayout
      title="Impressum / Künye"
      subtitle="Gesetzliche Angaben gemäß § 5 DDG für den Betrieb der StarWebFlow Onlinepräsenz."
      lastUpdated="21 Haziran 2026"
      sections={sections}
    />
  )
}
