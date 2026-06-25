import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { CalendarDays, Clock, ChevronLeft, Share2, ArrowRight } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug, status: 'PUBLISHED' },
  });

  if (!post) return { title: 'Bulunamadı | StarWebFlow' };

  return {
    title: `${post.seoTitle || post.title} | StarWebFlow`,
    description: post.seoDescription || post.excerpt,
    keywords: post.keywords.join(', '),
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || '',
      images: post.coverImage ? [post.coverImage] : [],
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug, status: 'PUBLISHED' },
  });

  if (!post) {
    notFound();
  }

  // SEO Schema
  const schemaJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    image: post.coverImage ? [post.coverImage] : [],
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: [{
      '@type': 'Organization',
      name: 'StarWebFlow',
      url: 'https://starwebflow.com' // Replace with actual URL if known
    }],
    description: post.seoDescription || post.excerpt
  };

  // Basit TOC oluşturucu (Sadece H2 ve H3)
  const extractHeaders = (markdown: string) => {
    const regex = /^(#{2,3})\s+(.+)$/gm;
    const headers = [];
    let match;
    while ((match = regex.exec(markdown)) !== null) {
      headers.push({
        level: match[1].length,
        text: match[2],
        id: match[2].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      });
    }
    return headers;
  };

  const toc = extractHeaders(post.content);

  // Markdown Render Customizations (to add IDs to headers for TOC)
  const components = {
    h2: ({node, children, ...props}: any) => {
      const text = String(children);
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      return <h2 id={id} className="text-2xl md:text-3xl font-bold mt-12 mb-6 text-slate-100 font-['Outfit']" {...props}>{children}</h2>
    },
    h3: ({node, children, ...props}: any) => {
      const text = String(children);
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      return <h3 id={id} className="text-xl md:text-2xl font-bold mt-8 mb-4 text-slate-200" {...props}>{children}</h3>
    },
    p: ({node, children, ...props}: any) => <p className="text-slate-300 leading-relaxed mb-6 text-lg" {...props}>{children}</p>,
    ul: ({node, children, ...props}: any) => <ul className="list-disc pl-6 mb-6 text-slate-300 space-y-2 text-lg" {...props}>{children}</ul>,
    ol: ({node, children, ...props}: any) => <ol className="list-decimal pl-6 mb-6 text-slate-300 space-y-2 text-lg" {...props}>{children}</ol>,
    li: ({node, children, ...props}: any) => <li {...props}>{children}</li>,
    a: ({node, children, href, ...props}: any) => <a href={href} className="text-blue-400 hover:text-blue-300 underline underline-offset-4" {...props}>{children}</a>,
    blockquote: ({node, children, ...props}: any) => <blockquote className="border-l-4 border-blue-500 pl-6 italic text-slate-400 my-8 py-2 bg-white/[0.02] rounded-r-lg" {...props}>{children}</blockquote>,
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#05050A] text-white pt-32 pb-24 font-sans selection:bg-blue-500/30">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJsonLd) }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <Link href="/blog" className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-8 group">
            <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" /> Bloga Dön
          </Link>

          {/* HERO */}
          <div className="max-w-4xl mx-auto text-center mb-12">
            {post.keywords && post.keywords.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {post.keywords.map(kw => (
                  <span key={kw} className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium border border-blue-500/20">
                    {kw}
                  </span>
                ))}
              </div>
            )}
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 font-['Outfit'] leading-tight">
              {post.title}
            </h1>
            
            <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {post.readingTime} dk okuma
              </span>
            </div>
          </div>

          {post.coverImage && (
            <div className="max-w-5xl mx-auto aspect-[21/9] rounded-3xl overflow-hidden mb-16 border border-white/[0.05] shadow-2xl relative">
              <img 
                src={post.coverImage} 
                alt={post.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05050A] via-transparent to-transparent opacity-80"></div>
            </div>
          )}

          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 relative">
            
            {/* ARTICLE CONTENT */}
            <article className="flex-1 max-w-3xl">
              <ReactMarkdown components={components}>
                {post.content}
              </ReactMarkdown>

              {/* CTA & SHARE */}
              <div className="mt-16 pt-12 border-t border-white/[0.05]">
                <div className="bg-gradient-to-br from-blue-900/40 to-violet-900/40 border border-blue-500/20 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                  <h3 className="text-2xl font-bold mb-4 font-['Outfit']">İşletmenizi Dijitalde Büyütmeye Hazır Mısınız?</h3>
                  <p className="text-slate-300 mb-8 max-w-xl mx-auto">
                    Ücretsiz dijital varlık analiziniz için bizimle iletişime geçin. Rakiplerinizin önüne geçecek stratejiyi birlikte kuralım.
                  </p>
                  <Link href="/contact" className="inline-flex items-center px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all hover:scale-105 shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                    Ücretsiz Analiz İsteyin <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </div>

                {/* SHARE BUTTONS */}
                <div className="flex items-center justify-between mt-12 py-6 border-y border-white/[0.05]">
                  <span className="text-slate-400 font-medium">Bu yazıyı paylaşın:</span>
                  <div className="flex gap-3">
                    <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=https://starwebflow.com/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/[0.05] hover:bg-[#1DA1F2] hover:text-white flex items-center justify-center transition-colors text-slate-400">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                    </a>
                    <a href={`https://www.linkedin.com/shareArticle?mini=true&url=https://starwebflow.com/blog/${post.slug}&title=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/[0.05] hover:bg-[#0A66C2] hover:text-white flex items-center justify-center transition-colors text-slate-400">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    </a>
                  </div>
                </div>
              </div>

            </article>

            {/* SIDEBAR TOC */}
            {toc.length > 0 && (
              <aside className="hidden lg:block w-72 shrink-0">
                <div className="sticky top-32 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                  <h4 className="font-bold text-lg mb-4 text-slate-200">İçindekiler</h4>
                  <nav className="space-y-2">
                    {toc.map((item, idx) => (
                      <a 
                        key={idx} 
                        href={`#${item.id}`}
                        className={`block text-sm transition-colors hover:text-blue-400 ${item.level === 2 ? 'text-slate-300 font-medium' : 'text-slate-500 pl-4'}`}
                      >
                        {item.text}
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>
            )}

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
