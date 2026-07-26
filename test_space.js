const nodemailer = require('nodemailer');

async function testSMTP() {
  console.log('Testing host with space');
  const transporter = nodemailer.createTransport({
    host: 'smtp.ionos.de ', // note the trailing space
    port: 587,
    secure: false,
    auth: {
      user: 'hello@starwebflow.store',
      pass: '&67_Star-Web-Flow?105&'
    },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 5000,
  });

  try {
    await transporter.verify();
    console.log('Success space');
  } catch (err) {
    console.error('Error space:', err.message);
  }
}

testSMTP();
