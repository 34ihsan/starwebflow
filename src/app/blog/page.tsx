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

export const revalidate = 3600; // Cache blog index for 1 hour with ISR

export default async function BlogIndexPage() {
  const posts = await prisma.blogPost.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
  });

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FAFBFD] text-slate-900 pt-32 pb-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 font-['Outfit'] text-slate-900">
            İçgörüler ve <span className="text-blue-600">Yenilikler</span>
          </h1>
          <p className="text-lg text-slate-600">
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
              <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all shadow-sm hover:shadow-md">
                {post.coverImage ? (
                  <div className="aspect-[16/9] w-full overflow-hidden relative">
                    <img 
                      src={post.coverImage} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/9] w-full bg-slate-100 flex items-center justify-center">
                    <span className="text-slate-400 font-medium">Görsel Yok</span>
                  </div>
                )}
                
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-4 font-medium">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readingTime} dk okuma
                    </span>
                  </div>
                  
                  <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  
                  <p className="text-slate-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                  
                  <div className="mt-auto flex items-center text-blue-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
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
