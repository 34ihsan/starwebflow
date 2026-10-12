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
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xl p-8 relative overflow-hidden">
      {/* Top Glow */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />

      {status === 'loading' && (
        <div className="text-center py-8 space-y-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
          <h1 className="text-xl font-black text-slate-900 font-['Outfit']">E-posta Hesabınız Doğrulanıyor</h1>
          <p className="text-slate-600 text-sm font-medium">Lütfen bekleyin, işleminiz gerçekleştiriliyor...</p>
        </div>
      )}

      {status === 'success' && (
        <div className="text-center py-6 space-y-6 animate-in fade-in duration-300">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 mb-2 font-['Outfit']">Doğrulama Başarılı!</h1>
            <p className="text-slate-600 text-sm leading-relaxed">
              E-posta adresiniz başarıyla doğrulandı. Artık hesabınıza giriş yapabilirsiniz.
            </p>
          </div>
          <div className="pt-4">
            <Link href="/auth/login">
              <Button variant="primary" className="w-full justify-center group font-bold shadow-md shadow-blue-500/10">
                Giriş Yap
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center py-6 space-y-6 animate-in fade-in duration-300">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto border border-rose-200">
            <XCircle className="w-8 h-8 text-rose-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 mb-2 font-['Outfit']">Doğrulama Başarısız</h1>
            <p className="text-slate-600 text-sm leading-relaxed">
              {errorMessage}
            </p>
          </div>
          <div className="pt-4 flex flex-col gap-2">
            <Link href="/auth/register">
              <Button variant="primary" className="w-full justify-center font-bold">
                Tekrar Kaydol
              </Button>
            </Link>
            <Link href="/auth/login" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mt-2">
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
            <VerifyEmailContent />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
