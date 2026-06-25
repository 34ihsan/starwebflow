/**
 * Gemini AI Otomasyon Node'ları
 * Görsel üretimi (Imagen 4) ve Video üretimi (Veo 3.1) işlemleri
 */
import { generateText } from "ai";
import { getFlashModel, getGoogleApiKey, GEMINI_MODELS } from "@/lib/ai/gemini-client";

// ─── Görsel Üretimi (Imagen 4) ───────────────────────────────────────────────
export async function aiGenerateImageAction(tenantId: string, payload: any, nodeData: any) {
  console.log("[AI Image Node] Starting image generation...");

  const prompt = nodeData.imagePrompt || payload.imagePrompt || "Profesyonel web tasarım banner görseli";
  const aspectRatio = nodeData.aspectRatio || "16:9";

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODELS.IMAGEN}:predict`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": getGoogleApiKey(),
        },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio,
            outputOptions: { mimeType: "image/jpeg" },
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "Imagen 4 hatası");
    }

    const data = await response.json();
    const imageBase64 = data.predictions?.[0]?.bytesBase64Encoded;

    return {
      success: true,
      imageBase64,
      imagePrompt: prompt,
      message: "Imagen 4 ile görsel başarıyla üretildi.",
    };
  } catch (e: any) {
    console.error("[AI Image Node] Hata:", e);
    return { success: false, error: e.message, message: "Görsel üretimi başarısız." };
  }
}

// ─── Video Üretimi (Veo 3.1) ─────────────────────────────────────────────────
export async function aiGenerateVideoAction(tenantId: string, payload: any, nodeData: any) {
  console.log("[AI Video Node] Starting video generation...");

  const prompt = nodeData.videoPrompt || payload.videoPrompt || "Modern kurumsal tanıtım videosu";
  const aspectRatio = nodeData.aspectRatio || "16:9";
  const fast = nodeData.fast === true;
  const model = fast ? GEMINI_MODELS.VEO_FAST : GEMINI_MODELS.VEO;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:predictLongRunning`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": getGoogleApiKey(),
        },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: { aspectRatio, durationSeconds: 8 },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "Veo 3.1 hatası");
    }

    const operation = await response.json();
    return {
      success: true,
      operationId: operation.name,
      status: "PROCESSING",
      message: "Veo 3.1 ile video üretimi başlatıldı (2-3 dk sürebilir).",
    };
  } catch (e: any) {
    console.error("[AI Video Node] Hata:", e);
    return { success: false, error: e.message, message: "Video üretimi başarısız." };
  }
}

// ─── Bulk İçerik Üretimi (Gemini Flash) ─────────────────────────────────────
export async function aiGenerateContentAction(tenantId: string, payload: any, nodeData: any) {
  console.log("[AI Content Node] Generating content...");

  const contentType = nodeData.contentType || "social"; // blog | email | proposal | social
  const topic = nodeData.topic || payload.companyName || "StarWebflow dijital hizmetleri";
  const platform = nodeData.platform || "linkedin";

  try {
    const { text } = await generateText({
      model: getFlashModel(),
      prompt: `Sen StarWebflow'un içerik uzmanısın.
İçerik tipi: ${contentType}
Konu: ${topic}
${contentType === "social" ? `Platform: ${platform}` : ""}
Türkçe, kısa ve etkili içerik üret. Maksimum 200 kelime.`,
    });

    return {
      success: true,
      content: text,
      contentType,
      message: `Gemini Flash ile ${contentType} içeriği üretildi.`,
    };
  } catch (e: any) {
    console.error("[AI Content Node] Hata:", e);
    return { success: false, error: e.message, message: "İçerik üretimi başarısız." };
  }
}
