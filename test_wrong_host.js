const nodemailer = require('nodemailer');

async function testSMTP() {
  console.log('Testing dummy host');
  const transporter = nodemailer.createTransport({
    host: 'smtp.starwebflow.eu', // Intentionally wrong to simulate user typo
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
