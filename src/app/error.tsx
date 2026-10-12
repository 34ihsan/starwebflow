'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Page Error caught:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[70vh] p-4 w-full bg-[#FAFBFD]">
      <div className="bg-white border border-slate-200/90 p-8 rounded-3xl max-w-md w-full text-center shadow-xl relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-rose-100/60 blur-[60px] rounded-full pointer-events-none" />

        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-200 text-rose-600">
          <AlertTriangle className="w-8 h-8" />
        </div>
        
        <h2 className="text-xl font-black text-slate-900 mb-3 font-['Outfit']">Bir Şeyler Ters Gitti</h2>
        <p className="text-slate-600 text-sm mb-8 leading-relaxed">
          Bu sayfayı yüklerken beklenmeyen bir hata oluştu. Sorun geçici olabilir, 
          lütfen tekrar deneyin.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <RefreshCcw className="w-4 h-4" />
            Tekrar Dene
          </button>
          <Link
            href="/"
            className="flex-1 px-5 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4" />
            Ana Sayfa
          </Link>
        </div>

        {process.env.NODE_ENV !== 'production' && (
          <div className="mt-6 text-left bg-slate-50 p-4 rounded-xl border border-slate-200 overflow-auto max-h-40">
            <p className="text-xs text-rose-600 font-mono break-words">{error.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
