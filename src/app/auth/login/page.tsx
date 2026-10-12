'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Zap, ArrowRight, Lock, Mail, Loader2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useSettings } from '@/lib/settings/SettingsContext'
import { useRecaptcha } from '@/hooks/useRecaptcha'

export default function LoginPage() {
  const { settings } = useSettings()
  const { getToken } = useRecaptcha()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginMode, setLoginMode] = useState<'password' | 'magic'>('password')
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    let recaptchaToken: string | undefined;
    try {
      recaptchaToken = await getToken('login');
    } catch (err) {
      console.error('reCAPTCHA error:', err);
    }
    
    try {
      if (loginMode === 'magic') {
        const response = await fetch('/api/auth/magic-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, recaptchaToken }),
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
          setMagicLinkSent(true);
        } else {
          setError(result.error || 'Bağlantı gönderilemedi.');
        }
      } else {
        const response = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, recaptchaToken }),
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
          // Redirect based on role returned from the API
          const role = result.data.role;
          if (['SUPER_ADMIN', 'AGENCY_OWNER', 'AGENCY_MEMBER'].includes(role)) {
            window.location.href = '/admin';
          } else {
            window.location.href = '/client';
          }
        } else {
          setError(result.error?.message || 'Giriş başarısız oldu.');
        }
      }
    } catch (err) {
      setError('Sunucuya bağlanılamadı.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFBFD] flex flex-col relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-100/50 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-100/50 blur-[120px] rounded-full pointer-events-none" />

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

      {/* Main Form */}
      <main className="flex-1 flex items-center justify-center p-4 z-10 pt-20 pb-10">
        <div className="w-full max-w-md">
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xl p-8 relative overflow-hidden">
            {/* Top Glow */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
            
            <div className="text-center mb-8">
              <h1 className="text-2xl font-black text-slate-900 mb-2 font-['Outfit']">Sisteme Giriş Yapın</h1>
              <p className="text-slate-600 text-sm font-medium">StarWebFlow portalına hoş geldiniz.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center gap-2">
                <span className="shrink-0">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="flex bg-slate-100 rounded-xl p-1 mb-6 border border-slate-200">
              <button
                type="button"
                onClick={() => setLoginMode('password')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${loginMode === 'password' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Şifre ile
              </button>
              <button
                type="button"
                onClick={() => setLoginMode('magic')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${loginMode === 'magic' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Sihirli Bağlantı
              </button>
            </div>

            {magicLinkSent ? (
              <div className="text-center py-6 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-slate-900 font-bold mb-1">E-posta Gönderildi!</h3>
                <p className="text-sm text-slate-600 px-4">Gelen kutunuzu kontrol edin. Gönderdiğimiz sihirli bağlantıya tıklayarak şifresiz giriş yapabilirsiniz.</p>
                <button type="button" onClick={() => setMagicLinkSent(false)} className="mt-4 text-xs font-semibold text-blue-600 hover:underline">Tekrar gönder</button>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">E-posta Adresi</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                      placeholder="ornek@sirket.com"
                    />
                  </div>
                </div>

                {loginMode === 'password' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Şifre</label>
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
                    <div className="flex justify-end mt-2">
                      <Link href="/auth/forgot-password" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">Şifremi Unuttum</Link>
                    </div>
                  </div>
                )}

                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-full justify-center group font-bold shadow-md shadow-blue-500/10"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      {loginMode === 'magic' ? 'Sihirli Bağlantı Gönder' : 'Giriş Yap'}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform ml-2" />
                    </>
                  )}
                </Button>
              </form>
            )}

            <div className="mt-8 text-center text-sm text-slate-500 font-medium">
              Henüz müşterimiz değil misiniz?{' '}
              <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 transition-colors font-bold">
                Müşteri Olun
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
