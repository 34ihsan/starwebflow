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
      <div className="bg-white border border-slate-200/90 rounded-2xl p-8 text-center space-y-4 shadow-xl">
        <h1 className="text-xl font-black text-slate-900 font-['Outfit']">Geçersiz Bağlantı</h1>
        <p className="text-slate-600 text-sm font-medium">Şifre sıfırlama bağlantısı eksik veya geçersiz.</p>
        <Link href="/auth/forgot-password">
          <Button variant="primary" className="mt-4 font-bold">Yeni Bağlantı İste</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xl p-8 relative overflow-hidden">
      {/* Top Glow */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />

      {success ? (
        <div className="text-center space-y-6 py-4 animate-in fade-in duration-300">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 mb-2 font-['Outfit']">Şifreniz Yenilendi!</h1>
            <p className="text-slate-600 text-sm leading-relaxed">
              Şifreniz başarıyla güncellendi. Yeni şifrenizle giriş yapabilirsiniz.
            </p>
          </div>
          <div className="pt-4">
            <Link href="/auth/login">
              <Button variant="primary" className="w-full justify-center font-bold">
                Giriş Yap
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-slate-900 mb-2 font-['Outfit']">Yeni Şifre Belirleyin</h1>
            <p className="text-slate-600 text-sm font-medium">Lütfen hesabınız için yeni şifrenizi girin.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Yeni Şifre</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Yeni Şifre (Tekrar)</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button 
                variant="primary" 
                size="lg" 
                className="w-full justify-center group font-bold shadow-md shadow-blue-500/10"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    Şifreyi Kaydet
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform ml-2" />
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
    <div className="min-h-screen bg-[#FAFBFD] flex flex-col relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-100/50 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-100/50 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="absolute top-0 inset-x-0 h-20 flex items-center px-8 z-50">
        <Link href="/" className="flex items-center gap-2 group">
          {settings?.logoUrl || settings?.preferences?.branding?.logoUrl ? (
            <img 
              src={
                settings?.logoUrl 
                  ? (settings.logoUrl.startsWith('http') || settings.logoUrl.startsWith('/') || settings.logoUrl.startsWith('data:') ? settings.logoUrl : `/${settings.logoUrl}`)
                  : settings?.preferences?.branding?.logoUrl
              } 
              alt="Logo" 
              className="h-10 object-contain bg-white rounded-lg p-1 border border-slate-200" 
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-xs">
              <Zap className="w-4 h-4 text-white" fill="white" />
            </div>
          )}
          <span className="font-black text-xl tracking-tight text-slate-900 font-['Outfit']">
            {settings?.companyName ? (
              <>{settings.companyName}</>
            ) : (
              <>Star<span className="text-blue-600">WebFlow</span></>
            )}
          </span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 z-10 pt-20 pb-10">
        <div className="w-full max-w-md">
          <Suspense fallback={
            <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xl p-8 text-center space-y-4">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
              <p className="text-slate-600 text-sm font-medium">Yükleniyor...</p>
            </div>
          }>
            <ResetPasswordContent />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
