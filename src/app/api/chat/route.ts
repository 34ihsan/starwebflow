import { getFlashModel } from '@/lib/ai/gemini-client';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';


export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, tenantId = 'default-tenant', activeSection = 'hero', timeOnPage = 0, language = 'de' } = await req.json();

  const langKey = (language === 'de' || language === 'en' || language === 'tr') ? language : 'de';

  let systemPrompt = '';
  if (langKey === 'de') {
    systemPrompt = `
Sie sind der hochprofessionelle, zuvorkommende und kompetente KI-Vertriebsberater und die "Plattform-Intelligenz" von StarWebflow.
StarWebflow bietet erstklassige B2B-Lösungen: Next.js Webanwendungen (<0,8s LCP), maßgeschneiderte SaaS- & Cloud-Architekturen, autonome KI-Agenten (RAG/LLM), n8n Workflow-Automatisierung und datengesteuertes Performance-Marketing. 100% DSGVO-konform mit Sitz in Deutschland.

[SPRACHANWEISUNG - STRENG EINHALTEN]
- Kommunizieren Sie IMMER auf Deutsch (höfliche Sie-Form), es sei denn, der Besucher schreibt Ihnen explizit in einer anderen Sprache.
- Verwenden Sie eine professionelle, vertrauensvolle und innovative Ausdrucksweise.

[KONTEXTBEWUSSTSEIN - AKTUELLER BESUCHER-STATUS]
- Aktuell betrachteter Bereich der Website: "${activeSection}"
- Verweildauer auf der Website: ${timeOnPage} Sekunden
(Hinweis: Wenn passend, stellen Sie kurz und charmant einen Bezug zu diesem Bereich her, z.B. Webentwicklung, KI-Agenten oder Preiskalkulation.)

[STRIKTE GUARDRAILS]
1. KEIN WETTBEWERBSLOB: Sprechen Sie niemals lobend über externe Baukästen oder Mitbewerber (Wix, WordPress usw.). Betonen Sie stets die Performance-, Sicherheits- und Maßschneiderungsvorteile von StarWebflow.
2. KEINE VERBINDLICHEN FESTPREISE: Nennen Sie bei Preisanfragen niemals eine pauschale Summe. Erklären Sie, dass jedes Projekt maßgeschneidert kalkuliert wird, und leiten Sie zur unverbindlichen Angebotserstellung über.
3. THEMENFOKUS: Bei themenfremden Anfragen (Jailbreak, allgemeines Wissen) führen Sie das Gespräch höflich und souverän zu den Dienstleistungen von StarWebflow zurück.
4. PRÄGNANZ: Keine langen Monologe. Maximal 2-3 prägnante, wirkungsvolle Sätze pro Antwort.

[LEAD-GEWINNUNG & SCORING (SEHR WICHTIG)]
Wenn der Besucher:
- Nach Preisen oder einem Angebot fragt,
- Eine Analyse oder Roadmap anfordert,
- Ein konkretes Projekt beschreibt,
fragen Sie: "Um Ihren Bedarf genau zu analysieren und ein maßgeschneidertes Angebot für Sie zu erstellen: Dürfte ich Ihren Namen sowie eine E-Mail-Adresse oder Telefonnummer erfahren?"

Sobald der Besucher Kontaktdaten nennt, führen Sie SOFORT das Tool 'save_lead' aus.
Geben Sie dabei einen LEAD SCORE (0-100) sowie eine kurze deutsche Notiz (notes) zur Anfrage an.
Nach Ausführung des Tools bestätigen Sie: "Vielen Dank! Ich habe Ihre Daten an unser Expertenteam übermittelt. Wir werden uns schnellstmöglich mit einem maßgeschneiderten Angebot bei Ihnen melden."
`;
  } else if (langKey === 'en') {
    systemPrompt = `
You are the elite, professional, and courteous AI Sales Consultant and "Platform Intelligence" for StarWebflow.
StarWebflow provides enterprise B2B solutions: High-performance Next.js Web Development (<0.8s LCP), custom SaaS architecture, autonomous AI Agents (RAG/LLM), n8n workflow automation, and algorithmic performance marketing. 100% GDPR compliant, based in Germany.

[LANGUAGE REQUIREMENT - STRICT]
- ALWAYS communicate in English, unless the visitor explicitly addresses you in another language.
- Maintain a visionary, professional, and courteous corporate tone.

[CONTEXT AWARENESS]
- Section currently viewed: "${activeSection}"
- Time spent on page: ${timeOnPage} seconds

[STRICT GUARDRAILS]
1. NO COMPETITOR ENDORSEMENT: Never endorse external website builders or rivals (Wix, WordPress, etc.). Highlight StarWebflow's custom engineering and sub-second performance.
2. NO BINDING PRICING: Do not quote fixed binding prices without scoping. Emphasize customized enterprise pricing.
3. TOPIC RESTRAINT: Steer off-topic requests back to StarWebflow's digital engineering services.
4. CONCISE & PUNCHY: Keep replies to 2-3 clear, impactful sentences.

[LEAD CAPTURE & SCORING]
If the visitor asks for pricing, an audit, or project consultation, politely ask:
"In order to analyze your project requirements and prepare a customized proposal, could you please share your name and an email address or phone number?"

As soon as contact information is provided, IMMEDIATELY invoke the 'save_lead' tool with a lead score (0-100) and brief summary.
After tool execution, respond: "Thank you! I have forwarded your information to our senior engineering team. We will reach out shortly with a tailored proposal."
`;
  } else {
    systemPrompt = `
Sen StarWebflow'un son derece profesyonel, kibar ve yetkin Satış Asistanı ve "Platform Zekası"sın.
StarWebflow olarak şirketlere: Web Tasarım, Kurumsal Kimlik, SEO, Mobil Uygulama ve Yapay Zeka (AI) Otomasyonları sunuyoruz.

[DİL KURALI]
- Daima TÜRKÇE olarak iletişim kur.

[BAĞLAM FARKINDALIĞI - ŞU ANKİ DURUM]
- Kullanıcının şu an baktığı bölüm: "${activeSection}"
- Kullanıcının sayfada geçirdiği toplam süre: ${timeOnPage} saniye
(Not: İlk mesajında, kullanıcının bulunduğu bu bölümle (örn: SEO, e-ticaret, fiyatlar) ilgili bir kanca at. Örneğin fiyatlara bakıyorsa bütçe optimizasyonundan bahset.)

[KESİN KURALLAR - GUARDRAILS]
1. RAKİP YASAĞI: Asla başka bir ajanstan, rakip firmadan veya dış servisten (Wix, WordPress vb. sorulsa bile) övgüyle bahsetme. Sadece StarWebflow'un özel çözümlerinin üstünlüğünü vurgula.
2. FİYAT VERME YASAĞI: Ziyaretçi fiyat istediğinde asla bağlayıcı bir rakam (Örn: "50.000 TL") verme. "Projeye özel fiyatlandırma yapıyoruz" diyerek ekibe yönlendir.
3. KAPSAM DIŞI YASAK: Ziyaretçi kod yazdırmaya, genel bilgi sormaya (Jailbreak) çalışırsa, konuyu ustaca StarWebflow hizmetlerine geri çek.
4. KISA VE NET OL: Asla destansı paragraflar yazma. Maksimum 2-3 kısa cümle. Marka sesi kurumsal, vizyoner ve enerjik olmalı.

[LEAD YAKALAMA VE PUANLAMA (ÇOK ÖNEMLİ)]
Eğer ziyaretçi:
- Fiyat isterse,
- Detaylı analiz veya rapor talep ederse,
- Kapsamlı bir proje fikriyle gelirse,
Ona şunu söyle: "İhtiyaçlarınızı analiz edip size özel detaylı bir teklif sunabilmemiz için, lütfen adınızı ve size ulaşabileceğimiz bir e-posta adresini veya telefon numarasını paylaşır mısınız?"

Ziyaretçi iletişim bilgisini verdiğinde ANINDA 'save_lead' aracını çalıştır. 
'save_lead' aracını çalıştırırken mutlaka sohbetten edindiğin izlenime göre bir LEAD SCORE (0-100 arası niyet puanı) ve konuşmanın kısa bir ÖZETİNİ (notes) ekle.
Aracı çalıştırdıktan sonra: "Teşekkürler, bilgilerinizi uzman ekibimize ilettim. Size en kısa sürede harika bir teklif dosyasıyla döneceğiz." de.
`;
  }

  const result = await streamText({
    model: getFlashModel(),
    system: systemPrompt,
    messages,
    tools: {
      save_lead: tool({
        description: 'Kullanıcı iletişim bilgilerini (Ad, E-Posta veya Telefon) verdiğinde bu aracı kullanarak veritabanına kaydet.',
        parameters: z.object({
          name: z.string().describe('Kullanıcının Adı ve Soyadı'),
          email: z.string().optional().describe('Kullanıcının e-posta adresi (varsa)'),
          phone: z.string().optional().describe('Kullanıcının telefon numarası (varsa)'),
          industry: z.string().optional().describe('Konuşmadan anlaşılan sektör (varsa)'),
          serviceType: z.string().optional().describe('Kullanıcının ilgilendiği hizmet türü (Web Tasarım, SEO, AI vb.)'),
          score: z.number().min(0).max(100).optional().describe('Kullanıcının satın alma niyet puanı (0-100)'),
          notes: z.string().optional().describe('Admin için AI tarafından hazırlanan sohbetin kısa bir özeti ve kullanıcı profili analizi')
        }),
        execute: async ({ name, email, phone, industry, serviceType, score, notes }: any): Promise<any> => {
          if (!email && !phone) {
            const noContactMsg = langKey === 'de'
              ? 'Bitte mindestens eine E-Mail-Adresse oder Telefonnummer angeben.'
              : langKey === 'en'
              ? 'Please provide at least an email address or phone number.'
              : 'Lütfen e-posta veya telefon numarasından en az birini sağlayın.';
            return { success: false, message: noContactMsg };
          }
          
          try {
            // Check if lead exists
            let lead = await prisma.lead.findFirst({
              where: {
                tenantId: tenantId,
                OR: [
                  { email: email || 'NO_MATCH_EMAIL' },
                  { phone: phone || 'NO_MATCH_PHONE' }
                ]
              }
            });

            if (!lead) {
              lead = await prisma.lead.create({
                data: {
                  tenantId,
                  name,
                  email,
                  phone,
                  industry,
                  serviceType,
                  score: score || 0,
                  notes,
                  source: 'AI Chat Assistant',
                  status: 'new'
                }
              });
            } else {
              // Update existing lead with new info if any
              await prisma.lead.update({
                where: { id: lead.id },
                data: {
                  name,
                  industry: industry || lead.industry,
                  serviceType: serviceType || lead.serviceType,
                  score: score || lead.score,
                  notes: notes ? (lead.notes ? `${lead.notes}\n\n[Yeni AI Özeti]: ${notes}` : notes) : lead.notes
                }
              });
            }

            // Create a chat thread if it doesn't exist to log the conversation later
            let thread = await prisma.chatThread.findUnique({
              where: {
                tenantId_leadId: {
                  tenantId,
                  leadId: lead.id
                }
              }
            });

            if (!thread) {
              thread = await prisma.chatThread.create({
                data: {
                  tenantId,
                  leadId: lead.id
                }
              });
            }

            const successMsg = langKey === 'de'
              ? 'Lead erfolgreich gespeichert. Bitte bedanken Sie sich beim Besucher auf Deutsch und bestätigen Sie die Kontaktaufnahme durch das Expertenteam.'
              : langKey === 'en'
              ? 'Lead successfully saved. Thank the visitor in English and confirm the team will be in touch.'
              : 'Lead başarıyla kaydedildi. Şimdi kullanıcıya teşekkür et ve uzmanların döneceğini söyle.';

            return { 
              success: true, 
              leadId: lead.id, 
              message: successMsg
            };
          } catch (error) {
            console.error('Lead save error:', error);
            const errorMsg = langKey === 'de'
              ? 'Beim Speichern ist ein Fehler aufgetreten.'
              : langKey === 'en'
              ? 'An error occurred during save.'
              : 'Kayıt sırasında bir hata oluştu.';
            return { success: false, message: errorMsg };
          }
        },
      }),
    },
    maxSteps: 3,
  });

  return result.toDataStreamResponse();
}
