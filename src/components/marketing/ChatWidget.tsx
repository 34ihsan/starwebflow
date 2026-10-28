'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Bot,
  Sparkles,
  X,
  Send,
  ChevronDown,
  BrainCircuit,
  Zap,
  Calendar,
  CheckCircle2,
  Globe,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Server,
  Workflow,
  Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@ai-sdk/react';
import { useSectionTracker } from '@/hooks/useSectionTracker';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { LanguageType } from '@/lib/i18n/dictionaries';

const TRACKED_SECTIONS = ['hero', 'services', 'comparison', 'audit', 'simulation'];

interface VisitorContextState {
  auditedDomain?: string;
  auditScore?: number;
  detectedIndustry?: string;
  specTitle?: string;
  specIdea?: string;
}

interface ChatTranslation {
  welcome: string;
  headerTitle: string;
  headerSubtitle: string;
  closeLabel: string;
  placeholder: string;
  footerBadge: string;
  actionButtonLabel: string;
  quickActions: { label: string; prompt: string }[];
}

const chatTranslations: Record<LanguageType, ChatTranslation> = {
  de: {
    headerTitle: "Starwebflow KI-Architekt",
    welcome:
      "Hallo! Ich bin der KI-Architektur-Berater von Starwebflow. ⚡\n\nWir schützen Ihre Unternehmensdaten vor Drittanbieter-Cloud-Abflüssen und etablieren DSGVO-konforme Systeme auf eigenen Servern:\n• 🔒 Souveräne KI-Agenten & Lokale LLMs (Ollama, keine Token-Kosten)\n• ⚙️ Workflow- & CRM-Automatisierung (n8n, Rechnungen & Leads)\n• ⚡ Subsekunden Next.js 14 Web & B2B-Kundenportale\n• 🛡️ 24/7 Telemetrie & 99,98% Uptime-SLA\n\nWelche Lösung möchten Sie für Ihr Unternehmen prüfen? 👇",
    headerSubtitle: "Dedizierter VPS (Ollama) • 100% DSGVO",
    closeLabel: "Schließen",
    actionButtonLabel: "Live-Audit",
    placeholder: "Frage zu KI-Agenten, n8n, Web oder SLA...",
    footerBadge: "Rechenzentrum Frankfurt / TR • 100% Datenhoheit 🔒",
    quickActions: [
      {
        label: "🔒 Souveräne KI (Ollama)",
        prompt: "Wie funktionieren Ihre lokalen KI-Agenten auf dedizierten Servern (DSGVO-konform ohne US-Cloud)?",
      },
      {
        label: "⚙️ n8n & CRM-Sync",
        prompt: "Wie automatisieren Sie Lead-Erfassung, Rechnungen und Kalendersync über n8n?",
      },
      {
        label: "⚡ Subsekunden Web",
        prompt: "Können Sie mir mehr über Ihre Next.js 14 Plattformen (LCP < 0,8s) erzählen?",
      },
      {
        label: "📊 Live-Website-Analyse",
        prompt: "Wie kann ich die Ladezeit und Sicherheitslücken meiner aktuellen Website analysieren?",
      },
      {
        label: "📅 Termin vereinbaren",
        prompt: "Wie kann ich einen 15-minütigen kostenlosen Architektur-Beratungstermin mit Ihrem Team vereinbaren?",
      },
    ],
  },
  en: {
    headerTitle: "Starwebflow AI Architect",
    welcome:
      "Hello! I am Starwebflow's Enterprise Architecture & AI Advisor. ⚡\n\nWe protect your proprietary data from third-party cloud exposure by deploying sovereign systems on dedicated servers:\n• 🔒 Sovereign AI Agents & Local LLMs (Ollama, zero token fees)\n• ⚙️ End-to-End Workflow & CRM Automation (n8n, auto-invoicing)\n• ⚡ Sub-Second Next.js 14 Web & Custom B2B Client Portals\n• 🛡️ 24/7 Real-Time Telemetry & 99.98% Uptime SLA\n\nWhich architecture would you like to explore? 👇",
    headerSubtitle: "Dedicated VPS (Ollama) • 100% GDPR",
    closeLabel: "Close",
    actionButtonLabel: "Live Audit",
    placeholder: "Ask about Sovereign AI, n8n, Web, or SLA...",
    footerBadge: "Frankfurt / TR Datacenter • 100% Private Isolation 🔒",
    quickActions: [
      {
        label: "🔒 Sovereign AI (Ollama)",
        prompt: "How do your local Ollama AI agents work on dedicated VPS without cloud data exposure?",
      },
      {
        label: "⚙️ Workflow & CRM (n8n)",
        prompt: "How do you automate inbound leads and invoice dispatch using n8n and Webhooks?",
      },
      {
        label: "⚡ Sub-Second Web",
        prompt: "Tell me more about sub-0.8s Next.js 14 platforms and custom B2B client portals.",
      },
      {
        label: "📊 Free Live Audit",
        prompt: "How can I run a live diagnosis on my existing website for speed and security?",
      },
      {
        label: "📅 Book Architecture Review",
        prompt: "How can I schedule a complimentary 15-minute architecture discovery meeting with your engineering team?",
      },
    ],
  },
  tr: {
    headerTitle: "Starwebflow AI Danışmanı",
    welcome:
      "Merhaba! Ben Starwebflow Kurumsal AI & Sistem Danışmanıyım. ⚡\n\nMüşteri verilerinizi açık bulutlara sızdırmadan kendi sunucunuzda çalışan otonom sistemler kuruyoruz:\n• 🔒 Sovereign AI (Ollama yerel LLM, sıfır token ücreti)\n• ⚙️ Süreç & CRM Otomasyonu (n8n, otomatik fatura/teklif)\n• ⚡ Sub-Second Next.js Web (0.8s LCP) & B2B Portalları\n• 🛡️ 7/24 Kesintisiz Telemetri & %99.98 Uptime SLA\n\nHangi mimariyi birlikte inceleyelim? 👇",
    headerSubtitle: "Özel Sunucu (Ollama) • %100 DSGVO & KVKK",
    closeLabel: "Kapat",
    actionButtonLabel: "Canlı Analiz",
    placeholder: "AI Ajanlar, n8n otomasyonu, Web veya SLA...",
    footerBadge: "Frankfurt / TR Dedike VPS • %100 Veri İzolasyonu 🔒",
    quickActions: [
      {
        label: "🔒 Yerel AI Ajanları (Ollama)",
        prompt:
          "Kendi sunucumuzda (Ollama) çalışan ve verilerimizi dışarı sızdırmayan yapay zeka ajanları nasıl kuruluyor? Avantajları nelerdir?",
      },
      {
        label: "⚙️ Süreç & CRM (n8n)",
        prompt:
          "n8n ve webhook altyapısı ile CRM, fatura ve müşteri randevu süreçlerini nasıl otopilota alıyorsunuz?",
      },
      {
        label: "⚡ Sub-Second Web & Portal",
        prompt:
          "Next.js 14 ile 0.8 saniyenin altında açılan kurumsal web sistemleri ve müşteri portalları hakkında bilgi alabilir miyim?",
      },
      {
        label: "📊 Canlı Site Analizi",
        prompt:
          "Mevcut web sitemizin hız, güvenlik ve ciro kaçaklarını canlı olarak nasıl analiz edebiliriz?",
      },
      {
        label: "📅 Randevu & Değerlendirme",
        prompt:
          "Starwebflow mühendislik ekibiyle 15 dakikalık ücretsiz mimari değerlendirme randevusu nasıl oluşturabilirim?",
      },
    ],
  },
};

function formatMessageWithLeadCard(rawContent: string, lang: LanguageType): { cleanText: string; leadCaptured: any | null } {
  if (!rawContent) return { cleanText: '', leadCaptured: null };

  // Strip <think>...</think> and <tool_call>...</tool_call> blocks emitted by local reasoning models
  let cleaned = rawContent
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<think>[\s\S]*$/gi, '')
    .replace(/<tool_call>[\s\S]*?<\/tool_call>/gi, '')
    .trim();

  // Check if message contains inline save_lead JSON block
  const jsonBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (jsonBlockMatch && jsonBlockMatch[1] && /save_lead/i.test(jsonBlockMatch[1])) {
    try {
      const parsed = JSON.parse(jsonBlockMatch[1].trim());
      const args = parsed.arguments || parsed.parameters || parsed;
      const stripped = cleaned.replace(jsonBlockMatch[0], '').trim();
      const defaultConfirm =
        lang === 'de'
          ? 'Vielen Dank! Ich habe Ihre Kontaktdaten an unser Expertenteam übermittelt. Wir melden uns in Kürze mit Ihrem maßgeschneiderten Angebot.'
          : lang === 'en'
          ? 'Thank you! I have forwarded your contact details to our senior engineering team. We will reach out shortly with your tailored proposal.'
          : 'Teşekkürler! İletişim bilgilerinizi uzman ekibimize ve CRM sistemimize öncelikli olarak ilettim. En kısa sürede size özel teklifimizle dönüş yapacağız.';
      return {
        cleanText: stripped || defaultConfirm,
        leadCaptured: args,
      };
    } catch {
      // ignore
    }
  }
  return { cleanText: cleaned, leadCaptured: null };
}

export default function ChatWidget() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpenedAutomatically, setHasOpenedAutomatically] = useState(false);
  const [visitorContext, setVisitorContext] = useState<VisitorContextState>({});
  
  // Dedicated references for precise scroll control
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { language } = useLanguage();
  const tChat = chatTranslations[language] || chatTranslations.tr;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cross-Widget Memory Listeners (InstantAuditWidget & SpecBuilderSimulation)
  useEffect(() => {
    const onAuditCompleted = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      if (detail.domain) {
        setVisitorContext((prev) => ({
          ...prev,
          auditedDomain: detail.domain,
          auditScore: detail.overallScore,
          detectedIndustry: detail.detectedIndustry,
        }));
      }
    };

    const onSpecGenerated = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      if (detail.projectTitle) {
        setVisitorContext((prev) => ({
          ...prev,
          specTitle: detail.projectTitle,
          specIdea: detail.idea,
        }));
      }
    };

    window.addEventListener('starwebflow:audit-completed', onAuditCompleted);
    window.addEventListener('starwebflow:spec-generated', onSpecGenerated);
    return () => {
      window.removeEventListener('starwebflow:audit-completed', onAuditCompleted);
      window.removeEventListener('starwebflow:spec-generated', onSpecGenerated);
    };
  }, []);

  // Track active section and time on page
  const { activeSection, timeOnPage } = useSectionTracker(TRACKED_SECTIONS);

  const { messages, setMessages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: tChat.welcome,
      },
    ],
    body: {
      tenantId: 'default-tenant',
      activeSection,
      timeOnPage,
      language,
      visitorContext,
    },
    onError: (err) => {
      console.warn('[ChatWidget Client Handled Error]:', err);
      // Ensure the chat never stays empty or silent under any condition
      setMessages((prev) => [
        ...prev,
        {
          id: 'error-safe-' + Date.now(),
          role: 'assistant',
          content:
            language === 'de'
              ? 'Vielen Dank für Ihre Nachricht! Unser System hat Ihre Anfrage registriert. Sie können direkt über /randevu einen 15-minütigen kostenlosen Architekturtermin buchen oder Ihre Frage hier noch einmal stellen.'
              : language === 'en'
              ? 'Thank you for your inquiry! Our systems have registered your request. You can schedule a complimentary 15-minute architecture session directly at /randevu or leave your contact details here.'
              : 'Talebinizi ve sorunuzu aldık! Next.js 14 sub-second altyapımız, yerel Ollama AI ajanlarımız ve ücretsiz randevu/takvim entegrasyonu hakkında doğrudan 15 dakikalık ücretsiz mimari görüşmesi planlamak için /randevu sayfamızı ziyaret edebilir veya ad-soyad/e-posta bilgilerinizi buradan paylaşabilirsiniz.',
        },
      ]);
    },
  });

  // Keep initial welcome message synced when language switches and user hasn't messaged yet
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === 'welcome') {
      const activeWelcome = (chatTranslations[language] || chatTranslations.tr).welcome;
      if (messages[0].content !== activeWelcome) {
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: activeWelcome,
          },
        ]);
      }
    }
  }, [language, messages, setMessages]);

  // Proactive Engagement Trigger
  useEffect(() => {
    if (!hasOpenedAutomatically && !isOpen) {
      if (timeOnPage > 25 || (activeSection === 'comparison' && timeOnPage > 12)) {
        setIsOpen(true);
        setHasOpenedAutomatically(true);
      }
    }
  }, [timeOnPage, activeSection, isOpen, hasOpenedAutomatically]);

  // IMPORTANT FIX: Only auto-scroll to the bottom when there are multiple messages (actual back-and-forth)
  useEffect(() => {
    if (messages.length > 1 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isLoading]);

  // IMPORTANT FIX: When the modal opens with initial greeting, always stay scrolled to the top so greeting is 100% visible!
  useEffect(() => {
    if (isOpen && messages.length <= 1) {
      const scrollIt = () => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0;
        }
      };
      scrollIt();
      const t1 = setTimeout(scrollIt, 60);
      const t2 = setTimeout(scrollIt, 200);
      const t3 = setTimeout(scrollIt, 400);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [isOpen, messages.length]);

  const handleQuickAction = async (promptText: string) => {
    if (isLoading) return;
    try {
      await append({ role: 'user', content: promptText });
    } catch (err) {
      console.warn('Quick action error:', err);
    }
  };

  const handleHeaderAction = () => {
    const el = document.querySelector('#audit') || document.querySelector('#simulation');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!mounted) {
    return <div data-ai-widget="starwebflow-autonomous-agent" data-crm-sync="active" aria-hidden="true" className="sr-only" />;
  }

  const hasLiveContext = Boolean(visitorContext.auditedDomain || visitorContext.specTitle);

  return (
    <div
      data-ai-widget="starwebflow-autonomous-agent"
      data-crm-sync="active"
      className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 z-[9999] flex flex-col items-end font-sans pointer-events-none"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="w-full sm:w-[420px] h-[610px] max-h-[calc(100dvh-40px)] mb-3 bg-white/98 backdrop-blur-2xl border border-slate-200/90 rounded-3xl shadow-[0_24px_70px_rgba(15,23,42,0.18)] flex flex-col overflow-hidden relative pointer-events-auto"
          >
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

            {/* Header */}
            <div className="bg-slate-50/95 px-4 sm:px-5 py-3.5 flex justify-between items-center border-b border-slate-200 relative z-10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 border border-white">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full shadow-xs animate-pulse" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
                    {tChat.headerTitle}
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      18ms
                    </span>
                  </h4>
                  <p className="text-[10.5px] text-slate-500 font-medium leading-tight">{tChat.headerSubtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleHeaderAction}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 text-xs font-bold transition-all border border-blue-200 shadow-2xs"
                  title="Canlı Analiz Başlat"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{tChat.actionButtonLabel}</span>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-slate-200/70 text-slate-500 hover:text-slate-800 rounded-xl transition-colors cursor-pointer"
                  aria-label={tChat.closeLabel}
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cross-Widget Live Memory Banner */}
            {hasLiveContext && (
              <div className="bg-slate-900 px-4 py-2 text-white border-b border-slate-800 relative z-10 shrink-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    {language === 'tr' ? 'Canlı Hafıza Aktif' : language === 'de' ? 'Live-Kontext Aktiv' : 'Live Memory Active'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {visitorContext.auditedDomain && (
                    <button
                      type="button"
                      onClick={() =>
                        append({
                          role: 'user',
                          content:
                            language === 'tr'
                              ? `Az önce ${visitorContext.auditedDomain} sitemi tarattım (Skor: ${visitorContext.auditScore}/100). Bu açıkları kapatmak için Starwebflow nasıl bir mimari önerir?`
                              : language === 'de'
                              ? `Ich habe gerade ${visitorContext.auditedDomain} gescannt (Score: ${visitorContext.auditScore}/100). Welche Lösung empfehlen Sie?`
                              : `I just scanned ${visitorContext.auditedDomain} (Score: ${visitorContext.auditScore}/100). What architecture do you recommend?`,
                        })
                      }
                      className="inline-flex items-center gap-1 text-[10.5px] bg-slate-800 hover:bg-slate-700 text-blue-200 px-2 py-0.5 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                    >
                      <Globe className="w-3 h-3 text-cyan-400" />
                      <span>{visitorContext.auditedDomain} ({visitorContext.auditScore}/100)</span>
                    </button>
                  )}
                  {visitorContext.specTitle && (
                    <button
                      type="button"
                      onClick={() =>
                        append({
                          role: 'user',
                          content:
                            language === 'tr'
                              ? `Az önce "${visitorContext.specTitle}" için CTO mimari taslağı oluşturdum. Bu projenin geliştirme süreci ve teklifi hakkında görüşebilir miyiz?`
                              : language === 'de'
                              ? `Ich habe gerade den CTO-Entwurf "${visitorContext.specTitle}" erstellt. Können wir über das Angebot sprechen?`
                              : `I just created the CTO blueprint "${visitorContext.specTitle}". Can we discuss the development timeline?`,
                        })
                      }
                      className="inline-flex items-center gap-1 text-[10.5px] bg-slate-800 hover:bg-slate-700 text-purple-200 px-2 py-0.5 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                    >
                      <Cpu className="w-3 h-3 text-purple-400" />
                      <span className="truncate max-w-[200px]">{visitorContext.specTitle}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Chat Body */}
            <div className="flex-1 overflow-hidden flex flex-col bg-slate-50/60 relative z-10">
              <div
                ref={scrollContainerRef}
                className="flex-1 p-4 overflow-y-auto overflow-x-hidden flex flex-col gap-3 scrollbar-thin scrollbar-thumb-slate-300"
              >
                {messages.map((msg: any) => {
                  const formatted =
                    msg.role !== 'user'
                      ? formatMessageWithLeadCard(msg.content, language)
                      : { cleanText: msg.content, leadCaptured: null };

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 max-w-[94%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
                    >
                      {msg.role !== 'user' && (
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <div
                          className={`rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-xs whitespace-pre-wrap break-words ${
                            msg.role === 'user'
                              ? 'bg-blue-600 text-white rounded-tr-xs font-medium'
                              : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs font-normal'
                          }`}
                        >
                          {formatted.cleanText}
                        </div>

                        {/* Interactive Direct Booking Action Card if assistant recommends scheduling */}
                        {msg.role !== 'user' &&
                          (formatted.cleanText.includes('/randevu') ||
                            formatted.cleanText.includes('randevu') ||
                            formatted.cleanText.includes('Termin') ||
                            formatted.cleanText.includes('appointment')) && (
                            <Link
                              href="/randevu"
                              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer group"
                            >
                              <Calendar className="w-4 h-4 text-blue-100" />
                              <span>
                                {language === 'de'
                                  ? '📅 15-Minütigen Termin Direkt Buchen'
                                  : language === 'en'
                                  ? '📅 Book 15-Minute Architecture Review'
                                  : '📅 15 Dakikalık Ücretsiz Randevuyu Şimdi Planla'}
                              </span>
                              <ArrowRight className="w-3.5 h-3.5 text-blue-200 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                          )}

                        {formatted.leadCaptured && (
                          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-950 shadow-2xs">
                            <div className="flex items-center gap-1.5 font-bold text-emerald-800 mb-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>
                                {language === 'de'
                                  ? 'Anfrage im CRM registriert'
                                  : language === 'en'
                                  ? 'Inquiry Registered in CRM'
                                  : 'Talebiniz Öncelikli Olarak CRM Sistemine Kaydedildi'}
                              </span>
                            </div>
                            <div className="text-[11px] text-emerald-900 space-y-0.5 font-medium">
                              {formatted.leadCaptured.name && <div>• <strong>Ad/Name:</strong> {formatted.leadCaptured.name}</div>}
                              {formatted.leadCaptured.email && <div>• <strong>E-Mail:</strong> {formatted.leadCaptured.email}</div>}
                              {formatted.leadCaptured.phone && <div>• <strong>Tel:</strong> {formatted.leadCaptured.phone}</div>}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Quick Actions (Compact smart grid, perfectly visible without scrolling) */}
                {messages.length === 1 && !isLoading && (
                  <div className="grid grid-cols-2 gap-2 mt-1.5 w-full animate-fade-in-up">
                    {tChat.quickActions.map((qa, idx) => {
                      const isLastSolo =
                        idx === tChat.quickActions.length - 1 && tChat.quickActions.length % 2 !== 0;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleQuickAction(qa.prompt)}
                          className={`text-left bg-white hover:bg-blue-50/90 text-slate-800 hover:text-blue-700 border border-slate-200/90 hover:border-blue-300 rounded-xl p-2.5 transition-all flex flex-col justify-between gap-1 shadow-2xs cursor-pointer group active:scale-[0.98] ${
                            isLastSolo
                              ? 'col-span-2 bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-blue-50/80 border-blue-200 text-blue-900'
                              : ''
                          }`}
                        >
                          <span className="text-[11px] sm:text-[11.5px] font-bold line-clamp-2 leading-snug">
                            {qa.label}
                          </span>
                          <span className="text-[10px] text-blue-600 font-bold flex items-center gap-0.5">
                            İncele <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {isLoading && (
                  <div className="flex gap-2.5 max-w-[85%] self-start">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-white animate-pulse" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-2.5 text-sm flex gap-1.5 items-center shadow-xs">
                      <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white border-t border-slate-200 shrink-0">
                <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder={tChat.placeholder}
                      value={input || ''}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-3.5 pr-9 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-2xs"
                    />
                    <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 pointer-events-none" />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || !(input || '').trim()}
                    className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white flex-shrink-0 disabled:opacity-40 hover:shadow-md hover:shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </form>
                <div className="mt-2 flex items-center justify-center gap-1.5 text-[10.5px] text-slate-500 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{tChat.footerBadge}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-[0_8px_30px_rgba(37,99,235,0.35)] hover:shadow-[0_12px_40px_rgba(37,99,235,0.45)] hover:scale-105 active:scale-95 transition-all relative group overflow-hidden border border-white/20 pointer-events-auto"
        aria-label="Chatbotu Aç/Kapat"
      >
        {!isOpen && (
          <span className="absolute inset-0 rounded-2xl border border-blue-400/40 animate-ping pointer-events-none scale-105" />
        )}
        {hasLiveContext && !isOpen && (
          <span className="absolute top-2 right-2 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900 z-20" />
        )}

        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="bot"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center"
            >
              <Bot className="w-7 h-7" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
