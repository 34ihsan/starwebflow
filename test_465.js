const nodemailer = require('nodemailer');

async function testSMTP() {
  console.log('Testing smtp.ionos.de on 465 SSL');
  const transporter = nodemailer.createTransport({
    host: 'smtp.ionos.de',
    port: 465,
    secure: true,
    auth: {
      user: 'hello@starwebflow.store',
      pass: '&67_Star-Web-Flow?105&' // Just a dummy test
    },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 5000,
  });

  try {
    await transporter.verify();
    console.log('Success on 465');
  } catch (err) {
    console.error('Error on 465:', err.message);
  }
}

testSMTP();
