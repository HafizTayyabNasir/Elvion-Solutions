import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import {
  calculateProfitMargin,
  calculateRunway,
  calculateDSO,
  calculateConcentrationRisk,
  calculateHealthScore,
  linearRegression,
  percentageChange,
} from '@/lib/finance';

/**
 * GET /api/metrics
 * Comprehensive financial metrics endpoint
 * Query params:
 *   - startDate: YYYY-MM-DD
 *   - endDate: YYYY-MM-DD
 *   - currency: USD or PKR
 */
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

    // Ensure startDate is beginning of month, endDate is end of month
    startDate.setDate(1);
    endDate.setMonth(endDate.getMonth() + 1, 0);

    // Calculate Revenue Metrics
    const invoices = await prisma.invoice.findMany({
      where: { status: 'paid', currency, issueDate: { gte: startDate, lte: endDate } },
    });

    const projectPayments = await prisma.projectPayment.findMany({
      where: {
        status: 'received',
        currency,
        paymentDate: { gte: startDate, lte: endDate },
      },
    });

    const totalRevenue = invoices.reduce((sum, inv) => sum + Math.round(inv.total * 100), 0) +
                         projectPayments.reduce((sum, pp) => sum + Math.round(pp.amount * 100), 0);

    // Calculate Expense Metrics
    const expenses = await prisma.expense.findMany({
      where: { currency, date: { gte: startDate, lte: endDate } },
    });

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const monthlyBurnRate = totalExpenses / ((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) * 30;

    // Calculate Net Profit
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = calculateProfitMargin(totalRevenue, totalExpenses);

    // Get current cash on hand (from most recent project payment balance)
    const lastPayment = await prisma.projectPayment.findFirst({
      orderBy: { paymentDate: 'desc' },
    });
    const cashOnHand = lastPayment ? Math.round(lastPayment.amount * 100) : totalRevenue - totalExpenses;

    // Calculate Accounts Receivable (unpaid invoices)
    const unpaidInvoices = await prisma.invoice.findMany({
      where: { status: { in: ['sent', 'overdue'] }, currency },
    });
    const accountsReceivable = unpaidInvoices.reduce((sum, inv) => sum + Math.round(inv.total * 100), 0);

    // Calculate Accounts Payable (recurring expenses owed)
    const recurringExpenses = expenses.filter((e) => e.isRecurring);
    const accountsPayable = recurringExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Calculate MRR (Monthly Recurring Revenue)
    const retainerPayments = projectPayments.filter((pp) => pp.category === 'monthly');
    const mrr = retainerPayments.reduce((sum, pp) => sum + Math.round(pp.amount * 100), 0) / 12; // Assume monthly items

    // Calculate Runway
    const runway = calculateRunway(cashOnHand, monthlyBurnRate);

    // Calculate Collection Efficiency
    const totalInvoiced = [...invoices, ...unpaidInvoices].reduce((sum, inv) => sum + inv.total, 0);
    const collectionEfficiency = totalInvoiced > 0 ? (invoices.reduce((sum, inv) => sum + inv.total, 0) / totalInvoiced) * 100 : 100;

    // Calculate Revenue Concentration Risk
    const contacts = await prisma.contact.findMany();
    let topClientRevenue = 0;
    if (contacts.length > 0) {
      const clientRevenues = await Promise.all(
        contacts.map(async (contact) => {
          const clientInvoices = await prisma.invoice.findMany({
            where: { currency, issueDate: { gte: startDate, lte: endDate }, user: { contacts: { some: { id: contact.id } } } },
          });
          return clientInvoices.reduce((sum, inv) => sum + inv.total, 0);
        })
      );
      topClientRevenue = Math.max(...clientRevenues);
    }
    const concentrationRisk = calculateConcentrationRisk(topClientRevenue * 100, totalRevenue);

    // Calculate Historical Metrics for Trend
    const last12Months = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(endDate);
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1, 0);

      const monthInvoices = await prisma.invoice.findMany({
        where: { status: 'paid', currency, issueDate: { gte: monthStart, lte: monthEnd } },
      });
      const monthRevenue = monthInvoices.reduce((sum, inv) => sum + inv.total, 0) * 100;
      last12Months.push(monthRevenue);
    }

    const revenueGrowthPercent = last12Months.length > 1 ? percentageChange(last12Months[last12Months.length - 1], last12Months[last12Months.length - 2]) : 0;

    // Calculate Health Score
    const healthScore = calculateHealthScore({
      runway,
      profitMargin,
      revenueGrowthPercent,
      collectionEfficiency,
      expenseRatioToRevenue: (totalExpenses / totalRevenue) * 100,
      concentrationRisk,
    });

    // Revenue forecast (next 3 months)
    const revenueForecast = linearRegression(last12Months, 3);

    return NextResponse.json({
      period: { startDate: startDate.toISOString().split('T')[0], endDate: endDate.toISOString().split('T')[0] },
      currency,
      revenue: {
        total: totalRevenue,
        monthlyRecurring: mrr,
        forecast3Months: revenueForecast,
        growthPercent: revenueGrowthPercent,
        last12Months,
      },
      expenses: {
        total: totalExpenses,
        monthlyAverage: Math.round(totalExpenses / ((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30))),
        monthlyBurnRate,
      },
      profit: {
        netProfit,
        profitMargin,
      },
      liquidity: {
        cashOnHand,
        accountsReceivable,
        accountsPayable,
      },
      health: {
        runway,
        runwayHealthColor: runway > 12 ? 'green' : runway > 6 ? 'yellow' : 'red',
        collectionEfficiency,
        concentrationRisk,
        concentrationRiskLevel: concentrationRisk > 50 ? 'critical' : concentrationRisk > 40 ? 'warning' : 'healthy',
        healthScore,
        healthScoreColor: healthScore >= 75 ? 'green' : healthScore >= 50 ? 'yellow' : 'red',
      },
    });
  } catch (error) {
    console.error('Error calculating metrics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
