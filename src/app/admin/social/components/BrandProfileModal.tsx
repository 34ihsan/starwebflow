'use client';

import { useState, useEffect } from 'react';
import { getBrandProfile, updateBrandProfile } from '@/app/actions/social';
import { X, Save, Sparkles } from 'lucide-react';

export function BrandProfileModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [tone, setTone] = useState('Profesyonel');
  const [audience, setAudience] = useState('B2B ve KOBİler');
  const [forbidden, setForbidden] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadProfile();
    }
  }, [isOpen]);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const res = await getBrandProfile();
      if (res.success && res.data) {
        setTone(res.data.tone || 'Profesyonel');
        setAudience(res.data.targetAudience || 'B2B ve KOBİler');
        setForbidden(res.data.forbiddenWords?.join(', ') || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const words = forbidden.split(',').map(w => w.trim()).filter(Boolean);
      await updateBrandProfile({ tone, targetAudience: audience, forbiddenWords: words });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-[#9A82FB]/20 blur-[100px] pointer-events-none" />
        
        <div className="flex justify-between items-center mb-6 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#9A82FB]/20 to-[#8A71EB]/20 border border-[#9A82FB]/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#9A82FB]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Marka Sesi Profili</h3>
              <p className="text-sm text-zinc-400">Yapay zekanın sizi daha iyi anlamasını sağlayın.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8"><Sparkles className="w-6 h-6 animate-pulse text-[#9A82FB]" /></div>
        ) : (
          <div className="space-y-5 relative">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Marka Ses Tonu</label>
              <input 
                type="text" 
                value={tone}
                onChange={e => setTone(e.target.value)}
                placeholder="Örn: Samimi, Bilgilendirici, Resmi"
                className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#9A82FB] focus:ring-1 focus:ring-[#9A82FB] transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Hedef Kitle</label>
              <input 
                type="text" 
                value={audience}
                onChange={e => setAudience(e.target.value)}
                placeholder="Örn: Girişimciler, Yazılımcılar, Yöneticiler"
                className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#9A82FB] focus:ring-1 focus:ring-[#9A82FB] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Yasaklı Kelimeler (Virgülle ayırın)</label>
              <textarea 
                value={forbidden}
                onChange={e => setForbidden(e.target.value)}
                rows={3}
                placeholder="Örn: Müşteri, Ucuz, Basit, Yapay Zeka"
                className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#9A82FB] focus:ring-1 focus:ring-[#9A82FB] transition-all resize-none"
              />
              <p className="text-xs text-zinc-500 mt-2">AI içerik üretirken bu kelimeleri kesinlikle kullanmayacaktır.</p>
            </div>

            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-[#9A82FB] hover:bg-[#8A71EB] text-white px-4 py-3 rounded-xl font-medium transition-all disabled:opacity-50"
            >
              {isSaving ? <Sparkles className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isSaving ? "Kaydediliyor..." : "Profili Kaydet"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
