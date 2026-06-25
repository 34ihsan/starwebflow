'use client'

import React, { useState, useEffect } from 'react'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import GlowCard from '@/components/ui/GlowCard'
import { FileText, Printer, ArrowLeft, Globe, Shield } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface LegalPageLayoutProps {
  title: string
  germanTitle?: string
  englishTitle?: string
  subtitle: string
  germanSubtitle?: string
  englishSubtitle?: string
  lastUpdated: string
  germanLastUpdated?: string
  englishLastUpdated?: string
  sections: {
    id: string
    title: string
    germanTitle?: string
    englishTitle?: string
    content: React.ReactNode
    germanContent?: React.ReactNode
    englishContent?: React.ReactNode
  }[]
}

type Lang = 'TR' | 'EN' | 'DE'

const localDict = {
  tr: {
    backToHome: 'Ana Sayfaya Dön',
    documentContent: 'Belge İçeriği',
    complianceText: 'EU & Almanya (DSGVO/TDDDG) ve Türkiye (KVKK) ile tam uyumlu.',
    lastUpdatedPrefix: 'Son Güncelleme:',
    printTitle: 'Yazdır / PDF Kaydet'
  },
  en: {
    backToHome: 'Back to Home',
    documentContent: 'Document Content',
    complianceText: 'Fully compliant with EU & Germany (GDPR/TDDDG) and Turkey (KVKK).',
    lastUpdatedPrefix: 'Last Updated:',
    printTitle: 'Print / Save PDF'
  },
  de: {
    backToHome: 'Zurück zur Startseite',
    documentContent: 'Dokumenteninhalt',
    complianceText: 'Vollständig konform mit EU & Deutschland (DSGVO/TDDDG) und Türkei (KVKK).',
    lastUpdatedPrefix: 'Zuletzt aktualisiert:',
    printTitle: 'Drucken / PDF speichern'
  }
}

export default function LegalPageLayout({
  title,
  germanTitle,
  englishTitle,
  subtitle,
  germanSubtitle,
  englishSubtitle,
  lastUpdated,
  germanLastUpdated,
  englishLastUpdated,
  sections,
}: LegalPageLayoutProps) {
  const { language } = useLanguage()
  const [lang, setLang] = useState<Lang>(language === 'de' ? 'DE' : language === 'en' ? 'EN' : 'TR')
  const dict = localDict[language] || localDict.tr

  useEffect(() => {
    if (language === 'de') {
      setLang('DE')
    } else if (language === 'en') {
      setLang('EN')
    } else {
      setLang('TR')
    }
  }, [language])

  const handlePrint = () => {
    window.print()
  }

  return (
    <main className="min-h-screen bg-[#0A0A0F] text-white">
      <Navbar />

      {/* Header Banner */}
      <div className="relative pt-28 pb-12 overflow-hidden border-b border-white/[0.04] bg-[#0C0C14]">
        {/* Glow grid background */}
        <div className="absolute inset-0 mesh-bg opacity-20 pointer-events-none" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-[#4F8EF7]/10 blur-3xl pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <Link 
                href="/" 
                className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#94A3B8] transition-colors mb-2 group"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                {dict.backToHome}
              </Link>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-['Outfit'] text-white">
                {lang === 'TR' ? title : lang === 'EN' ? (englishTitle || title) : (germanTitle || title)}
              </h1>
              <p className="text-sm text-[#94A3B8] max-w-xl">
                {lang === 'TR' ? subtitle : lang === 'EN' ? (englishSubtitle || subtitle) : (germanSubtitle || subtitle)}
              </p>
            </div>

            {/* Language & Print controls */}
            <div className="flex items-center gap-3">
              {/* Language Switcher */}
              <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/[0.06] text-xs">
                <Globe className="w-3.5 h-3.5 text-[#64748B] ml-1.5" />
                <button
                  onClick={() => setLang('TR')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    lang === 'TR'
                      ? 'bg-[#4F8EF7]/20 text-[#4F8EF7] border border-[#4F8EF7]/30'
                      : 'text-[#64748B] hover:text-[#94A3B8] border border-transparent'
                  }`}
                >
                  Türkçe
                </button>
                <button
                  onClick={() => setLang('EN')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    lang === 'EN'
                      ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30'
                      : 'text-[#64748B] hover:text-[#94A3B8] border border-transparent'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLang('DE')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    lang === 'DE'
                      ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30'
                      : 'text-[#64748B] hover:text-[#94A3B8] border border-transparent'
                  }`}
                >
                  Deutsch
                </button>
              </div>

              {/* Print Button */}
              <button
                onClick={handlePrint}
                className="p-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] text-[#64748B] hover:text-white hover:border-white/20 transition-all"
                title={dict.printTitle}
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 mt-6 text-xs text-[#64748B] pt-4 border-t border-white/[0.04]">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#10B981]" />
              {dict.complianceText}
            </span>
            <span>•</span>
            <span>{dict.lastUpdatedPrefix} {lang === 'TR' ? lastUpdated : lang === 'EN' ? (englishLastUpdated || lastUpdated) : (germanLastUpdated || lastUpdated)}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Navigation Sidebar */}
          <aside className="lg:col-span-3 sticky top-28 hidden lg:block space-y-4">
            <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest pl-3 mb-2">{dict.documentContent}</div>
            <nav className="space-y-1">
              {sections.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    const el = document.getElementById(s.id)
                    if (el) {
                      const offset = 120
                      const bodyRect = document.body.getBoundingClientRect().top
                      const elementRect = el.getBoundingClientRect().top
                      const elementPosition = elementRect - bodyRect
                      const offsetPosition = elementPosition - offset
                      window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                      })
                    }
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-[#64748B] hover:text-white hover:bg-white/[0.02] border border-transparent hover:border-white/[0.04] transition-all flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-[#4F8EF7]/60" />
                  <span className="truncate">{lang === 'TR' ? s.title : lang === 'EN' ? (s.englishTitle || s.title) : (s.germanTitle || s.title)}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Right Main Document Content */}
          <article className="lg:col-span-9 space-y-6">
            <GlowCard glowColor="purple" className="p-6 sm:p-8 md:p-10">
              <div className="prose prose-invert max-w-none prose-sm sm:prose-base space-y-8 leading-relaxed">
                {sections.map(s => (
                  <div key={s.id} id={s.id} className="scroll-mt-32 border-b border-white/[0.04] pb-8 last:border-b-0 last:pb-0">
                    <h2 className="text-lg sm:text-xl font-bold font-['Outfit'] text-white mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-[#4F8EF7] to-[#8B5CF6]" />
                      {lang === 'TR' ? s.title : lang === 'EN' ? (s.englishTitle || s.title) : (s.germanTitle || s.title)}
                    </h2>
                    <div className="text-xs sm:text-sm text-[#94A3B8] space-y-4 font-normal">
                      {lang === 'TR' ? s.content : lang === 'EN' ? (s.englishContent || s.content) : (s.germanContent || s.content)}
                    </div>
                  </div>
                ))}
              </div>
            </GlowCard>
          </article>
        </div>
      </div>

      <Footer />
    </main>
  )
}
