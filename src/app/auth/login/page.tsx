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
    <div className="min-h-screen bg-[#05050A] flex flex-col relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#8B5CF6]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#4F8EF7]/10 blur-[120px] rounded-full pointer-events-none" />

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
              className="h-10 object-contain bg-white rounded-lg p-1" 
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-[#8B5CF6] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" fill="white" />
            </div>
          )}
          <span className="font-black text-xl tracking-tight text-white font-['Outfit']">
            {settings?.companyName ? (
              <>{settings.companyName}</>
            ) : (
              <>Star<span className="text-[#8B5CF6]">WebFlow</span></>
            )}
          </span>
        </Link>
      </header>

      {/* Main Form */}
      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-md">
          <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl shadow-2xl p-8 relative overflow-hidden">
            {/* Top Glow */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#4F8EF7] to-[#8B5CF6]" />
            
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2 font-['Outfit']">Sisteme Giriş Yapın</h1>
              <p className="text-[#94A3B8] text-sm">StarWebFlow portalına hoş geldiniz.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-2">
                <span className="shrink-0">⚠️</span>
                <span>{error}</span>
              </div>
            )}

              <div className="flex bg-[#12121F] rounded-lg p-1 mb-6 border border-white/5">
                <button
                  type="button"
                  onClick={() => setLoginMode('password')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${loginMode === 'password' ? 'bg-[#8B5CF6] text-white shadow-lg' : 'text-[#94A3B8] hover:text-white'}`}
                >
                  Şifre ile
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMode('magic')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${loginMode === 'magic' ? 'bg-[#8B5CF6] text-white shadow-lg' : 'text-[#94A3B8] hover:text-white'}`}
                >
                  Sihirli Bağlantı
                </button>
              </div>

              {magicLinkSent ? (
                <div className="text-center py-6 bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 rounded-xl">
                  <div className="w-12 h-12 bg-[#8B5CF6]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mail className="w-6 h-6 text-[#8B5CF6]" />
                  </div>
                  <h3 className="text-white font-medium mb-1">E-posta Gönderildi!</h3>
                  <p className="text-sm text-[#94A3B8]">Gelen kutunuzu kontrol edin. Gönderdiğimiz sihirli bağlantıya tıklayarak şifresiz giriş yapabilirsiniz.</p>
                  <button type="button" onClick={() => setMagicLinkSent(false)} className="mt-4 text-xs text-[#8B5CF6] hover:underline">Tekrar gönder</button>
                </div>
              ) : (
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">E-posta Adresi</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#12121F] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
                        placeholder="ornek@sirket.com"
                      />
                    </div>
                  </div>

                  {loginMode === 'password' && (
                    <div>
                      <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Şifre</label>
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
                      <div className="flex justify-end mt-2">
                        <Link href="/auth/forgot-password" className="text-xs text-[#8B5CF6] hover:text-[#4F8EF7] transition-colors">Şifremi Unuttum</Link>
                      </div>
                    </div>
                  )}

                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="w-full justify-center group"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>
                        {loginMode === 'magic' ? 'Sihirli Bağlantı Gönder' : 'Giriş Yap'}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>

                  {/* Geçici Test Girişi - Daha sonra tamamen kaldırılacak */}
                  {loginMode === 'password' && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-center text-sm border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/10"
                        onClick={() => {
                          setEmail('client@starwebflow.com');
                          setPassword('client123');
                          // Küçük bir gecikmeyle formu gönder, React state güncellemelerinin yansımasını bekle
                          setTimeout(() => {
                            const form = document.querySelector('form');
                            if (form) form.requestSubmit();
                          }, 50);
                        }}
                      >
                        Müşteri Test Girişi (Geçici)
                      </Button>
                      <p className="text-center text-[10px] text-[#64748B] mt-2">Daha sonra kaldırılıp gerçek e-posta doğrulama sistemi aktif edilecektir.</p>
                    </div>
                  )}
                </form>
              )}

            <div className="mt-8 text-center text-sm text-[#64748B]">
              Henüz müşterimiz değil misiniz?{' '}
              <Link href="/auth/register" className="text-white hover:text-[#8B5CF6] transition-colors font-medium">
                Müşteri Olun
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
