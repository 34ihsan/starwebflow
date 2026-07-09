// Hostinger SMTP bağlantı testi
// Kullanım: node test-smtp.js
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testSmtp() {
  console.log('=== Hostinger SMTP Bağlantı Testi ===\n');
  
  const config = {
    host: process.env.SMTP_HOST || 'smtp.ionos.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: parseInt(process.env.SMTP_PORT || '587') === 465,
    auth: {
      user: process.env.SMTP_USER || 'info@starwebflow.com',
      pass: process.env.SMTP_PASS || '',
    },
    tls: { rejectUnauthorized: false },
  };

  console.log('📋 Bağlantı ayarları:');
  console.log('   Host:', config.host);
  console.log('   Port:', config.port);
  console.log('   User:', config.auth.user);
  console.log('   Pass:', config.auth.pass ? '✅ Ayarlanmış (' + config.auth.pass.length + ' karakter)' : '❌ AYARLANMAMIŞ!');
  console.log('');

  if (!config.auth.pass || config.auth.pass.includes('<') || config.auth.pass.includes('buraya')) {
    console.error('❌ SMTP_PASS .env dosyasında ayarlanmamış!');
    console.error('   .env dosyasına SMTP_PASS="hostinger_sifreniz" ekleyin');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport(config);

  // 1. Bağlantı testi
  console.log('1️⃣  SMTP bağlantısı test ediliyor...');
  try {
    await transporter.verify();
    console.log('✅ SMTP bağlantısı BAŞARILI!\n');
  } catch (err) {
    console.error('❌ SMTP bağlantısı BAŞARISIZ:', err.message);
    console.error('\n🔧 Çözüm önerileri:');
    console.error('\n🔧 Çözüm önerileri (IONOS):');
    console.error('   - IONOS Control Panel → E-mail → info@starwebflow.com Şifresi kontrol edin');
    console.error('   - Port 587 (STARTTLS) önerilen. Port 465 (SSL) de denenebilir: SMTP_PORT=465');
    console.error('   - Hostinger VPS → Firewall → 587 ve 465 portlarının açık olduğunu kontrol edin');
    console.error('   - IONOS 2024 kuralı: from adresi SMTP_USER ile aynı domain olmalı');
    console.error('   - VPS üzerinden IONOS SMTP gönderimini kısıtlıyorsa Brevo SMTP yardımcı olabilir');
    process.exit(1);
  }

  // 2. Test maili gönder
  console.log('2️⃣  Test maili gönderiliyor → ' + config.auth.user);
  try {
    const result = await transporter.sendMail({
      from: `StarWebflow <${config.auth.user}>`,
      to: config.auth.user, // Kendine gönder
      subject: '✅ [TEST] Nodemailer + Hostinger SMTP Çalışıyor! - ' + new Date().toLocaleString('tr-TR'),
      html: `
        <div style="font-family:sans-serif;padding:20px;background:#0a0a0f;color:#e2e8f0;border-radius:12px">
          <h2 style="color:#8b5cf6">✅ Mail Sistemi Aktif!</h2>
          <p>Bu mail <strong>Nodemailer + Hostinger SMTP</strong> ile gönderilmiştir.</p>
          <p><strong>Gönderen:</strong> ${config.auth.user}</p>
          <p><strong>Tarih:</strong> ${new Date().toLocaleString('tr-TR')}</p>
          <p style="color:#94a3b8;font-size:13px">Resend kota sınırı artık geçerli değil 🎉</p>
        </div>
      `,
    });
    console.log('✅ Test maili BAŞARILA gönderildi!');
    console.log('   MessageId:', result.messageId);
    console.log('\n🎉 SİSTEM HAZIR! info@starwebflow.com gelen kutusunu kontrol edin.');
  } catch (err) {
    console.error('❌ Mail gönderilemedi:', err.message);
  }
}

testSmtp();
