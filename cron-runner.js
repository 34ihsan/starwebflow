const cron = require('node-cron');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 3005;
const BASE_URL = \http://localhost:\\;
const CRON_SECRET = process.env.CRON_SECRET || '';

const headers = {
  'Authorization': \Bearer \\,
  'Content-Type': 'application/json'
};

async function runJob(name, endpoint) {
  console.log(\[\] Starting Job: \ -> \\);
  try {
    const res = await fetch(\\\\, {
      method: 'GET',
      headers
    });
    const text = await res.text();
    if (res.ok) {
      console.log(\[\] ✅ SUCCESS \:\, text);
    } else {
      console.error(\[\] ❌ ERROR \ (\):\, text);
    }
  } catch (err) {
    console.error(\[\] ❌ FAILED to run \:\, err.message);
  }
}

// 1. Smart Warmup: Run every 30 minutes
cron.schedule('*/30 * * * *', () => {
  runJob('Smart Warmup', '/api/cron/smart-warmup');
});

// 2. Process Sequences (Assign tasks/emails): Run every 10 minutes
cron.schedule('*/10 * * * *', () => {
  runJob('Process Sequences', '/api/cron/process-sequences');
});

// 3. Sequence Runner (Send emails): Run every 5 minutes
cron.schedule('*/5 * * * *', () => {
  runJob('Sequence Runner', '/api/cron/sequence-runner');
});

console.log(\🚀 StarWebflow Cron Service Started. (Targeting \)\);
