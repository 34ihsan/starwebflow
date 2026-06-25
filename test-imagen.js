const dotenv = require('dotenv');
dotenv.config({path: '.env.local'});

async function test() {
  const key = process.env.GOOGLE_AI_API_KEY;
  if (!key) {
    console.log("No key");
    return;
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${key}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [{ prompt: "a cute cat" }],
      parameters: { sampleCount: 1 }
    })
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("Error:", err);
  } else {
    const data = await res.json();
    console.log("Success, got image of length", data.predictions[0].bytesBase64Encoded.length);
  }
}
test();
