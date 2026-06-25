'use server';

import { prisma } from '@/lib/prisma';
import { startOfMonth, subMonths, endOfMonth } from 'date-fns';

export async function getDashboardData(tenantId: string) {
  try {
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const startOfLastMonth = startOfMonth(subMonths(now, 1));
    const endOfLastMonth = endOfMonth(subMonths(now, 1));

    // 1. Revenue (Invoices Paid)
    const currentMonthInvoices = await prisma.invoice.aggregate({
      _sum: { netAmount: true },
      where: { tenantId, status: 'PAID', createdAt: { gte: startOfCurrentMonth } }
    });
    const lastMonthInvoices = await prisma.invoice.aggregate({
      _sum: { netAmount: true },
      where: { tenantId, status: 'PAID', createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } }
    });

    const currentRevenue = Number(currentMonthInvoices._sum.netAmount || 0);
    const lastRevenue = Number(lastMonthInvoices._sum.netAmount || 0);
    const revenueGrowth = lastRevenue === 0 ? 100 : Math.round(((currentRevenue - lastRevenue) / lastRevenue) * 100);

    // 2. Leads
    const currentMonthLeads = await prisma.lead.count({
      where: { tenantId, createdAt: { gte: startOfCurrentMonth } }
    });
    const lastMonthLeads = await prisma.lead.count({
      where: { tenantId, createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } }
    });
    const totalLeads = await prisma.lead.count({ where: { tenantId } });
    const leadsGrowth = lastMonthLeads === 0 ? 100 : Math.round(((currentMonthLeads - lastMonthLeads) / lastMonthLeads) * 100);

    // 3. Active Projects
    const activeProjects = await prisma.project.count({
      where: { tenantId, status: { in: ['IN_PROGRESS', 'PLANNING'] } }
    });

    // 4. Appointments
    const currentAppointments = await prisma.appointment.count({
      where: { tenantId, startTime: { gte: startOfCurrentMonth } }
    });

    // Chart Data Generation (Last 6 months)
    const revenueData = [];
    const leadsData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(subMonths(now, i));
      
      const rev = await prisma.invoice.aggregate({
        _sum: { netAmount: true },
        where: { tenantId, status: 'PAID', createdAt: { gte: monthStart, lte: monthEnd } }
      });
      revenueData.push({
        name: monthStart.toLocaleString('tr-TR', { month: 'short' }),
        total: rev._sum.netAmount ? Number(rev._sum.netAmount) : 0
      });

      const count = await prisma.lead.count({
        where: { tenantId, createdAt: { gte: monthStart, lte: monthEnd } }
      });
      leadsData.push({
        name: monthStart.toLocaleString('tr-TR', { month: 'short' }),
        count
      });
    }

    return {
      success: true,
      data: {
        stats: {
          revenue: { current: currentRevenue, growth: revenueGrowth },
          leads: { current: currentMonthLeads, growth: leadsGrowth, total: totalLeads },
          appointments: { current: currentAppointments, growth: 0 },
          activeProjects
        },
        charts: {
          revenueData,
          leadsData
        }
      }
    };

  } catch (error) {
    console.error('getDashboardData error:', error);
    return { success: false, error: 'Failed to fetch dashboard data' };
  }
}
