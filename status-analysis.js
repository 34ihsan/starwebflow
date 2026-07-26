const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("==========================================");
  console.log("       STARWEBFLOW DURUM ANALİZİ          ");
  console.log("==========================================\n");

  const mailboxes = await prisma.emailMailbox.findMany();
  
  if (mailboxes.length === 0) {
    console.log("Sistemde ekli herhangi bir e-posta kutusu bulunamadı.");
    return;
  }

  console.log(`Toplam Bağlı Hesap Sayısı: ${mailboxes.length}`);
  console.log("------------------------------------------");

  for (const box of mailboxes) {
    const createdAt = new Date(box.createdAt);
    const now = new Date();
    const daysActive = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    
    let currentLimit = box.limit || box.maxDailyLimit || 50;
    let phase = "Bilinmiyor";

    // 15 günlük Ramping mantığı
    if (daysActive < 7) {
      phase = "Aşama 1 (Isınma Başlangıcı)";
      currentLimit = Math.min(currentLimit, 8);
    } else if (daysActive < 15) {
      phase = "Aşama 2 (Güven İnşası)";
      currentLimit = Math.min(currentLimit, 20);
    } else {
      phase = "Aşama 3 (Elite Pro - %100 Kapasite)";
    }

    console.log(`\n📧 Hesap: ${box.email}`);
    console.log(`   Durum: ${box.status === 'ACTIVE' ? '✅ Aktif' : box.status === 'WARMUP' ? '🔥 Warmup' : '❌ Pasif'}`);
    console.log(`   Duraklatıldı Mı?: ${box.isPaused ? 'Evet ⏸️' : 'Hayır ▶️'}`);
    console.log(`   Sisteme Eklenme: ${daysActive} gün önce`);
    console.log(`   Isınma Aşaması: ${phase}`);
    console.log(`   Bugün Gönderilen: ${box.sentToday || 0} / ${currentLimit} (Kayıtlı Limit: ${box.limit || box.maxDailyLimit})`);
    console.log(`   Genel Isınma Puanı (Reputation): %${box.reputation || 100} / İlerleme: %${box.warmupProgress || 0}`);
  }

  console.log("\n==========================================");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
