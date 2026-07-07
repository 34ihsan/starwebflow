"use client";

import { useState } from "react";
import { 
  Users, Search, Plus, Filter, 
  ShieldCheck, User, Code, CheckCircle2,
  MoreVertical, Mail, Lock, Shield,
  History, Eye, Edit3, Trash2, Settings, X
} from "lucide-react";

import { createUser, deleteUser, updateUserRole, resetUserPassword } from "@/app/actions/user";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

export default function UsersDashboardClient({ initialData, initialActivities }: { initialData: any[], initialActivities: any[] }) {
  const [activeTab, setActiveTab] = useState<"all" | "team" | "clients" | "audit">("all");
  const [users, setUsers] = useState<any[]>(initialData);
  const [activities, setActivities] = useState<any[]>(initialActivities);
  const [isCreating, setIsCreating] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({ name: '', email: '', password: '', role: 'DEVELOPER' });
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    const tenantId = users.length > 0 ? users[0].tenantId : 'default-tenant';
    const res = await createUser({
      tenantId,
      email: newUserData.email,
      name: newUserData.name,
      password: newUserData.password,
      role: newUserData.role
    });
    if (res.success && res.data) {
      setUsers(prev => [res.data, ...prev]);
      setShowAddUserModal(false);
      setNewUserData({ name: '', email: '', password: '', role: 'DEVELOPER' });
      showToast('Kullanıcı başarıyla eklendi', 'success');
    } else {
      showToast('Kullanıcı eklenemedi', 'error');
    }
    setIsCreating(false);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) return;
    const tenantId = users.length > 0 ? users[0].tenantId : 'default-tenant';
    const res = await deleteUser(userId, tenantId);
    if (res.success) {
      setUsers(users.filter(u => u.id !== userId));
      showToast("Kullanıcı başarıyla silindi", "success");
    } else {
      showToast("Kullanıcı silinemedi", "error");
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (!window.confirm("Bu kullanıcının şifresini sıfırlamak istiyor musunuz?")) return;
    const tenantId = users.length > 0 ? users[0].tenantId : 'default-tenant';
    const res = await resetUserPassword(userId, tenantId);
    if (res.success) {
      showToast(`Şifre sıfırlandı. Yeni şifre: ${res.newPassword}`, "success");
    } else {
      showToast("Şifre sıfırlanamadı", "error");
    }
  };

  const filteredUsers = users.filter(u => {
    if (activeTab === "all") return true;
    if (activeTab === "team") return u.role === "SUPERADMIN" || u.role === "DEVELOPER" || u.role === "ADMIN";
    if (activeTab === "clients") return u.role === "CLIENT" || u.role === "CLIENT_MEMBER";
    return true;
  });

  const teamCount = users.filter(u => ["SUPERADMIN", "DEVELOPER", "ADMIN"].includes(u.role)).length;
  const clientCount = users.filter(u => ["CLIENT", "CLIENT_MEMBER"].includes(u.role)).length;

  return (
    <div className="space-y-8 p-8 animate-in fade-in duration-500 min-h-screen pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <span className="bg-gradient-to-r from-fuchsia-500 to-rose-500 bg-clip-text text-transparent">
              Kullanıcı Yönetimi
            </span>
          </h1>
          <p className="text-[#94A3B8] mt-2">Platforma erişimi olan ekip arkadaşları, müşteriler ve yetkilendirmeler.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input 
              type="text" 
              placeholder="İsim veya e-posta ara..." 
              className="bg-[#0A0A0F] border border-white/[0.05] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-rose-500/50 transition-colors w-64 placeholder:text-[#64748B]"
            />
          </div>
          <button 
            onClick={() => setShowAddUserModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-fuchsia-600 to-rose-600 hover:opacity-90 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-[0_0_20px_rgba(225,29,72,0.3)] disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Yeni Kullanıcı Ekle
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0A0A0F] border border-white/[0.05] p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 flex items-center justify-center border border-fuchsia-500/20">
              <Users className="w-6 h-6 text-fuchsia-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#94A3B8]">Toplam Kullanıcı</p>
              <h3 className="text-2xl font-bold text-white">{users.length}</h3>
            </div>
          </div>
        </div>
        <div className="bg-[#0A0A0F] border border-white/[0.05] p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#94A3B8]">Ekip Üyeleri</p>
              <h3 className="text-2xl font-bold text-white">{teamCount}</h3>
            </div>
          </div>
        </div>
        <div className="bg-[#0A0A0F] border border-white/[0.05] p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
              <User className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#94A3B8]">Müşteriler</p>
              <h3 className="text-2xl font-bold text-white">{clientCount}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl shadow-xl overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-white/[0.05] flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-2">
            {[
              { id: "all", label: "Tümü" },
              { id: "team", label: "Ekip" },
              { id: "clients", label: "Müşteriler" },
              { id: "audit", label: "Audit Log (Denetim)" },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id 
                    ? "bg-white/10 text-white shadow-sm" 
                    : "text-[#64748B] hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.1] text-[#94A3B8] hover:text-white hover:bg-white/5 text-sm font-medium transition-colors">
            <Filter className="w-4 h-4" />
            Filtrele
          </button>
        </div>

        {/* Table / Audit Content */}
        {activeTab !== "audit" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.05] font-semibold text-xs text-[#64748B] uppercase tracking-wider">
                  <th className="py-4 px-6">Kullanıcı Bilgileri</th>
                  <th className="py-4 px-6">Rol & Yetki (RBAC)</th>
                  <th className="py-4 px-6">Son Aktivite</th>
                  <th className="py-4 px-6">Durum</th>
                  <th className="py-4 px-6 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] text-sm">
                {filteredUsers.map(user => {
                  const status = user.status || (user.deletedAt ? 'INACTIVE' : 'ACTIVE');
                  const lastActive = user.lastActive || "Kayıtlı";
                  return (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-fuchsia-500 to-rose-500 flex items-center justify-center text-white font-bold shadow-lg">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-white group-hover:text-rose-400 transition-colors cursor-pointer flex items-center gap-2">
                            {user.name}
                            <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="text-xs text-[#64748B] mt-0.5">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          {user.role === 'SUPERADMIN' || user.role === 'ADMIN' ? (
                            <ShieldCheck className="w-4 h-4 text-fuchsia-400" />
                          ) : user.role === 'DEVELOPER' ? (
                            <Code className="w-4 h-4 text-purple-400" />
                          ) : (
                            <User className="w-4 h-4 text-[#94A3B8]" />
                          )}
                          <span className={`text-xs font-bold ${
                            user.role === 'SUPERADMIN' || user.role === 'ADMIN' ? 'text-fuchsia-400' :
                            user.role === 'DEVELOPER' ? 'text-purple-400' :
                            'text-[#94A3B8]'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#64748B] flex items-center gap-1 mt-1 cursor-pointer hover:text-white transition-colors">
                          <Settings className="w-3 h-3" /> Özel Yetkileri Yönet
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-xs text-[#94A3B8]">{lastActive}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        status === 'ACTIVE' ? 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20' : 
                        'text-[#64748B] bg-white/5 border-white/10'
                      }`}>
                        {status === 'ACTIVE' && <CheckCircle2 className="w-3 h-3" />}
                        {status === 'ACTIVE' ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleResetPassword(user.id)} className="p-2 hover:bg-white/[0.05] rounded-lg text-[#64748B] hover:text-white transition-colors" title="Şifre Sıfırla">
                          <Lock className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteUser(user.id)} className="p-2 hover:bg-rose-500/10 rounded-lg text-rose-500 hover:text-rose-400 transition-colors" title="Kullanıcıyı Sil">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-fuchsia-400" />
              Güvenlik Denetim Günlüğü (Audit Logs)
            </h3>
            <div className="space-y-4">
              {activities.length === 0 ? (
                <div className="text-[#64748B] text-sm py-4 text-center">Henüz kaydedilmiş bir aktivite bulunmuyor.</div>
              ) : activities.map((activity) => (
                <div key={activity.id} className="bg-[#05050A] border border-white/[0.05] p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="text-sm text-white font-medium">
                      {activity.user?.name || 'Sistem'} <span className="text-[#94A3B8] font-normal">{activity.details || activity.action}</span>
                    </div>
                    <div className="text-xs text-[#64748B] mt-1" suppressHydrationWarning>
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true, locale: tr })}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-bold border whitespace-nowrap text-center ${
                    activity.action === 'USER_CREATED' ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20' :
                    activity.action === 'USER_DELETED' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                    activity.action === 'SECURITY' ? 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20' :
                    activity.action === 'RBAC_UPDATE' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    'bg-white/10 text-white border-white/20'
                  }`}>
                    {activity.action}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0A0A0F] border border-white/[0.1] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/[0.05]">
              <h3 className="text-xl font-bold text-white">Yeni Kullanıcı Ekle</h3>
              <button 
                onClick={() => setShowAddUserModal(false)}
                className="text-[#64748B] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">İsim Soyisim</label>
                <input 
                  type="text" 
                  required
                  value={newUserData.name}
                  onChange={e => setNewUserData({...newUserData, name: e.target.value})}
                  className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-fuchsia-500/50 transition-colors"
                  placeholder="Kullanıcı adı"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">E-posta</label>
                <input 
                  type="email" 
                  required
                  value={newUserData.email}
                  onChange={e => setNewUserData({...newUserData, email: e.target.value})}
                  className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-fuchsia-500/50 transition-colors"
                  placeholder="ornek@starwebflow.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Şifre</label>
                <input 
                  type="password" 
                  required
                  value={newUserData.password}
                  onChange={e => setNewUserData({...newUserData, password: e.target.value})}
                  className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-fuchsia-500/50 transition-colors"
                  placeholder="Kullanıcı şifresi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Rol</label>
                <select 
                  value={newUserData.role}
                  onChange={e => setNewUserData({...newUserData, role: e.target.value})}
                  className="w-full bg-[#0A0A0F] border border-white/[0.05] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-fuchsia-500/50 transition-colors"
                >
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="ADMIN">Admin</option>
                  <option value="DEVELOPER">Developer</option>
                  <option value="CLIENT_MEMBER">Müşteri</option>
                </select>
              </div>
              <div className="pt-4 flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-[#94A3B8] hover:text-white transition-colors"
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  disabled={isCreating}
                  className="flex items-center gap-2 bg-gradient-to-r from-fuchsia-600 to-rose-600 hover:opacity-90 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-50"
                >
                  {isCreating ? "Ekleniyor..." : "Kullanıcıyı Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom z-50 ${toast.type === 'error' ? 'bg-rose-500 text-white' : 'bg-[#10B981] text-white'}`}>
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
