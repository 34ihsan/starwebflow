import { NextResponse } from 'next/server';
import { getSession } from '@/modules/auth/auth.helpers';
import { prisma } from '@/lib/prisma';
import { getFlashModel } from '@/lib/ai/gemini-client';
import { generateText } from 'ai';

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session || !['CLIENT_OWNER', 'CLIENT_MEMBER', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await req.json();
    const { messages } = body;
    const lastUserMessage = messages[messages.length - 1].content;

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
    const projectsContext = projects.map(p => {
      const completedTasks = p.tasks.filter(t => t.status === 'DONE').length;
      const totalTasks = p.tasks.length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      const pendingInvoices = p.invoices.filter(i => i.status !== 'PAID').map(i => `${i.grossAmount} (Son Ödeme: ${i.dueDate?.toLocaleDateString()})`).join(', ');

      return `Proje: ${p.title}
Durum: ${p.status}
İlerleme: %${progress} (${completedTasks}/${totalTasks} Görev Tamamlandı)
Bekleyen Faturalar: ${pendingInvoices || 'Yok'}
Sonraki Görevler: ${p.tasks.filter(t => t.status !== 'DONE').slice(0, 3).map(t => t.title).join(', ') || 'Belirlenmedi'}
`;
    }).join('\n\n');

    const systemPrompt = `Sen StarWebFlow kullanan elit bir dijital ajansın AI Destek Asistanısın. Müşterinin adı: ${session.name}. 
Amacın müşteriye projeleri hakkında anında, kibar ve profesyonel bilgiler vermek. Müşterinin sistemdeki güncel verileri aşağıdadır:

--- MÜŞTERİ VERİSİ ---
${projectsContext || 'Müşterinin henüz aktif projesi bulunmuyor.'}
----------------------

Lütfen yukarıdaki verilere dayanarak müşterinin son mesajına cevap ver. Eğer sorduğu soru projelerde yoksa "Müşteri temsilciniz en kısa sürede size dönecektir" de.
Müşterinin mesajı: "${lastUserMessage}"
Cevabını oluştururken markanın prestijine yakışır, samimi ama kurumsal bir ton kullan.`;

    const model = getFlashModel();
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
