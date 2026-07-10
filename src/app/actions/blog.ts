'use server';

import { prisma } from '@/lib/prisma';
import { safeRevalidatePath } from '@/lib/utils/cache';
import { cookies } from 'next/headers';

// ─── Tenant Resolver ────────────────────────────────────────────────────────
async function getActiveTenantId(): Promise<string> {
  try {
    const cookieStore = cookies();
    const tenantSlug = cookieStore.get('tenant_slug')?.value ?? 'starwebflow';

    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      select: { id: true },
    });

    if (tenant) return tenant.id;

    const firstTenant = await prisma.tenant.findFirst({
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    });

    if (firstTenant) return firstTenant.id;

    const newTenant = await prisma.tenant.create({
      data: {
        name: 'StarWebFlow',
        slug: 'starwebflow',
      },
    });
    return newTenant.id;
  } catch {
    return 'default-tenant';
  }
}

// ─── Blog Posts CRUD ─────────────────────────────────────────────────────────

export async function getBlogPosts() {
  try {
    const tenantId = await getActiveTenantId();

    const posts = await prisma.blogPost.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: posts };
  } catch (error) {
    console.error('getBlogPosts error:', error);
    return { success: false, error: 'Failed to fetch blog posts' };
  }
}

export async function updateBlogPost(id: string, data: any) {
  try {
    const post = await prisma.blogPost.update({
      where: { id },
      data,
    });
    safeRevalidatePath('/admin/blog');
    safeRevalidatePath('/blog');
    safeRevalidatePath(`/blog/${post.slug}`);
    return { success: true, data: post };
  } catch (error) {
    console.error('updateBlogPost error:', error);
    return { success: false, error: 'Failed to update blog post' };
  }
}

export async function deleteBlogPost(id: string) {
  try {
    const post = await prisma.blogPost.delete({
      where: { id },
    });
    safeRevalidatePath('/admin/blog');
    safeRevalidatePath('/blog');
    return { success: true, data: post };
  } catch (error) {
    console.error('deleteBlogPost error:', error);
    return { success: false, error: 'Failed to delete blog post' };
  }
}

// ─── AI Blog Generation ─────────────────────────────────────────────────────

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\u011f\u011e\u0131\u0130\u00f6\u00d6\u00fc\u00dc\u015f\u015e\u00e7\u00c7]+/g, '-') // Allow turkish chars for a moment or replace them
    .replace(/[\u011f\u011e]/g, 'g')
    .replace(/[\u0131\u0130]/g, 'i')
    .replace(/[\u00f6\u00d6]/g, 'o')
    .replace(/[\u00fc\u00dc]/g, 'u')
    .replace(/[\u015f\u015e]/g, 's')
    .replace(/[\u00e7\u00c7]/g, 'c')
    .replace(/[^a-z0-9\-]/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export async function generateAIBlog(topic: string, keywords: string, includePAA: boolean = true, authorName?: string) {
  try {
    const tenantId = await getActiveTenantId();
    const googleKey = process.env.GOOGLE_AI_API_KEY;

    if (!googleKey || googleKey === 'BURAYA_API_ANAHTARINIZI_YAPISTIRIN') {
      return { success: false, error: 'Google AI API Key bulunamadı.' };
    }

    const { generateText } = await import('ai');
    const { getFlashModel } = await import('@/lib/ai/gemini-client');
    const model = getFlashModel();

    let paaQuestions = '';
    if (includePAA) {
      // PAA (People Also Ask) generation step
      const { text: paaText } = await generateText({
        model,
        system: "Sen bir SEO uzmanısın. Kullanıcının verdiği anahtar kelime veya konu ile ilgili Google'da insanların en çok sorduğu 'Bunu da sordular' (People Also Ask - PAA) tarzında 5 adet soruyu liste halinde çıkar. Sadece soruları alt alta yaz.",
        prompt: `Konu: ${topic}\nAnahtar Kelimeler: ${keywords}`
      });
      paaQuestions = paaText.trim();
    }

    const systemPrompt = `Rol: StarWebFlow adlı B2B dijital ajansının Baş İçerik Stratejistisin.
Görevin: Verilen konu ve anahtar kelimelere uygun, SEO dostu, yapılandırılmış, profesyonel ve HUMANIZED (insan doğallığında) bir blog yazısı oluşturmaktır.
Makale dili: Türkçe. Markdown formatında çıktı ver.
Makale hedef uzunluğu: Minimum 1500 - 2000 kelime arası olmalıdır (Çok kapsamlı ve detaylı yaz).
ÖNEMLİ KURALLAR:
1. Yazıya KESİNLİKLE "Sen StarWebFlow olarak..." gibi ifadelerle başlama. Kendine "Sen" diye hitap etme. Yazı doğrudan hedef kitleye (potansiyel müşterilere) hitap eden profesyonel bir makale olmalıdır. Ajansı temsil ederken daima "biz" veya "StarWebFlow olarak" ifadelerini kullan.
2. Yazı içinde sahte veya var olmayan linkler (Örn: /services/seo) KULLANMA. Hizmetlerimizden bahsederken SADECE şu gerçek linkleri kullan:
   - Web Geliştirme: /hizmetler/web-gelistirme
   - Web Uygulaması: /hizmetler/web-uygulamasi
   - AI Agents: /hizmetler/ai-agents
   - AI Otomasyon: /hizmetler/ai-otomasyon
   - Reklam & Sosyal Medya: /hizmetler/reklam-sosyal-medya
Eğer iletişim veya randevu yönlendirmesi yapacaksan sadece /contact veya /iletisim kullan.
3. Okuyucuyu sıkmayan, paragraf uzunlukları dengeli, başlık hiyerarşisi (H2, H3, H4) düzgün bir yazı olsun.
${includePAA ? '4. Yazının sonunda veya uygun yerlerinde "Sıkça Sorulan Sorular" veya "İnsanlar Bunları Da Sordu" başlığı altında sana verilen PAA sorularını detaylıca yanıtla.' : ''}
5. Yazının sonunda "Ücretsiz Dijital Varlık Analizi Alın" veya benzeri bir CTA (Call to Action) kısmı ekle ve /contact sayfasına yönlendir.
Ayrıca yazı içeriğini sarmalayan metadata bilgilerini JSON formatında, \`\`\`json ve \`\`\` arasında en sona ekle.

Örnek Metadata Formatı (Mutlaka yazının en sonunda olsun):
\`\`\`json
{
  "title": "Makalenin Çarpıcı Başlığı",
  "seoTitle": "SEO Uyumlu Başlık | StarWebFlow",
  "seoDescription": "Makalenin 150-160 karakterlik SEO açıklaması",
  "excerpt": "Blog ana sayfasında görünecek 2-3 cümlelik kısa özet",
  "unsplashKeyword": "business,technology",
  "authorName": "Yazarın adı (varsa)",
  "readingTime": 5
}
\`\`\`
`;

    const userPrompt = `Konu: ${topic}
Anahtar Kelimeler: ${keywords}
${includePAA ? `İnsanların Sorduğu Sorular (PAA - Bunları makaleye dahil et ve yanıtla):\n${paaQuestions}\n` : ''}
Lütfen makaleyi Markdown olarak yaz ve sonuna istediğim JSON formatındaki metadatayı ekle.`;

    const { text } = await generateText({
      model,
      system: systemPrompt,
      prompt: userPrompt,
    });

    // Parse JSON metadata
    const jsonMatch = text.match(/\`\`\`json([\s\S]*?)\`\`\`/);
    let metadata: any = {};
    let markdownContent = text;

    if (jsonMatch && jsonMatch[1]) {
      try {
        metadata = JSON.parse(jsonMatch[1].trim());
        markdownContent = text.replace(jsonMatch[0], '').trim();
      } catch (e) {
        console.error("JSON parse hatası", e);
      }
    }

    const title = metadata.title || topic;
    const slug = generateSlug(title) + '-' + Date.now().toString().slice(-4);
    
    // Unsplash'dan kapak görseli
    const unsplashKeyword = metadata.unsplashKeyword || 'technology';
    const coverImage = `https://source.unsplash.com/1200x600/?${encodeURIComponent(unsplashKeyword)}`;

    const post = await prisma.blogPost.create({
      data: {
        tenant: { connect: { id: tenantId } },
        title: title,
        slug: slug,
        content: markdownContent,
        excerpt: metadata.excerpt || '',
        seoTitle: metadata.seoTitle || title,
        seoDescription: metadata.seoDescription || '',
        keywords: keywords.split(',').map((k: string) => k.trim()).filter(Boolean),
        readingTime: metadata.readingTime || 3,
        coverImage: coverImage,
        authorName: authorName || metadata.authorName || 'StarWebFlow Ekibi',
        status: 'PENDING_APPROVAL',
      },
    });

    safeRevalidatePath('/admin/blog');
    return { success: true, data: post };
  } catch (error: any) {
    console.error('generateAIBlog error:', error);
    return { success: false, error: error.message };
  }
}

// ─── AI Blog Idea Generation ──────────────────────────────────────────────────

export async function suggestBlogIdeas() {
  try {
    const googleKey = process.env.GOOGLE_AI_API_KEY;
    if (!googleKey || googleKey === 'BURAYA_API_ANAHTARINIZI_YAPISTIRIN') {
      return { success: false, error: 'Google AI API Key bulunamadı.' };
    }

    const { generateText } = await import('ai');
    const { getFlashModel } = await import('@/lib/ai/gemini-client');
    const model = getFlashModel();

    const systemPrompt = `Sen StarWebFlow adlı B2B dijital ajansın baş içerik stratejistisin.
Ajansın hizmetleri şunlar: SEO, Web Tasarımı, Webflow Geliştirme, Sosyal Medya Yönetimi, Dijital Pazarlama.
Amacın, StarWebFlow'un potansiyel müşterilerini (KOBİ'ler, Kurumsal şirketler, B2B firmalar) çekebilecek, ilgi çekici, tıklanabilir ve SEO uyumlu 5 adet yepyeni blog yazısı fikri önermektir.

Çıktıyı SADECE JSON formatında ver. Başka hiçbir açıklama yazma.
Örnek JSON yapısı:
[
  {
    "topic": "B2B Şirketler İçin Webflow ile Kurumsal Site Geliştirmenin Avantajları",
    "keywords": "webflow, b2b web tasarım, kurumsal web sitesi",
    "description": "Neden B2B firmaları WordPress yerine Webflow tercih etmeli?"
  }
]`;

    const { text } = await generateText({
      model,
      system: systemPrompt,
      prompt: "Bana 5 adet blog yazısı fikri öner.",
    });

    let jsonStr = text.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
    }
    const ideas = JSON.parse(jsonStr);
    
    return { success: true, data: ideas };
  } catch (error: any) {
    console.error('suggestBlogIdeas error:', error);
    return { success: false, error: error.message };
  }
}

// ─── Repurpose Blog to Social ───────────────────────────────────────────────

export async function repurposeBlogToSocial(blogId: string) {
  try {
    const tenantId = await getActiveTenantId();
    const blog = await prisma.blogPost.findUnique({ where: { id: blogId } });

    if (!blog) return { success: false, error: 'Blog not found' };

    const googleKey = process.env.GOOGLE_AI_API_KEY;
    if (!googleKey || googleKey === 'BURAYA_API_ANAHTARINIZI_YAPISTIRIN') {
      return { success: false, error: 'Google AI API Key bulunamadı.' };
    }

    const { generateText } = await import('ai');
    const { getFlashModel } = await import('@/lib/ai/gemini-client');
    const model = getFlashModel();

    const systemPrompt = `Sen bir Sosyal Medya İçerik Geri Dönüşüm (Repurposing) uzmanısın.
Gönderilen uzun blog yazısını okuyacak ve bundan 2 adet sosyal medya içeriği üreteceksin:
1. Twitter (X) Flood (Thread) formatı: Birbirine bağlı 3-5 tweetlik bir dizi. İlk tweet güçlü bir Hook olmalı.
2. LinkedIn Post formatı: Profesyonel, merak uyandırıcı, boşluklu listeler içeren tek bir uzun post. Sonunda soru ile bitsin.

Çıktıyı SADECE JSON array olarak ver. Başka hiçbir şey yazma. Örnek:
[
  { "platform": "Twitter", "content": "Harika bir thread... (1/5)\\n\\nDevamı..." },
  { "platform": "LinkedIn", "content": "İş dünyasında yeni trendler..." }
]`;

    const userPrompt = `Blog Başlığı: ${blog.title}
Blog Özeti: ${blog.excerpt}
Blog İçeriği (ilk 3000 karakter): ${blog.content.substring(0, 3000)}`;

    const { text } = await generateText({
      model,
      system: systemPrompt,
      prompt: userPrompt,
    });

    let jsonStr = text.trim();
    if (jsonStr.startsWith('\`\`\`json')) {
      jsonStr = jsonStr.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    }
    const socials = JSON.parse(jsonStr);

    let createdCount = 0;
    for (const item of socials) {
      await prisma.socialPost.create({
        data: {
          tenant: { connect: { id: tenantId } },
          platform: item.platform,
          content: item.content,
          status: 'PENDING_APPROVAL', // Direkt onay bekleyenlere atıyoruz
          aiGenerationStyle: 'repurposed-from-blog',
        },
      });
      createdCount++;
    }

    safeRevalidatePath('/admin/social');
    return { success: true, createdCount };
  } catch (error: any) {
    console.error('repurposeBlogToSocial error:', error);
    return { success: false, error: error.message };
  }
}
