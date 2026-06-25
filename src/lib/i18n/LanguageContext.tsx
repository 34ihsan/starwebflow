'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { dictionaries, LanguageType } from './dictionaries';

interface LanguageContextProps {
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageType>('tr');

  // Sayfa yüklendiğinde dil tercihini yerel depodan veya tarayıcıdan oku
  useEffect(() => {
    const savedLang = localStorage.getItem('starwebflow-lang') as LanguageType;
    if (savedLang && (savedLang === 'tr' || savedLang === 'en' || savedLang === 'de')) {
      setLanguageState(savedLang);
    } else {
      // Tarayıcı dilini algıla
      const browserLang = navigator.language.substring(0, 2).toLowerCase();
      if (browserLang === 'en' || browserLang === 'de' || browserLang === 'tr') {
        setLanguageState(browserLang as LanguageType);
      }
    }
  }, []);

  const setLanguage = (lang: LanguageType) => {
    setLanguageState(lang);
    localStorage.setItem('starwebflow-lang', lang);
    
    // CookieConsent veya tarayıcı ayarları için çerezi güncelle
    document.cookie = `starwebflow-lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
  };

  // Dot-notation ile iç içe geçmiş anahtarları çözen çeviri fonksiyonu (Örn: "navbar.services")
  const t = (path: string): string => {
    const dictionary = dictionaries[language] || dictionaries.tr;
    const keys = path.split('.');
    let current: any = dictionary;

    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        return path; // Çeviri bulunamazsa anahtarın kendisini göster
      }
    }

    return typeof current === 'string' ? current : path;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
