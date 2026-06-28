'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error('Global Error caught:', error);
  }, [error]);

  return (
    <html lang="tr">
      <body className="bg-[#05050A] text-white flex items-center justify-center min-h-screen">
        <div className="bg-[#0A0A0F] border border-white/10 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-red-500/20 blur-[60px] rounded-full pointer-events-none" />

          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20 text-red-400">
            <AlertTriangle className="w-8 h-8" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-3">Sistemsel Bir Hata Oluştu</h1>
          <p className="text-[#94A3B8] text-sm mb-8">
            Beklenmeyen bir hata nedeniyle işlem tamamlanamadı. 
            Lütfen sayfayı yenileyerek tekrar deneyin. Sorun devam ederse teknik destek ile iletişime geçin.
          </p>
          
          <div className="flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 px-5 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors font-medium text-sm flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              Sayfayı Yenile
            </button>
            <button
              onClick={() => reset()}
              className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white hover:opacity-90 transition-opacity font-medium text-sm shadow-[0_0_20px_rgba(239,68,68,0.3)]"
            >
              Kurtarmayı Dene
            </button>
          </div>

          {process.env.NODE_ENV !== 'production' && (
            <div className="mt-6 text-left bg-black/50 p-4 rounded-xl border border-white/5 overflow-auto max-h-40">
              <p className="text-xs text-red-400 font-mono break-words">{error.message}</p>
            </div>
          )}
        </div>
      </body>
    </html>
  );
}
