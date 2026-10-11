'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';

export type RegionMode = 'DE_TR' | 'DE_DE' | 'TR' | 'EU_EN';

export interface RegionConfig {
  id: RegionMode;
  flag: string;
  label: string;
  shortLabel: string;
  badge: string;
  bannerTitle: string;
  bannerDesc: string;
  currency: 'EUR' | 'TRY';
  legalTerm: string;
  lang: 'tr' | 'de' | 'en';
}

export const REGION_CONFIGS: Record<RegionMode, RegionConfig> = {
  DE_TR: {
    id: 'DE_TR',
    flag: '🇩🇪',
    label: 'Almanya (Türkçe)',
    shortLabel: 'DE (TR)',
    badge: 'Almanya & AB Türk İşletmeleri',
    bannerTitle: '🇩🇪 Almanya & Avrupa\'daki Türk İşletmeleri İçin:',
    bannerDesc: 'Almanca & Türkçe Çift Dilli, %100 DSGVO Uyumlu AI Agent ve Web Sistemleri',
    currency: 'EUR',
    legalTerm: 'DSGVO & Impressum',
    lang: 'tr',
  },
  DE_DE: {
    id: 'DE_DE',
    flag: '🇩🇪',
    label: 'Deutschland (Deutsch)',
    shortLabel: 'DE (DE)',
    badge: 'Deutschland & EU Unternehmen',
    bannerTitle: '🇩🇪 Für Unternehmen in Deutschland & EU:',
    bannerDesc: '100% DSGVO-konforme KI-Agenten, Webanwendungen & Marketing-Automatisierung',
    currency: 'EUR',
    legalTerm: 'DSGVO & Impressum',
    lang: 'de',
  },
  TR: {
    id: 'TR',
    flag: '🇹🇷',
    label: 'Türkiye (Türkçe)',
    shortLabel: 'TR',
    badge: 'Türkiye & Global İhracat',
    bannerTitle: '🇹🇷 Türkiye ve İhracat Yapan İşletmeler İçin:',
    bannerDesc: 'KVKK Uyumlu, Global Standartlarda Yüksek Dönüşümlü AI & Web Altyapıları',
    currency: 'TRY',
    legalTerm: 'KVKK & ETK',
    lang: 'tr',
  },
  EU_EN: {
    id: 'EU_EN',
    flag: '🇪🇺',
    label: 'Global / Europe (English)',
    shortLabel: 'EU (EN)',
    badge: 'Global Enterprise & EU',
    bannerTitle: '🇪🇺 For European & Global Businesses:',
    bannerDesc: 'GDPR Compliant Multilingual AI Agents & High-Performance Web Applications',
    currency: 'EUR',
    legalTerm: 'GDPR Compliant',
    lang: 'en',
  },
};

interface RegionContextProps {
  region: RegionMode;
  setRegion: (mode: RegionMode) => void;
  config: RegionConfig;
}

const RegionContext = createContext<RegionContextProps | undefined>(undefined);

export function RegionProvider({ children }: { children: React.ReactNode }) {
  const { setLanguage } = useLanguage();
  const [region, setRegionState] = useState<RegionMode>('DE_TR');

  useEffect(() => {
    const saved = localStorage.getItem('starwebflow-region') as RegionMode;
    if (saved && REGION_CONFIGS[saved]) {
      setRegionState(saved);
      setLanguage(REGION_CONFIGS[saved].lang);
    } else {
      // Auto detect DACH / TR / Global
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      const userLang = navigator.language.toLowerCase();

      if (userLang.includes('tr') && (tz.includes('Europe/Berlin') || tz.includes('Europe/Vienna') || tz.includes('Europe/Zurich') || userLang.includes('de'))) {
        // Turkish user in DACH area
        setRegionState('DE_TR');
        setLanguage('tr');
      } else if (userLang.includes('de') || tz.includes('Europe/Berlin') || tz.includes('Europe/Vienna')) {
        setRegionState('DE_DE');
        setLanguage('de');
      } else if (userLang.includes('tr') || tz.includes('Istanbul')) {
        setRegionState('TR');
        setLanguage('tr');
      } else {
        setRegionState('EU_EN');
        setLanguage('en');
      }
    }
  }, []);

  const setRegion = (mode: RegionMode) => {
    setRegionState(mode);
    localStorage.setItem('starwebflow-region', mode);
    document.cookie = `starwebflow-region=${mode}; path=/; max-age=31536000; SameSite=Lax`;
    setLanguage(REGION_CONFIGS[mode].lang);
  };

  return (
    <RegionContext.Provider value={{ region, setRegion, config: REGION_CONFIGS[region] }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
}
