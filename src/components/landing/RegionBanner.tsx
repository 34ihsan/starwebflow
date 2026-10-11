'use client';

import { useState } from 'react';
import { useRegion, REGION_CONFIGS, RegionMode } from '@/lib/i18n/RegionContext';
import { Globe, Shield, Sparkles, ChevronDown, Check, X } from 'lucide-react';

export default function RegionBanner() {
  const { region, setRegion, config } = useRegion();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className="relative z-[60] bg-gradient-to-r from-[#0A0A0F] via-[#121226] to-[#0A0A0F] border-b border-white/[0.08] text-xs font-medium py-2 px-4 transition-all duration-300"
      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}
    >
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#4F8EF7]/50 to-transparent" />

      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Left: Dynamic Region Message */}
        <div className="flex items-center gap-2.5 text-center sm:text-left">
          <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#4F8EF7]/15 text-[#4F8EF7] border border-[#4F8EF7]/30 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#4F8EF7]" aria-hidden="true" />
            {config.badge}
          </span>
          <p className="text-slate-300 truncate max-w-[280px] sm:max-w-xl md:max-w-2xl">
            <strong className="text-white font-semibold mr-1">{config.bannerTitle}</strong>
            <span className="text-slate-400">{config.bannerDesc}</span>
          </p>
        </div>

        {/* Right: Quick Region Switcher & Close */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Quick Region Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/[0.1] transition-all duration-200"
              aria-label="Bölge ve Dil Değiştir"
            >
              <span className="text-sm">{config.flag}</span>
              <span className="font-bold text-[11px] tracking-wide">{config.shortLabel}</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-1.5 w-60 rounded-xl border border-white/[0.1] bg-[#0A0A12] shadow-2xl p-1.5 z-50 font-sans"
                style={{ backdropFilter: 'blur(20px)' }}
              >
                <div className="px-3 py-1.5 border-b border-white/[0.06] mb-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <Globe className="w-3 h-3 text-[#4F8EF7]" /> Bölge & Hedef Kitle
                  </p>
                </div>
                {(Object.keys(REGION_CONFIGS) as RegionMode[]).map((key) => {
                  const item = REGION_CONFIGS[key];
                  const isSelected = region === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setRegion(key);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                        isSelected
                          ? 'bg-[#4F8EF7]/15 text-[#4F8EF7] font-bold border border-[#4F8EF7]/30'
                          : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-sm">{item.flag}</span>
                        <span>{item.label}</span>
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#4F8EF7]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="text-slate-500 hover:text-white transition-colors p-1"
            title="Kapat"
            aria-label="Banner'ı kapat"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
