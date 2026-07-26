const nodemailer = require('nodemailer');

async function testSMTP() {
  console.log('Testing hello@starwebflow.store on smtp.ionos.de:587');
  const transporter = nodemailer.createTransport({
    host: 'smtp.ionos.de',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'hello@starwebflow.store',
      pass: '&67_Star-Web-Flow?105&'
    },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 5000,
  });

  try {
    await transporter.verify();
    console.log('Success for hello@starwebflow.store!');
  } catch (err) {
    console.error('Error hello@starwebflow.store:', err.message);
  }
}

testSMTP();
