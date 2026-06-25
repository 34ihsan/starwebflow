import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowRight, Clock, CalendarDays } from 'lucide-react';
import { Metadata } from 'next';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'Blog | StarWebFlow Dijital Ajans',
  description: 'Dijital pazarlama, SEO, web tasarım ve yapay zeka çözümleri hakkında en güncel makaleler ve içgörüler.',
};

export default async function BlogIndexPage() {
  const posts = await prisma.blogPost.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
  });

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#05050A] text-white pt-32 pb-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-black mb-6 font-['Outfit'] bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
            İçgörüler ve Yenilikler
          </h1>
          <p className="text-lg text-slate-400">
            Dijital dünyadaki en son trendleri, stratejileri ve büyüme taktiklerini keşfedin.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center text-slate-500 py-20">
            Henüz yayınlanmış bir makale bulunmuyor.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col bg-[#0A0A0F] border border-white/[0.05] rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                {post.coverImage ? (
                  <div className="aspect-[16/9] w-full overflow-hidden relative">
                    <img 
                      src={post.coverImage} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] to-transparent opacity-60"></div>
                  </div>
                ) : (
                  <div className="aspect-[16/9] w-full bg-slate-800 flex items-center justify-center">
                    <span className="text-slate-600">Görsel Yok</span>
                  </div>
                )}
                
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readingTime} dk okuma
                    </span>
                  </div>
                  
                  <h2 className="text-xl font-bold text-slate-100 mb-3 group-hover:text-blue-400 transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  
                  <p className="text-slate-400 text-sm mb-6 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="mt-auto flex items-center text-blue-400 font-medium text-sm group-hover:translate-x-1 transition-transform">
                    Devamını Oku <ArrowRight className="ml-2 w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      </div>
      <Footer />
    </>
  );
}
