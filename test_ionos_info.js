const nodemailer = require('nodemailer');

async function testSMTP() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.ionos.de',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'info@starwebflow.com',
      pass: '&67_Star-Web-Flow?105&'
    },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 5000,
  });

  try {
    await transporter.verify();
    console.log('Success for info@starwebflow.com!');
  } catch (err) {
    console.error('Error info@starwebflow.com:', err.message);
  }
}

testSMTP();
