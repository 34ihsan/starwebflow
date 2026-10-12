'use client';

import { useState } from 'react';
import { useRegion, REGION_CONFIGS, RegionMode } from '@/lib/i18n/RegionContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Globe, Shield, Sparkles, ChevronDown, Check, X } from 'lucide-react';

export default function RegionBanner() {
  const { region, setRegion, config } = useRegion();
  const { language } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const t = {
    de: {
      switcherLabel: 'Region und Sprache ändern',
      dropdownHeader: 'Region & Zielgruppe',
      close: 'Schließen',
    },
    en: {
      switcherLabel: 'Change Region & Language',
      dropdownHeader: 'Region & Audience',
      close: 'Close banner',
    },
    tr: {
      switcherLabel: 'Bölge ve Dil Değiştir',
      dropdownHeader: 'Bölge & Hedef Kitle',
      close: 'Kapat',
    },
  }[language] || {
    switcherLabel: 'Bölge ve Dil Değiştir',
    dropdownHeader: 'Bölge & Hedef Kitle',
    close: 'Kapat',
  };

  if (dismissed) return null;

  return (
    <div
      className="relative z-[60] bg-slate-50 border-b border-slate-200/80 text-xs font-medium py-2 px-4 transition-all duration-300 shadow-xs"
    >
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Left: Dynamic Region Message */}
        <div className="flex items-center gap-2.5 text-center sm:text-left">
          <span className="flex-shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider flex items-center gap-1 shadow-2xs">
            <Sparkles className="w-3 h-3 text-blue-600" aria-hidden="true" />
            {config.badge}
          </span>
          <p className="text-slate-700 truncate max-w-[280px] sm:max-w-xl md:max-w-2xl">
            <strong className="text-slate-900 font-bold mr-1.5">{config.bannerTitle}</strong>
            <span className="text-slate-600">{config.bannerDesc}</span>
          </p>
        </div>

        {/* Right: Quick Region Switcher & Close */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Quick Region Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs transition-all duration-200"
              aria-label={t.switcherLabel}
            >
              <span className="text-sm">{config.flag}</span>
              <span className="font-bold text-[11px] tracking-wide text-slate-900">{config.shortLabel}</span>
              <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-1.5 w-60 rounded-xl border border-slate-200 bg-white shadow-xl p-1.5 z-50 font-sans"
              >
                <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <Globe className="w-3 h-3 text-blue-600" /> {t.dropdownHeader}
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
                          ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-sm">{item.flag}</span>
                        <span>{item.label}</span>
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="text-slate-400 hover:text-slate-700 transition-colors p-1"
            title={t.close}
            aria-label={t.close}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
