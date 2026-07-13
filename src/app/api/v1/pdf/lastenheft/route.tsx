export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server'
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'
import React from 'react'
import { z } from 'zod'
import { generateObject } from 'ai'
import { getFlashModel } from '@/lib/ai/gemini-client'

export const maxDuration = 60

// Turkish character cleaning helper to allow safe rendering in standard Helvetica
function cleanTurkishChars(text: string): string {
  const map: { [key: string]: string } = {
    'ş': 's', 'Ş': 'S',
    'ğ': 'g', 'Ğ': 'G',
    'ı': 'i', 'İ': 'I',
    'ç': 'c', 'Ç': 'C',
    'ö': 'o', 'Ö': 'O',
    'ü': 'u', 'Ü': 'U'
  }
  return text.replace(/[şŞğĞıİçÇöÖüÜ]/g, match => map[match] || match)
}

// Recursively clean all string values in an object or array
function cleanObjectStrings<T>(obj: T): T {
  if (typeof obj === 'string') {
    return cleanTurkishChars(obj) as unknown as T
  }
  if (Array.isArray(obj)) {
    return obj.map(item => cleanObjectStrings(item)) as unknown as T
  }
  if (typeof obj === 'object' && obj !== null) {
    const cleaned: any = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cleaned[key] = cleanObjectStrings((obj as any)[key])
      }
    }
    return cleaned as T
  }
  return obj
}

// Stylesheet definition for the PDF document using built-in Helvetica
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FAF9F6', // premium cream-white
    fontFamily: 'Helvetica',
    position: 'relative',
  },
  header: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#8B5CF6', // StarWebFlow Purple accent
    paddingBottom: 6,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0A0A0F',
    letterSpacing: 0.5,
  },
  docType: {
    fontSize: 8,
    color: '#8B5CF6',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  titleSection: {
    marginVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A0A0F',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 10,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 8,
  },
  metaItem: {
    width: '50%',
    padding: 3,
  },
  metaLabel: {
    fontSize: 7,
    color: '#64748B',
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: 9,
    color: '#0F172A',
    fontWeight: 'bold',
    marginTop: 1,
  },
  section: {
    marginVertical: 6,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4F8EF7', // StarWebFlow Blue accent
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bodyText: {
    fontSize: 8.5,
    color: '#334155',
    lineHeight: 1.5,
  },
  bulletList: {
    marginTop: 4,
    paddingLeft: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bulletPoint: {
    width: 8,
    fontSize: 8.5,
    color: '#8B5CF6',
  },
  bulletText: {
    flex: 1,
    fontSize: 8.5,
    color: '#334155',
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 7,
    color: '#94A3B8',
  }
})

// Schema for structured AI response
const LastenheftDataSchema = z.object({
  clientAnalysis: z.string().describe("Müşterinin iş vizyonunu, bu projenin amacını ve StarWebFlow'un analitik yaklaşımını anlatan, son derece ikna edici, profesyonel ve değer odaklı 2 cümlelik Türkçe paragraf."),
  painPoints: z.array(z.object({
    problem: z.string().describe("Sektöre veya bu projeye özel, müşterinin yaşayabileceği veya yaşadığı operasyonel sorun/darboğaz. Maksimum 1 cümle."),
    solution: z.string().describe("Yapay zekanın ve modern web teknolojilerinin bu problemi nasıl ortadan kaldıracağını ve kazandıracağı değeri açıklayan maksimum 1-2 cümle.")
  })).describe("Müşterinin sektörüne özel 3 adet problem-çözüm çifti."),
  functionalModules: z.array(z.object({
    name: z.string().describe("Modülün adı (örn: AI SmartMatch Ajanı vb.)."),
    description: z.string().describe("Modülün detayları ve müşterinin işini nasıl kolaylaştıracağı. Maksimum 1-2 cümle.")
  })).describe("Müşterinin talebine göre özelleştirilmiş 4 adet fonksiyonel modül."),
  techStack: z.array(z.object({
    component: z.string().describe("Bileşen adı (örn: Frontend Framework, Stil ve Tasarım, Veri Tabanı & ORM, Sunucu & Dağıtım)."),
    techName: z.string().describe("Seçilen teknoloji (örn: Next.js 14, Tailwind CSS, PostgreSQL, Vercel & Docker)."),
    rationale: z.string().describe("Bu projenin performansı, hızı veya güvenliği için bu seçimin neden kritik olduğu (ikna edici gerekçe). Maksimum 1 cümle.")
  })),
  timeline: z.array(z.object({
    sprint: z.string().describe("Sprint adı (örn: Sprint 1 (1. Hafta) - Planlama & Altyapı)."),
    deliverables: z.string().describe("Bu sprint sonunda teslim edilecek somut işler ve kazanımlar. Maksimum 1 cümle.")
  })),
  securityAndSla: z.array(z.string().describe("Güvenlik veya SLA taahhüt maddesi. Maksimum 1 cümle."))
})

type LastenheftData = z.infer<typeof LastenheftDataSchema>;

interface LastenheftProps {
  name: string
  email: string
  idea: string
  aiData: LastenheftData
  dateStr: string
}

// React Document template for Lastenheft PDF using safe Helvetica font
const LastenheftDocument: React.FC<LastenheftProps> = ({ name, email, idea, aiData, dateStr }) => {
  // Safe slices to fit exactly onto 2 pages
  const painPoints = (aiData.painPoints || []).slice(0, 3)
  const functionalModules = (aiData.functionalModules || []).slice(0, 4)
  const techStack = (aiData.techStack || []).slice(0, 4)
  const timeline = (aiData.timeline || []).slice(0, 4)
  const securityAndSla = (aiData.securityAndSla || []).slice(0, 3)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>STARWEBFLOW</Text>
          <Text style={styles.docType}>Teknik Sartname Belgesi (Lastenheft)</Text>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Konsept & Mimari Gereksinimler Raporu</Text>
          <Text style={styles.subtitle}>AI Destekli Otomasyon & Web Ekosistemi Taslagi</Text>
        </View>

        {/* Metadata Details */}
        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Musteri / Kurum</Text>
            <Text style={styles.metaValue}>{name || 'Degerli Ziyaretci'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>E-posta Adresi</Text>
            <Text style={styles.metaValue}>{email || 'iletisim@starwebflow.com'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Duzenlenme Tarihi</Text>
            <Text style={styles.metaValue}>{dateStr}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Hazirlayan Ajans</Text>
            <Text style={styles.metaValue}>StarWebFlow Architecture Studio</Text>
          </View>
        </View>

        {/* Section 1: Project Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Proje Fikri & Analiz Ozeti</Text>
          <Text style={styles.bodyText}>
            Musteri tarafindan iletilen proje vizyonu: "{idea || 'Genel kapsamli modern web platformu ve yapay zeka entegrasyonu.'}"
            {"\n\n"}
            {aiData.clientAnalysis}
          </Text>
        </View>

        {/* Section 2: Pain Points & AI Solutions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Sektorel Problemler & Yapay Zeka Cozumleri</Text>
          <View style={styles.bulletList}>
            {painPoints.map((item, index) => (
              <View style={styles.bulletItem} key={index}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={{ fontWeight: 'bold' }}>{item.problem}: </Text>
                  {item.solution}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footnote on page 1 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>StarWebFlow -- Gelecegin Dijital Ekosistemi -- www.starwebflow.com</Text>
          <Text style={styles.footerText}>Sayfa 1 / 2</Text>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>STARWEBFLOW</Text>
          <Text style={styles.docType}>Teknik Sartname Belgesi (Lastenheft)</Text>
        </View>

        {/* Section 3: Functional Modules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Onerilen Fonksiyonel Moduller</Text>
          <View style={styles.bulletList}>
            {functionalModules.map((item, index) => (
              <View style={styles.bulletItem} key={index}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={{ fontWeight: 'bold' }}>{item.name}: </Text>
                  {item.description}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Section 4: Tech Stack */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Onerilen Teknolojik Altyapi (Tech Stack)</Text>
          <View style={styles.bulletList}>
            {techStack.map((item, index) => (
              <View style={styles.bulletItem} key={index}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={{ fontWeight: 'bold' }}>{item.component} ({item.techName}): </Text>
                  {item.rationale}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Section 5: Timeline & SLA */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Teslimat Takvimi & Guvenlik Taahhutleri</Text>
          <Text style={{ fontSize: 8.5, fontWeight: 'bold', color: '#0F172A', marginBottom: 2 }}>Tahmini Proje Sprintleri:</Text>
          <View style={styles.bulletList}>
            {timeline.map((item, index) => (
              <View style={styles.bulletItem} key={index}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={{ fontWeight: 'bold' }}>{item.sprint}: </Text>
                  {item.deliverables}
                </Text>
              </View>
            ))}
          </View>

          <Text style={{ fontSize: 8.5, fontWeight: 'bold', color: '#0F172A', marginTop: 6, marginBottom: 2 }}>Guvenlik, Gizlilik & SLA:</Text>
          <View style={styles.bulletList}>
            {securityAndSla.map((item, index) => (
              <View style={styles.bulletItem} key={index}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footnote on page 2 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>StarWebFlow -- Gelecegin Dijital Ekosistemi -- www.starwebflow.com</Text>
          <Text style={styles.footerText}>Sayfa 2 / 2</Text>
        </View>
      </Page>
    </Document>
  )
}

// Resilient Fallback Data Generator when AI is unavailable or fails
function getFallbackData(idea: string, name: string): LastenheftData {
  const isStudyAbroad = /egitim|eğitim|yurtdisi|yurtdışı|okul|danismanlik|danışmanlık|student|abroad/i.test(idea);

  if (isStudyAbroad) {
    return {
      clientAnalysis: "Iletilen yurtdisi egitim ve kariyer danismanligi vizyonu, StarWebFlow analitik ekibi tarafindan incelenmis ve operasyonel is yukunu minimize eden, donusum oranlarini artiran otonom yapay zeka entegrasyonlu modern bir portal olarak yapilandirilmistir.",
      painPoints: [
        {
          problem: "Manuel Transkript ve Uygunluk Analizi",
          solution: "AI SmartMatch Engine adayın akademik profili ile 500+ okulun kabul kriterlerini kiyaslar ve en uygun programlari listeler."
        },
        {
          problem: "Eksik veya Hatalı Evrak Surecleri",
          solution: "AI Document Validator yuklenen belgeleri OCR ile aninda okur, eksik veya hatali kisimlari tespit ederek ogrenciye bildirim gonderir."
        },
        {
          problem: "Lead Kacirma Problemi",
          solution: "AI WhatsApp Lead Agent web sitesi ve WhatsApp uzerinden gelen talepleri 7/24 karsilar, on eleme yapip CRM'e kaydeder."
        }
      ],
      functionalModules: [
        {
          name: "Seffaf Ogrenci Portali (Student Hub)",
          description: "Ogrencilerin basvuru, okul kabulu ve vize sureclerini anlik olarak kargo takip seffafliginda izlemesini saglayan modern panel."
        },
        {
          name: "Danisman Yonetim CRM'i (Consultant Workstation)",
          description: "Danismanlarin kendilerine atanan ogrencileri, belgeleri ve sozlesmeleri tek bir ekrandan kolayca yonetmesini saglayan is istasyonu."
        },
        {
          name: "AI SmartMatch & Evrak Dogrulama Katmani",
          description: "Okul eslestirme ve yuklenen evraklarin dogrulugunu yapay zeka ile otomatik denetleyen arka plan servisleri."
        },
        {
          name: "Entegre Sozlesme ve Dijital Imza Modulu",
          description: "Teklif hazirlama, onaylatma ve yasal sozlesmelerin dijital ortamda imzalanmasini saglayan modul."
        }
      ],
      techStack: [
        {
          component: "Frontend Framework",
          techName: "Next.js 14 (App Router)",
          rationale: "React Server Components ile ustun hiz (LCP), SEO dostu statik derleme ve kesintisiz mobil/desktop kullanici deneyimi."
        },
        {
          component: "Stil ve Tasarim",
          techName: "Tailwind CSS + Framer Motion",
          rationale: "Kurumsal kimlige uygun premium Glassmorphism tasarimi ve akici mikro-etkilesimler."
        },
        {
          component: "Veri Tabanı & ORM",
          techName: "PostgreSQL + Prisma ORM",
          rationale: "ACID garantili veri guvenligi, iliskisel veri butunlugu ve SQL enjeksiyonlarina karsi tam koruma."
        },
        {
          component: "Sunucu & Dagitim",
          techName: "Vercel & Docker",
          rationale: "Kuresel edge cache altyapisi sayesinde milisaniyeler duzeyinde erisim hizi ve konteynerize izole dagitim."
        }
      ],
      timeline: [
        {
          sprint: "Sprint 1 (1. Hafta): Planlama & Altyapi",
          deliverables: "Kapsam belirleme, veritabanı semasinin ayaga kaldirilmasi ve UI/UX onaylarinin alinmasi."
        },
        {
          sprint: "Sprint 2 (2-3. Hafta): Core Gelistirme",
          deliverables: "Ogrenci/Danisman portallari, API yollari ve evrak yukleme modullerinin kodlanmasi."
        },
        {
          sprint: "Sprint 3 (4. Hafta): AI & Entegrasyonlar",
          deliverables: "AI SmartMatch, OCR Validator and WhatsApp Lead Agent entegrasyonlarinin tamamlanmasi."
        },
        {
          sprint: "Sprint 4 (5. Hafta): Test & Lansman",
          deliverables: "QA performans testleri, GDPR veri uyumluluk kontrolleri ve canliya cikis."
        }
      ],
      securityAndSla: [
        "Projenin barindirilacagi tum sunucular Frankfurt/Almanya lokasyonlarinda konuslandirilacak olup, AB Veri Koruma Yonergesi (GDPR) kurallarina %100 uyumludur.",
        "Tum veriler SSL/TLS 1.3 ve AES-256 standartlarında sifrelenir.",
        "Canliya gecis sonrasindeki surecte aylik %99.99 Uptime (Calisma) garantisi sunulur. Kritik hatalara mudahale suresi maksimum 4 saattir."
      ]
    }
  }

  // Generic fallback
  return {
    clientAnalysis: `Iletilen "${idea}" proje vizyonu, StarWebFlow analitik ekibi tarafindan incelenmis ve yuksek performans, esneklik ve olceklenebilirlik hedefleri dogrultusunda AI destekli otonom moduller iceren modern bir dijital ekosistem olarak projelendirilmistir.`,
    painPoints: [
      {
        problem: "Operasyonel Is Yukü ve Manuel Surecler",
        solution: "AI Otomasyon Motoru rutin isleri, e-posta gonderimlerini ve veri guncellemelerini otonom olarak gerceklestirerek operasyonel is yukunu %50 azaltir."
      },
      {
        problem: "Musteri Taleplerinin Gec Yanitlanmasi",
        solution: "7/24 AI Chat Asistani dogal dil isleme yetenegiyle kullanici sorularini aninda cevaplayarak destek ekibinin yukunu hafifletir."
      },
      {
        problem: "Veri Dagınıklıgı ve Karar Alma Zorlugu",
        solution: "Merkezi Yonetim Dashboard'u gercek zamanli grafikler, analizler ve loglama modulleri sayesinde tum operasyonu tek ekrandan yonetme kolayligi sunar."
      }
    ],
    functionalModules: [
      {
        name: "Gelismis Kullanici ve Rol Yonetimi",
        description: "Guvenli JWT / OAuth 2.0 tabanli kimlik dogrulama ile farkli kullanici rollerine (Admin, Personel, Musteri) ozel panel yetkilendirmeleri."
      },
      {
        name: "AI Destekli Otonom Asistan Modulu",
        description: "Kullanici taleplerini aninda cozumleyen ve en gelismis LLM API modelleri uzerinden beslenen akilli sohbet ve otomasyon motoru."
      },
      {
        name: "Interaktif Kontrol Paneli (Admin Dashboard)",
        description: "Verilerin, grafiklerin ve analizlerin gercek zamanli izlenebilecegi, modern ve duyarli (responsive) yonetim paneli."
      },
      {
        name: "KVKK & GDPR Uyumlu Veri Kayit ve Loglama",
        description: "Sistem hareketlerinin, veri girislerinin ve loglarinin KVKK standartlarinda guvenle depolandigi iliskisel veritabanı altyapisi."
      }
    ],
    techStack: [
      {
        component: "Frontend Framework",
        techName: "Next.js 14 (App Router)",
        rationale: "React Server Components ile yuksek SEO gucu, hizli sayfa yuklemeleri (LCP) ve mukemmel kullanici deneyimi."
      },
      {
        component: "Stil ve Tasarim",
        techName: "Tailwind CSS + Framer Motion",
        rationale: "Modern, duyarli ve akici mikro-animasyonlara sahip premium arayuz bilesenleri."
      },
      {
        component: "Veri Tabani & ORM",
        techName: "PostgreSQL + Prisma ORM",
        rationale: "Iliskisel verilerin tutarliligi, hizli sorgular ve Prisma'nin sundugu tip guvenligi (Type Safety)."
      },
      {
        component: "Sunucu & Dagitim",
        techName: "Vercel & Docker",
        rationale: "Kuresel olcekte hizli erisim icin edge caching altyapisi ve konteyner bazli izole dagitim."
      }
    ],
    timeline: [
      {
        sprint: "Sprint 1 (1. Hafta): Planlama & Altyapi",
        deliverables: "Kapsam belirleme, veritabanı semasinin ayaga kaldirilmasi ve UI/UX wireframe tasarimlarinin olusturulmasi."
      },
      {
        sprint: "Sprint 2 (2-3. Hafta): Cekirdek Gelistirme",
        deliverables: "Veritabanı baglantilarinin kurulmasi, API yollarinin ve cekirdek arayuzlerin kodlanmasi."
      },
      {
        sprint: "Sprint 3 (4. Hafta): AI & Servis Entegrasyonlari",
        deliverables: "Yapay Zeka (AI API) entegrasyonu ve ucuncu parti harici servislerin sisteme baglanmasi."
      },
      {
        sprint: "Sprint 4 (5. Hafta): Test & Lansman",
        deliverables: "QA performans testleri, guvenlik denetimleri, GDPR/KVKK veri uyumlulugu kontrolu ve canliya cikis."
      }
    ],
    securityAndSla: [
      "Projenin barindirilacagi tum sunucular Frankfurt/Almanya lokasyonlarinda konuslandirilacak olup, AB Veri Koruma Yonergesi (GDPR) kurallarina %100 uyumludur.",
      "Tum veriler SSL/TLS 1.3 ve AES-256 standartlarında sifrelenir.",
      "Canliya gecis sonrasindeki surecte aylik %99.99 Uptime (Calisma) garantisi sunulur. Kritik hatalara mudahale suresi maksimum 4 saattir."
    ]
  };
}

// Next.js Route Handler for generating and streaming the PDF file
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const nameInput = searchParams.get('name') || 'Degerli Ziyaretci'
    const emailInput = searchParams.get('email') || 'iletisim@starwebflow.com'
    const ideaInput = searchParams.get('idea') || 'Yapay Zeka Destekli Otomasyon & Web Uygulamasi Projesi.'

    // Transliterate Turkish characters for the final PDF presentation
    const name = cleanTurkishChars(nameInput)
    const email = cleanTurkishChars(emailInput)
    const idea = cleanTurkishChars(ideaInput)

    let aiData: LastenheftData;

    try {
      const model = getFlashModel()
      
      const systemPrompt = `
Sen StarWebFlow Architecture Studio'nun baş teknoloji yöneticisi (CTO) ve baş iş analistisin. 
Aşağıdaki bilgilere sahip bir müşteri için profesyonel, zengin ve değer odaklı bir Teknik Şartname Belgesi (Lastenheft) hazırlayacaksın.

Müşteri Adı: ${name}
Müşteri E-Posta Adresi: ${email}
Müşteri Proje Fikri: "${idea}"

Görevin, müşterinin sunduğu bu ham fikir için sektörel acı noktalarını (pain points) belirlemek, bu fikirle ne kazanacağını, neye ulaşacağını ve hangi problemlerine çözüm bulacağını açıklamak ve bunu ikna edici, profesyonel bir dille yapılandırılmış bir JSON formatında sunmaktır.

Lütfen tam olarak şu alanları içeren bir JSON nesnesi oluştur:
1. clientAnalysis: Bu projenin değer önerisini, müşterinin kazanımlarını ve StarWebFlow'un analitik yaklaşımını özetleyen, son derece profesyonel ve ikna edici en fazla 2 cümlelik Türkçe bir paragraf.
2. painPoints: Müşterinin sektörüne veya projesine özel en az 3 adet problem-çözüm çifti. Her çift bir "problem" (sektörel zorluk) ve bu probleme karşılık "solution" (çözüm) içermelidir. Çözüm, yapay zeka otomasyonları ve modern web teknolojilerinin bu problemi nasıl ortadan kaldıracağını açıklamalıdır. Her alan en fazla 1-2 cümle olmalıdır.
3. functionalModules: Müşterinin fikrine uygun olarak özelleştirilmiş 4 adet fonksiyonel modül. Her modül bir "name" (modül adı) ve bir "description" (modülün detaylı açıklaması ve iş değeri, en fazla 1-2 cümle) içermelidir.
4. techStack: Bu proje için en uygun teknoloji kararlarını gerekçeleriyle sunan 4 adet bileşen. Her bileşen "component" (örn: Frontend Framework, Stil ve Tasarım, Veri Tabanı & ORM, Sunucu & Dağıtım), "techName" (seçilen teknoloji adı, örn: Next.js 14, Tailwind CSS, PostgreSQL, Vercel & Docker) ve "rationale" (bu seçimin performans, SEO veya güvenlik açısından ikna edici gerekçesi, en fazla 1 cümle) içermelidir.
5. timeline: Müşterinin fikrinin karmaşıklığına uygun olarak tasarlanmış 4 haftalık/sprintlik bir takvim. Her adım "sprint" (örn: Sprint 1 (1. Hafta) - Planlama & Altyapı) ve "deliverables" (bu sprint sonunda teslim edilecek somut işler ve kazanımlar, en fazla 1 cümle) içermelidir.
6. securityAndSla: En fazla 3 adet güvenlik, gizlilik ve SLA taahhüt maddesi (örn: sunucu lokasyonu, şifreleme standartları, uptime garantisi). Her biri en fazla 1 cümle olmalıdır.

Ton: Son derece profesyonel, güven veren, kurumsal ve ikna edici. Türkçe yaz.
`

      const response = await generateObject({
        model,
        schema: LastenheftDataSchema,
        prompt: systemPrompt,
      })

      // Clean all Turkish characters from the dynamically generated AI object
      aiData = cleanObjectStrings(response.object)
    } catch (aiError) {
      console.error('[Lastenheft AI Gen Error] Falling back to structured templates:', aiError)
      aiData = getFallbackData(ideaInput, nameInput)
    }

    const dateStr = new Date().toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    const dateStrCleaned = cleanTurkishChars(dateStr)

    // Render the React document to a Node stream or buffer
    const docInstance = <LastenheftDocument name={name} email={email} idea={idea} aiData={aiData} dateStr={dateStrCleaned} />
    const pdfBlob = await pdf(docInstance).toBlob()
    const pdfArrayBuffer = await pdfBlob.arrayBuffer()

    return new NextResponse(pdfArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="starwebflow-lastenheft-${Date.now()}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF Generation Route Error:', error)
    return NextResponse.json(
      { success: false, error: 'PDF belgesi olusturulurken bir hata meydana geldi.' },
      { status: 500 }
    )
  }
}
