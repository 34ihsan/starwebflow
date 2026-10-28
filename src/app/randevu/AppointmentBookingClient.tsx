'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { createPublicBooking } from '@/app/actions/appointment';
import {
  Calendar as CalendarIcon,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Bot,
  Workflow,
  Globe,
  Building2,
  Mail,
  Phone,
  User,
  FileText,
  Sparkles,
  Lock,
  Server,
  Check,
  ExternalLink,
  Download,
  AlertCircle,
  HelpCircle,
  Layers,
} from 'lucide-react';

interface TopicOption {
  id: string;
  title: string;
  badge: string;
  desc: string;
  icon: any;
  color: string;
}

const TOPICS: Record<string, TopicOption[]> = {
  tr: [
    {
      id: 'sovereign-ai',
      title: 'Sovereign AI & Dedike Ollama Ajanları',
      badge: 'Veri Egemenliği',
      desc: 'Müşteri verilerinizi açık bulutlara sızdırmadan kendi VPS sunucunuzda (Almanya/TR) çalışan yerel LLM kurulumu ve mimarisi.',
      icon: Bot,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
    {
      id: 'automation-n8n',
      title: 'n8n & Süreç/CRM Otomasyonu',
      badge: 'Operasyonel Hız',
      desc: 'Gelen taleplerin filtrelenmesi, otomatik teklif/fatura üretimi ve CRM otopilot iş akışları.',
      icon: Workflow,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      id: 'nextjs-web',
      title: 'Sub-Second Next.js 14 Web & Müşteri Portalı',
      badge: '0.8s LCP',
      desc: 'Yüksek dönüşüm oranlı, ışık hızında açılan kurumsal web sistemleri ve güvenli B2B müşteri portalları.',
      icon: Globe,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      id: 'live-audit',
      title: 'Mevcut Site Canlı Denetimi & Ciro Kaçağı',
      badge: 'Teknik Audit',
      desc: 'Mevcut web sitenizin hız, A+ SSL güvenlik, SEO ve dönüşüm kaçaklarının canlı ekran paylaşımıyla analizi.',
      icon: Layers,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
  ],
  de: [
    {
      id: 'sovereign-ai',
      title: 'Sovereign AI & Lokale Ollama-Agenten',
      badge: '100% DSGVO',
      desc: 'Dedizierte VPS-Architektur in Frankfurt ohne Cloud-Datenweitergabe an Dritte. Vollständige Datenhoheit.',
      icon: Bot,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
    {
      id: 'automation-n8n',
      title: 'n8n & CRM-Prozessautomatisierung',
      badge: 'Effizienz',
      desc: 'Automatisierte Lead-Qualifizierung, Rechnungs- und Angebotserstellung sowie CRM-Synchronisation.',
      icon: Workflow,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      id: 'nextjs-web',
      title: 'Next.js 14 Plattform & B2B-Kundenportal',
      badge: 'LCP < 0.8s',
      desc: 'Hochperformante Web-Plattformen nach DIN ISO 25010 und geschützte Kundenportale mit RBAC.',
      icon: Globe,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      id: 'live-audit',
      title: 'Live-Architektur & Performance-Audit',
      badge: 'Technischer Audit',
      desc: 'Direkte Analyse Ihrer bestehenden Website auf Ladezeiten, Sicherheitslücken und Conversion-Verluste.',
      icon: Layers,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
  ],
  en: [
    {
      id: 'sovereign-ai',
      title: 'Sovereign AI & Local Ollama Agents',
      badge: 'Data Sovereignty',
      desc: 'Deploy local LLMs on your dedicated VPS (Frankfurt/TR) with zero cloud data exposure and zero per-token fees.',
      icon: Bot,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
    {
      id: 'automation-n8n',
      title: 'n8n & Workflow / CRM Automation',
      badge: 'Operational Speed',
      desc: 'Eliminate repetitive manual tasks with automated lead routing, invoice dispatch, and custom webhook flows.',
      icon: Workflow,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      id: 'nextjs-web',
      title: 'Sub-Second Next.js 14 Web & Client Portals',
      badge: '0.8s LCP',
      desc: 'Enterprise web systems engineered for sub-second speeds, top SEO rankings, and secure B2B portals.',
      icon: Globe,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      id: 'live-audit',
      title: 'Live Architecture & Security Audit',
      badge: 'Technical Audit',
      desc: 'Live screen-share diagnostic analyzing latency bottlenecks, security headers, and revenue leaks.',
      icon: Layers,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
  ],
};

const TIME_SLOTS = ['10:00', '11:30', '14:00', '15:30', '17:00'];

// Generates next 10 business days starting tomorrow
function getAvailableDays() {
  const days: { dateStr: string; displayLabel: string; dayName: string }[] = [];
  const current = new Date();
  let count = 0;

  while (days.length < 10 && count < 20) {
    count++;
    current.setDate(current.getDate() + 1);
    const dayOfWeek = current.getDay();
    // Exclude weekends (0: Sunday, 6: Saturday)
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    const dd = String(current.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const dayName = current.toLocaleDateString('tr-TR', { weekday: 'short' });
    const displayLabel = current.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });

    days.push({ dateStr, displayLabel, dayName });
  }

  return days;
}

export default function AppointmentBookingClient() {
  const { language } = useLanguage();
  const langKey = language === 'de' ? 'de' : language === 'en' ? 'en' : 'tr';
  const topicList = TOPICS[langKey] || TOPICS.tr;
  const days = getAvailableDays();

  // Wizard state
  const [selectedTopic, setSelectedTopic] = useState<string>(topicList[0].id);
  const [selectedDate, setSelectedDate] = useState<string>(days[0]?.dateStr || '');
  const [selectedSlot, setSelectedSlot] = useState<string>(TIME_SLOTS[1]); // Default 11:30
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);

  const activeTopicObj = topicList.find((t) => t.id === selectedTopic) || topicList[0];

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!clientName.trim() || !clientEmail.trim()) {
      setErrorMessage(
        language === 'de'
          ? 'Bitte geben Sie Ihren Namen und Ihre geschäftliche E-Mail-Adresse an.'
          : language === 'en'
          ? 'Please enter your name and business email address.'
          : 'Lütfen adınızı ve kurumsal e-posta adresinizi giriniz.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createPublicBooking({
        clientName,
        clientEmail,
        clientPhone,
        companyName,
        topic: activeTopicObj.title,
        notes,
        dateStr: selectedDate,
        timeSlot: selectedSlot,
      });

      if (res.success && res.appointment) {
        setConfirmedBooking(res.appointment);
      } else {
        setErrorMessage(res.error || 'Randevu oluşturulamadı. Lütfen tekrar deneyiniz.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Bağlantı hatası oluştu. Lütfen tekrar deneyiniz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to generate and download .ics calendar invite
  const downloadICS = () => {
    if (!confirmedBooking) return;
    const start = new Date(confirmedBooking.startTime);
    const end = new Date(confirmedBooking.endTime);

    const pad = (n: number) => (n < 10 ? '0' + n : n);
    const formatDate = (d: Date) =>
      `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(
        d.getUTCHours()
      )}${pad(d.getUTCMinutes())}00Z`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Starwebflow Engineering//Appointment//TR',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:swf-${confirmedBooking.id}@starwebflow.com`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(start)}`,
      `DTEND:${formatDate(end)}`,
      `SUMMARY:${confirmedBooking.title}`,
      `DESCRIPTION:Starwebflow 15 Dakikalık Ücretsiz Mimari & Fizibilite Değerlendirmesi.\\nToplantı Linki: ${confirmedBooking.meetLink}`,
      `URL:${confirmedBooking.meetLink}`,
      `LOCATION:${confirmedBooking.meetLink}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Starwebflow-Randevu-${selectedDate}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full">
      {/* Hero Header */}
      <section className="pt-32 pb-12 sm:pt-40 sm:pb-16 bg-gradient-to-b from-blue-50/50 via-slate-50/30 to-white border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/90 text-blue-700 text-xs font-semibold tracking-wide mb-6 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>
              {language === 'de'
                ? '15-Minütige Kostenlose Architektur- & Machbarkeitsprüfung'
                : language === 'en'
                ? 'Complimentary 15-Minute Architecture & Feasibility Session'
                : '15 Dakikalık Ücretsiz Mimari & Fizibilite Değerlendirmesi'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] mb-6 font-['Outfit']">
            {language === 'de' ? (
              <>
                Souveräne IT-Architektur & AI-Systeme{' '}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Auf Augenhöhe Planen.
                </span>
              </>
            ) : language === 'en' ? (
              <>
                Plan Your Sovereign AI & Systems Architecture{' '}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Directly With Engineers.
                </span>
              </>
            ) : (
              <>
                Altyapınızı, AI Ajanlarınızı ve Otomasyon Potansiyelinizi{' '}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Birlikte Planlayalım.
                </span>
              </>
            )}
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            {language === 'de'
              ? 'Kein Verkaufsdruck, sondern handfeste Ingenieursarbeit. Besprechen Sie lokale Ollama-Modelle, n8n-Workflows oder Sub-Second Next.js Plattformen direkt mit unserem leitenden Software-Architekten.'
              : language === 'en'
              ? 'Zero aggressive sales talk, purely engineering-driven clarity. Discuss local Ollama models, n8n pipeline sync, and sub-second Next.js 14 platforms directly with our senior software architect.'
              : 'Satış baskısı veya boş vaatler olmadan; doğrudan kod, sunucu güvenliği, veri egemenliği ve operasyonel ROI odaklı teknik görüşme. Projenizi dakikalar içinde netleştirelim.'}
          </p>

          {/* Trust points bar */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>15 Dakika Net Odak</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>%100 DSGVO & KVKK Gizliliği</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Server className="w-4 h-4 text-purple-600" />
              <span>Frankfurt & TR Dedike VPS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              <span>Ücretsiz Mimari Yol Haritası</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Scheduling Section */}
      <section className="py-12 sm:py-20 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {confirmedBooking ? (
            /* Confirmation Success Screen */
            <div className="max-w-2xl mx-auto bg-white border border-emerald-200/90 rounded-3xl p-8 sm:p-12 shadow-[0_20px_50px_rgba(16,185,129,0.1)] text-center animate-fade-in-up">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold mb-3">
                <span>
                  {language === 'de'
                    ? 'Termin Bestätigt'
                    : language === 'en'
                    ? 'Appointment Confirmed'
                    : 'Randevunuz Başarıyla Oluşturuldu'}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-3">
                {language === 'de'
                  ? 'Wir freuen uns auf das Gespräch!'
                  : language === 'en'
                  ? 'Looking Forward to Meeting You!'
                  : 'Harika! Randevunuz Takvime İşlendi.'}
              </h2>

              <p className="text-slate-600 text-sm leading-relaxed mb-8 max-w-lg mx-auto">
                {language === 'de'
                  ? 'Eine Bestätigungsmail mit dem Google Meet Link wurde an Ihre Adresse gesendet. Sie können den Termin auch direkt zu Ihrem Kalender hinzufügen.'
                  : language === 'en'
                  ? 'A confirmation email with the Google Meet link has been dispatched to your email. You can also save it directly to your calendar.'
                  : 'Toplantı detayları ve Google Meet bağlantısı e-posta adresinize iletildi. Görüşmeyi unutmamak için tek tıkla takviminize ekleyebilirsiniz.'}
              </p>

              {/* Booking Summary Box */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 text-left text-sm mb-8 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Görüşme Konusu:</span>
                  <span className="font-bold text-slate-900">{confirmedBooking.title}</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Katılımcı:</span>
                  <span className="font-bold text-slate-900">
                    {confirmedBooking.clientName} ({confirmedBooking.clientEmail})
                  </span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Tarih & Saat:</span>
                  <span className="font-bold text-blue-600">
                    {new Date(confirmedBooking.startTime).toLocaleString('tr-TR', {
                      dateStyle: 'full',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Toplantı Bağlantısı:</span>
                  <a
                    href={confirmedBooking.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                  >
                    <span>Google Meet Katıl</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={downloadICS}
                  className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Takvime Ekle (.ics İndir)</span>
                </button>
                <Link
                  href="/"
                  className="px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center transition-all"
                >
                  Ana Sayfaya Dön
                </Link>
              </div>
            </div>
          ) : (
            /* Booking Form Grid */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Form Steps (8 Cols) */}
              <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
                <form onSubmit={handleSubmitBooking} className="space-y-8">
                  {/* Step 1: Select Topic */}
                  <div>
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                        1
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                        {language === 'de'
                          ? 'Welches Thema möchten Sie primär besprechen?'
                          : language === 'en'
                          ? 'Which architecture focus would you like to discuss?'
                          : 'Öncelikli olarak hangi mimariyi incelemek istersiniz?'}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {topicList.map((t) => {
                        const Icon = t.icon;
                        const isSelected = selectedTopic === t.id;
                        return (
                          <div
                            key={t.id}
                            onClick={() => setSelectedTopic(t.id)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-600/20 shadow-xs'
                                : 'bg-slate-50/50 hover:bg-white border-slate-200/90 hover:border-slate-300'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2.5">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${t.color}`}
                                >
                                  {t.badge}
                                </span>
                                {isSelected ? (
                                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 rounded-full border border-slate-300" />
                                )}
                              </div>
                              <h3 className="font-bold text-sm text-slate-900 mb-1.5 flex items-center gap-1.5">
                                <Icon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                <span>{t.title}</span>
                              </h3>
                              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                                {t.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2: Date & Slot Picker */}
                  <div className="pt-6 border-t border-slate-200/80">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                          2
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                          {language === 'de'
                            ? 'Datum & Uhrzeit wählen'
                            : language === 'en'
                            ? 'Select Date & Timeslot'
                            : 'Görüşme Tarihi ve Saati Seçin'}
                        </h2>
                      </div>
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        <span>CET / TRT Saat Dilimi</span>
                      </span>
                    </div>

                    {/* Date Horizontal Selector */}
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-slate-700 mb-2">
                        {language === 'de' ? 'Verfügbare Tage:' : language === 'en' ? 'Available Days:' : 'Uygun Günler:'}
                      </label>
                      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                        {days.map((d) => {
                          const isSelected = selectedDate === d.dateStr;
                          return (
                            <button
                              key={d.dateStr}
                              type="button"
                              onClick={() => setSelectedDate(d.dateStr)}
                              className={`p-2 rounded-xl text-center border transition-all cursor-pointer flex flex-col items-center justify-center ${
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                              }`}
                            >
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider ${
                                  isSelected ? 'text-blue-100' : 'text-slate-400'
                                }`}
                              >
                                {d.dayName}
                              </span>
                              <span className="text-xs sm:text-sm font-black mt-0.5">
                                {d.displayLabel}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time Slot Selector */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">
                        {language === 'de' ? 'Uhrzeit (15 Min):' : language === 'en' ? 'Timeslot (15 Mins):' : 'Saat Dilimi (15 Dakika):'}
                      </label>
                      <div className="flex flex-wrap gap-2.5">
                        {TIME_SLOTS.map((slot) => {
                          const isSelected = selectedSlot === slot;
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setSelectedSlot(slot)}
                              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                  : 'bg-slate-50 hover:bg-white border-slate-200 text-slate-700'
                              }`}
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>{slot}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Contact Details */}
                  <div className="pt-6 border-t border-slate-200/80">
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                        3
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                        {language === 'de'
                          ? 'Ihre Kontaktdaten'
                          : language === 'en'
                          ? 'Your Contact Information'
                          : 'İletişim & Katılımcı Bilgileri'}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Ad & Soyad <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            placeholder="Örn: Ahmet Yılmaz"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            className="w-full bg-slate-50/70 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                          />
                          <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Kurumsal E-posta <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            required
                            placeholder="ahmet@sirketiniz.com"
                            value={clientEmail}
                            onChange={(e) => setClientEmail(e.target.value)}
                            className="w-full bg-slate-50/70 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                          />
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Telefon / WhatsApp (İsteğe Bağlı)
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            placeholder="+90 532 ... veya +49 176 ..."
                            value={clientPhone}
                            onChange={(e) => setClientPhone(e.target.value)}
                            className="w-full bg-slate-50/70 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                          />
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Şirket Adı & Web Sitesi (İsteğe Bağlı)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Şirket A.Ş. / sirketiniz.com"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="w-full bg-slate-50/70 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                          />
                          <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Görüşmede Öncelikli Olarak Değinmek İstediğiniz Not (İsteğe Bağlı)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Örn: 50 çalışanımız var, gelen müşteri lead'lerini n8n ile Pipedrive CRM'e bağlamak ve yerel Ollama ile otomatik yanıtlamak istiyoruz..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full bg-slate-50/70 border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                      />
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Submit CTA */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Bilgileriniz 3. taraflarla paylaşılmaz. %100 DSGVO ve KVKK uyumludur.</span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-sm shadow-[0_10px_25px_rgba(37,99,235,0.25)] hover:shadow-[0_14px_35px_rgba(37,99,235,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Randevu İşleniyor...</span>
                        </>
                      ) : (
                        <>
                          <span>15 Dakikalık Görüşmeyi Onayla</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Value Guarantee & FAQ Sidebar (4 Cols) */}
              <div className="lg:col-span-4 space-y-6">
                {/* Engineer Guarantee Card */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
                  <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    <span>Görüşme Garantilerimiz</span>
                  </h3>
                  <ul className="space-y-3 text-xs text-slate-600 leading-relaxed font-normal">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Doğrudan Yazılım Mimarı:</strong> Satış temsilcisi yerine doğrudan sistemi kuracak kıdemli mühendisle görüşürsünüz.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Gerçek Maliyet Şeffaflığı:</strong> Aylık token faturaları yerine VPS sunucu maliyetini ve tek seferlik kurulum ROI’sini konuşuruz.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Yazılı Lastenheft Notu:</strong> Görüşmenin ardından projenizin mimari gereksinim dökümünü ücretsiz olarak iletiriz.
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Direct Contact Card */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-md">
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-2">
                    <HelpCircle className="w-4 h-4" />
                    <span>Acil Bir Projeniz mi Var?</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    Randevu saatini beklemeden doğrudan e-posta veya telefon ile de ekibimize ulaşabilirsiniz.
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-200">
                      <Mail className="w-3.5 h-3.5 text-blue-400" />
                      <span>info@starwebflow.com</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-200">
                      <Globe className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Frankfurt am Main / İstanbul</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
