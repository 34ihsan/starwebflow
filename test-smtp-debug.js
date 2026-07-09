// IONOS SMTP detaylı debug testi
// Kullanım: node test-smtp-debug.js
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testAll() {
  const user = process.env.SMTP_USER || 'info@starwebflow.com';
  const pass = process.env.SMTP_PASS || '';

  console.log('=== IONOS SMTP Debug Testi ===\n');
  console.log('User:', user);
  console.log('Pass uzunluğu:', pass.length, 'karakter');
  console.log('');

  const configs = [
    { label: '1️⃣  smtp.ionos.com:587 (STARTTLS)', host: 'smtp.ionos.com', port: 587, secure: false },
    { label: '2️⃣  smtp.ionos.com:465 (SSL)',      host: 'smtp.ionos.com', port: 465, secure: true  },
    { label: '3️⃣  smtp.ionos.de:587 (STARTTLS)',  host: 'smtp.ionos.de',  port: 587, secure: false },
    { label: '4️⃣  smtp.ionos.de:465 (SSL)',       host: 'smtp.ionos.de',  port: 465, secure: true  },
  ];

  for (const cfg of configs) {
    console.log(`Test: ${cfg.label}`);
    const t = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: { user, pass },
      connectionTimeout: 10000,
      socketTimeout: 10000,
      tls: { rejectUnauthorized: false }, // tüm sertifikaları kabul et (debug için)
    });
    try {
      await t.verify();
      console.log(`   ✅ BAĞLANTI BAŞARILI!\n`);
      
      // Başarılı bağlantıyla mail gönder
      console.log('   📧 Test maili gönderiliyor...');
      const result = await t.sendMail({
        from: `StarWebflow <${user}>`,
        to: user,
        subject: `✅ IONOS SMTP Çalışıyor (${cfg.host}:${cfg.port})`,
        html: `<div style="font-family:sans-serif;padding:20px"><h2>✅ Başarılı!</h2><p>SMTP: ${cfg.host}:${cfg.port}</p><p>Tarih: ${new Date().toLocaleString('tr-TR')}</p></div>`
      });
      console.log(`   ✅ Mail gönderildi! ID: ${result.messageId}`);
      console.log(`\n🎉 Çalışan ayar: SMTP_HOST=${cfg.host} | SMTP_PORT=${cfg.port}\n`);
      process.exit(0);
    } catch (err) {
      console.log(`   ❌ Hata: ${err.message}\n`);
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('❌ Tüm konfigürasyonlar başarısız oldu.\n');
  console.log('🔍 Olası nedenler:');
  console.log('   1. IONOS mail şifresi yanlış girilmiş');
  console.log('      → IONOS Control Panel: my.ionos.com → E-mail → info@starwebflow.com → Şifreyi sıfırlayın');
  console.log('');
  console.log('   2. Hostinger VPS\'nin IONOS SMTP portlarına erişimi firewall tarafından engelleniyor');
  console.log('      → Hostinger VPS Panel → Firewall → Outbound 587/465 portlarını açın');
  console.log('      → VPS SSH\'tan test: telnet smtp.ionos.com 587');
  console.log('');
  console.log('   3. IONOS hesabında bu IP için gönderim izni yok (spam koruması)');
  console.log('      → IONOS Support ile iletişime geçin: 0800 100 668');
}

testAll();
