import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import dotenv from 'dotenv';
dotenv.config();

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY ? process.env.GOOGLE_AI_API_KEY.replace(/\"/g, '') : '',
});

async function run() {
  const text = "Bu bir test sosyal medya gonderisidir.";
  const { text: promptText } = await generateText({
     model: google('gemini-2.5-flash'),
     system: "Sen profesyonel bir AI Görsel Prompt Mühendisisin.",
     prompt: `Şu sosyal medya metni için Google Imagen veya Midjourney'de kullanılmak üzere yüksek çözünürlüklü, çarpıcı, 1-2 cümlelik İngilizce bir image prompt'u yaz:\n\n${text}\n\nSADECE prompt'u döndür.`,
  });
  console.log("PROMPT:", promptText.trim());
  const finalMediaUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptText.trim())}?width=1024&height=1024&nologo=true`;
  console.log("URL:", finalMediaUrl);
}

run().catch(console.error);
