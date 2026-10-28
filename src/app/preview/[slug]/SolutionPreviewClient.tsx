"use client";

import React, { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { 
  Sparkles, CheckCircle2, ShieldCheck, ArrowRight, Zap, 
  MessageSquare, Calendar, Calculator, Sliders, Smartphone, Send, Star, ExternalLink, RefreshCw
} from "lucide-react";
import { NICHE_SECTOR_BLUEPRINTS } from "@/lib/leads/niche-blueprints";

export default function SolutionPreviewClient() {
  const params = useParams();
  const searchParams = useSearchParams();

  const slug = (params?.slug as string) || "muster-unternehmen";
  const blueprintId = searchParams.get("blueprint") || "ev_charging_infrastructure";
  const serviceType = searchParams.get("service") || "AI_AGENT";
  const companyNameParam = searchParams.get("company") || slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const lang = searchParams.get("lang") || "de";

  const blueprint = NICHE_SECTOR_BLUEPRINTS.find(b => b.id === blueprintId) || NICHE_SECTOR_BLUEPRINTS[0];

  // ==========================================
  // ŞABLON 1: INTERAKTİF WHATSAPP TELEFON SİMÜLATÖRÜ
  // ==========================================
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "bot"; text: string; time: string }>>([
    {
      sender: "bot",
      text: lang === "de" 
        ? `Guten Tag! Willkommen beim 24/7 KI-Assistenten von ${companyNameParam}. Wie kann ich Ihnen heute helfen?`
        : `Merhaba! ${companyNameParam} 7/24 Akıllı Asistanına hoş geldiniz. Size nasıl yardımcı olabilirim?`,
      time: "10:00"
    }
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);

  const handleSendMessage = (customText?: string) => {
    const textToSend = customText || inputMsg;
    if (!textToSend.trim()) return;

    setChatMessages(prev => [...prev, { sender: "user", text: textToSend, time: "10:02" }]);
    if (!customText) setInputMsg("");
    setIsBotTyping(true);

    setTimeout(() => {
      let botReply = lang === "de"
        ? `Vielen Dank für Ihre Anfrage zu ${blueprint.titleDe}. Für ${companyNameParam} haben wir Ihren Termin für morgen um 14:30 Uhr vorgemerkt. Dürfen wir Ihnen die Bestätigung zusenden?`
        : `${blueprint.titleTr} konusundaki talebinizi aldım. ${companyNameParam} için yarın saat 14:30'a ön randevunuzu oluşturdum. Onay SMS'i iletmemizi ister misiniz?`;
      
      setChatMessages(prev => [...prev, { sender: "bot", text: botReply, time: "10:02" }]);
      setIsBotTyping(false);
    }, 1200);
  };

  // ==========================================
  // ŞABLON 2: HESAPLAYICI & ROI SIMÜLATÖRÜ
  // ==========================================
  const [calcVolume, setCalcVolume] = useState<number>(50); // m² veya filo adedi
  const [calcMonthlyCost, setCalcMonthlyCost] = useState<number>(2500); // Aylık fatura veya gider

  const estimatedYearlySavings = Math.round(calcMonthlyCost * 12 * 0.38);
  const paybackMonths = Math.max(8, Math.round(36 - (calcVolume * 0.2)));

  return (
    <div className="min-h-screen bg-[#05050A] text-white selection:bg-purple-500 selection:text-white">
      {/* DSGVO & Kurumsal Güvenlik Başlık Çubuğu */}
      <div className="bg-[#0A0A0F] border-b border-white/[0.08] px-4 py-3 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-medium">
              {lang === "de" ? "Exklusive Machbarkeits-Vorschau für:" : "Özel Çözüm Simülasyonu:"}
            </span>
            <strong className="text-white font-bold bg-white/10 px-2 py-0.5 rounded border border-white/10">
              {companyNameParam}
            </strong>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400 font-mono">
              <ShieldCheck className="w-4 h-4" />
              100% DSGVO-konform (Zero-Cloud Leakage)
            </span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline font-mono">Server: Frankfurt am Main</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto pt-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/10 text-purple-300 border border-purple-500/20">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            {blueprint.titleTr} • {blueprint.titleDe}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            {companyNameParam} İçin Hazırlanan{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Yeni Nesil AI & Otomasyon Altyapısı
            </span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            {lang === "de"
              ? `Diese interaktive Demo zeigt, wie ${companyNameParam} mit maßgeschneiderter Automatisierung den Schmerzpunkt "${blueprint.primaryPainPoint}" dauerhaft eliminiert.`
              : `Bu interaktif simülasyon; ${companyNameParam} şirketinin "${blueprint.primaryPainPoint}" sorununu nasıl tamamen ortadan kaldırdığını canlı olarak gösterir.`}
          </p>
        </div>

        {/* İKİ ANA SİMÜLASYON GÖSTERİMİ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* SİMÜLATÖR A: CANLI WHATSAPP TELEFONU */}
          <div className="bg-[#0A0A0F] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    Canlı WhatsApp 7/24 AI Ajanı
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">Canlı</span>
                  </h3>
                  <div className="text-[11px] text-slate-400">Telefon ekranındaki butonlara basarak deneyimleyin</div>
                </div>
              </div>
              <button 
                onClick={() => setChatMessages([{
                  sender: "bot",
                  text: lang === "de" ? `Willkommen bei ${companyNameParam}! Wie kann ich helfen?` : `${companyNameParam} asistanına hoş geldiniz!`,
                  time: "10:00"
                }])}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-white/5"
                title="Sıfırla"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mockup Ekranı */}
            <div className="bg-[#111b21] rounded-2xl border border-white/10 p-4 space-y-3 min-h-[380px] max-h-[420px] overflow-y-auto flex flex-col justify-between">
              <div className="space-y-2.5">
                {chatMessages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`flex flex-col max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                      msg.sender === "user" 
                        ? "ml-auto bg-[#005c4b] text-white rounded-tr-none" 
                        : "mr-auto bg-[#202c33] text-slate-100 rounded-tl-none border border-white/5"
                    }`}
                  >
                    <span>{msg.text}</span>
                    <span className="text-[9px] text-slate-400 self-end mt-1">{msg.time}</span>
                  </div>
                ))}
                {isBotTyping && (
                  <div className="mr-auto bg-[#202c33] px-3 py-2 rounded-xl text-xs text-slate-400 animate-pulse flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-100"></span>
                    <span>Yazıyor...</span>
                  </div>
                )}
              </div>

              {/* Hızlı Seçim Butonları */}
              <div className="pt-2 border-t border-white/5 space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {[
                    lang === "de" ? "📅 Termin anfragen" : "📅 Randevu Almak İstiyorum",
                    lang === "de" ? "💰 Preise & Förderung?" : "💰 Fiyat & Teklif Alabilir miyim?",
                    lang === "de" ? "📍 Wo ist die Adresse?" : "📍 Adres Bilgisi"
                  ].map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => handleSendMessage(preset)}
                      className="text-[11px] bg-white/5 hover:bg-emerald-600 hover:text-white text-slate-300 px-2.5 py-1 rounded-lg border border-white/10 transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={inputMsg}
                    onChange={e => setInputMsg(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSendMessage()}
                    placeholder={lang === "de" ? "Nachricht schreiben..." : "Mesajınızı yazın..."}
                    className="flex-1 bg-[#2a3942] border-none rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                  <button 
                    onClick={() => handleSendMessage()}
                    className="p-2 rounded-xl bg-[#00a884] text-white hover:opacity-90"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SİMÜLATÖR B: ANLIK ROI & TASARRUF HESAPLAYICISI */}
          <div className="bg-[#0A0A0F] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-4">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {lang === "de" ? "B2B Amortisations- & Ertragsrechner" : "B2B Amortisman & Tasarruf Simülatörü"}
                </h3>
                <div className="text-[11px] text-slate-400">Müşterilerin sitenizde kullanacağı anlık teklif motoru</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-300">İşlem / Kapasite Hacmi:</span>
                  <span className="text-purple-400 font-mono font-bold">{calcVolume} Birim / m²</span>
                </div>
                <input 
                  type="range" 
                  min={10} 
                  max={250} 
                  value={calcVolume} 
                  onChange={e => setCalcVolume(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-300">Mevcut Aylık Operasyon Gideri / Fatura:</span>
                  <span className="text-emerald-400 font-mono font-bold">€{calcMonthlyCost.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min={500} 
                  max={15000} 
                  step={250}
                  value={calcMonthlyCost} 
                  onChange={e => setCalcMonthlyCost(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Sonuç Kartı */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-[#05050A] border border-purple-500/30 space-y-3">
                <div className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                  Otomasyonun {companyNameParam} Şirketine Sağlayacağı Fayda:
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <div className="text-[11px] text-slate-400">Tahmini Yıllık Tasarruf:</div>
                    <div className="text-2xl font-black text-emerald-400 font-mono">
                      €{estimatedYearlySavings.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">Yatırım Geri Dönüşü:</div>
                    <div className="text-2xl font-black text-purple-300 font-mono">
                      {paybackMonths} Ay
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 italic pt-2 border-t border-white/5">
                  * Müşterileriniz bu hesaplamayı sitenizde 30 saniyede yapıp teklifi PDF olarak indirir.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* TESLİM EDİLECEK HİZMET PAKETLERİ */}
        <div className="bg-[#0A0A0F] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-white/[0.06] pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                {companyNameParam} İçin Hazırlanan Anahtar Teslim Paket
              </h2>
              <p className="text-xs text-slate-400">Bu sistemler mevcut web sitenize ve CRM altyapınıza 48 saatte entegre edilir.</p>
            </div>
            <span className="text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full font-mono">
              Kurulum Süresi: 2-4 İş Günü
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {blueprint.services.map((srv, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-[#05050A] border border-white/10 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded uppercase">
                      {srv.type}
                    </span>
                    <span className="text-xs font-bold text-purple-300 font-mono">
                      {srv.estimatedTicket}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{srv.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{srv.description}</p>
                </div>

                <div className="pt-3 border-t border-white/5 space-y-1.5">
                  {srv.deliverables.map((del, dIdx) => (
                    <div key={dIdx} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{del}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* DÖNÜŞÜM ÇAĞRISI (CALL TO ACTION) */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900/30 via-indigo-950/40 to-slate-900 border border-purple-500/30 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h4 className="text-base font-bold text-white">
                Bu Sistemi {companyNameParam} Bünyesine Kazandıralım
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                15 dakikalık ücretsiz canlı demo ve teknik keşif randevusu için takvimimizden boş bir saat seçebilirsiniz.
              </p>
            </div>
            <a 
              href="https://starwebflow.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:scale-105 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-950/40 transition-all flex items-center gap-2 shrink-0"
            >
              <span>Canlı Demo Randevusu Al</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
