const nodemailer = require('nodemailer');

async function testSMTP() {
  console.log('Testing imap.ionos.de on 587');
  const transporter = nodemailer.createTransport({
    host: 'imap.ionos.de',
    port: 587,
    secure: false,
    auth: {
      user: 'hello@starwebflow.eu',
      pass: 'dummy'
    },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 5000,
  });

  try {
    await transporter.verify();
    console.log('Success');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testSMTP();
