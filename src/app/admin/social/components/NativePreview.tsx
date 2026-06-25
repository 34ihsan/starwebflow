import React from 'react';
import { Share2, Heart, MessageCircle, Repeat2, Bookmark, MoreHorizontal, Send } from 'lucide-react';

interface NativePreviewProps {
  platform: string;
  content: string;
  image?: string | null;
  authorName?: string;
  authorHandle?: string;
  authorAvatar?: string;
}

export function NativePreview({ 
  platform, 
  content, 
  image, 
  authorName = "StarWebFlow", 
  authorHandle = "@starwebflow",
  authorAvatar = "https://ui-avatars.com/api/?name=SWF&background=9A82FB&color=fff"
}: NativePreviewProps) {
  
  if (platform === 'linkedin') {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden text-left max-w-lg mx-auto">
        <div className="p-4 flex items-center gap-3">
          <img src={authorAvatar} alt="avatar" className="w-12 h-12 rounded-full object-cover" />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 text-sm">{authorName}</h4>
            <p className="text-gray-500 text-xs">Dijital Çözümler & AI Ajansı</p>
            <p className="text-gray-400 text-xs flex items-center gap-1">Şimdi • 🌐</p>
          </div>
          <button className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors"><MoreHorizontal className="w-5 h-5" /></button>
        </div>
        <div className="px-4 pb-3">
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{content}</p>
        </div>
        {image && (
          <div className="w-full">
            <img src={image} alt="Post content" className="w-full h-auto object-cover max-h-96" />
          </div>
        )}
        <div className="px-4 py-2 flex items-center justify-between border-t border-gray-100">
          <div className="flex items-center text-xs text-gray-500 gap-1">
            <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white"><span className="text-[10px]">👍</span></span>
            <span>24</span>
          </div>
        </div>
        <div className="px-2 py-1 flex justify-between border-t border-gray-100">
          <button className="flex-1 flex items-center justify-center gap-2 text-gray-500 hover:bg-gray-100 py-3 rounded-lg text-sm font-semibold transition-colors">
            <span className="text-lg">👍</span> Beğen
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 text-gray-500 hover:bg-gray-100 py-3 rounded-lg text-sm font-semibold transition-colors">
            <MessageCircle className="w-5 h-5" /> Yorum Yap
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 text-gray-500 hover:bg-gray-100 py-3 rounded-lg text-sm font-semibold transition-colors">
            <Share2 className="w-5 h-5" /> Paylaş
          </button>
        </div>
      </div>
    );
  }

  if (platform === 'instagram') {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden text-left max-w-sm mx-auto">
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-fuchsia-600 p-[2px]">
              <div className="bg-white rounded-full p-[2px]">
                <img src={authorAvatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
              </div>
            </div>
            <h4 className="font-semibold text-gray-900 text-sm">{authorHandle.replace('@', '')}</h4>
          </div>
          <button className="text-gray-900"><MoreHorizontal className="w-5 h-5" /></button>
        </div>
        {image ? (
          <div className="w-full aspect-square bg-gray-100">
            <img src={image} alt="Post content" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full aspect-square bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center p-6">
            <p className="text-white font-bold text-center text-xl">{content.substring(0, 100)}...</p>
          </div>
        )}
        <div className="p-3">
          <div className="flex justify-between items-center mb-3">
            <div className="flex gap-4">
              <Heart className="w-6 h-6 text-gray-900" />
              <MessageCircle className="w-6 h-6 text-gray-900" />
              <Send className="w-6 h-6 text-gray-900" />
            </div>
            <Bookmark className="w-6 h-6 text-gray-900" />
          </div>
          <p className="font-semibold text-gray-900 text-sm mb-1">1,024 beğenme</p>
          <p className="text-sm text-gray-800">
            <span className="font-semibold mr-2">{authorHandle.replace('@', '')}</span>
            {content.length > 120 ? content.substring(0, 120) + '...' : content}
            {content.length > 120 && <span className="text-gray-500 ml-1 cursor-pointer">devamı</span>}
          </p>
        </div>
      </div>
    );
  }

  if (platform === 'twitter') {
    return (
      <div className="bg-black rounded-xl border border-gray-800 overflow-hidden text-left max-w-lg mx-auto p-4">
        <div className="flex gap-3">
          <img src={authorAvatar} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
          <div className="flex-1">
            <div className="flex items-center gap-1 mb-1">
              <h4 className="font-bold text-white text-sm hover:underline cursor-pointer">{authorName}</h4>
              <span className="text-gray-500 text-sm">{authorHandle} · 2s</span>
            </div>
            <p className="text-sm text-white whitespace-pre-wrap mb-3">{content}</p>
            {image && (
              <div className="rounded-2xl overflow-hidden border border-gray-800 mb-3">
                <img src={image} alt="Tweet media" className="w-full h-auto max-h-80 object-cover" />
              </div>
            )}
            <div className="flex justify-between text-gray-500 pr-12">
              <div className="flex items-center gap-2 hover:text-blue-400 cursor-pointer transition-colors group">
                <div className="p-2 rounded-full group-hover:bg-blue-400/10"><MessageCircle className="w-4 h-4" /></div>
                <span className="text-xs">12</span>
              </div>
              <div className="flex items-center gap-2 hover:text-green-400 cursor-pointer transition-colors group">
                <div className="p-2 rounded-full group-hover:bg-green-400/10"><Repeat2 className="w-4 h-4" /></div>
                <span className="text-xs">4</span>
              </div>
              <div className="flex items-center gap-2 hover:text-pink-600 cursor-pointer transition-colors group">
                <div className="p-2 rounded-full group-hover:bg-pink-600/10"><Heart className="w-4 h-4" /></div>
                <span className="text-xs">89</span>
              </div>
              <div className="flex items-center gap-2 hover:text-blue-400 cursor-pointer transition-colors group">
                <div className="p-2 rounded-full group-hover:bg-blue-400/10"><Share2 className="w-4 h-4" /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback / Basic Preview
  return (
    <div className="bg-[#111118] rounded-xl border border-white/10 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img src={authorAvatar} className="w-10 h-10 rounded-full" alt="Avatar" />
          <div>
            <div className="font-semibold text-white text-sm">{authorName}</div>
            <div className="text-zinc-500 text-xs uppercase">{platform}</div>
          </div>
        </div>
      </div>
      <div className="text-zinc-300 text-sm whitespace-pre-wrap mb-4">{content}</div>
      {image && <img src={image} alt="Media" className="rounded-lg w-full max-h-64 object-cover" />}
    </div>
  );
}
