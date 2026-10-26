import { NextResponse } from 'next/server';
import { getSession } from '@/modules/auth/auth.helpers';
import { prisma } from '@/lib/prisma';
import { getAgentModel } from '@/lib/ai/gemini-client';
import { generateText } from 'ai';

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session || !['CLIENT_OWNER', 'CLIENT_MEMBER', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await req.json();
    const { messages, language = 'de' } = body;
    const lastUserMessage = messages[messages.length - 1].content;
    const langKey = (language === 'de' || language === 'en' || language === 'tr') ? language : 'de';

    // RAG: Müşterinin projelerini, görevlerini ve biletlerini getir
    const projects = await prisma.project.findMany({
      where: { 
        clientId: session.userId,
        tenantId: session.tenantId,
      },
      include: {
        tasks: {
          select: { title: true, status: true, priority: true }
        },
        invoices: {
          select: { grossAmount: true, status: true, dueDate: true }
        }
      }
    });

    // Projelerin özetini çıkart
    let projectsContext = '';
    let systemPrompt = '';

    if (langKey === 'de') {
      projectsContext = projects.map(p => {
        const completedTasks = p.tasks.filter(t => t.status === 'DONE').length;
        const totalTasks = p.tasks.length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const pendingInvoices = p.invoices.filter(i => i.status !== 'PAID').map(i => `${i.grossAmount} (Fälligkeit: ${i.dueDate?.toLocaleDateString('de-DE')})`).join(', ');

        return `Projekt: ${p.title}
Status: ${p.status}
Fortschritt: ${progress}% (${completedTasks}/${totalTasks} Aufgaben abgeschlossen)
Offene Rechnungen: ${pendingInvoices || 'Keine'}
Nächste Aufgaben: ${p.tasks.filter(t => t.status !== 'DONE').slice(0, 3).map(t => t.title).join(', ') || 'Keine ausstehend'}
`;
      }).join('\n\n');

      systemPrompt = `Sie sind der KI-Support-Assistent einer führenden Digitalagentur auf Basis von StarWebFlow. Name des Kunden: ${session.name}. 
Ihr Ziel ist es, dem Kunden sofortige, höfliche und präzise Informationen über seine Projekte zu geben. Aktuelle Projektdaten:

--- KUNDENDATEN ---
${projectsContext || 'Der Kunde hat derzeit keine aktiven Projekte.'}
-------------------

[SPRACHVORGABE]: Antworten Sie IMMER auf Deutsch (höfliche Sie-Form).
Bitte beantworten Sie die letzte Nachricht des Kunden anhand der obigen Projektdaten. Falls eine Frage nicht anhand der vorliegenden Daten beantwortet werden kann, sagen Sie: "Ihr persönlicher Ansprechpartner wird sich schnellstmöglich bei Ihnen melden."
Nachricht des Kunden: "${lastUserMessage}"
Verwenden Sie einen hochprofessionellen, herzlichen und verbindlichen Ton.`;
    } else if (langKey === 'en') {
      projectsContext = projects.map(p => {
        const completedTasks = p.tasks.filter(t => t.status === 'DONE').length;
        const totalTasks = p.tasks.length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const pendingInvoices = p.invoices.filter(i => i.status !== 'PAID').map(i => `${i.grossAmount} (Due: ${i.dueDate?.toLocaleDateString('en-US')})`).join(', ');

        return `Project: ${p.title}
Status: ${p.status}
Progress: ${progress}% (${completedTasks}/${totalTasks} tasks completed)
Pending Invoices: ${pendingInvoices || 'None'}
Upcoming Tasks: ${p.tasks.filter(t => t.status !== 'DONE').slice(0, 3).map(t => t.title).join(', ') || 'None scheduled'}
`;
      }).join('\n\n');

      systemPrompt = `You are the AI Support Assistant for an elite digital engineering agency powered by StarWebFlow. Client name: ${session.name}. 
Your goal is to provide immediate, polite, and accurate project updates. Current project data:

--- CLIENT DATA ---
${projectsContext || 'The client currently has no active projects in the system.'}
-------------------

[LANGUAGE REQUIREMENT]: ALWAYS reply in English.
Please answer the client's last message using the project data above. If a question cannot be answered from the project details, state: "Your dedicated account manager will follow up with you shortly."
Client message: "${lastUserMessage}"
Maintain a professional, helpful, and courteous tone.`;
    } else {
      projectsContext = projects.map(p => {
        const completedTasks = p.tasks.filter(t => t.status === 'DONE').length;
        const totalTasks = p.tasks.length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const pendingInvoices = p.invoices.filter(i => i.status !== 'PAID').map(i => `${i.grossAmount} (Son Ödeme: ${i.dueDate?.toLocaleDateString('tr-TR')})`).join(', ');

        return `Proje: ${p.title}
Durum: ${p.status}
İlerleme: %${progress} (${completedTasks}/${totalTasks} Görev Tamamlandı)
Bekleyen Faturalar: ${pendingInvoices || 'Yok'}
Sonraki Görevler: ${p.tasks.filter(t => t.status !== 'DONE').slice(0, 3).map(t => t.title).join(', ') || 'Belirlenmedi'}
`;
      }).join('\n\n');

      systemPrompt = `Sen StarWebFlow kullanan elit bir dijital ajansın AI Destek Asistanısın. Müşterinin adı: ${session.name}. 
Amacın müşteriye projeleri hakkında anında, kibar ve profesyonel bilgiler vermek. Müşterinin sistemdeki güncel verileri aşağıdadır:

--- MÜŞTERİ VERİSİ ---
${projectsContext || 'Müşterinin henüz aktif projesi bulunmuyor.'}
----------------------

[DİL KURALI]: Daima TÜRKÇE yanıt ver.
Lütfen yukarıdaki verilere dayanarak müşterinin son mesajına cevap ver. Eğer sorduğu soru projelerde yoksa "Müşteri temsilciniz en kısa sürede size dönecektir" de.
Müşterinin mesajı: "${lastUserMessage}"
Cevabını oluştururken markanın prestijine yakışır, samimi ama kurumsal bir ton kullan.`;
    }

    const model = getAgentModel();
    const result = await generateText({
      model,
      system: systemPrompt,
      prompt: lastUserMessage,
    });

    return NextResponse.json({ reply: result.text });
  } catch (error: any) {
    console.error('AI Support Error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu.' }, { status: 500 });
  }
}
