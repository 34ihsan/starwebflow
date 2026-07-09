'use client';

import { useState } from 'react';
import { updateProfile, changePassword } from '@/app/actions/profile';
import { 
  User, Lock, Loader2, CheckCircle2, AlertCircle, 
  ShieldCheck, Settings2, Terminal, MonitorSmartphone, 
  Key, Globe, Moon, BellRing, LogOut, Upload, ShieldAlert
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
  twoFactorEnabled?: boolean;
  preferences?: {
    language?: string;
    theme?: string;
    emailNotifications?: boolean;
  };
}

export default function ProfileDashboardClient({ initialProfile }: { initialProfile: UserProfile }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'genel' | 'guvenlik' | 'tercihler' | 'gelismis'>('genel');

  // Form States
  const [name, setName] = useState(initialProfile.name || '');
  const [email, setEmail] = useState(initialProfile.email || '');
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatarUrl || '');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(initialProfile.twoFactorEnabled || false);
  const [preferences, setPreferences] = useState(initialProfile.preferences || {
    language: 'tr',
    theme: 'dark',
    emailNotifications: true,
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isAdmin = initialProfile.role === 'SUPER_ADMIN' || initialProfile.role === 'AGENCY_OWNER';

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage(null);

    const res = await updateProfile({ 
      name, 
      email,
      avatarUrl,
      preferences,
      twoFactorEnabled
    });

    if (res.success) {
      setProfileMessage({ type: 'success', text: res.message || 'Profil başarıyla güncellendi.' });
      router.refresh();
      setTimeout(() => setProfileMessage(null), 3000);
    } else {
      setProfileMessage({ type: 'error', text: res.error || 'Bir hata oluştu.' });
    }
    setProfileLoading(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Yeni şifreler eşleşmiyor.' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'Yeni şifre en az 8 karakter olmalıdır.' });
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage(null);

    const res = await changePassword({ currentPassword, newPassword });
    if (res.success) {
      setPasswordMessage({ type: 'success', text: res.message || 'Şifre güncellendi.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMessage(null), 3000);
    } else {
      setPasswordMessage({ type: 'error', text: res.error || 'Bir hata oluştu.' });
    }
    setPasswordLoading(false);
  };

  const toggle2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
  };

  const updatePreference = (key: string, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <span className="bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Profil & Hesap Ayarları
            </span>
          </h1>
          <p className="text-slate-400 mt-2">
            Hesap güvenliğinizi sağlayın, kişisel bilgilerinizi ve tercihlerinizi yönetin.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-[#0f172a] border border-white/5 rounded-2xl p-2 px-4 shadow-lg">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full border border-white/10 object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {name.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-white">{name}</p>
              <p className="text-xs text-slate-400">{initialProfile.role}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Sidebar Nav */}
        <div className="md:col-span-3 space-y-2">
          <button
            onClick={() => setActiveTab('genel')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'genel' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
          >
            <User className="w-5 h-5" />
            <span className="font-medium">Genel Bilgiler</span>
          </button>
          
          <button
            onClick={() => setActiveTab('guvenlik')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'guvenlik' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="font-medium">Güvenlik</span>
          </button>

          <button
            onClick={() => setActiveTab('tercihler')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'tercihler' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
          >
            <Settings2 className="w-5 h-5" />
            <span className="font-medium">Tercihler</span>
          </button>

          {isAdmin && (
            <>
              <div className="h-px bg-white/10 my-4"></div>
              <button
                onClick={() => setActiveTab('gelismis')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'gelismis' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
              >
                <Terminal className="w-5 h-5" />
                <span className="font-medium">Gelişmiş & API</span>
              </button>
            </>
          )}
        </div>

        {/* Content Area */}
        <div className="md:col-span-9 space-y-6">
          
          {/* GENEL SEKME */}
          {activeTab === 'genel' && (
            <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 lg:p-8 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <User className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Kişisel Bilgiler</h2>
                  <p className="text-sm text-slate-400">Temel hesap bilgileriniz</p>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-6">
                
                {/* Avatar Preview */}
                <div className="flex items-center gap-6 pb-6 border-b border-white/5">
                  <div className="relative group cursor-pointer">
                    {avatarUrl ? (
                       <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full border border-white/10 object-cover" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                        {name.charAt(0)}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">Profil Fotoğrafı</h3>
                    <p className="text-xs text-slate-400 mt-1 mb-3">PNG, JPG 5MB'a kadar.</p>
                    <input 
                      type="text" 
                      placeholder="Görsel URL'si yapıştır (Geçici)" 
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="bg-[#1e293b] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {profileMessage && (
                  <div className={`p-4 rounded-xl flex items-center gap-3 ${profileMessage.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                    {profileMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <p className="text-sm font-medium">{profileMessage.text}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Ad Soyad</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">E-posta Adresi</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Hesap Rolü (Salt Okunur)</label>
                  <input
                    type="text"
                    value={initialProfile.role}
                    disabled
                    className="w-full bg-[#0f172a] border border-white/5 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed opacity-70"
                  />
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-6 py-3 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {profileLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Değişiklikleri Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* GÜVENLİK SEKME */}
          {activeTab === 'guvenlik' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              
              {/* Şifre Kartı */}
              <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-purple-500/10 rounded-xl">
                    <Lock className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Şifre Değiştir</h2>
                    <p className="text-sm text-slate-400">Hesabınıza erişimi koruyun</p>
                  </div>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-6">
                  {passwordMessage && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 ${passwordMessage.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                      {passwordMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                      <p className="text-sm font-medium">{passwordMessage.text}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Mevcut Şifre</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Yeni Şifre</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={8}
                        className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Yeni Şifre (Tekrar)</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={8}
                        className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl px-6 py-3 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {passwordLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Şifreyi Güncelle'}
                    </button>
                  </div>
                </form>
              </div>

              {/* 2FA Kartı */}
              <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 lg:p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-xl">
                      <ShieldAlert className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">İki Adımlı Doğrulama (2FA)</h3>
                      <p className="text-sm text-slate-400 mt-1">Hesabınızı ekstra güvenlik katmanıyla koruyun.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      toggle2FA();
                      handleProfileUpdate(new Event('submit') as any);
                    }}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${twoFactorEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              {/* Aktif Oturumlar Mock */}
              <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 lg:p-8">
                <h3 className="text-lg font-semibold text-white mb-6">Aktif Oturumlar</h3>
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-[#1e293b] rounded-xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <MonitorSmartphone className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Windows 11 • Chrome Browser</p>
                        <p className="text-xs text-emerald-400 mt-1">Şu anki cihazınız (IP: 192.168.1.1)</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-[#1e293b] rounded-xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-slate-700 rounded-lg">
                        <MonitorSmartphone className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">MacBook Pro • Safari</p>
                        <p className="text-xs text-slate-400 mt-1">Son görülme: 2 gün önce (IP: 85.123.45.67)</p>
                      </div>
                    </div>
                    <button className="text-sm text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1 mt-4 md:mt-0">
                      <LogOut className="w-4 h-4" /> Çıkış Yap
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TERCİHLER SEKME */}
          {activeTab === 'tercihler' && (
            <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 lg:p-8 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-emerald-500/10 rounded-xl">
                  <Settings2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Uygulama Tercihleri</h2>
                  <p className="text-sm text-slate-400">Deneyiminizi özelleştirin</p>
                </div>
              </div>

              <div className="space-y-8">
                
                {/* Dil & Bölge */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-400" /> Dil & Bölge
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {['tr', 'en', 'de'].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          updatePreference('language', lang);
                          handleProfileUpdate(new Event('submit') as any);
                        }}
                        className={`p-4 rounded-xl border text-center transition-all ${preferences.language === lang ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-[#1e293b] border-white/5 text-slate-400 hover:bg-white/5 hover:text-white'}`}
                      >
                        {lang === 'tr' ? 'Türkçe' : lang === 'en' ? 'English' : 'Deutsch'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tema */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-white flex items-center gap-2">
                    <Moon className="w-4 h-4 text-slate-400" /> Görünüm Teması
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {['dark', 'light', 'system'].map((theme) => (
                      <button
                        key={theme}
                        onClick={() => {
                          updatePreference('theme', theme);
                          handleProfileUpdate(new Event('submit') as any);
                        }}
                        className={`p-4 rounded-xl border text-center transition-all ${preferences.theme === theme ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-[#1e293b] border-white/5 text-slate-400 hover:bg-white/5 hover:text-white'}`}
                      >
                        <span className="capitalize">{theme === 'dark' ? 'Koyu' : theme === 'light' ? 'Açık' : 'Sistem'}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bildirimler */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-white flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-slate-400" /> E-posta Bildirimleri
                  </h3>
                  <div className="p-4 bg-[#1e293b] border border-white/5 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">Genel Bildirimler</p>
                      <p className="text-xs text-slate-400 mt-1">Faturalar, sistem uyarıları ve özet raporları</p>
                    </div>
                    <button 
                      onClick={() => {
                        updatePreference('emailNotifications', !preferences.emailNotifications);
                        handleProfileUpdate(new Event('submit') as any);
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.emailNotifications ? 'bg-blue-500' : 'bg-slate-700'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.emailNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* GELİŞMİŞ SEKME (SADECE ADMİNLER) */}
          {isAdmin && activeTab === 'gelismis' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              
              <div className="bg-[#0f172a] border border-rose-500/20 rounded-2xl p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-rose-500/10 rounded-xl">
                    <Key className="w-6 h-6 text-rose-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">API Yönetimi</h2>
                    <p className="text-sm text-slate-400">Harici sistemler için API anahtarları oluşturun.</p>
                  </div>
                </div>
                
                <div className="p-6 border border-white/5 rounded-xl bg-[#1e293b] text-center">
                  <Terminal className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                  <h3 className="text-white font-medium mb-1">Geliştirici Araçları</h3>
                  <p className="text-sm text-slate-400 mb-4 max-w-sm mx-auto">
                    Kendi uygulamalarınızı StarWebflow ile entegre etmek için bir API anahtarı oluşturabilirsiniz.
                  </p>
                  <button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    + Yeni Anahtar Üret
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
