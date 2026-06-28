'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Zap, ArrowRight, Lock, Mail, User, Loader2, CheckCircle2, Info } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useSettings } from '@/lib/settings/SettingsContext'

export default function RegisterPage() {
  const { settings } = useSettings()
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [simulatedLink, setSimulatedLink] = useState<string | null>(null)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setRegistered(true);
        if (result.data?.verifyLinkSimulated) {
          setSimulatedLink(result.data.verifyLinkSimulated);
        }
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
    <div className="min-h-screen bg-[#05050A] flex flex-col relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#4F8EF7]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#8B5CF6]/10 blur-[120px] rounded-full pointer-events-none" />

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
      <main className="flex-1 flex items-center justify-center p-4 z-10 pt-20 pb-10">
        <div className="w-full max-w-md">
          <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl shadow-2xl p-8 relative overflow-hidden">
            {/* Top Glow */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#8B5CF6] to-[#4F8EF7]" />
            
            {registered ? (
              <div className="text-center space-y-6 py-4 animate-in fade-in duration-300">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2 font-['Outfit']">Kayıt Başarılı!</h1>
                  <p className="text-[#94A3B8] text-sm leading-relaxed">
                    Hesabınızı aktifleştirmek için <strong>{email}</strong> adresine bir doğrulama e-postası gönderdik.
                  </p>
                  <p className="text-[#64748B] text-xs mt-2">
                    Lütfen gelen kutunuzu (ve spam klasörünü) kontrol edin.
                  </p>
                </div>

                {simulatedLink && (
                  <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 text-left space-y-2 mt-4">
                    <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                      <Info className="w-4 h-4" />
                      <span>DEVELOPMENT MODU (Simüle Edilen Bağlantı)</span>
                    </div>
                    <p className="text-slate-400 text-xs">
                      E-posta sunucusu ayarlı olmadığı için doğrulama linki aşağıda simüle edilmiştir:
                    </p>
                    <a 
                      href={simulatedLink} 
                      className="text-xs text-blue-400 underline break-all block hover:text-blue-300"
                    >
                      {simulatedLink}
                    </a>
                  </div>
                )}

                <div className="pt-4">
                  <Link href="/auth/login">
                    <Button variant="primary" className="w-full justify-center">
                      Giriş Yap Sayfasına Git
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-white mb-2 font-['Outfit']">Müşteri Hesabı Oluşturun</h1>
                  <p className="text-[#94A3B8] text-sm">Projelerinizi ve sözleşmelerinizi takip etmek için hesap açın.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Ad Soyad</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                      <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#12121F] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
                        placeholder="Adınız Soyadınız"
                      />
                    </div>
                  </div>

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
                  </div>

                  <div className="pt-2">
                    <Button 
                      variant="primary" 
                      size="lg" 
                      className="w-full justify-center group"
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>
                          Kayıt Ol
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                <div className="mt-8 text-center text-sm text-[#64748B]">
                  Zaten bir hesabınız var mı?{' '}
                  <Link href="/auth/login" className="text-white hover:text-[#8B5CF6] transition-colors font-medium">
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
