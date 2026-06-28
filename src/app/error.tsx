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
    <div className="flex items-center justify-center min-h-[70vh] p-4 w-full">
      <div className="bg-[#0A0A0F] border border-white/10 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-red-500/20 blur-[60px] rounded-full pointer-events-none" />

        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20 text-red-400">
          <AlertTriangle className="w-8 h-8" />
        </div>
        
        <h2 className="text-xl font-bold text-white mb-3">Bir Şeyler Ters Gitti</h2>
        <p className="text-[#94A3B8] text-sm mb-8">
          Bu sayfayı yüklerken beklenmeyen bir hata oluştu. Sorun geçici olabilir, 
          lütfen tekrar deneyin.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-[#4F8EF7] to-purple-600 text-white hover:opacity-90 transition-opacity font-medium text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(79,142,247,0.3)]"
          >
            <RefreshCcw className="w-4 h-4" />
            Tekrar Dene
          </button>
          <Link
            href="/admin"
            className="flex-1 px-5 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors font-medium text-sm flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Ana Sayfa
          </Link>
        </div>

        {process.env.NODE_ENV !== 'production' && (
          <div className="mt-6 text-left bg-black/50 p-4 rounded-xl border border-white/5 overflow-auto max-h-40">
            <p className="text-xs text-red-400 font-mono break-words">{error.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
