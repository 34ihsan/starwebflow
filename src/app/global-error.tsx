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
      <body className="bg-[#FAFBFD] text-slate-900 flex items-center justify-center min-h-screen">
        <div className="bg-white border border-slate-200/90 p-8 rounded-3xl max-w-md w-full text-center shadow-xl relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-rose-100/60 blur-[60px] rounded-full pointer-events-none" />

          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-200 text-rose-600">
            <AlertTriangle className="w-8 h-8" />
          </div>
          
          <h1 className="text-2xl font-black text-slate-900 mb-3 font-['Outfit']">Sistemsel Bir Hata Oluştu</h1>
          <p className="text-slate-600 text-sm mb-8 leading-relaxed">
            Beklenmeyen bir hata nedeniyle işlem tamamlanamadı. 
            Lütfen sayfayı yenileyerek tekrar deneyin. Sorun devam ederse teknik destek ile iletişime geçin.
          </p>
          
          <div className="flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 px-5 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
              Sayfayı Yenile
            </button>
            <button
              onClick={() => reset()}
              className="flex-1 px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-sm transition-all"
            >
              Kurtarmayı Dene
            </button>
          </div>

          {process.env.NODE_ENV !== 'production' && (
            <div className="mt-6 text-left bg-slate-50 p-4 rounded-xl border border-slate-200 overflow-auto max-h-40">
              <p className="text-xs text-rose-600 font-mono break-words">{error.message}</p>
            </div>
          )}
        </div>
      </body>
    </html>
  );
}
