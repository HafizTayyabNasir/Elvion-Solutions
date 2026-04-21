import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import type { Invoice, ProjectPayment, Expense } from '@prisma/client';
import { linearRegression, percentageChange } from '@/lib/finance';

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const decoded = authResult.user;
    if (!decoded || !decoded.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const currency = searchParams.get('currency') || 'USD';

    if (!action) {
      return NextResponse.json({ error: 'Missing action parameter' }, { status: 400 });
    }

    // ── EXPENSES ─────────────────────────────────────────────────────────────
    if (action === 'expenses') {
      const where: Record<string, unknown> = {};
      if (startDateParam || endDateParam) {
        where.date = {} as Record<string, Date>;
        if (startDateParam) (where.date as Record<string, Date>).gte = new Date(startDateParam);
        if (endDateParam) (where.date as Record<string, Date>).lte = new Date(endDateParam);
      }
      const category = searchParams.get('category');
      if (category) where.category = category;

      const expenses = await prisma.expense.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { date: 'desc' },
      });
      return NextResponse.json(expenses);
    }

    // ── BUDGETS ───────────────────────────────────────────────────────────────
    if (action === 'budgets') {
      const where: Record<string, unknown> = {};
      const category = searchParams.get('category');
      if (category) where.category = category;
      const year = searchParams.get('year');
      if (year) where.year = parseInt(year);
      const month = searchParams.get('month');
      if (month) where.month = parseInt(month);

      const budgets = await prisma.budget.findMany({
        where,
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      });
      return NextResponse.json(budgets);
    }

    // ── TAX ENTRIES ───────────────────────────────────────────────────────────
    if (action === 'tax-entries') {
      const where: Record<string, unknown> = {};
      const year = searchParams.get('year');
      if (year) where.year = parseInt(year);
      const taxEntries = await prisma.taxEntry.findMany({
        where,
        orderBy: [{ year: 'desc' }, { quarter: 'desc' }],
      });
      return NextResponse.json(taxEntries);
    }

    // ── ALERTS ────────────────────────────────────────────────────────────────
    if (action === 'alerts') {
      const showResolved = searchParams.get('resolved') === 'true';
      const alerts = await prisma.financialAlert.findMany({
        where: showResolved ? {} : { isResolved: false },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      return NextResponse.json(alerts);
    }

    // ── CASHFLOW (12 months of monthly inflow vs outflow) ─────────────────────
    if (action === 'cashflow') {
      const refDate = endDateParam ? new Date(endDateParam) : new Date();
      const cashflowData = [];
      let runningBalance = 0;

      for (let i = 11; i >= 0; i--) {
        const mStart = new Date(refDate.getFullYear(), refDate.getMonth() - i, 1);
        const mEnd = new Date(mStart.getFullYear(), mStart.getMonth() + 1, 0, 23, 59, 59);

        const [mInvoices, mPayments, mExpenses] = await Promise.all([
          prisma.invoice.findMany({
            where: { status: 'paid', currency, issueDate: { gte: mStart, lte: mEnd } },
          }),
          prisma.projectPayment.findMany({
            where: { status: 'received', currency, paymentDate: { gte: mStart, lte: mEnd } },
          }),
          prisma.expense.findMany({
            where: { currency, date: { gte: mStart, lte: mEnd } },
          }),
        ]);

        const inflow = mInvoices.reduce((s: number, inv: Invoice) => s + Math.round(inv.total * 100), 0) +
                       mPayments.reduce((s: number, pp: ProjectPayment) => s + Math.round(pp.amount * 100), 0);
        const outflow = mExpenses.reduce((s: number, exp: Expense) => s + exp.amount, 0);
        const net = inflow - outflow;
        runningBalance += net;

        cashflowData.push({
          month: mStart.toLocaleString('default', { month: 'short', year: '2-digit' }),
          monthFull: mStart.toLocaleString('default', { month: 'long', year: 'numeric' }),
          inflow,
          outflow,
          net,
          runningBalance,
        });
      }

      // 90-day projection: extend the trend
      const netValues = cashflowData.map(d => d.net);
      const forecast3 = linearRegression(netValues, 3);
      const projectionData = forecast3.map((net, i) => {
        const m = new Date(refDate.getFullYear(), refDate.getMonth() + i + 1, 1);
        return {
          month: m.toLocaleString('default', { month: 'short', year: '2-digit' }),
          net,
          projected: true,
        };
      });

      const avgInflow = cashflowData.reduce((s, d) => s + d.inflow, 0) / 12;
      const avgOutflow = cashflowData.reduce((s, d) => s + d.outflow, 0) / 12;
      const cashflowHealthScore = avgInflow > 0
        ? Math.min(100, Math.round((avgInflow / Math.max(1, avgOutflow)) * 50))
        : 0;

      return NextResponse.json({
        monthly: cashflowData,
        projection: projectionData,
        summary: {
          totalInflow: cashflowData.reduce((s, d) => s + d.inflow, 0),
          totalOutflow: cashflowData.reduce((s, d) => s + d.outflow, 0),
          netCashflow: cashflowData.reduce((s, d) => s + d.net, 0),
          cashflowHealthScore,
        },
      });
    }

    // ── P&L STATEMENT ─────────────────────────────────────────────────────────
    if (action === 'pl') {
      const start = startDateParam ? new Date(startDateParam) : new Date(new Date().getFullYear(), 0, 1);
      const end = endDateParam ? new Date(endDateParam) : new Date();
      start.setDate(1);
      end.setMonth(end.getMonth() + 1, 0);

      const [paidInvoices, receivedPayments, allExpenses] = await Promise.all([
        prisma.invoice.findMany({
          where: { status: 'paid', currency, issueDate: { gte: start, lte: end } },
        }),
        prisma.projectPayment.findMany({
          where: { status: 'received', currency, paymentDate: { gte: start, lte: end } },
        }),
        prisma.expense.findMany({
          where: { currency, date: { gte: start, lte: end } },
        }),
      ]);

      const grossRevenue = paidInvoices.reduce((s: number, inv: Invoice) => s + Math.round(inv.total * 100), 0) +
                           receivedPayments.reduce((s: number, pp: ProjectPayment) => s + Math.round(pp.amount * 100), 0);

      // Group expenses by category
      const expenseByCategory: Record<string, number> = {};
      for (const exp of allExpenses as Expense[]) {
        expenseByCategory[exp.category] = (expenseByCategory[exp.category] || 0) + exp.amount;
      }

      // COGS = direct project costs (contractor/ad spend in project directCosts)
      const projects = await prisma.project.findMany({ select: { directCosts: true } });
      const cogs = projects.reduce((s: number, p: { directCosts: number }) => s + p.directCosts, 0);

      const grossProfit = grossRevenue - cogs;
      const grossMargin = grossRevenue > 0 ? (grossProfit / grossRevenue) * 100 : 0;

      const totalOpEx = allExpenses.reduce((s: number, exp: Expense) => s + exp.amount, 0);
      const ebitda = grossProfit - totalOpEx;
      const netProfit = ebitda; // simplified (no D&A or interest)
      const netMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

      return NextResponse.json({
        period: { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] },
        grossRevenue,
        cogs,
        grossProfit,
        grossMargin,
        operatingExpenses: expenseByCategory,
        totalOperatingExpenses: totalOpEx,
        ebitda,
        netProfit,
        netMargin,
      });
    }

    // ── REVENUE BREAKDOWN ────────────────────────────────────────────────────
    if (action === 'revenue-breakdown') {
      const start = startDateParam ? new Date(startDateParam) : new Date(new Date().getFullYear(), 0, 1);
      const end = endDateParam ? new Date(endDateParam) : new Date();

      // Revenue by project/contact
      const projects = await prisma.project.findMany({
        include: {
          payments: {
            where: { status: 'received', currency, paymentDate: { gte: start, lte: end } },
          },
          invoices: {
            where: { status: 'paid', currency, issueDate: { gte: start, lte: end } },
          },
          contact: { select: { id: true, name: true, company: true } },
        },
      });

      const byClient: Record<string, { name: string; revenue: number; projectCount: number }> = {};
      const byServiceType: Record<string, number> = {};

      for (const project of projects) {
        const projectRevenue =
          project.payments.reduce((s: number, pp: ProjectPayment) => s + Math.round(pp.amount * 100), 0) +
          project.invoices.reduce((s: number, inv: Invoice) => s + Math.round(inv.total * 100), 0);

        if (projectRevenue === 0) continue;

        const clientName = project.contact?.company || project.contact?.name || 'Unknown';
        if (!byClient[clientName]) {
          byClient[clientName] = { name: clientName, revenue: 0, projectCount: 0 };
        }
        byClient[clientName].revenue += projectRevenue;
        byClient[clientName].projectCount += 1;

        // Guess service type from project name
        const lower = project.name.toLowerCase();
        const serviceType =
          lower.includes('seo') ? 'SEO' :
          lower.includes('social') ? 'Social Media' :
          lower.includes('ppc') || lower.includes('ads') ? 'PPC/Ads' :
          lower.includes('web') || lower.includes('design') ? 'Web Design' :
          lower.includes('email') ? 'Email Marketing' :
          lower.includes('retainer') ? 'Retainer' :
          'Other';

        byServiceType[serviceType] = (byServiceType[serviceType] || 0) + projectRevenue;
      }

      const totalRevenue = Object.values(byClient).reduce((s, c) => s + c.revenue, 0) || 1;
      const clientList = Object.values(byClient)
        .map(c => ({ ...c, pct: Math.round((c.revenue / totalRevenue) * 10000) / 100 }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      const serviceList = Object.entries(byServiceType)
        .map(([type, revenue]) => ({ type, revenue, pct: Math.round((revenue / totalRevenue) * 10000) / 100 }))
        .sort((a, b) => b.revenue - a.revenue);

      const topClientPct = clientList.length > 0 ? clientList[0].pct : 0;

      return NextResponse.json({
        byClient: clientList,
        byServiceType: serviceList,
        topClientConcentration: topClientPct,
        concentrationWarning: topClientPct > 40,
        totalRevenue,
      });
    }

    // ── INVOICE AGING ─────────────────────────────────────────────────────────
    if (action === 'invoice-aging') {
      const today = new Date();
      const unpaidInvoices = await prisma.invoice.findMany({
        where: { status: { in: ['sent', 'overdue'] }, currency },
        include: { user: { select: { name: true, company: true } } },
        orderBy: { dueDate: 'asc' },
      });

      const buckets = { current: 0, days30: 0, days60: 0, days90: 0, over90: 0 };
      const bucketCounts = { current: 0, days30: 0, days60: 0, days90: 0, over90: 0 };
      const agingList = unpaidInvoices.map((inv: Invoice) => {
        const daysOverdue = inv.dueDate
          ? Math.floor((today.getTime() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24))
          : 0;
        const totalCents = Math.round(inv.total * 100);

        if (daysOverdue <= 0) { buckets.current += totalCents; bucketCounts.current++; }
        else if (daysOverdue <= 30) { buckets.days30 += totalCents; bucketCounts.days30++; }
        else if (daysOverdue <= 60) { buckets.days60 += totalCents; bucketCounts.days60++; }
        else if (daysOverdue <= 90) { buckets.days90 += totalCents; bucketCounts.days90++; }
        else { buckets.over90 += totalCents; bucketCounts.over90++; }

        return { ...inv, daysOverdue: Math.max(0, daysOverdue), totalCents };
      });

      return NextResponse.json({ buckets, bucketCounts, invoices: agingList });
    }

    // ── PROJECT PROFITABILITY ─────────────────────────────────────────────────
    if (action === 'project-profitability') {
      const projects = await prisma.project.findMany({
        include: {
          payments: { where: { status: 'received', currency } },
          invoices: { where: { status: 'paid', currency } },
          contact: { select: { name: true, company: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      interface ProjProfit { id: number; name: string; status: string; client: string; revenue: number; costs: number; grossProfit: number; margin: number; budget: number | null; isLoss: boolean; }

      const result: ProjProfit[] = projects.map((p: typeof projects[0]) => {
        const revenue = p.payments.reduce((s: number, pp: ProjectPayment) => s + Math.round(pp.amount * 100), 0) +
                        p.invoices.reduce((s: number, inv: Invoice) => s + Math.round(inv.total * 100), 0);
        const costs = p.directCosts;
        const grossProfit = revenue - costs;
        const margin = revenue > 0 ? Math.round((grossProfit / revenue) * 10000) / 100 : 0;
        return {
          id: p.id, name: p.name, status: p.status,
          client: p.contact?.company || p.contact?.name || 'Unknown',
          revenue, costs, grossProfit, margin,
          budget: p.budget ? Math.round(p.budget * 100) : null,
          isLoss: grossProfit < 0,
        };
      });

      return NextResponse.json(result.sort((a: ProjProfit, b: ProjProfit) => b.margin - a.margin));
    }

    // ── FORECAST ──────────────────────────────────────────────────────────────
    if (action === 'forecast') {
      const refDate = new Date();
      const historicalRevenue: number[] = [];
      const historicalExpenses: number[] = [];
      const labels: string[] = [];

      for (let i = 11; i >= 0; i--) {
        const mStart = new Date(refDate.getFullYear(), refDate.getMonth() - i, 1);
        const mEnd = new Date(mStart.getFullYear(), mStart.getMonth() + 1, 0, 23, 59, 59);

        const [mInvoices, mPayments, mExpenses] = await Promise.all([
          prisma.invoice.findMany({ where: { status: 'paid', currency, issueDate: { gte: mStart, lte: mEnd } } }),
          prisma.projectPayment.findMany({ where: { status: 'received', currency, paymentDate: { gte: mStart, lte: mEnd } } }),
          prisma.expense.findMany({ where: { currency, date: { gte: mStart, lte: mEnd } } }),
        ]);

        const rev = mInvoices.reduce((s: number, inv: Invoice) => s + Math.round(inv.total * 100), 0) +
                    mPayments.reduce((s: number, pp: ProjectPayment) => s + Math.round(pp.amount * 100), 0);
        const exp = mExpenses.reduce((s: number, e: Expense) => s + e.amount, 0);
        historicalRevenue.push(rev);
        historicalExpenses.push(exp);
        labels.push(mStart.toLocaleString('default', { month: 'short', year: '2-digit' }));
      }

      const revForecast12 = linearRegression(historicalRevenue, 12);
      const expForecast12 = linearRegression(historicalExpenses, 12);

      const growthRate = historicalRevenue.length > 1
        ? percentageChange(historicalRevenue[11], historicalRevenue[0]) / 100
        : 0.05;

      const scenarios = {
        conservative: revForecast12.map(v => Math.round(v * 0.8)),
        baseline: revForecast12,
        optimistic: revForecast12.map(v => Math.round(v * 1.2)),
      };

      const forecastLabels: string[] = [];
      for (let i = 1; i <= 12; i++) {
        const m = new Date(refDate.getFullYear(), refDate.getMonth() + i, 1);
        forecastLabels.push(m.toLocaleString('default', { month: 'short', year: '2-digit' }));
      }

      return NextResponse.json({
        historical: { revenue: historicalRevenue, expenses: historicalExpenses, labels },
        forecast: { scenarios, expenses: expForecast12, labels: forecastLabels },
        growthRate,
      });
    }

    // ── PAYROLL (with employmentType) ─────────────────────────────────────────
    if (action === 'payroll') {
      const now = new Date();
      const month = parseInt(searchParams.get('month') || String(now.getMonth() + 1));
      const year = parseInt(searchParams.get('year') || String(now.getFullYear()));

      const payrolls = await prisma.payroll.findMany({
        where: { month, year },
        include: {
          employee: {
            select: {
              id: true, employeeId: true, firstName: true, lastName: true,
              employmentType: true, positions: true,
              departments: { select: { name: true } },
            },
          },
        },
        orderBy: { employee: { lastName: 'asc' } },
      });
      return NextResponse.json(payrolls);
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Error in finance GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const decoded = authResult.user;
    if (!decoded || !decoded.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    // ── CREATE EXPENSE ────────────────────────────────────────────────────────
    if (action === 'expense') {
      const { date, vendor, category, amount, currency, paymentMethod, isRecurring, receiptUrl, notes } = body;
      if (!date || !vendor || !category || amount === undefined) {
        return NextResponse.json({ error: 'date, vendor, category, amount required' }, { status: 400 });
      }
      const expense = await prisma.expense.create({
        data: {
          date: new Date(date),
          vendor: String(vendor).slice(0, 200),
          category: String(category),
          amount: Math.round(Number(amount)),
          currency: currency || 'USD',
          paymentMethod: paymentMethod || null,
          isRecurring: Boolean(isRecurring),
          receiptUrl: receiptUrl || null,
          notes: notes ? String(notes).slice(0, 2000) : null,
          createdBy: decoded.userId,
        },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
      return NextResponse.json(expense, { status: 201 });
    }

    // ── DELETE EXPENSE ────────────────────────────────────────────────────────
    if (action === 'delete-expense') {
      const { id } = body;
      if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
      await prisma.expense.delete({ where: { id: Number(id) } });
      return NextResponse.json({ success: true });
    }

    // ── CREATE / UPDATE BUDGET ────────────────────────────────────────────────
    if (action === 'budget') {
      const { year, month, category, plannedAmount, currency } = body;
      if (!year || !category || plannedAmount === undefined) {
        return NextResponse.json({ error: 'year, category, plannedAmount required' }, { status: 400 });
      }
      const budget = await prisma.budget.upsert({
        where: { year_month_category: { year: Number(year), month: month ? Number(month) : 0, category } },
        update: { plannedAmount: Math.round(Number(plannedAmount)), currency: currency || 'USD' },
        create: {
          year: Number(year),
          month: month ? Number(month) : null,
          category,
          plannedAmount: Math.round(Number(plannedAmount)),
          currency: currency || 'USD',
        },
      });
      return NextResponse.json(budget, { status: 201 });
    }

    // ── CREATE / UPDATE TAX ENTRY ─────────────────────────────────────────────
    if (action === 'tax-entry') {
      const { quarter, year, estimatedLiability, amountSetAside, notes } = body;
      if (!quarter || !year || estimatedLiability === undefined) {
        return NextResponse.json({ error: 'quarter, year, estimatedLiability required' }, { status: 400 });
      }
      const taxEntry = await prisma.taxEntry.upsert({
        where: { quarter_year: { quarter: Number(quarter), year: Number(year) } },
        update: {
          estimatedLiability: Math.round(Number(estimatedLiability)),
          amountSetAside: Math.round(Number(amountSetAside || 0)),
          notes: notes || null,
        },
        create: {
          quarter: Number(quarter),
          year: Number(year),
          estimatedLiability: Math.round(Number(estimatedLiability)),
          amountSetAside: Math.round(Number(amountSetAside || 0)),
          notes: notes || null,
        },
      });
      return NextResponse.json(taxEntry, { status: 201 });
    }

    // ── RESOLVE ALERT ─────────────────────────────────────────────────────────
    if (action === 'alert-resolve') {
      const { alertId } = body;
      if (!alertId) return NextResponse.json({ error: 'alertId required' }, { status: 400 });
      const alert = await prisma.financialAlert.update({
        where: { id: Number(alertId) },
        data: { isResolved: true, resolvedAt: new Date() },
      });
      return NextResponse.json(alert);
    }

    // ── CREATE ALERT ──────────────────────────────────────────────────────────
    if (action === 'alert') {
      const { type, message, severity, metadata } = body;
      if (!type || !message) return NextResponse.json({ error: 'type, message required' }, { status: 400 });
      const alert = await prisma.financialAlert.create({
        data: {
          type,
          message,
          severity: severity || 'info',
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      });
      return NextResponse.json(alert, { status: 201 });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Error in finance POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
