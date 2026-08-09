"use client";

import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Calendar, FolderKanban, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useEffect, useState } from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  isCurrency?: boolean;
  growth?: number; // Yüzdelik büyüme
  subtitle: string;
  icon: React.ReactNode;
  delay: number;
}

const AnimatedNumber = ({ value, isCurrency }: { value: number, isCurrency?: boolean }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    const duration = 1500; // 1.5 saniye animasyon
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // easeOutQuart
      const ease = 1 - Math.pow(1 - percentage, 4);
      setDisplayValue(value * ease);

      if (percentage < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  if (isCurrency) {
    return <>{new Intl.NumberFormat("tr-TR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(displayValue)}</>;
  }
  return <>{Math.floor(displayValue)}</>;
};

const StatCard = ({ title, value, isCurrency, growth, subtitle, icon, delay }: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="group relative overflow-hidden rounded-3xl glass card-hover p-6"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      
      <div className="relative flex items-center justify-between">
        <p className="text-sm font-bold text-slate-400 tracking-wide">{title}</p>
        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-2.5 text-slate-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)] group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(79,142,247,0.3)] transition-all duration-500">
          {icon}
        </div>
      </div>

      <div className="relative mt-4 flex items-baseline gap-2">
        <h3 className="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          {typeof value === 'number' ? <AnimatedNumber value={value} isCurrency={isCurrency} /> : value}
        </h3>
        
        {growth !== undefined && (
          <div className={`flex items-center text-xs font-medium ${growth >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {growth >= 0 ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
            {Math.abs(growth)}%
          </div>
        )}
      </div>

      <p className="relative mt-1 text-xs text-slate-500">{subtitle}</p>
    </motion.div>
  );
};

export interface DashboardStats {
  revenue: { current: number; growth: number };
  leads: { current: number; growth: number; total: number };
  appointments: { current: number; growth: number };
  activeProjects: number;
}

export const StatCards = ({ stats }: { stats: DashboardStats }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Aylık Gelir"
        value={stats.revenue.current}
        isCurrency={true}
        growth={stats.revenue.growth}
        subtitle="Geçen aya kıyasla (Ödenen)"
        icon={<DollarSign className="h-5 w-5 text-emerald-400" />}
        delay={0.1}
      />
      <StatCard
        title="Yeni Leadler"
        value={stats.leads.current}
        growth={stats.leads.growth}
        subtitle={`Toplam havuz: ${stats.leads.total}`}
        icon={<TrendingUp className="h-5 w-5 text-blue-400" />}
        delay={0.2}
      />
      <StatCard
        title="Bekleyen Randevular"
        value={stats.appointments.current}
        growth={stats.appointments.growth}
        subtitle="Yaklaşan görüşmeler"
        icon={<Calendar className="h-5 w-5 text-amber-400" />}
        delay={0.3}
      />
      <StatCard
        title="Aktif Projeler"
        value={stats.activeProjects}
        subtitle="Devam eden işler"
        icon={<FolderKanban className="h-5 w-5 text-indigo-400" />}
        delay={0.4}
      />
    </div>
  );
};
