const { Resend } = require('resend');
const resend = new Resend('re_gjjcHQdG_No299m1jMNTsGLzPrvaSGiwj');

async function checkQuota() {
  console.log('=== RESEND KOTA VE DOMAIN DETAY TESTİ ===\n');
  
  // Testin başarılı gönderimindeki header'ları analiz et:
  // "x-resend-daily-quota": "0"   -> Günlük kalan kota: 0 !!!
  // "x-resend-monthly-quota": "3" -> Aylık kalan kota: 3
  // "ratelimit-limit": "10"       -> Saniyede 10 istek limiti
  
  console.log('📊 ÖNCEKİ TEST SONUÇLARI ANALİZİ:');
  console.log('');
  console.log('✅ API Key: ÇALIŞIYOR');
  console.log('✅ info@starwebflow.com Domain: DOĞRULANMIŞ (Domain verified)');
  console.log('⚠️  Günlük Kota (x-resend-daily-quota): 0 → GÜNLÜK LİMİT DOLMUŞ!');
  console.log('⚠️  Aylık Kota (x-resend-monthly-quota): 3 → Aylıktan 3 mail kaldı');
  console.log('');
  console.log('📝 DETAYLAR:');
  console.log('   - FREE PLAN sınırları: 100 email/gün, 3000 email/ay');
  console.log('   - "x-resend-daily-quota: 0" → Bugün günlük limit doldu');
  console.log('   - "x-resend-monthly-quota: 3" → Bu ay sadece 3 mail hakkı kaldı');
  console.log('');
  console.log('🔴 SONUÇ: Şu an form doldurulsa bile mail GÖNDEREMEZ durumda!');
  console.log('   (Günlük kota sıfır, aylık kota da kritik seviyede düşük)');

  // Şimdi quota doluyken gönderim dene - ne olacak?
  console.log('\n--- Kota doluyken gönderim denemesi ---');
  try {
    const r = await resend.emails.send({
      from: 'StarWebflow <info@starwebflow.com>',
      to: 'info@starwebflow.com',
      subject: 'KOTA TEST',
      html: '<p>test</p>'
    });
    console.log('Sonuç:', JSON.stringify(r.data || r.error, null, 2));
    if (r.error) {
      console.log('❌ Mail gönderilemedi! Hata:', r.error.message);
    } else {
      console.log('✅ Mail gönderildi (kota hala var). ID:', r.data?.id);
      console.log('Kalan günlük kota:', r.headers?.['x-resend-daily-quota']);
      console.log('Kalan aylık kota:', r.headers?.['x-resend-monthly-quota']);
    }
  } catch(e) {
    console.log('❌ EXCEPTION:', e.message);
  }
}

checkQuota();
