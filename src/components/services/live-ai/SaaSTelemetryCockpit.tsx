'use client'

import { useState } from 'react'
import { Server, Database, ShieldCheck, Layers, Cpu, Lock, CheckCircle2, RefreshCw, Zap } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { tri } from './LabKit'

export default function SaaSTelemetryCockpit() {
  const { language } = useLanguage()
  const l = language as 'tr' | 'en' | 'de'
  const [activeTab, setActiveTab] = useState<'architecture' | 'isolation' | 'sla'>('architecture')
  const [pinging, setPinging] = useState(false)
  const [queryTime, setQueryTime] = useState('8.4ms')

  const testDbQuery = () => {
    setPinging(true)
    setTimeout(() => {
      setPinging(false)
      setQueryTime('6.8ms')
    }, 600)
  }

  return (
    <div className="relative rounded-3xl bg-[#07101B] border border-white/[0.08] text-slate-100 p-6 sm:p-7 shadow-2xl overflow-hidden group">
      {/* Ambient gradient glow */}
      <div className="absolute -top-32 -left-32 w-72 h-72 rounded-full blur-3xl opacity-25 pointer-events-none bg-cyan-600" />
      <div className="absolute -bottom-32 -right-32 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none bg-purple-600" />

      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-semibold">
              {tri(l, 'CTO CLOUD ARCHITECTURE KASASI', 'CTO CLOUD ARCHITECTURE VAULT', 'CTO CLOUD ARCHITECTURE VAULT')}
            </span>
          </div>
          <h3 className="text-base font-bold text-white mt-1">
            {tri(l, 'Multi-Tenant Mimari, DB & Yüksek Erişilebilirlik', 'Multi-Tenant Architecture, DB & High Availability', 'Multi-Tenant-Architektur, DB & Hochverfügbarkeit')}
          </h3>
        </div>
        <button
          onClick={testDbQuery}
          disabled={pinging}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-[11px] font-mono text-slate-300 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 text-cyan-400 ${pinging ? 'animate-spin' : ''}`} />
          <span>{pinging ? tri(l, 'SQL Ping…', 'Querying DB…', 'SQL-Ping…') : tri(l, 'DB Latency Ping', 'DB Latency Ping', 'DB-Latenz prüfen')}</span>
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-3 gap-3 my-5">
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1">
            <Server className="w-3 h-3 text-cyan-400" />
            Uptime SLA
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-cyan-400 tracking-tight">99.99%</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{tri(l, 'Yılda < 52dk kesinti', '< 52m downtime/yr', '< 52 Min. Ausfall/Jahr')}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1">
            <Zap className="w-3 h-3 text-emerald-400" />
            P99 DB Query
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-white tracking-tight">{queryTime}</div>
          <div className="text-[10px] text-emerald-400 font-mono mt-0.5">{tri(l, 'Prisma + Connection Pool', 'Prisma Connection Pool', 'Prisma Connection Pool')}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1">
            <Lock className="w-3 h-3 text-purple-400" />
            İzolasyon
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-purple-400 tracking-tight">RLS + Schema</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{tri(l, 'Sıfır veri sızıntısı', 'Zero tenant leak', 'Vollständige Mandantentrennung')}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-4">
        {[
          { id: 'architecture' as const, label: tri(l, 'Mikro-Modüller & Stack', 'Micro-Modules & Stack', 'Mikro-Module & Stack') },
          { id: 'isolation' as const, label: tri(l, 'Multi-Tenant & Güvenlik', 'Tenant Isolation', 'Mandanten-Isolierung') },
          { id: 'sla' as const, label: tri(l, 'Disaster Recovery & SLA', 'Disaster Recovery', 'Disaster Recovery') },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === t.id
                ? 'bg-cyan-600/30 text-white border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'architecture' && (
        <div className="space-y-2.5">
          {[
            {
              layer: 'Frontend & Edge',
              tech: 'Next.js 15 App Router · React 19 · Server Actions',
              desc: tri(l, 'Sayfa yüklenirken sıfır API şelalesi (waterfall); streaming SSR ile veriler anında boyanır.', 'Zero waterfall requests; streamed server-side hydration for maximum responsiveness.', 'Kein API-Waterfall; Streaming Edge-SSR für maximale Reaktionsgeschwindigkeit.'),
            },
            {
              layer: 'Database & ORM',
              tech: 'PostgreSQL 16 · Prisma 7 · pgvector Semantic Index',
              desc: tri(l, 'Connection pooling altyapısı ile binlerce eşzamanlı sorgu kilitlenmeden yönetilir.', 'PgBouncer / connection pooling handles thousands of concurrent ACID writes.', 'Connection-Pooling bewältigt tausende parallele Transaktionen ohne Locks.'),
            },
            {
              layer: 'Asenkron Kuyruk & Cache',
              tech: 'Redis Cluster · BullMQ Background Workers',
              desc: tri(l, 'Ağır PDF raporlama, e-posta gönderimi ve AI işlemleri kullanıcıyı bekletmeden arka planda çalışır.', 'Offloads heavy PDF exports, notifications, and AI jobs to isolated background workers.', 'Lagert schwere PDF-Exporte und KI-Jobs in Hintergrund-Worker aus.'),
            },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div className="flex items-center justify-between text-xs font-semibold text-white mb-1">
                <span>{item.layer}</span>
                <span className="text-cyan-400 font-mono text-[11px]">{item.tech}</span>
              </div>
              <div className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'isolation' && (
        <div className="space-y-2.5">
          {[
            {
              title: tri(l, 'Kriptografik Row-Level Security (RLS)', 'Row-Level Security (RLS) Enforcement', 'Row-Level Security (RLS) Durchsetzung'),
              desc: tri(l, 'PostgreSQL seviyesinde tenant_id filtrelemesi. Geliştirici hata yapsa bile bir firmanın verisi diğerine sızamaz.', 'DB-level tenant constraints prevent cross-tenant data leakage by design.', 'Datenbankweite Mandantentrennung verhindert Datenlecks absolut verlässlich.'),
              badge: 'Kritik Güvenlik',
            },
            {
              title: tri(l, 'Role-Based Access Control (RBAC)', 'Granular RBAC Permission Matrix', 'Granulare RBAC-Rechtematrix'),
              desc: tri(l, 'Kurucu, finans yöneticisi, operasyon ve bayi rolleri için ayrı ayrı ekran ve yetki politikaları.', 'Distinct permission matrices for SuperAdmin, Finance, Staff, and Dealers.', 'Rechteprofile für SuperAdmin, Finanzen, Mitarbeiter und Händler.'),
              badge: 'Role Isolation',
            },
            {
              title: tri(l, 'Değiştirilemez Denetim İzi (Audit Log)', 'Immutable Cryptographic Audit Trails', 'Unveränderbares Audit-Log'),
              desc: tri(l, 'Sistemdeki her para hareketi, oturum açma ve veri düzenleme zaman damgasıyla saklanır.', 'Every financial transaction and permission change is immutably logged.', 'Jede Buchung und Änderung wird unveränderbar protokolliert.'),
              badge: 'SOC 2 Ready',
            },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  {item.title}
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed mt-1">{item.desc}</div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 whitespace-nowrap">
                {item.badge}
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'sla' && (
        <div className="space-y-2.5">
          {[
            {
              title: 'RPO < 60s (Recovery Point Objective)',
              desc: tri(l, 'Sürekli WAL (Write-Ahead Logging) yedekleme; olası felakette maksimum 1 dakikalık veri riski.', 'Continuous WAL replication ensures maximum 60 seconds of data exposure.', 'Kontinuierliche Replikation schützt vor Datenverlust über 60 Sekunden.'),
              metric: 'RPO: 60s',
            },
            {
              title: 'RTO < 5m (Recovery Time Objective)',
              desc: tri(l, 'Otomatik yük devretme (failover) ile sunucu çökse bile 5 dakika içinde sistem ayağa kalkar.', 'Automated health probes trigger secondary container failover under 5 minutes.', 'Automatisches Failover stellt den Dienst in unter 5 Minuten wieder her.'),
              metric: 'RTO: 5min',
            },
            {
              title: tri(l, 'Otomatik Docker & Kubernetes Ölçekleme', 'Dynamic Docker Container Autoscaling', 'Dynamische Container-Skalierung'),
              desc: tri(l, 'Trafik aniden 20 katına çıksa bile CPU/RAM yüküne göre yeni örnekler saniyeler içinde devreye girer.', 'Spike traffic automatically scales stateless containers horizontally in seconds.', 'Traffic-Spitzen skalieren Container in Sekunden horizontal hoch.'),
              metric: 'Autoscale',
            },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  {item.title}
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed mt-1">{item.desc}</div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 whitespace-nowrap">
                {item.metric}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Trust */}
      <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          {tri(l, 'Bespoke Enterprise Source Code Teslimi', 'Full Enterprise IP & Source Code Transfer', 'Vollständige Übergabe des Quellcodes')}
        </span>
        <span className="text-emerald-400 font-semibold">{tri(l, 'Vendor Lock-in Yok', 'Zero Vendor Lock-in', 'Kein Vendor Lock-in')}</span>
      </div>
    </div>
  )
}
