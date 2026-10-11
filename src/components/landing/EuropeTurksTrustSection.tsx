'use client';

import { useRef, useEffect, useState } from 'react';
import { useRegion } from '@/lib/i18n/RegionContext';
import { ShieldCheck, FileCheck, Globe2, Bot, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function EuropeTurksTrustSection() {
  const { region } = useRegion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="section relative overflow-hidden bg-[#07070D]">
      {/* Glow Effects */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-0 w-96 h-96 rounded-full bg-[#4F8EF7]/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#8B5CF6]/5 blur-3xl" />
      </div>

      <div ref={sectionRef} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#4F8EF7]/10 text-[#4F8EF7] border border-[#4F8EF7]/20 uppercase tracking-widest mb-4">
            <span className="text-sm">🇩🇪</span> Almanya & Avrupa Türk İşletmelerine Özel
          </div>
          <h2 className="heading-lg text-white mb-4">
            Anadilinizde İletişim, <span className="gradient-text">Almanya Yasal Standartlarında</span> Mühendislik
          </h2>
          <p className="text-[#94A3B8] text-base sm:text-lg leading-relaxed">
            Almanya ve Avrupa'daki Türk girişimcilerin ve şirketlerin bürokrasi, <strong className="text-white">DSGVO (Datenschutz)</strong> yasal zorunlulukları ve çift dilli (Türkçe & Almanca) müşteri ilişkileri ihtiyaçlarını mükemmel biliyoruz.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Bot,
              badge: 'Çift Dilli AI Agent',
              title: 'Türkçe & Almanca Otonom Müşteri Desteği',
              desc: 'AI Agent\'larımız gelen müşterinin dilini anında tespit eder. Almanca yazana kusursuz Almanca, Türkçe yazana anadilinde yanıt verip randevu ve sipariş oluşturur.',
              color: '#8B5CF6',
            },
            {
              icon: ShieldCheck,
              badge: '%100 DSGVO & GDPR',
              title: 'Almanya Veri Koruma Yasa Garantisi',
              desc: 'Tüm sunucu ve AI modellerimiz AB (Frankfurt/Europe) lokasyonludur. AVV / DPA sözleşmeleri, Impressum ve Çerez Consent altyapısı hazır teslim edilir.',
              color: '#10B981',
            },
            {
              icon: FileCheck,
              badge: 'Steuerberater Uyumlu',
              title: 'Euro Fatura & Finanzamt Garantisi',
              desc: 'Almanya ve AB vergi sistemine tam uyumlu Almanca/Euro faturalandırma. Muhasebeciniz (Steuerberater) ve Finanzamt süreçleri için %100 sorunsuz evrak altyapısı.',
              color: '#06B6D4',
            },
            {
              icon: Globe2,
              badge: 'Sıfır Dil Engeli',
              title: 'Anadilinizde Proje Yönetimi',
              desc: 'Teknik detaylar içinde boğulmayın. İhtiyacınızı kendi anadilinizde anlatın, Almanya standartlarında dünya sınıfı yazılım ve yapay zeka mimarisiyle teslim alın.',
              color: '#4F8EF7',
            },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className={`dashboard-card p-6 flex flex-col justify-between transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div>
                  <div className="flex justify-between items-start mb-5">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ background: `${card.color}15`, border: `1px solid ${card.color}30` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: card.color }} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border" style={{ color: card.color, borderColor: `${card.color}30`, background: `${card.color}10` }}>
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 leading-snug">
                    {card.title}
                  </h3>

                  <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">
                    {card.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/[0.06] flex items-center gap-2 text-xs font-semibold text-[#10B981]">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>DSGVO & EU Certified</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to action */}
        <div className={`mt-14 text-center transition-all duration-700 delay-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="glass inline-flex flex-col sm:flex-row items-center gap-4 p-4 sm:px-8 rounded-3xl border-white/[0.08]">
            <p className="text-sm text-slate-300 font-medium text-center sm:text-left">
              🇩🇪 <strong className="text-white">Almanya veya AB merkezli bir şirketiniz mi var?</strong> Projenizi anadilinizde konuşalım.
            </p>
            <Link
              href="#contact"
              className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#4F8EF7] to-[#8B5CF6] hover:scale-105 transition-transform flex items-center gap-2 whitespace-nowrap shadow-[0_0_20px_rgba(79,142,247,0.4)]"
            >
              <span>Ücretsiz Danışmanlık Al</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
