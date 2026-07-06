require('dotenv').config();

async function main() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_AI_API_KEY}`);
    const data = await response.json();
    console.log('Available models:', data.models.map(m => m.name).filter(n => n.includes('gemini')));
  } catch (e) {
    console.error('ERROR:', e.message);
  }
}

main();
