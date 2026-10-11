const cron = require('node-cron');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 3005;
const BASE_URL = `http://localhost:${PORT}`;
const CRON_SECRET = process.env.CRON_SECRET || '';

const headers = {
  'Authorization': `Bearer ${CRON_SECRET}`,
  'Content-Type': 'application/json'
};

async function runJob(name, endpoint) {
  console.log(`[${new Date().toISOString()}] Starting Job: ${name} -> ${endpoint}`);
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers
    });
    const text = await res.text();
    if (res.ok) {
      console.log(`[${new Date().toISOString()}] ✅ SUCCESS ${name}:`, text);
    } else {
      console.error(`[${new Date().toISOString()}] ❌ ERROR ${name} (${res.status}):`, text);
    }
  } catch (err) {
    console.error(`[${new Date().toISOString()}] ❌ FAILED to run ${name}:`, err.message);
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

// 4. Daily Reset (Reset sentToday and increment warmupDay): Run every night at 00:00
cron.schedule('0 0 * * *', () => {
  runJob('Daily Reset', '/api/cron/daily-reset');
});

console.log(`🚀 StarWebflow Cron Service Started. (Targeting ${BASE_URL})`);
