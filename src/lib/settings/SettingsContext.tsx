'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type SettingsContextType = {
  settings: any | null;
  setSettings: (settings: any) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ 
  children, 
  initialSettings 
}: { 
  children: React.ReactNode; 
  initialSettings: any 
}) {
  const [settings, setSettings] = useState<any>(initialSettings);

  // Sync with initialSettings if it changes (e.g. Server Component re-renders after Server Action)
  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
