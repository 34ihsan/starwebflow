'use client';

import React, { useState } from 'react';
import { generateAIBlog, updateBlogPost, deleteBlogPost, repurposeBlogToSocial, suggestBlogIdeas } from '@/app/actions/blog';
import { FileText, Plus, Trash2, Edit3, CheckCircle, Share2, Eye, X, Lightbulb, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function BlogDashboardClient({ initialData }: { initialData: any[] }) {
  const [posts, setPosts] = useState(initialData);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'PUBLISHED'>('PENDING');
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [includePAA, setIncludePAA] = useState(true);
  const [authorName, setAuthorName] = useState('');
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  
  const [ideas, setIdeas] = useState<any[]>([]);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', content: '', coverImage: '' });

  const pendingPosts = posts.filter(p => p.status === 'PENDING_APPROVAL');
  const publishedPosts = posts.filter(p => p.status === 'PUBLISHED');

  const handleGenerate = async () => {
    if (!topic) return alert('Lütfen konu girin');
    setIsGenerating(true);
    try {
      const res = await generateAIBlog(topic, keywords, includePAA, authorName);
      if (res?.success && res?.data) {
        setPosts([res.data, ...posts]);
        setTopic('');
        setKeywords('');
        alert('Blog yazısı üretildi ve onaya sunuldu!');
      } else {
        alert('Hata: ' + (res?.error || 'Ağ hatası veya sunucu zaman aşımı.'));
      }
    } catch (e: any) {
      alert('Sunucuyla bağlantı koptu veya zaman aşımına uğradı. Lütfen sayfayı yenileyip tekrar deneyin.');
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGetIdeas = async () => {
    setIsGeneratingIdeas(true);
    try {
      const res = await suggestBlogIdeas();
      if (res?.success && res?.data) {
        setIdeas(res.data);
      } else {
        alert('Fikirler alınırken hata oluştu: ' + (res?.error || 'Ağ hatası veya sunucu zaman aşımı.'));
      }
    } catch (e: any) {
      alert('Sunucuyla bağlantı koptu veya zaman aşımına uğradı. Lütfen sayfayı yenileyip tekrar deneyin.');
      console.error(e);
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const handleUseIdea = (idea: any) => {
    setTopic(idea.topic);
    setKeywords(idea.keywords);
  };

  const handlePublish = async (id: string) => {
    const res = await updateBlogPost(id, { status: 'PUBLISHED', publishedAt: new Date() });
    if (res.success && res.data) {
      setPosts(posts.map(p => p.id === id ? res.data : p));
      setSelectedPost(null);
    }
  };

  const openEdit = (post: any) => {
    setEditForm({ title: post.title, content: post.content, coverImage: post.coverImage || '' });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedPost) return;
    const res = await updateBlogPost(selectedPost.id, { 
      title: editForm.title, 
      content: editForm.content,
      coverImage: editForm.coverImage
    });
    if (res.success && res.data) {
      setPosts(posts.map(p => p.id === selectedPost.id ? res.data : p));
      setSelectedPost(res.data);
      setIsEditing(false);
      alert('Değişiklikler kaydedildi!');
    } else {
      alert('Hata: ' + res.error);
    }
  };

  const handleAddImageToContent = () => {
    const url = prompt('Eklemek istediğiniz görselin URL\'sini girin (Örn: Unsplash linki):');
    if (url) {
      const imgMarkdown = `\n\n![Görsel](${url})\n\n`;
      setEditForm(prev => ({ ...prev, content: prev.content + imgMarkdown }));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Emin misiniz?')) return;
    const res = await deleteBlogPost(id);
    if (res.success) {
      setPosts(posts.filter(p => p.id !== id));
      setSelectedPost(null);
    }
  };

  const handleRepurpose = async (id: string) => {
    if (!confirm('Bu blogdan Twitter Thread ve LinkedIn Post üretmek istediğinize emin misiniz?')) return;
    const res = await repurposeBlogToSocial(id);
    if (res.success) {
      alert(`Sosyal medya içerikleri üretildi ve onaya gönderildi! (${res.createdCount} adet)`);
    } else {
      alert('Hata: ' + res.error);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileText className="text-blue-600" />
            AI Blog Motoru
          </h1>
          <p className="text-slate-500 mt-1">Siteniz için SEO uyumlu makaleler üretin, yayınlayın ve sosyal medyaya dönüştürün.</p>
        </div>
      </div>

      {/* GENERATE FORM */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-green-500" /> Yeni Blog Üret
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Odak Konu / Başlık</label>
            <input 
              type="text" 
              value={topic} 
              onChange={e => setTopic(e.target.value)} 
              placeholder="Örn: B2B Pazarlamada SEO'nun Önemi"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Anahtar Kelimeler (Virgülle ayırın)</label>
            <input 
              type="text" 
              value={keywords} 
              onChange={e => setKeywords(e.target.value)} 
              placeholder="Örn: b2b, seo, dijital pazarlama"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Yazar İsmi (Opsiyonel)</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                value={authorName} 
                onChange={e => setAuthorName(e.target.value)} 
                placeholder="Örn: Sinan (Varsayılan: StarWebFlow Ekibi)"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>
        <div className="mb-4 flex items-center gap-2">
          <input 
            type="checkbox" 
            id="includePAA" 
            checked={includePAA} 
            onChange={e => setIncludePAA(e.target.checked)} 
            className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
          />
          <label htmlFor="includePAA" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
            Google "Bunu da Sordular" (PAA) sorularını bul ve makaleye entegre et
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !topic}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isGenerating ? 'Yazılıyor... (Yaklaşık 10-15 sn)' : 'AI İle Makale Üret'}
          </button>
          <button 
            onClick={handleGetIdeas}
            disabled={isGeneratingIdeas}
            className="flex items-center gap-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900/40 dark:hover:bg-indigo-900/60 dark:text-indigo-300 px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <Lightbulb className="w-5 h-5" />
            {isGeneratingIdeas ? 'Fikirler Düşünülüyor...' : 'AI Blog Fikirleri Öner'}
          </button>
        </div>

        {ideas.length > 0 && (
          <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
            <h3 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" /> AI Tarafından Önerilen Harika Konular
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ideas.map((idea, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-indigo-100 dark:border-indigo-700 flex flex-col justify-between">
                  <div>
                    <h4 className="font-medium text-slate-800 dark:text-slate-200 text-sm mb-1">{idea.topic}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{idea.description}</p>
                    <div className="text-[10px] uppercase text-indigo-500 font-semibold mb-3">{idea.keywords}</div>
                  </div>
                  <button 
                    onClick={() => handleUseIdea(idea)}
                    className="w-full py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
                  >
                    Bu Fikri Kullan
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* TABS */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        <button 
          className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'PENDING' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          onClick={() => setActiveTab('PENDING')}
        >
          Onay Bekleyenler ({pendingPosts.length})
        </button>
        <button 
          className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'PUBLISHED' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          onClick={() => setActiveTab('PUBLISHED')}
        >
          Yayınlananlar ({publishedPosts.length})
        </button>
      </div>

      {/* LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(activeTab === 'PENDING' ? pendingPosts : publishedPosts).map(post => (
          <div key={post.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
            {post.coverImage && (
              <img src={post.coverImage} alt="Cover" className="w-full h-40 object-cover" />
            )}
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{post.title}</h3>
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 mb-3">
                <User className="w-3.5 h-3.5" />
                <span>{post.authorName || 'StarWebFlow Ekibi'}</span>
                <span className="text-slate-300 dark:text-slate-600 mx-1">•</span>
                <span>{post.readingTime} dk okuma</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
              
              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                <button 
                  onClick={() => setSelectedPost(post)}
                  className="flex-1 flex justify-center items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  <Eye className="w-4 h-4" /> İncele
                </button>
                {activeTab === 'PUBLISHED' && (
                  <button 
                    onClick={() => handleRepurpose(post.id)}
                    title="Sosyal Medyaya Çevir (Twitter & LinkedIn)"
                    className="flex justify-center items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(post.id)}
                  className="flex justify-center items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {(activeTab === 'PENDING' ? pendingPosts : publishedPosts).length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            Kayıt bulunamadı.
          </div>
        )}
      </div>

      {/* MODAL */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
              {isEditing ? (
                <input 
                  type="text" 
                  value={editForm.title} 
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })} 
                  className="w-full text-2xl font-bold bg-transparent border-b border-slate-300 dark:border-slate-700 focus:outline-none text-slate-800 dark:text-slate-100"
                />
              ) : (
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{selectedPost.title}</h2>
              )}
              <button onClick={() => { setSelectedPost(null); setIsEditing(false); }} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 ml-4">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kapak Görseli URL'si</label>
                    <input 
                      type="text" 
                      value={editForm.coverImage} 
                      onChange={e => setEditForm({ ...editForm, coverImage: e.target.value })} 
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">İçerik (Markdown)</label>
                      <button onClick={handleAddImageToContent} className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                        + İçeriğe Görsel (URL) Ekle
                      </button>
                    </div>
                    <textarea 
                      value={editForm.content} 
                      onChange={e => setEditForm({ ...editForm, content: e.target.value })} 
                      rows={15}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent text-slate-900 dark:text-slate-100 font-mono text-sm resize-y"
                    />
                  </div>
                </div>
              ) : (
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <ReactMarkdown>{selectedPost.content}</ReactMarkdown>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 flex-wrap">
              {isEditing ? (
                <>
                  <button onClick={() => setIsEditing(false)} className="px-5 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
                    İptal
                  </button>
                  <button onClick={handleSaveEdit} className="px-5 py-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                    Kaydet
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => openEdit(selectedPost)} className="flex items-center gap-2 px-5 py-2 rounded-lg font-medium bg-amber-500 hover:bg-amber-600 text-white transition-colors">
                    <Edit3 className="w-5 h-5" /> Düzenle
                  </button>
                  {selectedPost.status === 'PENDING_APPROVAL' && (
                    <button onClick={() => handlePublish(selectedPost.id)} className="flex items-center gap-2 px-5 py-2 rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white transition-colors">
                      <CheckCircle className="w-5 h-5" /> Onayla ve Yayınla
                    </button>
                  )}
                  {selectedPost.status === 'PUBLISHED' && (
                    <button onClick={() => handleRepurpose(selectedPost.id)} className="flex items-center gap-2 px-5 py-2 rounded-lg font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">
                      <Share2 className="w-5 h-5" /> Sosyal Medya Çıktısı Al
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
