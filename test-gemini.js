const dotenv = require('dotenv');
dotenv.config();
const { generateText } = require('ai');
const { createGoogleGenerativeAI } = require('@ai-sdk/google');
const key = process.env.GOOGLE_AI_API_KEY ? process.env.GOOGLE_AI_API_KEY.replace(/\"/g, '') : '';
console.log('Using key:', key.substring(0, 5) + '...');
const google = createGoogleGenerativeAI({apiKey: key});
generateText({model: google('gemini-2.5-flash'), prompt: 'Hello'})
  .then(res => console.log('SUCCESS:', res.text))
  .catch(e => console.error('ERROR:', e.message));
