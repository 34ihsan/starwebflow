'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Zap, ArrowRight, Lock, Mail, User, Loader2, CheckCircle2, Info } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useSettings } from '@/lib/settings/SettingsContext'
import { useRecaptcha } from '@/hooks/useRecaptcha'

export default function RegisterPage() {
  const { settings } = useSettings()
  const { getToken } = useRecaptcha()
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [hpCheck, setHpCheck] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    let recaptchaToken: string | undefined;
    try {
      recaptchaToken = await getToken('register');
    } catch (err) {
      console.error('reCAPTCHA error:', err);
    }
    
    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, recaptchaToken, hp_check: hpCheck }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setRegistered(true);
      } else {
        alert(result.error || 'Kayıt başarısız oldu.');
        setLoading(false);
      }
    } catch (error) {
      alert('Sunucuya bağlanılamadı.');
      setLoading(false);
    }
  }

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

      {/* Main Form */}
      <main className="flex-1 flex items-center justify-center p-4 z-10 pt-20 pb-10">
        <div className="w-full max-w-md">
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xl p-8 relative overflow-hidden">
            {/* Top Glow */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
            
            {registered ? (
              <div className="text-center space-y-6 py-4 animate-in fade-in duration-300">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 mb-2 font-['Outfit']">Kayıt Başarılı!</h1>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Hesabınızı aktifleştirmek için <strong className="text-slate-900">{email}</strong> adresine bir doğrulama e-postası gönderdik.
                  </p>
                  <p className="text-slate-500 text-xs mt-2">
                    Lütfen gelen kutunuzu (ve spam klasörünü) kontrol edin.
                  </p>
                </div>

                <div className="pt-4">
                  <Link href="/auth/login">
                    <Button variant="primary" className="w-full justify-center font-bold">
                      Giriş Yap Sayfasına Git
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-black text-slate-900 mb-2 font-['Outfit']">Müşteri Hesabı Oluşturun</h1>
                  <p className="text-slate-600 text-sm font-medium">Projelerinizi ve sözleşmelerinizi takip etmek için hesap açın.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-5">
                  {/* Honeypot field for bot protection */}
                  <div style={{ display: 'none', position: 'absolute', left: '-9999px' }} aria-hidden="true">
                    <label htmlFor="hp_check">Leave empty</label>
                    <input
                      id="hp_check"
                      type="text"
                      name="hp_check"
                      value={hpCheck}
                      onChange={(e) => setHpCheck(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ad Soyad</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                        placeholder="Adınız Soyadınız"
                      />
                    </div>
                  </div>

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
                          Kayıt Ol
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                <div className="mt-8 text-center text-sm text-slate-500 font-medium">
                  Zaten bir hesabınız var mı?{' '}
                  <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 transition-colors font-bold">
                    Giriş Yapın
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
