"use client";

import React, { useState } from 'react';
import { Rocket, RefreshCw, Send, Database, UploadCloud, FileSpreadsheet, CheckCircle2, Sparkles, Settings2, Activity } from 'lucide-react';

interface OutreachTabProps {
  isAutoPilotActive: boolean;
  setIsAutoPilotActive: (v: boolean) => void;
  isProviderMatchActive: boolean;
  setIsProviderMatchActive: (v: boolean) => void;
  isLanguageDetectionActive: boolean;
  setIsLanguageDetectionActive: (v: boolean) => void;
}

export default function OutreachTab({
  isAutoPilotActive, setIsAutoPilotActive,
  isProviderMatchActive, setIsProviderMatchActive,
  isLanguageDetectionActive, setIsLanguageDetectionActive
}: OutreachTabProps) {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState({ sent: 0, failed: 0, total: 0 });

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim() !== '');
      if (lines.length < 2) return alert('Geçersiz CSV');
      
      const headers = lines[0].split(',').map(h => h.trim());
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj: any = { status: 'PENDING' };
        headers.forEach((h, i) => {
          obj[h] = values[i];
        });
        return obj;
      });
      setCsvData(data);
      setProgress({ sent: 0, failed: 0, total: data.length });
    };
    reader.readAsText(file);
  };

  const startBulkSending = async () => {
    setIsSending(true);
    try {
      const res = await fetch('/api/outreach/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 'default-tenant',
          data: csvData.filter(d => d.status === 'PENDING'),
          basePrompt: 'Tanışma toplantısı',
          settings: {
            omniRouting: isProviderMatchActive,
            stealthMode: isAutoPilotActive,
            languageDetection: isLanguageDetectionActive
          }
        })
      });
      if(res.ok) {
        const data = await res.json();
        // Mock progress update
        let s = 0;
        const interval = setInterval(() => {
          s++;
          setProgress(prev => ({...prev, sent: prev.sent + 1}));
          if(s >= progress.total) {
            clearInterval(interval);
            setIsSending(false);
            setCsvData(prev => prev.map(p => ({...p, status: 'SENT'})));
          }
        }, 1000);
      } else {
        setIsSending(false);
      }
    } catch(err) {
      console.error(err);
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 relative overflow-hidden group shadow-2xl">
        <div className="absolute -inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <Rocket className="w-7 h-7 text-blue-500" />
              Otonom Gönderim Merkezi (Outreach)
            </h3>
            <p className="text-[#94A3B8] mt-2 max-w-2xl text-sm leading-relaxed">
              CSV verinizi yükleyin. Sistem; dili otomatik algılar, "Metamorfik Şablon" motoruyla sektöre göre içeriği değiştirir ve IP ısınma kurallarına (Stealth Mode) uyarak gönderimi başlatır.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button onClick={() => { setCsvData([]); setProgress({ sent: 0, failed: 0, total: 0 }); }} className="px-5 py-2.5 border border-white/10 rounded-xl text-white text-sm font-medium hover:bg-white/5 transition-colors">
              Sıfırla
            </button>
            <button 
              disabled={isSending || csvData.length === 0}
              onClick={startBulkSending}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white text-sm font-bold hover:scale-105 transition-transform flex items-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 fill-white/20" />}
              {isSending ? "Motor Çalışıyor..." : "Otonom Ateşleme"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Configuration */}
        <div className="col-span-1 lg:col-span-4 space-y-6">
          <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 shadow-xl relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4 flex items-center gap-2 relative z-10">
              <Database className="w-4 h-4 text-emerald-400" /> 1. Veri Kaynağı
            </h4>
            
            {csvData.length === 0 ? (
              <label className="relative z-10 border-2 border-dashed border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer group/upload">
                <div className="w-12 h-12 bg-white/5 group-hover/upload:bg-emerald-500/10 rounded-full flex items-center justify-center mb-3 transition-colors shadow-inner">
                  <UploadCloud className="w-6 h-6 text-[#94A3B8] group-hover/upload:text-emerald-400 transition-colors" />
                </div>
                <span className="text-white font-medium text-sm">CSV Dosyası Sürükle veya Seç</span>
                <span className="text-xs text-[#64748B] mt-1 text-center">Name, Company, Email kolonlarını içermelidir.</span>
                <input type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
              </label>
            ) : (
              <div className="relative z-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-8 h-8 text-emerald-500" />
                  <div>
                    <div className="text-sm font-bold text-white">data_export.csv</div>
                    <div className="text-xs text-emerald-400">{csvData.length} Müşteri Aktarıldı</div>
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
            )}
          </div>

          {/* AI & Routing Config */}
          <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 shadow-xl space-y-6 relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" /> 2. AI Şablon Motoru
              </h4>
              <select className="w-full bg-[#05050A] border border-white/[0.05] text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 appearance-none shadow-inner transition-colors hover:bg-white/[0.02]">
                <option>Metamorfik Şablon: "Tanışma Toplantısı"</option>
                <option>Metamorfik Şablon: "Soğuk Satış B2B"</option>
                <option>Statik Şablon: "Hoşgeldin"</option>
              </select>
            </div>

            <div className="pt-4 border-t border-white/[0.05] relative z-10">
              <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-blue-400" /> 3. Motor Ayarları
              </h4>
              <div className="space-y-3">
                <div 
                  onClick={() => setIsProviderMatchActive(!isProviderMatchActive)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${isProviderMatchActive ? 'bg-blue-500/10 border-blue-500/20' : 'bg-white/[0.02] border-white/[0.02]'} border`}
                >
                  <span className="text-sm text-[#94A3B8]">Omni-Routing Devrede</span>
                  <div className={`w-8 h-4 rounded-full relative transition-colors ${isProviderMatchActive ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-white/10'}`}>
                    <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${isProviderMatchActive ? 'right-0.5' : 'left-0.5'}`}></div>
                  </div>
                </div>
                <div 
                  onClick={() => setIsAutoPilotActive(!isAutoPilotActive)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${isAutoPilotActive ? 'bg-blue-500/10 border-blue-500/20' : 'bg-white/[0.02] border-white/[0.02]'} border`}
                >
                  <span className="text-sm text-[#94A3B8]">İnsan Taklidi (Stealth)</span>
                  <div className={`w-8 h-4 rounded-full relative transition-colors ${isAutoPilotActive ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-white/10'}`}>
                    <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${isAutoPilotActive ? 'right-0.5' : 'left-0.5'}`}></div>
                  </div>
                </div>
                <div 
                  onClick={() => setIsLanguageDetectionActive(!isLanguageDetectionActive)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${isLanguageDetectionActive ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/[0.02] border-white/[0.02]'} border`}
                >
                  <span className="text-sm text-[#94A3B8]">Otomatik Dil Algılama</span>
                  <div className={`w-8 h-4 rounded-full relative transition-colors ${isLanguageDetectionActive ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-white/10'}`}>
                    <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${isLanguageDetectionActive ? 'right-0.5' : 'left-0.5'}`}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Active Queue & Table */}
        <div className="col-span-1 lg:col-span-8 bg-[#0A0A0F] border border-white/[0.05] rounded-2xl p-6 flex flex-col shadow-xl overflow-hidden relative group">
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 flex justify-between items-center mb-6">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" /> Canlı Gönderim Kuyruğu
            </h4>
            {isSending && (
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_8px_rgba(129,140,248,0.8)]"></div>
                MOTOR AKTİF
              </div>
            )}
          </div>

          {(progress.total > 0) && (
            <div className="relative z-10 bg-[#05050A] border border-white/10 rounded-xl p-5 mb-6 shadow-inner">
              <div className="flex justify-between text-sm mb-3">
                <span className="text-white font-medium">Genel İlerleme</span>
                <div className="flex gap-4">
                  <span className="text-emerald-400 font-mono drop-shadow-[0_0_2px_rgba(16,185,129,0.5)]">{progress.sent} Başarılı</span>
                  <span className="text-[#94A3B8] font-mono">{progress.total - progress.sent - progress.failed} Bekliyor</span>
                  <span className="text-red-400 font-mono drop-shadow-[0_0_2px_rgba(239,68,68,0.5)]">{progress.failed} Hata</span>
                </div>
              </div>
              <div className="w-full bg-white/[0.05] rounded-full h-3 overflow-hidden flex shadow-inner">
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full transition-all duration-500 relative" style={{ width: `${(progress.sent / progress.total) * 100}%` }}>
                   <div className="absolute top-0 bottom-0 right-0 w-8 bg-white/30 blur-sm"></div>
                </div>
                <div className="bg-gradient-to-r from-red-600 to-red-400 h-full transition-all duration-500" style={{ width: `${(progress.failed / progress.total) * 100}%` }}></div>
              </div>
            </div>
          )}

          <div className="relative z-10 flex-1 border border-white/[0.05] rounded-xl overflow-hidden flex flex-col bg-[#05050A]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/[0.05] text-[11px] font-bold text-[#64748B] uppercase tracking-wider sticky top-0 backdrop-blur-md z-10">
                    <th className="py-3 px-4">Alıcı</th>
                    <th className="py-3 px-4">Şirket / Endüstri (AI)</th>
                    <th className="py-3 px-4">Dil (AI)</th>
                    <th className="py-3 px-4">Yönlendirme</th>
                    <th className="py-3 px-4 text-right">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05] text-sm text-white">
                  {csvData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-[#64748B] text-sm bg-white/[0.01]">
                        Gönderim kuyruğu boş. Lütfen CSV yükleyin.
                      </td>
                    </tr>
                  ) : (
                    csvData.map((row, idx) => {
                      const mockIndustry = row.Company ? (idx % 2 === 0 ? 'Teknoloji' : 'E-Ticaret') : '-';
                      const mockLang = idx % 3 === 0 ? 'EN' : 'TR';
                      const mockRoute = idx % 2 === 0 ? 'Google WS' : 'Office365';
                      
                      return (
                      <tr key={idx} className="hover:bg-white/[0.03] transition-colors group">
                        <td className="py-3 px-4">
                          <div className="font-medium text-white">{row.Name || row.name || '-'}</div>
                          <div className="text-xs text-[#64748B] font-mono mt-0.5">{row.Email || row.email || '-'}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-white">{row.Company || row.company || '-'}</div>
                          <div className="text-[10px] text-purple-400 mt-0.5 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> {mockIndustry}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded text-[#94A3B8] font-mono">
                            {mockLang}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] px-2 py-1 rounded border font-mono ${mockRoute === 'Google WS' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                            &rarr; {mockRoute}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`inline-flex text-[10px] px-2.5 py-1 rounded-md font-bold tracking-wider uppercase border ${
                            row.status === 'SENT' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]' :
                            row.status === 'FAILED' ? 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]' :
                            row.status === 'SENDING' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.2)]' :
                            'bg-white/5 text-[#94A3B8] border-white/10'
                          }`}>
                            {row.status === 'SENDING' && <RefreshCw className="w-3 h-3 animate-spin mr-1.5 inline" />}
                            {row.status || 'BEKLİYOR'}
                          </span>
                        </td>
                      </tr>
                    )})
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
