import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import type { Invoice, ProjectPayment, Expense, Contact } from '@prisma/client';
import {
  calculateProfitMargin,
  calculateRunway,
  calculateDSO,
  calculateConcentrationRisk,
  calculateHealthScore,
  linearRegression,
  percentageChange,
} from '@/lib/finance';

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
    const startDate = new Date(searchParams.get('startDate') || new Date().toISOString().split('T')[0]);
    const endDate = new Date(searchParams.get('endDate') || new Date().toISOString().split('T')[0]);
    const currency = searchParams.get('currency') || 'USD';

    startDate.setDate(1);
    endDate.setMonth(endDate.getMonth() + 1, 0);

    // Revenue from paid invoices
    const invoices = await prisma.invoice.findMany({
      where: { status: 'paid', currency, issueDate: { gte: startDate, lte: endDate } },
    });
    // Revenue from project payments
    const projectPayments = await prisma.projectPayment.findMany({
      where: { status: 'received', currency, paymentDate: { gte: startDate, lte: endDate } },
    });

    const invoiceRevenue = invoices.reduce((sum: number, inv: Invoice) => sum + Math.round(inv.total * 100), 0);
    const paymentRevenue = projectPayments.reduce((sum: number, pp: ProjectPayment) => sum + Math.round(pp.amount * 100), 0);
    const totalRevenue = invoiceRevenue + paymentRevenue;

    // Expenses
    const expenses = await prisma.expense.findMany({
      where: { currency, date: { gte: startDate, lte: endDate } },
    });
    const totalExpenses = expenses.reduce((sum: number, exp: Expense) => sum + exp.amount, 0);

    const periodDays = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const monthlyBurnRate = (totalExpenses / periodDays) * 30;

    // Net profit
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = calculateProfitMargin(totalRevenue, totalExpenses);

    // Cash on hand proxy
    const allReceived = await prisma.projectPayment.findMany({
      where: { status: 'received', currency },
      orderBy: { paymentDate: 'desc' },
      take: 1,
    });
    const cashOnHand = allReceived.length > 0
      ? Math.round(allReceived[0].amount * 100) + netProfit
      : Math.max(0, netProfit);

    // Accounts Receivable
    const unpaidInvoices = await prisma.invoice.findMany({
      where: { status: { in: ['sent', 'overdue'] }, currency },
    });
    const accountsReceivable = unpaidInvoices.reduce((sum: number, inv: Invoice) => sum + Math.round(inv.total * 100), 0);

    // Accounts Payable (recurring expenses)
    const recurringExpenses = expenses.filter((e: Expense) => e.isRecurring);
    const accountsPayable = recurringExpenses.reduce((sum: number, exp: Expense) => sum + exp.amount, 0);

    // MRR
    const retainerPayments = projectPayments.filter((pp: ProjectPayment) => pp.category === 'monthly');
    const mrr = retainerPayments.reduce((sum: number, pp: ProjectPayment) => sum + Math.round(pp.amount * 100), 0);

    // Runway
    const runway = calculateRunway(cashOnHand, monthlyBurnRate);

    // Collection efficiency
    const totalInvoicedAmt = [...invoices, ...unpaidInvoices].reduce((sum: number, inv: Invoice) => sum + inv.total, 0);
    const collectionEfficiency = totalInvoicedAmt > 0
      ? (invoices.reduce((sum: number, inv: Invoice) => sum + inv.total, 0) / totalInvoicedAmt) * 100
      : 100;

    // DSO
    const avgAR = accountsReceivable;
    const dailyRevenue = totalRevenue / periodDays;
    const dso = calculateDSO(avgAR, dailyRevenue);

    // Revenue concentration risk (top client)
    const contacts = await prisma.contact.findMany({ select: { id: true } });
    let topClientRevenue = 0;
    if (contacts.length > 0) {
      const clientRevenues = await Promise.all(
        contacts.map(async (contact: { id: number }) => {
          const clientInvs = await prisma.invoice.findMany({
            where: {
              currency,
              status: 'paid',
              issueDate: { gte: startDate, lte: endDate },
              project: { contactId: contact.id },
            },
          });
          return clientInvs.reduce((sum: number, inv: Invoice) => sum + inv.total, 0);
        })
      );
      topClientRevenue = Math.max(0, ...clientRevenues);
    }
    const concentrationRisk = calculateConcentrationRisk(topClientRevenue * 100, totalRevenue);

    // Historical 12-month revenue
    const last12Months: number[] = [];
    const last12Labels: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const mStart = new Date(endDate);
      mStart.setMonth(mStart.getMonth() - i);
      mStart.setDate(1);
      const mEnd = new Date(mStart);
      mEnd.setMonth(mEnd.getMonth() + 1, 0);

      const mInvoices = await prisma.invoice.findMany({
        where: { status: 'paid', currency, issueDate: { gte: mStart, lte: mEnd } },
      });
      const mPayments = await prisma.projectPayment.findMany({
        where: { status: 'received', currency, paymentDate: { gte: mStart, lte: mEnd } },
      });
      const mRevenue = mInvoices.reduce((sum: number, inv: Invoice) => sum + Math.round(inv.total * 100), 0) +
                       mPayments.reduce((sum: number, pp: ProjectPayment) => sum + Math.round(pp.amount * 100), 0);
      last12Months.push(mRevenue);
      last12Labels.push(`${mStart.toLocaleString('default', { month: 'short' })} ${mStart.getFullYear()}`);
    }

    const revenueGrowthPercent = last12Months.length > 1
      ? percentageChange(last12Months[last12Months.length - 1], last12Months[last12Months.length - 2])
      : 0;

    // Expense ratio
    const expenseRatioToRevenue = totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 100;

    // Health score
    const healthScore = calculateHealthScore({
      runway,
      profitMargin,
      revenueGrowthPercent,
      collectionEfficiency,
      expenseRatioToRevenue,
      concentrationRisk,
    });

    // 3-month forecast
    const revenueForecast = linearRegression(last12Months, 3);

    // Payroll as % of revenue (from HR payroll)
    const now = new Date();
    const payrolls = await prisma.payroll.findMany({
      where: { month: now.getMonth() + 1, year: now.getFullYear(), status: 'paid' },
    });
    const totalPayroll = payrolls.reduce((sum: number, p: { netPay: number }) => sum + p.netPay * 100, 0);
    const payrollPct = totalRevenue > 0 ? (totalPayroll / totalRevenue) * 100 : 0;

    return NextResponse.json({
      period: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      currency,
      revenue: {
        total: totalRevenue,
        invoiceRevenue,
        paymentRevenue,
        monthlyRecurring: mrr,
        forecast3Months: revenueForecast,
        growthPercent: revenueGrowthPercent,
        last12Months,
        last12Labels,
      },
      expenses: {
        total: totalExpenses,
        monthlyAverage: Math.round(totalExpenses / Math.max(1, periodDays / 30)),
        monthlyBurnRate: Math.round(monthlyBurnRate),
      },
      profit: {
        netProfit,
        profitMargin,
        ebitda: netProfit, // simplified
      },
      liquidity: {
        cashOnHand: Math.max(0, cashOnHand),
        accountsReceivable,
        accountsPayable,
      },
      health: {
        runway: isFinite(runway) ? runway : 999,
        runwayHealthColor: runway > 12 ? 'green' : runway > 6 ? 'yellow' : 'red',
        collectionEfficiency,
        dso,
        concentrationRisk,
        concentrationRiskLevel: concentrationRisk > 50 ? 'critical' : concentrationRisk > 40 ? 'warning' : 'healthy',
        healthScore,
        healthScoreColor: healthScore >= 75 ? 'green' : healthScore >= 50 ? 'yellow' : 'red',
        payrollPct,
      },
    });
  } catch (error) {
    console.error('Error calculating metrics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
