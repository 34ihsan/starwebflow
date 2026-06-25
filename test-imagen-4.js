const fs = require('fs');
const data = fs.readFileSync('.env', 'utf8');
const match = data.match(/GOOGLE_AI_API_KEY="?([^"\n]+)"?/);
const key = match[1].trim();

const url = 'https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=' + key;
fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ instances: [{ prompt: 'a cute cat' }], parameters: { sampleCount: 1 } })
}).then(async r => {
  const text = await r.text();
  console.log('Status:', r.status);
  console.log('Response:', text);
}).catch(e => console.error(e));
