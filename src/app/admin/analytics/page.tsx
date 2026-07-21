import { format, subDays } from "date-fns";
import { Filter, ChevronDown, Activity, ArrowRight, Layers, Users, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AnalyticsDashboardPage() {
  const thirtyDaysAgo = subDays(new Date(), 30);
  
  // REAL DATA from Prisma PageView & Lead
  const totalLeads = await prisma.lead.count({
    where: { createdAt: { gte: thirtyDaysAgo } }
  });
  
  const totalClicks = await prisma.linkClick.count({
    where: { createdAt: { gte: thirtyDaysAgo } }
  });

  const dbPageViewsCount = await prisma.pageView.count({
    where: { createdAt: { gte: thirtyDaysAgo } }
  });

  const uniqueVisitorGroups = await prisma.pageView.groupBy({
    by: ['visitorId'],
    where: { createdAt: { gte: thirtyDaysAgo } }
  });

  const uniqueVisitorsCount = uniqueVisitorGroups.length;
  const totalSessions = uniqueVisitorsCount > 0 ? uniqueVisitorsCount : (totalClicks || 1);
  const totalPageViews = dbPageViewsCount > 0 ? dbPageViewsCount : await prisma.linkClick.count();
  const avgPagesPerSession = totalSessions ? (totalPageViews / totalSessions).toFixed(1) : "0";

  // Aggregate top pages from PageView table
  const dbTopPages = await prisma.pageView.groupBy({
    by: ['path'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5
  });

  // Aggregate traffic sources from LinkTracking
  const linkTrackings = await prisma.linkTracking.findMany({
    include: { _count: { select: { clicks: true } } },
    orderBy: { clicks: { _count: 'desc' } },
    take: 5
  });

  const trafficSources = linkTrackings.length > 0 
    ? linkTrackings.map(t => ({ name: t.utmSource || 'direct', value: t._count.clicks }))
    : [{ name: 'organik', value: totalSessions }];

  const topPagesData = dbTopPages.length > 0
    ? dbTopPages.map(p => ({ path: p.path, _count: { id: p._count.id } }))
    : linkTrackings.map(t => ({ path: t.originalUrl, _count: { id: t._count.clicks } }));

  const recentLeads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  // Fetch real page views for each lead's visitorId
  const leadsWithSessions = await Promise.all(
    recentLeads.map(async (lead: any) => {
      let pageViews: any[] = [];
      if (lead.visitorId) {
        pageViews = await prisma.pageView.findMany({
          where: { visitorId: lead.visitorId },
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            path: true,
            createdAt: true,
            duration: true,
            referrer: true,
          }
        });
      }

      return {
        id: lead.id,
        firstName: lead.name?.split(' ')[0] || '',
        lastName: lead.name?.split(' ').slice(1).join(' ') || '',
        email: lead.email || '',
        company: lead.company || '',
        createdAt: lead.createdAt.toISOString(),
        trackingSession: {
          utmSource: lead.source || 'organik',
          pageViews: pageViews.map(pv => ({
            id: pv.id,
            path: pv.path,
            createdAt: pv.createdAt.toISOString(),
            duration: pv.duration,
            referrer: pv.referrer,
          }))
        }
      };
    })
  );

  const wonLeadsCount = await prisma.lead.count({ where: { status: 'won' } });

  const funnelData = [
    { step: "Ziyaretçi (Site Trafiği)", count: totalSessions, conversion: null },
    { step: "Tıklamalar (Kısa Linkler)", count: totalClicks, conversion: totalSessions ? Math.round((totalClicks / totalSessions) * 100) : 0 },
    { step: "Aday (İletişim/Lead Formu)", count: totalLeads, conversion: totalClicks ? Math.round((totalLeads / totalClicks) * 100) : 0 },
    { step: "Müşteri (Satış)", count: wonLeadsCount, conversion: totalLeads ? Math.round((wonLeadsCount / totalLeads) * 100) : 0 },
  ];

  const cohortData: any[] = [];

  const getCohortColor = (value: number | null) => {
    if (value === null) return "bg-transparent";
    if (value >= 80) return "bg-[#10B981]/80 text-white";
    if (value >= 60) return "bg-[#10B981]/50 text-white";
    if (value >= 40) return "bg-[#10B981]/30 text-white";
    return "bg-[#10B981]/10 text-[#94A3B8]";
  };

  return (
    <div className="space-y-8 p-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <span className="bg-gradient-to-r from-emerald-400 via-[#4F8EF7] to-purple-500 bg-clip-text text-transparent">
            Gelişmiş Analitik & Metrikler
          </span>
        </h1>
        <p className="text-[#94A3B8] mt-2">
          Huni analizi (Funnel), Kohort analizleri (Retention) ve trafik performans metrikleri.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-6 bg-[#0A0A0F] border border-white/[0.05] rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#4F8EF7]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <p className="text-sm font-medium text-[#94A3B8]">Toplam Oturum (30 Gün)</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">{totalSessions.toLocaleString()}</span>
          </div>
        </div>

        <div className="p-6 bg-[#0A0A0F] border border-white/[0.05] rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <p className="text-sm font-medium text-[#94A3B8]">Sayfa Görüntüleme</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">{totalPageViews.toLocaleString()}</span>
          </div>
        </div>

        <div className="p-6 bg-[#0A0A0F] border border-white/[0.05] rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#10B981]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <p className="text-sm font-medium text-[#94A3B8]">Oturum Başına Sayfa</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">{avgPagesPerSession}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Satış Hunisi (Funnel) */}
        <div className="p-8 bg-[#0A0A0F] border border-white/[0.05] rounded-2xl">
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <Filter className="w-5 h-5 text-[#8B5CF6]" />
            Dönüşüm Hunisi (Funnel)
          </h2>
          <p className="text-[#94A3B8] text-sm mb-8">Ziyaretçilerin müşteriye dönüşme aşamaları ve kaçak oranları.</p>
          
          <div className="space-y-2 flex flex-col items-center w-full">
            {funnelData.map((data, idx) => {
              // calculate width decreasing from 100% down to roughly 40%
              const widthStr = `${100 - (idx * 20)}%`; 
              const colors = ["bg-[#4F8EF7]", "bg-[#6366F1]", "bg-[#8B5CF6]", "bg-[#10B981]"];
              const bgColor = colors[idx % colors.length];

              return (
                <div key={idx} className="w-full flex flex-col items-center">
                  <div 
                    className={`${bgColor} h-16 rounded-lg flex items-center justify-between px-6 shadow-lg transition-all hover:scale-[1.02]`}
                    style={{ width: widthStr }}
                  >
                    <span className="text-white font-semibold text-sm drop-shadow-md">{data.step}</span>
                    <span className="text-white font-bold text-lg drop-shadow-md">{data.count.toLocaleString()}</span>
                  </div>
                  {data.conversion !== null && (
                    <div className="flex flex-col items-center text-[#94A3B8] text-xs font-semibold py-2">
                      <ArrowRight className="w-4 h-4 rotate-90 text-[#64748B] mb-1" />
                      {data.conversion}% Dönüşüm
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Cohort Analizi (Retention) */}
        <div className="p-8 bg-[#0A0A0F] border border-white/[0.05] rounded-2xl overflow-x-auto">
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#10B981]" />
            Cohort Analizi (Elde Tutma / Retention)
          </h2>
          <p className="text-[#94A3B8] text-sm mb-8">Yeni müşterilerin sonraki aylardaki aktiflik oranları (Yüzde).</p>
          
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="text-xs text-[#64748B] uppercase tracking-wider">
                <th className="py-3 px-4 border-b border-white/[0.05]">Kayıt Ayı</th>
                <th className="py-3 px-4 border-b border-white/[0.05]">Kullanıcı</th>
                <th className="py-3 px-4 border-b border-white/[0.05]">Ay 1</th>
                <th className="py-3 px-4 border-b border-white/[0.05]">Ay 2</th>
                <th className="py-3 px-4 border-b border-white/[0.05]">Ay 3</th>
                <th className="py-3 px-4 border-b border-white/[0.05]">Ay 4</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {cohortData.map((row, idx) => (
                <tr key={idx} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-semibold text-white">{row.month}</td>
                  <td className="py-3 px-4 text-[#94A3B8]">{row.total}</td>
                  <td className="py-1 px-1">
                    {row.m1 !== null && <div className={`px-4 py-2 rounded-md font-medium text-center ${getCohortColor(row.m1)}`}>%{row.m1}</div>}
                  </td>
                  <td className="py-1 px-1">
                    {row.m2 !== null && <div className={`px-4 py-2 rounded-md font-medium text-center ${getCohortColor(row.m2)}`}>%{row.m2}</div>}
                  </td>
                  <td className="py-1 px-1">
                    {row.m3 !== null && <div className={`px-4 py-2 rounded-md font-medium text-center ${getCohortColor(row.m3)}`}>%{row.m3}</div>}
                  </td>
                  <td className="py-1 px-1">
                    {row.m4 !== null && <div className={`px-4 py-2 rounded-md font-medium text-center ${getCohortColor(row.m4)}`}>%{row.m4}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Trafik Kaynakları */}
        <div className="p-6 bg-[#0A0A0F] border border-white/[0.05] rounded-2xl">
          <h2 className="text-lg font-semibold text-white mb-4">Trafik Kaynakları (Attribution)</h2>
          <div className="space-y-4">
            {trafficSources.map((source, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${source.name.includes("linkedin") ? "bg-[#4F8EF7]" : source.name.includes("facebook") ? "bg-[#8B5CF6]" : "bg-[#94A3B8]"}`}></div>
                  <span className="text-[#E2E8F0] font-medium capitalize">{source.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-white font-bold">{source.value.toLocaleString()}</span>
                  <span className="text-[#64748B] text-sm">{Math.round((source.value / totalSessions) * 100) || 0}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popüler Sayfalar */}
        <div className="p-6 bg-[#0A0A0F] border border-white/[0.05] rounded-2xl">
          <h2 className="text-lg font-semibold text-white mb-4">En Çok Gezilen Sayfalar</h2>
          <div className="space-y-4">
            {topPagesData.map((page, i) => (
              <div key={i} className="flex items-center justify-between group">
                <span className="text-[#94A3B8] text-sm truncate max-w-[250px] group-hover:text-white transition-colors" title={page.path}>{page.path}</span>
                <span className="text-white font-bold">{page._count.id.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TERS MÜHENDİSLİK: LEAD YOLCULUĞU */}
      <div className="p-8 bg-[#0A0A0F] border border-white/[0.05] rounded-2xl">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Activity className="w-5 h-5 text-rose-500" />
          Lead Dönüşüm Yolculuğu (Ters Mühendislik)
        </h2>
        <p className="text-sm text-[#94A3B8] mb-8">Müşterilerinizin formu doldurmadan önce sitenizde hangi adımları izlediğini görün.</p>
        
        <div className="space-y-6">
          {leadsWithSessions.map(lead => (
            <div key={lead.id} className="border border-white/[0.05] rounded-xl p-6 bg-white/[0.01] hover:bg-white/[0.02] transition-colors">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-white font-semibold text-lg">{lead.firstName} {lead.lastName || ''}</h3>
                  <p className="text-[#94A3B8] text-sm mt-1">{lead.email} • <span className="text-white">{lead.company || 'Bireysel'}</span></p>
                </div>
                <div className="text-right">
                  <span className="inline-flex px-3 py-1 bg-[#4F8EF7]/10 text-[#4F8EF7] text-xs font-semibold rounded-full border border-[#4F8EF7]/20">
                    Kaynak: {lead.trackingSession?.utmSource || 'Organik'}
                  </span>
                </div>
              </div>

              <div className="relative pl-6 border-l border-white/[0.1] space-y-5 ml-2">
                {(lead.trackingSession?.pageViews as any[] || []).length === 0 && (
                  <div className="relative">
                    <div className="absolute -left-[29px] top-1.5 w-3 h-3 rounded-full bg-[#0A0A0F] border-2 border-[#64748B]"></div>
                    <p className="text-sm text-[#94A3B8] italic">
                      Doğrudan Giriş / Sayfa Gezinme Kaydı Yok
                    </p>
                  </div>
                )}
                {(lead.trackingSession?.pageViews as any[] || []).map((pv: any) => (
                  <div key={pv.id} className="relative">
                    <div className="absolute -left-[29px] top-1.5 w-3 h-3 rounded-full bg-[#0A0A0F] border-2 border-[#64748B]"></div>
                    <p className="text-sm text-[#E2E8F0]">
                      Ziyaret: <span className="text-[#4F8EF7] font-medium">{pv.path}</span>
                    </p>
                    <p className="text-xs text-[#64748B] mt-1">
                      {format(new Date(pv.createdAt), 'dd MMM yyyy, HH:mm')} 
                      {pv.duration > 0 && ` • Sayfada ${pv.duration}sn geçirdi`}
                    </p>
                  </div>
                ))}
                
                <div className="relative">
                  <div className="absolute -left-[29px] top-1.5 w-3 h-3 rounded-full bg-[#0A0A0F] border-2 border-[#10B981] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                  <p className="text-sm text-[#10B981] font-semibold">Formu Doldurdu (Dönüşüm!)</p>
                  <p className="text-xs text-[#64748B] mt-1">{format(new Date(lead.createdAt), 'dd MMM yyyy, HH:mm')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
