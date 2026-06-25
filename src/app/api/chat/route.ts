import { getFlashModel } from '@/lib/ai/gemini-client';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';


export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, tenantId = 'default-tenant', activeSection = 'hero', timeOnPage = 0 } = await req.json();

  const systemPrompt = `
Sen StarWebflow'un son derece profesyonel, kibar ve yetkin Satış Asistanı ve "Platform Zekası"sın.
StarWebflow olarak şirketlere: Web Tasarım, Kurumsal Kimlik, SEO, Mobil Uygulama ve Yapay Zeka (AI) Otomasyonları sunuyoruz.

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
            return { success: false, message: 'Lütfen e-posta veya telefon numarasından en az birini sağlayın.' };
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

            return { 
              success: true, 
              leadId: lead.id, 
              message: 'Lead başarıyla kaydedildi. Şimdi kullanıcıya teşekkür et ve uzmanların döneceğini söyle.' 
            };
          } catch (error) {
            console.error('Lead save error:', error);
            return { success: false, message: 'Kayıt sırasında bir hata oluştu.' };
          }
        },
      }),
    },
    maxSteps: 3,
  });

  return result.toDataStreamResponse();
}
