'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Zap, Loader2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useSettings } from '@/lib/settings/SettingsContext';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Doğrulama bağlantısı geçersiz veya eksik.');
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch(`/api/v1/auth/verify?token=${token}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMessage(data.error || 'Doğrulama işlemi başarısız oldu.');
        }
      } catch (err) {
        setStatus('error');
        setErrorMessage('Sunucuyla bağlantı kurulamadı.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl shadow-2xl p-8 relative overflow-hidden">
      {/* Top Glow */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#8B5CF6] to-[#4F8EF7]" />

      {status === 'loading' && (
        <div className="text-center py-8 space-y-4">
          <Loader2 className="w-10 h-10 text-[#8B5CF6] animate-spin mx-auto" />
          <h1 className="text-xl font-bold text-white font-['Outfit']">E-posta Hesabınız Doğrulanıyor</h1>
          <p className="text-slate-400 text-sm">Lütfen bekleyin, işleminiz gerçekleştiriliyor...</p>
        </div>
      )}

      {status === 'success' && (
        <div className="text-center py-6 space-y-6 animate-in fade-in duration-300">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-2 font-['Outfit']">Doğrulama Başarılı!</h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              E-posta adresiniz başarıyla doğrulandı. Artık hesabınıza giriş yapabilirsiniz.
            </p>
          </div>
          <div className="pt-4">
            <Link href="/auth/login">
              <Button variant="primary" className="w-full justify-center group">
                Giriş Yap
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center py-6 space-y-6 animate-in fade-in duration-300">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-2 font-['Outfit']">Doğrulama Başarısız</h1>
            <p className="text-slate-350 text-sm leading-relaxed">
              {errorMessage}
            </p>
          </div>
          <div className="pt-4 flex flex-col gap-2">
            <Link href="/auth/register">
              <Button variant="primary" className="w-full justify-center">
                Tekrar Kaydol
              </Button>
            </Link>
            <Link href="/auth/login" className="text-sm text-slate-400 hover:text-white transition-colors mt-2">
              Giriş Sayfasına Dön
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
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
            <VerifyEmailContent />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
