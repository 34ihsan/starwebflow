import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  // CRON endpoint authentication
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Tüm aktif Lead'leri çek
    const leads = await prisma.lead.findMany({
      where: {
        status: {
          notIn: ['won', 'lost']
        }
      }
    });

    const now = new Date();
    let updatedCount = 0;
    let ghostingCount = 0;

    for (const lead of leads) {
      let winProbability = 20; // Taban ihtimal
      let isGhosting = false;

      // Kapanma ihtimali (Predictive Scoring) Kriterleri
      if (lead.hasWebsite) winProbability += 10;
      if (lead.linkedinUrl) winProbability += 15;
      if (lead.decisionMakerName) winProbability += 20;
      if (lead.score > 50) winProbability += 15;
      if (lead.status === 'proposal') winProbability += 20;

      // Maksimum %99 olsun
      if (winProbability > 99) winProbability = 99;

      // Ghosting Alerts (Hayalet Uyarıları) Kriterleri
      // Eğer statü 'contacted' veya 'proposal' ise ve son iletişim üzerinden 3 gün geçmişse
      if ((lead.status === 'contacted' || lead.status === 'proposal') && lead.lastContactedAt) {
        const diffTime = Math.abs(now.getTime() - lead.lastContactedAt.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        if (diffDays >= 3) {
          isGhosting = true;
          ghostingCount++;
        }
      }

      // Güncelle
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          winProbability,
          ghostingAlert: isGhosting
        }
      });

      updatedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `${updatedCount} adet Lead skorlandı. ${ghostingCount} adet Ghosting uyarısı oluşturuldu.`
    });

  } catch (error: any) {
    console.error('CRM Scoring Error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu.' }, { status: 500 });
  }
}
