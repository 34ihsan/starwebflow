'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Zap, Lock, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useSettings } from '@/lib/settings/SettingsContext';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      alert('Şifre sıfırlama tokeni geçersiz veya eksik.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Şifreler birbiriyle uyuşmuyor.');
      return;
    }

    if (password.length < 6) {
      alert('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
      } else {
        alert(data.error || 'Şifre sıfırlama işlemi başarısız oldu.');
        setLoading(false);
      }
    } catch (err) {
      alert('Sunucuyla bağlantı kurulamadı.');
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-8 text-center space-y-4">
        <h1 className="text-xl font-bold text-white font-['Outfit']">Geçersiz Bağlantı</h1>
        <p className="text-slate-400 text-sm">Şifre sıfırlama bağlantısı eksik veya geçersiz.</p>
        <Link href="/auth/forgot-password">
          <Button variant="primary" className="mt-4">Yeni Bağlantı İste</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl shadow-2xl p-8 relative overflow-hidden">
      {/* Top Glow */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#8B5CF6] to-[#4F8EF7]" />

      {success ? (
        <div className="text-center space-y-6 py-4 animate-in fade-in duration-300">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-2 font-['Outfit']">Şifreniz Yenilendi!</h1>
            <p className="text-slate-350 text-sm leading-relaxed">
              Şifreniz başarıyla güncellendi. Yeni şifrenizle giriş yapabilirsiniz.
            </p>
          </div>
          <div className="pt-4">
            <Link href="/auth/login">
              <Button variant="primary" className="w-full justify-center">
                Giriş Yap
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2 font-['Outfit']">Yeni Şifre Belirleyin</h1>
            <p className="text-[#94A3B8] text-sm">Lütfen hesabınız için yeni şifrenizi girin.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Yeni Şifre</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#12121F] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Yeni Şifre (Tekrar)</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                <input 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#12121F] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button 
                variant="primary" 
                size="lg" 
                className="w-full justify-center group"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    Şifreyi Kaydet
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  const { settings } = useSettings();
  return (
    <div className="min-h-screen bg-[#05050A] flex flex-col relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#4F8EF7]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#8B5CF6]/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="absolute top-0 inset-x-0 h-20 flex items-center px-8 z-50">
        <Link href="/" className="flex items-center gap-2 group">
          {settings?.preferences?.branding?.logoUrl ? (
            <img src={settings.preferences.branding.logoUrl} alt="Logo" className="h-8 object-contain" />
          ) : (
            <>
              <div className="w-8 h-8 rounded-lg bg-[#8B5CF6] flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" fill="white" />
              </div>
              <span className="font-black text-xl tracking-tight text-white font-['Outfit']">
                Star<span className="text-[#8B5CF6]">WebFlow</span>
              </span>
            </>
          )}
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 z-10 pt-20 pb-10">
        <div className="w-full max-w-md">
          <Suspense fallback={
            <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl shadow-2xl p-8 text-center space-y-4">
              <Loader2 className="w-10 h-10 text-[#8B5CF6] animate-spin mx-auto" />
              <p className="text-slate-400 text-sm">Yükleniyor...</p>
            </div>
          }>
            <ResetPasswordContent />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
