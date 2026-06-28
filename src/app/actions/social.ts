'use server';

import { prisma } from '@/lib/prisma';
import { safeRevalidatePath } from '@/lib/utils/cache';
import { cookies } from 'next/headers';

// ─── Tenant Resolver ────────────────────────────────────────────────────────
// Cookie tabanlı basit tenant çözümleme. Auth entegrasyonu yapıldığında
// burayı JWT decode / session lookup ile değiştirebilirsiniz.
async function getActiveTenantId(): Promise<string> {
  try {
    const cookieStore = cookies();
    const tenantSlug = cookieStore.get('tenant_slug')?.value ?? 'starwebflow';

    // DB'den slug ile tenant bul
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      select: { id: true },
    });

    if (tenant) return tenant.id;

    // Yoksa ilk kaydı al (tek-tenant geliştirme ortamı için)
    const firstTenant = await prisma.tenant.findFirst({
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    });

    if (firstTenant) return firstTenant.id;

    // Hiç tenant yoksa oluştur
    const newTenant = await prisma.tenant.create({
      data: {
        name: 'StarWebFlow',
        slug: 'starwebflow',
      },
    });
    return newTenant.id;
  } catch {
    // Fallback: eski sabit değer
    return 'default-tenant';
  }
}

// ─── Social Posts ────────────────────────────────────────────────────────────

export async function getSocialData(tenantIdParam?: string) {
  try {
    const tenantId = tenantIdParam ?? (await getActiveTenantId());

    const posts = await prisma.socialPost.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    const ads = await prisma.adCampaign.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: { posts, ads } };
  } catch (error) {
    console.error('getSocialData error:', error);
    return { success: false, error: 'Failed to fetch social data', data: { posts: [], ads: [] } };
  }
}

export async function createSocialPost(data: {
  tenantId?: string;
  platform: string;
  platforms?: string[];
  content: string;
  status: string;
  scheduledFor?: Date;
  aiGenerationStyle?: string;
  humanizedScore?: number;
  mediaUrl?: string;
  mediaType?: string;
  mediaPrompt?: string;
  hashtags?: string[];
  groupId?: string;
  predictedScore?: number;
}) {
  try {
    const tenantId = data.tenantId ?? (await getActiveTenantId());

    const post = await prisma.socialPost.create({
      data: {
        tenant: { connect: { id: tenantId } },
        platform: data.platform,
        platforms: data.platforms || [data.platform],
        content: data.content,
        status: data.status,
        scheduledFor: data.scheduledFor,
        aiGenerationStyle: data.aiGenerationStyle,
        humanizedScore: data.humanizedScore,
        mediaUrl: data.mediaUrl,
        mediaType: data.mediaType,
        mediaPrompt: data.mediaPrompt,
        hasImage: !!data.mediaUrl,
        hashtags: data.hashtags || [],
        groupId: data.groupId,
        predictedScore: data.predictedScore,
      },
    });
    safeRevalidatePath('/admin/social');
    return { success: true, data: post };
  } catch (error) {
    console.error('createSocialPost error:', error);
    return { success: false, error: 'Failed to create post' };
  }
}

export async function updateSocialPost(
  postId: string,
  data: { 
    status?: string; 
    scheduledFor?: Date; 
    content?: string;
    mediaUrl?: string;
    mediaType?: string;
    mediaPrompt?: string;
    isPublished?: boolean;
    publishError?: string | null;
  }
) {
  try {
    const post = await prisma.socialPost.update({
      where: { id: postId },
      data: {
        ...data,
        hasImage: data.mediaUrl !== undefined ? !!data.mediaUrl : undefined,
      },
    });
    safeRevalidatePath('/admin/social');
    return { success: true, data: post };
  } catch (error) {
    console.error('updateSocialPost error:', error);
    return { success: false, error: 'Failed to update post' };
  }
}

export async function deleteSocialPost(postId: string) {
  try {
    const post = await prisma.socialPost.delete({
      where: { id: postId },
    });
    safeRevalidatePath('/admin/social');
    return { success: true, data: post };
  } catch (error) {
    console.error('deleteSocialPost error:', error);
    return { success: false, error: 'Failed to delete post' };
  }
}

export async function publishSocialPost(postId: string) {
  try {
    const post = await prisma.socialPost.findUnique({ where: { id: postId } });
    if (!post) throw new Error("Post not found");

    // Simulate API integration (LinkedIn, Twitter, Instagram)
    // 10% chance to fail to demonstrate error reporting to admin
    const isError = Math.random() < 0.1;
    if (isError) {
      const errorMsg = `API Error: Rate limit exceeded or invalid token for platform ${post.platform}.`;
      await prisma.socialPost.update({
        where: { id: postId },
        data: { publishError: errorMsg, status: 'FAILED' }
      });
      safeRevalidatePath('/admin/social');
      return { success: false, error: errorMsg };
    }

    const updated = await prisma.socialPost.update({
      where: { id: postId },
      data: { isPublished: true, publishError: null, status: 'published' }
    });
    safeRevalidatePath('/admin/social');
    return { success: true, data: updated };
  } catch (error: any) {
    console.error('publishSocialPost error:', error);
    return { success: false, error: error.message };
  }
}

// ─── Ad Campaigns ────────────────────────────────────────────────────────────

export async function createAdCampaign(data: {
  tenantId?: string;
  name: string;
  platform: string;
  status: string;
  spend: number;
  roas: number;
  hookRate?: number;
  ctr?: number;
}) {
  try {
    const tenantId = data.tenantId ?? (await getActiveTenantId());

    const ad = await prisma.adCampaign.create({
      data: {
        tenant: { connect: { id: tenantId } },
        name: data.name,
        platform: data.platform,
        status: data.status,
        spend: data.spend,
        roas: data.roas,
        hookRate: data.hookRate,
        ctr: data.ctr,
      },
    });
    safeRevalidatePath('/admin/social');
    return { success: true, data: ad };
  } catch (error) {
    console.error('createAdCampaign error:', error);
    return { success: false, error: 'Failed to create ad' };
  }
}

export async function updateAdCampaign(
  adId: string,
  data: { status?: string; spend?: number; roas?: number; hookRate?: number }
) {
  try {
    const ad = await prisma.adCampaign.update({
      where: { id: adId },
      data,
    });
    safeRevalidatePath('/admin/social');
    return { success: true, data: ad };
  } catch (error) {
    console.error('updateAdCampaign error:', error);
    return { success: false, error: 'Failed to update ad campaign' };
  }
}

// ─── AI Content Generation (OpenRouter → Llama 3.3 70B) ─────────────────────
// Maliyet karşılaştırması:
//   GPT-4o (direkt):  $15 / 1M token çıktı
//   Llama 3.3 70B:    $0.30 / 1M token çıktı  (%98 tasarruf!)

export async function generateAIContent(params: {
  framework: string;
  platforms: string[];
  topic: string;
  humanizerScore: number;
  visualEngine?: string;
  imagePrompt?: string;
}) {
  const { framework, platforms, topic, humanizerScore, visualEngine, imagePrompt } = params;

  try {
    const tenantId = await getActiveTenantId();
    const brandProfile = await prisma.brandProfile.findFirst({
      where: { tenantId }
    });

    let brandTone = '';
    if (brandProfile) {
      brandTone = `Marka Ses Tonu: ${brandProfile.tone || 'Profesyonel'}
Hedef Kitle: ${brandProfile.targetAudience || 'B2B ve Kobi'}
Yasaklı Kelimeler: ${brandProfile.forbiddenWords?.join(', ') || 'Yok'}`;
    }

    const systemPrompt = `Sen StarWebFlow ajansının Kıdemli Sosyal Medya Metin Yazarı (Senior Copywriter) rolündesin.
${brandTone}
Çıktı Dili: Türkçe${
      humanizerScore > 80
        ? `\nÇOK ÖNEMLİ KURALLAR (AI SLOP YASAĞI):\n1. Şu kelimeleri KESİNLİKLE KULLANMA: "Devrim niteliğinde", "Dijital dönüşüm", "Sınırları zorlayan", "Yenilikçi", "Çığır açan".\n2. ChatGPT'nin yapay coşkulu tonunu kullanma.\n3. Bir insanın elinden çıkmış gibi doğal, sade, samimi yaz. Cümleler farklı uzunluklarda olsun.\n4. Emoji kullanımını abartma.\n5. Soru soruyorsan gerçekten düşündüren bir soru olsun, retorik olmaya.`
        : ''
    }

GÖREVİN: Belirtilen konu için İSTENEN TÜM PLATFORMLAR (Omnichannel) için ayrı ayrı post metni ve hashtagler üretmek. Ayrıca yapay zekanın tespit ettiği 1 niş sektör adını döndür.
Çıktıyı SADECE geçerli bir JSON formatında döndür. Asla markdown json bloğu kullanma, direkt JSON string olarak ver.`;

    const userPrompt = `Framework: ${framework}
Konu/Hook: ${topic}
Platformlar: ${platforms.join(', ')}

Format Şartları:
- LinkedIn: Güçlü hook cümlesi, kısa paragraflar, soru ile bitir. Maks 1300 karakter.
- Instagram: Hook emoji ile başla, görsel odaklı kısa paragraf.
- Twitter/X: İlk 280 karakterde vurucu ana mesaj.
- Facebook: Topluluk odaklı, samimi ve uzun metin.
- Pinterest: Görseli destekleyen, ilham verici kısa açıklama.

JSON Formatı şu şekilde OLMALIDIR:
{
  "niche": "Örn: B2B SaaS",
  "posts": {
    "linkedin": { "content": "...", "hashtags": ["#...", "#..."] },
    "instagram": { "content": "...", "hashtags": ["#..."] }
    // İstenen tüm platformları ekle
  }
}`;

    let finalImagePrompt = imagePrompt;
    let finalMediaUrl = null;
    let aiResult: any = {};

    const googleKey = process.env.GOOGLE_AI_API_KEY;
    if (googleKey && googleKey !== 'BURAYA_API_ANAHTARINIZI_YAPISTIRIN') {
      const { generateText } = await import('ai');
      const { getFlashModel } = await import('@/lib/ai/gemini-client');
      
      const { text } = await generateText({
        model: getFlashModel(),
        system: systemPrompt,
        prompt: userPrompt,
      });

      let jsonStr = text.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```/g, '').trim();
      }
      aiResult = JSON.parse(jsonStr);

      if (visualEngine && visualEngine !== 'none' && !finalImagePrompt) {
        const { text: promptText } = await generateText({
           model: getFlashModel(),
           system: 'Sen profesyonel bir AI Görsel Prompt Mühendisisin.',
           prompt: `Şu konu için Google Imagen veya Midjourney'de kullanılmak üzere yüksek çözünürlüklü, çarpıcı, 1-2 cümlelik İngilizce bir image prompt'u yaz:\n\n${topic}\n\nSADECE prompt'u döndür.`,
        });
        finalImagePrompt = promptText.trim();
      }

      if (finalImagePrompt) {
        if (visualEngine === 'google_ai_pro') {
          try {
            const imagenUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${googleKey}`;
            const imagenRes = await fetch(imagenUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                instances: [{ prompt: finalImagePrompt }],
                parameters: { sampleCount: 1 }
              })
            });
            if (imagenRes.ok) {
              const imagenData = await imagenRes.json();
              if (imagenData.predictions && imagenData.predictions.length > 0) {
                const base64Image = imagenData.predictions[0].bytesBase64Encoded;
                finalMediaUrl = `data:image/jpeg;base64,${base64Image}`;
              }
            }
          } catch (imagenError) {
            console.error('Google Imagen API fetch failed:', imagenError);
          }
        }
        
        if (!finalMediaUrl) {
          finalMediaUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalImagePrompt)}?width=1024&height=1024&nologo=true`; 
        }
      }
      
      return { 
        success: true, 
        omnichannel: aiResult.posts || {},
        niche: aiResult.niche || '',
        model: 'gemini-2.5-flash (Google AI)',
        mediaPrompt: finalImagePrompt,
        mediaUrl: finalMediaUrl
      };
    }

    // Demo Modu
    const demoPosts: any = {};
    platforms.forEach(p => {
      demoPosts[p.toLowerCase()] = {
        content: `[DEMO ${p.toUpperCase()}] ${topic} hakkında örnek bir post. API Key bulunamadığı için bu demo içeriktir.`,
        hashtags: ['#demo', '#ai']
      };
    });

    const demoMediaUrl = (visualEngine && visualEngine !== 'none') 
      ? 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400&auto=format&fit=crop'
      : null;
      
    return { 
      success: true, 
      omnichannel: demoPosts, 
      niche: 'Demo Niche',
      model: 'demo', 
      mediaUrl: demoMediaUrl 
    };

  } catch (error: any) {
    console.error('generateAIContent error:', error);
    const errContent = 'API HATA VERDİ: ' + (error.stack || error.message || String(error));
    const demoPosts: any = {};
    platforms.forEach(p => {
      demoPosts[p.toLowerCase()] = { content: errContent, hashtags: [] };
    });
    return { 
      success: true, 
      omnichannel: demoPosts,
      niche: 'Error',
      model: 'demo-fallback', 
      mediaUrl: null 
    };
  }
}

export async function bulkGenerateSocialContent(rows: { topic: string; platform: string; date?: string; framework?: string; imagePrompt?: string }[]) {
  try {
    const tenantId = await getActiveTenantId();
    let createdCount = 0;

    for (const row of rows) {
      if (!row.topic || !row.platform) continue;

      const platformLabel = row.platform.toLowerCase().includes('linkedin') ? 'LinkedIn' :
                            row.platform.toLowerCase().includes('twitter') ? 'Twitter' : 'Instagram';

      let scheduledFor = undefined;
      if (row.date) {
        const d = new Date(row.date);
        if (!isNaN(d.getTime())) {
          scheduledFor = d;
        }
      }

      await prisma.socialPost.create({
        data: {
          tenant: { connect: { id: tenantId } },
          platform: platformLabel,
          content: row.topic, // Storing topic in content while in IDEA status
          status: 'IDEA',
          scheduledFor: scheduledFor,
          aiGenerationStyle: 'gemini-bulk-intent',
          mediaPrompt: row.imagePrompt,
        },
      });
      createdCount++;
    }

    safeRevalidatePath('/admin/social');
    return { success: true, createdCount };
  } catch (error: any) {
    console.error('bulkGenerateSocialContent error:', error);
    return { success: false, error: error.message };
  }
}

export async function suggestSocialIdeas(topicContext?: string) {
  try {
    const googleKey = process.env.GOOGLE_AI_API_KEY;
    if (!googleKey || googleKey === 'BURAYA_API_ANAHTARINIZI_YAPISTIRIN') {
      return { success: false, error: 'Google AI API Key bulunamadı.' };
    }

    const { generateText } = await import('ai');
    const { getFlashModel } = await import('@/lib/ai/gemini-client');
    const model = getFlashModel();

    const systemPrompt = `Sen StarWebFlow ajansının dijital pazarlama ve içerik stratejistisin.
Görevin, projenin sunduğu TÜM HİZMETLERİ (Modern Web Tasarımı, SEO, Sosyal Medya Yönetimi, Dijital Dönüşüm, Yapay Zeka Çözümleri, İçerik Pazarlaması, Reklam Yönetimi) kapsayacak şekilde çeşitli ve profesyonel 5 adet harika sosyal medya post fikri üretmektir. Sadece tek bir hizmete odaklanma, farklı hizmetleri harmanla.
Eğer kullanıcı özel bir bağlam verirse ona odaklan ama yine de ajansın profesyonel ve vizyoner dilini koru.
Çıktıyı SADECE geçerli bir JSON array formatında ver. Başka hiçbir açıklama yazma.
Örnek Format:
[
  { "topic": "SEO Neden İşletmeniz İçin Vazgeçilmez?", "platforms": ["LinkedIn", "Twitter"], "imagePrompt": "A magnifying glass focusing on a search bar with an upward trending graph in the background" }
]`;
    const userPrompt = `Bağlam/Konu: ${topicContext || 'StarWebFlow Ajans Tüm Hizmetleri'}
Bana 5 adet JSON nesnesi içeren bir array döndür. Her bir nesne topic, platforms (string array, en fazla 3 platform, örn: ["Instagram", "LinkedIn"]) ve imagePrompt alanlarını içersin.`;

    const { text } = await generateText({
      model,
      system: systemPrompt,
      prompt: userPrompt,
    });

    let jsonStr = text.trim();
    if (jsonStr.startsWith('\`\`\`json')) {
      jsonStr = jsonStr.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    }
    const ideas = JSON.parse(jsonStr);

    return { success: true, ideas };
  } catch (error: any) {
    console.error('suggestSocialIdeas error:', error);
    return { success: false, error: error.message };
  }
}

export async function getBrandProfile() {
  try {
    const tenantId = await getActiveTenantId();
    const profile = await prisma.brandProfile.findFirst({ where: { tenantId } });
    return { success: true, data: profile };
  } catch (error) {
    return { success: false, error: 'Failed to fetch brand profile' };
  }
}

export async function updateBrandProfile(data: { tone?: string; targetAudience?: string; forbiddenWords?: string[] }) {
  try {
    const tenantId = await getActiveTenantId();
    let profile = await prisma.brandProfile.findFirst({ where: { tenantId } });
    if (profile) {
      profile = await prisma.brandProfile.update({
        where: { id: profile.id },
        data
      });
    } else {
      profile = await prisma.brandProfile.create({
        data: {
          tenant: { connect: { id: tenantId } },
          ...data
        }
      });
    }
    return { success: true, data: profile };
  } catch (error) {
    return { success: false, error: 'Failed to update brand profile' };
  }
}

export async function generateTrackedLink(data: {
  originalUrl: string;
  postId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}) {
  try {
    const tenantId = await getActiveTenantId();
    const code = Math.random().toString(36).substring(2, 8); // Simple short code

    const link = await prisma.linkTracking.create({
      data: {
        tenantId,
        code,
        originalUrl: data.originalUrl,
        postId: data.postId,
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
      }
    });

    // Assume app is hosted on localhost:3000 for local dev
    // In production, this would be an env var like process.env.NEXT_PUBLIC_APP_URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return { success: true, url: `${baseUrl}/api/r/${code}`, link };
  } catch (error: any) {
    console.error('generateTrackedLink error:', error);
    return { success: false, error: error.message };
  }
}

export async function syncSocialLeads() {
  try {
    const tenantId = await getActiveTenantId();

    // In a real app, this would hit Meta/LinkedIn APIs to fetch comments on recent posts.
    // Here, we simulate finding 2 new people who commented.

    const simulatedEngagements = [
      { platform: 'instagram', username: 'johndoe_ig', comment: 'Harika bir hizmet, fiyat alabilir miyim?' },
      { platform: 'linkedin', username: 'janedoe_li', comment: 'Bunu bizim projeye de entegre edebilir miyiz? İletişime geçelim.' }
    ];

    const newLeads = [];

    for (const eng of simulatedEngagements) {
      // 1. Record engagement
      const engagement = await prisma.socialEngagement.create({
        data: {
          tenantId,
          platform: eng.platform,
          interactionType: 'COMMENT',
          externalUsername: eng.username,
          content: eng.comment,
        }
      });

      // 2. Create Lead
      const lead = await prisma.lead.create({
        data: {
          tenantId,
          name: eng.username, // In reality, we'd try to resolve real name
          source: `Social Media (${eng.platform})`,
          status: 'new',
          socialScore: 50,
          notes: `Otomatik yakalandı. Yorum: "${eng.comment}"`,
        }
      });
      newLeads.push(lead);
    }

    return { success: true, message: `${newLeads.length} yeni potansiyel müşteri sosyal medyadan otomatik eklendi.`, leads: newLeads };
  } catch (error: any) {
    console.error('syncSocialLeads error:', error);
    return { success: false, error: error.message };
  }
}
