const fs = require('fs');
const data = fs.readFileSync('.env', 'utf8');
const match = data.match(/GOOGLE_AI_API_KEY="?([^"\n]+)"?/);
const key = match[1].trim();
const url = 'https://generativelanguage.googleapis.com/v1beta/models?key=' + key;
fetch(url).then(async r => {
  const json = await r.json();
  const imagenModels = json.models.filter(m => m.name.includes('imagen')).map(m => m.name + ' - ' + m.supportedGenerationMethods.join(', '));
  console.log(imagenModels);
}).catch(e => console.error(e));
